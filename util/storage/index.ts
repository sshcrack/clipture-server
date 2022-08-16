import { StorageInfo } from "./interface"
import got from "got"
import { Clip } from "@prisma/client"

const {
    STORAGES: allStorages,
    STORAGE_SECRET,
    MAX_CLIP_SIZE: MAX_SIZE,
    MIN_DURATION,
    MAX_DURATION
} = process.env

export class StorageManager {
    private static storageInfo = [] as StorageInfo[]
    private static addresses = [] as string[]
    private static storageStatsProm = Promise.resolve()
    private static currentlyChecking = false

    static getMaxClipSize() {
        if(!MAX_SIZE) {
            console.error("MAX_CLIP_SIZE has to be set.")
            throw new Error("Max Size has to be set.")
        }
        return parseInt(MAX_SIZE)


    }

    static getMinMax() {
        if(typeof MIN_DURATION !== "string" || typeof MAX_DURATION !== "string") {
            console.error("MIN_DURATION and/or MAX_DURATION has to be set in .env")
            process.exit(1)
        }

        if(isNaN(MIN_DURATION as any) || isNaN(MAX_DURATION as any)) {
            console.error("MIN_DURATION and MAX_DURATION have to be a number.")
            process.exit(-1)
        }

        return [ parseFloat(MIN_DURATION), parseFloat(MAX_DURATION)]
    }

    static async setMinMax(add: string[]) {
        const [ min, max ] = this.getMinMax()

        const p = add.map(e => got(`${e}/set?min=${min}&max=${max}&secret=${STORAGE_SECRET}`))
        return Promise.all(p)
    }

    static async initialize() {
        const addressSplit = allStorages?.split(",")
            .map(e => e.split(" ").join(""))

        console.log(addressSplit)
        if (!addressSplit || addressSplit?.length === 0)
            throw new Error(`STORAGES have to be set to at least one address.`)
        this.addresses = addressSplit

        this.setMinMax(addressSplit)
        const prom = this.getStorageStats()
        this.storageStatsProm = prom
    }

    static async getStorageStats() {
        if (this.currentlyChecking)
            return

        const func = async () => {
            const out = await Promise.all(
                this.addresses?.map(e =>
                    got(`${e}/info?secret=${STORAGE_SECRET}`)
                        .then(e => JSON.parse(e.body) as { sizeLeft: number })
                ) ?? []
            )

            const invalid = out.some(e => {
                return !e || typeof e.sizeLeft !== "number"
            })

            if (invalid)
                throw new Error(`Could not obtain storage info: ${JSON.stringify(out, null, 2)}`)

            this.storageInfo = out.map(({ sizeLeft }, i) => ({
                sizeLeft,
                address: this.addresses[i]
            }))

            console.log("Current Storage info is:", JSON.stringify(this.storageInfo, null, 2))
        }

        this.currentlyChecking = true
        const prom = func()
            .finally(() => this.currentlyChecking = false)
        this.storageStatsProm = prom

        await prom
    }

    static waitForStats() {
        return this.storageStatsProm
    }

    static getBestStorage() {
        const sorted = this.storageInfo.sort((a, b) => b.sizeLeft - a.sizeLeft)
        return sorted?.[0]
    }

    static getWriteStream(size: number, id: string) {
        const storage = this.getBestStorage()
        if (storage.sizeLeft < size)
            throw new Error(`Clip is too large. Only ${storage.sizeLeft} left (expected ${size}).`)

        const { address } = storage
        const url = `${address}/upload?secret=${STORAGE_SECRET}&size=${size}&id=${id}`
        console.log("Creating stream for url", url)
        const stream = got.stream.post(url)

        stream.addListener("end", () => {
            this.getStorageStats()
            console.log("Stream end.")
        })
        console.log("Writable", stream.writable)
        return { stream, address }
    }

    static streamVideo({ storage, id}: Clip, range?: string | string[]) {
        const url = `${storage}/get/${id}?secret=${STORAGE_SECRET}`
        return got.stream(url, {
            headers: range ? {
                "Range": range
            } : {}
        })
    }
}