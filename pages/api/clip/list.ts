import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getUserId, prisma } from "../../../util/db";

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req })
    if(!session)
        return res.status(403).json({ error: "Unauthenticated."})

    const userId = getUserId(session)
    const clips = await prisma.clip.findMany({
        where: {
            uploaderId: userId
        }
    })

    const filteredInfo = clips.map(({ id, uploadDate}) => ({
        id,
        uploadDate
    }))

    res.json(filteredInfo)
}