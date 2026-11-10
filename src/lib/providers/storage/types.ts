import { VendorPacketRecord } from '@/lib/types';

export interface StorageProvider {
  name: string;
  savePacket(record: VendorPacketRecord): Promise<void>;
  getPacket(packetId: string): Promise<VendorPacketRecord | null>;
  storeFile(packetId: string, fileName: string, buffer: Buffer, mimeType: string): Promise<string>;
  getFile(fileKey: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null>;
  purgePacket(packetId: string): Promise<boolean>;
}
