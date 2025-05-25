import crypto from 'crypto'

export function verifyPaddleWebhook(payload: any, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  const calculatedSignature = hmac.digest('hex')
  return calculatedSignature === signature
}

export { verifyPaddleWebhook as verifyWebhookSignature } 