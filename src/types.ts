export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schemaMarkup?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  popularity: number;
  whyUseIt: string;
  requiredInfo: string[];
  draftOutline: string[];
  relatedDocumentIds?: string[];
  seo?: SEOMetadata;
  slug?: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  content: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string | any;
  status?: 'Available' | 'Coming Soon' | 'Hidden';
  seo?: SEOMetadata;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  delay?: number;
}

export type AppRole = 'User' | 'Support' | 'Admin' | 'Super Admin';

export interface UserLocation {
  country?: string;
  state: string;
  district?: string;
  city: string;
}

export interface BusinessProfile {
  companyName: string;
  address: string;
  gstId?: string;
  authorizedSignatory: string;
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  state: string;
  district?: string;
  city?: string;
  defaultLocation?: UserLocation;
  businessProfile?: BusinessProfile;
  profilePicture?: string;
  language: string;
  timeZone: string;
  role: AppRole;
  createdAt: any;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserSession {
  id: string;
  uid: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: any;
  loginTime: any;
  isCurrent: boolean;
}

export interface UserNotification {
  id: string;
  uid: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: any;
}

export interface PricingRecord {
  id: string; // documentTemplateId or documentType
  basePrice: number; // e.g. 499
  discount: number; // e.g. 100
  gstRate: number; // e.g. 18 (representing 18% GST)
  currency: string; // e.g. "INR"
  features?: string[]; // e.g. ["Pristine PDF Export", "AI-powered Drafts"]
}

export interface OrderRecord {
  id: string; // Order UUID or Razorpay Order ID
  userId: string;
  documentId: string;
  documentTitle: string;
  amount: number; // Final amount paid in INR (rupees)
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'Success';
  paymentId?: string;
  razorpayOrderId?: string;
  userEmail?: string;
  createdAt: any;
  invoiceNo?: string;
  invoiceDate?: any;
  gstRate?: number;
  gstAmount?: number;
  baseAmount?: number;
}
