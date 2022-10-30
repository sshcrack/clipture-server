import { NextApiRequest, NextApiResponse } from "next";
import path from "path"
import fs from "fs"
import { existsProm } from '../../../../util/fs';

export function validateId(id: string) {
    const regex = /^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}$/g
    return regex.test(id)
}

export default async function IconClips(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if (typeof id !== "string" || !validateId(id))
        return res.json({ error: "Invalid id" })

    const pngOut = path.join(process.cwd(), "icons", id + ".png")
    const exists = await existsProm(pngOut)
    res.setHeader("Content-Type", "image/png")
    if (!exists) {
        const unknown = path.join("public", "unknown.png")

        const downloadStream = fs.createReadStream(unknown)
        await new Promise(resolve => {
            downloadStream.pipe(res)
            downloadStream.on('end', resolve)
        })
        return
    }


    const readStream = fs.createReadStream(pngOut)
    readStream.pipe(res)
    await new Promise<void>(resolve => {
        readStream.on("close", () => resolve())
        readStream.on("end", () => resolve())
        readStream.on("error", () => resolve())
    });
}