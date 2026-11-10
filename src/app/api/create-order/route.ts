import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, generateUpiPaymentString } from '@/lib/razorpay';
import { getPacketRecord } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packetId, plan = 'single' } = body;

    if (!packetId) {
      return NextResponse.json({ error: 'Packet ID is required' }, { status: 400 });
    }

    const packet = await getPacketRecord(packetId);
    if (!packet || packet.isPurged) {
      return NextResponse.json({ error: 'Packet not found or expired.' }, { status: 404 });
    }

    const priceSingle = parseInt(process.env.NEXT_PUBLIC_PRICE_SINGLE || '299', 10);
    const priceFivePack = parseInt(process.env.NEXT_PUBLIC_PRICE_FIVE_PACK || '799', 10);

    const amountInInr = plan === 'five_pack' ? priceFivePack : priceSingle;

    const order = await createRazorpayOrder(amountInInr, packetId, plan);
    const upiPaymentString = generateUpiPaymentString(amountInInr, packetId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      amountInInr,
      plan,
      isDemoMode: order.isDemoMode,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo',
      upiPaymentString
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize payment order.' },
      { status: 500 }
    );
  }
}
