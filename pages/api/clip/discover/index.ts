import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { prisma } from "../../../../util/db";
import { DiscoverClip } from '../../../../util/interfaces/APIInterfaces';
import HttpStatusCode from '../../../../util/interfaces/status-codes';
import { RateLimit } from '../../../../util/rate-limit';
import { ConsumeType } from '../../../../util/rate-limit/interface';
const MAX_LIMIT = 50

export default async function DiscoverClips(req: NextApiRequest, res: NextApiResponse) {
    const { offset: offsetStr, limit: limitStr, query } = req.query

    if (query && (typeof query !== "string" || query.length > 50))
        return res.status(HttpStatusCode.BAD_REQUEST).json({
            error: "Search query has to be below 50 characters"
        })

    if (offsetStr && (typeof offsetStr !== "string" || isNaN(offsetStr as unknown as number)))
        return res.status(HttpStatusCode.BAD_REQUEST).json({
            error: "Offset has to be string or not set"
        })

    if (limitStr && (typeof limitStr !== "string" || isNaN(limitStr as unknown as number)))
        return res.status(HttpStatusCode.BAD_REQUEST).json({
            error: `Limit string has to be an integer between 1 and ${MAX_LIMIT}`
        })

    const offset = parseInt(offsetStr ?? "0")
    const limit = parseInt(limitStr ?? "20")
    if (offset < 0)
        return res.status(HttpStatusCode.BAD_REQUEST).json({
            error: "Offset has to be above or 0"
        })

    if (limit < 1 || limit > MAX_LIMIT)
        return res.status(HttpStatusCode.BAD_REQUEST).json({
            error: `Limit has to be between 1 and ${MAX_LIMIT}`
        })


    const isRateLimited = await RateLimit.consume(ConsumeType.Discover, req, res)
    if (isRateLimited)
        return

    const clips = await prisma.clip.findMany({
        skip: offset,
        take: limit,
        orderBy: { uploadDate: "desc" },
        where: {
            isPublic: true,
            title: query ? {
                contains: query,
                mode: "insensitive"
            } : undefined
        },
        select: {
            id: true,
            uploadDate: true,
            title: true,
            dcGameId: true,
            uploaderId: true,
            windowInfo: true
        }
    })
    const total = await prisma.clip.count({ where: { isPublic: true } })

    const filteredInfo: DiscoverClip[] = clips.map(({ id, uploadDate, title, dcGameId, windowInfo, uploaderId }) => ({
        id,
        uploadDate,
        title,
        dcGameId,
        uploaderId,
        windowInfo: windowInfo ? {
            id: windowInfo.id,
            userId: windowInfo.userId,
            title: windowInfo.title,
            icon: path.basename(windowInfo.icon),
        } : null
    }))

    res.json({
        clips: filteredInfo,
        leftOver: Math.max(0, total - offset - limit)
    })
}