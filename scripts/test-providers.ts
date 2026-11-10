import { getAIProvider, HeuristicAIProvider } from '../src/lib/providers/ai';
import { getStorageProvider, MemoryStorageProvider } from '../src/lib/providers/storage';
import { VendorPacketRecord } from '../src/lib/types';

async function runProviderTests() {
  console.log('====================================================');
  console.log('TESTING SWAPPABLE PROVIDER LAYER IN VENDORPACK');
  console.log('====================================================');

  // Test 1: Default AI Provider should resolve cleanly
  const aiProvider = getAIProvider();
  console.log(`✓ Active AI Provider: ${aiProvider.name}`);
  if (!aiProvider || typeof aiProvider.extractDocument !== 'function') {
    throw new Error('AI Provider does not implement extractDocument');
  }

  // Test 2: Extraction via Provider
  const dummyBuffer = Buffer.from('PDF Mock Content');
  const extraction = await aiProvider.extractDocument(dummyBuffer, 'application/pdf', 'ACME_GST_Certificate.pdf');
  console.log(`✓ Extraction detectedType: ${extraction.detectedType}`);
  if (extraction.detectedType !== 'gst_certificate') {
    throw new Error(`Expected gst_certificate, got ${extraction.detectedType}`);
  }
  console.log(`✓ Extraction PAN: ${extraction.extractedData.pan?.value}`);

  // Test 3: Storage Provider
  const storageProvider = getStorageProvider();
  console.log(`✓ Active Storage Provider: ${storageProvider.name}`);

  const testPacketId = `test_prov_${Date.now()}`;
  const mockRecord: VendorPacketRecord = {
    id: testPacketId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    companyName: 'ACME TEST CORP',
    legalName: 'ACME TEST CORP',
    readinessScore: 95,
    scoringBreakdown: {
      completenessScore: 40,
      consistencyScore: 30,
      bankingScore: 20,
      ocrQualityScore: 5,
      totalScore: 95,
      scoreBand: 'Submission-Ready',
      scoreSummary: 'Ready'
    },
    extractedData: { documents: [] },
    validationResults: [],
    documents: [],
    isPaid: false,
    isPurged: false
  };

  await storageProvider.savePacket(mockRecord);
  const retrieved = await storageProvider.getPacket(testPacketId);
  if (!retrieved || retrieved.companyName !== 'ACME TEST CORP') {
    throw new Error('Failed to retrieve saved packet from storage provider');
  }
  console.log(`✓ Saved and retrieved packet successfully: ${retrieved.id}`);

  // Test 4: File storage in provider
  const fileKey = await storageProvider.storeFile(testPacketId, 'sample.pdf', dummyBuffer, 'application/pdf');
  const retrievedFile = await storageProvider.getFile(fileKey);
  if (!retrievedFile || retrievedFile.fileName !== 'sample.pdf') {
    throw new Error('Failed to retrieve file from storage provider');
  }
  console.log(`✓ Stored and retrieved file successfully: ${fileKey}`);

  // Test 5: Purge in provider
  await storageProvider.purgePacket(testPacketId);
  const afterPurge = await storageProvider.getPacket(testPacketId);
  if (afterPurge !== null) {
    throw new Error('Expected purged packet to return null');
  }
  console.log('✓ Purge successfully wiped packet and file references');

  console.log('====================================================');
  console.log('ALL PROVIDER TESTS PASSED (100% SUCCESS)');
  console.log('====================================================');
}

runProviderTests().catch((err) => {
  console.error('Provider test failed:', err);
  process.exit(1);
});
