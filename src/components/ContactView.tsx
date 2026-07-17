import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Phone, ArrowRight, HelpCircle } from 'lucide-react';
import LayoutContainer from './LayoutContainer';
import { useCMSContext } from '../context/CMSContext';

import Breadcrumbs from './Breadcrumbs';

interface ContactViewProps {
  onBackHome?: () => void;
}

export default function ContactView({ onBackHome }: ContactViewProps) {
  const { contactSettings, submitContactForm } = useCMSContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Pull dynamic CMS settings with local defaults
  const supportEmail = contactSettings?.email || 'support@kartigodraft.com';
  const supportPhone = contactSettings?.phone || '+91 98765 43210';
  const physicalAddress = contactSettings?.address || '123 Innovation Drive, Sector 5\nTech City, Bangalore 560001\nIndia';
  const businessHours = contactSettings?.hours || 'Mon - Fri, 9:00 AM - 6:00 PM IST';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      // Compose full message payload including selected subject
      const fullMessage = `[Subject: ${formData.subject}] ${formData.message}`;
      await submitContactForm(formData.name, formData.email, formData.mobile, fullMessage);
      setStatus('success');
      setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit contact form:', err);
      setStatus('idle');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-vanilla-secondary min-h-screen pt-24 pb-24">
      <LayoutContainer className="pt-4 pb-4">
        <Breadcrumbs 
          onBackHome={onBackHome}
          items={[{ label: 'Contact Support', isActive: true }]} 
        />
      </LayoutContainer>
      <LayoutContainer>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1 bg-brand-primary/10 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-widest"
            >
              Get in Touch
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold text-brand-secondary font-display"
            >
              Contact Kartigo Draft
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-secondary max-w-2xl mx-auto font-medium"
            >
              Have questions or need assistance? Our team is here to help you simplify your professional drafting journey.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-vanilla-main space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-brand-secondary font-display">Communication Channels</h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Email Support</p>
                        <a href={`mailto:${supportEmail}`} className="text-base font-bold text-brand-secondary hover:text-brand-primary transition-colors break-all">
                          {supportEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">WhatsApp & Call Support</p>
                        <a href={`tel:${supportPhone}`} className="text-base font-bold text-brand-secondary hover:text-brand-primary transition-colors">
                          {supportPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Business Hours</p>
                        <p className="text-base font-bold text-brand-secondary">
                          {businessHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-vanilla-main space-y-6">
                  <h3 className="text-xl font-bold text-brand-secondary font-display">Company Information</h3>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-vanilla-secondary flex items-center justify-center text-text-light">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-brand-secondary">AKYIN Ventures</p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                        {physicalAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Shortcut */}
              <div className="bg-brand-primary/5 rounded-[32px] p-8 border border-brand-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="w-6 h-6 text-brand-primary" />
                  <h4 className="text-lg font-bold text-brand-secondary">Quick Questions?</h4>
                </div>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                  Browse our frequently asked questions for instant answers to common queries.
                </p>
                <button 
                  onClick={() => {
                    const faq = document.getElementById('faq-section');
                    if(faq) faq.scrollIntoView({behavior: 'smooth'});
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
                >
                  View FAQ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-vanilla-main relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-20 space-y-6"
                    >
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-brand-secondary font-display">Message Received!</h2>
                      <p className="text-text-secondary max-w-md mx-auto text-lg">
                        Thank you! We've received your message and will get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:scale-105 transition-all"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-brand-secondary font-display">Send us a Message</h2>
                        <p className="text-sm text-text-secondary font-medium">Fill out the form below and we'll reply within 24 hours.</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest ml-1">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              required
                              className="w-full bg-vanilla-secondary/50 border-2 border-vanilla-main focus:border-brand-primary rounded-2xl px-5 py-4 text-sm font-bold text-brand-secondary placeholder:text-text-light/50 transition-all outline-hidden"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest ml-1">Email Address *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="john@example.com"
                              required
                              className="w-full bg-vanilla-secondary/50 border-2 border-vanilla-main focus:border-brand-primary rounded-2xl px-5 py-4 text-sm font-bold text-brand-secondary placeholder:text-text-light/50 transition-all outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest ml-1">Mobile Number</label>
                            <input
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              placeholder="+91 98765 43210"
                              className="w-full bg-vanilla-secondary/50 border-2 border-vanilla-main focus:border-brand-primary rounded-2xl px-5 py-4 text-sm font-bold text-brand-secondary placeholder:text-text-light/50 transition-all outline-hidden"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest ml-1">Subject *</label>
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                              className="w-full bg-vanilla-secondary/50 border-2 border-vanilla-main focus:border-brand-primary rounded-2xl px-5 py-4 text-sm font-bold text-brand-secondary transition-all outline-hidden appearance-none"
                            >
                              <option value="">Select a subject</option>
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="Billing Issue">Billing Issue</option>
                              <option value="Technical Support">Technical Support</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-light uppercase tracking-widest ml-1">Your Message *</label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us how we can help you..."
                            required
                            rows={5}
                            className="w-full bg-vanilla-secondary/50 border-2 border-vanilla-main focus:border-brand-primary rounded-2xl px-5 py-4 text-sm font-bold text-brand-secondary placeholder:text-text-light/50 transition-all outline-hidden resize-none"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={status === 'submitting'}
                          className="w-full bg-brand-primary text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                          {status === 'submitting' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              Send Message
                              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </LayoutContainer>
    </div>
  );
}
