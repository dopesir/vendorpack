import { NextRequest, NextResponse } from 'next/server';
import { purgePacketCompletely } from '@/lib/storage';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packetId = searchParams.get('packetId');

    if (!packetId) {
      return NextResponse.json({ error: 'Packet ID is required' }, { status: 400 });
    }

    await purgePacketCompletely(packetId);

    return NextResponse.json({
      success: true,
      message: 'All uploaded documents and preflight records have been permanently purged.'
    });
  } catch (error: any) {
    console.error('Purge packet error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to purge packet data.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packetId } = body;

    if (!packetId) {
      return NextResponse.json({ error: 'Packet ID is required' }, { status: 400 });
    }

    await purgePacketCompletely(packetId);

    return NextResponse.json({
      success: true,
      message: 'All uploaded documents and preflight records have been permanently purged.'
    });
  } catch (error: any) {
    console.error('Purge packet error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to purge packet data.' },
      { status: 500 }
    );
  }
}
