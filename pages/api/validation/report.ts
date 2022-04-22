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
        if (typeof id !== "string" || id?.length !== 36 *2)
            return res.status(400)
                .send({ error: "ID has to be a string and 72 characters long." })

        const limited = await limiter.check(res, 10, req.socket.remoteAddress + "-report")
            .catch(() => true)
            .then(() => false)

        if (limited)
            return res.status(429).json({ error: "Rate limit exceeded" })


        if (!clientSessions?.[id])
            setTimeout(() => {
                delete clientSessions?.[id]
            }, persistance)

        const matchingEntries = Object.entries(req.cookies)
            .filter(([ key ]) => typeof key === "string" && (key.includes("next-auth.session") || key.includes("next-auth.crsf")));

        const csrf = matchingEntries.find(e => e[0].includes("next-auth.crsf"))?.[1]
        const session = matchingEntries.find(e => e[0].includes("next-auth.session"))?.[1]

        if(!csrf || !session)
            return res.status(401).send({
                error: "Could not get csrf and/or session"
            })

        clientSessions[id] = [ session, csrf ]
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

    const [ session, csrf ] = clientSessions[id]
    delete clientSessions[id]
    let deleted = !!session && !!csrf
    if(deleted) {
        console.log("Giving away data from id", id)
    }
    return res.send({
        entry: {
            session,
            csrf
        },
        reported: deleted,
        status: !deleted ? "Invalid ID" : "Temporary entry has been deleted. This is one time only."
    })

}


interface RequestBody {
    id: string,
    session: string
}