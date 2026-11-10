'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Calendar,
  Building,
  ShieldAlert,
  Loader2,
  Download,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReadinessScoreBadge } from '@/components/ReadinessScoreBadge';
import { IdentityCard } from '@/components/IdentityCard';
import { ConsistencyMatrix } from '@/components/ConsistencyMatrix';
import { DocumentChecklist } from '@/components/DocumentChecklist';
import { VendorPacketRecord } from '@/lib/types';

export default function PreflightReportPage() {
  const params = useParams();
  const router = useRouter();
  const packetId = params.packetId as string;

  const [packet, setPacket] = useState<VendorPacketRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    async function fetchPacket() {
      try {
        const res = await fetch(`/api/packet/${packetId}`);
        const data = await res.json();
        if (!res.ok || !data.packet) {
          throw new Error(data.error || 'Failed to load preflight report.');
        }
        setPacket(data.packet);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Report not found or expired.');
      } finally {
        setIsLoading(false);
      }
    }

    if (packetId) {
      fetchPacket();
    }
  }, [packetId]);

  const handlePurge = async () => {
    if (!confirm('Are you sure you want to permanently delete all uploaded documents and preflight records now? This action cannot be undone.')) {
      return;
    }

    setIsPurging(true);
    try {
      const res = await fetch(`/api/purge-packet?packetId=${packetId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('All documents and packet records have been permanently purged.');
        router.push('/');
      } else {
        alert('Failed to purge data.');
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
          <p className="text-xs font-mono text-neutral-500">Loading preflight report...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !packet) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#FDEBEC] text-[#8C2220] flex items-center justify-center border border-[#F6C7C9]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-neutral-950">Preflight Report Unavailable</h2>
          <p className="text-xs text-neutral-500">
            {errorMsg || 'This preflight report has expired or been purged from memory.'}
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.98]"
          >
            <span>Upload New Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(packet.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Report Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200/70">
                Preflight Audit Report
              </span>
              <span className="text-[11px] font-mono text-neutral-400">ID: {packet.id.substring(0, 10)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-[-0.02em]">
              {packet.companyName || 'Business Entity'}
            </h1>
            <div className="flex items-center gap-4 text-xs text-neutral-500 pt-0.5">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                Audited: {formattedDate}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">{packet.documents.length} Enclosed Documents</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePurge}
              disabled={isPurging}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-[#8C2220] bg-[#FDEBEC] hover:bg-[#F9D6D8] border border-[#F6C7C9] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging ? 'Purging...' : 'Delete Documents Now'}</span>
            </button>

            <Link
              href={`/builder/${packet.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-800 shadow-2xs active:scale-[0.98] transition-all"
            >
              <span>Customize &amp; Build Pack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section 1: Readiness Score Indicator */}
        <ReadinessScoreBadge
          score={packet.readinessScore}
          breakdown={packet.scoringBreakdown}
          companyName={packet.companyName}
        />

        {/* Section 2: Extracted Business Identity Table */}
        <IdentityCard data={packet.extractedData} />

        {/* Section 3: Cross-Document Consistency Matrix */}
        <ConsistencyMatrix checks={packet.validationResults} />

        {/* Section 4: Document Presence Checklist */}
        <DocumentChecklist data={packet.extractedData} />

        {/* Bottom CTA Banner */}
        <div className="p-6 rounded-xl bg-[#111111] text-white border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold tracking-tight">Ready to assemble your final vendor pack?</h3>
            <p className="text-xs text-neutral-400">
              Set your primary entity header, reorder attachments, and download an indexed PDF in minutes.
            </p>
          </div>
          <Link
            href={`/builder/${packet.id}`}
            className="px-4 py-2.5 rounded-md text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Proceed to Pack Customizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
