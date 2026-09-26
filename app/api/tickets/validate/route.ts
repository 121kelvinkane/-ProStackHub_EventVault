import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code required' }, { status: 400 });
    }

    // ATOMIC TRANSACTION: Prevents race conditions (Duplicate ticket prevention)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find ticket
      const ticket = await tx.ticket.findUnique({
        where: { qrCode },
        include: { event: true },
      });

      if (!ticket) {
        return { success: false, message: 'Invalid ticket' };
      }

      if (ticket.status === 'used') {
        return { success: false, message: 'Ticket already used', ticket };
      }

      if (ticket.status !== 'valid') {
        return { success: false, message: 'Ticket is not valid', ticket };
      }

      // 2. Mark as used atomically (Race-condition handled!)
      await tx.ticket.update({
        where: { id: ticket.id },
        data: { status: 'used', usedAt: new Date() },
      });

      return { success: true, message: 'Access granted', ticket };
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}