'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Trash2,
  Settings,
  Layers,
  Sparkles,
  Loader2,
  User,
  Mail,
  Phone,
  Eye,
  Building
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VendorPacketRecord, DocumentType } from '@/lib/types';

interface DocumentOrderItem {
  id: string;
  fileName: string;
  detectedType: DocumentType;
  isExcluded: boolean;
  order: number;
}

export default function PackBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const packetId = params.packetId as string;

  const [packet, setPacket] = useState<VendorPacketRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Customizer state
  const [displayNameType, setDisplayNameType] = useState<'legal' | 'trade'>('legal');
  const [signatoryName, setSignatoryName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [documentsOrder, setDocumentsOrder] = useState<DocumentOrderItem[]>([]);

  useEffect(() => {
    async function fetchPacket() {
      try {
        const res = await fetch(`/api/packet/${packetId}`);
        const data = await res.json();
        if (data.packet) {
          setPacket(data.packet);
          setSignatoryName(data.packet.signatoryName || '');
          setContactEmail(data.packet.contactEmail || '');
          setContactMobile(data.packet.contactMobile || '');

          const initialDocs: DocumentOrderItem[] = data.packet.documents.map((d: any, index: number) => ({
            id: d.id,
            fileName: d.fileName,
            detectedType: d.detectedType,
            isExcluded: d.isExcluded || false,
            order: index + 1
          }));
          setDocumentsOrder(initialDocs);
        }
      } catch (err) {
        console.error('Failed to load packet:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (packetId) {
      fetchPacket();
    }
  }, [packetId]);

  const moveDoc = (index: number, direction: 'up' | 'down') => {
    const newDocs = [...documentsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newDocs.length) return;

    const temp = newDocs[index];
    newDocs[index] = newDocs[targetIndex];
    newDocs[targetIndex] = temp;

    setDocumentsOrder(newDocs);
  };

  const toggleExclude = (id: string) => {
    setDocumentsOrder((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isExcluded: !doc.isExcluded } : doc))
    );
  };

  const handleGeneratePack = async () => {
    setIsGenerating(true);
    // Navigate directly to delivery & download page where user can preview and download
    router.push(`/download/${packetId}?displayName=${displayNameType}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-6 h-6 text-neutral-950 animate-spin" />
          <p className="text-xs font-mono text-neutral-500">Loading customizer...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs text-neutral-500 font-mono">Packet not found or expired.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const activeDocCount = documentsOrder.filter((d) => !d.isExcluded).length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80">
          <Link
            href={`/report/${packet.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Preflight Report</span>
          </Link>
          <span className="text-[11px] font-mono text-neutral-400">Step 02 {'//'} Dossier Customizer</span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Customize Your Vendor Document Pack
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm">
            Choose your primary header display name, reorder enclosed attachments, and compile your submission dossier.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Reorderable List & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Display Name Header Toggle */}
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider">
                <Building className="w-4 h-4 text-neutral-900" />
                <h3>01. Primary Cover Page Header Name</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  onClick={() => setDisplayNameType('legal')}
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    displayNameType === 'legal'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayName"
                    checked={displayNameType === 'legal'}
                    onChange={() => setDisplayNameType('legal')}
                    className="mt-0.5 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div>
                    <span className="font-bold text-neutral-950 block">Legal Entity Name</span>
                    <span className="text-neutral-500 text-[11px] block mt-0.5 font-mono">
                      {packet.legalName || packet.companyName}
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setDisplayNameType('trade')}
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    displayNameType === 'trade'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayName"
                    checked={displayNameType === 'trade'}
                    onChange={() => setDisplayNameType('trade')}
                    className="mt-0.5 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div>
                    <span className="font-bold text-neutral-950 block">Trade / Brand Name</span>
                    <span className="text-neutral-500 text-[11px] block mt-0.5 font-mono">
                      {packet.tradeName || 'Not Specified (Fallback to Legal)'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Reorderable Attachment List */}
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-neutral-900" />
                  <h3>02. Enclosed Attachments Order &amp; Inclusion ({activeDocCount} active)</h3>
                </div>
              </div>

              <div className="space-y-2">
                {documentsOrder.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                      doc.isExcluded
                        ? 'bg-neutral-50/50 border-neutral-200 text-neutral-400 opacity-60'
                        : 'bg-white border-neutral-200/80 text-neutral-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveDoc(idx, 'up')}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-500 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === documentsOrder.length - 1}
                          onClick={() => moveDoc(idx, 'down')}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-500 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-5 font-mono text-[11px] text-neutral-400 text-center">{idx + 1}</span>

                      <div>
                        <p className="font-semibold text-neutral-950 text-xs">{doc.fileName}</p>
                        <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200/70 inline-block mt-0.5">
                          {doc.detectedType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExclude(doc.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                          doc.isExcluded
                            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {doc.isExcluded ? 'Include' : 'Exclude'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Contact Person Details */}
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider">
                <User className="w-4 h-4 text-neutral-900" />
                <h3>03. Contact &amp; Signatory Particulars (Optional)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Authorized Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Official Email Address</label>
                  <input
                    type="email"
                    placeholder="accounts@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Mobile / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs text-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: PDF Structure Summary & Submit */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-wider">PDF Output Structure</h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-lg">
                  <p className="font-bold text-neutral-950">Page 1: Executive Profile Cover</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    Vendor identity block, PAN, GSTIN, Bank details, and Readiness Score.
                  </p>
                </div>

                <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-lg">
                  <p className="font-bold text-neutral-950">Page 2: Table of Contents</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    Numbered document list with hyperlinked page references.
                  </p>
                </div>

                <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-lg">
                  <p className="font-bold text-neutral-950">Pages 3+: Original Document Pages</p>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    Preserved high-res scans stamped with running headers &amp; page numbers.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200/70">
                <button
                  type="button"
                  disabled={isGenerating || activeDocCount === 0}
                  onClick={handleGeneratePack}
                  className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling Dossier...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Vendor Document Pack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
