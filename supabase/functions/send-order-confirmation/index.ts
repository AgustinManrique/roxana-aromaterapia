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
    const { orderId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    const customerEmail = order.profiles?.email
    const customerName = order.profiles?.full_name || 'Cliente'

    if (!customerEmail) {
      throw new Error('Customer email not found')
    }

    // Prepare email content
    const itemsList = order.order_items
      .map(item => `• ${item.product_name} x${item.quantity} - $${item.subtotal.toLocaleString()}`)
      .join('\n')

    const deliveryInfo = order.delivery_type === 'pickup' 
      ? 'Retiro en local: Calle 136, entre 530 y 531. Número 124, La Plata'
      : `Envío a: ${order.shipping_address?.street}, ${order.shipping_address?.city}`

    const customerEmailContent = `
¡Hola ${customerName}!

¡Tu pedido ha sido confirmado! 🎉

DETALLES DEL PEDIDO:
━━━━━━━━━━━━━━━━━━━━
Número de pedido: #${order.order_number}
Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}

PRODUCTOS:
${itemsList}

ENTREGA:
${deliveryInfo}

TOTAL: $${order.total.toLocaleString()}
Estado del pago: ✅ CONFIRMADO

━━━━━━━━━━━━━━━━━━━━

Nos pondremos en contacto contigo pronto para coordinar la entrega.

¡Gracias por elegir Roxana Aromaterapia! 🌸

Saludos,
Equipo Roxana Aromaterapia
WhatsApp: +54 9 221 436 3284
`

    const adminEmailContent = `
NUEVO PEDIDO CONFIRMADO 📦

DETALLES DEL PEDIDO:
━━━━━━━━━━━━━━━━━━━━
Número: #${order.order_number}
Cliente: ${customerName}
Email: ${customerEmail}
Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}

PRODUCTOS:
${itemsList}

ENTREGA:
${deliveryInfo}
${order.shipping_address?.phone ? `Teléfono: ${order.shipping_address.phone}` : ''}

PAGO:
Método: MercadoPago
Estado: ✅ CONFIRMADO
Total: $${order.total.toLocaleString()}

${order.notes ? `NOTAS DEL CLIENTE:\n${order.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━
Accede al panel de administración para gestionar este pedido.
`

    // Send emails using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    // Send customer confirmation email
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Roxana Aromaterapia <noreply@roxanaaromaterapia.com>',
        to: [customerEmail],
        subject: `¡Pedido confirmado! #${order.order_number} - Roxana Aromaterapia`,
        text: customerEmailContent,
      }),
    })

    // Send admin notification email
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sistema Roxana Aromaterapia <sistema@roxanaaromaterapia.com>',
        to: ['roxanaaromaterapia@gmail.com'],
        subject: `🔔 Nuevo pedido confirmado #${order.order_number}`,
        text: adminEmailContent,
      }),
    })

    const customerResult = await customerEmailResponse.json()
    const adminResult = await adminEmailResponse.json()

    console.log('Customer email result:', customerResult)
    console.log('Admin email result:', adminResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        customerEmailSent: customerEmailResponse.ok,
        adminEmailSent: adminEmailResponse.ok
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending emails:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})