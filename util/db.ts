import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";
import { Session } from "next-auth";
import { GeneralError } from './interfaces/error-codes';
import { sendErrorResponse } from './responses';

export const prisma = new PrismaClient()

export function getUserId(sess: Session) {
    //@ts-ignore
    return sess?.userId as string
}

export async function checkBanned(userId: string, res: NextApiResponse) {
    const isBanned = await prisma.user.findFirst({ where: { id: userId } })
        .then(e => e && e.banned)

    if (isBanned == null) {
        sendErrorResponse(res, GeneralError.USER_NOT_FOUND)
        return true
    }

    if (isBanned) {
        sendErrorResponse(res, GeneralError.BANNED)
        return true
    }

    return false
}