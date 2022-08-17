const fs = require("fs")
const e = require("dotenv").parse(fs.readFileSync(".env.local", "utf-8"))
const { STORAGES, STORAGE_SECRET } = e

const addressSplit = STORAGES?.split(",")
    .map(e => e.split(" ").join(""))

console.log(addressSplit)
if (!addressSplit || addressSplit?.length === 0)
    throw new Error(`STORAGES have to be set to at least one address.`)

const proxyPass = addressSplit.map((e, i) => {
    return `
# reverse proxy
location /api/clip/get/cdn/${i}/ {
    rewrite ^ /?secret=${STORAGE_SECRET} break;
    proxy_pass ${e}/get;
    include    nginxconfig.io/proxy.conf;
}`
}).join("\n")

fs.writeFileSync("additional.conf", proxyPass)
console.log("Additional.conf created.")