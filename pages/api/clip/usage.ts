import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import { GeneralError } from '../../../util/interfaces/error-codes';
import { RateLimit } from '../../../util/rate-limit';
import { ConsumeType } from '../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../util/responses';

const { MAX_CLIP_SIZE, LIMIT_PER_USER } = process.env

const maxClipInt = parseInt(MAX_CLIP_SIZE as string)
const limitPerUser = parseInt(LIMIT_PER_USER as string)
export default async function UsageClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (await checkBanned(user.id, res))
        return


    const isRateLimited = await RateLimit.consume(ConsumeType.Usage, req, res)
    if (isRateLimited)
        return

    const clips = await prisma.clip.findMany({
        where: {
            uploaderId: user.id
        },
        include: { windowInfo: true }
    })

    return res.json({
        maxClipSize: maxClipInt,
        maxTotal: limitPerUser,
        current: clips.reduce((a, b) => a + b.size, 0)
    })
}