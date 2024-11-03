import got from 'got';
import { NextApiRequest, NextApiResponse } from 'next';
import { DiscordUserResponse, getUserImage, refreshToken, RefreshTokenResponse, requestDiscordUser } from '../../../util/api/discord';
import getServerUser from '../../../util/auth';
import { prisma } from '../../../util/db';
import { GeneralError } from '../../../util/interfaces/error-codes';
import { sendErrorResponse } from '../../../util/responses';
import { checkCUID } from '../../../util/validators';

const cache = new Map<string, string>()
const CACHE_EXPIRE = 1000 * 60 * 60

const addCacheExpire = (id: string) => setTimeout(() => cache.delete(id), CACHE_EXPIRE)
export default async function UserImageAPI(req: NextApiRequest, res: NextApiResponse) {
    const auth = await getServerUser(req)
    const userId = req.query.id ?? auth?.id

    if (typeof userId !== "string" || userId.length > 30 || !checkCUID(userId))
        return sendErrorResponse(res, GeneralError.ID_WRONG_TYPE)

    if (cache.has(userId)) {
        res.redirect(cache.get(userId) as string)
        return
    }

    const dbAcc = await prisma.account.findFirst({ where: { userId: userId }, include: { user: true } })
    if (!dbAcc)
        return sendErrorResponse(res, GeneralError.USER_NOT_FOUND)

    let avatarUrl = dbAcc.user.image as string
    const dcRes = await got(avatarUrl, { method: "HEAD", throwHttpErrors: false })
    if (dcRes.statusCode === 200) {
        cache.set(userId, avatarUrl)
        addCacheExpire(userId)
        res.redirect(avatarUrl)

        return
    }

    let { access_token, token_type, id: dbAccId, refresh_token, userId: dbUserId } = dbAcc
    if (!token_type || !access_token)
        return sendErrorResponse(res, GeneralError.UNKNOWN_ERROR)

    let userRes = await requestDiscordUser(token_type, access_token)

    if (userRes.statusCode !== 200) {
        if (!refresh_token)
            return sendErrorResponse(res, GeneralError.INVALID_USER)

        console.log("Refreshing")
        const refreshedRaw = await refreshToken(refresh_token).catch(async e => {
            console.error("Fetch err", e)
            return null
        })

        console.log(refreshedRaw?.status)
        if (!refreshedRaw || refreshedRaw.status !== 200) {
            if (refreshedRaw)
                console.error("Refreshed Err", refreshedRaw.status, await refreshedRaw.json())
            else
                console.error(refreshedRaw)
            return sendErrorResponse(res, GeneralError.INVALID_REFRESH)
        }

        const refreshed = await refreshedRaw.json() as RefreshTokenResponse
        await prisma.account.update({
            where: { id: dbAccId },
            data: {
                access_token: refreshed.access_token,
                refresh_token: refreshed.refresh_token,
                token_type: refreshed.token_type
            }
        })

        userRes = await requestDiscordUser(refreshed.token_type, refreshed.access_token)
    }

    if (userRes.statusCode !== 200) {
        console.error("Invalid User Res", userRes.body, userRes.statusCode)
        return sendErrorResponse(res, GeneralError.INVALID_USER)
    }

    const newUserJson = JSON.parse(userRes.body) as DiscordUserResponse
    const newImg = getUserImage(newUserJson)

    await prisma.user.update({
        where: { id: dbUserId },
        data: {
            image: newImg,
            name: newUserJson.username
        }
    })

    cache.set(userId, avatarUrl)
    addCacheExpire(userId)
    console.log("Setting", userId, "to", avatarUrl)

    res.redirect(newImg)
}