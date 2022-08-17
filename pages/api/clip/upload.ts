import formidable from "formidable";
import { PlainResponse } from "got/dist/source/core";
import { NextApiRequest, NextApiResponse } from "next";
import {promisify} from 'node:util';
import stream from 'node:stream';
import { v4 as uuid } from "uuid";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import { StorageManager } from "../../../util/storage";

type DataClips = Parameters<typeof prisma["clip"]["create"]>["0"]["data"]
export const config = {
    api: {
        bodyParser: false
    }
};

const uploadLimit = parseInt(process.env.LIMIT_PER_USER as string)
if(!uploadLimit) {
    console.error("Byte limit per user has to be set. currently is", uploadLimit)
    process.exit(-1)
}

StorageManager.initialize()
const maxSize = StorageManager.getMaxClipSize()


const pipeline = promisify(stream.pipeline);
export default async function Upload(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req, res)
    if(!user)
        return res.status(403).json({ error: "Unauthenticated."})

    if(await checkBanned(user.id, res))
        return

    const fileSizeStr = req.query.fileSize
    if (req.method !== "POST")
        return res.status(400).json({
            error: "Method has to be POST to upload files."
        })


    const title = req.query.title
    if (typeof title !== "string" || title?.length > 50 )
        return res.status(400).json({
            error: "Title has to be a string and cannot be longer than 50 characters"
        })

    if (typeof fileSizeStr !== "string")
        return res.status(400).json({
            error: "File Size has to be a number/string"
        })

    if (isNaN(fileSizeStr as any))
        return res.status(400).json({
            error: "FileSize has to be a number"
        })

    const fileSize = parseInt(fileSizeStr)
    if (fileSize > maxSize)
        return res.status(400).json({
            error: `File Size cannot exceed ${maxSize}`
        })

    const statErr = await StorageManager.waitForStats()
        .then(() => { })
        .catch(e => e)

    if (statErr) {
        console.error(statErr)
        return res.status(500).json({ error: "Could not get current storage stats." })
    }

    const totalClipSize = await prisma.clip.aggregate({
        where: {
            uploaderId: user.id
        },
        _sum: {
            size: true
        }
    }).then(e => e._sum.size ?? 0)

    console.log("User", user.id, "with size", totalClipSize)
    if(totalClipSize + fileSize > uploadLimit)
        return res.status(403).json({ error: "Max upload size exceeded."})

    const id = uuid()
    let responseProm = undefined as Promise<PlainResponse | undefined> | undefined
    let storageAddr = undefined as string | undefined
    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        maxFiles: 1,
        maxFileSize: fileSize,
        fileWriteStreamHandler: () => {
            console.log("Writing file with fileSize", fileSize)
            if(responseProm)
                throw new Error("Cannot upload more than one file.")

            const { stream: gotStr, address } = StorageManager.getWriteStream(fileSize, id)

            storageAddr = address
            responseProm = new Promise<PlainResponse | undefined>(resolve => {
                gotStr?.on("response", e => {
                    console.log("Response found")
                    resolve(e)
                })
                gotStr?.on("close", () => {
                    //resolve(undefined)
                    console.log("Stream closed.")
                })
                gotStr?.on("error", e=> {
                    //@ts-ignore
                    resolve(e.response)
                })
            })

            return gotStr
        }
    });

    await new Promise<void>(resolve => {
        form.parse(req, async (err) => {
            if (err) {
                resolve()
                console.error(err)
                return res.status(500).json({ error: "Could not parse body." })
            }
            if(!storageAddr)
                return res.status(500).json({ error: "Could not store file."})

            console.log("Waiting for response...")
            const response = await (responseProm ?? Promise.resolve(undefined)).catch(e => {
                console.log("Error is", e)
                return e.response
            }) as PlainResponse

            console.log("Done.")
            if(!response || response.statusCode !== 200) {
                resolve()
                if(response.statusCode === 500)
                    return res.status(500).json({ error: "Could process clip."})
                try {
                    const json = JSON.parse(response.body as string)
                    if(json?.error?.includes("Validator has not been initialized"))
                        StorageManager.reinitialize(storageAddr)
                } catch(e) {}
                return res.status(response.statusCode).json(response.body)
            }

            const data = {
                id,
                title,
                size: fileSize,
                uploaderId: user.id,
                storage: storageAddr,
                uploadDate: new Date().toISOString(),
            } as DataClips

            console.log("Adding new Clip", JSON.stringify(data, null, 2))
            await prisma.clip.create({ data: data })

            res.json({ fileSize, id })
            resolve()
        })
    })
}