import { Controller, Get, Post } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { AccountService } from '@src/services/accounts'
import { UsersService } from '@src/services/users'

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
      const account = await this.service.getLast()
      let nextTenantId = ''
      if (account.length > 0) {
        nextTenantId = String(Number(account[0].tenantId) + 1)
      } else {
        nextTenantId = '1'
      }

      const data = { ...req.body, tenantId: nextTenantId, isAdmin: true }
      const newUser = await this.serviceUsers.create(data)

      const newAccount = await this.service.create({
        tenantId: nextTenantId,
      })

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

  @Get('last')
  public async last(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const account = await this.service.getLast()
      res.status(200).send(account)
    } catch (err) {
      next(err)
    }
  }
}
