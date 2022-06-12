import { NextApiRequest, NextApiResponse } from 'next';
import fsProm from "fs/promises"
import fs from "fs"
import path from "path"
import got from 'got';

const apiRoute = (id: string, icon: string) => `https://cdn.discordapp.com/app-icons/${id}/${icon}.png?size=512`
const detectablePath = path.join(process.cwd(), ".next", "gameFiles")
fs.mkdirSync(detectablePath, { recursive: true })

export default async function IconGameRoute(req: NextApiRequest, res: NextApiResponse) {
    const { id, icon } = req.query
    if(typeof id !== "string")
        return res.json({ error: "Id has to be a string" })

    if(typeof icon !== "string")
        return res.json({ error: "Icon has has to be a string"})


    res.setHeader("Content-Type", "image/png")
    if(icon === "null")
        return fs.createReadStream(path.join("public", "unknown.png")).pipe(res)

    const filePath = path.join(detectablePath, id + "_" + icon + ".png")
    console.log("fs stat")
    const exists = await fsProm.stat(filePath)
        .then(() => true)
        .catch(() => false);
    if(!exists) {
        const route = apiRoute(id, icon);
        console.log("MKDIr")
        fs.mkdirSync(detectablePath, { recursive: true })

        console.log(route)
        const raw = await got(route).then(e => e.rawBody)

        fsProm.writeFile(filePath, raw)
        return res.send(raw)
    }

    return fs.createReadStream(filePath).pipe(res)
}