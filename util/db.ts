import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

export const prisma = new PrismaClient()

export function getUserId(sess: Session) {
    //@ts-ignore
    return sess?.userId as string
}