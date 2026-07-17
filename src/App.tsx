import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Sliders, ToggleLeft, ToggleRight, Sparkles, AlertCircle, RotateCcw, Layout, ChevronUp, ChevronDown, ShieldAlert, Loader2, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Header from './components/Header';
import Hero from './components/Hero';
import BrowseDocumentsSection from './components/BrowseDocumentsSection';
import RecentDocumentsSection from './components/RecentDocumentsSection';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import BlogSection from './components/BlogSection';
import FaqAccordion from './components/FaqAccordion';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import DocumentSkeleton from './components/DocumentSkeleton';
import AdSenseSpace from './components/AdSenseSpace';
import DocumentDetailModal from './components/DocumentDetailModal';
import ComingSoonModal from './components/ComingSoonModal';

// Auth context
import { useAuth } from './context/AuthContext';

import AuthModal from './components/AuthModal';
import EmailSimulationOverlay from './components/EmailSimulationOverlay';

// Lazy load heavy views
const DashboardView = lazy(() => import('./components/DashboardView'));
const DocumentAgent = lazy(() => import('./components/DocumentAgent'));
const DocumentEditor = lazy(() => import('./components/DocumentEditor'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const SuperAdminView = lazy(() => import('./components/admin/SuperAdminView'));
const BlogView = lazy(() => import('./components/BlogView'));
const BlogPostView = lazy(() => import('./components/BlogPostView'));
const DocumentLandingView = lazy(() => import('./components/DocumentLandingView'));
const HelpCenterView = lazy(() => import('./components/HelpCenterView'));
const ContactView = lazy(() => import('./components/ContactView'));
const AboutView = lazy(() => import('./components/AboutView'));
const ComingSoonView = lazy(() => import('./components/ComingSoonView'));

import SEOManager from './components/SEOManager';
import MobileBottomNav from './components/MobileBottomNav';
import { DocumentTemplate } from './types';
import { documents } from './data/landingData';
import { useScrollToTop } from './hooks/useScrollToTop';

// Loading fallback component
const ViewLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-12">
    <Loader2 className="h-10 w-10 text-brand-primary animate-spin mb-4" />
    <p className="text-xs font-bold text-brand-secondary font-mono uppercase tracking-widest animate-pulse">Loading Workspace Module...</p>
  </div>
);

export default function App() {
  const { user, profile, loading } = useAuth();

  // Navigation and Views States
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'agent' | 'admin_login' | 'admin' | 'blog' | 'blog_post' | 'doc_landing' | 'help' | 'about' | 'contact' | 'coming_soon'>('landing');
  const [showSplash, setShowSplash] = useState(true);

  // Use the custom hook to force scroll to top on view changes
  useScrollToTop(currentView);

  const [dashboardTab, setDashboardTab] = useState<'overview' | 'agent' | 'profile' | 'security' | 'developer' | 'notifications' | 'future' | 'help' | 'documents' | 'favorites' | 'downloads' | 'orders' | 'drafts' | 'shared' | 'history' | 'pricing' | 'versions'>('overview');
  const [activeSlug, setActiveSlug] = useState('');
  const [initialDraftQuery, setInitialDraftQuery] = useState('');
  const [initialDraftMethod, setInitialDraftMethod] = useState<'form' | 'chat' | undefined>(undefined);
  const [activeDoc, setActiveDoc] = useState<{ id: string; content: string; title: string; documentType: string } | null>(null);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  // Authentication Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authCustomMessage, setAuthCustomMessage] = useState<string | undefined>();

  // Disable browser scroll restoration to prevent jumping on load
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Force scroll to top on first mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Force scroll top with multiple attempts
  const forceScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const anchor = document.getElementById('top-anchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'instant' });
    }
  };

  // Scroll lock and force top during splash/loading
  useEffect(() => {
    if (showSplash || loading) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      
      forceScrollToTop();
      const t1 = setTimeout(forceScrollToTop, 10);
      const t2 = setTimeout(forceScrollToTop, 100);
      const t3 = setTimeout(forceScrollToTop, 300);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [showSplash, loading]);

  // Final scroll anchor for landing view transitions to ensure hero is pinned
  useEffect(() => {
    if (currentView === 'landing' && !showSplash && !loading) {
      forceScrollToTop();
      
      const t1 = setTimeout(forceScrollToTop, 100);
      const t2 = setTimeout(forceScrollToTop, 500);
      const t3 = setTimeout(forceScrollToTop, 1000); // Final insurance scroll
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentView, showSplash, loading]);

  // Coming Soon Waitlist Modal States
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [comingSoonType, setComingSoonType] = useState<'feature' | 'category'>('feature');
  
  const [selectedDocument, setSelectedDocument] = useState<DocumentTemplate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // AdSense Simulation States
  const [showAds, setShowAds] = useState(false);
  const [debugOutlines, setDebugOutlines] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);

  // Active section scroll tracking for landing page navigation
  const [activeSection, setActiveSection] = useState('hero');

  // Automatically route to Dashboard after login, and landing after logout
  useEffect(() => {
    // If they are in the admin flow, don't redirect them based on normal user auth state
    if (currentView === 'admin' || currentView === 'admin_login') return;
    
    if (user) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('landing');
    }
  }, [user]);

  // Triggered when a CTA button of coming soon feature is clicked
  const handleOpenComingSoon = (featureName: string, type: 'feature' | 'category' = 'feature') => {
    setComingSoonFeature(featureName);
    setComingSoonType(type);
    if (type === 'category') {
      setCurrentView('coming_soon');
    } else {
      setIsComingSoonOpen(true);
    }
  };

  // Open Auth modal directly
  const handleOpenAuth = (mode?: 'login' | 'register', message?: string) => {
    setAuthInitialMode(mode || 'login');
    setAuthCustomMessage(message);
    setIsAuthModalOpen(true);
  };

  // Triggered when clicking Learn More on any document
  const handleOpenDocumentDetail = (doc: DocumentTemplate) => {
    setSelectedDocument(doc);
    setCurrentView('doc_landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStartDrafting = (docTitle?: string, method?: 'form' | 'chat') => {
    setIsDetailOpen(false);
    if (docTitle && typeof docTitle === 'string') {
      setInitialDraftQuery(docTitle);
    } else {
      setInitialDraftQuery('');
    }
    setInitialDraftMethod(method);
    // Allow guests to start drafting
    setCurrentView('agent');
  };

  // Scroll smooth to browse documents section
  const handleBrowseDocuments = () => {
    setCurrentView('landing');
    setTimeout(() => {
      const target = document.getElementById('search-filter-section');
      if (target) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = target.getBoundingClientRect().top;
        const offsetPosition = elementRect - bodyRect - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Global Keyboard Shortcuts for power users: Alt+Shift+H (Home), Alt+Shift+D (Dashboard), Alt+Shift+C (Help Center)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global navigation shortcuts (Alt+Shift)
      if (e.altKey && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'h') {
          e.preventDefault();
          setCurrentView('landing');
          setShortcutFeedback('Navigated to Home (Alt+Shift+H)');
          setTimeout(() => setShortcutFeedback(null), 3000);
        } else if (key === 'd') {
          e.preventDefault();
          if (user) {
            setCurrentView('dashboard');
            setShortcutFeedback('Navigated to Dashboard (Alt+Shift+D)');
          } else {
            handleOpenAuth('login', 'Please sign in to access the Dashboard.');
            setShortcutFeedback('Login required for Dashboard');
          }
          setTimeout(() => setShortcutFeedback(null), 3000);
        } else if (key === 'c') {
          e.preventDefault();
          setCurrentView('help');
          setShortcutFeedback('Navigated to Help Center (Alt+Shift+C)');
          setTimeout(() => setShortcutFeedback(null), 3000);
        }
      } 
      // Document editing shortcuts (Alt)
      else if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          // Dispatch custom event for document editor to intercept
          window.dispatchEvent(new CustomEvent('kartigo:save-draft'));
          setShortcutFeedback('Saving Draft... (Alt+S)');
          setTimeout(() => setShortcutFeedback(null), 3000);
        } else if (key === 'p') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('kartigo:preview-doc'));
          setShortcutFeedback('Previewing Document... (Alt+P)');
          setTimeout(() => setShortcutFeedback(null), 3000);
        } else if (key === 'e') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('kartigo:export-pdf'));
          setShortcutFeedback('Exporting PDF... (Alt+E)');
          setTimeout(() => setShortcutFeedback(null), 3000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Set up intersection observer to track active section for sticky navbar highlighting (only relevant in landing page)
  useEffect(() => {
    if (currentView !== 'landing' || showSplash) return;

    const sections = ['hero', 'search-filter-section', 'pricing-section', 'blog-section', 'contact-section'];
    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: '-30% 0px -60% 0px' // triggers when section occupies the main viewing zone
        }
      );
      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.element);
      });
    };
  }, [currentView, showSplash]);

  return (
    <div className={`min-h-screen bg-vanilla-secondary font-sans text-text-cosmic selection:bg-vanilla-main selection:text-brand-primary overflow-x-hidden ${debugOutlines ? 'debug-outlines-enabled' : ''}`}>
      
      <AnimatePresence>
        {(loading || showSplash) && (
          <motion.div
            key="splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-vanilla-secondary"
          >
            <SplashScreen onComplete={() => setShowSplash(false)} />
            {loading && (
              <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center">
                <div className="w-48 h-1 bg-vanilla-main rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
                <h2 className="mt-4 text-[10px] font-bold text-brand-secondary tracking-[0.2em] uppercase opacity-60">Authenticating Securely</h2>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sticky Header Navigation */}
      <Header
        onOpenAuth={handleOpenAuth}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSelectDashboardTab={setDashboardTab}
      />

      {/* Main Content Area */}
      <main className="max-w-100vw">
        <Suspense fallback={<ViewLoader />}>
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={`editor_${activeDoc.id}`}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#F1FEC8] min-h-[calc(100vh-80px)] pt-20 px-4 sm:px-6 lg:px-8 pb-10 text-left w-full"
              >
                <div className="max-w-7xl mx-auto">
                  <DocumentEditor
                    documentId={activeDoc.id}
                    initialContent={activeDoc.content}
                    documentType={activeDoc.documentType}
                    initialTitle={activeDoc.title}
                    userId={user?.uid}
                    onOpenAuth={(mode, msg) => handleOpenAuth(mode || 'register', msg)}
                    onClose={() => setActiveDoc(null)}
                  />
                </div>
              </motion.div>
            ) : currentView === 'admin_login' ? (
              <motion.div
                key="admin_login"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <AdminLogin onLoginSuccess={() => setCurrentView('admin')} onBack={() => setCurrentView('landing')} />
              </motion.div>
            ) : currentView === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <SuperAdminView onLogout={() => setCurrentView('landing')} />
              </motion.div>
            ) : currentView === 'landing' ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col relative w-full"
              >
                <div id="top-anchor" style={{ height: '1px', visibility: 'hidden', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }} />
                {/* Hero Section */}
                <Hero
                  isReady={!showSplash && !loading}
                  onTalkToAgent={() => setCurrentView('agent')}
                  onBrowseDocuments={handleBrowseDocuments}
                  onOpenComingSoon={handleStartDrafting}
                />

                {/* AdSense Space: Top Banner - Now moved below Hero to ensure Hero is always first */}
                <AdSenseSpace
                  id="adsense-top-banner"
                  type="top-banner"
                  showAdPlaceholders={showAds}
                  className="my-8"
                />

                <div className="flex flex-col gap-12">
                  <RecentDocumentsSection 
                    onStartDrafting={handleStartDrafting} 
                    onOpenDashboard={(tab) => { setDashboardTab(tab); setCurrentView('dashboard'); }} 
                  />

                  {/* Search Bar, Categories & Popular Document Cards */}
                  <BrowseDocumentsSection
                    onOpenComingSoon={(name) => handleOpenComingSoon(name, 'category')}
                    onOpenDocumentDetail={handleOpenDocumentDetail}
                    onStartDrafting={handleStartDrafting}
                  />

                  {/* Workflow: How It Works */}
                  <HowItWorks />

                  {/* Pricing Plans */}
                  <PricingSection onOpenComingSoon={handleStartDrafting} />

                  {/* FAQ Accordions with expandable sections */}
                  <FaqAccordion />
                </div>
              </motion.div>
            ) : currentView === 'agent' ? (
              <motion.div
                key="agent"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-8 flex flex-col gap-6 w-full"
              >
                <DocumentAgent 
                  initialQuery={initialDraftQuery} 
                  initialMethod={initialDraftMethod}
                  onOpenAuth={(mode, msg) => handleOpenAuth(mode || 'register', msg)}
                  onOpenEditor={(docId, content, title, documentType) => setActiveDoc({ id: docId, content, title, documentType })}
                />
              </motion.div>
            ) : currentView === 'blog' ? (
              <motion.div
                key="blog"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-16 flex flex-col gap-6 w-full"
              >
                <BlogView 
                  onReadPost={(slug) => { setActiveSlug(slug); setCurrentView('blog_post'); }} 
                  onNavigateHome={() => setCurrentView('landing')} 
                />
              </motion.div>
            ) : currentView === 'blog_post' ? (
              <motion.div
                key="blog_post"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-16 flex flex-col gap-6 w-full"
              >
                <BlogPostView 
                  slug={activeSlug} 
                  onBack={() => setCurrentView('blog')} 
                  onNavigateDocument={(id) => { setActiveSlug(id); setCurrentView('doc_landing'); }} 
                />
              </motion.div>
            ) : currentView === 'doc_landing' ? (
              <motion.div
                key="doc_landing"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-16 flex flex-col gap-6 w-full"
              >
                {selectedDocument && (
                  <DocumentLandingView 
                    document={selectedDocument}
                    onBack={() => setCurrentView('landing')} 
                    onStartDrafting={(doc, method) => handleStartDrafting(doc.title, method)} 
                    relatedDocuments={
                      // Simple related documents logic: same category
                      documents
                        .filter(d => d.category === selectedDocument.category && d.id !== selectedDocument.id)
                        .slice(0, 3)
                    }
                  />
                )}
              </motion.div>
            ) : currentView === 'help' ? (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-16 flex flex-col gap-6 w-full"
              >
                <HelpCenterView onNavigateHome={() => setCurrentView('landing')} />
              </motion.div>
            ) : currentView === 'about' ? (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <AboutView onBackHome={() => setCurrentView('landing')} onStartDrafting={() => setCurrentView('agent')} />
              </motion.div>
            ) : currentView === 'contact' ? (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <ContactView onBackHome={() => setCurrentView('landing')} />
              </motion.div>
            ) : currentView === 'coming_soon' ? (
              <motion.div
                key="coming_soon"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <ComingSoonView 
                  onBack={() => setCurrentView('landing')} 
                  onBrowseAvailable={handleBrowseDocuments} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <DashboardView
                  onBrowseDocuments={handleBrowseDocuments}
                  activeTab={dashboardTab}
                  setActiveTab={setDashboardTab}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {currentView === 'landing' || currentView === 'about' || currentView === 'contact' || currentView === 'help' ? (
        // Detailed footer with links and social coordinates (only visible on landing page for a clean dashboard view)
        <Footer
          onOpenComingSoon={handleOpenComingSoon}
          onNavigateToBlog={() => setCurrentView('blog')}
          onNavigateToHelpCenter={() => setCurrentView('help')}
          onNavigateToAbout={() => setCurrentView('about')}
          onNavigateToContact={() => setCurrentView('contact')}
        />
      ) : null}

      {/* Modal: Specific Document Details overlay */}
      <DocumentDetailModal
        isOpen={isDetailOpen}
        document={selectedDocument}
        onClose={() => setIsDetailOpen(false)}
        onStartDrafting={handleStartDrafting}
      />

      {/* Modal: Central Coming Soon waitlist subscriber handler */}
      <ComingSoonModal
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        featureName={comingSoonFeature}
      />

      {/* Authentication Modal Flow */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        message={authCustomMessage}
      />

      {/* Email simulation transaction outbox overlay */}
      <EmailSimulationOverlay />

      {/* Interactive Admin Panel Simulator Control Center - Floating Bottom Left (Admin Only) */}
      {(profile?.role === 'Admin' || profile?.role === 'Super Admin') && (
        <div id="admin-sim-trigger" className="fixed bottom-5 left-5 z-50 max-w-[280px] sm:max-w-xs w-72">
          <div className="bg-white/95 backdrop-blur-md rounded-[24px] border-2 border-brand-secondary/15 shadow-2xl overflow-hidden transition-all duration-300">
            
            {/* Header - click to toggle expand */}
            <div 
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="px-4 py-3 bg-brand-secondary text-white flex items-center justify-between cursor-pointer hover:bg-brand-secondary/95 transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <Sliders className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold leading-tight font-display tracking-wide">Admin Control Center</span>
                  <span className="text-[9px] font-medium text-white/70">Simulation & Diagnostics</span>
                </div>
              </div>
              <div>
                {isAdminOpen ? (
                  <ChevronDown className="h-4 w-4 text-white/80" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-white/80" />
                )}
              </div>
            </div>

            {/* Expandable Panel Body */}
      
              {isAdminOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-brand-secondary/10"
                >
                  <div className="p-3.5 space-y-3 bg-white text-text-cosmic text-left">
                    
                    {/* Option 1: AdSense Simulation */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-vanilla-secondary border border-vanilla-main/60">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="text-xs font-bold text-brand-secondary">Simulate AdSense Ads</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-normal">
                          Show reserved Google AdSense blocks.
                        </p>
                      </div>
                      <button
                        id="toggle-adsense-preview"
                        onClick={() => setShowAds(!showAds)}
                        className="focus:outline-hidden hover:scale-105 active:scale-95 transition-all duration-300 ease-out shrink-0"
                        aria-label="Toggle AdSense Space Placeholders"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showAds ? 'on' : 'off'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {showAds ? (
                              <ToggleRight className="h-7 w-7 text-brand-primary" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-text-light" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>

                    {/* Option 2: Debug Outlines */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-vanilla-secondary border border-vanilla-main/60">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Layout className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs font-bold text-brand-secondary">Debug Outlines</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-normal">
                          Show red boundaries on container borders.
                        </p>
                      </div>
                      <button
                        onClick={() => setDebugOutlines(!debugOutlines)}
                        className="focus:outline-hidden hover:scale-105 active:scale-95 transition-all duration-300 ease-out shrink-0"
                        aria-label="Toggle Debug Outlines"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={debugOutlines ? 'on' : 'off'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {debugOutlines ? (
                              <ToggleRight className="h-7 w-7 text-brand-primary" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-text-light" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>

                    {/* Preset Selector */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="sim-preset" className="text-[10px] font-bold text-text-light uppercase tracking-wider font-mono">Load Preset</label>
                        <select 
                          id="sim-preset"
                          className="w-full bg-vanilla-secondary border border-vanilla-main rounded-xl px-3 py-2 text-xs font-medium text-brand-secondary focus:outline-hidden focus:ring-1 focus:ring-brand-primary/50 cursor-pointer"
                          onChange={(e) => {
                            const preset = e.target.value;
                            if (preset === 'high-density') {
                              setShowAds(true);
                              setDebugOutlines(false);
                            } else if (preset === 'clean') {
                              setShowAds(false);
                              setDebugOutlines(false);
                            } else if (preset === 'dev-debug') {
                              setShowAds(true);
                              setDebugOutlines(true);
                            }
                            // Reset the select after a short delay so it acts like a command trigger
                            setTimeout(() => { e.target.value = ''; }, 300);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select a preset...</option>
                          <option value="high-density">High Density (All Ads Active)</option>
                          <option value="clean">Clean/Minimal (No Ads, UI Only)</option>
                          <option value="dev-debug">Developer Debug</option>
                        </select>
                      </div>
                    </div>


{/* Log Application State */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={() => {
                          console.log("=== APP STATE LOG ===");
                          console.log("Current User Profile:", profile || "Not logged in");
                          console.log("Active View:", currentView);
                          console.log("Dashboard Tab:", dashboardTab);
                          alert("App state logged to browser console.");
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white border border-transparent text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Layout className="h-3.5 w-3.5" />
                        Log Application State
                      </button>
                    </div>

                    {/* High Contrast Mode Toggle */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-vanilla-secondary border border-vanilla-main/60 mt-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Layout className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="text-xs font-bold text-brand-secondary">High Contrast Mode</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-normal">
                          Accessible high-contrast colors.
                        </p>
                      </div>
                      <button
                        onClick={() => setHighContrastMode(!highContrastMode)}
                        className="focus:outline-hidden hover:scale-105 active:scale-95 transition-all duration-300 ease-out shrink-0"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={highContrastMode ? 'on' : 'off'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {highContrastMode ? (
                              <ToggleRight className="h-7 w-7 text-brand-primary" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-text-light" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
                    {/* Mock PDF Export */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={async () => {
                          const { generatePdf } = await import('./lib/document-generator');
                          const blob = await generatePdf("# Mock PDF Test\n\nThis is a diagnostic output generated from the Admin Control Center.", { title: "Diagnostic PDF Export" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'diagnostic-test.pdf');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          alert("Diagnostic PDF exported successfully.");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Execute Mock PDF Export
                      </button>
                    </div>


                    {/* Admin Access */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={() => {
                          setIsAdminOpen(false);
                          setCurrentView('admin_login');
                        }}
                        className="w-full py-2 bg-[#3C1A47] hover:bg-[#2C1335] text-white border border-transparent text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Enter Enterprise Admin Panel
                      </button>
                    </div>

                    {/* Reset All State button */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={() => {
                          setShowAds(false);
                          setDebugOutlines(false);
                          // Clear guest test documents
                          localStorage.removeItem('kartigo_guest_documents');
                          // Dispatch storage event to notify other mounted components (e.g., Dashboard view)
                          window.dispatchEvent(new Event('storage'));
                          
                          alert("Simulation reset complete! Reverted ad simulation state and cleared all generated guest test data.");
                        }}
                        className="w-full py-2 bg-vanilla-alt hover:bg-vanilla-main text-brand-secondary hover:text-brand-primary border border-brand-secondary/15 hover:border-brand-primary/20 text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5 animate-spin-once" />
                        Reset Simulation State
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
      

            {/* Compact visual status footer when collapsed */}
            {!isAdminOpen && (
              <div className="px-4 py-2 bg-vanilla-secondary/50 border-t border-vanilla-main/50 flex items-center justify-between text-[9px] font-mono font-bold text-text-secondary">
                <span className="flex items-center gap-1">
                  Ads: <span className={showAds ? "text-brand-primary" : "text-text-light"}>{showAds ? "ON" : "OFF"}</span>
                </span>
                <span className="flex items-center gap-1">
                  Outlines: <span className={debugOutlines ? "text-brand-primary" : "text-text-light"}>{debugOutlines ? "ON" : "OFF"}</span>
                </span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Shortcut Toast Feedback */}

        {shortcutFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 bg-brand-secondary text-white px-4 py-3 rounded-xl shadow-lg border border-brand-primary/20 text-xs font-bold font-mono flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#FD1843] animate-ping"></span>
            {shortcutFeedback}
          </motion.div>
        )}


      <MobileBottomNav 
        currentView={currentView}
        activeTab={dashboardTab}
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateDashboard={(tab) => { 
          if (!user) {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          } else {
            setDashboardTab(tab as any);
            setCurrentView('dashboard');
          }
        }}
        onStartAgent={handleStartDrafting}
      />
    </div>
  );
}
