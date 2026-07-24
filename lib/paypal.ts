// lib/paypal.ts
//deliberate
// Minimal PayPal REST API wrapper -- deliberately uses plain fetch rather
// than a heavy SDK, since PayPal's own Node SDK has been in a confusing
// state (checkout-server-sdk is legacy; the newer server-sdk is still
// maturing). The REST API itself is stable and well documented, so this
// is the more future-proof choice.
//
// Env vars needed:
//   PAYPAL_CLIENT_ID
//   PAYPAL_CLIENT_SECRET
//   PAYPAL_ENV            'sandbox' | 'live'  (defaults to 'sandbox')
//   PAYPAL_WEBHOOK_ID      from the webhook you create in the PayPal
//                          developer dashboard, needed to verify webhook
//                          signatures

function apiBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) throw new Error('PayPal is not configured (missing client id/secret).')

  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.access_token as string
}

export type CreateOrderParams = {
  amountCents: number
  description: string
  customId: string // compact metadata string, PayPal allows up to 127 chars
  returnUrl: string
  cancelUrl: string
}

export async function createOrder(params: CreateOrderParams): Promise<{ id: string; approveUrl: string }> {
  const token = await getAccessToken()
  const value = (params.amountCents / 100).toFixed(2)

  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: params.customId,
          description: params.description,
          amount: { currency_code: 'USD', value },
        },
      ],
      application_context: {
        brand_name: 'RooferNet',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal order creation failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const approveUrl = data.links?.find((l: any) => l.rel === 'approve')?.href
  if (!approveUrl) throw new Error('PayPal order created but no approval link returned.')

  return { id: data.id, approveUrl }
}

export type CaptureResult = {
  status: string // 'COMPLETED' when successful
  captureId: string | null
  payerEmail: string | null
  customId: string | null
}

export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken()

  const res = await fetch(`${apiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  // PayPal returns 422 UNPROCESSABLE_ENTITY with an ORDER_ALREADY_CAPTURED
  // issue if this order was already captured (e.g. the success page ran
  // this once already, and the webhook safety-net is now also trying).
  // Treat that as "already handled" rather than an error.
  if (!res.ok && data?.details?.[0]?.issue !== 'ORDER_ALREADY_CAPTURED') {
    throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(data)}`)
  }

  const purchaseUnit = data.purchase_units?.[0]
  const capture = purchaseUnit?.payments?.captures?.[0]

  return {
    status: data.status || capture?.status || 'UNKNOWN',
    captureId: capture?.id || null,
    payerEmail: data.payer?.email_address || null,
    customId: purchaseUnit?.custom_id || null,
  }
}

/**
 * Verifies an incoming PayPal webhook is genuinely from PayPal. Call this
 * before acting on any webhook event.
 */
export async function verifyWebhookSignature(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) throw new Error('PAYPAL_WEBHOOK_ID is not configured.')

  const token = await getAccessToken()

  const res = await fetch(`${apiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_time: headers.get('paypal-transmission-time'),
      cert_url: headers.get('paypal-cert-url'),
      auth_algo: headers.get('paypal-auth-algo'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}