import { IProductDocument, Product } from '@src/models/product'
import { UserError, UserStatusCodes } from '@src/util/errors'
import { PaginateResult, Schema, Types } from 'mongoose'
import { SortObject } from '@src/lib/paginate'

export interface ProductsListFilter {
  account: string
  active?: boolean
  id?: string | string[] | Schema.Types.ObjectId[]
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
    sort: SortObject | undefined,
    toPaginate = true
  ): Promise<PaginateResult<IProductDocument>> {
    const query: any = { ...filter }

    if (query.id) {
      if (typeof query.id === 'string') {
        if (query.id.includes(',')) {
          query.id = query.id.split(',')
        } else {
          query.id = [query.id]
        }
      }

      query._id = {
        $in: query.id.map(
          (elem: string) => new Types.ObjectId(elem.toString())
        ),
      }

      delete query.id
    }

    return Product.paginate(query, {
      limit,
      page,
      sort,
      pagination: toPaginate,
    })
  }

  // eslint-disable-next-line
  public async edit(account: string, _id: string, data: any): Promise<Product> {
    const product = await Product.findOne({ account, _id })

    Object.assign(product, data)

    return product.save()
  }
}
