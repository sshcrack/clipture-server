import { RateLimiterMemory } from "rate-limiter-flexible";

export enum ConsumeType {
    Delete,
    List,
    Discover,
    DiscoverFilters,
    DiscoverSearch,
    Rename,
    Upload,
    Usage,
    Report,
    Like,
    LikeHas,
    Visibility,
    UserGet,
    DebugReport
}

export interface CostInterface<T> {
    type: T,
    retries: number,
    limiter?: RateLimiterMemory
}