import formidable from "formidable";
import { PlainResponse } from "got/dist/source/core";
import { NextApiRequest, NextApiResponse } from "next";
import os from "os";
import { spawn } from "child_process"
import path from 'path';
import { v4 as uuid } from "uuid";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import { getDetectableGames } from '../../../util/detection';
import { StorageManager } from "../../../util/storage";
import { writeFile } from 'fs/promises';
import HttpStatusCode from '../../../util/status-codes';
import { RateLimit } from '../../../util/rate-limit';
import { ConsumeType } from '../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../util/responses';
import { GeneralError } from '../../../util/interfaces/error-codes';

export const config = {
    api: {
        bodyParser: false
    }
};

const uploadLimit = parseInt(process.env.LIMIT_PER_USER as string)
const maxInfoLength = 80
const submissionLimit = 15

if (!uploadLimit) {
    console.error("Byte limit per user has to be set. currently is", uploadLimit)
    process.exit(-1)
}

StorageManager.initialize()
const maxSize = StorageManager.getMaxClipSize()

export default async function Upload(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (await checkBanned(user.id, res))
        return


    const isRateLimited = await RateLimit.consume(ConsumeType.Upload, req, res)
    if (isRateLimited)
        return

    const fileSizeStr = req.query.fileSize
    if (req.method !== "POST")
        return res.status(400).json({
            error: "Method has to be POST to upload files."
        })


    const title = req.query.title
    if (typeof title !== "string" || title?.length > 50)
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

    const storages = StorageManager.getStorages()
    const hasSpaceLeft = storages.find(e => e.sizeLeft > fileSize)
    if (!hasSpaceLeft)
        return res.status(HttpStatusCode.INSUFFICIENT_STORAGE).json({ error: "Not enough storage left :(" })

    const totalClipSize = await prisma.clip.aggregate({
        where: {
            uploaderId: user.id
        },
        _sum: {
            size: true
        }
    }).then(e => e._sum.size ?? 0)

    console.log("User", user.id, "with size", totalClipSize)
    if (totalClipSize + fileSize > uploadLimit)
        return res.status(403).json({ error: "Max upload size exceeded." })

    const id = uuid()
    let responseProm = undefined as Promise<PlainResponse | undefined> | undefined
    let storageAddr = undefined as string | undefined
    let chunks = [] as Buffer[]
    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        maxFiles: 1,
        maxFileSize: fileSize,
        fileWriteStreamHandler: () => {
            console.log("Writing file with fileSize", fileSize)
            if (responseProm)
                throw new Error("Cannot upload more than one file.")

            const { stream: gotStr, address } = StorageManager.getWriteStream(fileSize, id)

            storageAddr = address
            responseProm = new Promise<PlainResponse | undefined>(resolve => {
                gotStr?.on("response", (e: PlainResponse) => {
                    e.on("close", () => resolve(e))
                    e.on("end", () => resolve(e))
                    e.on("error", () => resolve(e))

                    if (e.complete)
                        resolve(e)
                })
                gotStr.on("data", e => chunks.push(e))
                gotStr?.on("close", () => resolve(undefined))
                gotStr?.on("error", (e: Error & { response: PlainResponse }) => resolve(e.response))
            })

            return gotStr
        }
    });

    await new Promise<void>(resolve => {
        form.parse(req, async (err, fields) => {
            if (err) {
                resolve()
                console.error(err)
                return res.status(500).json({ error: "Could not parse body." })
            }
            if (!storageAddr)
                return res.status(500).json({ error: "Could not store file." })

            console.log("Waiting for response...")
            const response = await (responseProm ?? Promise.resolve(undefined)).catch(e => {
                console.log("Error is", e)
                return e.response
            }) as PlainResponse

            console.log("Done.")
            console.log("Fields are", fields)
            if (!response || response.statusCode !== 200) {
                resolve()
                if (response.statusCode === 500)
                    return res.status(500).json({ error: "Could process clip." })
                try {
                    const json = JSON.parse(response.body as string)
                    if (json?.error?.includes("Validator has not been initialized"))
                        StorageManager.reinitialize(storageAddr)
                } catch (e) { }
                return res.status(response.statusCode).json(response.body)
            }

            let dcGameId = fields?.["discordGameId"] as string | null
            if (typeof dcGameId !== "string")
                dcGameId = null

            if (dcGameId) {
                const detectable = await getDetectableGames()
                const hasGameId = detectable.some(e => e.id === dcGameId)
                if (!hasGameId)
                    dcGameId = null
            }

            const className = fields?.["windowInformationClassName"]
            const executable = fields?.["windowInformationExecutable"]
            const windowTitle = fields?.["windowInformationTitle"]
            const icon = fields?.["windowInformationIcon"]

            let windowInfoId: string | null = null

            const typeValid = typeof className === "string" && typeof executable === "string" && typeof windowTitle === "string" && typeof icon === "string"
            if (typeValid) {
                const classNameShortened = className.substring(0, maxInfoLength)
                const executableShortened = executable.substring(0, maxInfoLength)
                const windowTitleShortened = windowTitle.substring(0, maxInfoLength)
                const existsAlready = await prisma.windowInformation.findFirst({
                    where: {
                        className: classNameShortened,
                        executable: executableShortened
                    }
                })


                if (existsAlready)
                    windowInfoId = existsAlready.id
                const posted = await prisma.windowInformation.count({ where: { userId: user.id } })

                const iconTooLarge = icon.length > 524300
                if (iconTooLarge && !existsAlready && posted < submissionLimit) {
                    const iconBuffer = Buffer.from(icon, "hex")
                    const tempFile = path.join(os.tmpdir(), uuid() + ".ico")
                    const pngOut = path.join(process.cwd(), "icons", uuid() + ".png")

                    await writeFile(tempFile, iconBuffer)
                    console.log("Converting", tempFile, "to", pngOut)
                    const prom = new Promise<void>((resolve, reject) => {
                        spawn("convert", [tempFile, "-resize", "32", pngOut])
                            .on("close", () => resolve())
                            .on("error", e => reject(e))
                    });

                    const res = await prom
                        .then(() => true)
                        .catch(() => false)

                    if (res) {
                        console.log("Submitted window information with", {
                            className: classNameShortened,
                            executable: executableShortened,
                            icon: pngOut,
                            title: windowTitleShortened,
                            userId: user.id
                        })

                        const winInfo = await prisma.windowInformation.create({
                            data: {
                                className: classNameShortened,
                                executable: executableShortened,
                                icon: pngOut,
                                title: windowTitleShortened,
                                userId: user.id
                            }
                        })
                        windowInfoId = winInfo.id
                    } else {
                        console.log("Invalid icon")
                    }
                } else {
                    console.log("Icon is too large", iconTooLarge, "posted", posted < submissionLimit, "exists", existsAlready)
                }
            } else {
                console.log("Types not valid", className, executable, windowTitle, typeof icon)
            }

            const body = Buffer.concat(chunks.filter(e => e !== null)).toString("utf-8")
            if (!body) {
                console.log("Invalid response body", body)
                StorageManager.delete(id, storageAddr)

                return res.status(500).json({ error: "Could not process clip." })
            }

            console.log(body)
            const { hex } = JSON.parse(body)
            const creatRes = await prisma.clip.create({
                data: {
                    id,
                    title,
                    size: fileSize,
                    uploaderId: user.id,
                    storage: storageAddr,
                    dcGameId,
                    uploadDate: new Date().toISOString(),
                    windowInfoId,
                    hex
                }
            })

            console.log("Adding new Clip", JSON.stringify(creatRes, null, 2))
            res.json({ fileSize, id, hex })
            resolve()
        })
    })
}