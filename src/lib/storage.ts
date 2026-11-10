import { getStorageProvider } from './providers/storage';
import { VendorPacketRecord } from './types';

export { getStorageProvider } from './providers/storage';

export async function savePacketRecord(record: VendorPacketRecord): Promise<void> {
  const provider = getStorageProvider();
  return provider.savePacket(record);
}

export async function getPacketRecord(packetId: string): Promise<VendorPacketRecord | null> {
  const provider = getStorageProvider();
  return provider.getPacket(packetId);
}

export async function storePacketFile(
  packetId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const provider = getStorageProvider();
  return provider.storeFile(packetId, fileName, buffer, mimeType);
}

export async function getPacketFileBuffer(
  fileKey: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
  const provider = getStorageProvider();
  return provider.getFile(fileKey);
}

export async function purgePacketCompletely(packetId: string): Promise<boolean> {
  const provider = getStorageProvider();
  return provider.purgePacket(packetId);
}
