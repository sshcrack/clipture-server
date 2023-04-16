import got from "got"
import fetch from "node-fetch"

export function getDiscordAvatar({ id, image }: { id: string, image: string | null }) {
    console.log("id is", id, "image", image, "url", `https://cdn.discordapp.com/avatars/${id}/${image ?? "undefined"}.png`)
    return `https://cdn.discordapp.com/avatars/${id}/${image ?? "undefined"}.png`
}

const CLIENT_ID = process.env.CLIENT_ID as string
const CLIENT_SECRET = process.env.CLIENT_SECRET as string
export function requestDiscordUser(tokenType: string, accessToken: string) {
    return got(`https://discord.com/api/users/@me`, {
        headers: {
            Authorization: `${tokenType} ${accessToken}`
        },
        throwHttpErrors: false
    })
}

export function refreshToken(refresh_token: string) {
    const formData = new URLSearchParams()
    formData.append("client_id", CLIENT_ID)
    formData.append("client_secret", CLIENT_SECRET)
    formData.append("grant_type", "refresh_token")
    formData.append("refresh_token", refresh_token)
    formData.append("scope", "identify email")

    console.log("FormData is", formData)
    //old https://discord.com/api/oauth2/token
    return fetch(`https://discord.com/api/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    })
}

export function getUserImage(profile: DiscordUserResponse) {
    if (profile.avatar === null) {
        const defaultAvatarNumber = parseInt(profile.discriminator) % 5
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
    } else {
        const format = profile.avatar.startsWith("a_") ? "gif" : "png"
        return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
    }
}

export type RefreshTokenResponse = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
}

export interface DiscordUserResponse {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: null;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: null;
    banner_color: string;
    accent_color: number;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
    email: string;
    verified: boolean;
}
