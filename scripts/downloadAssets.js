const got = require("got")
const JSZip = require("jszip")
const fs = require("fs")
const stream = require("node:stream")
const path = require("path")
const { prettyBytes } = require("./prettyBytes")
const { promisify } = require("node:util")

const currHash = "58b0f7a94ee51e587cd5ae82be15c456796c67d6469c7872f165e69976141adf"

const pipeline = promisify(stream.pipeline);
const fct = async () => {
    const dotFile = ".downloaded-assets-hash"
    if (fs.existsSync(dotFile)) {
        const hash = fs.readFileSync(dotFile, "utf-8")
        if (hash === currHash) {
            console.log(hash, "and", currHash, "are equal, not downloading new assets.")
            return
        }
    }
    
        console.log("Downloading assets from dropbox...")
        const downloadLink = "https://www.dropbox.com/s/e0ziubp60mxx3p1/assets.zip?dl=1"
        const req = got.stream(downloadLink)
    
        req.on("downloadProgress", e => {
            console.log(`Downloading ${Math.round(e.percent * 100 * 100) / 100}% (${isNaN(e.transferred) ? "NaN" : prettyBytes(e.transferred)}/${isNaN(e.total) ? "NaN" : prettyBytes(e.total)})`)
        })
    
        await pipeline(
            req,
            fs.createWriteStream('assets.zip')
        );
    
    console.log("Unzipping...")
    const fileContent = fs.readFileSync("assets.zip")
    JSZip.loadAsync(fileContent).then(async data => {

        console.log("Zip loaded...")
        const keys = Object.keys(data.files)
        for (let key of keys) {
            const item = data.files[key]
            if (item.dir) {
                fs.mkdirSync(path.join("public", item.name))
            } else {
                console.log("Unpacking", item.name)
                fs.writeFileSync(path.join("public", item.name), Buffer.from(await item.async("arraybuffer")))
            }
        }

        fs.writeFileSync(dotFile, currHash)
        console.log("Done.")
    })
        .catch(err => {
            console.log("Error, deleting archive...")
            throw err; // or handle err
        });
}

fct().finally(() => fs.existsSync("assets.zip") && fs.unlinkSync("assets.zip"))