import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { prisma } from "../../../../util/db";
import { DiscoverClip } from '../../../../util/interfaces/APIInterfaces';
import HttpStatusCode from '../../../../util/interfaces/status-codes';
import { RateLimit } from '../../../../util/rate-limit';
import { ConsumeType } from '../../../../util/rate-limit/interface';
const MAX_LIMIT = 50

export default async function DiscoverFilterClips(req: NextApiRequest, res: NextApiResponse) {
    const isRateLimited = await RateLimit.consume(ConsumeType.DiscoverFilters, req, res)
    if (isRateLimited)
        return

    const clips = await prisma.clip.groupBy({
        where: { isPublic: true },
        orderBy: {
            dcGameId: "asc",
            windowInfoId: "asc"
        },
        by: ["dcGameId", "windowInfoId"]
    })
    const windowInfos = await prisma.windowInformation.findMany({
        where: {
            OR: clips
                .filter(e => e.windowInfoId)
                .map(e => ({ id: e.windowInfoId as string }))
        }
    })

    const filteredInfo = clips.map(({ dcGameId, windowInfoId }) => {
        const windowInfo = windowInfos.find(e => e.id === windowInfoId)

        return {
            dcGameId,
            windowInfo: windowInfo ? {
                id: windowInfo.id,
                userId: windowInfo.userId,
                title: windowInfo.title,
                icon: path.basename(windowInfo.icon),
            } : null
        }
    })

    res.json(filteredInfo)
}