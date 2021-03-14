import { Controller, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UsersService } from '@src/services/users'

@Controller('users')
export class UserController {
  constructor(private service = new UsersService()) {}

  @Post('')
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newUser = await this.service.create(req.body)
      res.status(201).send(newUser)
    } catch (err) {
      next(err)
    }
  }
}
