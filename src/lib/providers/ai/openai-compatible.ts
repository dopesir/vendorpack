import { AIProvider } from './types';
import { DocumentExtractionResult, DocumentExtractionResultSchema } from '@/lib/types';
import { HeuristicAIProvider } from './heuristic-provider';

export interface OpenAICompatibleConfig {
  name?: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export class OpenAICompatibleAIProvider implements AIProvider {
  name: string;
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private heuristicFallback: HeuristicAIProvider;

  constructor(config?: OpenAICompatibleConfig) {
    this.name = config?.name || 'openai-compatible';
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || '';
    this.baseURL = config?.baseURL || process.env.OPENAI_BASE_URL || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1');
    this.model = config?.model || process.env.OPENAI_MODEL || (process.env.GROQ_API_KEY ? 'llama-3.2-11b-vision-preview' : 'meta-llama/llama-3.2-11b-vision-instruct:free');
    this.heuristicFallback = new HeuristicAIProvider();
  }

  async extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }

    try {
      const base64Data = fileBuffer.toString('base64');
      const dataUri = `data:${mimeType.includes('pdf') ? 'application/pdf' : mimeType};base64,${base64Data}`;

      const prompt = `You are an expert Indian statutory business document analyzer.
Extract all statutory business fields from this Indian business document (${fileName}).
CRITICAL RULES:
1. NEVER guess or hallucinate. If absent, set value to null and confidence to 0.0.
2. For PAN: 10-character alphanumeric (e.g. ABCDE1234F).
3. For GSTIN: 15-character string (e.g. 27ABCDE1234F1Z5).
4. Classify document into: 'gst_certificate', 'pan_card', 'bank_proof', 'udyam_certificate', 'incorporation_certificate', 'partnership_deed', 'vendor_form', 'other'.
5. Return strictly valid JSON conforming to:
{
  "detectedType": "gst_certificate" | "pan_card" | "bank_proof" | "udyam_certificate" | "incorporation_certificate" | "partnership_deed" | "vendor_form" | "other",
  "typeConfidence": number (0.0 to 1.0),
  "extractedData": {
    "legalName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "tradeName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "pan": { "value": string | null, "confidence": number },
    "gstin": { "value": string | null, "confidence": number },
    "udyamNumber": { "value": string | null, "confidence": number },
    "bankDetails": {
      "accountHolderName": { "value": string | null, "confidence": number, "isPrePrinted": boolean },
      "accountNumber": { "value": string | null, "confidence": number },
      "ifsc": { "value": string | null, "confidence": number },
      "bankName": { "value": string | null, "confidence": number }
    }
  },
  "readabilityIssues": string[]
}`;

      const res = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUri } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI-compatible vision API error ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const parsedJson = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());

      const validated = DocumentExtractionResultSchema.parse({
        ...parsedJson,
        originalFileName: fileName
      });

      return validated as DocumentExtractionResult;
    } catch (error) {
      console.warn(`OpenAI-compatible extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }
  }
}
