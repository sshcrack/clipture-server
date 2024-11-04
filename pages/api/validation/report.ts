import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimit } from '../../../util/rate-limit';
import { ConsumeType } from '../../../util/rate-limit/interface';
export const clientSessions: { [key: string]: ClientSessionInterface[] } = {}

export default async function ReportAPIRoute(req: NextApiRequest, res: NextApiResponse) {
    const isRateLimited = await RateLimit.consume(ConsumeType.LoginToken, req, res)
    if (isRateLimited)
        return

    if (req.method === "POST") {
        const body = req.body as RequestBody
        if (!body)
            return res.status(400)
                .send({ error: "No body" })

        const { secret } = body
        if (typeof secret !== "string" || secret?.length !== 64)
            return res.status(400)
                .send({ error: "Secret has to be a string and 64 characters long." })

        const isRateLimited = await RateLimit.consume(ConsumeType.Report, req, res)
        if (isRateLimited)
            return

        const matchingEntries = Object.entries(req.cookies)
            .filter(([key]) => typeof key === "string" && (key.includes("next-auth.session") || key.includes("next-auth.csrf")));

        const csrf = matchingEntries.find(e => e[0].includes("next-auth.csrf"))
        const session = matchingEntries.find(e => e[0].includes("next-auth.session"))

        if (!csrf || !session)
            return res.status(401).send({
                error: "Could not get csrf and/or session"
            })

        clientSessions[secret] = [
            {
                key: csrf[0],
                cookie: csrf[1],
                type: "csrf",
            },
            {
                key: session[0],
                cookie: session[1],
                type: "session",
            }
        ]

        setTimeout(() => {
            delete clientSessions[secret]
        }, 1000 * 60 * 4)

        return res.send({
            successful: true
        })
    }

    const secret = req.headers.authorization
    if (typeof secret !== "string")
        return res.send({
            error: "Secret has to be an string"
        })

    if (secret.length !== 64)
        return res.send({
            error: "Secret has to be of length 64"
        })

    if (req.query.waitUntilDone) {
        const start = Date.now()
        const timeout = 1000 * 60 * 4

        const end = start + timeout
        while (true) {
            const session = clientSessions?.[secret] ?? []
            if (session.length === 0)
                break

            await new Promise(r => setTimeout(r, 500))

            if (Date.now() > end) {
                res.status(408).send("Timeout")
                return;
            }

            if (!res.writable)
                return
        }

        res.send("Secret has been requested.")
        return;
    }

    const data = clientSessions?.[secret] ?? []
    delete clientSessions[secret]

    let deleted = data.length > 0
    return res.send({
        entry: data,
        reported: deleted,
        status: !deleted ? "Invalid Secret" : "Temporary entry has been deleted. This is one time only."
    })

}


interface RequestBody {
    secret: string,
}

interface ClientSessionInterface {
    cookie: string | undefined,
    key: string,
    type: "session" | "csrf"
}