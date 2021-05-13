import { Request, Response, NextFunction } from 'express'
import AuthService from '@src/lib/auth'
import { UserError, UserStatusCodes } from '@src/util/errors'

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token']
  try {
    const decoded = AuthService.decodeToken(token as string)
    req.decoded = decoded
    next()
  } catch (err) {
    const erro = new UserError(
      err.message,
      UserStatusCodes.Unauthorized,
      'UNAUTHORIZED'
    )
    res.status?.(erro.statusCode).send({
      cause: erro.cause,
      message: erro.message,
    })
  }
}
