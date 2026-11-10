import { AIProvider } from './types';
import { DocumentExtractionResult, DocumentType } from '@/lib/types';

export class HeuristicAIProvider implements AIProvider {
  name = 'heuristic';

  async extractDocument(
    _fileBuffer: Buffer,
    _mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    return this.generateSmartMockExtraction(fileName);
  }

  generateSmartMockExtraction(fileName: string): DocumentExtractionResult {
    const lower = fileName.toLowerCase();
    const docId = Math.random().toString(36).substring(2, 9);

    let detectedType: DocumentType = 'other';
    const typeConfidence = 0.95;

    if (lower.includes('gst') || lower.includes('tax') || lower.includes('reg')) {
      detectedType = 'gst_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.98, rawTextSnippet: 'Legal Name: ACME ENGINEERING PRIVATE LIMITED' },
          tradeName: { value: 'ACME FABRICATORS', confidence: 0.95, rawTextSnippet: 'Trade Name: ACME FABRICATORS' },
          gstin: { value: '27AABCU9603R1ZM', confidence: 0.99, rawTextSnippet: 'GSTIN: 27AABCU9603R1ZM' },
          pan: { value: 'AABCU9603R', confidence: 0.98, rawTextSnippet: 'PAN: AABCU9603R' },
          address: {
            fullAddress: 'Plot 42, MIDC Industrial Area, Phase II, Pune 411018, Maharashtra',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411018',
            confidence: 0.94
          },
          dates: {
            registrationDate: '01/07/2017',
            issueDate: '05/08/2017'
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('pan')) {
      detectedType = 'pan_card';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.98,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.96, rawTextSnippet: 'Name: ACME ENGINEERING PRIVATE LIMITED' },
          pan: { value: 'AABCU9603R', confidence: 0.99, rawTextSnippet: 'Permanent Account Number: AABCU9603R' },
          dates: {
            issueDate: '14/03/2015'
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('cheque') || lower.includes('bank') || lower.includes('passbook')) {
      detectedType = 'bank_proof';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.96,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PVT LTD', confidence: 0.94 },
          bankDetails: {
            accountHolderName: { value: 'ACME ENGINEERING PVT LTD', confidence: 0.96, isPrePrinted: true },
            accountNumber: { value: '50200012345678', confidence: 0.98 },
            ifsc: { value: 'HDFC0000128', confidence: 0.99 },
            bankName: { value: 'HDFC Bank Ltd', confidence: 0.95 }
          },
          address: {
            fullAddress: 'HDFC Bank, FC Road Branch, Pune 411004',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411004',
            confidence: 0.9
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('udyam') || lower.includes('msme')) {
      detectedType = 'udyam_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.97,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.96 },
          tradeName: { value: 'ACME FABRICATORS', confidence: 0.94 },
          udyamNumber: { value: 'UDYAM-MH-01-0012345', confidence: 0.99 },
          msmeCategory: { value: 'Small', confidence: 0.95 },
          address: {
            fullAddress: 'Plot 42, MIDC Industrial Area, Pune 411018',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411018',
            confidence: 0.92
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('coi') || lower.includes('incorporation') || lower.includes('deed')) {
      detectedType = 'incorporation_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.92,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.95 },
          dates: {
            registrationDate: '12/02/2015'
          }
        },
        readabilityIssues: []
      };
    }

    return {
      documentId: docId,
      originalFileName: fileName,
      detectedType: 'other',
      typeConfidence: 0.7,
      extractedData: {
        legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.8 }
      },
      readabilityIssues: ['Document type could not be strictly classified as statutory proof.']
    };
  }
}
