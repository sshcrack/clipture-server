import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req, res)
    if(!user)
        return res.status(403).json({ error: "Unauthenticated."})

    if(await checkBanned(user.id, res))
        return


    const clips = await prisma.clip.findMany({
        where: {
            uploaderId: user.id
        }
    })

    const filteredInfo = clips.map(({ id, uploadDate, title}) => ({
        id,
        uploadDate,
        title
    }))

    res.json(filteredInfo)
}