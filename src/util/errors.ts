export enum UserStatusCodes {
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Semantic = 422,
}
export enum InternalStatusCodes {
  InternalServerError = 500,
}
export type ErrorCause =
  | 'VALIDATION_ERROR'
  | 'RECORD_NOTFOUND'
  | 'ROUTE_NOTFOUND'
  | 'UNAUTHORIZED'

export class InternalError extends Error {
  constructor(
    public message: string,
    public statusCode:
      | InternalStatusCodes
      | UserStatusCodes = InternalStatusCodes.InternalServerError,
    public cause?: ErrorCause,
    public details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class UserError extends InternalError {
  constructor(
    public message: string,
    public statusCode: UserStatusCodes = UserStatusCodes.BadRequest,
    public cause?: ErrorCause,
    public details?: any
  ) {
    super(message, statusCode, cause, details)
  }
}
