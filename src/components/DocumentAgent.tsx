import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Paperclip, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Save, 
  Clock, 
  ArrowRight, 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Languages, 
  X, 
  Sliders, 
  FileText,
  Bookmark,
  ChevronDown,
  Play,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Download,
  Printer,
  ArrowLeft,
  Lock,
  FileCheck,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  Maximize,
  Minimize
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ReviewYourInformation } from './ReviewYourInformation';
import { db } from '../lib/firebase';
import DocumentSkeleton from './DocumentSkeleton';
import { LoadingDocument, SuccessIllustration } from './Illustrations';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { DocumentRelationshipEngine } from './DocumentRelationshipEngine';
import { FeedbackRating } from './FeedbackRating';
import { CheckoutView } from './CheckoutView';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { documents } from '../data/landingData';
import { DocumentTemplate } from '../types';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import GoogleAd from './GoogleAd';
import KartigoLoader from './KartigoLoader';
import Breadcrumbs from './Breadcrumbs';

// Let's define structures for Dynamic Questions
interface QuestionStep {
  id: string;
  label: string;
  questionText: string;
  placeholder: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'textarea';
  options?: string[];
  validationError?: string;
  validationRegex?: RegExp;
  required?: boolean;
}

function detectDocumentFromQuery(query: string): DocumentTemplate | null {
  const clean = query.toLowerCase();
  
  // Specific mappings for common Hindi / Hinglish and casual English phrases
  if (clean.includes('rent') || clean.includes('rental') || clean.includes('kiraya') || clean.includes('kiraye')) {
    if (clean.includes('receipt') || clean.includes('rasid') || clean.includes('receipts')) {
      return documents.find(d => d.id === 'rent-receipt') || null;
    }
    return documents.find(d => d.id === 'rental-agreement') || null;
  }
  if (clean.includes('appointment')) {
    if (clean.includes('order')) {
      return documents.find(d => d.id === 'appointment-order') || null;
    }
    return documents.find(d => d.id === 'appointment-letter') || null;
  }
  if (clean.includes('resignation') || clean.includes('resign') || clean.includes('istifa') || clean.includes('naukri chhodna')) {
    return documents.find(d => d.id === 'resignation-letter') || null;
  }
  if (clean.includes('nda') || clean.includes('confidentiality') || clean.includes('non disclosure') || clean.includes('non-disclosure')) {
    return documents.find(d => d.id === 'nda') || null;
  }
  if (clean.includes('offer letter') || clean.includes('joining letter') || clean.includes('offer')) {
    return documents.find(d => d.id === 'offer-letter') || null;
  }
  if (clean.includes('leave') || clean.includes('chutti') || clean.includes('chuti') || clean.includes('casual leave') || clean.includes('sick leave')) {
    return documents.find(d => d.id === 'leave-letter') || null;
  }
  if (clean.includes('experience') || clean.includes('tenure') || clean.includes('experience certificate')) {
    return documents.find(d => d.id === 'experience-letter') || null;
  }
  if (clean.includes('service agreement') || clean.includes('service contract')) {
    return documents.find(d => d.id === 'service-agreement') || null;
  }
  if (clean.includes('freelancer') || clean.includes('freelance')) {
    return documents.find(d => d.id === 'freelancer-agreement') || null;
  }
  if (clean.includes('vendor') || clean.includes('supplier')) {
    return documents.find(d => d.id === 'vendor-agreement') || null;
  }
  if (clean.includes('bill of sale') || clean.includes('sale receipt')) {
    return documents.find(d => d.id === 'bill-of-sale') || null;
  }
  if (clean.includes('affidavit') || clean.includes('address proof') || clean.includes('pata praman')) {
    return documents.find(d => d.id === 'address-affidavit') || null;
  }
  if (clean.includes('recommendation') || clean.includes('lor')) {
    return documents.find(d => d.id === 'letter-of-recommendation') || null;
  }
  if (clean.includes('co-founder') || clean.includes('cofounder') || clean.includes('founder agreement')) {
    return documents.find(d => d.id === 'co-founder-agreement') || null;
  }

  // Fallback: look if any document title or id is contained within the query
  for (const docObj of documents) {
    const titleLower = docObj.title.toLowerCase();
    const idLower = docObj.id.toLowerCase();
    
    // Check if the query contains the title or id (or vice versa)
    if (clean.includes(titleLower) || titleLower.includes(clean) || clean.includes(idLower)) {
      return docObj;
    }
  }

  return null;
}

interface DocumentAgentProps {
  onOpenEditor?: (docId: string, content: string, title: string, documentType: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register', msg?: string) => void;
  initialQuery?: string;
  initialMethod?: 'form' | 'chat';
  onBackHome?: () => void;
}

function GenerationOverlay({ stage, percent }: { stage: string; percent: number }) {
  const getStageLabel = () => {
    switch(stage) {
      case 'validating': return 'Validating parameters...';
      case 'analyzing': return 'Analyzing legal requirements...';
      case 'missing_info': return 'Checking for missing details...';
      case 'structuring': return 'Structuring document blocks...';
      case 'intel': return 'Injecting business intelligence...';
      case 'quality': return 'Running quality assurance checks...';
      case 'risk_check': return 'Scanning for potential risks...';
      case 'saving': return 'Securing document to cloud...';
      case 'done': return 'Generation Complete!';
      default: return 'Starting Engine...';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="max-w-md w-full space-y-8">
        {stage === 'done' ? (
          <SuccessIllustration />
        ) : (
          <DocumentSkeleton />
        )}
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-brand-secondary font-display">{getStageLabel()}</h3>
          <div className="space-y-2">
            <div className="w-full bg-vanilla-secondary h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold font-mono text-text-light uppercase tracking-widest">
              <span>Kartigo Intelligence Engine</span>
              <span>{percent}%</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
          {stage === 'done' 
            ? 'Your document is ready for review. We have applied professional legal formatting and commercial-grade clauses.'
            : 'Our AI is synthesizing professional legal clauses and formatting your document based on your specific inputs.'}
        </p>
      </div>
    </motion.div>
  );
}

export default function DocumentAgent({ onOpenEditor, onOpenAuth, initialQuery, initialMethod, onBackHome }: DocumentAgentProps = {}) {
  const { user, profile } = useAuth();
  
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [draftStage, setDraftStage] = useState<'chat' | 'form' | 'review' | 'completed'>('chat');
  const [draftMethod, setDraftMethod] = useState<'choice' | 'chat' | 'form'>('choice');
  const [formWizardStep, setFormWizardStep] = useState(0);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [profileInjected, setProfileInjected] = useState(false);
  const [autoInjectProfile, setAutoInjectProfile] = useState(() => {
    return localStorage.getItem('kartigo_auto_inject_profile') === 'true';
  });

  // Preview & Payment States
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    content: string;
    title: string;
    type: string;
    pageCount: number;
    price: number;
  } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Generation States
  const [generationStage, setGenerationStage] = useState<'idle' | 'validating' | 'analyzing' | 'missing_info' | 'structuring' | 'intel' | 'quality' | 'risk_check' | 'saving' | 'done'>('idle');
  const [generationPercent, setGenerationPercent] = useState(0);
  const [focusMode, setFocusMode] = useState(false);

  // Chat & Messaging States
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  
  // Questionnaire & Drafting States
  const [currentDocType, setCurrentDocType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionStep[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  
  // UI & Search States
  const [notif, setNotif] = useState<{ text: string; type: 'success' | 'info' | 'error' | 'save' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['NDA', 'Appointment Letter', 'Rental Agreement']);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeInputRef = useRef<HTMLElement | null>(null);

  // Clear validation errors when navigating steps
  useEffect(() => {
    setValidationError(null);
  }, [currentQuestionIndex, formWizardStep]);

  // Mobile Keyboard Detection & Scroll Into View
  useEffect(() => {
    const handleResize = () => {
      if (activeInputRef.current && window.innerHeight < 500) { // Simple threshold for keyboard presence
        activeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    activeInputRef.current = e.target;
    // Immediate scroll for some browsers
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  useEffect(() => {
    localStorage.setItem('kartigo_auto_inject_profile', autoInjectProfile ? 'true' : 'false');
  }, [autoInjectProfile]);

  const handleGenerateDocument = async () => {
    if (!currentDocType) return;
    setValidationError(null);
    setGenerationStage('validating');
    setGenerationPercent(5);

    try {
      // Step 1: Validating parameters integrity
      await new Promise(r => setTimeout(r, 650));
      setGenerationStage('analyzing');
      setGenerationPercent(15);

      // Step 2: Requirement Analysis
      await new Promise(r => setTimeout(r, 750));
      setGenerationStage('missing_info');
      setGenerationPercent(30);

      // Trigger server-side generation in background
      const serverPromise = fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: currentDocType, answers })
      }).then(r => r.json());

      // Step 3: Missing Information Detector
      await new Promise(r => setTimeout(r, 850));
      setGenerationStage('structuring');
      setGenerationPercent(45);

      // Step 4: Knowledge Engine Structuring
      await new Promise(r => setTimeout(r, 850));
      setGenerationStage('intel');
      setGenerationPercent(60);

      // Step 5: Document Intelligence (Smart Recommendations)
      await new Promise(r => setTimeout(r, 850));
      setGenerationStage('quality');
      setGenerationPercent(75);

      const serverResult = await serverPromise;

      if (serverResult.status === 'incomplete' || serverResult.MISSING_DATA_PROMPT) {
        setGenerationStage('idle');
        setValidationError(serverResult.message || "Missing required information.");
        triggerNotification(serverResult.message || "Missing required information.", "error");
        return;
      }

      // Step 6: Quality Engine
      await new Promise(r => setTimeout(r, 700));
      setGenerationStage('risk_check');
      setGenerationPercent(85);

      // Step 7: Risk Checker
      await new Promise(r => setTimeout(r, 700));
      setGenerationStage('saving');
      setGenerationPercent(95);

      const generatedContent = serverResult.content;
      const documentTitle = `${currentDocType} (${answers.companyName || answers.disclosingParty || answers.landlordName || answers.clientName || 'Draft'})`;

      // Save document to Firestore
      let savedDocId = 'doc_' + Date.now();
      if (user) {
        try {
          const docRef = doc(collection(db, 'documents'));
          savedDocId = docRef.id;
          await setDoc(docRef, {
            id: savedDocId,
            userId: user.uid,
            title: documentTitle,
            documentType: currentDocType,
            content: generatedContent,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPublic: false,
            shareRole: 'view',
            sharePassword: ''
          });
        } catch (err) {
          console.error("Failed to save doc to Firestore", err);
        }
      } else {
        // Save to guest session storage
        const guestDocs = JSON.parse(sessionStorage.getItem('kartigo_guest_documents') || '[]');
        guestDocs.push({
          id: savedDocId,
          title: documentTitle,
          documentType: currentDocType,
          content: generatedContent,
          createdAt: new Date()
        });
        sessionStorage.setItem('kartigo_guest_documents', JSON.stringify(guestDocs));
      }

      setGenerationStage('done');
      setGenerationPercent(100);
      await new Promise(r => setTimeout(r, 1000));
      
      setGenerationStage('idle');
      
      // Instead of jumping to editor, show preview
      setMessages(prev => [...prev, {
        id: (prev.length + 1).toString(),
        sender: 'agent',
        text: `Excellent! I have generated your professional **${documentTitle}**. 
        
You can now review the complete draft below. Once you are satisfied, you can unlock the full version to download, print, and share.`,
        createdAt: new Date().toISOString()
      }]);

      // Word & Page Count calculation for summary
      const wordCount = generatedContent ? generatedContent.trim().split(/\s+/).filter(Boolean).length : 0;
      const pageCount = Math.max(1, Math.ceil(wordCount / 350));

      setPreviewDoc({
        id: savedDocId,
        content: generatedContent,
        title: documentTitle,
        type: currentDocType,
        pageCount,
        price: 499 // Placeholder price for V1.0
      });
    } catch (err) {
      console.error(err);
      setGenerationStage('idle');
      triggerNotification("Generation failed. Please try again.", "error");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUnlock = async () => {
    if (!user) {
      if (onOpenAuth) {
        onOpenAuth('register', 'Create your free account to save your document and unlock professional features like PDF download, Word export, and multi-device cloud access.');
      }
    } else {
      if (!previewDoc) return;
      setIsCheckoutOpen(true);
    }
  };

  const handleInjectProfile = () => {
    const newAnswers = handleInjectProfileData(answers);
    
    setAnswers(newAnswers);
    setProfileInjected(true);
    setShowProfilePrompt(false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'assistant',
      text: "Great! I've automatically injected your saved business profile and location into this drafting session. This will save us time on the standard details.",
      createdAt: new Date()
    }]);
  };

  const handleInjectProfileData = (currentAnswers: Record<string, string>) => {
    const newAnswers = { ...currentAnswers };
    const localLocStr = sessionStorage.getItem('kartigo_default_location');
    const bizStr = sessionStorage.getItem('kartigo_guest_business_profile');
    
    const loc = profile?.defaultLocation || (localLocStr ? JSON.parse(localLocStr) : null);
    const biz = profile?.businessProfile || (bizStr ? JSON.parse(bizStr) : null);

    if (loc?.state) {
      newAnswers['state'] = loc.state;
      newAnswers['jurisdiction'] = `${loc.city || ''}, ${loc.state}`;
    }
    if (loc?.district) newAnswers['district'] = loc.district;
    if (loc?.city) newAnswers['city'] = loc.city;
    
    if (biz?.companyName) {
      newAnswers['companyName'] = biz.companyName;
      newAnswers['clientName'] = biz.companyName; 
      newAnswers['serviceProviderName'] = biz.companyName; 
      newAnswers['employerName'] = biz.companyName;
      newAnswers['partyAName'] = biz.companyName;
      newAnswers['disclosingParty'] = biz.companyName;
      newAnswers['landlordName'] = biz.companyName;
    }
    if (biz?.address) {
      newAnswers['companyAddress'] = biz.address;
      newAnswers['address'] = biz.address;
      newAnswers['partyAAddress'] = biz.address;
      newAnswers['propertyAddress'] = biz.address;
    }
    if (biz?.gstId) {
      newAnswers['gstId'] = biz.gstId;
      newAnswers['companyGst'] = biz.gstId;
      newAnswers['tax_id'] = biz.gstId;
    }
    if (biz?.authorizedSignatory) {
      newAnswers['authorizedSignatory'] = biz.authorizedSignatory;
      newAnswers['signatoryName'] = biz.authorizedSignatory;
      newAnswers['authorized_person'] = biz.authorizedSignatory;
    }
    return newAnswers;
  };

  const renderMarkdownToHtml = (md: string) => {
    if (!md) return '';
    let html = md;
    
    // Simple MD to HTML for preview
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-lg font-bold border-b border-vanilla-main pb-2 mt-4 mb-2">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold border-b border-vanilla-main/50 pb-1 mt-3 mb-2">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n\n/g, '</div><div class="my-3">');
    
    return `<div class="font-sans text-[10px] leading-relaxed text-justify text-text-cosmic/70 select-none">${html}</div>`;
  };
  
  // Language states
  // Custom hook for Language detection and policies
  const { 
    conversationLanguage, 
    setConversationLanguage, 
    settings: languageSettings, 
    detectLanguage, 
    interceptMessage, 
    translateAgentMessage: translateIfNeeded 
  } = useLanguageDetection();

  // Dynamic Questionnaire Loader (Firestore/Backend API)
  const loadQuestionsForDocType = async (docType: string): Promise<QuestionStep[]> => {
    try {
      const response = await axios.get(`/api/questions?docType=${encodeURIComponent(docType)}`);
      if (response.data && response.data.steps) {
        return response.data.steps as QuestionStep[];
      }
    } catch (err) {
      console.error("Failed to load dynamic questions from API:", err);
    }
    // Secure simple local fallback steps if API is down
    return [
      { id: 'state', label: 'State / Region', questionText: 'Which state or region applies?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
      { id: 'partyA', label: 'First Party Name', questionText: 'What is the full legal name of the first party involved?', placeholder: 'e.g. John Doe', type: 'text', required: true },
      { id: 'keyTerms', label: 'Core Scope / Objective', questionText: 'What is the primary agreement, goal, or subject of this contract?', placeholder: 'e.g. A mutual referral partnership...', type: 'textarea', required: true }
    ];
  };
  
  // Questionnaire & Drafting States

  // Auto-save to Firestore every 30 seconds for logged-in users
  useEffect(() => {
    if (!user || !activeConvId || currentQuestionIndex === -1 || draftStage !== 'chat') return;

    const intervalId = setInterval(async () => {
      try {
        const draftRef = doc(db, 'users', user.uid, 'drafts', activeConvId);
        await updateDoc(draftRef, {
          answers,
          currentQuestionIndex,
          history,
          updatedAt: new Date(),
          progress: Math.min(Math.round(((Object.keys(answers).length) / Math.max(1, questions.length)) * 100), 95)
        });
        console.log("Firestore Auto-save successful at 30s interval");
      } catch (err) {
        console.error("Firestore Auto-save failed:", err);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, activeConvId, currentQuestionIndex, answers, history, questions.length, draftStage]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerNotification("Web Speech API is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      triggerNotification("Listening... Speak now.", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      triggerNotification("Voice captured! Sending...", "success");
      
      // Auto-send if transcript is clear
      if (transcript.trim().length > 1) {
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        triggerNotification("Microphone access denied.", "error");
      } else {
        triggerNotification(`Speech error: ${event.error}`, "error");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleDownloadPdf = async () => {
    if (!previewDoc) return;
    
    // Check if the document needs to be unlocked first (unless already verified/unlocked)
    // For V1.0, we allow downloading a watermarked PREVIEW even if not paid.
    if (!isPaymentVerified) {
      triggerNotification("Generating watermarked preview PDF...", "info");
    } else {
      triggerNotification("Generating professional PDF...", "info");
    }

    try {
      // Create a pristine, beautifully-styled container for the off-screen PDF render
      const printContainer = document.createElement('div');
      printContainer.style.padding = '15mm 15mm';
      printContainer.style.background = '#ffffff';
      printContainer.style.color = '#111111';
      printContainer.style.fontFamily = '"Times New Roman", Times, Georgia, serif';
      printContainer.style.fontSize = '10.5pt';
      printContainer.style.lineHeight = '1.5';
      printContainer.style.boxSizing = 'border-box';
      
      // Top header layout
      const headerDiv = document.createElement('div');
      headerDiv.style.display = 'flex';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.borderBottom = '1px solid #cbd5e1';
      headerDiv.style.paddingBottom = '6px';
      headerDiv.style.marginBottom = '20px';
      headerDiv.style.fontSize = '8pt';
      headerDiv.style.fontWeight = 'bold';
      headerDiv.style.color = '#64748b';
      headerDiv.style.textTransform = 'uppercase';
      headerDiv.style.letterSpacing = '0.07em';
      headerDiv.innerHTML = `<span>KARTIGO DRAFT</span><span>${previewDoc.title}</span>`;
      printContainer.appendChild(headerDiv);

      // Watermark Overlay logic for PDFs
      const watermarkText = 'KARTIGO DRAFT – PREVIEW';
      const watermarkContainer = document.createElement('div');
      watermarkContainer.style.position = 'fixed';
      watermarkContainer.style.top = '0';
      watermarkContainer.style.left = '0';
      watermarkContainer.style.width = '100%';
      watermarkContainer.style.height = '100%';
      watermarkContainer.style.zIndex = '9999';
      watermarkContainer.style.pointerEvents = 'none';
      watermarkContainer.style.opacity = '0.05';
      watermarkContainer.style.display = 'flex';
      watermarkContainer.style.flexDirection = 'column';
      watermarkContainer.style.alignItems = 'center';
      watermarkContainer.style.justifyContent = 'center';
      watermarkContainer.style.transform = 'rotate(-45deg)';
      watermarkContainer.style.overflow = 'hidden';

      for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.style.whiteSpace = 'nowrap';
        row.style.fontSize = '40pt';
        row.style.fontWeight = 'bold';
        row.style.margin = '40px 0';
        row.innerText = Array(5).fill(watermarkText).join('      ');
        watermarkContainer.appendChild(row);
      }

      if (!isPaymentVerified) {
        printContainer.appendChild(watermarkContainer);
      }

      // Main Document Title
      const titleEl = document.createElement('h1');
      titleEl.style.fontSize = '17pt';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.color = '#0f172a';
      titleEl.style.marginBottom = '25px';
      titleEl.style.textAlign = 'center';
      titleEl.style.lineHeight = '1.3';
      titleEl.innerText = previewDoc.title;
      printContainer.appendChild(titleEl);

      // Render Markdown to HTML and inject
      const contentDiv = document.createElement('div');
      contentDiv.className = 'prose max-w-none';
      contentDiv.style.textAlign = 'justify';
      
      // Convert Markdown to simple HTML
      let html = previewDoc.content;
      html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      html = html.replace(/^# (.*?)$/gm, '<h1 class="text-lg font-bold border-b border-vanilla-main pb-2 mt-4 mb-2">$1</h1>');
      html = html.replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold border-b border-vanilla-main/50 pb-1 mt-3 mb-2">$1</h2>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\n\n/g, '</div><div class="my-3">');
      
      contentDiv.innerHTML = `<div class="font-sans text-[10.5pt] leading-relaxed text-justify text-slate-800">${html}</div>`;
      
      // Fine-grained styling overrides for print elements
      const paragraphs = contentDiv.getElementsByTagName('p');
      for (let i = 0; i < paragraphs.length; i++) {
        paragraphs[i].style.marginBottom = '12px';
        paragraphs[i].style.fontSize = '10.5pt';
        paragraphs[i].style.color = '#1e293b';
        paragraphs[i].style.lineHeight = '1.6';
      }
      
      const h1s = contentDiv.getElementsByTagName('h1');
      for (let i = 0; i < h1s.length; i++) {
        h1s[i].style.fontSize = '14pt';
        h1s[i].style.fontWeight = 'bold';
        h1s[i].style.marginTop = '22px';
        h1s[i].style.marginBottom = '10px';
        h1s[i].style.color = '#0f172a';
        h1s[i].style.borderBottom = '1px solid #f1f5f9';
        h1s[i].style.paddingBottom = '4px';
      }

      const h2s = contentDiv.getElementsByTagName('h2');
      for (let i = 0; i < h2s.length; i++) {
        h2s[i].style.fontSize = '12pt';
        h2s[i].style.fontWeight = 'bold';
        h2s[i].style.marginTop = '18px';
        h2s[i].style.marginBottom = '8px';
        h2s[i].style.color = '#1e293b';
      }

      const lists = contentDiv.getElementsByTagName('li');
      for (let i = 0; i < lists.length; i++) {
        lists[i].style.fontSize = '10.5pt';
        lists[i].style.marginBottom = '6px';
        lists[i].style.color = '#1e293b';
      }

      printContainer.appendChild(contentDiv);

      // Bottom footer layout
      const footerDiv = document.createElement('div');
      footerDiv.style.display = 'flex';
      footerDiv.style.justifyContent = 'space-between';
      footerDiv.style.borderTop = '1px solid #cbd5e1';
      footerDiv.style.paddingTop = '8px';
      footerDiv.style.marginTop = '35px';
      footerDiv.style.fontSize = '7.5pt';
      footerDiv.style.fontWeight = 'bold';
      footerDiv.style.color = '#94a3b8';
      footerDiv.style.textTransform = 'uppercase';
      footerDiv.style.letterSpacing = '0.07em';
      footerDiv.innerHTML = `<span>DRAFT ID: ${previewDoc.id.substring(0, 8)}</span><span>CONFIDENTIAL & SECURE</span>`;
      printContainer.appendChild(footerDiv);

      // Options configuration for html2pdf.js
      const opt: any = {
        margin: [15, 15, 15, 15], // 15mm print margins
        filename: `${previewDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, // Crisp high-fidelity resolution
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Execute pdf rendering
      await html2pdf().from(printContainer).set(opt).save();
      
      triggerNotification("Pristine PDF exported successfully!", "success");
    } catch (err: any) {
      console.error("PDF download failed", err);
      triggerNotification("Failed to generate offline PDF.", "error");
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (currentDocType && Object.keys(answers).length > 0) {
      localStorage.setItem(`kartigo_autosave_${currentDocType}`, JSON.stringify(answers));
    }
  }, [answers, currentDocType]);

  // Load auto-saved data
  useEffect(() => {
    if (currentDocType) {
      const savedAnswers = localStorage.getItem(`kartigo_autosave_${currentDocType}`);
      
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          // Only load if current answers are empty to avoid overwriting new sessions
          setAnswers(prev => Object.keys(prev).length === 0 ? parsed : prev);
        } catch (e) {
          console.error("Failed to parse auto-saved answers", e);
        }
      }
    }
  }, [currentDocType]);
  // Stage detection
  
  // Mapping stage to timeline
  const getTimelineStage = () => {
    if (draftStage === 'completed') return 'downloaded';
    if (isPaymentVerified) return 'unlocked';
    if (isPaymentProcessing || isPaymentModalOpen) return 'payment';
    if (previewDoc) return 'preview';
    if (Object.keys(answers).length > 0) return 'info';
    return 'draft';
  };
  // UI & Search States

  // Trigger brief floating notifications
  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' | 'save' = 'info') => {
    setNotif({ text, type });
    setTimeout(() => {
      setNotif(null);
    }, 3500);
  };

  // Scroll messages to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isThinking]);

  // Load chat list from Firestore or sessionStorage (if Guest)
  useEffect(() => {
    if (user) {
      // Authenticated User flow: Subscribe to conversations
      const qConv = query(
        collection(db, 'users', user.uid, 'drafts'),
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(qConv, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setConversations(list);
      }, (err) => {
        console.error("Error fetching conversations from Firestore", err);
        triggerNotification("Connection lost. Retrying...", "error");
      });

      return () => unsubscribe();
    } else {
      // Guest User flow: Load from sessionStorage
      const localConvsStr = sessionStorage.getItem('kartigo_guest_conversations');
      if (localConvsStr) {
        try {
          const parsed = JSON.parse(localConvsStr);
          setConversations(parsed);
        } catch (e) {
          console.error("Error parsing guest conversations", e);
        }
      }
    }
  }, [user]);

  // Handle active conversation load
  useEffect(() => {
    if (!activeConvId) {
      // Initialize with fresh default state based on admin language configurations
      const stored = localStorage.getItem('kartigo_admin_language_settings');
      let greeting = "Hello! I'm AI Assistant, your document assistant.\n\nTell me what document you'd like to create today.";
      let initialLang: 'English' | 'Hinglish' = 'English';
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          initialLang = parsed.defaultLanguage || 'English';
          greeting = initialLang === 'Hinglish' ? parsed.greetingHinglish : parsed.greetingEnglish;
        } catch (e) {
          // ignore
        }
      }
      
      setConversationLanguage(initialLang);
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: greeting,
          createdAt: new Date()
        }
      ]);
      
      // Detect saved profile or local location for injection prompt
      const localLoc = sessionStorage.getItem('kartigo_default_location');
      if ((profile && (profile.defaultLocation || profile.businessProfile)) || localLoc) {
        setShowProfilePrompt(true);
      }
      
      setCurrentDocType(null);
      setQuestions([]);
      setCurrentQuestionIndex(-1);
      setAnswers({});
      return;
    }

    const currentConv = conversations.find(c => c.id === activeConvId);
    if (!currentConv) return;

    setCurrentDocType(currentConv.documentType || null);
    
    // Determine questions based on docType
    if (currentConv.documentType) {
      loadQuestionsForDocType(currentConv.documentType).then(qList => {
        setQuestions(qList);
      });
    }

    if (user) {
      // Load messages and answers from Firestore subcollections
      const qMsgs = query(
        collection(db, 'users', user.uid, 'drafts', activeConvId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          msgs.push({
            id: d.id,
            sender: data.sender,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        if (msgs.length > 0) {
          setMessages(msgs);
        }
      });

      const qAns = collection(db, 'users', user.uid, 'drafts', activeConvId, 'draft_answers');
      const unsubAns = onSnapshot(qAns, (snapshot) => {
        const ansMap: Record<string, string> = {};
        snapshot.forEach((d) => {
          const data = d.data();
          ansMap[data.questionId] = data.answer;
        });
        setAnswers(ansMap);
        
        // Compute question index from loaded answers
        if (currentConv.documentType) {
          loadQuestionsForDocType(currentConv.documentType).then(qList => {
            let firstMissingIndex = qList.findIndex(q => !ansMap[q.id]);
            if (firstMissingIndex === -1) firstMissingIndex = qList.length; // all answered
            setCurrentQuestionIndex(firstMissingIndex);
          });
        }
      });

      return () => {
        unsubMsgs();
        unsubAns();
      };
    } else {
      // Load from local storage for Guest
      const guestHistoryStr = sessionStorage.getItem(`kartigo_guest_conv_${activeConvId}`);
      if (guestHistoryStr) {
        try {
          const parsed = JSON.parse(guestHistoryStr);
          setMessages(parsed.messages || []);
          setAnswers(parsed.answers || {});
          
          if (currentConv.documentType) {
            loadQuestionsForDocType(currentConv.documentType).then(qList => {
              let firstMissingIndex = qList.findIndex(q => !parsed.answers[q.id]);
              if (firstMissingIndex === -1) firstMissingIndex = qList.length;
              setCurrentQuestionIndex(firstMissingIndex);
            });
          }
        } catch (e) {
          console.error("Error loading guest session data", e);
        }
      }
    }
  }, [activeConvId, conversations]);

  // Handle autocomplete matching in search input
  const handleInputChange = async (val: string) => {
    setInputText(val);
    setValidationError(null);

    // Look for keywords to trigger smart suggestions dynamically
    if (val.trim().length > 2) {
      try {
        const lower = val.toLowerCase();
        // Filter local documents list dynamically first
        const matches = documents
          .filter(d => d.title.toLowerCase().includes(lower) || d.description.toLowerCase().includes(lower))
          .map(d => d.title);
        
        if (matches.length > 0) {
          setSmartSuggestions(matches.slice(0, 3));
        } else {
          // Ask server for dynamic AI suggestions if no local match
          const res = await axios.get(`/api/suggestions?query=${encodeURIComponent(val)}`);
          if (res.data && res.data.suggestions) {
            setSmartSuggestions(res.data.suggestions);
          } else {
            setSmartSuggestions([]);
          }
        }
      } catch (err) {
        setSmartSuggestions([]);
      }
    } else {
      setSmartSuggestions([]);
    }
  };

  // Start a new document assistant wizard session
  const startDocumentFlow = async (docTitle: string, overrideLanguage?: 'English' | 'Hinglish', forceMethod?: 'form' | 'chat') => {
    if (validationError) setValidationError(null);
    const matchedDoc = detectDocumentFromQuery(docTitle) || documents.find(d => d.title.toLowerCase().includes(docTitle.toLowerCase()) || d.id.toLowerCase() === docTitle.toLowerCase());
    const realTitle = matchedDoc ? matchedDoc.title : docTitle;
    const qList = await loadQuestionsForDocType(realTitle);
    let wizardQuestions = [...qList];

    const localLoc = localStorage.getItem('kartigo_default_location');
    const hasProfileSettings = (user && (profile?.defaultLocation || profile?.businessProfile)) || localLoc;
    
    let initialAnswers: Record<string, string> = { state: 'Maharashtra' };
    let startIdx = 0;

    if (hasProfileSettings) {
      if (autoInjectProfile) {
        initialAnswers = handleInjectProfileData(initialAnswers);
        setProfileInjected(true);
      } else {
        wizardQuestions.unshift({
          id: 'profile_prefill_confirmation',
          label: 'Use Saved Profile',
          questionText: `Would you like to use your saved profile for this document?`,
          placeholder: 'Select an option',
          type: 'select',
          options: ['Yes, use my saved profile', 'No, I will enter details manually'],
          required: true
        });
      }
    }

    setCurrentDocType(realTitle);
    setQuestions(wizardQuestions);
    setCurrentQuestionIndex(startIdx);
    setAnswers(initialAnswers);
    setDraftMethod(forceMethod || 'choice');
    setDraftStage(forceMethod || 'chat');
    setSmartSuggestions([]);
    
    // Add search to recent
    if (!recentSearches.includes(realTitle)) {
      setRecentSearches(prev => [realTitle, ...prev.slice(0, 3)]);
    }

    const conversationId = 'conv_' + Math.floor(Math.random() * 10000000);
    const newConvData = {
      id: conversationId,
      uid: user ? user.uid : 'guest',
      title: `${realTitle} Draft Session`,
      documentType: realTitle,
      progress: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const activeLang = overrideLanguage || conversationLanguage;
    const englishWelcome = `Great. I'll help you prepare your **${realTitle}**.\n\nLet's get started. ${wizardQuestions[0].questionText}`;
    const translatedWelcome = await translateIfNeeded(englishWelcome, activeLang);

    const firstMsg = {
      id: 'msg_1',
      sender: 'agent' as const,
      text: translatedWelcome,
      createdAt: new Date()
    };

    if (user) {
      // Store in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid, 'drafts', conversationId), {
          ...newConvData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await setDoc(doc(db, 'users', user.uid, 'drafts', conversationId, 'messages', 'msg_1'), {
          ...firstMsg,
          createdAt: serverTimestamp()
        });
        triggerNotification("New draft initialized. Auto-saving...", "save");
      } catch (err) {
        console.error("Firestore save failure", err);
      }
    } else {
      // Store locally for Guest (Session only)
      const currentConvs = [...conversations, newConvData];
      sessionStorage.setItem('kartigo_guest_conversations', JSON.stringify(currentConvs));
      sessionStorage.setItem(`kartigo_guest_conv_${conversationId}`, JSON.stringify({
        messages: [firstMsg],
        answers: {}
      }));
      setConversations(currentConvs);
    }

    setActiveConvId(conversationId);
  };

  // Start fresh blank conversation
  const handleNewConversation = () => {
    setValidationError(null);
    setActiveConvId(null);
    setCurrentDocType(null);
    setQuestions([]);
    setCurrentQuestionIndex(-1);
    setAnswers({});
    
    const stored = localStorage.getItem('kartigo_admin_language_settings');
    let greeting = "Hello! I'm AI Assistant, your document assistant.\n\nTell me what document you'd like to create today.";
    let initialLang: 'English' | 'Hinglish' = 'English';
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initialLang = parsed.defaultLanguage || 'English';
        greeting = initialLang === 'Hinglish' ? parsed.greetingHinglish : parsed.greetingEnglish;
      } catch (e) {
        // ignore
      }
    }
    
    setConversationLanguage(initialLang);
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: greeting,
        createdAt: new Date()
      }
    ]);
    triggerNotification("Reset conversation thread", "info");
  };

  // Input validations before moving to the next question
  const validateField = (fieldValue: string, question: QuestionStep): string | null => {
    if (question.required && !fieldValue.trim()) {
      return `Please specify a valid value for: ${question.label}.`;
    }
    if (question.type === 'email' && fieldValue.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fieldValue.trim())) {
        return "Please input a valid email address (e.g. name@domain.com).";
      }
    }
    if (question.type === 'phone' && fieldValue.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(fieldValue.trim())) {
        return "Please input a valid contact phone number.";
      }
    }
    if (question.type === 'date' && fieldValue.trim()) {
      const dateVal = Date.parse(fieldValue.trim());
      if (isNaN(dateVal)) {
        return "Please select or write a valid date format (YYYY-MM-DD).";
      }
    }
    if (question.type === 'number' && fieldValue.trim()) {
      if (isNaN(Number(fieldValue.trim()))) {
        return "Please input a valid numeric value.";
      }
    }
    return null;
  };

  // Handle message submission
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const [aiProgress, setAiProgress] = useState(0); // 0 to 100
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);

  // New AI Assistant V2.0 Chat Handler
  const handleAssistantChat = async (message: string) => {
    setIsThinking(true);
    setTypingIndicator("AI Assistant is thinking...");
    
    // Auto-detect and set active conversation language style
    const activeLang = interceptMessage(message);
    
    try {
      // 1. If currently in a document questionnaire flow
      if (currentDocType && currentQuestionIndex !== -1 && currentQuestionIndex < questions.length) {
        const currentQ = questions[currentQuestionIndex];
        
        // Check if the user is asking a helper query or general question instead of answering
        const isHelperQuestion = message.trim().endsWith('?') || 
                                 /\b(what|why|how|who|where|when|explain|help|kya|kyun|kaise|matlab|samjhao)\b/i.test(message);
        
        if (isHelperQuestion) {
          const promptText = `The user is in the middle of drafting a "${currentDocType}".
          Current question they need to answer: "${currentQ.questionText}".
          User asked this clarification/helper question: "${message}".
          
          Provide a very brief, polite, and helpful explanation of this legal/business concept in ${activeLang}. Keep your answer under 3 lines. 
          At the end, politely guide them back to answering the question: "${currentQ.questionText}".`;
          
          const response = await axios.post("/api/chat", {
            message: promptText,
            history: messages.map(m => ({ role: m.sender, content: m.text })),
            context: { profile, answers, currentDocType, activeLang }
          });
          
          const reply = response.data.message || "I can help with that. Let's return to our draft questions.";
          
          setIsThinking(false);
          setTypingIndicator("AI Assistant is typing...");
          await new Promise(r => setTimeout(r, 800));
          setTypingIndicator(null);
          
          const agentMsgId = 'msg_agent_' + Date.now();
          const agentMsg = {
            id: agentMsgId,
            sender: 'agent' as const,
            text: reply,
            createdAt: new Date()
          };
          
          setMessages(prev => [...prev, agentMsg]);
          
          if (user && activeConvId) {
            await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'messages', agentMsgId), {
              ...agentMsg,
              createdAt: serverTimestamp()
            });
          }
          return;
        }

        // Validate user answer
        const err = validateField(message, currentQ);
        if (err) {
          setIsThinking(false);
          setTypingIndicator(null);
          setValidationError(err);
          // Remove the user message from UI list so they can type again
          setMessages(prev => prev.slice(0, -1));
          return;
        }
        
        // Save valid answer
        const updatedAnswers = { ...answers, [currentQ.id]: message };
        setAnswers(updatedAnswers);
        
        // Persist answer to database
        if (user && activeConvId) {
          await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'draft_answers', currentQ.id), {
            id: currentQ.id,
            conversationId: activeConvId,
            questionId: currentQ.id,
            questionLabel: currentQ.label,
            answer: message,
            updatedAt: serverTimestamp()
          });
        } else if (activeConvId) {
          const guestHistoryStr = sessionStorage.getItem(`kartigo_guest_conv_${activeConvId}`);
          if (guestHistoryStr) {
            const parsed = JSON.parse(guestHistoryStr);
            sessionStorage.setItem(`kartigo_guest_conv_${activeConvId}`, JSON.stringify({
              messages: [...parsed.messages, { id: 'msg_user_' + Date.now(), sender: 'user', text: message, createdAt: new Date() }],
              answers: updatedAnswers
            }));
          }
        }
        
        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx < questions.length) {
          const nextQ = questions[nextIdx];
          const rawQText = nextQ.questionText;
          const translatedQText = await translateIfNeeded(rawQText, activeLang);
          
          setIsThinking(false);
          setTypingIndicator("AI Assistant is typing...");
          await new Promise(r => setTimeout(r, 600));
          setTypingIndicator(null);
          
          const agentMsgId = 'msg_agent_' + Date.now();
          const agentMsg = {
            id: agentMsgId,
            sender: 'agent' as const,
            text: translatedQText,
            createdAt: new Date()
          };
          
          setMessages(prev => [...prev, agentMsg]);
          setCurrentQuestionIndex(nextIdx);
          setAiProgress(Math.round((nextIdx / questions.length) * 100));
          
          if (user && activeConvId) {
            await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'messages', agentMsgId), {
              ...agentMsg,
              createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, 'users', user.uid, 'drafts', activeConvId), {
              progress: Math.round((nextIdx / questions.length) * 100),
              updatedAt: serverTimestamp()
            });
          }
        } else {
          // All questions successfully answered!
          setIsThinking(false);
          setTypingIndicator("AI Assistant is compiling your draft...");
          await new Promise(r => setTimeout(r, 1000));
          setTypingIndicator(null);
          
          const endTextEnglish = "Perfect! I have collected all the required details. You can now review the summarized parameters and generate your document!";
          const endText = await translateIfNeeded(endTextEnglish, activeLang);
          
          const agentMsgId = 'msg_agent_' + Date.now();
          const agentMsg = {
            id: agentMsgId,
            sender: 'agent' as const,
            text: endText,
            createdAt: new Date()
          };
          
          setMessages(prev => [...prev, agentMsg]);
          setCurrentQuestionIndex(questions.length);
          setDraftStage('review');
          setAiProgress(100);
          
          if (user && activeConvId) {
            await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'messages', agentMsgId), {
              ...agentMsg,
              createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, 'users', user.uid, 'drafts', activeConvId), {
              progress: 100,
              status: 'review',
              updatedAt: serverTimestamp()
            });
          }
        }
        return;
      }
      
      // 2. Fallback: Casually chatting/detecting intent if NO document is active yet
      const response = await axios.post("/api/chat", {
        message,
        history: messages.map(m => ({ role: m.sender, content: m.text })),
        context: { profile, answers, activeLang }
      });
      
      const { message: reply, intent, isReadyForForm, suggestions } = response.data;
      
      setIsThinking(false);
      setTypingIndicator("AI Assistant is typing...");
      await new Promise(r => setTimeout(r, 600));
      setTypingIndicator(null);
      
      const agentMsgId = 'msg_agent_' + Date.now();
      const agentMsg = {
        id: agentMsgId,
        sender: 'agent' as const,
        text: reply,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, agentMsg]);
      
      if (intent) {
        setCurrentIntent(intent);
        
        // Find matching document template
        const matchedTemplate = documents.find(d => 
          d.title.toLowerCase().includes(intent.toLowerCase()) || 
          intent.toLowerCase().includes(d.title.toLowerCase()) ||
          d.id.toLowerCase() === intent.toLowerCase()
        );
        
        if (matchedTemplate) {
          await startDocumentFlow(matchedTemplate.title);
        }
      }
      
      if (user && activeConvId) {
        await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'messages', agentMsgId), {
          ...agentMsg,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("AI Assistant Chat execution error:", err);
      triggerNotification("Connection to AI Assistant engine failed.", "error");
    } finally {
      setIsThinking(false);
      setTypingIndicator(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    if (validationError) setValidationError(null);

    // Capture User message
    const userMsgId = 'msg_user_' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user' as const,
      text: cleanInput,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Use V2.0 Chat Logic
    await handleAssistantChat(cleanInput);
  };

  useEffect(() => {
    if (initialQuery && !activeConvId && messages.length <= 1) {
      // Small timeout to allow component to render completely before starting
      const timer = setTimeout(() => {
        startDocumentFlow(initialQuery, undefined, initialMethod);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, initialMethod, activeConvId, messages.length]);

  // Modify previous answers
  const handleStartEditing = (fieldId: string) => {
    setEditingFieldId(fieldId);
    setEditInputValue(answers[fieldId] || '');
  };

  const handleSaveEdit = async (fieldId: string) => {
    const matchedQ = questions.find(q => q.id === fieldId);
    if (!matchedQ) return;

    const errorMsg = validateField(editInputValue, matchedQ);
    if (errorMsg) {
      triggerNotification(errorMsg, "error");
      return;
    }

    const updatedAnswers = { ...answers, [fieldId]: editInputValue };
    setAnswers(updatedAnswers);
    setEditingFieldId(null);

    // Save and add an update notice in the chat thread
    const noticeMsgId = 'msg_notice_' + Date.now();
    const noticeMsg = {
      id: noticeMsgId,
      sender: 'agent' as const,
      text: `🔄 *Updated parameter **${matchedQ.label}** to:* **${editInputValue}**`,
      createdAt: new Date()
    };

    const finalMessages = [...messages, noticeMsg];
    setMessages(finalMessages);

    if (user && activeConvId) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'draft_answers', fieldId), {
          id: fieldId,
          conversationId: activeConvId,
          questionId: fieldId,
          questionLabel: matchedQ.label,
          answer: editInputValue,
          updatedAt: serverTimestamp()
        });
        await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'messages', noticeMsgId), {
          ...noticeMsg,
          createdAt: serverTimestamp()
        });
        triggerNotification("Draft update applied successfully", "success");
      } catch (err) {
        console.error(err);
      }
    } else if (activeConvId) {
      sessionStorage.setItem(`kartigo_guest_conv_${activeConvId}`, JSON.stringify({
        messages: finalMessages,
        answers: updatedAnswers
      }));
      triggerNotification("Draft update applied successfully", "success");
    }
  };

  // Actions on entire conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this drafting thread?")) return;

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'drafts', convId));
        triggerNotification("Draft thread deleted", "success");
      } catch (err) {
        console.error(err);
      }
    } else {
      const filtered = conversations.filter(c => c.id !== convId);
      setConversations(filtered);
      sessionStorage.setItem('kartigo_guest_conversations', JSON.stringify(filtered));
      sessionStorage.removeItem(`kartigo_guest_conv_${convId}`);
      triggerNotification("Draft thread deleted", "success");
    }

    if (activeConvId === convId) {
      handleNewConversation();
    }
  };

  const handleRenameConversation = async (convId: string) => {
    const target = conversations.find(c => c.id === convId);
    if (!target) return;

    const newName = window.prompt("Enter a new title for this conversation:", target.title);
    if (!newName || !newName.trim()) return;

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'drafts', convId), {
          title: newName.trim(),
          updatedAt: serverTimestamp()
        });
        triggerNotification("Conversation renamed successfully", "success");
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = conversations.map(c => {
        if (c.id === convId) return { ...c, title: newName.trim(), updatedAt: new Date() };
        return c;
      });
      setConversations(updated);
      sessionStorage.setItem('kartigo_guest_conversations', JSON.stringify(updated));
      triggerNotification("Conversation renamed successfully", "success");
    }
  };

  const filterConversations = useMemo(() => conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  ), [conversations, searchQuery]);

  // PREVIEW VIEW
  if (previewDoc) {
    if (isCheckoutOpen) {
      return (
        <div className="bg-[#F1FEC8] min-h-[calc(100vh-80px)] pt-12 px-4 sm:px-6 lg:px-8 pb-10 font-sans flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="mb-6">
              <Breadcrumbs 
                onBackHome={onBackHome}
                items={[{ label: 'Checkout', isActive: true }]} 
              />
            </div>
            <CheckoutView
              documentId={previewDoc.id}
              documentTitle={previewDoc.title}
              documentType={previewDoc.type}
              onCancel={() => setIsCheckoutOpen(false)}
              onSuccess={(paymentId, orderId) => {
                setIsCheckoutOpen(false);
                setDraftStage('completed');
                setIsPaymentVerified(true);
                setPreviewDoc(null);
                if (onOpenEditor) {
                  onOpenEditor(previewDoc.id, previewDoc.content, previewDoc.title, previewDoc.type);
                }
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#F1FEC8] min-h-[calc(100vh-80px)] pt-12 px-4 sm:px-6 lg:px-8 pb-10 font-sans">
        <div className="max-w-4xl mx-auto mb-8 bg-white/50 backdrop-blur-md rounded-2xl border border-vanilla-main p-2">
          <OrderTrackingTimeline currentStage={getTimelineStage()} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="mb-2">
            <Breadcrumbs 
              onBackHome={onBackHome}
              items={[
                { label: 'Drafting', onClick: () => setPreviewDoc(null) },
                { label: 'Preview Document', isActive: true }
              ]} 
            />
          </div>
          {/* Header Actions */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-vanilla-main shadow-sm no-print">
            <button
              onClick={() => setPreviewDoc(null)}
              className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                {isPaymentVerified ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isPaymentVerified ? "Download PDF" : "Download Preview"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vanilla-secondary text-brand-secondary border border-vanilla-main text-[10px] font-bold rounded-lg hover:bg-vanilla-alt transition-all cursor-pointer shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={() => isPaymentVerified ? alert("Share dialog opened") : handleUnlock()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vanilla-secondary text-brand-secondary border border-vanilla-main text-[10px] font-bold rounded-lg hover:bg-vanilla-alt transition-all cursor-pointer shadow-sm"
              >
                {isPaymentVerified ? <ExternalLink className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                Share
              </button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-[#3C1A47] text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden no-print">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="h-5 w-5 text-brand-primary" />
                  <span className="text-[10px] font-bold font-mono text-brand-primary uppercase tracking-[0.2em]">Preview Ready</span>
                </div>
                <h2 className="text-xl font-bold font-display tracking-tight leading-tight">{previewDoc.title}</h2>
                <div className="flex items-center gap-4 text-white/70 text-xs font-bold font-mono">
                  <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {previewDoc.pageCount} Pages</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-400" /> Professional Grade</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">One-time Unlock Price</span>
                  <span className="text-3xl font-extrabold font-display tracking-tight text-[#F1FEC8]">₹{previewDoc.price}</span>
                </div>
                <div className="relative group">
                  <div 
                    onClick={handleUnlock}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-black text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-50 shadow-xl border border-white/10"
                  >
                    <span className="font-bold flex items-center gap-1"><Lock className="h-3 w-3" /> Unlock to Download</span>
                    <p className="mt-1 opacity-70">Finalize payment to remove watermarks and download as high-fidelity PDF/DOCX.</p>
                  </div>
                  <button
                    onClick={handleUnlock}
                    className="w-full md:w-auto px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Unlock Full Document
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview Area */}
          <div className="relative group document-preview-container">
            <div className="bg-white rounded-[24px] border border-vanilla-main shadow-2xl p-8 md:p-16 min-h-[800px] relative overflow-hidden select-none">
              
              {/* Watermark Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] flex flex-col items-center justify-center rotate-[-35deg] gap-20 select-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex gap-20">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <span key={j} className="text-5xl font-black font-display whitespace-nowrap tracking-widest">
                        PREVIEW - {user?.email || 'GUEST SESSION'}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Document Content (Partial/Blurred/Watermarked look) */}
              <div className="relative z-0 text-left">
                <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-white to-transparent pointer-events-none z-1" />
                
                <div className="prose prose-sm max-w-none prose-slate">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(previewDoc.content) }} />
                </div>

                {/* Bottom fade out to entice unlock */}
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-linear-to-t from-white via-white/80 to-transparent pointer-events-none z-1 flex flex-col items-center justify-end pb-20 no-print">
                  <div className="bg-vanilla-secondary/80 backdrop-blur-md border border-vanilla-main p-8 rounded-[32px] max-w-md w-full shadow-2xl space-y-4">
                    <div className="h-12 w-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-brand-secondary font-display">Document Locked</h3>
                      {!user && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3 text-[10px] text-amber-800 font-bold">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Your draft is available for this session only. Log in to save it.
                        </div>
                      )}
                      <p className="text-xs text-text-light mt-1 px-4 leading-relaxed font-bold">
                        Unlock the complete, editable version of this professional document to download, print, and share without watermarks.
                      </p>
                    </div>
                    <button
                      onClick={handleUnlock}
                      className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Unlock Now for ₹{previewDoc.price}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          {draftStage === 'completed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <FeedbackRating 
                documentId={previewDoc.id} 
                onSubmitted={() => triggerNotification("Thanks for your feedback!", "success")} 
              />
              <DocumentRelationshipEngine 
                currentDocId={previewDoc.type}
                onSelectDoc={(id) => {
                  setPreviewDoc(null);
                  setCurrentDocType(id);
                  setDraftStage('chat');
                }}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-8 opacity-60">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <FileCheck className="h-4 w-4" /> Verified Legal Template
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <RefreshCw className="h-4 w-4" /> Instant Refund Guarantee
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <ExternalLink className="h-4 w-4" /> Razorpay Secure
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleFieldChangeDirect = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveFieldDirect = async (fieldId: string, value: string) => {
    const matchedQ = questions.find(q => q.id === fieldId);
    if (!matchedQ) return;

    if (user && activeConvId) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'drafts', activeConvId, 'draft_answers', fieldId), {
          id: fieldId,
          conversationId: activeConvId,
          questionId: fieldId,
          questionLabel: matchedQ.label,
          answer: value,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to sync direct form edit:", e);
      }
    }
  };

  // Memoized Parameter Summary to prevent re-renders on every message
  const parameterSummary = useMemo(() => {
    if (!currentDocType) {
      return (
        <div className="pt-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-vanilla-secondary flex items-center justify-center mx-auto text-text-light">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-secondary">No document chosen</h4>
            <p className="text-[11px] text-text-light leading-relaxed max-w-xs mx-auto mt-1">
              Choose a legal template from the examples, or type your requested document name in the assistant.
            </p>
          </div>
        </div>
      );
    }

    const filledCount = questions.filter(q => answers[q.id] && answers[q.id].trim()).length;
    const percent = questions.length > 0 ? Math.min(Math.round((filledCount / questions.length) * 100), 100) : 0;

    return (
      <div className="pt-4 space-y-5">
        {/* Progress Indicator */}
        <div className="bg-[#F1FEC8]/30 border border-brand-primary/20 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
              Form Completion
            </span>
            <span className="text-brand-primary font-mono">{percent}% ({filledCount}/{questions.length})</span>
          </div>
          <div className="w-full bg-vanilla-secondary h-2 rounded-full overflow-hidden border border-vanilla-main/40">
            <div 
              className="bg-brand-primary h-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Document Title Meta */}
        <div className="bg-white border border-vanilla-main p-3.5 rounded-2xl shadow-xs">
          <span className="block text-[8px] font-bold text-text-light uppercase tracking-widest font-mono">Target Document</span>
          <span className="block text-xs font-extrabold text-brand-secondary font-display leading-tight mt-0.5">{currentDocType}</span>
        </div>

        {/* Collected Parameters Interactive Form */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-light font-bold">Interactive Form Wizard</h4>
            <span className="text-[9px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-md">Live Sync</span>
          </div>
          
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {questions.map((q) => {
              const fieldVal = answers[q.id] || '';
              const isFilled = !!fieldVal.trim();
              const validationErrorMsg = isFilled ? validateField(fieldVal, q) : null;
              const isValid = isFilled && !validationErrorMsg;

              return (
                <div key={q.id} className="p-3.5 bg-white border border-vanilla-main rounded-2xl flex flex-col gap-2 shadow-xs hover:border-brand-primary/20 transition-all">
                  <div className="flex items-center justify-between gap-2 text-[10.5px] font-bold">
                    <span className="text-brand-secondary truncate flex items-center gap-1.5">
                      {q.label}
                      {q.required && <span className="text-red-500">*</span>}
                    </span>
                    
                    {/* Status Indicators */}
                    <div className="shrink-0">
                      {isFilled ? (
                        isValid ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <Check className="h-3 w-3" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-red-500 font-extrabold bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200 animate-pulse">
                            <AlertCircle className="h-3 w-3" /> Error
                          </span>
                        )
                      ) : q.required ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] text-text-light/60 font-semibold bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Input Fields based on type */}
                  <div className="relative">
                    {q.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        placeholder={q.placeholder || `Enter ${q.label}...`}
                        value={fieldVal}
                        onChange={(e) => handleFieldChangeDirect(q.id, e.target.value)}
                        onBlur={(e) => handleSaveFieldDirect(q.id, e.target.value)}
                        className="w-full text-xs font-semibold text-brand-secondary bg-vanilla-secondary/20 border border-vanilla-main/80 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:bg-white focus:outline-hidden transition-all placeholder:text-text-light/40 resize-none"
                      />
                    ) : q.type === 'select' ? (
                      <div className="relative">
                        <select
                          value={fieldVal}
                          onChange={(e) => {
                            handleFieldChangeDirect(q.id, e.target.value);
                            handleSaveFieldDirect(q.id, e.target.value);
                          }}
                          className="w-full text-xs font-bold text-brand-secondary bg-vanilla-secondary/20 border border-vanilla-main/80 rounded-xl p-2.5 pr-8 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:bg-white focus:outline-hidden transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select option...</option>
                          {q.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-light pointer-events-none" />
                      </div>
                    ) : q.type === 'date' ? (
                      <input
                        type="date"
                        value={fieldVal}
                        onChange={(e) => handleFieldChangeDirect(q.id, e.target.value)}
                        onBlur={(e) => handleSaveFieldDirect(q.id, e.target.value)}
                        className="w-full text-xs font-bold text-brand-secondary bg-vanilla-secondary/20 border border-vanilla-main/80 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:bg-white focus:outline-hidden transition-all"
                      />
                    ) : q.type === 'number' ? (
                      <input
                        type="number"
                        placeholder={q.placeholder || `Enter ${q.label}...`}
                        value={fieldVal}
                        onChange={(e) => handleFieldChangeDirect(q.id, e.target.value)}
                        onBlur={(e) => handleSaveFieldDirect(q.id, e.target.value)}
                        className="w-full text-xs font-bold text-brand-secondary bg-vanilla-secondary/20 border border-vanilla-main/80 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:bg-white focus:outline-hidden transition-all placeholder:text-text-light/40"
                      />
                    ) : (
                      <input
                        type={q.type || 'text'}
                        placeholder={q.placeholder || `Enter ${q.label}...`}
                        value={fieldVal}
                        onChange={(e) => handleFieldChangeDirect(q.id, e.target.value)}
                        onBlur={(e) => handleSaveFieldDirect(q.id, e.target.value)}
                        className="w-full text-xs font-bold text-brand-secondary bg-vanilla-secondary/20 border border-vanilla-main/80 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:bg-white focus:outline-hidden transition-all placeholder:text-text-light/40"
                      />
                    )}
                  </div>

                  {/* Inline Error messages */}
                  {validationErrorMsg && (
                    <span className="text-[10px] text-red-500 font-medium mt-0.5 flex items-center gap-1 leading-tight">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {validationErrorMsg}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => triggerNotification("All parameters successfully synced with draft template.", "success")}
            className="w-full py-2.5 bg-vanilla-secondary hover:bg-vanilla-main text-brand-secondary font-bold text-[10px] uppercase tracking-wider font-mono rounded-xl border border-vanilla-main/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <CheckCircle className="h-3.5 w-3.5 text-brand-primary" /> Sync Form Parameters
          </button>
        </div>
      </div>
    );
  }, [currentDocType, questions, answers]);

  return (
    <div className="bg-[#F1FEC8] min-h-[calc(100vh-80px)] pt-10 px-4 sm:px-6 lg:px-8 pb-10 font-sans">
      <div className="max-w-4xl mx-auto mb-6 bg-white/50 backdrop-blur-md rounded-2xl border border-vanilla-main p-2">
        <OrderTrackingTimeline currentStage={getTimelineStage()} />
      </div>
      
      <div className="max-w-7xl mx-auto mb-4">
        <Breadcrumbs 
          onBackHome={onBackHome}
          items={[{ label: 'Drafting', isActive: true }]} 
        />
      </div>

      {generationStage !== 'idle' && (
        <div className="fixed inset-0 bg-[#F1FEC8]/95 z-50 flex items-center justify-center p-6 text-left">
          <div className="bg-white border-2 border-[#3C1A47] rounded-[32px] p-8 md:p-12 shadow-2xl max-w-lg w-full text-center space-y-6">
            <div className="mx-auto flex justify-center">
              <DocumentSkeleton />
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-brand-secondary">Preparing your document...</h2>
              <p className="text-xs text-text-light mt-1">Est. drafting time remaining: ~3 seconds</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">
                <span>
                  {generationStage === 'validating' && '🔍 Validating parameters integrity...'}
                  {generationStage === 'analyzing' && '🤖 Requirement Analysis Engine...'}
                  {generationStage === 'missing_info' && '🕵️ Missing Information Detector...'}
                  {generationStage === 'structuring' && '📏 Structuring clauses & numbering...'}
                  {generationStage === 'intel' && '🧠 Document Intelligence & Recommendations...'}
                  {generationStage === 'quality' && '🛡️ Finalizing legal quality review...'}
                  {generationStage === 'risk_check' && '⚠️ Risk Analysis Engine...'}
                  {generationStage === 'saving' && '💾 Encrypting and saving securely...'}
                  {generationStage === 'done' && '🎉 Success! Document Compiled!'}
                </span>
                <span>{generationPercent}%</span>
              </div>
              <div className="w-full bg-vanilla-secondary h-2.5 rounded-full overflow-hidden border border-vanilla-main/40">
                <div 
                  className="bg-brand-primary h-full transition-all duration-500"
                  style={{ width: `${generationPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-vanilla-secondary/50 border border-vanilla-main p-4 rounded-2xl text-[11px] font-medium text-text-cosmic leading-relaxed">
              {generationStage === 'validating' && 'AI Assistant is reviewing your requirements...'}
              {generationStage === 'analyzing' && 'AI Assistant is reviewing your requirements...'}
              {generationStage === 'missing_info' && 'AI Assistant found a few details that need confirmation.'}
              {generationStage === 'structuring' && 'AI Assistant is preparing your document...'}
              {generationStage === 'intel' && 'AI Assistant is preparing your document...'}
              {generationStage === 'quality' && 'AI Assistant is preparing your document...'}
              {generationStage === 'risk_check' && 'AI Assistant is preparing your document...'}
              {generationStage === 'saving' && 'AI Assistant has finished preparing your document.'}
              {generationStage === 'done' && 'AI Assistant has finished preparing your document.'}
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative ${focusMode ? 'fixed inset-0 z-[100] bg-[#F1FEC8] p-4 m-0 h-screen max-w-none rounded-none' : 'h-[600px] lg:h-[680px]'}`}>
        
        {/* Toast Notifier */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-24 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold leading-none ${
                notif.type === 'success' ? 'bg-[#3C1A47] text-[#F1FEC8] border-brand-primary' :
                notif.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                notif.type === 'save' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                'bg-white text-text-cosmic border-vanilla-main'
              }`}
            >
              {notif.type === 'success' && <CheckCircle className="h-4 w-4 text-[#F1FEC8]" />}
              {notif.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {notif.type === 'save' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
              <span>{notif.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT COLUMN: ACTIVE CHAT CONTAINER (8 cols) */}
        <div className={`flex flex-col bg-white border border-vanilla-main rounded-[24px] shadow-md h-full overflow-hidden relative ${focusMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          
          {/* HEADER BAR */}
          <div className="px-4 py-3 border-b border-vanilla-main flex items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-brand-secondary font-display leading-tight">AI Assistant</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Online</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {currentDocType && draftStage !== 'completed' && draftMethod !== 'choice' && (
                <button
                  onClick={() => {
                    setDraftMethod(draftMethod === 'chat' ? 'form' : 'chat');
                    setValidationError(null);
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all text-[10px] font-bold min-h-[44px]"
                >
                  {draftMethod === 'chat' ? (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Switch to Quick Form
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-3.5 w-3.5" />
                      Ask AI Assistant (Chat)
                    </>
                  )}
                </button>
              )}

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-vanilla-secondary/50 rounded-lg border border-vanilla-main mr-2">
                <span className="text-[9px] font-bold text-text-light uppercase tracking-tighter">Auto-Fill Profile</span>
                <button 
                  onClick={() => setAutoInjectProfile(!autoInjectProfile)}
                  className={`w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${autoInjectProfile ? 'bg-brand-primary' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${autoInjectProfile ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Focus Mode Toggle Button */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[10px] font-bold cursor-pointer ${
                  focusMode 
                    ? 'bg-[#3C1A47] text-[#F1FEC8] border-brand-primary/40' 
                    : 'bg-vanilla-secondary/50 text-text-secondary border-vanilla-main hover:bg-vanilla-secondary'
                }`}
                title="Toggle distraction-free writing environment"
              >
                <Zap className={`h-3 w-3 ${focusMode ? 'text-amber-300 fill-amber-300' : 'text-brand-primary'}`} />
                <span>{focusMode ? 'Focus Active' : 'Focus Mode'}</span>
              </button>

              <button
                onClick={handleNewConversation}
                className="p-3 text-text-secondary hover:text-brand-primary hover:bg-vanilla-secondary rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="New Conversation"
              >
                <Plus className="h-5 w-5" />
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'chat' ? 'history' : 'chat')}
                className="p-3 text-text-secondary hover:text-brand-primary hover:bg-vanilla-secondary rounded-lg transition-colors cursor-pointer lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Toggle History"
              >
                <Clock className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* VISUAL STEPPER PANEL */}
          {currentQuestionIndex !== -1 && questions.length > 0 && (
            <div className="px-4 py-2 bg-vanilla-secondary/40 border-b border-vanilla-main/60">
              <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary mb-1">
                <span className="flex items-center gap-1">
                  <span className="text-[9px] font-bold font-mono bg-[#3C1A47]/10 text-[#3C1A47] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Progress</span>
                  <span className="text-brand-secondary font-display text-[10px]">Drafting</span>
                </span>
                <span className="text-brand-primary font-mono text-[10px] font-extrabold bg-[#F1FEC8] px-1.5 py-0.5 rounded-md border border-brand-primary/20">
                  Step {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              {/* Stepper nodes container */}
              <div className="relative flex items-center justify-between w-full mt-2 pb-1 px-1">
                {/* Background line connecting all dots */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-vanilla-main rounded-full z-0" />
                {/* Completed progress fill line */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#3C1A47] rounded-full z-0 transition-all duration-500 ease-out"
                  style={{ width: `${(currentQuestionIndex / (questions.length - 1 || 1)) * 100}%` }}
                />
                
                {/* Nodes */}
                {questions.map((q, idx) => {
                  const isCompleted = idx < currentQuestionIndex;
                  const isActive = idx === currentQuestionIndex;
                  return (
                    <div key={q.id} className="relative z-10 flex flex-col items-center">
                      {/* Node Circle */}
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-[#3C1A47] border-[#3C1A47] text-white shadow-xs' 
                            : isActive 
                            ? 'bg-white border-[#3C1A47] text-[#3C1A47] ring-2 ring-brand-primary/15 shadow-sm scale-110' 
                            : 'bg-white border-vanilla-main text-text-light'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      
                      {/* Step label (hidden/shortened on mobile) */}
                      <span 
                        className={`absolute top-8 text-[9px] font-bold tracking-tight whitespace-nowrap transition-colors duration-300 max-w-[60px] truncate text-center ${
                          isActive 
                            ? 'text-brand-primary font-extrabold' 
                            : isCompleted 
                            ? 'text-brand-secondary font-bold' 
                            : 'text-text-light/80'
                        } hidden sm:block`}
                        title={q.label}
                      >
                        {q.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN MESSAGE VIEWPORT */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-vanilla-secondary/15 relative">
            
            {/* Generation Overlay */}
            {generationStage !== 'idle' && (
              <GenerationOverlay stage={generationStage} percent={generationPercent} />
            )}
            
            {/* V2.0 Progressive Progress Bar */}
            {activeConvId && draftStage !== 'completed' && (
              <div className="sticky top-0 z-20 pb-4">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-vanilla-main shadow-sm flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-vanilla-main rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${aiProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-brand-primary shrink-0">
                    {aiProgress === 0 ? 'Understanding Request' : 
                     aiProgress <= 25 ? 'Collecting Details' :
                     aiProgress <= 50 ? 'Preparing Form' :
                     aiProgress <= 75 ? 'Finalizing Review' : 'Ready'} {aiProgress}%
                  </span>
                </div>
              </div>
            )}
            
            {/* Show History List if on History Tab (on mobile fallback) */}
            {activeTab === 'history' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-secondary font-mono uppercase tracking-wider">Draft History</h3>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="text-xs font-bold text-brand-primary flex items-center gap-1"
                  >
                    Back to Chat <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                {/* Search in History */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                  <input
                    type="text"
                    placeholder="Search past chats..." aria-label="Search past chats"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-vanilla-main rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-primary shadow-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                  {filterConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-text-light">No conversations found.</p>
                    </div>
                  ) : (
                    filterConversations.map((conv) => (
                      <div 
                        key={conv.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          activeConvId === conv.id 
                            ? 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary' 
                            : 'bg-white border-vanilla-main text-text-secondary hover:bg-vanilla-secondary/40'
                        }`}
                        onClick={() => {
                          setActiveConvId(conv.id);
                          setActiveTab('chat');
                        }}
                      >
                        <div className="flex items-center gap-2.5 text-left min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
                          <div className="min-w-0">
                            <span className="block text-xs font-extrabold truncate">{conv.title}</span>
                            <span className="block text-[9px] font-medium text-text-light">{conv.documentType} • {conv.progress}% Complete</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameConversation(conv.id);
                            }}
                            className="p-1 hover:text-brand-primary"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            className="p-1 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : draftMethod === 'choice' && currentDocType ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8 p-6 text-center">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Create {currentDocType}
                  </span>
                  <h2 className="text-2xl font-extrabold text-brand-secondary font-display">How would you like to build it?</h2>
                  <p className="text-xs text-text-light max-w-md mx-auto leading-relaxed">
                    Choose the method that works best for you. Both options lead to the same high-quality legal output.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  {/* Quick Form Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setDraftMethod('form');
                      setDraftStage('form');
                    }}
                    className="relative group p-6 bg-white border-2 border-vanilla-main hover:border-brand-primary rounded-[32px] text-left transition-all shadow-sm hover:shadow-xl cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <div className="px-2 py-1 bg-[#F1FEC8] text-brand-primary text-[8px] font-black rounded-full uppercase tracking-tighter border border-brand-primary/20">
                        Recommended
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-[#F1FEC8] flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-brand-secondary mb-1">⚡ Quick Form (Recommended)</h3>
                    <p className="text-[11px] text-text-light leading-relaxed">
                      Recommended for faster document creation. A dynamic form is generated based on the selected document.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-brand-primary">
                      Launch Form <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.button>

                  {/* Chat Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDraftMethod('chat')}
                    className="group p-6 bg-white border-2 border-vanilla-main hover:border-brand-primary rounded-[32px] text-left transition-all shadow-sm hover:shadow-xl cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-brand-secondary mb-1">💬 Chat with AI Assistant</h3>
                    <p className="text-[11px] text-text-light leading-relaxed">
                      Talk to our AI assistant. Best for complex requirements or guidance.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-brand-primary">
                      Start Conversation <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.button>
                </div>

                <p className="text-[10px] text-text-light italic">
                  You can switch between these modes at any time.
                </p>
              </div>
            ) : draftMethod === 'form' ? (
              <div className="space-y-6 text-left">
                <div className="bg-[#3C1A47] text-white p-5 rounded-2xl shadow-sm border border-[#E5F5B8]/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[9px] font-mono uppercase bg-brand-primary/20 text-[#F1FEC8] px-2 py-0.5 rounded-md font-bold tracking-wider">
                      Smart Form Active
                    </span>
                    <h4 className="text-base font-extrabold font-display text-white mt-1.5 mb-1">
                      {currentDocType} Details Form
                    </h4>
                    <p className="text-[11px] text-[#F1FEC8]/80 leading-relaxed font-bold">
                      We have prefilled some initial values. Please complete the remaining fields below to build your document summary.
                    </p>
                  </div>
                  <div className="absolute right-3 bottom-0 translate-y-1/3 opacity-10">
                    <Sparkles className="h-28 w-28" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-vanilla-main shadow-xs space-y-3">
                  <h5 className="text-xs font-bold text-brand-secondary font-mono uppercase tracking-wider border-b border-vanilla-main pb-2">
                    Enter Document Information
                  </h5>
                  

                  {/* Wizard Progress Indicator */}
                  <div className="mb-6 flex items-center gap-2">
                    {Array.from({ length: Math.ceil(questions.filter(q => q.id !== 'profile_prefill_confirmation').length / 3) }).map((_, idx) => (
                      <div key={idx} className="flex-1 h-1.5 rounded-full bg-vanilla-main overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${idx < formWizardStep ? 'bg-[#3C1A47]' : idx === formWizardStep ? 'bg-brand-primary' : 'bg-transparent'}`} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {questions.filter(q => q.id !== 'profile_prefill_confirmation').slice(formWizardStep * 3, (formWizardStep + 1) * 3).map((q) => {
                      const isRequired = q.required;
                      const currentVal = answers[q.id] || '';

                      return (
                          <div key={q.id} className="space-y-1">
                            <label htmlFor={`form_field_${q.id}`} className="block text-[10px] font-bold text-[#3C1A47] flex items-center gap-1.5">
                            <span>{q.label}</span>
                            {isRequired && <span className="text-red-500 font-bold">*</span>}
                          </label>

                          {q.type === 'textarea' ? (
                            <textarea
                              id={`form_field_${q.id}`}
                              placeholder={q.placeholder}
                              value={currentVal}
                              onFocus={handleInputFocus}
                              onChange={(e) => {
                                setAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                if (validationError) setValidationError(null);
                              }}
                              className="w-full text-xs font-medium bg-vanilla-secondary/30 focus:bg-white border border-vanilla-main focus:border-[#3C1A47] focus:ring-1 focus:ring-[#3C1A47] rounded-xl p-3 h-20 outline-hidden transition-all"
                            />
                          ) : q.type === 'select' ? (
                            <select
                              id={`form_field_${q.id}`}
                              value={currentVal}
                              onChange={(e) => {
                                setAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                if (validationError) setValidationError(null);
                              }}
                              className="w-full text-xs font-bold bg-vanilla-secondary/30 focus:bg-white border border-vanilla-main focus:border-[#3C1A47] rounded-xl p-2.5 outline-hidden transition-all cursor-pointer"
                            >
                              <option value="">Select option...</option>
                              {q.options?.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={`form_field_${q.id}`}
                              type={q.type}
                              placeholder={q.placeholder}
                              value={currentVal}
                              onFocus={handleInputFocus}
                              onChange={(e) => {
                                setAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                if (validationError) setValidationError(null);
                              }}
                              className="w-full text-xs font-medium bg-vanilla-secondary/30 focus:bg-white border border-vanilla-main focus:border-[#3C1A47] focus:ring-1 focus:ring-[#3C1A47] rounded-xl px-3 py-2.5 outline-hidden transition-all"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-vanilla-main mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        const missing = questions.filter(q => q.id !== 'profile_prefill_confirmation' && q.required && !answers[q.id]);
                        if (missing.length > 0) {
                          const errMsg = `Please answer all required fields: ${missing.map(m => m.label).join(', ')}`;
                          setValidationError(errMsg);
                          triggerNotification(errMsg, 'error');
                          return;
                        }
                        setDraftStage('review');
                        triggerNotification('Summary draft compiled!', 'success');
                      }}
                      className="flex-1 py-3 bg-[#3C1A47] text-[#F1FEC8] border border-[#E5F5B8]/30 hover:opacity-95 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-4 w-4" />
                      Continue to Summary Review
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftMethod('chat');
                        setDraftStage('chat');
                      }}
                      className="px-4 py-3 bg-white text-text-light hover:bg-vanilla-secondary text-xs font-bold rounded-xl border border-vanilla-main transition-all cursor-pointer"
                    >
                      Back to Chat
                    </button>
                  </div>
                </div>
              </div>
            ) : draftStage === 'review' ? (
              <ReviewYourInformation
                questions={questions}
                answers={answers}
                onUpdateAnswer={(fieldId, value) => {
                  setAnswers(prev => ({ ...prev, [fieldId]: value }));
                  triggerNotification(`Updated field successfully`, 'success');
                }}
                onGenerate={() => {
                  const missing = questions.filter(q => q.id !== 'profile_prefill_confirmation' && q.required && !answers[q.id]);
                  if (missing.length > 0) {
                    const errMsg = `Cannot generate. Required fields missing: ${missing.map(m => m.label).join(', ')}`;
                    setValidationError(errMsg);
                    triggerNotification(errMsg, 'error');
                    return;
                  }
                  handleGenerateDocument();
                }}
                onBackToChat={() => {
                  setDraftMethod('chat');
                  setDraftStage('chat');
                }}
                onBackToForm={() => {
                  setDraftMethod('form');
                  setDraftStage('form');
                }}
              />
            ) : (
              /* STANDARD CHAT MESSAGES & SELECTION */
              <>
                {(draftMethod === 'chat' || !currentDocType) && (
                  <>
                    {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed text-left ${
                      msg.sender === 'user' 
                        ? 'bg-brand-primary text-white rounded-br-none shadow-md' 
                        : msg.text.startsWith('🔄')
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 italic font-medium'
                        : 'bg-white border border-vanilla-main text-text-cosmic rounded-bl-none shadow-xs'
                    }`}>
                      {msg.sender === 'agent' && !msg.text.startsWith('🔄') && (
                        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-bold mb-1">
                          Assistant
                        </div>
                      )}
                      <p className="whitespace-pre-line font-medium">{msg.text}</p>
                      
                      <span className="block text-[8px] text-right mt-1.5 opacity-60 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Simulated Thinking / Typing bubble */}
                {(isThinking || typingIndicator) && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-vanilla-main rounded-2xl rounded-bl-none p-3 shadow-xs space-y-1">
                      {typingIndicator && (
                        <div className="text-[10px] font-bold text-brand-primary animate-pulse flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          {typingIndicator}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* PROFILE INJECTION PROMPT */}
                {showProfilePrompt && !profileInjected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-[#F1FEC8] border-2 border-brand-primary/20 rounded-[28px] shadow-lg space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="text-sm font-bold text-brand-secondary">Saved Profile Detected</h4>
                        <p className="text-xs text-text-light leading-relaxed font-bold">
                          Would you like to use your saved business profile and default location for this document? This will automatically fill in common details.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        onClick={handleInjectProfile}
                        className="flex-1 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Yes, use my saved profile
                      </button>
                      <button
                        onClick={() => setShowProfilePrompt(false)}
                        className="px-6 py-2.5 bg-white text-text-light text-xs font-bold rounded-xl border border-vanilla-main hover:bg-vanilla-secondary transition-all cursor-pointer"
                      >
                        No, start fresh
                      </button>
                    </div>
                  </motion.div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <span className="text-[9px] font-bold text-brand-primary animate-pulse uppercase tracking-wider font-mono">
                      AI Assistant is typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
                  </>
                )}
              </>
            )}
          </div>

          {/* SUGGESTION / EXAMPLES OVERLAY (If thread is fresh) */}
          {currentQuestionIndex === -1 && !currentDocType && activeTab === 'chat' && (
            <div className="px-5 py-4 border-t border-vanilla-main bg-vanilla-secondary/20">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-secondary font-bold mb-2 flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5 text-brand-primary" /> Popular Legal Templates
              </h4>
              <div className="flex flex-wrap gap-2">
                {documents.slice(0, 7).map((docT) => (
                  <button
                    key={docT.id}
                    onClick={() => startDocumentFlow(docT.title)}
                    className="px-3 py-1.5 bg-white border border-vanilla-main hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-[1.01] transition-all text-[11px] font-bold text-text-secondary rounded-xl shadow-2xs cursor-pointer"
                  >
                    {docT.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT FORM */}
          {activeTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-vanilla-main bg-white relative z-20">
              
              {/* Validation alert popup */}
              {validationError && (
                <div className="absolute left-4 right-4 bottom-full mb-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2 shadow-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Autocomplete suggestion matching dropdown */}
              {smartSuggestions.length > 0 && (
                <div className="absolute left-4 right-4 bottom-full mb-2 bg-white border border-vanilla-main rounded-xl p-2 shadow-xl flex flex-col gap-1 z-30 text-left">
                  <span className="text-[9px] text-text-light font-bold font-mono uppercase tracking-wider px-2">Did you mean:</span>
                  {smartSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => startDocumentFlow(sug)}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-vanilla-secondary text-xs font-bold text-brand-secondary flex items-center justify-between"
                    >
                      <span>{sug}</span>
                      <ArrowRight className="h-3 w-3 text-brand-primary" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 bg-vanilla-secondary/50 rounded-xl p-1.5 border border-vanilla-main focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-white transition-all">
                
                {/* Voice Input icon */}
                <button
                  type="button"
                  className={`p-2 rounded-xl cursor-pointer transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-text-light hover:text-brand-primary'}`}
                  title={isListening ? "Listening..." : "Voice Input (Hands-free drafting)"}
                  onClick={toggleListening}
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                {/* Attachment icon placeholder */}
                <button
                  type="button"
                  className="p-2 text-text-light hover:text-brand-primary rounded-xl cursor-pointer"
                  title="Attach File (UI only)"
                  onClick={() => triggerNotification("Attachment engine ready. File upload processing active in next phase.", "info")}
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>

                <input
                  type="text"
                  aria-label="Message AI Assistant"
                  onFocus={handleInputFocus}
                  placeholder={
                    currentQuestionIndex !== -1 && questions[currentQuestionIndex]
                      ? questions[currentQuestionIndex].placeholder
                      : "Type document name, e.g. NDA..."
                  }
                  className="flex-1 bg-transparent border-0 py-2.5 px-2 focus:outline-hidden text-sm font-medium text-text-cosmic placeholder:text-text-light"
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-[#3C1A47] hover:opacity-95 disabled:opacity-40 text-[#F1FEC8] rounded-xl transition-all shadow-md focus:outline-hidden cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* RIGHT COLUMN: INFORMATION SIDE PANEL (4 cols) */}
        <div className={`lg:col-span-4 flex-col gap-6 h-full ${focusMode ? 'hidden' : 'flex'}`}>
          
          {/* GUEST WARNING CALLOUT */}
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 text-left shadow-2xs">
              <div className="flex items-start gap-2.5 text-xs text-amber-800 font-bold leading-relaxed">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-extrabold font-display text-amber-900">Guest Session Mode</span>
                  <p className="font-medium text-[11px] mt-1 text-amber-800">Your draft is available for this session only. Log in to save your draft and access it later.</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE PROGRESS / PARAMETERS SUMMARY PANEL */}
          <div className="bg-white border border-vanilla-main rounded-[24px] p-4 shadow-md flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between text-left">
            <div>
              <div className="pb-3 border-b border-vanilla-main flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary font-mono">Wizard Summary</h3>
                {currentDocType && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#3C1A47] bg-[#F1FEC8] border border-brand-primary/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                    {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
                  </span>
                )}
              </div>

              {parameterSummary}
            </div>

            {/* Bottom Controls / Save Actions */}
            {currentDocType && (
              <div className="pt-4 border-t border-vanilla-main mt-4 space-y-2">
                {questions.length > 0 && (
                  <button
                    onClick={handleGenerateDocument}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-[#3C1A47] hover:from-emerald-600 hover:to-[#2C1335] text-white font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider animate-pulse mb-2"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-300" /> Generate Document
                  </button>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => triggerNotification("Draft progress saved in workspace securely.", "success")}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#3C1A47] hover:opacity-95 text-[#F1FEC8] text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </button>
                  <button
                    onClick={() => {
                      triggerNotification("Draft bookmarked. You can continue anytime from history.", "success");
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-vanilla-main hover:bg-vanilla-secondary text-text-secondary text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Continue Later
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => activeConvId && handleRenameConversation(activeConvId)}
                    className="text-[10px] font-bold text-text-secondary hover:text-brand-primary p-1.5 text-center transition-colors"
                  >
                    Rename Session
                  </button>
                  <button
                    onClick={() => activeConvId && handleDeleteConversation(activeConvId)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 p-1.5 text-center transition-colors"
                  >
                    Delete Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CHAT THREADS LIST - DESKTOP ONLY */}
          <div className="bg-white border border-vanilla-main rounded-[24px] p-5 shadow-md max-h-[220px] overflow-y-auto custom-scrollbar hidden lg:block text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-secondary font-mono pb-3 border-b border-vanilla-main mb-3">
              Conversations History
            </h3>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[10px] text-text-light font-bold">No active drafts found.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div 
                    key={conv.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      activeConvId === conv.id 
                        ? 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary' 
                        : 'bg-white border-vanilla-main text-text-secondary hover:bg-vanilla-secondary/40'
                    }`}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <div className="flex items-center gap-2 text-left min-w-0">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold truncate leading-tight">{conv.title}</span>
                        <span className="block text-[8px] font-bold text-text-light leading-none mt-0.5">{conv.documentType} • {conv.progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        className="p-1 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
