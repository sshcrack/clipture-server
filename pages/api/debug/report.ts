import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from "next";
import path from 'path';
import fs from "fs"
import HttpStatusCode from '../../../util/status-codes';
import { checkBanned, prisma } from '../../../util/db';
import getServerUser from '../../../util/auth';
import { sendErrorResponse } from '../../../util/responses';
import { GeneralError } from '../../../util/interfaces/error-codes';

const MAX_ERROR_LENGTH = 1250;
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25mb
const DISABLE_REPORTING = process.env.DISABLE_REPORTING ?? false
const { REPORT_UPLOAD_DIR } = process.env
if (typeof REPORT_UPLOAD_DIR !== "string")
    throw new Error("Invalid UPLOAD_DIR in process.env (either invalid path or directory not created)")

if(!fs.existsSync(REPORT_UPLOAD_DIR))
    fs.mkdirSync(REPORT_UPLOAD_DIR)

export default async function DebugReport(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (await checkBanned(user.id, res))
        return


    if (DISABLE_REPORTING)
        return res.json("Route disabled.")

    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        maxFiles: 1,
        maxFileSize: MAX_FILE_SIZE,
        uploadDir: path.join("")
    });

    await new Promise<void>(resolve => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                resolve()
                console.error(err)
                return res.status(500).json({ error: "Could not parse body." })
            }

            const error = fields?.["error"]
            const archiveFile = files?.["archive"]
            if (typeof error !== "string") {
                resolve()
                return res.status(HttpStatusCode.BAD_REQUEST).json({ error: "No error given (has to be string)." })
            }

            if (!archiveFile) {
                resolve()
                return res.status(HttpStatusCode.BAD_REQUEST).json({ error: "File has to be string and given (archive file)" })
            }

            if(archiveFile instanceof Array) {
                resolve()
                return res.status(HttpStatusCode.BAD_REQUEST).json({ error: "Can only upload one array file"})
            }

            if (error.length > MAX_ERROR_LENGTH) {
                resolve()
                return res.status(HttpStatusCode.PAYLOAD_TOO_LARGE).json({ error: `Error given in request body is too long. Max is ${MAX_ERROR_LENGTH}.` })
            }


            const isInDB = await prisma.debugReport.findFirst({
                where: { message: error },
                select: { id: true }
            })

            if (isInDB) {
                resolve()
                return res.status(HttpStatusCode.CONFLICT).json({ error: "Error already in database." })
            }

            await prisma.debugReport.create({
                data: {
                    archive: archiveFile.filepath,
                    message: error,
                    reporterId: user.id
                }
            })
        })
    });

}

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
}