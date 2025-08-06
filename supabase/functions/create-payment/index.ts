import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, amount, description } = await req.json()

    // MercadoPago configuration
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MercadoPago access token not configured')
    }

    // Create preference
    const preference = {
      items: [
        {
          title: description,
          unit_price: amount,
          quantity: 1,
        }
      ],
      back_urls: {
        success: `${Deno.env.get('SITE_URL')}/payment/success`,
        failure: `${Deno.env.get('SITE_URL')}/payment/failure`,
        pending: `${Deno.env.get('SITE_URL')}/payment/pending`
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference)
    })

    if (!response.ok) {
      throw new Error(`MercadoPago API error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({ 
        preferenceId: data.id,
        initPoint: data.init_point 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})