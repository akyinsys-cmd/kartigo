import React, { createContext, useContext, ReactNode } from 'react';
import { useCMS, CMSHomepageContent, CMSAboutContent, CMSContactSettings, CMSAdSenseConfig, CMSSEOSettings, CMSContactMessage, CMSComingSoonRequest } from '../hooks/useCMS';
import { Category, DocumentTemplate, FAQItem, TestimonialItem } from '../types';

interface CMSContextType {
  categories: Category[];
  documents: DocumentTemplate[];
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  homepageContent: CMSHomepageContent;
  aboutContent: CMSAboutContent;
  contactSettings: CMSContactSettings;
  adsenseSettings: CMSAdSenseConfig;
  seoSettings: CMSSEOSettings;
  contactMessages: CMSContactMessage[];
  comingSoonRequests: CMSComingSoonRequest[];
  loading: boolean;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveDocumentTemplate: (doc: DocumentTemplate) => Promise<void>;
  deleteDocumentTemplate: (id: string) => Promise<void>;
  saveFAQ: (faq: FAQItem) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  saveTestimonial: (testimonial: TestimonialItem) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveHomepageSections: (content: CMSHomepageContent) => Promise<void>;
  saveAboutContent: (content: CMSAboutContent) => Promise<void>;
  saveContactSettings: (content: CMSContactSettings) => Promise<void>;
  saveAdSenseSettings: (settings: CMSAdSenseConfig) => Promise<void>;
  saveSEOSettings: (settings: CMSSEOSettings) => Promise<void>;
  submitContactForm: (name: string, email: string, phone: string, message: string) => Promise<void>;
  submitComingSoonRequest: (email: string, targetName: string, targetType: 'feature' | 'category' | 'document') => Promise<void>;
  updateContactMessageStatus: (id: string, status: 'unread' | 'read' | 'resolved') => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const cms = useCMS();
  return (
    <CMSContext.Provider value={cms}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMSContext() {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
}
