import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { prisma } from '../../../util/db';
import { FilteredClip } from '../../../util/interfaces/APIInterfaces';

export default async function InfoClip(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if (!id)
        return res.json({ error: "Clip id required." })
    if (typeof id !== "string")
        return res.json({ error: "id has to be a string" })

    const valid = /([A-z]|[0-9]|-)+$/g
    if (!valid.test(id))
        return res.json({ error: "Invalid id" })

    const clip = await prisma.clip.findUnique({
        where: { id },
        include: {
            windowInfo: true
        }
    })

    if (!clip)
        return res.status(404).json({ error: "Clip could not be found." })



    const { uploadDate, title, dcGameId, windowInfo, uploaderId, hex, isPublic } = clip

    const filteredInfo: FilteredClip = {
        id,
        uploadDate,
        title,
        isPublic,
        dcGameId,
        uploaderId,
        hex,
        windowInfo: windowInfo ? {
            id: windowInfo.id,
            userId: windowInfo.userId,
            title: windowInfo.title,
            icon: path.basename(windowInfo.icon),
        } : null
    }

    res.json(filteredInfo)
}