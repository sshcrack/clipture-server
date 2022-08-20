import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import getServerUser from "../../../util/auth";
import { checkBanned } from "../../../util/db";

export const config = {
    api: {
        bodyParser: false
    }
};
export default async function SubmitGame(req: NextApiRequest, res: NextApiResponse) {
    const user = await getServerUser(req)
    if(!user)
        return res.status(403).json({ error: "Unauthenticated."})

    if(await checkBanned(user.id, res))
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