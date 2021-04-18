import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UsersService } from '@src/services/users'
import AuthService from '@src/lib/auth'

@Controller('auth')
export class AuthController {
  constructor(private service = new UsersService()) {}

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const user = await this.service.getByEmail(req.body.email)

      await AuthService.comparePasswords(req.body.password, user.password)

      const token = AuthService.generateToken({ user })

      return res.send(token)
    } catch (err) {
      next(err)
    }
  }
}
