import { Product } from '@src/models/product'
import { UserError, UserStatusCodes } from '@src/util/errors'

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

  public list(account: string): Promise<Product[]> {
    return Product.find({ account })
  }

  // eslint-disable-next-line
  public async edit(account: string, _id: string, data: any): Promise<Product> {
    const product = await Product.findOne({ account, _id })

    if (!product) {
      throw new UserError(
        `Record not found with id: ${_id}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    Object.assign(product, data)

    return product.save()
  }
}
