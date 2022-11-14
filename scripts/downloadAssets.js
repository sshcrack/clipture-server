const got = require("got")
const JSZip = require("jszip")
const fs = require("fs")
const stream = require("node:stream")
const path = require("path")

const pipeline = promisify(stream.pipeline);
const fct = async () => {
    console.log("Downloading assets from dropbox...")
    const downloadLink = "https://www.dropbox.com/s/e0ziubp60mxx3p1/assets.zip?dl=1"
    const req = got.stream(downloadLink)

    req.on("downloadProgress", e => {
        console.log(`Downloading ${e.percent}% (${e.transferred}/${e.total})`)
    })

    await pipeline(
        req,
        fs.createWriteStream('assets.zip')
    );

    console.log("Unzipping...")
    JSZipUtils.getBinaryContent('assets.zip', function (err, data) {
        if (err) {
            console.log("Error, deleting archive...")
            fs.unlinkSync("assets.zip")
            throw err; // or handle err
        }

        JSZip.loadAsync(data).then(async zip => {
            console.log("Zip loaded...")
            const keys = Object.keys(zip.files)
            for (let key of keys) {
                const item = result.files[key]
                if (item.dir) {
                    fs.mkdirSync(path.join("public", item.name))
                } else {
                    console.log("Unpacking", item.name)
                    fs.writeFileSync(path.join("public", item.name), Buffer.from(await item.async("arraybuffer")))
                }
            }
        })
            .catch(err => {
                console.log("Error, deleting archive...")
                fs.unlinkSync("assets.zip")
                throw err; // or handle err
            });
    });
}

fct()