import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, tier, attendeeName, attendeeEmail } = body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    let price: number;
    let stockField: 'generalStock' | 'vipStock' | 'premiumStock';

    switch (tier) {
      case 'general': price = event.generalPrice; stockField = 'generalStock'; break;
      case 'vip': price = event.vipPrice; stockField = 'vipStock'; break;
      case 'premium': price = event.premiumPrice; stockField = 'premiumStock'; break;
      default: return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (event[stockField] <= 0) {
      return NextResponse.json({ error: 'Sold out' }, { status: 400 });
    }

    // Create pending ticket
    const ticket = await prisma.ticket.create({
      data: {
        eventId, attendeeName, attendeeEmail, tier, price,
        qrCode: `pending-${Date.now()}`, status: 'pending',
      },
    });

    const baseUrl = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${event.name} - ${tier.toUpperCase()} Ticket` },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/scanner?success=true&ticketId=${ticket.id}`,
      cancel_url: `${baseUrl}`,
      metadata: { ticketId: ticket.id, eventId, tier, attendeeName, attendeeEmail },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed', details: error.message }, { status: 500 });
  }
}