import { Controller, Get } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'

@Controller('')
export class HealthCheckerController {
  @Get('ping')
  public async ping(
    req: Request,
    res: Response,
    _: NextFunction
  ): Promise<void> {
    res.send('pong')
  }
}
