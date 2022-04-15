import { read } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth"
import rateLimit from '../../../util/rate-limit';
export const clientSessions: { [key: string]: string[] } = {}

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500, // Max 500 users per second
})

const persistance = 1000 * 60 * 5 // 10 Min
export default async function ReportAPIRoute(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const body = req.body as RequestBody
        if (!body)
            return res.status(400)
                .send({ error: "No body" })

        const { id } = body
        const { "next-auth.csrf-token": csrfToken, "next-auth.session-token": sessionToken } = req.cookies ?? {}
        if (typeof id !== "string" || id?.length !== 36 *2)
            return res.status(400)
                .send({ error: "ID has to be a string and 72 characters long." })

        if(typeof csrfToken !== "string" || typeof sessionToken !== "string" || sessionToken.length !== 36)
            return res.status(400)
                .send({ error : "No CSRF or session token in cookies (or session token is too long)" })

        const limited = await limiter.check(res, 10, req.socket.remoteAddress + "-report")
            .catch(() => true)
            .then(() => false)

        if (limited)
            return res.status(429).json({ error: "Rate limit exceeded" })


        if (!clientSessions?.[id])
            setTimeout(() => {
                delete clientSessions?.[id]
            }, persistance)

        clientSessions[id] = [ csrfToken, sessionToken ]
        console.log("New ID added", id)
        return res.send({
            successful: true
        })
    }

    const { id } = req.query ?? {}
    if (typeof id !== "string")
        return res.send({
            error: "Id has to be an string"
        })

    if (id?.length !== 36 *2)
        return res.send({
            error: "Id has to be an uuid *2"
        })

    const [ csrf, session ] = clientSessions?.[id] ??[]
    delete clientSessions[id]
    const deleted = !!csrf && !!session;
    if(deleted) {
        console.log("Giving away data from id", id)
    }
    return res.send({
        entry: {
            "next-auth.csrf-token": csrf,
            "next-auth.session-token": session
        },
        reported: deleted,
        status: !deleted ? "Invalid ID" : "Temporary entry has been deleted. This is one time only."
    })

}


interface RequestBody {
    id: string,
    session: string
}

interface SessionData {
    sessionToken: string,
    csrfToken: string
}