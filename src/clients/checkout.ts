import Stripe from 'stripe'
import { config } from '@src/services/config'

export class CheckoutClient {
  constructor(
    protected readonly stripe = new Stripe(config.checkout.apiKey, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      apiVersion: config.checkout.apiVersion,
    })
  ) {}

  public create(
    params: Stripe.Checkout.SessionCreateParams
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create(params)
  }

  public get(id: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(id, {
      expand: ['payment_intent'],
    })
  }
}
