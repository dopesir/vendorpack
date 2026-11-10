import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { getPacketRecord, savePacketRecord } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packetId, orderId, paymentId, signature, plan = 'single' } = body;

    if (!packetId || !orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters.' },
        { status: 400 }
      );
    }

    // Fail safely in production if payment secrets are unconfigured
    const isProd = process.env.NODE_ENV === 'production';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (isProd && (!keySecret || keySecret.length < 8)) {
      return NextResponse.json(
        { error: 'Production payment credentials are not configured. Safe failure triggered.' },
        { status: 500 }
      );
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature || '');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Transaction could not be verified.' },
        { status: 400 }
      );
    }

    const packet = await getPacketRecord(packetId);
    if (!packet) {
      return NextResponse.json({ error: 'Packet not found.' }, { status: 404 });
    }

    packet.isPaid = true;
    packet.paymentId = paymentId;
    packet.paymentPlan = plan;
    packet.paidAt = new Date().toISOString();

    await savePacketRecord(packet);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Unwatermarked corporate pack unlocked.',
      packetId: packet.id,
      isPaid: true
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
