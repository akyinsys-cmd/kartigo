import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Facebook, Instagram, Linkedin, Twitter, Globe, ShieldCheck, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

interface FooterProps {
  onOpenComingSoon: (featureName: string) => void;
  onNavigateToBlog?: () => void;
  onNavigateToHelpCenter?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
}

import { SecureBadgeIllustration } from './Illustrations';

export default function Footer({ onOpenComingSoon, onNavigateToBlog, onNavigateToHelpCenter, onNavigateToAbout, onNavigateToContact }: FooterProps) {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    setTimeout(() => {
      setContactStatus('success');
      setTimeout(() => setContactStatus('idle'), 3000);
    }, 1000);
  };

  const getPolicyContent = (type: string) => {
    switch (type) {
      case 'Privacy Policy':
        return {
          title: 'Privacy Policy',
          content: `At Kartigo Draft, your privacy is extremely critical to us...`
        };
      case 'Terms':
        return {
          title: 'Terms & Conditions',
          content: `By accessing Kartigo Draft, you agree to comply with and be bound by the following Terms...`
        };
      case 'Refund Policy':
        return {
          title: 'Refund Policy',
          content: `Given the digital nature of generated documents, all sales are considered final once the document has been downloaded or exported...`
        };
      default:
        return { title: '', content: '' };
    }
  };

  return (
    <footer className="bg-brand-secondary text-white border-t border-brand-primary/20 pt-16 pb-8 max-w-100vw">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                <span>K</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-white tracking-tight leading-none">
                  Kartigo Draft
                </span>
                <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono mt-1">
                  An AKYIN Ventures Product
                </span>
              </div>
            </div>
            <p className="text-sm text-text-light leading-relaxed">
              Kartigo Draft bridges the gap between expensive traditional legal consultancies and unverified internet templates. We empower businesses to generate professional, industry-standard commercial contracts in under three minutes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-vanilla-alt">Quick Links</h3>
            <ul className="space-y-4 text-sm text-text-light text-left">
              <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => { document.getElementById('search-filter-section')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-brand-primary transition-colors cursor-pointer">Categories</button></li>
              <li><button onClick={() => { document.getElementById('recent-documents')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-brand-primary transition-colors cursor-pointer">Popular Documents</button></li>
              <li><button onClick={() => { document.getElementById('pricing-section')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-brand-primary transition-colors cursor-pointer">Pricing</button></li>
              <li><button onClick={() => { onNavigateToAbout?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => { onNavigateToContact?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => { document.getElementById('faq-section')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-brand-primary transition-colors cursor-pointer">FAQ</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-vanilla-alt">Legal</h3>
            <ul className="space-y-4 text-sm text-text-light">
              <li><button onClick={() => setActivePolicy('Privacy Policy')} className="hover:text-brand-primary transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setActivePolicy('Terms')} className="hover:text-brand-primary transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => setActivePolicy('Refund Policy')} className="hover:text-brand-primary transition-colors">Refund Policy</button></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div id="contact-section">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-vanilla-alt">Contact Us</h3>
            <ul className="space-y-4 text-sm text-text-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <span>AKYIN Ventures<br/>123 Innovation Drive<br/>Tech City, 560001</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                <a href="mailto:support@kartigodraft.com" className="hover:text-white transition-colors">support@kartigodraft.com</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand-primary shrink-0" />
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp Support</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-primary shrink-0" />
                <span>Mon - Fri, 9:00 AM - 6:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Embedded Contact Form */}
        <div className="bg-brand-secondary/50 border border-brand-primary/20 rounded-2xl p-6 md:p-8 mb-16 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Send us a message</h3>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Your Name" required className="bg-vanilla-secondary/10 border border-vanilla-main/20 rounded-xl px-4 py-3 text-white placeholder-text-light focus:outline-hidden focus:border-brand-primary" />
              <input type="email" placeholder="Your Email" required className="bg-vanilla-secondary/10 border border-vanilla-main/20 rounded-xl px-4 py-3 text-white placeholder-text-light focus:outline-hidden focus:border-brand-primary" />
            </div>
            <textarea placeholder="How can we help you?" rows={3} required className="w-full bg-vanilla-secondary/10 border border-vanilla-main/20 rounded-xl px-4 py-3 text-white placeholder-text-light focus:outline-hidden focus:border-brand-primary"></textarea>
            <button type="submit" disabled={contactStatus === 'submitting'} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors">
              {contactStatus === 'submitting' ? 'Sending...' : contactStatus === 'success' ? 'Message Sent!' : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="pt-8 border-t border-brand-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-light">
            © {new Date().getFullYear()} Kartigo Draft. Powered by AKYIN Ventures.
          </p>
          <div className="flex items-center gap-4 text-text-light">
            <SecureBadgeIllustration />
            <span className="text-sm">Bank-grade 256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-secondary/80 backdrop-blur-sm"
              onClick={() => setActivePolicy(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-vanilla-secondary rounded-2xl shadow-2xl border border-vanilla-main p-8 max-h-[80vh] overflow-y-auto text-brand-secondary"
            >
              <h2 className="text-2xl font-bold mb-6">{getPolicyContent(activePolicy).title}</h2>
              <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                {getPolicyContent(activePolicy).content}
              </div>
              <button
                onClick={() => setActivePolicy(null)}
                className="mt-8 px-6 py-2 bg-vanilla-alt hover:bg-vanilla-main border border-vanilla-main/50 rounded-xl font-bold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
