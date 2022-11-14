import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import { GeneralError } from '../../../util/interfaces/error-codes';
import { RateLimit } from '../../../util/rate-limit';
import { ConsumeType } from '../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../util/responses';
import { StorageManager } from '../../../util/storage';
import { runChecks } from '../../../util/validators';

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (await checkBanned(user.id, res))
        return

    const isRateLimited = await RateLimit.consume(ConsumeType.Delete, req, res)
    if (isRateLimited)
        return
        
    const id = req.query?.id
    if (typeof id !== "string")
        return sendErrorResponse(res, GeneralError.ID_WRONG_TYPE)

    const clip = await prisma.clip.findFirst({
        where: {
            uploaderId: user.id,
            id: id
        }
    })

    if (!clip)
        return res.status(404).json({ error: "Clip could not be found. / No permission to delete" })

    const { storage } = clip
    const deleted = await StorageManager.delete(id, storage)
        .then(() => true)
        .catch(e => {
            const r = e?.response
            if (!r) {
                console.error("Error", r)
                res.status(500).json({ error: "Internal server error. Could not delete video." })
                return false
            }

            if (e.response.statusCode !== 404) {
                console.error(e?.response?.body ?? e, e?.response?.statusCode)
                res.status(500).json({ error: "Internal server error. Could not delete video." })
                return false
            }

            console.log("DB mismatch, continuing")
            return true
        })

    if (!deleted)
        return

    console.log("Deleting from db...")
    const prismaRes = await prisma.clip.delete({
        where: {
            id: id
        },
        include: {
            uploader: false,
            windowInfo: false
        }
    })

    if (!prismaRes)
        return res.status(500).json({ error: "Database mismatch" })

    res.json({ success: true })
}