import { RateLimiterMemory } from "rate-limiter-flexible";

export enum ConsumeType {
    Delete,
    List,
    Rename,
    Upload,
    Usage,
    Report
}

export interface CostInterface<T> {
    type: T,
    retries: number,
    limiter?: RateLimiterMemory
}