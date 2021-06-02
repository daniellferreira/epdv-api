import { Product } from '@src/models/product'
import Stripe from 'stripe'

// ref: https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/src/serverUtil.js
export const validateCartItems = (
  inventorySrc: Product[],
  cartItems: Product[]
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
  const validatedItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  for (const cartItem of cartItems) {
    const inventoryItem = inventorySrc.find((elem) => elem.id === cartItem.id)

    if (!inventoryItem) throw new Error(`Product ${cartItem.id} not found!`)

    if (cartItem.quantity > inventoryItem.quantity) {
      throw new Error(
        `Product ${cartItem.id} quantity is greater than in inventory!`
      )
    }

    const item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: inventoryItem.currency,
        unit_amount: Math.round(inventoryItem.price * 100),
        product_data: {
          name: inventoryItem.name,
          description: inventoryItem.description || undefined,
          images: inventoryItem.images,
        },
      },
      quantity: cartItem.quantity,
    }

    validatedItems.push(item)
  }

  return validatedItems
}
