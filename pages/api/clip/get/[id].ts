import { HTTPError } from "got/dist/source";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../util/db";
import { StorageManager } from "../../../../util/storage";

export default async function GetClip(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    const { "Content-Range": range } = req.headers ?? {}
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
        return res.json({ error: "Clip could not be found."})


    if(range)
        res.setHeader("Content-Range", range)

    const vid = StorageManager.streamVideo(clip, range)
    vid.on("error", async e => {
        if(!(e instanceof HTTPError)) {
            console.error(e)
            res.status(500).json({ error: "Could not get clip"})
        }

        const httpErr = e as HTTPError
        const { statusCode, body } = httpErr.response
        if(statusCode === 404) {
            console.log("Deleting non existent clip...")
            await prisma.clip.delete({ where: { id }})
            return res.status(400).json({ error: "Clip not found."})
        }

        res.status(500).json({ error: "Could not get clip (2)"})
        console.error(statusCode, body)
    })

    vid.pipe(res)
    await new Promise<void>(resolve => {
        vid.on("end", () => resolve())
        vid.on("error", () => resolve())
    })
}