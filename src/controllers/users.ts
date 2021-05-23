import { ClassMiddleware, Controller, Get, Post, Put } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { UsersListFilter, UsersService } from '@src/services/users'
import { authMiddleware } from '@src/middlewares/auth'
import { ReqListQuery, stringToSort } from '@src/lib/paginate'

interface GetParams {
  id: string
  email: string
}

interface ListParams {
  active: boolean
}

@ClassMiddleware(authMiddleware)
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
      const newUser = await this.service.create({
        ...req.body,
        ...{ account: req.decoded?.user.account },
      })
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
      const account = req.decoded?.user.account
      const user = await this.service.get(account, req.params.id)
      res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  }

  @Get('')
  public async list(
    req: Request<ListParams, null, null, ReqListQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { s, limit, page, sort, active } = req.query
      const filter: UsersListFilter = { account: req.decoded?.user.account }

      if (active != null) {
        filter.active = active
      }

      const users = await this.service.list(
        filter,
        s,
        limit,
        page,
        stringToSort(sort)
      )

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
      const account = req.decoded?.user.account
      const user = await this.service.edit(account, req.params.id, req.body)
      res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  }
}
