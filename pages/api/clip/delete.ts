import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import { StorageManager } from '../../../util/storage';

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return res.status(403).json({ error: "Unauthenticated." })

    if (await checkBanned(user.id, res))
        return


    const id = req.query?.id
    if (typeof id !== "string")
        return res.status(400).json({ error: "Id has to be a string" })

    const clip = await prisma.clip.findFirst({
        where: {
            uploaderId: user.id,
            id: id
        }
    })

    if (!clip)
        return res.status(404).json({ error: "Clip could not be found. / No permission to delete" })

    const { storage } = clip
    await StorageManager.delete(id, storage)
        .catch(e => {
            console.error(e)
            return res.status(500).json({ error: "Internal server error. Could not delete video." })
        })

    res.json({ success: true })
}