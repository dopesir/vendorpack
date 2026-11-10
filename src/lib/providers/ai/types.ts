import { DocumentExtractionResult } from '@/lib/types';

export interface AIProvider {
  name: string;
  extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult>;
}
