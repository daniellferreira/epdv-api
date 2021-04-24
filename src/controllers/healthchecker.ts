import { Controller, Get } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UsersService } from '@src/services/users'
import AuthService from '@src/lib/auth'

@Controller('')
export class HealthCheckerController {
  @Get('ping')
  public async ping(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    res.send('pong')
  }
}
