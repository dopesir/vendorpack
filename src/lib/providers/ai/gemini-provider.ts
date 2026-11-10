import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './types';
import { DocumentExtractionResult, DocumentExtractionResultSchema } from '@/lib/types';
import { HeuristicAIProvider } from './heuristic-provider';

export const EXTRACTION_SYSTEM_INSTRUCTION = `
You are an expert Indian statutory business document analyzer.
Your task is to analyze the provided image or PDF document and extract company identity, tax identifiers, banking details, and validity information with high precision.

CRITICAL RULES:
1. NEVER guess or hallucinate. If a field is blurred, absent, or unreadable, set value to null and confidence to 0.0.
2. For PAN: Must be a 10-character alphanumeric string (e.g. ABCDE1234F).
3. For GSTIN: Must be a 15-character string (e.g. 27ABCDE1234F1Z5).
4. For Cheques: Identify whether the account holder name is pre-printed by the bank or handwritten.
5. Classify the document type accurately into one of: 'gst_certificate', 'pan_card', 'bank_proof', 'udyam_certificate', 'incorporation_certificate', 'partnership_deed', 'vendor_form', 'other'.
6. Return ONLY a valid JSON object strictly conforming to the requested schema. No markdown backticks, no markdown formatting.
`;

export class GeminiAIProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private modelName: string;
  private heuristicFallback: HeuristicAIProvider;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.heuristicFallback = new HeuristicAIProvider();
  }

  async extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('AIzaSy_placeholder')) {
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const base64Data = fileBuffer.toString('base64');
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType
        }
      };

      const prompt = `Extract all statutory business fields from this Indian business document (${fileName}).
Return a JSON object with this exact structure:
{
  "detectedType": "gst_certificate" | "pan_card" | "bank_proof" | "udyam_certificate" | "incorporation_certificate" | "partnership_deed" | "vendor_form" | "other",
  "typeConfidence": number (0.0 to 1.0),
  "extractedData": {
    "legalName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "tradeName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "signatoryOrProprietorName": { "value": string | null, "confidence": number },
    "pan": { "value": string | null, "confidence": number },
    "gstin": { "value": string | null, "confidence": number },
    "udyamNumber": { "value": string | null, "confidence": number },
    "msmeCategory": { "value": "Micro" | "Small" | "Medium" | "Unknown", "confidence": number },
    "bankDetails": {
      "accountHolderName": { "value": string | null, "confidence": number, "isPrePrinted": boolean },
      "accountNumber": { "value": string | null, "confidence": number },
      "ifsc": { "value": string | null, "confidence": number },
      "bankName": { "value": string | null, "confidence": number }
    },
    "address": {
      "fullAddress": string | null,
      "city": string,
      "state": string,
      "pincode": string,
      "confidence": number
    },
    "dates": {
      "registrationDate": string | null,
      "expiryDate": string | null,
      "issueDate": string | null
    }
  },
  "readabilityIssues": string[]
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

      const validated = DocumentExtractionResultSchema.parse({
        ...parsedJson,
        originalFileName: fileName
      });

      return validated as DocumentExtractionResult;
    } catch (error) {
      console.warn(`Gemini extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }
  }
}
