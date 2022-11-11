import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned, prisma } from "../../../util/db";
import path from "path"
import { RateLimit } from '../../../util/rate-limit';
import { ConsumeType } from '../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../util/responses';
import { GeneralError } from '../../../util/interfaces/error-codes';
import { FilteredClip } from '../../../util/interfaces/APIInterfaces';

export default async function ListClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (await checkBanned(user.id, res))
        return

    const isRateLimited = await RateLimit.consume(ConsumeType.List, req, res)
    if (isRateLimited)
        return

    const clips = await prisma.clip.findMany({
        where: {
            uploaderId: user.id
        },
        include: {
            windowInfo: true,
            _count: {
                select: {
                    likes: true
                }
            }
        }
    })

    const filteredInfo: FilteredClip[] = clips.map(({ id, uploadDate, title, dcGameId, windowInfo, uploaderId, hex, _count }) => ({
        id,
        uploadDate,
        title,
        dcGameId,
        uploaderId,
        hex,
        likes: _count.likes,
        windowInfo: windowInfo ? {
            id: windowInfo.id,
            userId: windowInfo.userId,
            title: windowInfo.title,
            icon: path.basename(windowInfo.icon),
        } : null
    }))

    res.json(filteredInfo)
}