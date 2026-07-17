import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';

export default function ContactSection() {
  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Query', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Newsletter State
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSubmitted, setNewsSubmitted] = useState(false);
  const [newsError, setNewsError] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }

    // Success simulation
    setFormSubmitted(true);
    setFormData({ name: '', email: '', subject: 'General Query', message: '' });
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsError('');

    if (!newsEmail || !newsEmail.includes('@')) {
      setNewsError('Please provide a valid email address.');
      return;
    }

    // Success simulation
    setNewsSubmitted(true);
    setNewsEmail('');
  };

  return (
    <section id="contact-section" className="py-20 bg-vanilla-alt border-t border-vanilla-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-brand-primary/5 px-3.5 py-1.5 rounded-full border border-brand-primary/10">
            Get In Touch
          </span>
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
            Contact Support & Inquiries
          </h2>
          <p className="mt-4 text-sm text-text-secondary max-w-lg mx-auto">
            Need custom templates, have a technical issue, or want to discuss enterprise features? Drop us a line below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Contact Form (7 columns) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[20px] border border-vanilla-main shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold font-display text-brand-secondary mb-1 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-primary" />
                Send Us a Message
              </h3>
              <p className="text-xs text-text-light mb-6">Our average reply rate is under 4 business hours.</p>

              {formSubmitted ? (
                <div id="contact-form-success" className="bg-green-50/70 border border-green-200 rounded-2xl p-6 text-center my-6">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-green-950 font-display">Message Sent Successfully!</h4>
                  <p className="mt-1.5 text-xs text-green-700 leading-relaxed">
                    Thank you for reaching out to Kartigo Draft. One of our support coordinators has received your request and will follow up with you at your provided email shortly.
                  </p>
                  <button
                    id="send-another-message-btn"
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 text-xs font-bold text-brand-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form id="landing-contact-form" onSubmit={handleContactSubmit} className="space-y-4">
                  {formError && (
                    <div id="contact-form-error" className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-brand-primary">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-brand-secondary mb-1.5">
                        Your Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className="block w-full rounded-xl border border-vanilla-main bg-vanilla-secondary px-4 py-2.5 text-xs text-text-cosmic focus:outline-hidden focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-brand-secondary mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className="block w-full rounded-xl border border-vanilla-main bg-vanilla-secondary px-4 py-2.5 text-xs text-text-cosmic focus:outline-hidden focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-bold text-brand-secondary mb-1.5">
                      Subject Matter
                    </label>
                    <select
                      id="contact-subject"
                      className="block w-full rounded-xl border border-vanilla-main bg-vanilla-secondary px-3 py-2.5 text-xs text-text-cosmic focus:outline-hidden focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option>General Query</option>
                      <option>Custom Template Request</option>
                      <option>Technical Issue</option>
                      <option>Billing & Refund</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold text-brand-secondary mb-1.5">
                      Detailed Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      className="block w-full rounded-xl border border-vanilla-main bg-vanilla-secondary px-4 py-2.5 text-xs text-text-cosmic focus:outline-hidden focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                      placeholder="Briefly describe what you need or ask your query..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-bold text-white hover:opacity-95 active:scale-98 transition-all focus:outline-hidden shadow-xs cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Details & Newsletter (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Direct Contact info box */}
            <div className="bg-brand-secondary text-white p-8 rounded-[20px] flex flex-col justify-between flex-grow shadow-xs">
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-4">Direct Contact Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10 shrink-0">
                      <Mail className="h-4.5 w-4.5 text-white" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">Email Support</span>
                      <a href="mailto:support@kartigo.com" className="text-sm font-semibold hover:text-brand-primary transition-colors">
                        support@kartigo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10 shrink-0">
                      <Clock className="h-4.5 w-4.5 text-white" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">Operations Hours</span>
                      <span className="text-sm font-semibold">Monday - Friday, 9:00 AM - 6:00 PM (EST)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10 shrink-0">
                      <MapPin className="h-4.5 w-4.5 text-white" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider font-mono">HQ Office</span>
                      <span className="text-xs font-medium text-gray-200">
                        Kartigo Technologies LLC, 100 Pine Street, San Francisco, CA 94111
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                  Instant Live Assistance Coming Soon
                </span>
              </div>
            </div>

            {/* Newsletter Box */}
            <div className="bg-white p-6 rounded-[20px] border border-vanilla-main shadow-xs">
              <h4 className="text-sm font-extrabold font-display text-brand-secondary">Subscribe to Legal Updates</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Stay updated on fresh commercial laws, tax structures, and get notified when new document categories launch.
              </p>

              {newsSubmitted ? (
                <div id="newsletter-success-box" className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-green-900 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    Subscribed successfully!
                  </p>
                </div>
              ) : (
                <form id="newsletter-form" onSubmit={handleNewsSubmit} className="mt-4 flex flex-col gap-2">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    className="block w-full rounded-xl border border-vanilla-main bg-vanilla-secondary px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-text-cosmic"
                  />
                  {newsError && <p id="newsletter-error-text" className="text-[10px] text-brand-primary font-bold">{newsError}</p>}
                  
                  <button
                    id="newsletter-subscribe-btn"
                    type="submit"
                    className="w-full rounded-xl bg-brand-secondary py-2 text-xs font-bold text-white hover:opacity-95 transition-all cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
