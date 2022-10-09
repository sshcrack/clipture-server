import got from "got"
import fs from "fs"
import path from "path"
const updateInterval = 60 * 1000 * 10 // 10 Mins


const apiRoute = "httpS://discord.com/api/v8/applications/detectable"
const detectablePath = path.join(process.cwd(), ".next", "gameFiles")
const filePath = path.join(detectablePath, "info.json")
let lastUpdated = 0
fs.mkdirSync(detectablePath, { recursive: true })

export async function getDetectableGames(): Promise<DetectableGame[]> {
    const now = Date.now()
    if (now - lastUpdated > updateInterval) {
        lastUpdated = now
        const data = await got(apiRoute).then(e => JSON.parse(e.body))
        fs.writeFileSync(filePath, JSON.stringify(data))

        return data
    }

    return JSON.parse(fs.readFileSync(filePath).toString())
}


export interface DetectableGame {
    bot_public?: boolean;
    bot_require_code_grant?: boolean;
    cover_image?: string;
    description: string;
    developers?: Developer[];
    executables?: Executable[];
    flags: number;
    guild_id?: string;
    hook: boolean;
    icon: null | string;
    id: string;
    name: string;
    publishers?: Developer[];
    rpc_origins?: string[];
    splash?: string;
    summary: string;
    third_party_skus?: ThirdPartySkus[];
    type: number | null;
    verify_key: string;
    primary_sku_id?: string;
    slug?: string;
    aliases?: string[];
    overlay?: boolean;
    overlay_compatibility_hook?: boolean;
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    eula_id?: string;
    deeplink_uri?: string;
}

export interface Developer {
    id: string;
    name: string;
}

export interface Executable {
    is_launcher: boolean;
    name: string;
    os: OS;
    arguments?: string;
}

export enum OS {
    Darwin = "darwin",
    Linux = "linux",
    Win32 = "win32",
}

export interface ThirdPartySkus {
    distributor: Distributor;
    id: null | string;
    sku: null | string;
}

export enum Distributor {
    Battlenet = "battlenet",
    Discord = "discord",
    Epic = "epic",
    Glyph = "glyph",
    Gog = "gog",
    GooglePlay = "google_play",
    Origin = "origin",
    Steam = "steam",
    Twitch = "twitch",
    Uplay = "uplay",
}
