'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Eye,
  Lock,
  Building,
  Briefcase,
  Users,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  HelpCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SamplePackModal } from '@/components/SamplePackModal';

export default function LandingPage() {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'What documents can I upload?',
      a: 'VendorPack accepts GST Registration Certificates (REG-06), PAN Cards, Cancelled Bank Cheques, Bank Passbooks, Udyam MSME Certificates, Certificates of Incorporation, and buyer-specific registration forms in PDF, JPG, and PNG formats (up to 15MB each).'
    },
    {
      q: 'Does VendorPack verify my business with the government?',
      a: 'No. VendorPack is an automated document organization and consistency-checking aid. It performs deterministic cross-checks between your uploaded files (such as confirming that your GSTIN embeds your PAN, and checking name alignment between your bank proof and statutory records). It does not access paid government portals or provide legal certification.'
    },
    {
      q: 'Are my uploaded documents stored permanently?',
      a: 'No. VendorPack operates with minimal data retention. Files are processed in temporary memory to generate your preflight report and compiled pack. You can click "Delete My Documents Now" at any time to immediately wipe all data, and any uncollected files are automatically purged within 24 hours.'
    },
    {
      q: 'What happens if a document or check is flagged as REVIEW?',
      a: 'A REVIEW status is not a failure. It highlights common legitimate variations—such as an individual proprietor name on a bank cheque differing from a trade name on a GST certificate. VendorPack provides plain-English explanations so you can confirm buyer preferences before submitting.'
    },
    {
      q: 'Can I reorder documents to match a buyer’s specific checklist?',
      a: 'Yes. The Pack Customizer lets you drag to reorder attachments, exclude specific files, select whether your Legal Name or Trade Name appears in the cover header, and add optional signatory contact details.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans">
      <Navbar onOpenSampleModal={() => setIsSampleModalOpen(true)} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-neutral-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Subtle Technical Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Statutory Preflight &amp; Submission Dossier Compiler</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-[-0.03em] leading-[1.12]">
            Your Company&apos;s Vendor Documents, Preflighted and Packaged.
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Cross-check GSTIN, PAN, and bank proof for statutory discrepancies. Assemble an indexed, stamped PDF dossier before corporate procurement rejects your submission.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-xs text-white bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-2xs"
            >
              <span>Check My Documents — Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsSampleModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-xs text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 active:scale-[0.98] transition-all shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-500" />
              <span>Inspect Sample Dossier (PDF)</span>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-neutral-500">
            <span>✓ Zero Account Required</span>
            <span className="text-neutral-300">•</span>
            <span>✓ Ephemeral In-Memory Processing</span>
            <span className="text-neutral-300">•</span>
            <span>✓ Instant 60s Audit Report</span>
          </div>
        </div>
      </section>

      {/* 2. REAL OUTPUT PREVIEW: THE DELIVERABLE */}
      <section id="deliverable" className="py-16 sm:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left space-y-1 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              The Deliverable
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              One Indexed A4 Dossier with Verified Cross-Checks
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Replaces scattered email attachments with an executive cover profile, tabular consistency findings, and sequentially numbered statutory records.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Document Check Matrix Preview */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-neutral-200/90 p-6 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="font-bold text-neutral-950 font-mono text-xs uppercase tracking-wider">
                    Statutory Preflight Findings
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Readiness: 94 / 100
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-neutral-50/70 border border-neutral-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">GSTIN ↔ PAN Structural Link</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        MATCHED
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[11px] mt-1 leading-relaxed">
                      GSTIN (27AABCU9603R1ZM) characters 3–12 match Permanent Account Number (AABCU9603R) under Section 139A.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50/70 border border-neutral-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">Bank IFSC &amp; Account Proof</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        MATCHED
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[11px] mt-1 leading-relaxed">
                      HDFC Bank IFSC (HDFC0000128) verified against RBI routing tables. Pre-printed computerized account holder name detected.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50/70 border border-neutral-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">Entity Trade Name vs Legal Name</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                        REVIEW
                      </span>
                    </div>
                    <p className="text-neutral-600 text-[11px] mt-1 leading-relaxed">
                      GST certificate shows Trade Name &quot;ACME Precision Fab&quot; with Legal Name &quot;ACME Engineering LLP&quot;. Normal for LLPs; select preferred header display in customizer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-neutral-500 font-mono text-[11px] border-t border-neutral-100">
                <span>4 records audited</span>
                <span className="font-semibold text-neutral-700">0 critical blockers</span>
              </div>
            </div>

            {/* Right: Enclosed Packet Index & PDF Preview */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-neutral-200/90 p-6 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="font-bold text-neutral-950 font-mono text-xs uppercase tracking-wider">
                  Compiled Dossier Architecture
                </span>
                <span className="text-neutral-500 font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  A4 Vector PDF · Sequential Stamping
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { num: '01', title: 'Executive Profile & Statutory Master Sheet', type: 'Generated Cover', page: 'Page 1' },
                  { num: '02', title: 'Table of Contents & Preflight Audit Findings', type: 'Audit Matrix', page: 'Page 2' },
                  { num: '03', title: 'GST Registration Certificate (Form GST REG-06)', type: 'Tax Record', page: 'Page 3' },
                  { num: '04', title: 'Permanent Account Number (PAN) Card', type: 'CBDT Proof', page: 'Page 4' },
                  { num: '05', title: 'HDFC Cancelled Cheque / Banking Mandate', type: 'Disbursement', page: 'Page 5' },
                  { num: '06', title: 'MSME Udyam Registration Certificate', type: 'Enterprise Proof', page: 'Page 6' }
                ].map((item) => (
                  <div
                    key={item.num}
                    className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between hover:bg-neutral-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 text-[11px] font-semibold">{item.num}</span>
                      <div>
                        <span className="font-medium text-neutral-900 block">{item.title}</span>
                        <span className="text-[10px] font-mono text-neutral-500">{item.type}</span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-neutral-600 text-[11px] bg-white border border-neutral-200 px-2 py-0.5 rounded">
                      {item.page}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-lg text-neutral-700 text-[11px] flex items-center justify-between font-mono">
                <span>Running Header: Supplier Legal Name · Stamped &quot;Page X of Y&quot;</span>
                <button
                  type="button"
                  onClick={() => setIsSampleModalOpen(true)}
                  className="font-bold text-neutral-950 hover:underline cursor-pointer"
                >
                  View Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR COMMON PROCUREMENT REJECTION POINTS */}
      <section className="py-16 sm:py-24 bg-white border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left space-y-1 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Procurement Audit Prevention
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Why Corporate Empanelments Get Delayed
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Corporate finance and procurement teams at L&amp;T, Tata, BHEL, and PSUs reject or return vendor registration kits for predictable, preventable discrepancies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-50/50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-neutral-950 text-sm">GSTIN ↔ PAN Mismatch</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If characters 3 to 12 of your GSTIN do not match your PAN card, ERP master vendor creation halts immediately in SAP/Oracle.
              </p>
            </div>

            <div className="p-5 bg-neutral-50/50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-neutral-950 text-sm">Handwritten Cheque Leaves</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Many corporate accounts departments automatically reject cheques without pre-printed computerized company names to prevent fraud.
              </p>
            </div>

            <div className="p-5 bg-neutral-50/50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-neutral-950 text-sm">Missing Udyam MSME Proof</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                MSME Samadhaan 45-day statutory payment clauses require verified enterprise category documentation during onboarding.
              </p>
            </div>

            <div className="p-5 bg-neutral-50/50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h3 className="font-bold text-neutral-950 text-sm">Scattered Email Attachments</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Sending 6 loose JPGs and unindexed scans forces procurement officers to chase missing pages, causing weeks of back-and-forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3 CRISP STEPS */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left space-y-1 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              The Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Three Steps to a Submission-Ready Pack
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              No account creation, no complex configuration. Drop files and review findings immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                Step 01
              </div>
              <h3 className="font-bold text-neutral-950 text-base">Drop Statutory Records</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Upload your GST certificate (REG-06), PAN card, cancelled cheque leaf, and MSME Udyam certificate (PDF, JPG, PNG).
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                Step 02
              </div>
              <h3 className="font-bold text-neutral-950 text-base">Inspect Preflight Audit</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Review the deterministic consistency findings. Catch tax identifier mismatches, name discrepancies, and missing attachments upfront.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                Step 03
              </div>
              <h3 className="font-bold text-neutral-950 text-base">Compile &amp; Download</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Reorder documents to match your buyer&apos;s checklist. Download a single, sequentially numbered PDF dossier ready for email or portal upload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-b border-neutral-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left space-y-1 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Pricing Structure
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Pay Only When You Need a Final Pack
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Document preflight checks and watermarked previews are always free. Unlock the clean, unwatermarked PDF dossier when ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <div className="p-6 rounded-xl bg-white border border-neutral-200 flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                  Self-Serve Check
                </span>
                <div className="text-3xl font-black text-neutral-950 font-mono">₹0</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Full online document consistency report and watermarked preview PDF.
                </p>
                <ul className="text-xs text-neutral-700 space-y-2 pt-3 border-t border-neutral-100 font-mono text-[11px]">
                  <li className="flex items-center gap-2">✓ Upload up to 8 documents</li>
                  <li className="flex items-center gap-2">✓ Full preflight consistency report</li>
                  <li className="flex items-center gap-2">✓ Watermarked sample preview</li>
                </ul>
              </div>
              <Link
                href="/upload"
                className="w-full py-2 px-4 rounded-md text-xs font-semibold text-center bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                Run Free Check
              </Link>
            </div>

            {/* Single Pack */}
            <div className="p-6 rounded-xl bg-neutral-950 text-white flex flex-col justify-between space-y-6 relative shadow-xs">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white text-neutral-950 border border-neutral-200">
                Standard
              </span>
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Single Submission Pack
                </span>
                <div className="text-3xl font-black text-white font-mono">₹299</div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  1 unwatermarked, high-resolution vector PDF dossier ready for procurement submission.
                </p>
                <ul className="text-xs text-neutral-300 space-y-2 pt-3 border-t border-neutral-800 font-mono text-[11px]">
                  <li className="flex items-center gap-2">✓ Unwatermarked submission PDF</li>
                  <li className="flex items-center gap-2">✓ Executive Profile Cover Page</li>
                  <li className="flex items-center gap-2">✓ Hyperlinked Table of Contents</li>
                  <li className="flex items-center gap-2">✓ Stamped headers &amp; page numbers</li>
                </ul>
              </div>
              <Link
                href="/upload"
                className="w-full py-2 px-4 rounded-md text-xs font-semibold text-center bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-2xs"
              >
                Get Started
              </Link>
            </div>

            {/* 5-Pack */}
            <div className="p-6 rounded-xl bg-white border border-neutral-200 flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                  Multi-Entity Pass
                </span>
                <div className="text-3xl font-black text-neutral-950 font-mono">₹799</div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  5 clean packs for CAs, accountants, and businesses onboarding with multiple corporate buyers.
                </p>
                <ul className="text-xs text-neutral-700 space-y-2 pt-3 border-t border-neutral-100 font-mono text-[11px]">
                  <li className="flex items-center gap-2">✓ 5 Unwatermarked PDF dossiers</li>
                  <li className="flex items-center gap-2">✓ Multi-company support</li>
                  <li className="flex items-center gap-2">✓ ₹160 per vendor pack</li>
                </ul>
              </div>
              <Link
                href="/upload"
                className="w-full py-2 px-4 rounded-md text-xs font-semibold text-center bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                Get 5-Pack Pass
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-left space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Clear Answers
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-neutral-950 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL ACTION CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Check your company documents before submitting.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Drop your statutory records, review inconsistencies, and compile a clean, indexed PDF dossier in 60 seconds.
          </p>
          <div className="pt-2">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-xs text-white bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] shadow-2xs transition-all"
            >
              <span>Check My Documents — Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-[11px] font-mono text-neutral-400 pt-1">
            Zero account required · Ephemeral processing · 48h retention
          </p>
        </div>
      </section>

      <Footer />

      {/* Sample Dossier Modal */}
      <SamplePackModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />
    </div>
  );
}
