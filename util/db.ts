import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";
import { Session } from "next-auth";

export const prisma = new PrismaClient()

export function getUserId(sess: Session) {
    //@ts-ignore
    return sess?.userId as string
}

export async function checkBanned(userId: string, res: NextApiResponse) {
    const isBanned = await prisma.user.findFirst({ where: { id: userId }})
        .then(e => e && e.banned)

    if(isBanned == null) {
        res.status(500).json({ error: "A user with that id could not be found."})
        return true
    }

    if(isBanned) {
        res.status(403).json({ error: "You have been permanently banned as you broke the TOS. Ban Appeals are available in our discord server." })
        return true
    }

    return false
}