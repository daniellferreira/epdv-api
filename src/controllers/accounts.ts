import { Controller, Get, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { AccountService } from '@src/services/accounts'
import { UsersService } from '@src/services/users'

interface GetParams {
  id: string
}

@Controller('accounts')
export class AccountController {
  constructor(
    private service = new AccountService(),
    private serviceUsers = new UsersService()
  ) {}

  @Post('')
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lastAccount = await this.service.getLast()
      let nextTenantId = 1
      if (lastAccount.length > 0) {
        nextTenantId = lastAccount[0].tenantId + 1
      } else {
        nextTenantId = 1
      }

      // TODO: se der erro na criação do usuário remover account ou fazer algo para tratar
      const newAccount = await this.service.create({
        tenantId: nextTenantId,
      })

      const data = {
        ...req.body,
        isAdmin: true,
        account: newAccount.id,
      }

      const newUser = await this.serviceUsers.create(data)

      res.status(201).send(newUser)
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
      const accounts = await this.service.list()
      res.status(200).send(accounts)
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
      const account = await this.service.get(req.params.id)
      res.status(200).send(account)
    } catch (err) {
      next(err)
    }
  }
}
