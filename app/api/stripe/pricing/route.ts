import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function GET() {
  const priceIds = {
    pro_month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    pro_year: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    basic_month: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    basic_year: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
    enterprise_month: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    enterprise_year: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  }
  const prices: any = {}
  for (const [key, id] of Object.entries(priceIds)) {
    if (id) {
      try {
        const price = await stripe.prices.retrieve(id)
        prices[key] = price.unit_amount ? price.unit_amount / 100 : null
      } catch {
        prices[key] = null
      }
    } else {
      prices[key] = null
    }
  }
  return NextResponse.json(prices)
} 