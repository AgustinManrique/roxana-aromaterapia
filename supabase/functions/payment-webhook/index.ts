import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, data } = await req.json()

    if (type === 'payment') {
      const paymentId = data.id
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

      // Get payment details from MercadoPago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const payment = await paymentResponse.json()
      const orderId = payment.external_reference
      const status = payment.status

      // Update order in database
      let orderStatus = 'pending'
      let paymentStatus = 'pending'

      if (status === 'approved') {
        orderStatus = 'paid'
        paymentStatus = 'paid'
      } else if (status === 'rejected') {
        paymentStatus = 'failed'
      }

      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          status: orderStatus,
          mercadopago_payment_id: paymentId
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }

      // If payment approved, send confirmation emails
      if (status === 'approved') {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId })
        })
      }
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})