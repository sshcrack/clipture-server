import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./db";

export default async function getServerUser(req: NextApiRequest, res: NextApiResponse) {
    const sessionToken = req.cookies?.["next-auth.session-token"]
    console.log(req.cookies)
    if(!sessionToken)
        return null;


    const session = await prisma.session.findUnique({
        where: { sessionToken: sessionToken },
        include: { user: true}
    })

    return session?.user
}