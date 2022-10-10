import { NextApiRequest, NextApiResponse } from "next";
import path from "path"
import fs from "fs"

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if (typeof id !== "string")
        return res.json({ error: "Invalid id" })

    const pngOut = path.join(process.cwd(), "icons", id)
    const readStream = fs.createReadStream(pngOut)
    readStream.pipe(res)
    await new Promise<void>(resolve => {
        readStream.on("close", () => resolve())
        readStream.on("end", () => resolve())
        readStream.on("error", () => resolve())
    });
}