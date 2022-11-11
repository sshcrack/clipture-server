import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from '../../../../util/auth';
import { checkBanned, prisma } from '../../../../util/db';
import { GeneralError } from '../../../../util/interfaces/error-codes';
import { RateLimit } from '../../../../util/rate-limit';
import { ConsumeType } from '../../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../../util/responses';

export default async function VisiblityClips(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if (!user)
        return sendErrorResponse(res, GeneralError.UNAUTHENTICATED)

    const isRateLimited = await RateLimit.consume(ConsumeType.Visibility, req, res)
    if (isRateLimited)
        return


    const isPublic = req.query.public
    if (typeof isPublic !== "string" || (isPublic !== "true" && isPublic !== "false"))
        return res.status(400).json({
            error: "public as query parameter has to be a boolean either `true` or `false`"
        })

    if (await checkBanned(user.id, res))
        return


    const id = req.query?.id
    if (typeof id !== "string")
        return res.status(400).json({ error: "Id has to be a string" })

    const clip = await prisma.clip.findFirst({
        where: {
            uploaderId: user.id,
            id: id
        }
    })

    if (!clip)
        return res.status(404).json({ error: "Clip could not be found." })

    await prisma.clip.update({
        where: { id: id },
        data: {
            isPublic: isPublic === "true"
        }
    })

    res.json({ success: true })
}