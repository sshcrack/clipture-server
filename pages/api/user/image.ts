import got from 'got/dist/source';
import { NextApiRequest, NextApiResponse } from 'next';
import { DiscordUserResponse, getDiscordAvatar, getUserImage, refreshToken, RefreshTokenResponse, requestDiscordUser } from '../../../util/api/discord';
import getServerUser from '../../../util/auth';
import { prisma } from '../../../util/db';
import { GeneralError } from '../../../util/interfaces/error-codes';
import { sendErrorResponse } from '../../../util/responses';

export default async function UserImageAPI(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    let avatarUrl = getDiscordAvatar(user)
    const dcRes = await got(getDiscordAvatar(user), { method: "HEAD", throwHttpErrors: false })
    if (dcRes.statusCode === 200)
        return res.redirect(avatarUrl)


    const dbAcc = await prisma.account.findFirst({ where: { userId: user.id } })
    if (!dbAcc)
        return sendErrorResponse(res, GeneralError.USER_NOT_FOUND)


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

    return res.redirect(newImg)
}