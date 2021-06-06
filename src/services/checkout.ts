import { CheckoutClient } from '@src/clients/checkout'
import { validateCartItems } from '@src/lib/validateCartItems'
import { Product } from '@src/models/product'
import { UserError, UserStatusCodes } from '@src/util/errors'
import Stripe from 'stripe'
import { ProductsService } from './products'
import util from 'util'

interface CreateParams {
  cart_items: Product[]
  success_url: string
  cancel_url: string
}

export class CheckoutService {
  constructor(
    protected readonly client = new CheckoutClient(),
    protected readonly productService = new ProductsService()
  ) {}

  public async create(
    account: string,
    { cart_items, success_url, cancel_url }: CreateParams
  ): Promise<Stripe.Checkout.Session> {
    const itemsIds = cart_items.map((elem) => elem.id) as string[]

    const products = await this.productService.list(
      { id: itemsIds, account },
      undefined,
      undefined,
      undefined,
      false
    )

    if (products.docs.length < 1) {
      throw new UserError(
        `Product not found with id ${itemsIds.join(', ')}`,
        UserStatusCodes.NotFound,
        'RECORD_NOTFOUND'
      )
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      submit_type: 'pay',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
      line_items: validateCartItems(products.docs, cart_items),
      success_url,
      cancel_url,
      metadata: {
        account_id: account.toString(),
      },
      mode: 'payment',
      locale: 'pt-BR',
    }

    return this.client.create(params)
  }

  public async get(
    account: string,
    id: string
  ): Promise<Stripe.Checkout.Session | null> {
    const checkout = await this.client.get(id)

    if (checkout.metadata && checkout.metadata.account_id === account) {
      return checkout
    }

    return null
  }
}
