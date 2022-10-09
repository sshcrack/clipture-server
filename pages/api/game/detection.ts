import { NextApiRequest, NextApiResponse } from "next"
import { getDetectableGames } from '../../../util/detection'


export default async function DetectionRoute(_req: NextApiRequest, res: NextApiResponse) {
    return res.json(await getDetectableGames())
}
