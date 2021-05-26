import { IProductDocument, Product } from '@src/models/product'
import { UserError, UserStatusCodes } from '@src/util/errors'
import { PaginateResult } from 'mongoose'
import { SortObject } from '@src/lib/paginate'

export interface ProductsListFilter {
  account: string
  active?: boolean
}

export class ProductsService {
  public create(data: Product): Promise<Product> {
    const product = new Product(data)
    return product.save()
  }

  public async get(account: string, _id: string): Promise<Product> {
    const product = await Product.findOne({ account, _id })

    if (!product) {
      throw new UserError(
        `Record not found with id: ${_id}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    return product
  }

  public list(
    filter: ProductsListFilter,
    limit = 10,
    page = 1,
    sort: SortObject | undefined
  ): Promise<PaginateResult<IProductDocument>> {
    return Product.paginate(filter, { limit, page, sort })
  }

  // eslint-disable-next-line
  public async edit(account: string, _id: string, data: any): Promise<Product> {
    const product = await Product.findOne({ account, _id })

    Object.assign(product, data)

    return product.save()
  }
}
