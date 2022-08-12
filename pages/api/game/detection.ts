import { NextApiRequest, NextApiResponse } from "next"
import got from "got"
import fs from "fs"
import path from "path"

const updateInterval = 60 * 1000 * 10 // 10 Mins

const apiRoute = "httpS://discord.com/api/v8/applications/detectable"
const detectablePath = path.join(process.cwd(), ".next", "gameFiles")
const filePath = path.join(detectablePath, "info.json")
fs.mkdirSync(detectablePath, { recursive: true})

let lastUpdated = 0
export default async function DetectionRoute(_req: NextApiRequest, res: NextApiResponse) {
    const now = Date.now()
    if(now - lastUpdated > updateInterval) {
        lastUpdated = now
        const data = await got(apiRoute).then(e => JSON.parse(e.body))
        fs.writeFileSync(filePath, JSON.stringify(data))

        return res.json(data)
    }

    const data = JSON.parse(fs.readFileSync(filePath).toString())
    return res.json(data)
}
