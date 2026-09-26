import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../lib/prisma';
import QRCode from 'qrcode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketId = session.metadata?.ticketId;

    if (!ticketId) return NextResponse.json({ error: 'No ticket ID' }, { status: 400 });

    try {
      // Generate unique QR code data
      const qrData = `EVT-${ticketId}-${Date.now()}`;
      
      // Update ticket with real QR code and mark as valid
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { qrCode: qrData, status: 'valid' },
      });

      console.log('? Ticket validated and QR generated:', ticketId);
      // TODO: Trigger Resend email with PDF here (Step 4)
    } catch (error: any) {
      console.error('Ticket creation failed:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}