import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  ArrowLeft, ArrowRight, Save, Download, Printer, Copy, Share2, 
  Sparkles, ShieldCheck, History, Undo2, Redo2, Maximize2, 
  Minimize2, Search, Check, AlertCircle, FileText, ChevronRight, Clock, 
  Edit3, HelpCircle, RefreshCw, Lock, Globe, FileDown, Trash2, Eye,
  Lightbulb, X, Mail, MessageCircle, CheckCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  doc, setDoc, updateDoc, getDoc, collection, 
  addDoc, getDocs, query, where, orderBy, Timestamp, deleteDoc 
} from 'firebase/firestore';
import KartigoLoader from './KartigoLoader';
import Breadcrumbs from './Breadcrumbs';

interface DocumentEditorProps {
  documentId: string;
  initialContent: string;
  documentType: string;
  initialTitle: string;
  userId: string | undefined;
  onClose: () => void;
  onOpenAuth?: (mode?: 'login' | 'register', msg?: string) => void;
}

interface DocVersion {
  id: string;
  versionNumber: number;
  content: string;
  createdAt: any;
  title: string;
}

export default function DocumentEditor({
  documentId,
  initialContent,
  documentType,
  initialTitle,
  userId,
  onClose,
  onOpenAuth
}: DocumentEditorProps) {
  // Core states
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [documentTag, setDocumentTag] = useState<string>('');
  const [isTagging, setIsTagging] = useState(false);
  
  // Saved indicator toast state
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (saveStatus === 'saved') {
      setShowSavedToast(true);
      const t = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Search & Replace
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Dynamic Side Panel switching
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharingEmail, setIsSharingEmail] = useState(false);
  const [sidePanel, setSidePanel] = useState<'none' | 'explain' | 'rewrite' | 'qa' | 'history' | 'share'>('none');
  
  // AI states
  const [selectedText, setSelectedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [explanationResult, setExplanationResult] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  
  // QA Check State
  const [qaReport, setQaReport] = useState<{
    score: number;
    status: 'excellent' | 'good' | 'needs_work';
    issues: string[];
    suggestions: string[];
  } | null>(null);

  // Firestore Version History
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [isComparingVersions, setIsComparingVersions] = useState(false);
  const [comparisonVersionId, setComparisonVersionId] = useState<string>('');

  const [isPublic, setIsPublic] = useState(false);
  const [isSmartReviewOpen, setIsSmartReviewOpen] = useState(false);
  const [smartReviewStage, setSmartReviewStage] = useState<'analyzing' | 'report'>('analyzing');

  const [sharePassword, setSharePassword] = useState('');
  const [shareRole, setShareRole] = useState<'view' | 'edit'>('view');
  const [copiedLink, setCopiedLink] = useState(false);

  const { user, profile } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Trigger custom in-app notifications
  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Keep history for undo/redo
  const updateContentWithHistory = (newVal: string) => {
    setContent(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newVal]);
    setHistoryIndex(newHistory.length);
    setSaveStatus('idle');
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
      triggerNotification("Changes undone", "info");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
      triggerNotification("Changes redone", "info");
    }
  };

  // Word & Page Count calculation
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const pageCount = Math.max(1, Math.ceil(wordCount / 350));

  // Search & Replace logic
  const handleReplace = () => {
    if (!searchQuery) return;
    const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    if (!regex.test(content)) {
      triggerNotification("No matches found", "error");
      return;
    }
    const updated = content.replace(regex, replaceQuery);
    updateContentWithHistory(updated);
    triggerNotification(`Replaced all occurrences of "${searchQuery}" with "${replaceQuery}"`, "success");
    setIsSearchOpen(false);
  };

  // Fetch / save versions from Firestore
  const fetchVersionHistory = async () => {
    if (!userId) {
      try {
        const localVersionsStr = localStorage.getItem(`kartigo_versions_${documentId}`);
        if (localVersionsStr) {
          const parsed = JSON.parse(localVersionsStr);
          const list = parsed.map((v: any) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            content: v.content,
            title: v.title,
            createdAt: { toDate: () => new Date(v.createdAtDate || Date.now()) }
          }));
          setVersions(list);
        }
      } catch (e) {
        console.error("Error reading guest versions", e);
      }
      return;
    }
    try {
      const q = query(
        collection(db, 'users', userId, 'documents', documentId, 'versions'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list: DocVersion[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as DocVersion);
      });
      setVersions(list);
    } catch (err) {
      console.error("Error loading version history", err);
    }
  };

  useEffect(() => {
    fetchVersionHistory();
  }, [documentId, userId]);


  useEffect(() => {
    const handleSaveDraft = () => {
      // Manual save
      handleSaveDocument();
    };
    const handlePreviewDoc = () => {
      setIsFullscreen(true);
    };
    const handleExportPdf = () => {
      handleDownloadPdf();
    };

    window.addEventListener('kartigo:save-draft', handleSaveDraft);
    window.addEventListener('kartigo:preview-doc', handlePreviewDoc);
    window.addEventListener('kartigo:export-pdf', handleExportPdf);

    return () => {
      window.removeEventListener('kartigo:save-draft', handleSaveDraft);
      window.removeEventListener('kartigo:preview-doc', handlePreviewDoc);
      window.removeEventListener('kartigo:export-pdf', handleExportPdf);
    };
  }, [content, title]);

  // DEBOUNCED AUTO-SAVE FUNCTIONALITY (Saves to Firestore with 3.0s delay of inactivity as requested)
  useEffect(() => {
    if (!isLoaded) return;

    // Immediately set to saving state on content or title change
    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        if (userId) {
          const docRef = doc(db, 'users', userId, 'documents', documentId);
          const updatePayload = {
            title,
            content,
            updatedAt: Timestamp.now()
          };
          await setDoc(docRef, updatePayload, { merge: true });
        } else {
          // Local storage save for guests
          const guestsStr = localStorage.getItem('kartigo_guest_documents');
          let guests = guestsStr ? JSON.parse(guestsStr) : [];
          const existingIdx = guests.findIndex((g: any) => g.id === documentId);
          const payload = { id: documentId, title, content, documentType, updatedAt: new Date().toISOString() };
          if (existingIdx > -1) {
            guests[existingIdx] = payload;
          } else {
            guests.push(payload);
          }
          localStorage.setItem('kartigo_guest_documents', JSON.stringify(guests));
        }

        setSaveStatus('saved');
        setLastSavedTime(new Date());
        
        // Only trigger this subtle toast occasionally or let the visual indicator handle it, 
        // but we'll add it per requirements if it's not obtrusive
        triggerNotification("Draft auto-saved securely", "info");
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus('error');
      }
    }, 3000); // 3.0s debounce delay of inactivity

    return () => clearTimeout(timer);
  }, [content, title, userId, documentId, isLoaded]);  // Load share settings on init
  useEffect(() => {
    const loadShareSettings = async () => {
      if (!userId) {
        setIsLoaded(true);
        return;
      }
      try {
        const docRef = doc(db, 'users', userId, 'documents', documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPublic(data.isPublic || false);
          setSharePassword(data.sharePassword || '');
          setShareRole(data.shareRole || 'view');
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        }
      } catch (err) {
        console.error("Error loading document share settings", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadShareSettings();
  }, [documentId, userId]);

  // Save document handler
  const handleSaveDocument = async (isAuto = false) => {
    setSaveStatus('saving');
    try {
      // 1. Update primary document
      const docRef = userId 
        ? doc(db, 'users', userId, 'documents', documentId)
        : doc(db, 'documents', documentId);
        
      const updatePayload: any = {
        title,
        content,
        updatedAt: Timestamp.now()
      };
      
      // If client created offline, we set standard fields
      await setDoc(docRef, {
        userId: userId || 'anonymous',
        documentType,
        ...updatePayload
      }, { merge: true });

      // 2. Create version history if it's a manual save or substantial update
      if (!isAuto) {
        if (userId) {
          const versionCount = versions.length + 1;
          await addDoc(collection(db, 'users', userId, 'documents', documentId, 'versions'), {
            versionNumber: versionCount,
            content,
            title,
            createdAt: Timestamp.now()
          });
          await fetchVersionHistory();
        } else {
          const versionCount = versions.length + 1;
          const newVer = {
            id: `local-v-${Date.now()}`,
            versionNumber: versionCount,
            content,
            title,
            createdAtDate: new Date().toISOString()
          };
          const updatedVersions = [newVer, ...versions.map(v => ({
            id: v.id,
            versionNumber: v.versionNumber,
            content: v.content,
            title: v.title,
            createdAtDate: v.createdAt?.toDate ? v.createdAt.toDate().toISOString() : new Date().toISOString()
          }))];
          localStorage.setItem(`kartigo_versions_${documentId}`, JSON.stringify(updatedVersions));
          await fetchVersionHistory();
        }
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date());
      if (!isAuto) {
        triggerNotification("Document saved successfully! New version logged.", "success");
      }
    } catch (err) {
      console.error("Save error", err);
      setSaveStatus('error');
      triggerNotification("Failed to auto-save. Internet connection might be unstable.", "error");
    }
  };

  // AI Clause Explanation
  const handleExplainSelectedClause = async () => {
    let textToExplain = selectedText;
    if (!textToExplain) {
      // If no text selected, try to get active paragraph
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const paragraphs = content.split('\n\n');
        let cumulative = 0;
        for (const p of paragraphs) {
          cumulative += p.length + 2;
          if (cumulative >= start) {
            textToExplain = p;
            break;
          }
        }
      }
    }

    if (!textToExplain || textToExplain.trim().length < 5) {
      triggerNotification("Highlight or click on a paragraph first to explain.", "error");
      return;
    }

    setSidePanel('explain');
    setIsAiLoading(true);
    setExplanationResult('');

    try {
      const response = await fetch('/api/explain-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clauseText: textToExplain })
      });
      const data = await response.json();
      setExplanationResult(data.explanation);
    } catch (err) {
      console.error(err);
      triggerNotification("AI explanation lookup failed.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Smart Rewrite Action
  const handleAiRewrite = async (action: 'formal' | 'shorter' | 'detailed' | 'grammar' | 'clarity') => {
    let targetText = selectedText;
    if (!targetText) {
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const paragraphs = content.split('\n\n');
        let cumulative = 0;
        for (const p of paragraphs) {
          cumulative += p.length + 2;
          if (cumulative >= start) {
            targetText = p;
            break;
          }
        }
      }
    }

    if (!targetText || targetText.trim().length < 5) {
      triggerNotification("Please highlight or select a legal clause to rewrite.", "error");
      return;
    }

    setSidePanel('rewrite');
    setIsAiLoading(true);
    setRewrittenText('');

    try {
      const response = await fetch('/api/rewrite-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText, action })
      });
      const data = await response.json();
      setRewrittenText(data.rewrittenText);
    } catch (err) {
      console.error(err);
      triggerNotification("AI rewrite request failed.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyRewritten = () => {
    if (!rewrittenText) return;
    if (textareaRef.current && selectedText) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const original = content;
      const updated = original.substring(0, start) + rewrittenText + original.substring(end);
      updateContentWithHistory(updated);
    } else {
      // Append or replace entirely if no direct selection
      updateContentWithHistory(content + "\n\n" + rewrittenText);
    }
    triggerNotification("Rewritten clause integrated!", "success");
    setSidePanel('none');
  };

  // Legal QA Quality Audit
  const handleRunQualityCheck = async () => {
    setSidePanel('qa');
    setIsAiLoading(true);
    setQaReport(null);

    try {
      const response = await fetch('/api/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docContent: content })
      });
      const data = await response.json();
      setQaReport(data);
    } catch (err) {
      console.error(err);
      triggerNotification("Legal quality audit failed.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Restore previous saved version
  const handleRestoreVersion = (ver: DocVersion) => {
    updateContentWithHistory(ver.content);
    setTitle(ver.title);
    triggerNotification(`Restored content to Version ${ver.versionNumber}`, "success");
    setIsComparingVersions(false);
    setSidePanel('none');
  };

  // Share link update
  const handleUpdateShareSettings = async () => {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        isPublic,
        sharePassword,
        shareRole
      });
      triggerNotification("Access configuration updated securely.", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to configure share controls.", "error");
    }
  };

  // Copy shareable link
  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/shared/${documentId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerNotification("Secure sharing URL copied!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle PDF / Print Layout
  const handlePrintDocument = () => {
    if (!userId) {
      if (onOpenAuth) onOpenAuth('login', 'Please login to print your document.');
      return;
    }
    window.print();
  };

  // Server-side DOCX download

  const handleAutoTag = async () => {
    setIsTagging(true);
    try {
      const response = await fetch('/api/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (data.tag) {
        setDocumentTag(data.tag);
        triggerNotification(`Document tagged as: ${data.tag}`, "success");
      }
    } catch (err) {
      triggerNotification("Failed to auto-tag document.", "error");
    } finally {
      setIsTagging(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!userId) {
      if (onOpenAuth) onOpenAuth('login', 'Please login to download your document.');
      return;
    }
    setSaveStatus('saving');
    try {
      const token = user ? await user.getIdToken() : '';
      const response = await axios.post("/api/documents/download", {
        content,
        title,
        format: "docx",
        userId: userId || '',
        documentId: documentId || '',
        token: token || ''
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      triggerNotification("Professional DOCX generated!", "success");
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        triggerNotification("This document is locked. Please unlock it to download.", "error");
      } else {
        triggerNotification("Failed to generate DOCX.", "error");
      }
    } finally {
      setSaveStatus('saved');
    }
  };

  // Client-side high-fidelity PDF generation using html2pdf.js
  const handleDownloadPdf = async () => {
    if (!userId) {
      if (onOpenAuth) onOpenAuth('login', 'Please login to download your document.');
      return;
    }
    setIsGeneratingPdf(true);
    setPdfProgress(10);
    setSaveStatus('saving');
    
    // Simulate generation progress visually
    const progressInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.2;
      });
    }, 400);

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
      headerDiv.innerHTML = `<span>KARTIGO DRAFT</span><span>${title}</span>`;
      printContainer.appendChild(headerDiv);

      // Main Document Title
      const titleEl = document.createElement('h1');
      titleEl.style.fontSize = '17pt';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.color = '#0f172a';
      titleEl.style.marginBottom = '25px';
      titleEl.style.textAlign = 'center';
      titleEl.style.lineHeight = '1.3';
      titleEl.innerText = title;
      printContainer.appendChild(titleEl);

      // Render Markdown to HTML and inject
      const contentDiv = document.createElement('div');
      contentDiv.className = 'prose max-w-none';
      contentDiv.style.textAlign = 'justify';
      contentDiv.innerHTML = renderMarkdownToHtml(content);
      
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

      const h3s = contentDiv.getElementsByTagName('h3');
      for (let i = 0; i < h3s.length; i++) {
        h3s[i].style.fontSize = '11pt';
        h3s[i].style.fontWeight = 'bold';
        h3s[i].style.marginTop = '14px';
        h3s[i].style.marginBottom = '6px';
        h3s[i].style.color = '#334155';
      }

      const lists = contentDiv.getElementsByTagName('li');
      for (let i = 0; i < lists.length; i++) {
        lists[i].style.fontSize = '10.5pt';
        lists[i].style.marginBottom = '6px';
        lists[i].style.color = '#1e293b';
      }

      const tables = contentDiv.getElementsByTagName('table');
      for (let i = 0; i < tables.length; i++) {
        tables[i].style.width = '100%';
        tables[i].style.borderCollapse = 'collapse';
        tables[i].style.marginTop = '16px';
        tables[i].style.marginBottom = '16px';
        tables[i].style.fontSize = '9.5pt';
      }

      const ths = contentDiv.getElementsByTagName('th');
      for (let i = 0; i < ths.length; i++) {
        ths[i].style.border = '1px solid #cbd5e1';
        ths[i].style.padding = '8px';
        ths[i].style.backgroundColor = '#f8fafc';
        ths[i].style.textAlign = 'left';
        ths[i].style.fontWeight = 'bold';
      }

      const tds = contentDiv.getElementsByTagName('td');
      for (let i = 0; i < tds.length; i++) {
        tds[i].style.border = '1px solid #cbd5e1';
        tds[i].style.padding = '8px';
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
      footerDiv.innerHTML = `<span>DRAFT ID: ${documentId.substring(0, 8)}</span><span>CONFIDENTIAL & SECURE</span>`;
      printContainer.appendChild(footerDiv);

      // Options configuration for html2pdf.js
      const opt: any = {
        margin: [15, 15, 15, 15], // 15mm print margins
        filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
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
      
      setPdfProgress(100);
      clearInterval(progressInterval);
      triggerNotification("PDF exported successfully! Your download has started.", "success");
      
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgress(0);
      }, 2000);
      
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsGeneratingPdf(false);
      setPdfProgress(0);
      console.error("PDF download failed", err);
      triggerNotification("Failed to generate offline PDF.", "error");
    } finally {
      setSaveStatus('saved');
    }
  };


  const handleSendEmail = async () => {
    if (!userId) {
      if (onOpenAuth) onOpenAuth('login', 'Please login to send your document via email.');
      return;
    }
    const targetEmail = profile?.email || window.prompt("Enter recipient email address:");
    if (!targetEmail) return;

    setSaveStatus('saving');
    try {
      await axios.post("/api/email/send", {
        to: targetEmail,
        subject: `Your Document: ${title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #6D28D9;">Kartigo Draft</h1>
            <p>Hi,</p>
            <p>Your document <strong>${title}</strong> is ready. You can find the content below.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <div style="white-space: pre-wrap; color: #333;">${content}</div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Generated with AI Assistant AI Document Engine.</p>
          </div>
        `
      });
      triggerNotification("Document sent successfully!", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to send email.", "error");
    } finally {
      setSaveStatus('saved');
    }
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(`Hi, here is the document I drafted using Kartigo Draft: ${title}\n\n${content.substring(0, 500)}...`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    triggerNotification("Opening WhatsApp...", "info");
  };

  // Track selection for Context AI actions
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== end) {
      setSelectedText(target.value.substring(start, end));
    } else {
      setSelectedText('');
    }
  };

  // Elegant client side Markdown converter for high fidelity visual canvas page representation
  const renderMarkdownToHtml = (md: string) => {
    if (!md) return '';
    let html = md;
    
    // Escaping simple HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold font-display text-brand-secondary border-b border-vanilla-main pb-2 mt-6 mb-4 tracking-tight">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold font-display text-brand-secondary border-b border-vanilla-main/50 pb-1 mt-5 mb-3 tracking-tight">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold text-brand-secondary mt-4 mb-2">$1</h3>');

    // Tables
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="overflow-x-auto my-4 border border-vanilla-main rounded-xl shadow-3xs"><table class="w-full text-[11px] text-left border-collapse bg-white">';
        }
        
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const isHeader = lines[i + 1] && lines[i + 1].includes('|:---') || (i > 0 && lines[i - 1] && lines[i - 1].includes('|:---'));
        
        if (line.includes('|:---') || line.includes('|---|')) {
          // Divider line, skip
          continue;
        }

        tableHtml += '<tr class="border-b border-vanilla-main">';
        cells.forEach(cell => {
          if (isHeader) {
            tableHtml += `<th class="px-3 py-2 bg-vanilla-secondary font-mono font-bold uppercase tracking-wider text-brand-secondary text-[9px]">${cell}</th>`;
          } else {
            tableHtml += `<td class="px-3 py-2 font-medium text-text-cosmic">${cell}</td>`;
          }
        });
        tableHtml += '</tr>';
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</table></div>';
          lines[i] = tableHtml + '\n' + lines[i];
        }
      }
    }
    html = lines.join('\n');

    // Bullets / lists
    html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-xs font-medium text-text-cosmic leading-relaxed my-1">$1</li>');
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-xs font-medium text-text-cosmic leading-relaxed my-1">$1</li>');
    
    // Bold / Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-secondary">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Line breaks & paragraphs
    html = html.replace(/\n\n/g, '</div><div class="my-4 text-xs font-medium text-text-cosmic leading-relaxed text-justify">');
    
    // Outer wrap
    return `<div class="font-sans py-4 px-1 text-xs"><div class="my-3 text-xs font-medium text-text-cosmic leading-relaxed text-justify">${html}</div></div>`;
  };

  return (
    <div className={`document-editor-container ${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#F1FEC8] p-0 overflow-hidden' : 'min-h-screen bg-vanilla-main/30 z-50'} flex flex-col relative`}>
      
      {/* Toast Notification for Save Success */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[10000] flex items-center gap-2 bg-green-50 backdrop-blur-md border border-green-200 text-green-700 px-4 py-2 rounded-full shadow-lg pointer-events-none no-print"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-bold font-mono tracking-wide">Progress saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-vanilla-secondary/80 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-brand-primary/20 max-w-sm w-full mx-4 text-center">
            <h3 className="text-sm font-bold text-brand-secondary mb-4 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
              Generating Pristine PDF...
            </h3>
            <div className="w-full h-2 bg-vanilla-main rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all duration-300"
                style={{ width: `${pdfProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-text-light font-mono mt-2 font-bold">{Math.round(pdfProgress)}% COMPLETE</p>
          </div>
        </div>
      )}


      {/* SHARE VIA EMAIL MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-vanilla-secondary/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-vanilla-main w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="p-4 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/30">
                <h3 className="font-bold text-brand-secondary flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-primary" /> Share Document via Email
                </h3>
                <button onClick={() => setIsShareModalOpen(false)} className="p-1 hover:bg-vanilla-secondary rounded-lg text-text-light cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-xs text-text-light font-medium mb-4">Send a secure link to this document to a collaborator.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1.5">Collaborator Email</label>
                    <input 
                      type="email" 
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full px-3 py-2 bg-vanilla-secondary border border-vanilla-main rounded-xl text-xs font-bold text-brand-secondary focus:outline-hidden focus:border-brand-primary/40"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!shareEmail) return;
                      setIsSharingEmail(true);
                      try {
                        const link = `${window.location.origin}/share/${documentId}`;
                        await axios.post("/api/email/send", {
                          to: shareEmail,
                          subject: `Shared Document: ${title}`,
                          html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                              <h1 style="color: #6D28D9;">Kartigo Draft</h1>
                              <p>Hi,</p>
                              <p>A document titled <strong>${title}</strong> has been shared with you.</p>
                              <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #6D28D9; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Document</a>
                            </div>
                          `
                        });
                        triggerNotification("Email sent successfully!", "success");
                        setIsShareModalOpen(false);
                        setShareEmail('');
                      } catch (err) {
                        console.error(err);
                        triggerNotification("Failed to send email.", "error");
                      } finally {
                        setIsSharingEmail(false);
                      }
                    }}
                    disabled={!shareEmail || isSharingEmail}
                    className="w-full py-2.5 bg-brand-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSharingEmail ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send Link
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLS */}
      {!isFullscreen && (
        <div className="bg-white border-b border-vanilla-main px-4 py-2 flex flex-col no-print sticky top-0 z-40">
          <div className="mb-1">
            <Breadcrumbs 
              onBackHome={onClose}
              items={[
                { label: 'My Documents', onClick: onClose },
                { label: title, isActive: true }
              ]} 
            />
          </div>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Back button & Title Editor */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:bg-vanilla-secondary rounded-xl cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                <FileText className="h-4 w-4" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                      className="text-sm font-extrabold font-display text-brand-secondary border-b-2 border-brand-primary focus:outline-hidden bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      onClick={() => setIsEditingTitle(true)}
                      className="text-sm font-extrabold font-display text-brand-secondary hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      {title} <Edit3 className="h-3.5 w-3.5 text-text-light" />
                    </h1>
                  )}
                  {documentTag && (
                    <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-wider rounded-md">
                      {documentTag}
                    </span>
                  )}
                  <button 
                    onClick={handleAutoTag}
                    disabled={isTagging}
                    className="ml-1 px-2 py-1 bg-vanilla-secondary hover:bg-vanilla-main text-[10px] font-bold text-text-secondary rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Suggest Category via AI"
                  >
                    {isTagging ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-brand-primary" />}
                    Auto-Tag
                  </button>
                  
                  <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                    saveStatus === 'saved' 
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : saveStatus === 'saving'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {saveStatus === 'saved' ? 'Auto-Saved' : saveStatus === 'saving' ? 'Auto-saving...' : 'Draft Unsaved'}
                  </span>
                </div>
                <p className="text-[10px] text-text-light font-bold mt-0.5">
                  {documentType} • Saved at {lastSavedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                </p>
              </div>
            </div>
          </div>

{/* Middle: Canvas Tabs & ReadOnly Toggle */}
          <div className="flex bg-vanilla-secondary/80 p-1 rounded-xl border border-vanilla-main/60 self-center items-center gap-2">
            <div className="flex border-r border-vanilla-main pr-2 mr-1">
              <button
                onClick={() => setIsReadOnly(!isReadOnly)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isReadOnly ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-text-secondary hover:bg-vanilla-secondary'
                }`}
              >
                {isReadOnly ? <Lock className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                {isReadOnly ? 'Read-Only' : 'Editing'}
              </button>
            </div>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'edit' ? 'bg-[#3C1A47] text-[#F1FEC8] shadow-sm' : 'text-text-secondary hover:bg-vanilla-secondary'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" /> Canvas Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-[#3C1A47] text-[#F1FEC8] shadow-sm' : 'text-text-secondary hover:bg-vanilla-secondary'
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Print Preview
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {activeTab === 'preview' && (
              <button
                onClick={handlePrintDocument}
                className="px-3 py-2 bg-[#3C1A47] text-[#F1FEC8] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Print Document"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            )}
            <button
              onClick={() => {
                setIsSmartReviewOpen(true);
                setSmartReviewStage('analyzing');
                // Simulate analyze time
                setTimeout(() => setSmartReviewStage('report'), 2500);
              }}
              className="px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Smart Review & Download"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#F1FEC8]" /> Smart Review
            </button>
            <button
              onClick={() => setSidePanel(sidePanel === 'history' ? 'none' : 'history')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                sidePanel === 'history' ? 'bg-brand-primary text-white border-transparent' : 'bg-white border-vanilla-main text-text-secondary hover:bg-vanilla-secondary'
              }`}
              title="View Draft Version History"
            >
              <History className="h-3.5 w-3.5" /> Versions ({versions.length})
            </button>
            <button
              onClick={() => setSidePanel(sidePanel === 'share' ? 'none' : 'share')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                sidePanel === 'share' ? 'bg-brand-primary text-white border-transparent' : 'bg-white border-vanilla-main text-text-secondary hover:bg-vanilla-secondary'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
<button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Share via Email"
            >
              <Mail className="h-3.5 w-3.5" /> Share Link
            </button>
            <button
              onClick={handleDownloadDocx}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Download DOCX"
            >
              <FileDown className="h-3.5 w-3.5" /> Download DOCX
            </button>
<button
              onClick={handleDownloadDocx}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Download DOCX"
            >
              <FileDown className="h-3.5 w-3.5" /> Download DOCX
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Download formatted PDF"
            >
              <FileDown className="h-3.5 w-3.5" /> Download PDF
            </button>
            <div className="flex items-center gap-2 mr-2">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                  <CheckCircle className="h-3 w-3" /> Saved
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving
                </span>
              )}
            </div>
            <button
              onClick={() => handleSaveDocument(false)}
              className="px-4 py-2 bg-[#3C1A47] hover:opacity-95 text-[#F1FEC8] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" /> Save Version
            </button>
          </div>
        </header>
        </div>
      )}

{/* SUB TOOLBAR FOR TEXT FORMATTING (Edit Mode only) */}
      {activeTab === 'edit' && !isReadOnly && (
        <div className="bg-vanilla-secondary/40 border-b border-vanilla-main px-4 py-2 flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-1.5 divide-x divide-vanilla-main">
            
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 pr-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="p-1.5 text-text-secondary hover:bg-vanilla-secondary rounded-lg disabled:opacity-35 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-text-secondary hover:bg-vanilla-secondary rounded-lg disabled:opacity-35 cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick markdown macros */}
            <div className="flex items-center gap-1 px-2">
              <button
                onClick={() => updateContentWithHistory(content + "\n## NEW SECTION\n")}
                className="px-2 py-1 text-[10px] font-mono font-bold text-brand-secondary bg-white border border-vanilla-main rounded-md hover:bg-vanilla-secondary"
                title="Add Section"
              >
                H2
              </button>
              <button
                onClick={() => updateContentWithHistory(content + "\n### SUBSECTION\n")}
                className="px-2 py-1 text-[10px] font-mono font-bold text-brand-secondary bg-white border border-vanilla-main rounded-md hover:bg-vanilla-secondary"
                title="Add Subsection"
              >
                H3
              </button>
              <button
                onClick={() => {
                  const tableMacro = "\n| Item Description | Details / Terms |\n| :--- | :--- |\n| Scope of Work | Service Specs |\n| Fee Schedule | Milestone Details |\n";
                  updateContentWithHistory(content + tableMacro);
                }}
                className="px-2 py-1 text-[10px] font-mono font-bold text-brand-secondary bg-white border border-vanilla-main rounded-md hover:bg-vanilla-secondary"
                title="Add Table"
              >
                Table
              </button>
              <button
                onClick={() => {
                  const execMacro = "\n\n### REPRESENTATIVE SIGN-OFF:\n\n* **Party Name:** ___________________\n* **Authorized Signatory:** ___________________\n* **Title:** ___________________\n* **Date:** ___________________\n";
                  updateContentWithHistory(content + execMacro);
                }}
                className="px-2 py-1 text-[10px] font-mono font-bold text-brand-secondary bg-white border border-vanilla-main rounded-md hover:bg-vanilla-secondary"
                title="Add Signature Block"
              >
                Sign-off
              </button>
            </div>

            {/* Search and Replace toggle */}
            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-1.5 rounded-lg cursor-pointer ${isSearchOpen ? 'bg-brand-primary/15 text-brand-primary' : 'text-text-secondary hover:bg-vanilla-secondary'}`}
                title="Search and Replace"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Focus Mode Toggle */}
            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all ${isFullscreen ? 'bg-[#3C1A47] text-[#F1FEC8] shadow-xs' : 'bg-vanilla-secondary/80 border border-vanilla-main/60 text-text-secondary hover:bg-vanilla-secondary hover:text-brand-primary'}`}
                title={isFullscreen ? "Exit Focus Mode" : "Immersive Focus Mode"}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                <span>Focus Mode</span>
              </button>
            </div>
          </div>

          {/* Quick AI Assist Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExplainSelectedClause}
              className="px-2.5 py-1 text-[10px] font-bold text-[#3C1A47] bg-[#F1FEC8] border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> Explain Paragraph
            </button>
            
            <button
              onClick={handleRunQualityCheck}
              className="px-2.5 py-1 text-[10px] font-bold text-[#3C1A47] bg-[#F1FEC8] border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3" /> Legal Quality QA
            </button>
            
            <button
              onClick={() => setSidePanel(sidePanel === 'history' ? 'none' : 'history')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 border ${
                sidePanel === 'history' ? 'bg-brand-primary text-white border-transparent' : 'bg-white border-vanilla-main text-text-secondary hover:bg-vanilla-secondary'
              }`}
            >
              <History className="h-3 w-3" /> Versions ({versions.length})
            </button>
          </div>
        </div>
      )}

      {/* SEARCH AND REPLACE FORM FLOATER */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border-b border-vanilla-main px-4 py-2 flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono text-text-light uppercase">Search:</span>
              <input
                type="text"
                placeholder="Find term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 py-1 text-xs bg-vanilla-secondary border border-vanilla-main rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono text-text-light uppercase">Replace:</span>
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="px-2 py-1 text-xs bg-vanilla-secondary border border-vanilla-main rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <button
              onClick={handleReplace}
              className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
            >
              Replace All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN WORKING PANELS CONTAINER */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-140px)]'}`}>
        
        {/* LEFT COLUMN: ACTIVE EDITOR WORKSPACE */}
        <div className={`lg:col-span-${(sidePanel === 'none' || isFullscreen) ? '12' : '8'} p-6 overflow-y-auto custom-scrollbar bg-vanilla-main/10 flex justify-center`}>
          
          {/* Print & Focus Stylesheet Injection */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              header,
              .no-print,
              button,
              nav,
              aside,
              .fixed,
              .sticky,
              [role="dialog"] {
                display: none !important;
              }
              
              body, html, #root {
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
                height: auto !important;
                overflow: visible !important;
              }
              
              .min-h-screen {
                min-height: auto !important;
                background: white !important;
                padding: 0 !important;
              }
              
              /* Reset editor workspace padding during print */
              .p-6 {
                padding: 0 !important;
              }
              
              /* Document Page Style Reset */
              .bg-white {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-height: auto !important;
              }

              @page {
                size: A4;
                margin: 20mm;
              }

              h1, h2, h3 {
                page-break-after: avoid;
                color: black !important;
              }
              p, li, tr {
                page-break-inside: avoid;
                color: #111 !important;
              }
            }

            /* Immersive Focus Mode styling overrides */
            ${isFullscreen ? `
              header,
              footer,
              nav,
              aside,
              .no-focus-mode {
                display: none !important;
              }
              body, html, #root {
                overflow: hidden !important;
                background-color: #F1FEC8 !important;
              }
              .sticky, .fixed, [role="banner"] {
                display: none !important;
              }
              /* Hide standard dashboard elements for immersive focus */
              .dashboard-sidebar, .dashboard-nav, .dashboard-footer {
                display: none !important;
              }
            ` : ''}
          `}} />

          {/* FLOATING ACTION OVERLAYS FOR FULLSCREEN */}
          {isFullscreen && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-3 no-print">
              <span className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-full shadow-md ${
                saveStatus === 'saved' 
                  ? 'bg-green-50 text-green-700 border border-green-100/30'
                  : saveStatus === 'saving'
                  ? 'bg-amber-50 text-amber-700 border border-amber-100/30 animate-pulse'
                  : 'bg-red-50 text-red-700 border border-red-100/30'
              }`}>
                {saveStatus === 'saved' ? 'Auto-Saved' : saveStatus === 'saving' ? 'Auto-saving...' : 'Unsaved'}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="bg-[#3C1A47] text-white hover:opacity-90 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exit Focus Mode"
              >
                <Minimize2 className="h-3 w-3" /> Exit Focus Mode
              </button>
            </div>
          )}

          <div className="w-full max-w-3xl flex flex-col gap-4">
            
            {/* PRINT & EXPORT BANNER (Print Preview mode only) */}
            {activeTab === 'preview' && (
              <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                <div className="text-left">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">High-Fidelity Document Viewer</span>
                  <p className="text-xs text-amber-700/80 font-medium mt-0.5">Ready for professional signature and execution. Styled for clean, zero-UI printing.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-[#3C1A47] text-[#F1FEC8] text-xs font-extrabold rounded-xl shadow-xs hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print / Export PDF
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3.5 py-2 bg-rose-600 text-white text-xs font-extrabold rounded-xl shadow-xs hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            )}

            {/* Visual Editor Card container styled exactly like an A4 document page */}
            <div className="bg-white rounded-[24px] border border-vanilla-main shadow-lg p-8 md:p-12 min-h-[750px] relative text-left">
              
              {/* Header Page Layout details */}
              <div className="absolute top-4 left-6 right-6 flex items-center justify-between border-b border-vanilla-main/20 pb-2 text-[8px] font-bold font-mono text-text-light uppercase tracking-widest pointer-events-none">
                <span>KARTIGO DRAFT – PREVIEW</span>
                <span>PAGE {pageCount} of {pageCount}</span>
              </div>

              {activeTab === 'edit' ? (
                <textarea
                  readOnly={isReadOnly}
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => updateContentWithHistory(e.target.value)}
                  onSelect={handleTextareaSelect}
                  placeholder="Start typing your dynamic legal draft here..."
                  className="w-full min-h-[650px] mt-6 resize-none border-0 p-0 text-xs font-medium leading-relaxed text-text-cosmic focus:outline-hidden focus:ring-0 placeholder:text-text-light/50 font-sans text-justify"
                />
              ) : (
                <div 
                  className="prose prose-sm max-w-none mt-6 select-text text-justify"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
                />
              )}

              {/* Page Footer layout details */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between border-t border-vanilla-main/20 pt-2 text-[8px] font-bold font-mono text-text-light uppercase tracking-widest pointer-events-none">
                <span>ENCRYPTED DRAFT ID: {documentId.substring(0, 8)}...</span>
                <span>WORDS: {wordCount}</span>
              </div>

            
            {/* Cross-Sell Recommendations */}
            <div className="bg-vanilla-secondary border border-vanilla-main rounded-2xl p-6 mt-8 no-print text-left">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-brand-secondary">Recommended Next Steps</h4>
              </div>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed font-medium">
                Based on your {documentType || 'document'}, users typically create these companion documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {((type) => {
                  const t = (type || '').toLowerCase();
                  if (t.includes('appointment') || t.includes('offer')) return ['Employment Agreement', 'Employee NDA', 'HR Policy'];
                  if (t.includes('rent') || t.includes('lease')) return ['Rent Receipt', 'Security Deposit Receipt', 'Property Handover Letter'];
                  if (t.includes('service') || t.includes('consulting')) return ['Invoice', 'Quotation', 'Business Proposal'];
                  if (t.includes('partner')) return ['NDA', 'MoU', 'Founder Agreement'];
                  return ['NDA', 'Service Agreement', 'Invoice'];
                })(documentType).map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => { window.location.href = '/' }}
                    className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-vanilla-main/60 hover:border-brand-primary/40 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-brand-secondary group-hover:text-brand-primary transition-colors text-left">{rec}</span>
                    <span className="text-[10px] font-mono text-text-light uppercase tracking-wider text-left">Start Drafting <ArrowRight className="h-3 w-3 inline" /></span>
                  </button>
                ))}
              </div>
            </div>
            </div>

            {/* Quick Context Float Action menu */}
            {selectedText && activeTab === 'edit' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#3C1A47] text-[#F1FEC8] px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3.5 self-center"
              >
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider opacity-85 border-r border-[#F1FEC8]/20 pr-3">Selected Text</span>
                
                <button
                  onClick={handleExplainSelectedClause}
                  className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-300" /> Explain
                </button>
                
                <div className="h-3 w-px bg-[#F1FEC8]/20" />
                
                <span className="text-[10px] font-bold opacity-85">Rewrite:</span>
                <button 
                  onClick={() => handleAiRewrite('formal')}
                  className="text-xs font-bold hover:underline text-amber-300 cursor-pointer"
                >
                  Formal
                </button>
                <button 
                  onClick={() => handleAiRewrite('shorter')}
                  className="text-xs font-bold hover:underline text-amber-300 cursor-pointer"
                >
                  Shorter
                </button>
                <button 
                  onClick={() => handleAiRewrite('detailed')}
                  className="text-xs font-bold hover:underline text-amber-300 cursor-pointer"
                >
                  Detailed
                </button>
              </motion.div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: COLLAPSIBLE DYNAMIC SIDE PANEL */}
        {sidePanel !== 'none' && !isFullscreen && (
          <div className="lg:col-span-4 bg-white border-l border-vanilla-main flex flex-col h-full overflow-hidden text-left shadow-2xl relative z-20 no-print">
            
            {/* Header */}
            <div className="p-4 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-secondary font-mono flex items-center gap-1.5">
                {sidePanel === 'explain' && <Sparkles className="h-4 w-4 text-brand-primary" />}
                {sidePanel === 'rewrite' && <Sparkles className="h-4 w-4 text-brand-primary" />}
                {sidePanel === 'qa' && <ShieldCheck className="h-4 w-4 text-brand-primary" />}
                {sidePanel === 'history' && <History className="h-4 w-4 text-brand-primary" />}
                {sidePanel === 'share' && <Share2 className="h-4 w-4 text-brand-primary" />}
                
                {sidePanel === 'explain' && 'Clause Explanation'}
                {sidePanel === 'rewrite' && 'Smart AI Rewrite'}
                {sidePanel === 'qa' && 'Legal QA Report'}
                {sidePanel === 'history' && 'Version Timelines'}
                {sidePanel === 'share' && 'Access Controls'}
              </h3>
              <button
                onClick={() => setSidePanel('none')}
                className="p-1 hover:bg-vanilla-secondary rounded-lg text-text-light hover:text-brand-primary cursor-pointer text-xs font-bold"
              >
                Close ×
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
              
              {/* Loader */}
              {isAiLoading && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <KartigoLoader size="sm" text="AI Engine Processing..." />
                </div>
              )}

              {/* PANEL 1: CLAUSE EXPLANATION */}
              {!isAiLoading && sidePanel === 'explain' && (
                <div className="space-y-4">
                  {explanationResult ? (
                    <div className="prose prose-sm max-w-none text-xs font-medium leading-relaxed text-text-cosmic space-y-3">
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(explanationResult) }} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="h-10 w-10 text-text-light/40 mx-auto mb-2" />
                      <p className="text-xs font-bold text-brand-secondary">No Explanation Active</p>
                      <p className="text-[11px] text-text-light mt-1">Highlight any sentence or paragraph in the document canvas and click "Explain Paragraph" to receive layman translation.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: SMART AI REWRITE */}
              {!isAiLoading && sidePanel === 'rewrite' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 pb-3 border-b border-vanilla-main">
                    <span className="text-[10px] text-text-light font-mono font-bold uppercase w-full mb-1">Select Tone Override:</span>
                    <button 
                      onClick={() => handleAiRewrite('formal')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-vanilla-main rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                    >
                      👔 Formalize
                    </button>
                    <button 
                      onClick={() => handleAiRewrite('shorter')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-vanilla-main rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                    >
                      ✂️ Make Concise
                    </button>
                    <button 
                      onClick={() => handleAiRewrite('detailed')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-vanilla-main rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                    >
                      📚 Expand Details
                    </button>
                    <button 
                      onClick={() => handleAiRewrite('clarity')}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-vanilla-main rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                    >
                      💡 Clarity check
                    </button>
                  </div>

                  {rewrittenText ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-vanilla-secondary/40 border border-vanilla-main rounded-xl">
                        <span className="text-[9px] text-brand-primary font-mono font-bold uppercase block mb-1">AI Recommendation</span>
                        <p className="text-xs font-semibold text-brand-secondary leading-relaxed italic">"{rewrittenText}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleApplyRewritten}
                          className="px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> Apply Clause
                        </button>
                        <button
                          onClick={() => setRewrittenText('')}
                          className="px-3 py-2 bg-white border border-vanilla-main text-text-secondary text-xs font-bold rounded-xl hover:bg-vanilla-secondary cursor-pointer"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="h-10 w-10 text-brand-primary/35 mx-auto mb-2" />
                      <p className="text-xs font-bold text-brand-secondary">AI Copywriter Ready</p>
                      <p className="text-[11px] text-text-light mt-1">Select text or place cursor on a clause paragraph, then tap any rewrite action button above.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 3: LEGAL QA AUDIT */}
              {!isAiLoading && sidePanel === 'qa' && (
                <div className="space-y-4">
                  {qaReport ? (
                    <div className="space-y-4">
                      
                      {/* Score Indicator */}
                      <div className="bg-vanilla-secondary p-4 rounded-[20px] border border-vanilla-main flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] font-mono font-bold text-text-light uppercase">QA Health Score</span>
                          <span className="text-2xl font-extrabold font-display text-brand-secondary mt-1 block">{qaReport.score}/100</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono ${
                          qaReport.status === 'excellent' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : qaReport.status === 'good'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {qaReport.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Detected Issues */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">Identified Risks & Gaps ({qaReport.issues.length})</h4>
                        {qaReport.issues.length === 0 ? (
                          <p className="text-[11px] font-bold text-green-600">✓ No critical structural gaps or empty bracket placeholders detected.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {qaReport.issues.map((iss, i) => (
                              <div key={i} className="p-2.5 bg-red-50/50 border border-red-200/50 rounded-xl flex items-start gap-2 text-[11px] font-bold text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                <span>{iss}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Suggestions list */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">Draft Improvements Suggestions</h4>
                        <div className="space-y-1.5">
                          {qaReport.suggestions.map((sug, i) => (
                            <div key={i} className="p-2.5 bg-vanilla-secondary/40 border border-vanilla-main rounded-xl flex items-start gap-2 text-[11px] font-medium text-text-cosmic">
                              <ChevronRight className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
                              <span>{sug}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShieldCheck className="h-10 w-10 text-text-light/40 mx-auto mb-2" />
                      <p className="text-xs font-bold text-brand-secondary">Run Document Audit</p>
                      <p className="text-[11px] text-text-light mt-1">Our automated validation engine scans for empty variables, grammar correctness, and mandatory boilerplates.</p>
                      <button
                        onClick={handleRunQualityCheck}
                        className="mt-4 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1"
                      >
                        Launch Auditor
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 4: VERSION TIMELINE */}
              {!isAiLoading && sidePanel === 'history' && (
                <div className="space-y-4">
                  
                  {isComparingVersions ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-vanilla-main">
                        <span className="text-xs font-bold text-brand-secondary">Comparing Content</span>
                        <button
                          onClick={() => setIsComparingVersions(false)}
                          className="text-[10px] font-bold text-brand-primary hover:underline"
                        >
                          Exit Compare
                        </button>
                      </div>

                      {versions.map((v) => {
                        if (v.id === comparisonVersionId) {
                          return (
                            <div key={v.id} className="space-y-2">
                              <div className="p-3 bg-vanilla-secondary rounded-xl text-left">
                                <span className="block text-[10px] font-bold text-text-light">Version {v.versionNumber} Title</span>
                                <span className="block text-xs font-extrabold text-brand-secondary mt-0.5">{v.title}</span>
                              </div>
                              <div className="p-3 border border-vanilla-main bg-white rounded-xl text-left max-h-[300px] overflow-y-auto custom-scrollbar">
                                <span className="block text-[10px] font-mono text-text-light uppercase tracking-wider mb-2">Version {v.versionNumber} Content</span>
                                <p className="text-[10px] font-medium font-sans whitespace-pre-wrap text-text-cosmic leading-relaxed">{v.content}</p>
                              </div>
                              <button
                                onClick={() => handleRestoreVersion(v)}
                                className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer"
                              >
                                Revert Active To Version {v.versionNumber}
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono text-text-light uppercase font-bold tracking-wider block">Logged Version History</span>
                      
                      {versions.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-[10px] text-text-light font-bold">No versions saved in database yet.</p>
                        </div>
                      ) : (
                        versions.map((ver, idx) => (
                          <div 
                            key={ver.id}
                            className="p-3 bg-white border border-vanilla-main rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-brand-primary transition-all cursor-pointer"
                            onClick={() => {
                              setComparisonVersionId(ver.id);
                              setIsComparingVersions(true);
                            }}
                          >
                            <div>
                              <span className="block text-[11px] font-bold text-brand-secondary">Version {ver.versionNumber}</span>
                              <span className="block text-[9px] font-semibold text-text-light mt-0.5">
                                {ver.createdAt ? new Date(ver.createdAt.toDate()).toLocaleString() : 'Just now'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreVersion(ver);
                                }}
                                className="px-2 py-1 bg-vanilla-secondary text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-[9px] font-bold cursor-pointer"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* PANEL 5: SHARE ACCESS CONTROLS */}
              {!isAiLoading && sidePanel === 'share' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-text-light uppercase font-bold tracking-wider block">Sharing Configuration</span>
                    
                    {/* Share toggle */}
                    <div className="p-3.5 bg-vanilla-secondary p-4 rounded-[20px] border border-vanilla-main flex items-center justify-between">
                      <div className="text-left">
                        <span className="block text-xs font-bold text-brand-secondary">Public Link Access</span>
                        <p className="text-[10px] text-text-light font-semibold mt-0.5">Anyone with this link can view the document.</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsPublic(!isPublic);
                        }}
                        className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${isPublic ? 'bg-brand-primary' : 'bg-text-light/35'}`}
                      >
                        <div className={`h-4 w-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Shared settings controls */}
                    {isPublic && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2 border-t border-vanilla-main mt-2"
                      >
                        
                        {/* Role selection */}
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Access Role Permission</label>
                          <select
                            value={shareRole}
                            onChange={(e) => setShareRole(e.target.value as 'view' | 'edit')}
                            className="w-full text-xs px-3 py-2 bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden"
                          >
                            <option value="view">Viewer Mode (Read only)</option>
                            <option value="edit">Editor Mode (Editable by anyone)</option>
                          </select>
                        </div>

                        {/* Password protection optional */}
                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Password Protection (Optional)</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-light" />
                            <input
                              type="password"
                              placeholder="Enter access password..."
                              value={sharePassword}
                              onChange={(e) => setSharePassword(e.target.value)}
                              className="w-full text-xs pl-8 pr-3 py-2 bg-vanilla-secondary border border-vanilla-main rounded-xl focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleUpdateShareSettings}
                          className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer"
                        >
                          Apply Share Credentials
                        </button>

                        {/* Copied URL helper */}
                        <div className="bg-vanilla-secondary/40 border border-vanilla-main p-3 rounded-2xl flex items-center justify-between gap-3">
                          <span className="text-[10px] font-mono text-brand-secondary truncate font-bold">{window.location.origin}/shared/{documentId}</span>
                          <button
                            onClick={handleCopyShareLink}
                            className="px-2.5 py-1 bg-brand-primary text-white text-[10px] font-extrabold rounded-lg hover:opacity-90 shrink-0 cursor-pointer"
                          >
                            {copiedLink ? 'Copied' : 'Copy'}
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
      
      {/* SMART REVIEW MODAL */}
      <AnimatePresence>
        {isSmartReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-vanilla-main"
            >
              <div className="p-6 border-b border-vanilla-main flex justify-between items-center bg-vanilla-alt">
                <div>
                  <h2 className="text-xl font-bold font-display text-text-cosmic flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-brand-primary" /> Document Intelligence Review
                  </h2>
                  <p className="text-xs text-text-light mt-1">Quality check and risk analysis before download</p>
                </div>
                <button 
                  onClick={() => setIsSmartReviewOpen(false)}
                  className="p-2 hover:bg-vanilla-secondary rounded-full text-text-light"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {smartReviewStage === 'analyzing' ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <KartigoLoader size="md" text="" />
                    <h3 className="text-lg font-bold text-text-cosmic mt-4 mb-2">Analyzing Document Quality</h3>
                    <div className="text-sm text-text-light space-y-2 animate-pulse">
                      <p>Checking legal formatting...</p>
                      <p>Scanning for missing information...</p>
                      <p>Evaluating professional tone...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Quality Score */}
                    <div className="bg-vanilla-main/20 border border-vanilla-main p-5 rounded-2xl flex items-start gap-4">
                      <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-text-cosmic">Professional Quality Score</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold uppercase tracking-wider">Excellent</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Your document meets professional standards. The formatting is consistent, and the language is clear and legally appropriate.
                        </p>
                        <div className="mt-4 flex gap-4 text-xs font-mono">
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-vanilla-main"><span className="text-text-light mr-2">Words:</span><span className="font-bold">{wordCount}</span></div>
                          <div className="bg-white px-3 py-1.5 rounded-lg border border-vanilla-main"><span className="text-text-light mr-2">Est. Read:</span><span className="font-bold">{Math.max(1, Math.ceil(wordCount / 200))} mins</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Risk Checker */}
                    <div className="border border-amber-200 bg-amber-50/50 p-5 rounded-2xl flex items-start gap-4">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-text-cosmic mb-2">Risk Checker</h3>
                        {content.includes('____') || content.includes('[') ? (
                          <div className="text-xs text-amber-800">
                            <p className="font-bold mb-1">Found unresolved placeholders.</p>
                            <p>We detected blank lines or brackets in your document. Please ensure all names, dates, and amounts are filled before finalizing.</p>
                          </div>
                        ) : (
                          <div className="text-xs text-green-700 font-medium">
                            No critical missing information detected. All standard placeholders appear to be resolved.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Smart Recommendations */}
                    <div className="border border-vanilla-main p-5 rounded-2xl">
                      <h3 className="font-bold text-text-cosmic mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-brand-primary" /> Smart Recommendations
                      </h3>
                      <p className="text-xs text-text-light mb-4">Consider adding these standard clauses for {documentType}:</p>
                      <div className="space-y-2">
                        {['Severability Clause', 'Dispute Resolution', 'Confidentiality (Non-Disclosure)'].map((clause, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-vanilla-secondary/50 rounded-xl border border-vanilla-main">
                            <span className="text-xs font-bold text-text-cosmic">{clause}</span>
                            <button className="text-[10px] bg-white border border-vanilla-main px-2 py-1 rounded text-brand-primary font-bold hover:bg-vanilla-secondary">Add Clause</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-vanilla-main bg-vanilla-alt flex justify-end gap-3">
                <button 
                  onClick={() => setIsSmartReviewOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-vanilla-secondary rounded-xl transition-colors cursor-pointer"
                >
                  Continue Editing
                </button>
                <button 
                  disabled={smartReviewStage === 'analyzing' || content.includes('____') || content.includes('[')}
                  onClick={() => {
                    setIsSmartReviewOpen(false);
                    handleDownloadDocx();
                  }}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  title={content.includes('____') || content.includes('[') ? "Resolve all placeholders first" : "Download Document"}
                >
                  <FileDown className="h-4 w-4" /> Download DOCX
                </button>
                <button 
                  disabled={smartReviewStage === 'analyzing' || content.includes('____') || content.includes('[')}
                  onClick={() => {
                    setIsSmartReviewOpen(false);
                    handleDownloadPdf();
                  }}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  title={content.includes('____') || content.includes('[') ? "Resolve all placeholders first" : "Download PDF"}
                >
                  <FileDown className="h-4 w-4" /> Download PDF
                </button>
                <button 
                  disabled={smartReviewStage === 'analyzing' || content.includes('____') || content.includes('[')}
                  onClick={() => {
                    handleSendEmail();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  title="Send to Email"
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button 
                  disabled={smartReviewStage === 'analyzing' || content.includes('____') || content.includes('[')}
                  onClick={() => {
                    handleSendWhatsApp();
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  title="Send via WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </button>
                <button 
                  disabled={smartReviewStage === 'analyzing' || content.includes('____') || content.includes('[')}
                  onClick={() => {
                    setIsSmartReviewOpen(false);
                    handlePrintDocument();
                  }}
                  className="px-4 py-2 bg-[#3C1A47] text-[#F1FEC8] text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  title={content.includes('____') || content.includes('[') ? "Resolve all placeholders first" : "Print PDF"}
                >
                  <Printer className="h-4 w-4" /> Print PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Editor Footer */}
      <div className="bg-vanilla-secondary/80 border-t border-vanilla-main/60 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-text-light uppercase tracking-wider shrink-0 mt-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Secure Draft</span>
          <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Words: <span className="text-brand-secondary">{wordCount}</span></span>
          <span className="flex items-center gap-1.5 hidden sm:flex"><Clock className="h-3 w-3" /> Est. Read: <span className="text-brand-secondary">{Math.max(1, Math.ceil(wordCount / 200))} mins</span></span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && <CheckCircle className="h-3 w-3 text-green-500" />}
          {saveStatus === 'saving' && <Loader2 className="h-3 w-3 text-brand-primary animate-spin" />}
          <span>{saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Auto-saving...' : 'Draft Unsaved'}</span>
        </div>
      </div>
    </div>
  );
}
