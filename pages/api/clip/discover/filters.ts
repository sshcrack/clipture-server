import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { prisma } from "../../../../util/db";
import { RateLimit } from '../../../../util/rate-limit';
import { ConsumeType } from '../../../../util/rate-limit/interface';

const CACHE_EXPIRE = 1000 * 60 * 5
let cache: DiscoverFilter[] | null = null

export type FilteredWindowInformation = {
    id: string;
    userId: string;
    title: string;
    icon: string;
}

export type DiscoverFilter = {
    windowInfo: FilteredWindowInformation | null,
    dcGameId: string | null
}

export default async function DiscoverFilterClips(req: NextApiRequest, res: NextApiResponse) {
    const isRateLimited = await RateLimit.consume(ConsumeType.DiscoverFilters, req, res)
    if (isRateLimited)
        return

    if (cache)
        return res.json(cache)

    const clips = await prisma.clip.findMany({
        distinct: ["dcGameId", "windowInfoId"],
        select: {
            windowInfo: true,
            windowInfoId: true,
            dcGameId: true
        }
    })

    const filteredInfo: DiscoverFilter[] = clips.map(({ dcGameId, windowInfo }) => {
        return {
            dcGameId,
            windowInfo: windowInfo ? {
                id: windowInfo.id,
                userId: windowInfo.userId,
                title: windowInfo.title,
                icon: path.basename(windowInfo.icon),
            } : null
        }
    }).filter(e => e.dcGameId || e.windowInfo)

    cache = filteredInfo

    setTimeout(() => {
        cache = null
    }, CACHE_EXPIRE)
    res.json(filteredInfo)
}