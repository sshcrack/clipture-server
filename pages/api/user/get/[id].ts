import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../util/db';
import { GeneralError } from '../../../../util/interfaces/error-codes';
import { RateLimit } from '../../../../util/rate-limit';
import { ConsumeType } from '../../../../util/rate-limit/interface';
import { sendErrorResponse } from '../../../../util/responses';
import { checkCUID } from '../../../../util/validators';

export default async function UserGetRoute(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if (typeof id !== "string" || !checkCUID(id))
        return sendErrorResponse(res, GeneralError.ID_WRONG_TYPE)

    const isRateLimited = await RateLimit.consume(ConsumeType.UserGet, req, res)
    if (isRateLimited)
        return

    const user = await prisma.user.findFirst({
        select: {
            name: true,
            image: true,
            id: true
        },
        where: {
            id: id
        }
    })

    return res.json(user)
}