import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const qrCode = body.qrCode;

    if (!qrCode) {
      return NextResponse.json({ success: false, message: 'No QR code provided' }, { status: 400 });
    }

    // ATOMIC UPDATE: Prevents race conditions
    const updatedTicket = await prisma.ticket.updateMany({
      where: {
        qrCode: qrCode,
        status: 'VALID', 
      },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });

    if (updatedTicket.count === 0) {
      const existingTicket = await prisma.ticket.findUnique({
        where: { qrCode },
      });

      if (!existingTicket) {
        return NextResponse.json({ success: false, message: 'Invalid ticket' }, { status: 404 });
      }
      
      if (existingTicket.status === 'USED') {
        return NextResponse.json({ success: false, message: 'Ticket already used' }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ticket validated successfully!' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Validation API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    }, { status: 500 });
  }
}