import { NextRequest, NextResponse } from 'next/server';
import { extractDocumentWithGemini } from '@/lib/gemini';
import { runPreflightChecks } from '@/lib/validation';
import { calculateReadinessScore } from '@/lib/scoring';
import { savePacketRecord, storePacketFile } from '@/lib/storage';
import { AggregatedExtractedData, VendorPacketRecord, DocumentType } from '@/lib/types';

export const maxDuration = 60; // 60s timeout for vision parsing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 statutory documents are required for a preflight check.' },
        { status: 400 }
      );
    }

    if (files.length > 8) {
      return NextResponse.json(
        { error: 'Maximum 8 documents allowed in a single vendor pack.' },
        { status: 400 }
      );
    }

    const packetId = `vp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const extractedDocs = [];
    const aggregatedData: AggregatedExtractedData = {
      documents: []
    };

    // Process each uploaded document
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size (15MB max)
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 15MB size limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'application/pdf';

      // Binary magic byte validation for uploaded statutory records
      if (buffer.length < 4) {
        return NextResponse.json(
          { error: `File "${file.name}" is corrupted or empty.` },
          { status: 400 }
        );
      }
      const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
      const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47; // \x89PNG
      if (!isPdf && !isJpg && !isPng) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid PDF or image file (magic bytes mismatch).` },
          { status: 400 }
        );
      }

      // Save file in private storage
      const storagePath = await storePacketFile(packetId, file.name, buffer, mimeType);

      // Extract document using Gemini Flash
      const extraction = await extractDocumentWithGemini(buffer, mimeType, file.name);
      extractedDocs.push({
        id: extraction.documentId,
        fileName: file.name,
        fileSize: file.size,
        mimeType,
        detectedType: extraction.detectedType,
        typeConfidence: extraction.typeConfidence,
        displayOrder: i + 1,
        isExcluded: false,
        storagePath,
        extraction
      });

      // Merge into aggregated record
      aggregatedData.documents.push({
        id: extraction.documentId,
        fileName: file.name,
        type: extraction.detectedType,
        confidence: extraction.typeConfidence,
        issues: extraction.readabilityIssues,
        isExcluded: false,
        displayOrder: i + 1
      });

      // Prefer highest confidence fields
      const data = extraction.extractedData;
      if (data.legalName?.value && (!aggregatedData.legalName || data.legalName.confidence > 0.8)) {
        aggregatedData.legalName = data.legalName.value;
      }
      if (data.tradeName?.value && (!aggregatedData.tradeName || data.tradeName.confidence > 0.8)) {
        aggregatedData.tradeName = data.tradeName.value;
      }
      if (data.gstin?.value && (!aggregatedData.gstin || data.gstin.confidence > 0.8)) {
        aggregatedData.gstin = data.gstin.value;
      }
      if (data.pan?.value && (!aggregatedData.pan || data.pan.confidence > 0.8)) {
        aggregatedData.pan = data.pan.value;
      }
      if (data.udyamNumber?.value) {
        aggregatedData.udyamNumber = data.udyamNumber.value;
      }
      if (data.msmeCategory?.value) {
        aggregatedData.msmeCategory = data.msmeCategory.value;
      }
      if (data.bankDetails) {
        if (data.bankDetails.accountHolderName?.value) {
          aggregatedData.bankAccountName = data.bankDetails.accountHolderName.value;
          aggregatedData.isPrePrintedCheque = data.bankDetails.accountHolderName.isPrePrinted;
        }
        if (data.bankDetails.accountNumber?.value) {
          aggregatedData.bankAccountNumber = data.bankDetails.accountNumber.value;
        }
        if (data.bankDetails.ifsc?.value) {
          aggregatedData.bankIfsc = data.bankDetails.ifsc.value;
        }
        if (data.bankDetails.bankName?.value) {
          aggregatedData.bankName = data.bankDetails.bankName.value;
        }
        aggregatedData.bankDetails = {
          accountHolderName: data.bankDetails.accountHolderName?.value || undefined,
          accountNumber: data.bankDetails.accountNumber?.value || undefined,
          ifsc: data.bankDetails.ifsc?.value || undefined,
          bankName: data.bankDetails.bankName?.value || undefined,
          isPrePrinted: data.bankDetails.accountHolderName?.isPrePrinted
        };
      }
      if (data.address?.fullAddress && !aggregatedData.address) {
        aggregatedData.address = data.address.fullAddress;
        aggregatedData.city = data.address.city;
        aggregatedData.state = data.address.state;
        aggregatedData.pincode = data.address.pincode;
      }
    }

    aggregatedData.companyName =
      aggregatedData.legalName || aggregatedData.tradeName || 'Business Entity';

    // Run deterministic validation rules
    const validationResults = runPreflightChecks(aggregatedData);

    // Compute transparent readiness score
    const scoringBreakdown = calculateReadinessScore(aggregatedData, validationResults);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const record: VendorPacketRecord = {
      id: packetId,
      createdAt: now.toISOString(),
      expiresAt,
      companyName: aggregatedData.companyName,
      legalName: aggregatedData.legalName,
      tradeName: aggregatedData.tradeName,
      pan: aggregatedData.pan,
      gstin: aggregatedData.gstin,
      udyamNumber: aggregatedData.udyamNumber,
      bankAccountName: aggregatedData.bankAccountName,
      bankAccountNumber: aggregatedData.bankAccountNumber,
      bankIfsc: aggregatedData.bankIfsc,
      bankName: aggregatedData.bankName,
      readinessScore: scoringBreakdown.totalScore,
      scoringBreakdown,
      extractedData: aggregatedData,
      validationResults,
      documents: extractedDocs.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        detectedType: d.detectedType,
        typeConfidence: d.typeConfidence,
        displayOrder: d.displayOrder,
        isExcluded: d.isExcluded,
        storagePath: d.storagePath
      })),
      isPaid: false,
      isPurged: false
    };

    await savePacketRecord(record);

    return NextResponse.json({
      success: true,
      packetId,
      companyName: record.companyName,
      readinessScore: scoringBreakdown.totalScore,
      scoringBreakdown,
      extractedData: aggregatedData,
      validationResults,
      documents: record.documents
    });
  } catch (error: any) {
    console.error('Upload & preflight error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process statutory documents.' },
      { status: 500 }
    );
  }
}
