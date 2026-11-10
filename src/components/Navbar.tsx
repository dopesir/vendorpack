'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileCheck2, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenSampleModal?: () => void;
}

export function Navbar({ onOpenSampleModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-xs supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Identification */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-neutral-950 text-white flex items-center justify-center border border-neutral-900 shadow-2xs group-hover:bg-neutral-800 transition-colors">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-neutral-950">VendorPack</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                Preflight Tool
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono -mt-0.5 hidden sm:inline">
              by Nobuswork · Statutory Document Compiler
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
          <a href="/#deliverable" className="hover:text-neutral-950 transition-colors">
            The Deliverable
          </a>
          <a href="/#how-it-works" className="hover:text-neutral-950 transition-colors">
            How It Works
          </a>
          <button
            type="button"
            onClick={onOpenSampleModal}
            className="hover:text-neutral-950 transition-colors cursor-pointer"
          >
            Sample Pack
          </button>
          <a href="/#faq" className="hover:text-neutral-950 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-950 rounded-md hover:bg-neutral-800 active:scale-[0.98] transition-all gap-1.5 shadow-2xs"
          >
            <span>Check My Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
