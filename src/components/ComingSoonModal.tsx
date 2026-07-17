import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Check, Sparkles, Rocket, Lock, FileText, Download } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function ComingSoonModal({ isOpen, onClose, featureName }: ComingSoonModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate saving to database/localStorage
    const currentWaitlist = JSON.parse(localStorage.getItem('kartigo_waitlist') || '[]');
    if (!currentWaitlist.includes(email)) {
      currentWaitlist.push(email);
      localStorage.setItem('kartigo_waitlist', JSON.stringify(currentWaitlist));
    }

    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[20px] bg-white p-8 shadow-2xl z-10 border border-vanilla-main"
            id="modal-content"
          >
            {/* Close button */}
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="absolute top-5 right-5 text-text-light hover:text-text-secondary p-1.5 rounded-full hover:bg-vanilla-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Accent background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />

            <div className="mt-2 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-vanilla-main text-brand-primary mb-4">
                <Sparkles className="h-7 w-7 text-brand-primary animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold font-display text-brand-secondary tracking-tight">
                {featureName ? `Unlock ${featureName}` : 'Under Construction'}
              </h3>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                {featureName 
                  ? `The "${featureName}" module is part of our upcoming Phase 2-4 production rollout, featuring interactive AI generation, secure cloud storage, and collaborative editing.`
                  : "We are currently deploying our Phase 1 foundation. Interactive document drafting, customized PDF downloads, and payments will be active very soon."
                }
              </p>
            </div>

            {/* Development timeline indicators */}
            <div className="my-6 grid grid-cols-3 gap-2 bg-vanilla-secondary p-3 rounded-2xl border border-vanilla-main text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-brand-primary">Phase 1</span>
                <span className="text-[10px] text-text-secondary">Landing & Shell (Live)</span>
              </div>
              <div className="flex flex-col items-center border-x border-vanilla-main">
                <span className="font-extrabold text-brand-secondary">Phase 2</span>
                <span className="text-[10px] text-text-secondary">AI Assistant & Auth</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-extrabold text-brand-secondary">Phase 3</span>
                <span className="text-[10px] text-text-secondary">PDF & Payments</span>
              </div>
            </div>

            {/* Content / Waitlist Form */}
            <div className="mt-2">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-green-50 p-5 text-center border border-green-200"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
                    <Check className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-green-900 font-display">You're on the list!</h4>
                  <p className="mt-1 text-xs text-green-700">
                    Thank you! We've registered your email. You will receive priority access and an exclusive discount when the next phase goes live.
                  </p>
                </motion.div>
              ) : (
                <form id="waitlist-form" onSubmit={handleSubmit} className="space-y-3">
                  <label htmlFor="modal-email" className="block text-xs font-semibold text-brand-secondary text-left">
                    Get Early Access & Priority Updates
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-light">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="modal-email"
                      type="email"
                      required
                      placeholder="Enter your professional email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-vanilla-main pl-11 pr-4 py-3 text-sm bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-hidden transition-all placeholder:text-text-light text-text-cosmic"
                    />
                  </div>
                  {error && <p id="email-error-text" className="text-xs text-brand-primary font-medium">{error}</p>}
                  
                  <button
                    id="submit-waitlist-btn"
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:scale-98 transition-all cursor-pointer"
                  >
                    <Rocket className="h-4 w-4" />
                    Secure Priority Access
                  </button>
                </form>
              )}
            </div>

            <div className="mt-5 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-light">
                <Lock className="h-3 w-3" />
                No spam, ever. Secure & encrypted details.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
