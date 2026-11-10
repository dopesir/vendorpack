import { StorageProvider } from './types';
import { VendorPacketRecord } from '@/lib/types';

export class MemoryStorageProvider implements StorageProvider {
  name = 'memory';
  private packetStore: Map<string, VendorPacketRecord>;
  private fileStore: Map<string, { buffer: Buffer; mimeType: string; fileName: string }>;

  constructor() {
    this.packetStore =
      (globalThis as any).__vendorPacketStore || new Map<string, VendorPacketRecord>();
    (globalThis as any).__vendorPacketStore = this.packetStore;

    this.fileStore =
      (globalThis as any).__vendorPacketFileStore ||
      new Map<string, { buffer: Buffer; mimeType: string; fileName: string }>();
    (globalThis as any).__vendorPacketFileStore = this.fileStore;
  }

  async savePacket(record: VendorPacketRecord): Promise<void> {
    this.packetStore.set(record.id, record);
  }

  async getPacket(packetId: string): Promise<VendorPacketRecord | null> {
    const record = this.packetStore.get(packetId);
    if (!record || record.isPurged) {
      return null;
    }
    return record;
  }

  async storeFile(
    packetId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `${packetId}/${Date.now()}_${safeName}`;
    this.fileStore.set(fileKey, { buffer, mimeType, fileName });
    return fileKey;
  }

  async getFile(
    fileKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const file = this.fileStore.get(fileKey);
    return file || null;
  }

  async purgePacket(packetId: string): Promise<boolean> {
    const packet = this.packetStore.get(packetId);
    if (packet) {
      packet.isPurged = true;
      packet.pan = undefined;
      packet.gstin = undefined;
      packet.bankAccountNumber = undefined;
      packet.extractedData = { documents: [] };
      packet.validationResults = [];
      this.packetStore.set(packetId, packet);
    }

    const keysToDelete: string[] = [];
    this.fileStore.forEach((_, key) => {
      if (key.startsWith(`${packetId}/`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.fileStore.delete(key));

    return true;
  }
}
