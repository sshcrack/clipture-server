import ErrorCodes, { GeneralError } from '../interfaces/error-codes';
import HttpStatusCode from '../interfaces/status-codes';

export const ErrorResponseList: APIErrorExtended[] = [
    {
        error: GeneralError.LIMITER_NOT_AVAILABLE,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "Limiter is not available. Please inform the developers of this tool under https://github.com/sshcrack/CLIpher-server"
    },
    {
        error: GeneralError.TYPE_NOT_FOUND,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "The consumation type for the rate limiter has not been found."
    },
    {
        error: GeneralError.SOCKET_CLOSED,
        status: HttpStatusCode.BAD_REQUEST,
        message: "Socket hang up"
    },
    {
        error: GeneralError.UNAUTHENTICATED,
        status: HttpStatusCode.UNAUTHORIZED,
        message: "Unauthorized."
    },
    {
        error: GeneralError.USER_NOT_FOUND,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "User could not be found in database."
    },
    {
        error: GeneralError.BANNED,
        status: HttpStatusCode.FORBIDDEN,
        message: "You have been permanently banned as you broke the TOS. Ban Appeals are available in our discord server."
    },
    {
        error: GeneralError.ID_WRONG_TYPE,
        status: HttpStatusCode.BAD_REQUEST,
        message: "Id has to be of type string."
    },
    {
        error: GeneralError.INVALID_USER,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "Invalid user in db"
    },
    {
        error: GeneralError.INVALID_REFRESH,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "Could not refresh token"
    },
    {
        error: GeneralError.ONLY_POST,
        status: HttpStatusCode.METHOD_NOT_ALLOWED,
        message: "This route only allows POST as method."
    },
]

interface APIErrorExtended {
    error: ErrorCodes,
    status: HttpStatusCode,
    message: string
}