'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  Trash2,
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RazorpayModal } from '@/components/RazorpayModal';
import { VendorPacketRecord } from '@/lib/types';

export default function DownloadDeliveryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const packetId = params.packetId as string;
  const displayName = (searchParams.get('displayName') as 'legal' | 'trade') || 'legal';

  const [packet, setPacket] = useState<VendorPacketRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    async function fetchPacket() {
      try {
        const res = await fetch(`/api/packet/${packetId}`);
        const data = await res.json();
        if (data.packet) {
          setPacket(data.packet);
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

  const handleDownloadPdf = async (watermarked: boolean) => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/build-packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packetId,
          displayNameType: displayName,
          isWatermarked: watermarked
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate PDF packet.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VendorPack_${packet?.companyName?.replace(/\s+/g, '_') || 'Submission'}_${
        watermarked ? 'PREVIEW' : 'CLEAN'
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePurge = async () => {
    if (
      !confirm(
        'Permanently delete all uploaded documents and preflight records right now? This will immediately wipe all files from memory.'
      )
    ) {
      return;
    }

    setIsPurging(true);
    try {
      const res = await fetch(`/api/purge-packet?packetId=${packetId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('All documents and packet metadata have been permanently deleted.');
        router.push('/');
      } else {
        alert('Failed to delete records.');
      }
    } catch {
      alert('Network error while purging packet.');
    } finally {
      setIsPurging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-6 h-6 text-neutral-950 animate-spin" />
          <p className="text-xs font-mono text-neutral-500">Preparing delivery options...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-xs font-mono text-neutral-500">Packet not found or expired.</p>
          <Link href="/upload" className="text-xs font-semibold text-neutral-950 hover:underline">
            Start New Preflight
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80">
          <Link
            href={`/builder/${packet.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builder</span>
          </Link>
          <span className="text-[11px] font-mono text-neutral-400">Step 03 {'//'} PDF Delivery</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Preflight &amp; Packet Compilation Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-[-0.02em]">
            Your Vendor Document Pack Is Ready
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm font-mono">
            {packet.companyName} {'//'} Readiness Score: {packet.readinessScore}/100
          </p>
        </div>

        {/* Two-Column Delivery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-2">
          {/* Card A: Free Preview Tier */}
          <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-neutral-600 uppercase tracking-wider bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200/70">
                  Free Preview
                </span>
                <span className="text-xl font-bold font-mono text-neutral-950">₹0</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-950">Sample Watermarked PDF</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Includes full online preflight report + watermarked PDF preview for evaluation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-200/70 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span>Executive Vendor Profile Cover Sheet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span>Table of Contents with hyperlinked pagination</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <span className="w-3.5 text-center font-bold text-amber-700">⚠</span>
                  <span className="text-neutral-500">Diagonal sample preview watermark</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownloadPdf(true)}
              className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-neutral-800 bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] border border-neutral-200 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Watermarked Preview (Free)</span>
            </button>
          </div>

          {/* Card B: Paid Clean Corporate Pack */}
          <div className="bg-[#111111] text-white rounded-xl border border-neutral-800 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-neutral-300 uppercase tracking-wider bg-white/10 border border-white/10 px-2.5 py-0.5 rounded">
                  Submission Ready
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {packet.isPaid ? 'Unlocked' : '₹299'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Clean Corporate Vendor Dossier</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Unwatermarked, high-resolution vector PDF ready for corporate procurement submission.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>No watermarks · Clean corporate-standard vector PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Sequential running headers and page numbers stamped</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Unmasked bank account number for accounts payable</span>
                </li>
              </ul>
            </div>

            {packet.isPaid ? (
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => handleDownloadPdf(false)}
                className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-neutral-950 bg-white hover:bg-neutral-100 active:scale-[0.98] shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-neutral-900" />
                <span>Download Clean Corporate PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-neutral-950 bg-white hover:bg-neutral-100 active:scale-[0.98] shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
                <span>Unlock Clean Vendor Pack (₹299)</span>
              </button>
            )}
          </div>
        </div>

        {/* Privacy & Instant Purge Controls */}
        <div className="max-w-4xl mx-auto p-5 sm:p-6 bg-white rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-950">
                Scheduled Automatic Deletion (24 Hours)
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                All uploaded files and preflight records are scheduled for automatic permanent deletion.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePurge}
            disabled={isPurging}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPurging ? 'Purging...' : 'Delete Documents Immediately'}</span>
          </button>
        </div>
      </main>

      <Footer />

      {/* Razorpay / UPI Checkout Modal */}
      <RazorpayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        packetId={packet.id}
        onPaymentSuccess={() => {
          setPacket((prev) => (prev ? { ...prev, isPaid: true } : null));
          handleDownloadPdf(false);
        }}
      />
    </div>
  );
}
