import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, MessageSquare, Send, Sparkles, Check, RefreshCw } from 'lucide-react';
import { MOCK_CONVERSATIONS } from '../data/landingData';
import { ChatMessage } from '../types';
import LayoutContainer from './LayoutContainer';

interface HeroProps {
  onTalkToAgent: () => void;
  onBrowseDocuments: () => void;
  onOpenComingSoon: (featureName: string) => void;
  isReady?: boolean;
}

import { HeroIllustration } from './Illustrations';
import { useCMSContext } from '../context/CMSContext';

export default function Hero({ onTalkToAgent, onBrowseDocuments, onOpenComingSoon, isReady = true }: HeroProps) {
  const { homepageContent } = useCMSContext();

  return (
    <section
      id="hero"
      className="relative pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 bg-vanilla-main overflow-hidden min-h-[100dvh] flex items-center w-full max-w-full box-border"
    >
      {/* Decorative vector grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#FD1843_0.05rem,transparent_0.05rem)] [background-size:1.5rem_1.5rem] opacity-[0.035] pointer-events-none" />

      {/* Warm/secondary radial glow at bottom left */}
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-vanilla-alt/45 blur-3xl pointer-events-none" />

      <LayoutContainer className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Copy (5 columns on large screens) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-display tracking-tight text-brand-secondary leading-[1.05]">
              {homepageContent?.heroHeadline || "Professional drafts, AI guided."}
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              {homepageContent?.heroSubheadline || "Skip the expensive consultants. Our intelligent assistant understands your intent, asks smart questions, and guides you through a seamless dynamic form to generate expert-grade professional documents in minutes."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                id="hero-start-creating-btn"
                onClick={onTalkToAgent}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-brand-primary/20 focus:outline-hidden cursor-pointer group"
              >
                {homepageContent?.heroPrimaryCta || "Draft with AI"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                id="hero-browse-docs-btn"
                onClick={onBrowseDocuments}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-brand-primary/20 text-brand-secondary px-8 py-5 rounded-2xl font-bold text-lg hover:bg-vanilla-secondary transition-all focus:outline-hidden cursor-pointer"
              >
                {homepageContent?.heroSecondaryCta || "Browse Templates"}
              </button>
            </div>

            {/* Quick stats / trust list */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-brand-secondary/10">
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-bold font-display text-brand-secondary">100+</span>
                <span className="text-xs text-text-light font-medium uppercase tracking-wider">Expert Templates</span>
              </div>
              <div className="border-x border-brand-secondary/10 px-6 text-center lg:text-left">
                <span className="block text-2xl font-bold font-display text-brand-secondary">100%</span>
                <span className="text-xs text-text-light font-medium uppercase tracking-wider">Legal Precision</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-bold font-display text-brand-secondary">V2.0</span>
                <span className="text-xs text-text-light font-medium uppercase tracking-wider">Smart Engine</span>
              </div>
            </div>

          </div>

          {/* Interactive Illustration (6 columns on large screens) */}
          <div className="lg:col-span-6 relative">
            <HeroIllustration />
          </div>

        </div>
      </LayoutContainer>
    </section>
  );
}
