import { NextApiRequest, NextApiResponse } from 'next';
import getServerUser from '../../../../../util/auth';
import { checkBanned, prisma } from '../../../../../util/db';
import { GeneralError } from '../../../../../util/interfaces/error-codes';
import { RateLimit } from '../../../../../util/rate-limit';
import { ConsumeType } from '../../../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../../../util/responses';
import HttpStatusCode from '../../../../../util/status-codes';
import { validateId } from '../../../../../util/validators';

const cache = new Map<string, string[]>()
const CACHE_EXPIRE = 1000 * 60 * 20

export default async function LikeRoute(req: NextApiRequest, res: NextApiResponse) {
    const { id, mode } = req.query
    if (typeof id !== "string" || !validateId(id))
        return sendErrorResponse(res, GeneralError.ID_WRONG_TYPE)

    if (typeof mode !== "string" || (mode !== "remove" && mode !== "add" && mode !== "has"))
        return res.status(HttpStatusCode.BAD_REQUEST).json({ error: "Invalid mode has to be add, remove or has" })


    const user = await getServerUser(req)
    if (!user && mode !== "has")
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    if (user && await checkBanned(user.id, res))
        return

    if (mode === "has") {
        const isRateLimited = await RateLimit.consume(ConsumeType.LikeHas, req, res)
        if (isRateLimited)
            return
    }

    let liked = user && cache.get(id)?.includes(user.id)
    let likedCount = cache.get(id)?.length

    if (!liked) {
        const dbClip = await prisma.clip.findFirst({
            where: { id: id },
            include: { likes: true }
        })

        if (!dbClip)
            return res.status(HttpStatusCode.NOT_FOUND).json({ error: "Could not find clip" })

        liked = user && dbClip.likes.some(e => e.userId === user.id)
        likedCount = dbClip.likes.length
        cache.set(id, dbClip.likes.map(e => e.id))
        setTimeout(() => cache.delete(id), CACHE_EXPIRE)
    }

    if (mode === "has")
        return user ? res.json({ liked: liked, count: likedCount }) : res.json({ count: likedCount })

    // should never happen, just for typing reasons
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    const isRateLimited = await RateLimit.consume(ConsumeType.Like, req, res)
    if (isRateLimited)
        return


    if (mode === "add") {
        if (liked)
            return res.json({ success: true, already: true })

        console.log("Updating clip with id", id)
        await prisma.clip.update({
            where: { id: id },
            include: { likes: true },
            data: {
                likes: {
                    create: { userId: user.id }
                }
            }
        })

        cache.delete(id)
        return res.json({ success: true })
    }

    if (mode === "remove") {
        if (!liked)
            return res.json({ success: true, already: true })

        await prisma.clip.update({
            where: { id: id },
            include: { likes: true },
            data: {
                likes: { deleteMany: { userId: user.id } }
            }
        })

        cache.delete(id)
        return res.json({ success: true })
    }

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: "How the heck did you get here?" })
}