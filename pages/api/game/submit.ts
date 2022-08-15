import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable"
import { getUserId, checkBanned, prisma } from "../../../util/db";
import { getSession } from "next-auth/react";
import { isRegExp } from "util/types";

export const config = {
    api: {
        bodyParser: false
    }
};
export default async function SubmitGame(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession()
    if(!session)
        return res.status(403).json({ error: "Unauthenticated."})

    const userId = getUserId(session)
    if(!userId)
        return res.status(500).json({ error: "Could not get user id." })
    if(await checkBanned(userId, res))
        return

    const form = new formidable.IncomingForm({
        allowEmptyFiles: false,
        maxFiles: 1,
        maxFileSize: 1024 * 1024 // Max 1 mb
    });

    form.parse(req, (err, fields, files) => {
        if(!err)
            return res.json({ error: "Could not parse body."})

        return res.json({ files, fields })
    })
}