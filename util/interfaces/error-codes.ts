export enum FormattedError {
    FIELDS_NOT_AVAILABLE = -1,
    INVALID_BODY_LENGTH = -2,
    METHOD_NOT_ALLOWED = -3,
    RATE_LIMITED = -4,
    INVALID_TYPES = -5
}

export enum GeneralError {
    UNKNOWN_ERROR,
    TYPE_NOT_FOUND,
    LIMITER_NOT_AVAILABLE,
    SOCKET_CLOSED,
    UNAUTHENTICATED,
    USER_NOT_FOUND,
    BANNED,
    ID_WRONG_TYPE,
    INVALID_USER,
    INVALID_REFRESH
}

type ErrorCodes = FormattedError | GeneralError
export default ErrorCodes