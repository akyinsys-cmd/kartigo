import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, X, Check, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmailSimulationOverlay() {
  const { simulateEmail, clearSimulatedEmail } = useAuth();

  if (!simulateEmail) return null;

  return (
    <div id="email-simulation-alert-container" className="fixed bottom-5 right-5 z-50 max-w-sm w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="bg-brand-secondary text-white rounded-[20px] p-5 shadow-2xl border border-brand-primary/20 relative overflow-hidden"
        >
          {/* Subtle decoration background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-extrabold tracking-widest text-brand-primary font-mono leading-none">
                  Transaction Outbox
                </span>
                <span className="block text-xs font-bold font-display mt-0.5">
                  Simulated Transactional Email
                </span>
              </div>
            </div>
            <button
              id="close-simulated-email-btn"
              onClick={clearSimulatedEmail}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Email Body */}
          <div className="space-y-2.5 text-xs">
            <div className="bg-white/5 px-2.5 py-1.5 rounded-lg flex flex-col font-mono text-[10px] text-white/80 border border-white/5">
              <span><b>To:</b> {simulateEmail.to}</span>
              <span className="mt-0.5">
                <b>Type:</b> {
                  simulateEmail.type === 'welcome' ? 'Welcome & Onboarding Template' :
                  simulateEmail.type === 'verify' ? 'Secure Account Verification Email' :
                  simulateEmail.type === 'reset' ? 'Password Reset Instruction Token' :
                  'Security Alert: Password Changed'
                }
              </span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl text-neutral-200 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-line custom-scrollbar border border-white/10">
              {simulateEmail.body}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-white/40 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-green-400" /> Vetted Mail Server Simulated
            </span>
            <button
              id="dismiss-simulated-email-btn"
              onClick={clearSimulatedEmail}
              className="px-3 py-1.5 rounded-lg bg-brand-primary hover:opacity-90 transition-opacity font-bold text-white cursor-pointer"
            >
              Okay, Understood
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
