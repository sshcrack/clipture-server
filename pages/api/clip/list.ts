import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return res.status(403).json({ error: "Unauthenticated." })

    if (await checkBanned(user.id, res))
        return


    const clips = await prisma.clip.findMany({
        where: {
            uploaderId: user.id
        },
        include: { windowInfo: true }
    })

    const filteredInfo = clips.map(({ id, uploadDate, title, dcGameId, windowInfo }) => ({
        id,
        uploadDate,
        title,
        dcGameId,
        windowInfo
    }))

    res.json(filteredInfo)
}