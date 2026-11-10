import { NextRequest, NextResponse } from 'next/server';
import { getPacketRecord } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { packetId: string } }
) {
  const { packetId } = params;
  if (!packetId) {
    return NextResponse.json({ error: 'Packet ID is required' }, { status: 400 });
  }

  const packet = await getPacketRecord(packetId);
  if (!packet || packet.isPurged) {
    return NextResponse.json({ error: 'Vendor packet not found or has been deleted.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    packet
  });
}
