import { NextApiRequest } from "next";
import { prisma } from "./db";

export default async function getServerUser(req: NextApiRequest) {
    const sessionToken = req.cookies?.["next-auth.session-token"]
    if(!sessionToken)
        return null;


    const session = await prisma.session.findUnique({
        where: { sessionToken: sessionToken },
        include: { user: true}
    })

    return session?.user
}