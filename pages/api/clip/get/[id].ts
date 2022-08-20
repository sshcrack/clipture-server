import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../util/db";
import { StorageManager } from "../../../../util/storage";

StorageManager.initialize()
export default async function GetClip(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if(!id)
        return res.json({ error: "Clip id required." })
    if(typeof id !== "string")
        return res.json({ error: "id has to be a string"})

    const valid = /([A-z]|[0-9]|-)+$/g
    if(!valid.test(id))
        return res.json({ error: "Invalid id"})

    const clip = await prisma.clip.findUnique({
        where: { id }
    })

    if(!clip)
        return res.status(404).json({ error: "Clip could not be found."})

    const url = StorageManager.getVideoUrl(clip)
    if(!url)
        return res.status(500).json({ error: "Storage could not be found."})

    const exists = await StorageManager.clipExists(clip)
    if(!exists) {
        prisma.clip.delete({ where: { id: clip.id }})
        return res.status(404).json({ error: "That clip does not exist. "})
    }

    return res.redirect(302, url)
}