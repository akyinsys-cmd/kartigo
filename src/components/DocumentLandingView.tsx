import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, FileText, CheckCircle, Info, ArrowRight, Star, Clock, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import { DocumentTemplate } from '../types';
import LayoutContainer from './LayoutContainer';
import GoogleAd from './GoogleAd';
import SEOManager from './SEOManager';
import Breadcrumbs from './Breadcrumbs';
import DocumentSkeleton from './DocumentSkeleton';

interface DocumentLandingViewProps {
  document: DocumentTemplate;
  onBack: () => void;
  onStartDrafting: (doc: DocumentTemplate, method?: 'form' | 'chat') => void;
  relatedDocuments: DocumentTemplate[];
}

export default function DocumentLandingView({ document, onBack, onStartDrafting, relatedDocuments }: DocumentLandingViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = (method: 'form' | 'chat') => {
    setIsProcessing(true);
    setTimeout(() => {
      handleStart(method);
    }, 1500);
  };

  if (isProcessing) {
    return (
      <div className="bg-vanilla-secondary min-h-screen pt-32 pb-24 flex flex-col items-center justify-center">
        <LayoutContainer>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <DocumentSkeleton />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h2 className="text-xl font-bold font-display text-brand-secondary">Preparing your workspace...</h2>
              <p className="text-sm text-text-light">Loading AI assistant and template configuration for {document.title}</p>
            </motion.div>
          </div>
        </LayoutContainer>
      </div>
    );
  }

  return (
    <div className="bg-vanilla-secondary min-h-screen pt-32 pb-24">
      <SEOManager 
        metadata={document.seo || {
          title: `${document.title} | Online Generator | Kartigo Draft`,
          description: document.description,
          keywords: [document.title.toLowerCase(), 'online generator', 'legal draft', 'business document'],
        }} 
      />

      <LayoutContainer>
        <div className="mb-8">
          <Breadcrumbs 
            onBackHome={onBack}
            items={[
              { label: document.category, onClick: onBack },
              { label: document.title, isActive: true }
            ]} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-vanilla-main relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                  <FileText className="w-3 h-3" />
                  {document.category}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-brand-secondary font-display leading-tight">
                  Professional <span className="text-brand-primary">{document.title}</span> Generator
                </h1>
                
                <p className="text-lg text-text-secondary leading-relaxed font-medium">
                  {document.description}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => handleStart('form')}
                    className="inline-flex items-center justify-center gap-2 bg-[#F1FEC8] text-brand-secondary border border-[#E5F5B8] px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    <Zap className="w-5 h-5 text-brand-primary" />
                    Quick Form
                  </button>
                  <button
                    onClick={() => handleStart('chat')}
                    className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Manaz AI Chat
                  </button>
                                    
                  <div className="flex items-center gap-6 px-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-light uppercase">Popularity</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-sm font-bold text-brand-secondary">{(document.popularity / 20).toFixed(1)}/5.0</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-light uppercase">Est. Time</span>
                      <div className="flex items-center gap-1 text-blue-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold text-brand-secondary">5-8 mins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Slot */}
            <GoogleAd slot="document-top-content" />

            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-secondary font-display">When to use an {document.title}?</h2>
                </div>
                <div className="bg-white rounded-[32px] p-8 border border-vanilla-main shadow-sm">
                  <p className="text-text-secondary leading-relaxed font-medium">
                    {document.whyUseIt}
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-secondary font-display">Required Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {document.requiredInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-vanilla-main shadow-xs">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-brand-secondary">{info}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3C1A47]/10 flex items-center justify-center text-[#3C1A47]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-secondary font-display">Document Structure</h2>
                </div>
                <div className="bg-[#3C1A47] text-white rounded-[32px] p-8 shadow-xl">
                  <ul className="space-y-4">
                    {document.draftOutline.map((point, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="text-[#E5F5B8] font-mono text-sm mt-1">{String(idx + 1).padStart(2, '0')}.</span>
                        <span className="text-sm font-medium text-white/80">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
            
            {/* Ad Slot */}
            <GoogleAd slot="document-bottom-content" format="rectangle" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-[32px] p-8 border-2 border-vanilla-main shadow-sm space-y-6 sticky top-32">
              <h3 className="text-xl font-extrabold text-brand-secondary font-display">Ready to Create?</h3>
              <p className="text-sm text-text-secondary font-medium">Get your professionally drafted document in minutes.</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Legally Compliant in India
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Instant Digital Delivery
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Free Draft Previews
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStart('form')}
                  className="w-full bg-[#F1FEC8] text-brand-secondary border border-[#E5F5B8] py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5 text-brand-primary" />
                  Quick Form (Recommended)
                </button>
                <button
                  onClick={() => handleStart('chat')}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Ask Manaz AI
                </button>
              </div>
              
              <div className="pt-6 border-t border-vanilla-main">
                <h4 className="text-sm font-bold text-brand-secondary mb-4 uppercase tracking-widest text-[10px]">Related Documents</h4>
                <div className="space-y-3">
                  {relatedDocuments.map((relDoc) => (
                    <button
                      key={relDoc.id}
                      onClick={() => {
                        // In real app, this would change URL
                        // For now, we pass the same logic
                        onBack(); // Just as a placeholder
                      }}
                      className="w-full text-left p-4 bg-vanilla-secondary/50 rounded-2xl border border-vanilla-main hover:border-brand-primary/20 hover:bg-white transition-all group"
                    >
                      <span className="block text-sm font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">{relDoc.title}</span>
                      <span className="block text-[10px] text-text-light uppercase mt-1">{relDoc.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Ad */}
              <GoogleAd slot="document-sidebar" format="rectangle" className="mt-8" />
            </div>
          </div>
        </div>
      </LayoutContainer>
    </div>
  );
}
