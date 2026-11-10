'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Dropzone, UploadFileItem } from '@/components/Dropzone';
import { ProcessingStepper } from '@/components/ProcessingStepper';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { SamplePackModal } from '@/components/SamplePackModal';

export default function UploadPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentFileName, setCurrentFileName] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  const handleStartPreflight = async (files: UploadFileItem[]) => {
    setIsProcessing(true);
    setCurrentStep(1);
    setErrorMsg(null);

    try {
      // Step 1: Reading uploaded files
      setCurrentFileName(files[0]?.name);
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Classifying document types
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Multimodal extraction API call
      setCurrentStep(3);

      const formData = new FormData();
      for (const item of files) {
        if (item.file) {
          formData.append('files', item.file);
        } else if (item.isSample) {
          // Create dummy sample binary payload for the sample test
          const dummyBlob = new Blob([`Sample document content for ${item.name}`], {
            type: item.mimeType
          });
          const sampleFile = new File([dummyBlob], item.name, { type: item.mimeType });
          formData.append('files', sampleFile);
        }
      }

      const uploadPromise = fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      // Step 4: Consistency Rules
      await new Promise((r) => setTimeout(r, 800));
      setCurrentStep(4);

      const response = await uploadPromise;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Preflight processing encountered an error.');
      }

      // Step 5: Compiling Preflight Report
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 500));

      // Navigate to preflight report page
      router.push(`/report/${data.packetId}`);
    } catch (err: any) {
      console.error('Upload preflight error:', err);
      setErrorMsg(err?.message || 'Failed to complete preflight check. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onOpenSampleModal={() => setIsSampleModalOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {!isProcessing ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200/70">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
                <span>Preflight {'//'} Document Upload</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-[-0.02em]">
                Upload Your Vendor Registration Documents
              </h1>
              <p className="text-neutral-600 text-xs sm:text-sm max-w-lg mx-auto">
                Drop your GST, PAN, Bank Cheque, and Udyam records. We&apos;ll check them for discrepancies in minutes.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-[#FDEBEC] border border-[#F6C7C9] text-[#8C2220] rounded-lg text-xs flex items-center gap-2 max-w-2xl mx-auto">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Dropzone Component */}
            <div className="max-w-3xl mx-auto">
              <Dropzone onStartPreflight={handleStartPreflight} isLoading={isProcessing} />
            </div>

            {/* Privacy Reassurance Card */}
            <div className="max-w-2xl mx-auto p-3.5 rounded-lg bg-neutral-50/60 border border-neutral-200/80 shadow-2xs flex items-center justify-center gap-3 text-xs text-neutral-600 text-center font-sans">
              <Lock className="w-3.5 h-3.5 text-neutral-900 flex-shrink-0" />
              <span>
                <strong className="text-neutral-950">Privacy Guaranteed:</strong> No account required · Ephemeral in-memory processing · 1-click permanent deletion.
              </span>
            </div>
          </div>
        ) : (
          /* Live Micro-Stepper */
          <div className="py-12">
            <ProcessingStepper
              currentStep={currentStep}
              totalSteps={5}
              fileName={currentFileName}
            />
          </div>
        )}
      </main>

      <Footer />

      <SamplePackModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />
    </div>
  );
}
