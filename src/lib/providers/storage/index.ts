import { StorageProvider } from './types';
import { MemoryStorageProvider } from './memory-provider';
import { SupabaseStorageProvider } from './supabase-provider';

export * from './types';
export * from './memory-provider';
export * from './supabase-provider';

let cachedStorage: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedStorage) {
    return cachedStorage;
  }

  const requestedProvider = (process.env.DATABASE_PROVIDER || '').toLowerCase().trim();

  if (requestedProvider === 'supabase') {
    cachedStorage = new SupabaseStorageProvider();
    return cachedStorage;
  }

  if (requestedProvider === 'memory' || requestedProvider === 'ephemeral') {
    cachedStorage = new MemoryStorageProvider();
    return cachedStorage;
  }

  // AUTO-DETECTION: Check if valid Supabase credentials exist
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http') && !url.includes('placeholder') && !url.includes('xyzcompany')) {
    cachedStorage = new SupabaseStorageProvider();
    return cachedStorage;
  }

  // Default: Zero-cost, zero-setup in-memory provider
  cachedStorage = new MemoryStorageProvider();
  return cachedStorage;
}
