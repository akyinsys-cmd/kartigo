import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Calendar, FileText, CheckCircle2, QrCode } from 'lucide-react';
import LayoutContainer from './LayoutContainer';

interface VerificationData {
  documentId: string;
  generationDate: string;
  status: string;
  documentType: string;
  checksum: string;
}

export const VerificationPage: React.FC<{ data?: VerificationData }> = ({ data }) => {
  // Mock data if not provided
  const verifyData = data || {
    documentId: 'DOC-KD-8829-102',
    generationDate: new Date().toLocaleDateString(),
    status: 'Verified & Original',
    documentType: 'Non-Disclosure Agreement',
    checksum: 'a9f8...7e21'
  };

  return (
    <div className="min-h-screen bg-vanilla-secondary/30 pt-24 pb-12">
      <LayoutContainer>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-vanilla-main shadow-2xl overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-brand-secondary p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-primary opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="h-16 w-16 bg-[#F1FEC8] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-10 w-10 text-brand-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-[#F1FEC8] font-display">Document Verified</h1>
                <p className="text-[#F1FEC8]/70 text-xs mt-1 uppercase tracking-widest font-mono">Authenticity Engine Active</p>
              </div>
            </div>

            {/* Verification Details */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">Document ID</span>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-primary" />
                    <span className="text-sm font-bold text-brand-secondary">{verifyData.documentId}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">Generation Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-primary" />
                    <span className="text-sm font-bold text-brand-secondary">{verifyData.generationDate}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">Document Type</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                    <span className="text-sm font-bold text-brand-secondary">{verifyData.documentType}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">Status</span>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-bold uppercase">{verifyData.status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-vanilla-secondary/50 rounded-2xl p-6 border border-vanilla-main text-center space-y-4">
                <div className="h-32 w-32 bg-white border border-vanilla-main rounded-xl mx-auto flex items-center justify-center p-2">
                  <QrCode className="h-full w-full text-brand-secondary opacity-20" />
                </div>
                <div>
                  <p className="text-[10px] text-text-light leading-relaxed max-w-xs mx-auto">
                    This document was generated and signed through Kartigo Draft's secure AI engine. 
                    Unique Digital Checksum: <span className="font-mono">{verifyData.checksum}</span>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-text-light italic">
                  Protected by AKYIN Ventures Security Protocols.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </LayoutContainer>
    </div>
  );
};
