import { track } from './analytics'

export type CrossSellItem = {
  productId: string
  productSlug: string
  name: string
  price: number
  imageUrl?: string | null
}

/**
 * Fires the standard GA4 add_to_cart event for a product added from one of the
 * cross-sell blocks (product page "Разом купують" or the cart drawer).
 */
export function trackCrossSellAdd(item: CrossSellItem) {
  track('add_to_cart', {
    currency: 'UAH',
    value: item.price / 100,
    item_list_name: 'cross_sell',
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        item_list_name: 'cross_sell',
        price: item.price / 100,
        quantity: 1,
      },
    ],
  })
}
