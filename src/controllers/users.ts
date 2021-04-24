import { Controller, Get, Post, Put } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UsersService } from '@src/services/users'

interface GetParams {
  id: string
  email: string
}

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

  @Get(':id')
  public async get(
    req: Request<GetParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.service.get(req.params.id)
      res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  }

  @Get(':email')
  public async getByEmail(
    req: Request<GetParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.service.getByEmail(req.params.email)
      res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  }

  @Get('')
  public async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await this.service.list()
      res.status(200).send(users)
    } catch (err) {
      next(err)
    }
  }

  @Put(':id')
  public async edit(
    req: Request<GetParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.service.edit(req.params.id, req.body)
      res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  }
}
