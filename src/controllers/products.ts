import { ClassMiddleware, Controller, Get, Post, Put } from '@overnightjs/core'
import { NextFunction, Request, Response } from 'express'
import { ProductsService } from '@src/services/products'
import { authMiddleware } from '@src/middlewares/auth'

interface GetParams {
  id: string
  email: string
}

@ClassMiddleware(authMiddleware)
@Controller('products')
export class ProductController {
  constructor(private service = new ProductsService()) {}

  @Post('')
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await this.service.create({
        ...req.body,
        account: req.decoded?.user.account,
      })

      res.status(201).send(product)
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
      const product = await this.service.get(
        req.decoded?.user.account,
        req.params.id
      )

      res.status(200).send(product)
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
      const products = await this.service.list(req.decoded?.user.account)

      res.status(200).send(products)
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
      const product = await this.service.edit(
        req.decoded?.user.account,
        req.params.id,
        req.body
      )

      res.status(200).send(product)
    } catch (err) {
      next(err)
    }
  }
}
