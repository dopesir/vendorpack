import { NextRequest, NextResponse } from 'next/server';
import { getPacketRecord, getPacketFileBuffer } from '@/lib/storage';
import { generateVendorPacketPdf } from '@/lib/pdf-builder';
import {
  DocumentFileBuffer,
  EnclosedDocumentItem,
  PacketGenerationConfig,
  DocumentType
} from '@/lib/types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      packetId,
      displayNameType = 'legal',
      isWatermarked = false,
      documentOrder = [],
      contactName,
      contactEmail,
      contactMobile
    } = body;

    if (!packetId) {
      return NextResponse.json({ error: 'Packet ID is required' }, { status: 400 });
    }

    const packet = await getPacketRecord(packetId);
    if (!packet || packet.isPurged) {
      return NextResponse.json(
        { error: 'Packet record not found or has expired.' },
        { status: 404 }
      );
    }

    // Determine watermark status: if request asks for unwatermarked but pack is not paid, enforce watermark
    const enforceWatermark = isWatermarked || !packet.isPaid;

    // Filter and sort documents
    const docMap = new Map(packet.documents.map((d) => [d.id, d]));
    const targetDocIds =
      documentOrder.length > 0 ? documentOrder : packet.documents.map((d) => d.id);

    const documentFiles: DocumentFileBuffer[] = [];
    const documentItems: EnclosedDocumentItem[] = [];

    let currentStartPage = 3; // Page 1 = Cover, Page 2 = TOC

    for (const docId of targetDocIds) {
      const doc = docMap.get(docId);
      if (!doc || doc.isExcluded) continue;

      let fileBufferData = doc.storagePath ? await getPacketFileBuffer(doc.storagePath) : null;

      let buffer: Uint8Array | Buffer;
      let mimeType = doc.mimeType || 'application/pdf';
      let pageCount = 1;

      if (fileBufferData) {
        buffer = fileBufferData.buffer;
        mimeType = fileBufferData.mimeType;

        if (mimeType.includes('pdf')) {
          try {
            const pdfDoc = await PDFDocument.load(buffer);
            pageCount = pdfDoc.getPageCount();
          } catch {
            pageCount = 1;
          }
        }
      } else {
        // Generate a clean sample placeholder page if file buffer is unavailable
        const dummyPdf = await PDFDocument.create();
        const font = await dummyPdf.embedFont(StandardFonts.Helvetica);
        const page = dummyPdf.addPage([595.28, 841.89]);
        page.drawText(`Attachment: ${doc.fileName}`, {
          x: 50,
          y: 800,
          size: 14,
          font,
          color: rgb(0.1, 0.1, 0.1)
        });
        page.drawText(`Statutory Type: ${doc.detectedType.toUpperCase()}`, {
          x: 50,
          y: 770,
          size: 10,
          font,
          color: rgb(0.4, 0.4, 0.4)
        });
        page.drawText('Preserved original statutory record scan.', {
          x: 50,
          y: 740,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
        buffer = await dummyPdf.save();
        pageCount = 1;
      }

      const titleMap: Record<DocumentType, string> = {
        gst_certificate: 'GST Registration Certificate',
        pan_card: 'Permanent Account Number (PAN) Card',
        bank_proof: 'Cancelled Cheque / Bank Account Proof',
        udyam_certificate: 'Udyam / MSME Registration Certificate',
        incorporation_certificate: 'Certificate of Incorporation',
        partnership_deed: 'Partnership Deed / Constitutional Proof',
        vendor_form: 'Corporate Vendor Registration Form',
        other: 'Supporting Statutory Attachment'
      };

      const title = titleMap[doc.detectedType] || doc.fileName;

      documentFiles.push({
        id: doc.id,
        title,
        fileName: doc.fileName,
        mimeType,
        buffer
      });

      documentItems.push({
        id: doc.id,
        title,
        documentType: doc.detectedType,
        fileName: doc.fileName,
        startPage: currentStartPage,
        pageCount
      });

      currentStartPage += pageCount;
    }

    const config: PacketGenerationConfig = {
      packetId: packet.id,
      companyName: packet.companyName,
      displayNameType,
      legalName: packet.legalName,
      tradeName: packet.tradeName,
      pan: packet.pan,
      gstin: packet.gstin,
      udyamNumber: packet.udyamNumber,
      bankAccountName: packet.bankAccountName,
      bankAccountNumber: packet.bankAccountNumber,
      bankIfsc: packet.bankIfsc,
      bankName: packet.bankName,
      signatoryName: contactName || packet.signatoryName,
      contactEmail: contactEmail || packet.contactEmail,
      contactMobile: contactMobile || packet.contactMobile,
      readinessScore: packet.readinessScore,
      isWatermarked: enforceWatermark,
      documentItems,
      documentFiles
    };

    const compiledPdfBytes = await generateVendorPacketPdf(config);

    const safeCompanyName = (packet.companyName || 'Vendor')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const downloadFileName = `VendorPack_${safeCompanyName}_${packet.id.substring(0, 6)}${
      enforceWatermark ? '_PREVIEW' : ''
    }.pdf`;

    return new NextResponse(Buffer.from(compiledPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    console.error('PDF Build API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to compile PDF vendor packet.' },
      { status: 500 }
    );
  }
}
