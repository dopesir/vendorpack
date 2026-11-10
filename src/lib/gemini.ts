import { getAIProvider, HeuristicAIProvider } from './providers/ai';
import { DocumentExtractionResult, DocumentExtractionResultSchema, DocumentType } from './types';

export { EXTRACTION_SYSTEM_INSTRUCTION } from './providers/ai/gemini-provider';

/**
 * Universal document extraction function.
 * Automatically delegates to the active AI provider (Gemini, Groq, OpenRouter, or Heuristic).
 */
export async function extractDocumentWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<DocumentExtractionResult> {
  const provider = getAIProvider();
  return provider.extractDocument(fileBuffer, mimeType, fileName);
}

/**
 * Heuristic analyzer for testing, mock runs, and offline robustness
 */
export function generateSmartMockExtraction(fileName: string): DocumentExtractionResult {
  const heuristic = new HeuristicAIProvider();
  return heuristic.generateSmartMockExtraction(fileName);
}
