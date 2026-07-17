import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Download, Upload, CheckCircle2, 
  AlertCircle, Database, Bot, Save, Copy, ArrowUp, ArrowDown, HelpCircle, 
  Layers, Settings, Globe, FileText, LayoutGrid, Tag, Check, X, Shuffle, 
  History, Sparkles, BookOpen, TrendingUp, Coins, FileCheck, RefreshCw, FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { categories as staticCategories, documents as staticDocuments } from '../../data/landingData';

// Dynamic structures
interface QuestionStep {
  id: string;
  label: string;
  questionText: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'currency' | 'address' | 'percentage';
  options?: string[];
  required?: boolean;
  helpText?: string;
  condition?: {
    fieldId: string;
    value: string;
  };
}

interface DBDocument {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  tier: 'Basic' | 'Premium' | 'Enterprise';
  price: number;
  description: string;
  whyUseIt: string;
  requiredInfo: string[];
  draftOutline: string[];
  icon: string;
  banner: string;
  status: 'Available' | 'Coming Soon' | 'Hidden' | 'Archived' | 'Draft';
  isFeatured: boolean;
  isPopular: boolean;
  isComingSoon: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  relatedDocumentIds: string[];
  aiInstructions?: string;
  knowledgeBase?: string;
  updatedAt?: any;
  createdAt?: any;
}

interface DBCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'Available' | 'Coming Soon' | 'Hidden';
}

interface DBClause {
  id: string;
  title: string;
  category: string;
  body: string;
  conditions?: string;
  required: boolean;
  priority: number;
  status: 'Active' | 'Draft' | 'Archived';
}

interface DBTaxonomy {
  id: string;
  type: 'state' | 'industry' | 'tag' | 'country';
  value: string;
}

interface KnowledgeEngineManagerProps {
  viewMode: 'documents' | 'taxonomies' | 'rules' | 'versions' | 'bulk' | 'analytics' | 'quality_rules' | 'clause_manager' | 'review_checklists' | 'validation_reports';
}

export default function KnowledgeEngineManager({ viewMode }: KnowledgeEngineManagerProps) {
  const { profile: currentAdminProfile } = useAuth();
  
  // Real Firestore States
  const [dbDocuments, setDbDocuments] = useState<DBDocument[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [dbClauses, setDbClauses] = useState<DBClause[]>([]);
  const [dbTaxonomies, setDbTaxonomies] = useState<DBTaxonomy[]>([]);
  const [dbVersions, setDbVersions] = useState<any[]>([]);
  const [documentQuestions, setDocumentQuestions] = useState<Record<string, QuestionStep[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Editors States
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<DBDocument> | null>(null);
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<DBCategory> | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'documents' | 'categories'>('documents');
  
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<Partial<DBClause> | null>(null);
  
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [newTaxType, setNewTaxType] = useState<'state' | 'industry' | 'tag' | 'country'>('state');
  const [newTaxValue, setNewTaxValue] = useState('');
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeQuestionDoc, setActiveQuestionDoc] = useState<DBDocument | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionStep> | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Status banners
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: Log Admin action
  const logAdminAction = async (action: string, category: string, prevValue: any, newValue: any) => {
    try {
      const logRef = doc(collection(db, 'audit_logs'));
      await setDoc(logRef, {
        id: logRef.id,
        adminUid: currentAdminProfile?.uid || auth.currentUser?.uid || 'system',
        adminEmail: currentAdminProfile?.email || auth.currentUser?.email || 'admin@kartigo.online',
        adminName: currentAdminProfile?.firstName || 'System Administrator',
        action,
        category,
        timestamp: serverTimestamp(),
        previousValue: JSON.stringify(prevValue),
        newValue: JSON.stringify(newValue)
      });
    } catch (e) {
      console.error("Error logging admin action: ", e);
    }
  };

  // Helper: Log version update
  const logVersionUpdate = async (docId: string, docTitle: string, changeDescription: string, previousDetails: any, newDetails: any) => {
    try {
      const verRef = doc(collection(db, 'versions'));
      await setDoc(verRef, {
        id: verRef.id,
        docId,
        docTitle,
        version: `v${(Math.random() * 2 + 1).toFixed(1)}`,
        changeDescription,
        status: 'Published',
        author: currentAdminProfile?.firstName || 'System Administrator',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: serverTimestamp(),
        previousDetails,
        newDetails
      });
    } catch (e) {
      console.error("Error logging version: ", e);
    }
  };

  // Real-time listeners setup
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to Documents
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
      const docsList: DBDocument[] = [];
      snap.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() } as DBDocument);
      });
      
      // If Firestore database is empty, seed with initial static documents for a great start!
      if (snap.empty && docsList.length === 0) {
        seedInitialData();
      } else {
        setDbDocuments(docsList);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore Docs subscribe error", err);
      setLoading(false);
    });

    // Subscribe to Categories
    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      const catsList: DBCategory[] = [];
      snap.forEach((doc) => {
        catsList.push({ id: doc.id, ...doc.data() } as DBCategory);
      });
      if (!snap.empty) {
        setDbCategories(catsList);
      } else {
        // Fallback to static initial categories if DB is pristine
        setDbCategories(staticCategories.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          icon: c.icon,
          status: 'Available'
        })));
      }
    });

    // Subscribe to Clauses
    const unsubClauses = onSnapshot(collection(db, 'clauses'), (snap) => {
      const clausesList: DBClause[] = [];
      snap.forEach((doc) => {
        clausesList.push({ id: doc.id, ...doc.data() } as DBClause);
      });
      setDbClauses(clausesList);
    });

    // Subscribe to Taxonomies
    const unsubTax = onSnapshot(collection(db, 'taxonomies'), (snap) => {
      const taxList: DBTaxonomy[] = [];
      snap.forEach((doc) => {
        taxList.push({ id: doc.id, ...doc.data() } as DBTaxonomy);
      });
      setDbTaxonomies(taxList);
    });

    // Subscribe to Versions
    const unsubVer = onSnapshot(query(collection(db, 'versions'), orderBy('timestamp', 'desc')), (snap) => {
      const verList: any[] = [];
      snap.forEach((doc) => {
        verList.push({ id: doc.id, ...doc.data() });
      });
      setDbVersions(verList);
    });

    // Subscribe to Question steps mapped by Doc ID
    const unsubQuestions = onSnapshot(collection(db, 'questions'), (snap) => {
      const qMap: Record<string, QuestionStep[]> = {};
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.docId && data.steps) {
          qMap[data.docId] = data.steps;
        }
      });
      setDocumentQuestions(qMap);
    });

    return () => {
      unsubDocs();
      unsubCats();
      unsubClauses();
      unsubTax();
      unsubVer();
      unsubQuestions();
    };
  }, []);

  // Seed standard data to Firestore so database isn't pristine
  const seedInitialData = async () => {
    try {
      showNotification("Initializing database with enterprise templates...", "info");
      // Seed Categories
      for (const cat of staticCategories) {
        await setDoc(doc(db, 'categories', cat.id), {
          id: cat.id,
          title: cat.title,
          description: cat.description,
          icon: cat.icon,
          status: 'Available'
        });
      }
      
      // Seed Documents
      for (const stdDoc of staticDocuments) {
        await setDoc(doc(db, 'documents', stdDoc.id), {
          id: stdDoc.id,
          title: stdDoc.title,
          slug: stdDoc.id,
          category: stdDoc.category,
          subCategory: 'General',
          tier: 'Premium',
          price: 499, // INR
          description: stdDoc.description,
          whyUseIt: stdDoc.whyUseIt || '',
          requiredInfo: stdDoc.requiredInfo || [],
          draftOutline: stdDoc.draftOutline || [],
          icon: 'FileText',
          banner: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
          status: 'Available',
          isFeatured: stdDoc.popularity && stdDoc.popularity > 90 ? true : false,
          isPopular: stdDoc.popularity && stdDoc.popularity > 85 ? true : false,
          isComingSoon: false,
          seoTitle: `Draft ${stdDoc.title} Online - Kartigo Draft`,
          seoDescription: `Create and download professional, legally validated ${stdDoc.title} template tailored for Indian jurisdictions instantly.`,
          seoKeywords: `draft, template, ${stdDoc.title}, legal agreement, india, form`,
          relatedDocumentIds: stdDoc.relatedDocumentIds || []
        });
      }

      // Seed standard clauses for demonstrative purposes
      const standardClauses: DBClause[] = [
        { id: 'cls_severability', title: 'Severability Clause', category: 'Legal', body: 'If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.', required: true, priority: 1, status: 'Active' },
        { id: 'cls_governing', title: 'Governing Law (India)', category: 'Legal', body: 'This Agreement shall be governed by, interpreted and construed in accordance with the laws of India, and the courts of Karnataka shall have exclusive jurisdiction over any disputes arising hereunder.', required: true, priority: 2, status: 'Active' },
        { id: 'cls_confidentiality', title: 'Confidentiality Protection', category: 'NDA', body: 'The Receiving Party agrees to maintain the strict confidentiality of all Proprietary Information disclosed by the Disclosing Party and shall not disclose it to any third parties without prior written assent.', required: false, priority: 3, status: 'Active' }
      ];

      for (const cl of standardClauses) {
        await setDoc(doc(db, 'clauses', cl.id), cl);
      }

      // Seed taxonomies
      const taxData = [
        { id: 'tax_kar', type: 'state', value: 'Karnataka' },
        { id: 'tax_mah', type: 'state', value: 'Maharashtra' },
        { id: 'tax_del', type: 'state', value: 'Delhi' },
        { id: 'tax_it', type: 'industry', value: 'Information Technology' },
        { id: 'tax_re', type: 'industry', value: 'Real Estate' },
        { id: 'tax_tag_new', type: 'tag', value: 'Highly Popular' }
      ];

      for (const tx of taxData) {
        await setDoc(doc(db, 'taxonomies', tx.id), tx);
      }

      showNotification("Database successfully initialized with standard legal schemas!", "success");
    } catch (err) {
      console.error("Failed to seed initial database", err);
      showNotification("Failed to boot Firestore template schemas.", "error");
    }
  };

  // CREATE OR EDIT DOCUMENT
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc?.title || !editingDoc?.slug) {
      showNotification("Document Title and Slug are required.", "error");
      return;
    }

    const docId = editingDoc.id || `doc_${Date.now()}`;
    const isNew = !editingDoc.id;

    const finalDoc: DBDocument = {
      id: docId,
      title: editingDoc.title,
      slug: editingDoc.slug.toLowerCase().replace(/\s+/g, '-'),
      category: editingDoc.category || 'legal',
      subCategory: editingDoc.subCategory || 'General',
      tier: editingDoc.tier || 'Premium',
      price: Number(editingDoc.price) || 499,
      description: editingDoc.description || '',
      whyUseIt: editingDoc.whyUseIt || '',
      requiredInfo: editingDoc.requiredInfo || [],
      draftOutline: editingDoc.draftOutline || [],
      icon: editingDoc.icon || 'FileText',
      banner: editingDoc.banner || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      status: editingDoc.status || 'Draft',
      isFeatured: !!editingDoc.isFeatured,
      isPopular: !!editingDoc.isPopular,
      isComingSoon: !!editingDoc.isComingSoon,
      seoTitle: editingDoc.seoTitle || `Draft ${editingDoc.title} Online`,
      seoDescription: editingDoc.seoDescription || `Create and download professional ${editingDoc.title} tailored instantly.`,
      seoKeywords: editingDoc.seoKeywords || 'draft, template, legal',
      relatedDocumentIds: editingDoc.relatedDocumentIds || [],
      aiInstructions: editingDoc.aiInstructions || '',
      knowledgeBase: editingDoc.knowledgeBase || '',
      updatedAt: new Date(),
      createdAt: editingDoc.createdAt || new Date()
    };

    try {
      await setDoc(doc(db, 'documents', docId), finalDoc);
      
      await logAdminAction(
        isNew ? `Created Document Template "${finalDoc.title}"` : `Modified Document Template "${finalDoc.title}"`,
        'Knowledge Engine',
        isNew ? {} : dbDocuments.find(d => d.id === docId) || {},
        finalDoc
      );

      await logVersionUpdate(
        docId,
        finalDoc.title,
        isNew ? 'Initial release' : 'Updated structural metadata & pricing',
        isNew ? {} : dbDocuments.find(d => d.id === docId) || {},
        finalDoc
      );

      showNotification(`Document "${finalDoc.title}" successfully saved!`, "success");
      setIsDocModalOpen(false);
      setEditingDoc(null);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save document record.", "error");
    }
  };

  // CLONE DOCUMENT
  const handleCloneDocument = async (docObj: DBDocument) => {
    const newId = `doc_${Date.now()}`;
    const cloned: DBDocument = {
      ...docObj,
      id: newId,
      title: `${docObj.title} (Clone)`,
      slug: `${docObj.slug}-clone`,
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await setDoc(doc(db, 'documents', newId), cloned);
      
      // Also clone its questions if any exist
      const existingQuestions = documentQuestions[docObj.id];
      if (existingQuestions) {
        await setDoc(doc(db, 'questions', `q_${newId}`), {
          id: `q_${newId}`,
          docId: newId,
          steps: existingQuestions
        });
      }

      await logAdminAction(
        `Cloned Document Template "${docObj.title}"`,
        'Knowledge Engine',
        { originalId: docObj.id },
        cloned
      );

      showNotification(`Cloned "${docObj.title}" successfully into a new draft!`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Cloning failed.", "error");
    }
  };

  // ARCHIVE DOCUMENT
  const handleToggleArchiveDocument = async (docObj: DBDocument) => {
    const nextStatus = docObj.status === 'Archived' ? 'Draft' : 'Archived';
    try {
      await updateDoc(doc(db, 'documents', docObj.id), { status: nextStatus, updatedAt: new Date() });
      await logAdminAction(
        `${nextStatus === 'Archived' ? 'Archived' : 'Restored'} Document Template "${docObj.title}"`,
        'Knowledge Engine',
        { status: docObj.status },
        { status: nextStatus }
      );
      showNotification(`Document ${nextStatus === 'Archived' ? 'archived' : 'restored'} successfully.`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to change document status.", "error");
    }
  };

  // DELETE DOCUMENT Permanently
  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    if (!window.confirm(`Are you absolutely sure you want to PERMANENTLY delete "${docTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'documents', docId));
      await deleteDoc(doc(db, 'questions', `q_${docId}`));
      
      await logAdminAction(
        `Permanently Deleted Document "${docTitle}"`,
        'Knowledge Engine',
        { docId, title: docTitle },
        {}
      );
      showNotification(`"${docTitle}" has been permanently purged.`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete document.", "error");
    }
  };

  // CATEGORIES MANAGEMENT
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.id || !editingCat?.title) {
      showNotification("Category ID and Title are required.", "error");
      return;
    }

    const catId = editingCat.id.toLowerCase().replace(/\s+/g, '-');
    const isNew = !dbCategories.some(c => c.id === catId);

    const finalCat: DBCategory = {
      id: catId,
      title: editingCat.title,
      description: editingCat.description || '',
      icon: editingCat.icon || 'FileText',
      status: editingCat.status || 'Available'
    };

    try {
      await setDoc(doc(db, 'categories', catId), finalCat);
      await logAdminAction(
        isNew ? `Created Category "${finalCat.title}"` : `Modified Category "${finalCat.title}"`,
        'Taxonomies',
        isNew ? {} : dbCategories.find(c => c.id === catId) || {},
        finalCat
      );
      showNotification(`Category "${finalCat.title}" saved.`, "success");
      setIsCatModalOpen(false);
      setEditingCat(null);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save category.", "error");
    }
  };

  const handleDeleteCategory = async (catId: string, title: string) => {
    if (dbDocuments.some(d => d.category === catId)) {
      showNotification(`Cannot delete category "${title}" because there are active documents mapped to it.`, "error");
      return;
    }

    if (!window.confirm(`Delete category "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, 'categories', catId));
      await logAdminAction(`Deleted Category "${title}"`, 'Taxonomies', { id: catId }, {});
      showNotification(`Category "${title}" deleted.`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Deletion failed.", "error");
    }
  };

  // CLAUSES MANAGEMENT
  const handleSaveClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClause?.title || !editingClause?.body) {
      showNotification("Clause Title and Body are required.", "error");
      return;
    }

    const clauseId = editingClause.id || `cls_${Date.now()}`;
    const isNew = !editingClause.id;

    const finalClause: DBClause = {
      id: clauseId,
      title: editingClause.title,
      category: editingClause.category || 'General',
      body: editingClause.body,
      conditions: editingClause.conditions || '',
      required: !!editingClause.required,
      priority: Number(editingClause.priority) || 1,
      status: editingClause.status || 'Active'
    };

    try {
      await setDoc(doc(db, 'clauses', clauseId), finalClause);
      await logAdminAction(
        isNew ? `Created Smart Clause "${finalClause.title}"` : `Modified Smart Clause "${finalClause.title}"`,
        'Document Intelligence',
        isNew ? {} : dbClauses.find(c => c.id === clauseId) || {},
        finalClause
      );
      showNotification(`Smart Clause "${finalClause.title}" saved.`, "success");
      setIsClauseModalOpen(false);
      setEditingClause(null);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save clause.", "error");
    }
  };

  const handleDeleteClause = async (clauseId: string, title: string) => {
    if (!window.confirm(`Delete clause "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'clauses', clauseId));
      await logAdminAction(`Deleted Smart Clause "${title}"`, 'Document Intelligence', { id: clauseId }, {});
      showNotification(`Clause "${title}" removed.`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete clause.", "error");
    }
  };

  // TAXONOMIES (Regions, Tags, etc.)
  const handleSaveTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxValue.trim()) return;

    const id = `tax_${Date.now()}`;
    const finalTax: DBTaxonomy = {
      id,
      type: newTaxType,
      value: newTaxValue.trim()
    };

    try {
      await setDoc(doc(db, 'taxonomies', id), finalTax);
      await logAdminAction(`Added Taxonomy Option [${newTaxType.toUpperCase()}] "${finalTax.value}"`, 'Taxonomies', {}, finalTax);
      showNotification(`Added ${newTaxType}: "${finalTax.value}"`, "success");
      setNewTaxValue('');
      setIsTaxModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save taxonomy option.", "error");
    }
  };

  const handleDeleteTaxonomy = async (taxId: string, val: string) => {
    try {
      await deleteDoc(doc(db, 'taxonomies', taxId));
      await logAdminAction(`Removed Taxonomy Option "${val}"`, 'Taxonomies', { id: taxId }, {});
      showNotification(`Removed "${val}"`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete taxonomy.", "error");
    }
  };

  // VISUAL QUESTION BUILDER (WIZARD CONFIG)
  const openQuestionBuilder = (docObj: DBDocument) => {
    setActiveQuestionDoc(docObj);
    const existing = documentQuestions[docObj.id] || [];
    // If empty in Firestore, load standard static questions for this doc type so the admin doesn't start from scratch
    if (existing.length === 0) {
      const fallbackQuestions = loadHardcodedQuestionsForDocType(docObj.id);
      setEditingQuestionIndex(null);
      setIsQuestionModalOpen(true);
    } else {
      setIsQuestionModalOpen(true);
    }
  };

  const loadHardcodedQuestionsForDocType = (docId: string): QuestionStep[] => {
    // Basic preloaded questionnaire maps
    const PRELOADED: Record<string, QuestionStep[]> = {
      'appointment-letter': [
        { id: 'state', label: 'State/Region', questionText: 'Which state applies to this employment?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
        { id: 'companyName', label: 'Company Name', questionText: 'What is the registered name of your company?', placeholder: 'e.g. InnoTech Solutions Ltd.', type: 'text', required: true },
        { id: 'employeeName', label: 'Employee Name', questionText: 'What is the full legal name of the employee?', placeholder: 'e.g. Alex Mercer', type: 'text', required: true },
        { id: 'jobTitle', label: 'Job Title', questionText: 'What job title will they hold?', placeholder: 'e.g. Senior Software Engineer', type: 'text', required: true },
        { id: 'salary', label: 'Annual Gross Salary', questionText: 'What is the CTC or annual package?', placeholder: 'e.g. ₹18,00,000', type: 'currency', required: true },
        { id: 'joiningDate', label: 'Joining Date', questionText: 'What is the official joining date?', placeholder: 'DD/MM/YYYY', type: 'date', required: true }
      ],
      'nda': [
        { id: 'state', label: 'State/Region', questionText: 'Which state applies to this non-disclosure agreement?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
        { id: 'disclosingParty', label: 'Disclosing Party', questionText: 'What is the full legal name of the Disclosing Party?', placeholder: 'e.g. Stellar Labs Inc.', type: 'text', required: true },
        { id: 'receivingParty', label: 'Receiving Party', questionText: 'What is the full name of the Receiving Party?', placeholder: 'e.g. Apex LLC', type: 'text', required: true },
        { id: 'confidentialityTerm', label: 'Confidentiality Term', questionText: 'Duration of confidentiality obligations?', placeholder: 'e.g. 3 Years', type: 'text', required: true }
      ],
      'rental-agreement': [
        { id: 'state', label: 'State/Region', questionText: 'Which state applies to this rental agreement?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
        { id: 'landlordName', label: 'Landlord Name', questionText: 'What is the landlord’s full legal name?', placeholder: 'e.g. David Peterson', type: 'text', required: true },
        { id: 'tenantName', label: 'Tenant Name', questionText: 'What is the tenant’s full legal name?', placeholder: 'e.g. Sophia Ramirez', type: 'text', required: true },
        { id: 'propertyAddress', label: 'Property Address', questionText: 'What is the complete physical address of the property?', placeholder: 'e.g. Flat 402, Sunshine Heights, Bengaluru', type: 'address', required: true },
        { id: 'monthlyRent', label: 'Monthly Rent', questionText: 'What is the monthly rent amount?', placeholder: 'e.g. 30000', type: 'currency', required: true },
        { id: 'securityDeposit', label: 'Security Deposit', questionText: 'What is the security deposit amount?', placeholder: 'e.g. 150000', type: 'currency', required: true },
        { id: 'leaseTerm', label: 'Lease Term', questionText: 'What is the lease duration? (Months)', placeholder: 'e.g. 11', type: 'number', required: true }
      ]
    };
    return PRELOADED[docId] || [
      { id: 'state', label: 'State/Region', questionText: 'Which state or region applies?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
      { id: 'partyA', label: 'First Party Name', questionText: 'What is the full legal name of the first party?', placeholder: 'e.g. John Doe', type: 'text', required: true },
      { id: 'partyB', label: 'Second Party Name', questionText: 'What is the full legal name of the second party?', placeholder: 'e.g. Jane Smith', type: 'text' }
    ];
  };

  const handleSaveQuestionFlow = async () => {
    if (!activeQuestionDoc) return;
    
    const steps = documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id);

    try {
      const qRef = doc(db, 'questions', `q_${activeQuestionDoc.id}`);
      await setDoc(qRef, {
        id: `q_${activeQuestionDoc.id}`,
        docId: activeQuestionDoc.id,
        steps: steps
      });

      await logAdminAction(
        `Updated Dynamic Wizard Questions for "${activeQuestionDoc.title}"`,
        'Knowledge Rules',
        {},
        { count: steps.length, steps }
      );

      await logVersionUpdate(
        activeQuestionDoc.id,
        activeQuestionDoc.title,
        'Configured dynamic questions & wizard branching logical rule matrix',
        {},
        steps
      );

      showNotification(`Wizard questions configured for "${activeQuestionDoc.title}"!`, "success");
      setIsQuestionModalOpen(false);
      setActiveQuestionDoc(null);
    } catch (err) {
      console.error(err);
      showNotification("Failed to save question list.", "error");
    }
  };

  const handleAddQuestionStep = () => {
    if (!activeQuestionDoc) return;
    const currentSteps = [...(documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id))];
    
    const newStep: QuestionStep = {
      id: `field_${Date.now().toString(36)}`,
      label: 'New Field Label',
      questionText: 'What is the value of this field?',
      placeholder: 'e.g. Enter response',
      type: 'text',
      required: true
    };

    const updated = [...currentSteps, newStep];
    setDocumentQuestions(prev => ({ ...prev, [activeQuestionDoc.id]: updated }));
  };

  const handleRemoveQuestionStep = (index: number) => {
    if (!activeQuestionDoc) return;
    const currentSteps = [...(documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id))];
    currentSteps.splice(index, 1);
    setDocumentQuestions(prev => ({ ...prev, [activeQuestionDoc.id]: currentSteps }));
  };

  const handleMoveQuestionStep = (index: number, direction: 'up' | 'down') => {
    if (!activeQuestionDoc) return;
    const currentSteps = [...(documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id))];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentSteps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = currentSteps[index];
    currentSteps[index] = currentSteps[targetIndex];
    currentSteps[targetIndex] = temp;

    setDocumentQuestions(prev => ({ ...prev, [activeQuestionDoc.id]: currentSteps }));
  };

  const handleUpdateQuestionStep = (index: number, field: keyof QuestionStep, value: any) => {
    if (!activeQuestionDoc) return;
    const currentSteps = [...(documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id))];
    
    currentSteps[index] = {
      ...currentSteps[index],
      [field]: value
    };

    setDocumentQuestions(prev => ({ ...prev, [activeQuestionDoc.id]: currentSteps }));
  };

  // BULK EXPORT/IMPORT SYSTEM CONFIG
  const handleBulkExport = () => {
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      documents: dbDocuments,
      categories: dbCategories,
      clauses: dbClauses,
      questions: Object.entries(documentQuestions).map(([docId, steps]) => ({ docId, steps })),
      taxonomies: dbTaxonomies
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kartigo_knowledge_engine_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Knowledge base successfully compiled & downloaded!", "success");
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;

    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.documents || !parsed.categories) {
          showNotification("Invalid file schema. Must include documents and categories.", "error");
          return;
        }

        showNotification("Processing bulk database imports...", "info");

        // Write categories
        for (const cat of parsed.categories) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }

        // Write documents
        for (const docObj of parsed.documents) {
          await setDoc(doc(db, 'documents', docObj.id), docObj);
        }

        // Write clauses
        if (parsed.clauses) {
          for (const cl of parsed.clauses) {
            await setDoc(doc(db, 'clauses', cl.id), cl);
          }
        }

        // Write questions
        if (parsed.questions) {
          for (const q of parsed.questions) {
            await setDoc(doc(db, 'questions', `q_${q.docId}`), {
              id: `q_${q.docId}`,
              docId: q.docId,
              steps: q.steps
            });
          }
        }

        // Write taxonomies
        if (parsed.taxonomies) {
          for (const tx of parsed.taxonomies) {
            await setDoc(doc(db, 'taxonomies', tx.id), tx);
          }
        }

        await logAdminAction(
          `Bulk Imported Knowledge Base Schema`,
          'Knowledge Engine',
          {},
          { importedItemsCount: parsed.documents.length }
        );

        showNotification("Knowledge database successfully synchronized from backup file!", "success");
      } catch (err) {
        console.error("Backup recovery failed", err);
        showNotification("Failed to parse or write JSON records. Verify backup file.", "error");
      }
    };
  };

  // Render lists helper
  const filteredDocsList = dbDocuments.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Toast Notification Alert Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 font-sans text-xs font-bold max-w-sm ${
              notification.type === 'success' ? 'bg-[#2B9348]/10 border-[#2B9348] text-[#2B9348]' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
              'bg-[#3C1A47]/10 border-[#3C1A47] text-[#3C1A47]'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black font-display text-[#3C1A47] flex items-center gap-2">
            {viewMode === 'documents' && <><FileText className="h-6 w-6 text-[#2B9348]" /> Documents & Categories</>}
            {viewMode === 'taxonomies' && <><Database className="h-6 w-6 text-[#2B9348]" /> Taxonomies & Jurisdictions</>}
            {viewMode === 'rules' && <><Bot className="h-6 w-6 text-[#2B9348]" /> Dynamic Questionnaire Builder</>}
            {viewMode === 'versions' && <><History className="h-6 w-6 text-[#2B9348]" /> Change Logs & Version History</>}
            {viewMode === 'bulk' && <><Shuffle className="h-6 w-6 text-[#2B9348]" /> Enterprise Backup & Bulk Sync</>}
            {viewMode === 'analytics' && <><TrendingUp className="h-6 w-6 text-[#2B9348]" /> Library Analytics</>}
            {viewMode === 'quality_rules' && <><CheckCircle2 className="h-6 w-6 text-[#2B9348]" /> Quality Score & QA Rules</>}
            {viewMode === 'clause_manager' && <><FileCode className="h-6 w-6 text-[#2B9348]" /> Clause Library & Clause Manager</>}
            {viewMode === 'review_checklists' && <><FileCheck className="h-6 w-6 text-[#2B9348]" /> Interactive Review Checklists</>}
            {viewMode === 'validation_reports' && <><AlertCircle className="h-6 w-6 text-[#2B9348]" /> Validation Reports</>}
          </h2>
          <p className="text-xs font-medium text-[#8395A7] font-mono mt-1 uppercase tracking-wider">
            {viewMode === 'documents' && 'Establish unlimited categories and customized document parameters.'}
            {viewMode === 'taxonomies' && 'Define active Indian states, tags, and industries for dynamic validation.'}
            {viewMode === 'rules' && 'Map visual logic-driven wizard questionnaires step-by-step.'}
            {viewMode === 'versions' && 'Full audit trails of document modifications and structural revisions.'}
            {viewMode === 'bulk' && 'Export complete library JSON schemas or sync from cloud snapshots.'}
            {viewMode === 'analytics' && 'Traffic indicators, popular document drafts, and customer ratings.'}
            {viewMode === 'quality_rules' && 'Custom risk analysis keywords, and scoring metrics.'}
            {viewMode === 'clause_manager' && 'Manage conditional legal terms, IF/THEN clauses, and priorities.'}
            {viewMode === 'review_checklists' && 'Pre-download verification requirements and approval lists.'}
            {viewMode === 'validation_reports' && 'Telemetry records of quality warnings and audit parameters.'}
          </p>
        </div>
        
        {viewMode === 'documents' && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditingCat({ id: '', title: '', description: '', icon: 'FileText', status: 'Available' });
                setIsCatModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F1FEC8] border border-[#E5F5B8] hover:bg-[#E5F5B8] text-[#3C1A47] rounded-xl text-xs font-bold transition-colors"
            >
              Add Category
            </button>
            <button 
              onClick={() => {
                setEditingDoc({
                  title: '', slug: '', category: 'legal', subCategory: 'General',
                  tier: 'Premium', price: 499, description: '', whyUseIt: '',
                  requiredInfo: [], draftOutline: [], icon: 'FileText', status: 'Draft',
                  isFeatured: false, isPopular: false, isComingSoon: false,
                  seoTitle: '', seoDescription: '', seoKeywords: ''
                });
                setIsDocModalOpen(true);
              }}
              className="px-4 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Document
            </button>
          </div>
        )}

        {viewMode === 'clause_manager' && (
          <button 
            onClick={() => {
              setEditingClause({ title: '', category: 'Legal', body: '', conditions: '', required: false, priority: 1, status: 'Active' });
              setIsClauseModalOpen(true);
            }}
            className="px-4 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Smart Clause
          </button>
        )}

        {viewMode === 'taxonomies' && (
          <button 
            onClick={() => setIsTaxModalOpen(true)}
            className="px-4 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Taxonomy
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-[24px] border border-[#E5F5B8] text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 text-[#2B9348] animate-spin" />
          <p className="text-xs font-mono font-bold text-[#3C1A47]">Synchronizing with Google Cloud Firestore...</p>
        </div>
      )}

      {/* VIEW: DOCUMENTS & CATEGORIES */}
      {!loading && viewMode === 'documents' && (
        <div className="space-y-6">
          {/* Tabs for Documents and Categories Directory */}
          <div className="flex border-b border-[#E5F5B8] gap-4">
            <button 
              onClick={() => setActiveCategoryTab('documents')}
              className={`pb-3 text-sm font-bold border-b-2 px-1 transition-colors ${activeCategoryTab === 'documents' ? 'border-[#2B9348] text-[#2B9348]' : 'border-transparent text-[#8395A7]'}`}
            >
              Templates Library ({dbDocuments.length})
            </button>
            <button 
              onClick={() => setActiveCategoryTab('categories')}
              className={`pb-3 text-sm font-bold border-b-2 px-1 transition-colors ${activeCategoryTab === 'categories' ? 'border-[#2B9348] text-[#2B9348]' : 'border-transparent text-[#8395A7]'}`}
            >
              Categories Directory ({dbCategories.length})
            </button>
          </div>

          {activeCategoryTab === 'documents' ? (
            <div className="bg-white rounded-[24px] shadow-xs border border-[#E5F5B8] overflow-hidden">
              <div className="p-4 border-b border-[#E5F5B8] flex justify-between items-center bg-[#F1FEC8]/30">
                <div className="relative w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates (e.g. rent, NDA)..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5F5B8] text-xs font-bold focus:ring-[#2B9348] focus:border-[#2B9348]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1FEC8]/50 text-[#3C1A47] font-bold uppercase tracking-wider text-[10px] font-mono border-b border-[#E5F5B8]">
                    <tr>
                      <th className="px-6 py-4">Title & Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Tier & Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5F5B8]">
                    {filteredDocsList.map((docObj) => (
                      <tr key={docObj.id} className="hover:bg-[#F1FEC8]/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#3C1A47] text-sm">{docObj.title}</div>
                          <div className="text-xs text-[#8395A7] max-w-sm mt-0.5 truncate">{docObj.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-[#F1FEC8] text-[#3C1A47] text-[10px] font-bold rounded-lg uppercase tracking-wide border border-[#E5F5B8]">
                            {docObj.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            docObj.status === 'Available' ? 'bg-[#2B9348]/10 text-[#2B9348]' :
                            docObj.status === 'Coming Soon' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {docObj.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#3C1A47]">
                          <div className="text-xs">{docObj.tier}</div>
                          <div className="text-xs text-[#2B9348] font-mono">₹{docObj.price} INR</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingDoc(docObj);
                                setIsDocModalOpen(true);
                              }}
                              className="p-2 border border-[#E5F5B8] hover:bg-[#F1FEC8] text-[#3C1A47] rounded-xl transition-colors"
                              title="Edit metadata"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleCloneDocument(docObj)}
                              className="p-2 border border-[#E5F5B8] hover:bg-[#F1FEC8] text-[#3C1A47] rounded-xl transition-colors"
                              title="Clone Template"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleToggleArchiveDocument(docObj)}
                              className={`p-2 border border-[#E5F5B8] hover:bg-[#F1FEC8] rounded-xl transition-colors ${docObj.status === 'Archived' ? 'text-[#2B9348]' : 'text-[#8395A7]'}`}
                              title={docObj.status === 'Archived' ? 'Restore template' : 'Archive template'}
                            >
                              <Layers className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDocument(docObj.id, docObj.title)}
                              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] shadow-xs border border-[#E5F5B8] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1FEC8]/50 text-[#3C1A47] font-bold uppercase tracking-wider text-[10px] font-mono border-b border-[#E5F5B8]">
                    <tr>
                      <th className="px-6 py-4">ID / Category</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5F5B8]">
                    {dbCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#F1FEC8]/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-[#3C1A47] font-bold">{cat.id}</td>
                        <td className="px-6 py-4 font-bold text-[#3C1A47]">{cat.title}</td>
                        <td className="px-6 py-4 text-xs text-[#8395A7] max-w-sm truncate">{cat.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            cat.status === 'Available' ? 'bg-[#2B9348]/10 text-[#2B9348]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingCat(cat);
                                setIsCatModalOpen(true);
                              }}
                              className="p-2 border border-[#E5F5B8] hover:bg-[#F1FEC8] text-[#3C1A47] rounded-xl transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id, cat.title)}
                              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: QUESTIONNAIRE BUILDER */}
      {!loading && viewMode === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold text-[#8395A7] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2B9348]" /> Select Document Template
              </h3>
              <div className="space-y-1 max-h-[450px] overflow-y-auto custom-scrollbar">
                {dbDocuments.map(docObj => {
                  const qCount = (documentQuestions[docObj.id] || loadHardcodedQuestionsForDocType(docObj.id)).length;
                  return (
                    <button 
                      key={docObj.id} 
                      onClick={() => openQuestionBuilder(docObj)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        activeQuestionDoc?.id === docObj.id 
                          ? 'bg-[#2B9348]/10 border-[#2B9348] text-[#2B9348]' 
                          : 'border-[#E5F5B8] hover:border-[#2B9348]/50 hover:bg-[#F1FEC8]/30 text-[#3C1A47]'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-bold font-sans">{docObj.title}</span>
                        <span className="block text-[10px] text-[#8395A7] font-mono mt-0.5 uppercase">{docObj.category}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#F1FEC8] border border-[#E5F5B8] px-2 py-0.5 rounded-lg text-[#3C1A47]">
                        {qCount} steps
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeQuestionDoc ? (
              <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-6 shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-[#E5F5B8] pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#3C1A47]">{activeQuestionDoc.title}</h3>
                    <p className="text-xs text-[#8395A7]">Customize the step-by-step wizard rules and fields sequence.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddQuestionStep}
                      className="px-3 py-1.5 bg-[#F1FEC8] border border-[#E5F5B8] text-[#3C1A47] hover:bg-[#E5F5B8] text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Step
                    </button>
                    <button 
                      onClick={handleSaveQuestionFlow}
                      className="px-4 py-1.5 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Flow
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {(documentQuestions[activeQuestionDoc.id] || loadHardcodedQuestionsForDocType(activeQuestionDoc.id)).map((q, idx) => (
                    <div key={q.id || idx} className="p-4 border border-[#E5F5B8] rounded-2xl bg-[#F1FEC8]/10 space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-[#3C1A47] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#3C1A47]">Step: {q.id}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleMoveQuestionStep(idx, 'up')} className="p-1 hover:bg-[#F1FEC8] text-[#8395A7] rounded-md transition-colors"><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleMoveQuestionStep(idx, 'down')} className="p-1 hover:bg-[#F1FEC8] text-[#8395A7] rounded-md transition-colors"><ArrowDown className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleRemoveQuestionStep(idx)} className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Field Label / Step Title</label>
                          <input 
                            type="text" 
                            value={q.label}
                            onChange={(e) => handleUpdateQuestionStep(idx, 'label', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] focus:ring-[#2B9348]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Response Input Type</label>
                          <select 
                            value={q.type}
                            onChange={(e) => handleUpdateQuestionStep(idx, 'type', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] focus:ring-[#2B9348]"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text / Textarea</option>
                            <option value="currency">Currency (₹ INR Only)</option>
                            <option value="date">Date Picker (Calendar Only)</option>
                            <option value="select">Dropdown Select</option>
                            <option value="radio">Radio Options</option>
                            <option value="checkbox">Checkbox toggle</option>
                            <option value="number">Numeric Counter</option>
                            <option value="email">Email format</option>
                            <option value="phone">Phone number</option>
                            <option value="address">Address locator</option>
                            <option value="percentage">Percentage %</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Question Instruction Text</label>
                        <input 
                          type="text" 
                          value={q.questionText}
                          onChange={(e) => handleUpdateQuestionStep(idx, 'questionText', e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] focus:ring-[#2B9348]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Placeholder Context</label>
                          <input 
                            type="text" 
                            value={q.placeholder}
                            onChange={(e) => handleUpdateQuestionStep(idx, 'placeholder', e.target.value)}
                            className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                          />
                        </div>
                        <div className="flex items-center mt-5 pl-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                            <input 
                              type="checkbox" 
                              checked={!!q.required}
                              onChange={(e) => handleUpdateQuestionStep(idx, 'required', e.target.checked)}
                              className="h-4 w-4 rounded-sm accent-[#2B9348]"
                            />
                            Required Step
                          </label>
                        </div>
                      </div>

                      {/* Dropdown Options if select or radio selected */}
                      {(q.type === 'select' || q.type === 'radio') && (
                        <div>
                          <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Dropdown Choices (Comma separated)</label>
                          <input 
                            type="text" 
                            value={q.options ? q.options.join(', ') : ''}
                            onChange={(e) => handleUpdateQuestionStep(idx, 'options', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="e.g. Karnataka, Maharashtra, Delhi"
                            className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                          />
                        </div>
                      )}

                      {/* Branching logical condition */}
                      <div className="pt-2 border-t border-[#E5F5B8] flex items-center justify-between text-[11px]">
                        <span className="text-[#8395A7] font-mono font-bold flex items-center gap-1">
                          <Bot className="h-3 w-3 text-[#2B9348]" /> Conditional Branching Rule
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] text-[#8395A7]">Show only IF field</span>
                          <input 
                            type="text" 
                            placeholder="fieldId (e.g. state)"
                            value={q.condition?.fieldId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateQuestionStep(idx, 'condition', val ? { fieldId: val, value: q.condition?.value || '' } : undefined);
                            }}
                            className="w-24 px-2 py-0.5 border border-[#E5F5B8] rounded text-[10px] text-[#3C1A47]"
                          />
                          <span className="text-[10px] text-[#8395A7]">equals</span>
                          <input 
                            type="text" 
                            placeholder="value (e.g. Karnataka)"
                            value={q.condition?.value || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (q.condition?.fieldId) {
                                handleUpdateQuestionStep(idx, 'condition', { fieldId: q.condition.fieldId, value: val });
                              }
                            }}
                            className="w-28 px-2 py-0.5 border border-[#E5F5B8] rounded text-[10px] text-[#3C1A47]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-12 text-center py-20 flex flex-col items-center justify-center">
                <Bot className="h-12 w-12 text-[#2B9348]/20 mb-4" />
                <h3 className="text-lg font-bold text-[#3C1A47] mb-2">Configure Wizard Steps</h3>
                <p className="text-[#8395A7] text-xs max-w-sm">Please select a document template from the side directory list to visually modify or build its dynamic question sequence.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: TAXONOMIES */}
      {!loading && viewMode === 'taxonomies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'state', label: 'Governing States', count: dbTaxonomies.filter(t => t.type === 'state').length },
              { id: 'industry', label: 'Business Industries', count: dbTaxonomies.filter(t => t.type === 'industry').length },
              { id: 'tag', label: 'Document Tags', count: dbTaxonomies.filter(t => t.type === 'tag').length },
              { id: 'country', label: 'Permitted Jurisdictions', count: dbTaxonomies.filter(t => t.type === 'country').length }
            ].map((tax) => (
              <button 
                key={tax.id}
                onClick={() => setNewTaxType(tax.id as any)}
                className={`p-5 rounded-[24px] border text-left transition-all ${
                  newTaxType === tax.id 
                    ? 'bg-[#2B9348]/10 border-[#2B9348] text-[#2B9348]' 
                    : 'bg-white border-[#E5F5B8] hover:border-[#2B9348]/50 hover:bg-[#F1FEC8]/10 text-[#3C1A47]'
                }`}
              >
                <Database className="h-5 w-5 mb-2" />
                <div className="text-xs font-black font-sans uppercase tracking-wider">{tax.label}</div>
                <div className="text-2xl font-black font-mono mt-1">{tax.count} options</div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#3C1A47] mb-4 uppercase tracking-wider font-mono">
              Active values for: {newTaxType.toUpperCase()}
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {dbTaxonomies.filter(t => t.type === newTaxType).map((tx) => (
                <div 
                  key={tx.id}
                  className="px-3 py-1.5 bg-[#F1FEC8] border border-[#E5F5B8] text-xs font-bold text-[#3C1A47] rounded-xl flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer group"
                  onClick={() => handleDeleteTaxonomy(tx.id, tx.value)}
                  title="Click to remove taxonomy option"
                >
                  <span>{tx.value}</span>
                  <X className="h-3.5 w-3.5 text-[#8395A7] group-hover:text-red-500 transition-colors" />
                </div>
              ))}

              {dbTaxonomies.filter(t => t.type === newTaxType).length === 0 && (
                <div className="text-xs font-mono text-[#8395A7]">No options registered. Click "Add Taxonomy" to seed custom entries.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CLAUSE MANAGER */}
      {!loading && viewMode === 'clause_manager' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5F5B8] bg-[#F1FEC8]/30">
            <h3 className="font-extrabold text-sm text-[#3C1A47]">Clause Library Directory</h3>
          </div>
          <div className="divide-y divide-[#E5F5B8]">
            {dbClauses.map((clause) => (
              <div key={clause.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#F1FEC8]/10 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#3C1A47]">{clause.title}</span>
                    <span className="px-2 py-0.5 bg-[#F1FEC8] border border-[#E5F5B8] text-[9px] font-mono font-bold uppercase rounded-lg text-[#3C1A47]">
                      {clause.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#8395A7] max-w-2xl font-sans leading-relaxed">{clause.body}</p>
                  {clause.conditions && (
                    <div className="text-[10px] text-[#2B9348] font-mono font-bold uppercase">
                      Rule: {clause.conditions}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                    clause.required ? 'bg-[#2B9348]/10 text-[#2B9348]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {clause.required ? 'Required' : 'Optional'}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditingClause(clause);
                        setIsClauseModalOpen(true);
                      }}
                      className="p-1.5 border border-[#E5F5B8] hover:bg-[#F1FEC8] text-[#3C1A47] rounded-lg transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClause(clause.id, clause.title)}
                      className="p-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {dbClauses.length === 0 && (
              <div className="p-12 text-center text-xs font-mono text-[#8395A7]">No clauses registered. Add some to build dynamic legal templates.</div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: BULK BACKUP */}
      {viewMode === 'bulk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <Upload className="h-12 w-12 text-[#2B9348]" />
            <h3 className="text-lg font-black text-[#3C1A47]">Bulk Import & Recovery</h3>
            <p className="text-xs text-[#8395A7] max-w-xs leading-relaxed">
              Upload a valid JSON backup schema file to populate your entire legal document intelligence template configurations, questions matrix, states, and clause libraries instantly.
            </p>
            <label className="px-6 py-3 bg-[#2B9348] text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-[#2B9348]/90 transition-all flex items-center gap-2">
              <Upload className="h-4 w-4" /> Select Backup JSON File
              <input 
                type="file" 
                accept=".json"
                onChange={handleBulkImport}
                className="hidden" 
              />
            </label>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
            <Download className="h-12 w-12 text-[#3C1A47]" />
            <h3 className="text-lg font-black text-[#3C1A47]">Bulk Export Database</h3>
            <p className="text-xs text-[#8395A7] max-w-xs leading-relaxed">
              Download your entire Kartigo legal database (including documents, taxonomies, questionnaires, and smart clause rules) as a single portable JSON file for migrations.
            </p>
            <button 
              onClick={handleBulkExport}
              className="px-6 py-3 bg-[#3C1A47] text-white hover:bg-[#3C1A47]/90 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs"
            >
              <Download className="h-4 w-4" /> Export Complete Library
            </button>
          </div>
        </div>
      )}

      {/* VIEW: VERSION LOGS */}
      {viewMode === 'versions' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5F5B8] bg-[#F1FEC8]/30">
            <h3 className="font-extrabold text-sm text-[#3C1A47]">Template Version History Logs</h3>
          </div>
          <div className="divide-y divide-[#E5F5B8]">
            {dbVersions.map((v, i) => (
              <div key={v.id || i} className="p-5 hover:bg-[#F1FEC8]/10 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-black text-sm text-[#3C1A47]">{v.docTitle}</span>
                    <span className="ml-3 px-2 py-0.5 bg-[#2B9348]/10 text-[#2B9348] text-[10px] font-mono font-bold rounded-lg border border-[#2B9348]/20">
                      {v.version || 'v1.0'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#8395A7]">
                    Logged: {v.date || 'Today'} | By: {v.author || 'System'}
                  </div>
                </div>
                <p className="text-xs text-[#8395A7] mt-1.5 max-w-2xl">{v.changeDescription}</p>
              </div>
            ))}

            {dbVersions.length === 0 && (
              <div className="p-12 text-center text-xs font-mono text-[#8395A7]">No change logs registered yet. Make edits to generate versions.</div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: ANALYTICS */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Documents', val: dbDocuments.length, icon: FileText },
              { label: 'Active Rules Steps', val: Object.values(documentQuestions).reduce((acc, step) => acc + step.length, 0), icon: Bot },
              { label: 'Active Clauses', val: dbClauses.length, icon: FileCode },
              { label: 'Registered Taxonomy Options', val: dbTaxonomies.length, icon: Database },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-[24px] border border-[#E5F5B8] shadow-xs flex items-center gap-4">
                <div className="h-10 w-10 bg-[#F1FEC8] rounded-xl flex items-center justify-center text-[#2B9348]">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] text-[#8395A7] font-bold uppercase tracking-wider font-mono">{stat.label}</div>
                  <div className="text-2xl font-black text-[#3C1A47]">{stat.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-xs">
            <h3 className="font-extrabold text-sm text-[#3C1A47] mb-4 uppercase tracking-widest font-mono">Popular Drafting Modules</h3>
            <div className="space-y-3">
              {dbDocuments.slice(0, 5).map((docObj, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-[#E5F5B8]/50 pb-2">
                  <span className="font-bold text-[#3C1A47]">{docObj.title}</span>
                  <span className="font-mono text-[#2B9348] font-bold">₹{docObj.price} INR</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: QUALITY ENGINE */}
      {viewMode === 'quality_rules' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-8 text-center py-20 flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-[#2B9348]" />
          <h3 className="text-lg font-black text-[#3C1A47]">Quality & Risk Rules Engine</h3>
          <p className="text-xs text-[#8395A7] max-w-sm leading-relaxed">
            Real-time scanner parameters mapped to validation matrices. Scoring algorithms automatically identify potential legal omissions.
          </p>
          <div className="p-4 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl max-w-md text-left text-xs font-mono text-[#3C1A47] space-y-2">
            <div><strong>Scoring Weight Matrix:</strong></div>
            <div>• Required parameters completed: +50%</div>
            <div>• Jurisdiction matching rules: +20%</div>
            <div>• Standard boilerplates applied: +30%</div>
          </div>
        </div>
      )}

      {/* VIEW: REVIEW CHECKLISTS */}
      {viewMode === 'review_checklists' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-8 text-center py-20 flex flex-col items-center justify-center space-y-4">
          <FileCheck className="h-12 w-12 text-[#2B9348]" />
          <h3 className="text-lg font-black text-[#3C1A47]">Interactive Pre-Download Checklists</h3>
          <p className="text-xs text-[#8395A7] max-w-sm leading-relaxed">
            Interactive checklists prompted immediately before download, enforcing Indian legal standards like witness sign-offs, lease duration rules, and HRA references.
          </p>
          <div className="flex gap-2 font-mono text-[10px] text-left max-w-sm border-l-2 border-[#2B9348] pl-3 py-1 bg-[#F1FEC8]/20">
            <div>
              <strong>Rules:</strong>
              <div>1. Leases over 11 months require registration flags.</div>
              <div>2. HRA claims above 1 Lakh require landlord PAN.</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: VALIDATION REPORTS */}
      {viewMode === 'validation_reports' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] p-8 text-center py-20 flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-[#3C1A47]" />
          <h3 className="text-lg font-black text-[#3C1A47]">Legal Compliance Reports</h3>
          <p className="text-xs text-[#8395A7] max-w-sm leading-relaxed">
            Automatic telemetry reporting of warnings issued, signatures verified, and risk assessments processed during customer drafting sessions.
          </p>
        </div>
      )}

      {/* MODAL: ADD / EDIT DOCUMENT METADATA */}
      <AnimatePresence>
        {isDocModalOpen && editingDoc && (
          <div className="fixed inset-0 bg-[#3C1A47]/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveDocument}
              className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-2xl p-6 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#E5F5B8] pb-3">
                <h3 className="text-base font-black text-[#3C1A47]">
                  {editingDoc.id ? `Edit "${editingDoc.title}"` : 'Create New Document Template'}
                </h3>
                <button type="button" onClick={() => setIsDocModalOpen(false)} className="p-1 hover:bg-[#F1FEC8] rounded-lg transition-colors">
                  <X className="h-5 w-5 text-[#8395A7]" />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Document Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editingDoc.title || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">URL Slug *</label>
                  <input 
                    type="text" 
                    required
                    value={editingDoc.slug || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Category Directory *</label>
                  <select 
                    value={editingDoc.category || 'legal'}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  >
                    {dbCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Sub Category</label>
                  <input 
                    type="text" 
                    value={editingDoc.subCategory || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, subCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Access Tier</label>
                  <select 
                    value={editingDoc.tier || 'Premium'}
                    onChange={(e) => setEditingDoc({ ...editingDoc, tier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Price (₹ INR ONLY) *</label>
                  <input 
                    type="number" 
                    required
                    value={editingDoc.price || 499}
                    onChange={(e) => setEditingDoc({ ...editingDoc, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Short Description</label>
                <textarea 
                  value={editingDoc.description || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Why Use It justification</label>
                <textarea 
                  value={editingDoc.whyUseIt || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, whyUseIt: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              {/* Status Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={editingDoc.status || 'Draft'}
                    onChange={(e) => setEditingDoc({ ...editingDoc, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  >
                    <option value="Available">Available / Active</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Hidden">Hidden</option>
                    <option value="Archived">Archived</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center mt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                    <input 
                      type="checkbox" 
                      checked={!!editingDoc.isFeatured}
                      onChange={(e) => setEditingDoc({ ...editingDoc, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded-sm accent-[#2B9348]"
                    />
                    Featured
                  </label>
                </div>
                <div className="flex items-center mt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                    <input 
                      type="checkbox" 
                      checked={!!editingDoc.isPopular}
                      onChange={(e) => setEditingDoc({ ...editingDoc, isPopular: e.target.checked })}
                      className="h-4 w-4 rounded-sm accent-[#2B9348]"
                    />
                    Popular
                  </label>
                </div>
                <div className="flex items-center mt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                    <input 
                      type="checkbox" 
                      checked={!!editingDoc.isComingSoon}
                      onChange={(e) => setEditingDoc({ ...editingDoc, isComingSoon: e.target.checked })}
                      className="h-4 w-4 rounded-sm accent-[#2B9348]"
                    />
                    Coming Soon
                  </label>
                </div>
              </div>

              {/* SEO Parameters */}
              <div className="border-t border-[#E5F5B8] pt-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#3C1A47] uppercase tracking-wider">SEO Metadata (for Search Grounding)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">SEO Meta Title</label>
                    <input 
                      type="text" 
                      value={editingDoc.seoTitle || ''}
                      onChange={(e) => setEditingDoc({ ...editingDoc, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">SEO Meta Keywords</label>
                    <input 
                      type="text" 
                      value={editingDoc.seoKeywords || ''}
                      onChange={(e) => setEditingDoc({ ...editingDoc, seoKeywords: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">SEO Meta Description</label>
                  <input 
                    type="text" 
                    value={editingDoc.seoDescription || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, seoDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
              </div>

              {/* AI Prompts & Instructions Context */}
              <div className="border-t border-[#E5F5B8] pt-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#3C1A47] uppercase tracking-wider">AI Instructions & Knowledge Base (AI Assistant Engine)</h4>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Custom generation prompt templates for Gemini</label>
                  <textarea 
                    value={editingDoc.aiInstructions || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, aiInstructions: e.target.value })}
                    rows={4}
                    placeholder="Provide detailed instruction blocks for compiling this document..."
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5F5B8] pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Save className="h-4 w-4" /> Save Template
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT CATEGORY */}
      <AnimatePresence>
        {isCatModalOpen && editingCat && (
          <div className="fixed inset-0 bg-[#3C1A47]/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveCategory}
              className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-2xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#E5F5B8] pb-3">
                <h3 className="text-base font-black text-[#3C1A47]">
                  {editingCat.id ? 'Edit Category' : 'Add Custom Category'}
                </h3>
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="p-1 hover:bg-[#F1FEC8] rounded-lg transition-colors">
                  <X className="h-5 w-5 text-[#8395A7]" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Category Code / ID *</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingCat.id}
                  value={editingCat.id || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, id: e.target.value })}
                  placeholder="e.g. real_estate"
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Category Title *</label>
                <input 
                  type="text" 
                  required
                  value={editingCat.title || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, title: e.target.value })}
                  placeholder="e.g. Real Estate & Property"
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  value={editingCat.description || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, description: e.target.value })}
                  placeholder="e.g. Lease deeds, mortgage formats, and possession notices..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Lucide Icon Name</label>
                  <input 
                    type="text" 
                    value={editingCat.icon || 'FileText'}
                    onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                    placeholder="e.g. Home, Scale, Award"
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Status</label>
                  <select 
                    value={editingCat.status || 'Available'}
                    onChange={(e) => setEditingCat({ ...editingCat, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  >
                    <option value="Available">Available</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5F5B8] pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT CLAUSE */}
      <AnimatePresence>
        {isClauseModalOpen && editingClause && (
          <div className="fixed inset-0 bg-[#3C1A47]/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveClause}
              className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-2xl p-6 w-full max-w-lg space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#E5F5B8] pb-3">
                <h3 className="text-base font-black text-[#3C1A47]">
                  {editingClause.id ? 'Edit Clause Rule' : 'Create Smart Clause'}
                </h3>
                <button type="button" onClick={() => setIsClauseModalOpen(false)} className="p-1 hover:bg-[#F1FEC8] rounded-lg transition-colors">
                  <X className="h-5 w-5 text-[#8395A7]" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Clause Title *</label>
                <input 
                  type="text" 
                  required
                  value={editingClause.title || ''}
                  onChange={(e) => setEditingClause({ ...editingClause, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Category Code</label>
                  <input 
                    type="text" 
                    value={editingClause.category || 'Legal'}
                    onChange={(e) => setEditingClause({ ...editingClause, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Priority Order</label>
                  <input 
                    type="number" 
                    value={editingClause.priority || 1}
                    onChange={(e) => setEditingClause({ ...editingClause, priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Clause Template Body Text *</label>
                <textarea 
                  required
                  value={editingClause.body || ''}
                  onChange={(e) => setEditingClause({ ...editingClause, body: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Conditional logical formula (e.g. state == Karnataka)</label>
                <input 
                  type="text" 
                  value={editingClause.conditions || ''}
                  onChange={(e) => setEditingClause({ ...editingClause, conditions: e.target.value })}
                  placeholder="e.g. state == 'Karnataka'"
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47] font-mono"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                  <input 
                    type="checkbox" 
                    checked={!!editingClause.required}
                    onChange={(e) => setEditingClause({ ...editingClause, required: e.target.checked })}
                    className="h-4 w-4 rounded-sm accent-[#2B9348]"
                  />
                  Enforce as Mandatory
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C1A47]">
                  <input 
                    type="checkbox" 
                    checked={editingClause.status === 'Active'}
                    onChange={(e) => setEditingClause({ ...editingClause, status: e.target.checked ? 'Active' : 'Draft' })}
                    className="h-4 w-4 rounded-sm accent-[#2B9348]"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5F5B8] pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsClauseModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 text-xs font-bold rounded-xl"
                >
                  Save Clause
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD TAXONOMY */}
      <AnimatePresence>
        {isTaxModalOpen && (
          <div className="fixed inset-0 bg-[#3C1A47]/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSaveTaxonomy}
              className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#E5F5B8] pb-3">
                <h3 className="text-base font-black text-[#3C1A47]">Add Taxonomy Option</h3>
                <button type="button" onClick={() => setIsTaxModalOpen(false)} className="p-1 hover:bg-[#F1FEC8] rounded-lg transition-colors">
                  <X className="h-5 w-5 text-[#8395A7]" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Taxonomy Type</label>
                <select 
                  value={newTaxType}
                  onChange={(e) => setNewTaxType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                >
                  <option value="state">Governing State / UT (India)</option>
                  <option value="industry">Business Industry</option>
                  <option value="tag">Document Tag</option>
                  <option value="country">Country Jurisdiction</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-1">Option Value *</label>
                <input 
                  type="text" 
                  required
                  value={newTaxValue}
                  onChange={(e) => setNewTaxValue(e.target.value)}
                  placeholder="e.g. Telangana or FinTech"
                  className="w-full px-3 py-2 border border-[#E5F5B8] rounded-xl text-xs font-bold text-[#3C1A47]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#E5F5B8] pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTaxModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#2B9348] text-white hover:bg-[#2B9348]/90 text-xs font-bold rounded-xl"
                >
                  Add Option
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
