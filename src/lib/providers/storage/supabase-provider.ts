import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProvider } from './types';
import { VendorPacketRecord } from '@/lib/types';
import { MemoryStorageProvider } from './memory-provider';

export class SupabaseStorageProvider implements StorageProvider {
  name = 'supabase';
  private supabase: SupabaseClient | null = null;
  private memoryFallback: MemoryStorageProvider;

  constructor() {
    this.memoryFallback = new MemoryStorageProvider();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url.startsWith('http') && !url.includes('placeholder') && !url.includes('xyzcompany')) {
      try {
        this.supabase = createClient(url, key);
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
  }

  async savePacket(record: VendorPacketRecord): Promise<void> {
    // Always store in memory for low-latency session access
    await this.memoryFallback.savePacket(record);

    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from('packets').upsert({
        id: record.id,
        company_name: record.companyName,
        legal_name: record.legalName,
        trade_name: record.tradeName,
        pan: record.pan,
        gstin: record.gstin,
        udyam_number: record.udyamNumber,
        bank_account_name: record.bankAccountName,
        bank_account_number: record.bankAccountNumber,
        bank_ifsc: record.bankIfsc,
        bank_name: record.bankName,
        readiness_score: record.readinessScore,
        extraction_json: record.extractedData,
        validation_results: record.validationResults,
        is_paid: record.isPaid,
        payment_id: record.paymentId,
        paid_at: record.paidAt,
        is_purged: record.isPurged,
        expires_at: record.expiresAt
      });

      if (error) {
        console.warn('Supabase savePacket warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase savePacket error:', err);
    }
  }

  async getPacket(packetId: string): Promise<VendorPacketRecord | null> {
    // Check memory first
    const memoryRecord = await this.memoryFallback.getPacket(packetId);
    if (memoryRecord) {
      return memoryRecord;
    }

    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('packets')
        .select('*')
        .eq('id', packetId)
        .single();

      if (error || !data || data.is_purged) {
        return null;
      }

      const record: VendorPacketRecord = {
        id: data.id,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        companyName: data.company_name || '',
        legalName: data.legal_name,
        tradeName: data.trade_name,
        pan: data.pan,
        gstin: data.gstin,
        udyamNumber: data.udyam_number,
        bankAccountName: data.bank_account_name,
        bankAccountNumber: data.bank_account_number,
        bankIfsc: data.bank_ifsc,
        bankName: data.bank_name,
        readinessScore: data.readiness_score || 0,
        scoringBreakdown: {
          completenessScore: 35,
          consistencyScore: 25,
          bankingScore: 20,
          ocrQualityScore: 10,
          totalScore: data.readiness_score || 0,
          scoreBand: data.readiness_score >= 85 ? 'Submission-Ready' : data.readiness_score >= 65 ? 'Review Advised' : 'Action Required',
          scoreSummary: 'Retrieved packet'
        },
        extractedData: data.extraction_json || { documents: [] },
        validationResults: data.validation_results || [],
        documents: [],
        isPaid: data.is_paid || false,
        paymentId: data.payment_id,
        isPurged: data.is_purged || false
      };

      await this.memoryFallback.savePacket(record);
      return record;
    } catch (err) {
      console.warn('Supabase getPacket error:', err);
      return null;
    }
  }

  async storeFile(
    packetId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    const fileKey = await this.memoryFallback.storeFile(packetId, fileName, buffer, mimeType);

    if (!this.supabase) return fileKey;

    try {
      const { error } = await this.supabase.storage
        .from('vendor_packets')
        .upload(fileKey, buffer, { contentType: mimeType, upsert: true });

      if (error) {
        console.warn('Supabase file upload warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase file upload error:', err);
    }

    return fileKey;
  }

  async getFile(
    fileKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const memoryFile = await this.memoryFallback.getFile(fileKey);
    if (memoryFile) return memoryFile;

    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase.storage.from('vendor_packets').download(fileKey);
      if (error || !data) return null;

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = data.type || 'application/octet-stream';
      const fileName = fileKey.split('/').pop() || 'document';

      return { buffer, mimeType, fileName };
    } catch (err) {
      console.warn('Supabase getFile error:', err);
      return null;
    }
  }

  async purgePacket(packetId: string): Promise<boolean> {
    await this.memoryFallback.purgePacket(packetId);

    if (this.supabase) {
      try {
        const { data: files } = await this.supabase.storage.from('vendor_packets').list(packetId);
        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${packetId}/${f.name}`);
          await this.supabase.storage.from('vendor_packets').remove(filePaths);
        }

        await this.supabase
          .from('packets')
          .update({
            is_purged: true,
            pan: null,
            gstin: null,
            bank_account_number: null,
            extraction_json: {},
            validation_results: []
          })
          .eq('id', packetId);
      } catch (err) {
        console.warn('Supabase purge error:', err);
      }
    }

    return true;
  }
}
