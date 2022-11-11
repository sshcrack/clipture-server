import { RateLimiterMemory } from "rate-limiter-flexible";

export enum ConsumeType {
    Delete,
    List,
    Discover,
    Rename,
    Upload,
    Usage,
    Report,
    Like,
    LikeHas,
    Visibility
}

export interface CostInterface<T> {
    type: T,
    retries: number,
    limiter?: RateLimiterMemory
}