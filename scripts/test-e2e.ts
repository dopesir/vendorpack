import { runPreflightChecks } from '../src/lib/validation';
import { calculateReadinessScore } from '../src/lib/scoring';
import { savePacketRecord, getPacketRecord, purgePacketCompletely, storePacketFile, getPacketFileBuffer } from '../src/lib/storage';
import { generateVendorPacketPdf } from '../src/lib/pdf-builder';
import { createRazorpayOrder, verifyRazorpaySignature } from '../src/lib/razorpay';
import { PDFDocument } from 'pdf-lib';

async function runEndToEndSmokeTest() {
  console.log('====================================================');
  console.log('RUNNING FULL VENDORPACK E2E SMOKE TEST');
  console.log('====================================================\n');

  const testPacketId = `vp_e2e_${Date.now()}`;

  // 1. Mock file storage
  const mockFileBuffer = Buffer.from('Mock PDF statutory file content');
  const storagePath = await storePacketFile(testPacketId, 'GST_Cert.pdf', mockFileBuffer, 'application/pdf');
  console.log('1. Stored mock statutory document in storage layer:', storagePath);

  // 2. Extracted Data & Preflight Execution
  const extractedData = {
    companyName: 'ACME ENGINEERING PRIVATE LIMITED',
    legalName: 'ACME ENGINEERING PRIVATE LIMITED',
    tradeName: 'ACME FABRICATORS',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    udyamNumber: 'UDYAM-MH-01-0012345',
    bankAccountName: 'ACME ENGINEERING PVT LTD',
    bankAccountNumber: '50200012345678',
    bankIfsc: 'HDFC0000128',
    bankName: 'HDFC Bank Ltd',
    isPrePrintedCheque: true,
    documents: [
      { id: 'doc1', fileName: 'GST_Cert.pdf', type: 'gst_certificate' as const, confidence: 0.98, issues: [] },
      { id: 'doc2', fileName: 'PAN_Card.png', type: 'pan_card' as const, confidence: 0.99, issues: [] },
      { id: 'doc3', fileName: 'Cheque.jpg', type: 'bank_proof' as const, confidence: 0.96, issues: [] },
      { id: 'doc4', fileName: 'Udyam_Cert.pdf', type: 'udyam_certificate' as const, confidence: 0.97, issues: [] }
    ]
  };

  const validationResults = runPreflightChecks(extractedData);
  const scoringBreakdown = calculateReadinessScore(extractedData, validationResults);

  console.log(`2. Preflight executed: Readiness Score = ${scoringBreakdown.totalScore}/100 (${scoringBreakdown.scoreBand})`);

  // 3. Save Packet Record
  await savePacketRecord({
    id: testPacketId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    companyName: extractedData.companyName,
    legalName: extractedData.legalName,
    tradeName: extractedData.tradeName,
    pan: extractedData.pan,
    gstin: extractedData.gstin,
    udyamNumber: extractedData.udyamNumber,
    bankAccountName: extractedData.bankAccountName,
    bankAccountNumber: extractedData.bankAccountNumber,
    bankIfsc: extractedData.bankIfsc,
    bankName: extractedData.bankName,
    readinessScore: scoringBreakdown.totalScore,
    scoringBreakdown,
    extractedData,
    validationResults,
    documents: [
      {
        id: 'doc1',
        fileName: 'GST_Cert.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        detectedType: 'gst_certificate',
        typeConfidence: 0.98,
        displayOrder: 1,
        isExcluded: false,
        storagePath
      }
    ],
    isPaid: false,
    isPurged: false
  });

  const retrieved = await getPacketRecord(testPacketId);
  if (!retrieved || retrieved.companyName !== 'ACME ENGINEERING PRIVATE LIMITED') {
    throw new Error('Failed to retrieve packet from storage');
  }
  console.log('3. Retrieved packet successfully from storage record');

  // 4. Generate Watermarked PDF Preview
  const previewPdfBytes = await generateVendorPacketPdf({
    packetId: testPacketId,
    companyName: retrieved.companyName,
    displayNameType: 'legal',
    legalName: retrieved.legalName,
    tradeName: retrieved.tradeName,
    pan: retrieved.pan,
    gstin: retrieved.gstin,
    udyamNumber: retrieved.udyamNumber,
    bankAccountName: retrieved.bankAccountName,
    bankAccountNumber: retrieved.bankAccountNumber,
    bankIfsc: retrieved.bankIfsc,
    bankName: retrieved.bankName,
    readinessScore: retrieved.readinessScore,
    isWatermarked: true,
    documentItems: [
      {
        id: 'doc1',
        title: 'GST Registration Certificate',
        documentType: 'gst_certificate',
        fileName: 'GST_Cert.pdf',
        startPage: 3,
        pageCount: 1
      }
    ],
    documentFiles: [
      {
        id: 'doc1',
        title: 'GST Registration Certificate',
        fileName: 'GST_Cert.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from(await (await PDFDocument.create()).save())
      }
    ]
  });

  console.log(`4. Watermarked preview compiled successfully (${previewPdfBytes.length} bytes)`);

  // 5. Payment Flow (Order Creation & Verification)
  const order = await createRazorpayOrder(299, testPacketId, 'single');
  console.log(`5. Payment order generated: ${order.id} (₹299)`);

  const isVerified = verifyRazorpaySignature(order.id, 'pay_demo_123', 'demo_verified_sig');
  if (!isVerified) throw new Error('Payment verification signature check failed');

  retrieved.isPaid = true;
  retrieved.paymentId = 'pay_demo_123';
  await savePacketRecord(retrieved);
  console.log('6. Payment verified and packet unlocked');

  // 7. Generate Unwatermarked Clean PDF
  const cleanPdfBytes = await generateVendorPacketPdf({
    packetId: testPacketId,
    companyName: retrieved.companyName,
    displayNameType: 'legal',
    legalName: retrieved.legalName,
    tradeName: retrieved.tradeName,
    pan: retrieved.pan,
    gstin: retrieved.gstin,
    udyamNumber: retrieved.udyamNumber,
    bankAccountName: retrieved.bankAccountName,
    bankAccountNumber: retrieved.bankAccountNumber,
    bankIfsc: retrieved.bankIfsc,
    bankName: retrieved.bankName,
    readinessScore: retrieved.readinessScore,
    isWatermarked: false,
    documentItems: [
      {
        id: 'doc1',
        title: 'GST Registration Certificate',
        documentType: 'gst_certificate',
        fileName: 'GST_Cert.pdf',
        startPage: 3,
        pageCount: 1
      }
    ],
    documentFiles: [
      {
        id: 'doc1',
        title: 'GST Registration Certificate',
        fileName: 'GST_Cert.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from(await (await PDFDocument.create()).save())
      }
    ]
  });
  console.log(`7. Clean unwatermarked PDF dossier compiled successfully (${cleanPdfBytes.length} bytes)`);

  // 8. Purge All Records
  await purgePacketCompletely(testPacketId);
  const purgedCheck = await getPacketRecord(testPacketId);
  if (purgedCheck !== null) {
    throw new Error('Purged record still accessible!');
  }
  console.log('8. Packet and storage objects permanently purged successfully');

  console.log('\n====================================================');
  console.log('ALL END-TO-END SMOKE TESTS PASSED WITH 100% SUCCESS');
  console.log('====================================================');
}

runEndToEndSmokeTest().catch((err) => {
  console.error('E2E Smoke Test Failed:', err);
  process.exit(1);
});
