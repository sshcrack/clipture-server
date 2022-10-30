import { WindowInformation } from '@prisma/client'
import { Merge } from "type-fest"
import ErrorCodes, { FormattedError } from "./error-codes"

export interface ErrorResponse {
    error: ErrorCodes,
    message: string
}

export interface RateLimitResponse extends ErrorResponse {
    error: FormattedError.RATE_LIMITED,
    message: "Too many requests. Try again later.",
    retryAfter: number
    limit: number,
    reset: number
}

export type APIError = ErrorResponse | RateLimitResponse

export interface EncryptionKeyResponse {
    publicKey: string,
    expiresAt: number
}

export interface EncryptionTokenBody {
    username: string
}

export interface CheckInterface {
    name: string,
    maxLength: number
}

/**
 * Make sure that Method name is in SCREAMING CASE
 */
export type AvailableMethods = "GET" | "HEAD" | "POST"
    | "PUT" | "DELETE" | "CONNECT"
    | "OPTIONS" | "TRACE"

export interface ValueInterface<T> {
    name: string,
    value: T
}

export type MaxLengthInterface = Merge<ValueInterface<string>, { maxLength: number }>

export type JSONObject<K extends string | number, T> = {
    [key in K]: T
}

export enum FieldLength {
    USERNAME = 32,
    PASSWORD = 128,
    OTP = 6
}

export type FilteredClip = {
    id: string;
    uploadDate: Date;
    title: string;
    dcGameId: string | null;
    hex: string;
    windowInfo: {
        id: string;
        userId: string;
        title: string;
        icon: string;
    } | null;
    likes: number
}
