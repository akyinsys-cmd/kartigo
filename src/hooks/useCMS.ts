import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Category, DocumentTemplate, FAQItem, TestimonialItem, SEOMetadata } from '../types';
import { categories as defaultCategories, documents as defaultDocuments, faqs as defaultFaqs, testimonials as defaultTestimonials } from '../data/landingData';

export interface CMSHomepageContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  searchPlaceholder: string;
}

export interface CMSAboutContent {
  heroTitle: string;
  heroSubtitle: string;
  ourStory: string;
  mission: string;
  vision: string;
  values: { title: string; desc: string }[];
}

export interface CMSContactSettings {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
}

export interface CMSAdSenseConfig {
  publisherId: string;
  autoAds: boolean;
  manualAds: boolean;
  pageSettings: {
    home: boolean;
    categories: boolean;
    blog: boolean;
    search: boolean;
    help: boolean;
  };
  positions: {
    homepageBanner: boolean;
    categoryBanner: boolean;
    blogTop: boolean;
    blogMiddle: boolean;
    blogBottom: boolean;
    searchResults: boolean;
  };
}

export interface CMSSEOSettings {
  globalTitlePattern?: string;
  globalDescription?: string;
  defaultOgImage?: string;
  robotsTxt: string;
  googleVerificationId?: string;
  titlePattern?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  categoryTitlePattern?: string;
  documentTitlePattern?: string;
  documentDescriptionPattern?: string;
}

export interface CMSContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: any;
  status: 'unread' | 'read' | 'resolved';
}

export interface CMSComingSoonRequest {
  id: string;
  email: string;
  targetName: string;
  targetType: 'feature' | 'category' | 'document';
  createdAt: any;
}

export function useCMS() {
  const { profile, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [homepageContent, setHomepageContent] = useState<CMSHomepageContent>({
    heroHeadline: "Expert-Grade Business & Legal Documents in Minutes",
    heroSubheadline: "Draft, customize, and sign legally compliant agreements, NDAs, HR letters, and partnerships powered by intelligent legal workflows.",
    heroPrimaryCta: "Talk to our assistant",
    heroSecondaryCta: "Browse Templates",
    searchPlaceholder: "Search 100+ documents (e.g. rent receipt, NDA...)"
  });
  const [aboutContent, setAboutContent] = useState<CMSAboutContent>({
    heroTitle: "Empowering Everyone with Expert-Grade Agreements",
    heroSubtitle: "Kartigo Draft is built by AKYIN Ventures to democratize high-quality drafting through AI.",
    ourStory: "Founded in 2024, AKYIN Ventures set out to build an alternative to expensive legal consultation for routine paperwork. Our flagship tool, Kartigo Draft, utilizes advanced retrieval workflows to make documents easily accessible to businesses, HR officers, tenants, and developers.",
    mission: "To eliminate drafting barriers, saving time and money for scaling startups and individuals alike.",
    vision: "A world where secure, legally sound paperwork is generated, finalized, and executed in under ten minutes.",
    values: [
      { title: "Rigorous Precision", desc: "Every template is drafted and reviewed by senior professionals to conform to strict regulatory guidelines." },
      { title: "Empathetic Design", desc: "We replace intimidating, complex multi-page wizards with clear, conversational dialogue guided by our assistant." },
      { title: "Ironclad Security", desc: "Your data is strictly confidential, encrypted at rest, and completely private." }
    ]
  });
  const [contactSettings, setContactSettings] = useState<CMSContactSettings>({
    email: "support@kartigo.online",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    address: "AKYIN Ventures, Tower B, Level 14, Tech Park, Pune, MH, India",
    hours: "Mon - Sat: 9:00 AM - 6:00 PM IST"
  });
  const [adsenseSettings, setAdsenseSettings] = useState<CMSAdSenseConfig>({
    publisherId: "ca-pub-1458660397090011",
    autoAds: true,
    manualAds: true,
    pageSettings: {
      home: true,
      categories: true,
      blog: true,
      search: true,
      help: true
    },
    positions: {
      homepageBanner: true,
      categoryBanner: true,
      blogTop: true,
      blogMiddle: true,
      blogBottom: true,
      searchResults: true
    }
  });
  const [seoSettings, setSeoSettings] = useState<CMSSEOSettings>({
    globalTitlePattern: "Kartigo Draft | {Page Title}",
    globalDescription: "Generate legally compliant business agreements, NDAs, offer letters, and contracts in minutes with Kartigo Draft.",
    defaultOgImage: "https://kartigo.online/assets/og-image.jpg",
    robotsTxt: "User-agent: *\nDisallow: /admin/\nDisallow: /dashboard/\nSitemap: https://kartigo.online/sitemap.xml",
    googleVerificationId: "google-site-verification-1234567890"
  });

  const [contactMessages, setContactMessages] = useState<CMSContactMessage[]>([]);
  const [comingSoonRequests, setComingSoonRequests] = useState<CMSComingSoonRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to determine if user is admin
  const isAdmin = profile?.role?.toLowerCase() === 'admin' || profile?.role?.toLowerCase() === 'super_admin' || user?.email === 'nyikatraders@gmail.com';

  // Initialize and Seed empty Firestore collections
  useEffect(() => {
    let active = true;

    const loadCMSData = async () => {
      try {
        // 1. Fetch Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty && active) {
          // Seed categories only if admin
          if (isAdmin) {
            for (const cat of defaultCategories) {
              await setDoc(doc(db, 'categories', cat.id), cat);
            }
          }
          setCategories(defaultCategories);
        } else if (active) {
          const cats: Category[] = [];
          catSnap.forEach(d => cats.push(d.data() as Category));
          setCategories(cats);
        }

        // 2. Fetch Documents
        const docSnap = await getDocs(collection(db, 'documents'));
        if (docSnap.empty && active) {
          // Seed documents only if admin
          if (isAdmin) {
            for (const d of defaultDocuments) {
              const docWithPrice = { ...d, price: 499 };
              await setDoc(doc(db, 'documents', d.id), docWithPrice);
            }
          }
          setDocuments(defaultDocuments.map(d => ({ ...d, price: 499 } as any)));
        } else if (active) {
          const docs: DocumentTemplate[] = [];
          docSnap.forEach(d => docs.push(d.data() as DocumentTemplate));
          setDocuments(docs);
        }

        // 3. Fetch FAQs
        const faqSnap = await getDocs(collection(db, 'faqs'));
        if (faqSnap.empty && active) {
          // Seed FAQs only if admin
          if (isAdmin) {
            for (const f of defaultFaqs) {
              await setDoc(doc(db, 'faqs', f.id), { ...f, category: 'general', updatedAt: new Date().toISOString() });
            }
          }
          setFaqs(defaultFaqs);
        } else if (active) {
          const fqs: FAQItem[] = [];
          faqSnap.forEach(d => fqs.push(d.data() as FAQItem));
          setFaqs(fqs);
        }

        // 4. Fetch Testimonials
        const testSnap = await getDocs(collection(db, 'testimonials'));
        if (testSnap.empty && active) {
          // Seed testimonials only if admin
          if (isAdmin) {
            for (const t of defaultTestimonials) {
              await setDoc(doc(db, 'testimonials', t.id), { ...t, isFeatured: true, isHidden: false });
            }
          }
          setTestimonials(defaultTestimonials);
        } else if (active) {
          const tsts: TestimonialItem[] = [];
          testSnap.forEach(d => tsts.push(d.data() as TestimonialItem));
          setTestimonials(tsts);
        }

        // 5. Fetch Homepage Content
        const hpDoc = await getDocs(collection(db, 'homepageSections'));
        if (hpDoc.empty && active) {
          const defaultHp = {
            id: 'hero',
            sectionName: 'Hero & Search',
            content: {
              heroHeadline: "Expert-Grade Business & Legal Documents in Minutes",
              heroSubheadline: "Draft, customize, and sign legally compliant agreements, NDAs, HR letters, and partnerships powered by intelligent legal workflows.",
              heroPrimaryCta: "Talk to our assistant",
              heroSecondaryCta: "Browse Templates",
              searchPlaceholder: "Search 100+ documents (e.g. rent receipt, NDA...)"
            },
            isActive: true,
            updatedAt: new Date().toISOString()
          };
          if (isAdmin) {
            await setDoc(doc(db, 'homepageSections', 'hero'), defaultHp);
          }
          setHomepageContent(defaultHp.content);
        } else if (active) {
          const heroSec = hpDoc.docs.find(d => d.id === 'hero');
          if (heroSec) {
            setHomepageContent(heroSec.data().content);
          }
        }

        // 6. Fetch About Us Content
        const configAbout = await getDocs(collection(db, 'websitePages'));
        const aboutSec = configAbout.docs.find(d => d.id === 'about');
        if (!aboutSec && active) {
          const defaultAbout = {
            id: 'about',
            slug: 'about-us',
            title: 'About Us',
            content: {
              heroTitle: "Empowering Everyone with Expert-Grade Agreements",
              heroSubtitle: "Kartigo Draft is built by AKYIN Ventures to democratize high-quality drafting through AI.",
              ourStory: "Founded in 2024, AKYIN Ventures set out to build an alternative to expensive legal consultation for routine paperwork. Our flagship tool, Kartigo Draft, utilizes advanced retrieval workflows to make documents easily accessible to businesses, HR officers, tenants, and developers.",
              mission: "To eliminate drafting barriers, saving time and money for scaling startups and individuals alike.",
              vision: "A world where secure, legally sound paperwork is generated, finalized, and executed in under ten minutes.",
              values: [
                { title: "Rigorous Precision", desc: "Every template is drafted and reviewed by senior professionals to conform to strict regulatory guidelines." },
                { title: "Empathetic Design", desc: "We replace intimidating, complex multi-page wizards with clear, conversational dialogue guided by our assistant." },
                { title: "Ironclad Security", desc: "Your data is strictly confidential, encrypted at rest, and completely private." }
              ]
            },
            updatedAt: new Date().toISOString()
          };
          if (isAdmin) {
            await setDoc(doc(db, 'websitePages', 'about'), defaultAbout);
          }
          setAboutContent(defaultAbout.content);
        } else if (aboutSec && active) {
          setAboutContent(aboutSec.data().content);
        }

        // 7. Fetch Contact Info Settings
        const settingsContact = configAbout.docs.find(d => d.id === 'contact');
        if (!settingsContact && active) {
          const defaultContact = {
            id: 'contact',
            slug: 'contact-us',
            title: 'Contact Us Settings',
            content: {
              email: "support@kartigo.online",
              phone: "+91 98765 43210",
              whatsapp: "+91 98765 43210",
              address: "AKYIN Ventures, Tower B, Level 14, Tech Park, Pune, MH, India",
              hours: "Mon - Sat: 9:00 AM - 6:00 PM IST"
            },
            updatedAt: new Date().toISOString()
          };
          if (isAdmin) {
            await setDoc(doc(db, 'websitePages', 'contact'), defaultContact);
          }
          setContactSettings(defaultContact.content);
        } else if (settingsContact && active) {
          setContactSettings(settingsContact.data().content);
        }

        // 8. Fetch AdSense Config
        const adSnap = await getDocs(collection(db, 'adsenseSettings'));
        if (adSnap.empty && active) {
          const defaultAd = {
            id: 'global',
            publisherId: "ca-pub-1458660397090011",
            autoAds: true,
            manualAds: true,
            pageSettings: {
              home: true,
              categories: true,
              blog: true,
              search: true,
              help: true
            },
            positions: {
              homepageBanner: true,
              categoryBanner: true,
              blogTop: true,
              blogMiddle: true,
              blogBottom: true,
              searchResults: true
            },
            updatedAt: new Date().toISOString()
          };
          if (isAdmin) {
            await setDoc(doc(db, 'adsenseSettings', 'global'), defaultAd);
          }
          setAdsenseSettings(defaultAd as any);
        } else if (active) {
          const globalAd = adSnap.docs.find(d => d.id === 'global');
          if (globalAd) {
            setAdsenseSettings(globalAd.data() as any);
          }
        }

        // 9. Fetch SEO Config
        const seoSnap = await getDocs(collection(db, 'seoSettings'));
        if (seoSnap.empty && active) {
          const defaultSeo = {
            id: 'global',
            globalTitlePattern: "Kartigo Draft | {Page Title}",
            globalDescription: "Generate legally compliant business agreements, NDAs, offer letters, and contracts in minutes with Kartigo Draft.",
            defaultOgImage: "https://kartigo.online/assets/og-image.jpg",
            robotsTxt: "User-agent: *\nDisallow: /admin/\nDisallow: /dashboard/\nSitemap: https://kartigo.online/sitemap.xml",
            googleVerificationId: "google-site-verification-1234567890",
            updatedAt: new Date().toISOString()
          };
          if (isAdmin) {
            await setDoc(doc(db, 'seoSettings', 'global'), defaultSeo);
          }
          setSeoSettings(defaultSeo);
        } else if (active) {
          const globalSeo = seoSnap.docs.find(d => d.id === 'global');
          if (globalSeo) {
            setSeoSettings(globalSeo.data() as any);
          }
        }

        if (active) setLoading(false);
      } catch (err) {
        console.error("Error loading CMS data: ", err);
        if (active) setLoading(false);
      }
    };

    loadCMSData();

    // Listeners for dynamic Admin sync on real-time panels
    let unsubMessages = () => {};
    let unsubComingSoon = () => {};

    if (isAdmin) {
      unsubMessages = onSnapshot(collection(db, 'contactMessages'), (snap) => {
        const msgs: CMSContactMessage[] = [];
        snap.forEach(d => {
          const data = d.data();
          msgs.push({
            id: d.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            createdAt: data.createdAt?.toDate() || new Date(),
            status: data.status || 'unread'
          });
        });
        setContactMessages(msgs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      });

      unsubComingSoon = onSnapshot(collection(db, 'comingSoonRequests'), (snap) => {
        const reqs: CMSComingSoonRequest[] = [];
        snap.forEach(d => {
          const data = d.data();
          reqs.push({
            id: d.id,
            email: data.email,
            targetName: data.targetName,
            targetType: data.targetType,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        setComingSoonRequests(reqs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      });
    }

    return () => {
      active = false;
      unsubMessages();
      unsubComingSoon();
    };
  }, [isAdmin]);

  // Update Category
  const saveCategory = async (category: Category) => {
    await setDoc(doc(db, 'categories', category.id), category);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === category.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
  };

  // Delete Category
  const deleteCategoryDoc = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Update Document Template
  const saveDocumentTemplate = async (docTemplate: DocumentTemplate) => {
    await setDoc(doc(db, 'documents', docTemplate.id), docTemplate);
    setDocuments(prev => {
      const idx = prev.findIndex(d => d.id === docTemplate.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = docTemplate;
        return copy;
      }
      return [...prev, docTemplate];
    });
  };

  // Delete Document Template
  const deleteDocumentTemplateDoc = async (id: string) => {
    await deleteDoc(doc(db, 'documents', id));
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Update FAQ Item
  const saveFAQ = async (faq: FAQItem) => {
    await setDoc(doc(db, 'faqs', faq.id), { ...faq, category: 'general', updatedAt: new Date().toISOString() });
    setFaqs(prev => {
      const idx = prev.findIndex(f => f.id === faq.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = faq;
        return copy;
      }
      return [...prev, faq];
    });
  };

  // Delete FAQ
  const deleteFAQDoc = async (id: string) => {
    await deleteDoc(doc(db, 'faqs', id));
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  // Update Testimonial
  const saveTestimonial = async (testimonial: TestimonialItem) => {
    await setDoc(doc(db, 'testimonials', testimonial.id), { ...testimonial, isFeatured: true, isHidden: false });
    setTestimonials(prev => {
      const idx = prev.findIndex(t => t.id === testimonial.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = testimonial;
        return copy;
      }
      return [...prev, testimonial];
    });
  };

  // Delete Testimonial
  const deleteTestimonialDoc = async (id: string) => {
    await deleteDoc(doc(db, 'testimonials', id));
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  // Save Homepage Settings
  const saveHomepageSections = async (content: CMSHomepageContent) => {
    await updateDoc(doc(db, 'homepageSections', 'hero'), {
      content,
      updatedAt: new Date().toISOString()
    });
    setHomepageContent(content);
  };

  // Save About Us Content
  const saveAboutContent = async (content: CMSAboutContent) => {
    await updateDoc(doc(db, 'websitePages', 'about'), {
      content,
      updatedAt: new Date().toISOString()
    });
    setAboutContent(content);
  };

  // Save Contact Us Settings
  const saveContactSettings = async (content: CMSContactSettings) => {
    await updateDoc(doc(db, 'websitePages', 'contact'), {
      content,
      updatedAt: new Date().toISOString()
    });
    setContactSettings(content);
  };

  // Save AdSense Settings
  const saveAdSenseSettings = async (settings: CMSAdSenseConfig) => {
    await setDoc(doc(db, 'adsenseSettings', 'global'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
    setAdsenseSettings(settings);
  };

  // Save SEO settings & Robots.txt
  const saveSEOSettings = async (settings: CMSSEOSettings) => {
    await setDoc(doc(db, 'seoSettings', 'global'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
    setSeoSettings(settings);
  };

  // Submit Contact Form Query
  const submitContactForm = async (name: string, email: string, phone: string, message: string) => {
    const contactRef = doc(collection(db, 'contactMessages'));
    const payload = {
      id: contactRef.id,
      name,
      email,
      phone,
      message,
      status: 'unread',
      createdAt: serverTimestamp()
    };
    await setDoc(contactRef, payload);
  };

  // Submit Coming Soon Request Notify
  const submitComingSoonRequest = async (email: string, targetName: string, targetType: 'feature' | 'category' | 'document') => {
    const requestRef = doc(collection(db, 'comingSoonRequests'));
    const payload = {
      id: requestRef.id,
      email,
      targetName,
      targetType,
      createdAt: serverTimestamp()
    };
    await setDoc(requestRef, payload);
  };

  // Resolve Contact message
  const updateContactMessageStatus = async (id: string, status: 'unread' | 'read' | 'resolved') => {
    await updateDoc(doc(db, 'contactMessages', id), { status });
  };

  // Delete Contact message
  const deleteContactMessage = async (id: string) => {
    await deleteDoc(doc(db, 'contactMessages', id));
  };

  return {
    categories,
    documents,
    faqs,
    testimonials,
    homepageContent,
    aboutContent,
    contactSettings,
    adsenseSettings,
    seoSettings,
    contactMessages,
    comingSoonRequests,
    loading,
    saveCategory,
    deleteCategory: deleteCategoryDoc,
    saveDocumentTemplate,
    deleteDocumentTemplate: deleteDocumentTemplateDoc,
    saveFAQ,
    deleteFAQ: deleteFAQDoc,
    saveTestimonial,
    deleteTestimonial: deleteTestimonialDoc,
    saveHomepageSections,
    saveAboutContent,
    saveContactSettings,
    saveAdSenseSettings,
    saveSEOSettings,
    submitContactForm,
    submitComingSoonRequest,
    updateContactMessageStatus,
    deleteContactMessage
  };
}
