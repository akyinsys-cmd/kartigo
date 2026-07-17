import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, FileDown, Info, ShieldCheck, Share2, Check, Eye, EyeOff, Mail, UserPlus, Loader2 } from 'lucide-react';
import { DocumentTemplate } from '../types';
import axios from 'axios';

interface DocumentDetailModalProps {
  isOpen: boolean;
  document: DocumentTemplate | null;
  onClose: () => void;
  onStartDrafting: (docTitle: string) => void;
}

const TemplatePreview = ({ document }: { document: DocumentTemplate }) => {
  return (
    <div className="bg-neutral-50 rounded-xl border border-vanilla-main p-8 shadow-inner font-serif text-[10px] sm:text-xs leading-relaxed text-brand-secondary max-h-[400px] overflow-y-auto custom-scrollbar select-none relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
      
      {/* Draft Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg] select-none">
        <span className="text-8xl font-bold uppercase tracking-[20px]">PREVIEW</span>
      </div>

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        <div className="text-center border-b border-brand-secondary/10 pb-4 mb-8">
          <h1 className="text-sm font-bold uppercase tracking-widest">{document.title}</h1>
          <p className="text-[8px] text-text-light mt-1 uppercase">Standard Professional Template Version 2.4.0</p>
        </div>

        {document.draftOutline.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h2 className="font-bold border-b border-brand-secondary/5 pb-1">SECTION {idx + 1}: {section.split('. ')[1] || section}</h2>
            <div className="space-y-1">
              <div className="h-2 w-full bg-neutral-200 rounded-xs animate-pulse opacity-20" />
              <div className="h-2 w-[90%] bg-neutral-200 rounded-xs animate-pulse opacity-20" />
              <div className="h-2 w-[95%] bg-neutral-200 rounded-xs animate-pulse opacity-20" />
              <div className="h-2 w-[85%] bg-neutral-200 rounded-xs animate-pulse opacity-20" />
            </div>
          </div>
        ))}

        <div className="pt-8 border-t border-brand-secondary/10 text-center">
          <p className="text-[8px] text-text-light">End of Document Preview</p>
        </div>
      </div>
    </div>
  );
};

export default function DocumentDetailModal({ isOpen, document, onClose, onStartDrafting }: DocumentDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const shareUrl = `${window.location.origin}?template=${encodeURIComponent(document?.id || '')}`;
      await axios.post('/api/email/send', {
        to: inviteEmail,
        subject: `Invitation to collaborate on ${document?.title}`,
        html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>You've been invited!</h2>
          <p>You have been invited to collaborate on the document <strong>${document?.title}</strong>.</p>
          <p><a href="${shareUrl}" style="background-color: #6D28D9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Document Template</a></p>
        </div>`
      });
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setIsInviteOpen(false);
        setInviteEmail('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  if (!isOpen || !document) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?template=${encodeURIComponent(document.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kartigo Draft - ${document.title}`,
          text: `Create professional ${document.title} in minutes on Kartigo Draft!`,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled or failed, ignore or copy fallback
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Invite Collaborator Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#3C1A47]/40 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl border border-vanilla-main p-6 max-w-sm w-full relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-brand-secondary">Invite Collaborator</h3>
                <button onClick={() => setIsInviteOpen(false)} className="text-text-light hover:text-brand-secondary"><X className="h-4 w-4" /></button>
              </div>
              {inviteSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                  <p className="text-xs font-bold text-brand-secondary">Invitation Sent!</p>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1.5">Collaborator Email</label>
                    <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full text-xs px-3 py-2 border border-vanilla-main rounded-xl focus:outline-hidden focus:border-brand-primary" />
                  </div>
                  <button disabled={isInviting || !inviteEmail} type="submit" className="w-full py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer transition-all">
                    {isInviting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Mail className="h-4 w-4" /> Send Invite</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Backdrop overlay */}
        <motion.div
          id="detail-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs"
        />

        {/* Modal content container */}
        <motion.div
          id="detail-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[20px] bg-white p-6 sm:p-8 shadow-2xl z-10 border border-vanilla-main max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Top colored strip */}
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />

          {/* Close button */}
          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 text-text-light hover:text-text-secondary p-1.5 rounded-full hover:bg-vanilla-secondary transition-colors focus:outline-hidden"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Block */}
          <div className="mb-6 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vanilla-main border border-brand-primary/10 text-xs font-bold text-brand-primary mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
              Verified Expert-Grade Template
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-brand-secondary tracking-tight">
              {document.title}
            </h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              {document.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-vanilla-main">
            {/* Column 1: Why Use It & Info Required */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-brand-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2 font-mono">
                  <Info className="h-3.5 w-3.5 text-brand-primary" />
                  When to use this document
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed bg-vanilla-secondary p-3 rounded-xl border border-vanilla-main">
                  {document.whyUseIt}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-brand-secondary uppercase tracking-widest flex items-center gap-1.5 mb-2.5 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                  Information requested from you
                </h4>
                <ul className="space-y-1.5">
                  {document.requiredInfo.map((info, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                      <span>{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Document Draft Outline Preview */}
            <div className="bg-vanilla-secondary/50 p-4 rounded-2xl border border-vanilla-main flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-brand-secondary uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <FileDown className="h-3.5 w-3.5 text-brand-primary" />
                  {showFullPreview ? 'Read-only Template Preview' : 'Draft Section Outline'}
                </h4>
                <button 
                  onClick={() => setShowFullPreview(!showFullPreview)}
                  className="text-[10px] font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {showFullPreview ? (
                    <><EyeOff className="h-3 w-3" /> Hide Preview</>
                  ) : (
                    <><Eye className="h-3 w-3" /> View Preview</>
                  )}
                </button>
              </div>

              {showFullPreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-grow"
                >
                  <TemplatePreview document={document} />
                </motion.div>
              ) : (
                <div className="space-y-2 flex-grow overflow-y-auto max-h-[180px] pr-1 custom-scrollbar">
                  {document.draftOutline.map((section, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-vanilla-main">
                      <span className="h-5 w-5 rounded-md bg-vanilla-main text-[10px] font-bold text-brand-primary flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-brand-secondary truncate">
                        {section.split('. ')[1] || section}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 text-[10px] text-text-light text-center italic">
                {showFullPreview 
                  ? 'This is a non-editable preview of the expert-vetted clauses.' 
                  : 'Sections automatically comply with standard commercial conventions.'}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="block text-xs font-bold text-text-light">Preparation Time</span>
              <span className="text-sm font-semibold text-brand-secondary font-display">Under 3 minutes (Approx.)</span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <button
                id="modal-detail-invite-btn"
                onClick={() => setIsInviteOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl text-brand-secondary bg-vanilla-secondary hover:bg-vanilla-main active:scale-98 transition-all focus:outline-hidden cursor-pointer border border-vanilla-main"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
              <button
                id="modal-detail-share-btn"
                onClick={handleShare}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-xl text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 active:scale-98 transition-all focus:outline-hidden cursor-pointer border border-brand-primary/15"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </button>
              <button
                id="modal-detail-back-btn"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-3 text-xs font-semibold rounded-xl text-brand-secondary bg-vanilla-main hover:bg-white hover:border hover:border-brand-primary/20 active:scale-98 transition-all focus:outline-hidden cursor-pointer"
              >
                Back to List
              </button>
              <button
                id="modal-detail-start-draft-btn"
                onClick={() => {
                  onClose();
                  onStartDrafting(`Assistant: Draft ${document.title}`);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-brand-primary px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary/90 active:scale-98 transition-all focus:outline-hidden cursor-pointer"
              >
                Start Drafting
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
