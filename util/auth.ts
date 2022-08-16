import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./db";

export default async function getServerUser(req: NextApiRequest, res: NextApiResponse) {
    const csrfToken = req.cookies?.["next-auth.csrf-token"]
    console.log(csrfToken)
    if(!csrfToken)
        return null;


    const session = await prisma.session.findUnique({
        where: { sessionToken: csrfToken },
        include: { user: true}
    })

    return session?.user
}