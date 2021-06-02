import { ClassMiddleware, Controller, Get, Post } from '@overnightjs/core'
import { authMiddleware } from '@src/middlewares/auth'
import { CheckoutService } from '@src/services/checkout'
import { UserError, UserStatusCodes } from '@src/util/errors'
import { NextFunction, Request, Response } from 'express'

@ClassMiddleware(authMiddleware)
@Controller('checkout')
export class CheckoutController {
  constructor(protected readonly service = new CheckoutService()) {}

  @Post('')
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const checkoutSession = await this.service.create(
        req.decoded?.user.account,
        req.body
      )

      res.status(200).json(checkoutSession)
    } catch (err) {
      if (err instanceof UserError) {
        return next(err)
      }

      next(new UserError(err.message, UserStatusCodes.BadRequest))
    }
  }

  @Get(':id')
  public async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const checkoutId = req.params.id

      const checkout = await this.service.get(
        req.decoded?.user.account,
        checkoutId
      )

      if (!checkout) {
        throw new UserError(`Checkout not found with id ${checkoutId}`)
      }

      res.status(200).json(checkout)
    } catch (err) {
      if (err instanceof UserError) {
        return next(err)
      }

      next(new UserError(err.message, UserStatusCodes.BadRequest))
    }
  }
}
