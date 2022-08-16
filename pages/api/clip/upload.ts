import formidable from "formidable";
import { PlainResponse } from "got/dist/source/core";
import { NextApiRequest, NextApiResponse } from "next";
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
    let responseProm = undefined as Promise<PlainResponse> | undefined
    let storageAddr = undefined as string | undefined
    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        maxFiles: 1,
        maxFileSize: fileSize,
        fileWriteStreamHandler: () => {
            console.log("Writing file with fileSize", fileSize)
            if(responseProm)
                throw new Error("Cannot upload more than one file.")

            const { stream, address } = StorageManager.getWriteStream(fileSize, id)

            storageAddr = address
            responseProm = new Promise<PlainResponse>((resolve, reject) => {
                let found = false
                stream?.on("response", e => {
                    console.log("Response found")
                    resolve(e)
                    found = true
                })
                stream?.on("close", () => {
                    if(!found)
                        reject(new Error("Response could be obtained."))
                })
            })

            return stream
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
            const response = await (responseProm ?? Promise.resolve(undefined))
            console.log("Done.")
            if(!response || response.statusCode !== 200) {
                console.log("Invalid response", response?.statusCode, response?.body)
                resolve()
                return res.status(500).json({ error: "Could process clip."})
            }

            const data = {
                id,
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