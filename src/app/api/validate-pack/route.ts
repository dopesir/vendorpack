import { NextRequest, NextResponse } from 'next/server';
import { runPreflightChecks } from '@/lib/validation';
import { calculateReadinessScore } from '@/lib/scoring';
import { savePacketRecord, getPacketRecord } from '@/lib/storage';
import { AggregatedExtractedData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packetId, extractedData } = body as {
      packetId: string;
      extractedData: AggregatedExtractedData;
    };

    if (!extractedData) {
      return NextResponse.json({ error: 'Extracted data is required for validation.' }, { status: 400 });
    }

    const validationResults = runPreflightChecks(extractedData);
    const scoringBreakdown = calculateReadinessScore(extractedData, validationResults);

    if (packetId) {
      const packet = await getPacketRecord(packetId);
      if (packet) {
        packet.extractedData = extractedData;
        packet.validationResults = validationResults;
        packet.readinessScore = scoringBreakdown.totalScore;
        packet.scoringBreakdown = scoringBreakdown;
        if (extractedData.companyName) packet.companyName = extractedData.companyName;
        if (extractedData.legalName) packet.legalName = extractedData.legalName;
        if (extractedData.tradeName) packet.tradeName = extractedData.tradeName;
        if (extractedData.gstin) packet.gstin = extractedData.gstin;
        if (extractedData.pan) packet.pan = extractedData.pan;
        if (extractedData.udyamNumber) packet.udyamNumber = extractedData.udyamNumber;
        if (extractedData.bankAccountName) packet.bankAccountName = extractedData.bankAccountName;
        if (extractedData.bankAccountNumber) packet.bankAccountNumber = extractedData.bankAccountNumber;
        if (extractedData.bankIfsc) packet.bankIfsc = extractedData.bankIfsc;
        await savePacketRecord(packet);
      }
    }

    return NextResponse.json({
      success: true,
      validationResults,
      scoringBreakdown
    });
  } catch (err: any) {
    console.error('Validation API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to validate pack' }, { status: 500 });
  }
}
