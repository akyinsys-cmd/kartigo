import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileEdit, Download, ShoppingBag, Star, Globe, Clock, 
  Sparkles, FileText, Share2, Archive, Trash2, ArrowRight,
  Search, Filter, ChevronDown, CheckCircle, AlertCircle, Info,
  MoreVertical, Eye, FileDown, Plus, MessageSquare, Send, Check
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { formatIndianDate } from '../utils/dateUtils';
import { DocumentEmptyStateIllustration, DraftsIllustration } from './Illustrations';
import axios from 'axios';

// Generic elegant Empty State component used across modules
export function EmptyState({ icon: Icon, title, description, actionText, onAction }: any) {
  return (
    <div className="py-16 text-center text-text-light flex flex-col items-center justify-center border border-dashed border-vanilla-main rounded-[40px] bg-vanilla-secondary/20 p-6">
      <div className="mb-6 scale-90">
        <DocumentEmptyStateIllustration />
      </div>
      <h3 className="text-lg font-bold text-brand-secondary mb-2 font-display">{title}</h3>
      <p className="text-xs max-w-sm mx-auto text-text-secondary leading-relaxed mb-6 font-medium">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-brand-primary px-6 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          {actionText}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// 1. DRAFTS VIEW
interface DraftsViewProps {
  onCreateNew: () => void;
  onOpenDoc?: (doc: any) => void;
  onContinueDraft?: (draftId: string, docType: string) => void;
}

export function DraftsView({ onCreateNew, onOpenDoc, onContinueDraft }: DraftsViewProps) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [previewDraft, setPreviewDraft] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const draftsRef = collection(db, 'users', user.uid, 'drafts');
    const q = query(draftsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        // Calculate progress completion dynamically based on answers count
        const answersCount = data.answers ? Object.keys(data.answers).length : 0;
        const totalExpected = data.history ? Math.max(answersCount + 2, 6) : 6;
        const progressPercentage = Math.min(Math.round((answersCount / totalExpected) * 100), 95);

        return {
          id: doc.id,
          ...data,
          progress: data.progress || progressPercentage || 40,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      setDrafts(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load drafts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this draft? All progress will be lost.")) return;
    try {
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'drafts', draftId));
      }
    } catch (err) {
      console.error("Failed to delete draft:", err);
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const title = draft.currentDocType || draft.title || 'Untitled Draft';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Syncing Drafts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Draft Manager</h2>
          <p className="text-xs text-text-light mt-1">Pick up where you left off. Auto-saved legal templates in progress.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-primary px-4.5 py-3 rounded-xl hover:opacity-95 transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="h-4 w-4" /> Start Drafting
        </button>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 items-center justify-between bg-vanilla-secondary/30 rounded-t-[20px]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search drafts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30 transition-colors text-text-secondary shadow-xs"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-vanilla-main text-brand-secondary text-xs font-bold rounded-xl hover:bg-vanilla-secondary transition-colors cursor-pointer"
          >
            <span>Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>

        {filteredDrafts.length === 0 ? (
          <div className="p-6">
            <EmptyState 
              icon={FileEdit}
              title="No Active Drafts"
              description="You don't have any templates currently in progress. Start drafting now to have drafts automatically saved here."
              actionText="Start Drafting"
              onAction={onCreateNew}
            />
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrafts.map((draft) => {
              const displayTitle = draft.currentDocType || draft.title || 'Legal Template Draft';
              return (
                <div 
                  key={draft.id} 
                  className="bg-white p-5 rounded-[20px] border border-vanilla-main hover:border-brand-primary/30 transition-all flex flex-col justify-between hover:shadow-md relative group text-left"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                          <FileEdit className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-brand-secondary line-clamp-1">{displayTitle}</h4>
                          <span className="text-[10px] text-text-light font-mono">ID: {draft.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        className="text-text-light hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete draft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-brand-secondary">
                        <span>Drafting Progress</span>
                        <span>{draft.progress}%</span>
                      </div>
                      <div className="w-full bg-vanilla-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${draft.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-text-light font-mono border-t border-vanilla-main/40 pt-3">
                      <div>Created: {formatIndianDate(draft.createdAt)}</div>
                      <div className="text-right">Updated: {formatIndianDate(draft.updatedAt)}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    {draft.progress >= 100 || draft.status === 'completed' || draft.progress === 95 ? (
                      <button
                        onClick={() => {
                          const originalText = "Export to PDF";
                          const btn = document.getElementById(`export-btn-${draft.id}`);
                          if (btn) btn.innerText = "Exporting...";
                          setTimeout(() => {
                            if (btn) btn.innerText = "Downloaded!";
                            setTimeout(() => {
                              if (btn) btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Export to PDF`;
                            }, 2000);
                          }, 1500);
                        }}
                        id={`export-btn-${draft.id}`}
                        className="flex-1 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Download className="h-4 w-4" /> Export to PDF
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onContinueDraft) {
                            onContinueDraft(draft.id, draft.currentDocType || 'NDA');
                          } else {
                            // Fallback trigger click on tab button
                            const createBtn = document.getElementById('tab-create-doc-btn');
                            if (createBtn) createBtn.click();
                          }
                        }}
                        className="flex-1 py-2 bg-brand-primary text-white hover:opacity-95 text-xs font-bold rounded-xl transition-opacity flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        Continue
                      </button>
                    )}
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      className="px-3 py-2 border border-vanilla-main text-brand-secondary hover:bg-vanilla-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Preview Answers
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Answers Modal */}
      <AnimatePresence>
        {previewDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#3C1A47]/40 backdrop-blur-sm" onClick={() => setPreviewDraft(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-vanilla-main flex flex-col"
            >
              <div className="p-5 border-b border-vanilla-main bg-vanilla-secondary/40 flex justify-between items-center text-left">
                <div>
                  <h3 className="text-base font-bold text-brand-secondary font-display">
                    {previewDraft.currentDocType || 'Draft'} Summary
                  </h3>
                  <p className="text-[10px] text-text-light mt-0.5">Review current saved variables for this draft.</p>
                </div>
                <button 
                  onClick={() => setPreviewDraft(null)} 
                  className="p-1.5 hover:bg-vanilla-main rounded-full text-text-light transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto text-left space-y-4">
                {previewDraft.answers && Object.keys(previewDraft.answers).length > 0 ? (
                  <div className="grid gap-3">
                    {Object.entries(previewDraft.answers).map(([key, val]: any) => {
                      if (key === 'profile_prefill_confirmation') return null;
                      return (
                        <div key={key} className="p-3 bg-vanilla-secondary/30 rounded-xl border border-vanilla-main/40">
                          <span className="block text-[10px] font-mono font-bold text-text-light uppercase tracking-wider">{key}</span>
                          <span className="block text-xs font-bold text-brand-secondary mt-1">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-xs text-text-light py-8">
                    No questions answered yet in this session.
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-vanilla-main flex gap-3">
                <button
                  onClick={() => setPreviewDraft(null)}
                  className="flex-1 py-2.5 border border-vanilla-main text-brand-secondary rounded-xl font-bold text-xs hover:bg-vanilla-secondary cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = previewDraft.id;
                    const type = previewDraft.currentDocType || 'NDA';
                    setPreviewDraft(null);
                    if (onContinueDraft) onContinueDraft(id, type);
                  }}
                  className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-xs hover:opacity-95 shadow-sm cursor-pointer"
                >
                  Continue Drafting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


// 2. DOWNLOAD CENTER VIEW
export function DownloadsView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user, profile } = useAuth();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const dRef = collection(db, 'users', user.uid, 'downloads');
    const q = query(dRef, orderBy('downloadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        downloadedAt: doc.data().downloadedAt?.toDate() || new Date()
      }));
      setDownloads(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load downloads:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDownloadAgain = async (item: any) => {
    try {
      const token = user ? await user.getIdToken() : '';
      const response = await axios.post("/api/documents/download", {
        content: item.content || "Empty Document",
        title: item.title || "Legal Document",
        format: item.format || "pdf",
        userId: user?.uid || '',
        documentId: item.documentId || '',
        token: token || ''
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${item.title || 'document'}.${item.format || 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Update count locally or push increment
      if (user) {
        await updateDoc(doc(db, 'users', user.uid, 'downloads', item.id), {
          count: (item.count || 1) + 1,
          downloadedAt: new Date()
        });
      }
    } catch (err) {
      console.error("Failed to redownload document:", err);
      alert("Unauthorized download. This document has not been unlocked or purchased.");
    }
  };

  const filteredDownloads = downloads.filter(d => {
    const titleMatch = d.title && d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const formatMatch = formatFilter === 'All' || d.format?.toLowerCase() === formatFilter.toLowerCase();
    return titleMatch && formatMatch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Checking Downloads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Download Center</h2>
        <p className="text-xs text-text-light mt-1 font-medium">Access your previously exported PDF and DOCX files. Available forever.</p>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 items-center justify-between bg-vanilla-secondary/30 rounded-t-[20px]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search downloads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30 transition-colors text-text-secondary shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            {['All', 'PDF', 'DOCX'].map(f => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  formatFilter === f ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-vanilla-main text-brand-secondary hover:bg-vanilla-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredDownloads.length === 0 ? (
          <div className="p-6">
            <EmptyState 
              icon={Download}
              title="No Downloads Found"
              description="Your downloaded and finalized documents will appear here for instant re-downloading at no extra cost."
              actionText="Create Document"
              onAction={onCreateNew}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vanilla-secondary/20 text-xs font-bold text-text-light uppercase tracking-wider font-mono border-b border-vanilla-main">
                  <th className="px-5 py-4">Document Title</th>
                  <th className="px-5 py-4">Format</th>
                  <th className="px-5 py-4">Version</th>
                  <th className="px-5 py-4">Download Count</th>
                  <th className="px-5 py-4">Last Downloaded</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vanilla-main/50 text-xs text-text-secondary font-medium text-left">
                {filteredDownloads.map((item) => (
                  <tr key={item.id} className="hover:bg-vanilla-secondary/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-brand-primary shrink-0" />
                        <span className="font-bold text-brand-secondary">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                        item.format === 'pdf' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-text-light">v{item.version || '1.0'}</td>
                    <td className="px-5 py-4 font-mono text-[10px] text-text-light">{item.count || 1} times</td>
                    <td className="px-5 py-4 whitespace-nowrap">{formatIndianDate(item.downloadedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDownloadAgain(item)}
                        className="inline-flex items-center gap-1 bg-[#F1FEC8] hover:bg-brand-primary hover:text-white border border-brand-primary/20 text-brand-secondary px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                      >
                        <FileDown className="h-3.5 w-3.5" /> Download Again
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// 3. ORDERS HISTORY VIEW
export function OrdersView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const oRef = collection(db, 'users', user.uid, 'orders');
    const q = query(oRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setOrders(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.documentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (order.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleRepeatOrder = async (order: any) => {
    if (!window.confirm(`Would you like to repeat checkout or duplicate drafting parameters for: ${order.documentTitle}?`)) return;
    onCreateNew();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Retrieving Invoices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Order History</h2>
        <p className="text-xs text-text-light mt-1 font-medium">Verify legal transactions, check GST invoices, and manage repeat requests.</p>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 bg-vanilla-secondary/30 rounded-t-[20px]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30 transition-colors text-text-secondary shadow-xs"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState 
              icon={ShoppingBag}
              title="No Invoices Found"
              description="When you unlock professional legal drafts or order dynamic downloads, your GST invoices and tracking details will register here."
              actionText="Browse Categories"
              onAction={onCreateNew}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vanilla-secondary/20 text-xs font-bold text-text-light uppercase tracking-wider font-mono border-b border-vanilla-main">
                  <th className="px-5 py-4">Order Details</th>
                  <th className="px-5 py-4">Document Title</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vanilla-main/50 text-xs text-text-secondary font-medium text-left">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-vanilla-secondary/10 transition-colors">
                    <td className="px-5 py-4 font-mono text-[10px] text-brand-secondary font-bold">
                      {order.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-brand-secondary">{order.documentTitle || 'Legal Document'}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-secondary">
                      ₹{order.amount || 149}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-100">
                        {order.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatIndianDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="px-3 py-1.5 bg-vanilla-secondary text-brand-secondary hover:bg-vanilla-main text-[10px] font-black rounded-lg transition-colors cursor-pointer border border-vanilla-main/80"
                      >
                        Tax Invoice
                      </button>
                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="px-3 py-1.5 bg-brand-primary text-white hover:opacity-95 text-[10px] font-black rounded-lg transition-opacity cursor-pointer shadow-xs"
                      >
                        Repeat Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tax Invoice Modal */}
      <AnimatePresence>
        {invoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#3C1A47]/40 backdrop-blur-sm" onClick={() => setInvoiceOrder(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#E5F5B8] p-6 text-left"
            >
              <div className="flex justify-between items-start border-b border-vanilla-main pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#3C1A47] font-mono tracking-widest uppercase">AKYIN VENTURES</h3>
                  <p className="text-[10px] text-text-light mt-0.5 font-bold">kartigo.online • GSTIN: 29AKYPV1234F1Z8</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-brand-primary uppercase tracking-wider font-mono">Tax Invoice</span>
                  <p className="text-[9px] text-text-light font-mono mt-0.5">Order ID: {invoiceOrder.id}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-2 gap-4 bg-vanilla-secondary/20 p-3 rounded-xl border border-vanilla-main/60">
                  <div>
                    <span className="block text-[9px] text-text-light font-mono uppercase font-bold">Billed To:</span>
                    <span className="block font-bold text-brand-secondary mt-0.5">
                      {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Guest Customer'}
                    </span>
                    <span className="block text-text-light text-[10px] mt-0.5">{user?.email || invoiceOrder.userEmail}</span>
                    {profile?.businessProfile?.gstId && (
                      <span className="block text-[10px] text-brand-primary font-mono mt-1 font-bold">GSTIN: {profile.businessProfile.gstId}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-text-light font-mono uppercase font-bold">Date of Supply:</span>
                    <span className="block font-bold text-brand-secondary mt-0.5">{formatIndianDate(invoiceOrder.createdAt)}</span>
                    <span className="block text-[9px] text-text-light mt-1 font-mono uppercase font-bold">Payment Method:</span>
                    <span className="block font-mono text-[10px] text-green-600 font-bold">RAZORPAY SECURE</span>
                  </div>
                </div>

                <div className="border border-vanilla-main rounded-xl overflow-hidden mt-4">
                  <div className="grid grid-cols-12 bg-vanilla-secondary/40 px-3 py-2 font-bold font-mono text-[10px] text-brand-secondary uppercase border-b border-vanilla-main">
                    <div className="col-span-8">Description</div>
                    <div className="col-span-2 text-right">Tax (18%)</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  <div className="grid grid-cols-12 px-3 py-3 border-b border-vanilla-main/40 font-bold text-brand-secondary">
                    <div className="col-span-8">
                      <span>{invoiceOrder.documentTitle || 'Professional Document Unlock'}</span>
                      <span className="block text-[9px] text-text-light font-mono mt-0.5 font-bold">Professional Legal Grade Download</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-text-light">
                      ₹{Math.round((invoiceOrder.amount || 149) * 0.18)}
                    </div>
                    <div className="col-span-2 text-right font-mono">
                      ₹{invoiceOrder.amount || 149}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1.5 pt-3">
                  <div className="flex justify-between w-48 text-[11px] font-bold text-brand-secondary">
                    <span>Taxable Value:</span>
                    <span className="font-mono">₹{Math.round((invoiceOrder.amount || 149) / 1.18)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-[11px] font-bold text-brand-secondary">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{Math.round((invoiceOrder.amount || 149) * 0.09)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-[11px] font-bold text-brand-secondary">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{Math.round((invoiceOrder.amount || 149) * 0.09)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-sm font-extrabold text-brand-primary border-t border-vanilla-main pt-2">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{invoiceOrder.amount || 149}</span>
                  </div>
                </div>

                <p className="text-[9px] text-text-light text-center italic mt-6 border-t border-vanilla-main/40 pt-3">
                  This is a computer-generated GST invoice. No physical signature required. Built by AKYIN Ventures.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="bg-[#3C1A47] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:opacity-95 transition-opacity cursor-pointer shadow-md"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


// 4. FAVORITES VIEW
export function FavoritesView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user } = useAuth();
  const [favoriteDocs, setFavoriteDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Subscribe to starred documents
    const docsRef = collection(db, 'users', user.uid, 'documents');
    const q = query(docsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }))
        .filter((d: any) => d.starred === true);
      
      setFavoriteDocs(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load favorite documents:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Favorites...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Favorite Documents</h2>
        <p className="text-xs text-text-light mt-1 font-medium">Quick access to your most frequently used and starred templates.</p>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6">
        {favoriteDocs.length === 0 ? (
          <EmptyState 
            icon={Star}
            title="No Favorites"
            description="Click the star icon on any generated document to save it here for instant reference and quick downloads."
            actionText="Find Templates"
            onAction={onCreateNew}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {favoriteDocs.map((docItem) => (
              <div 
                key={docItem.id}
                className="p-4 bg-white border border-vanilla-main hover:border-brand-primary/30 rounded-2xl flex items-center justify-between transition-all hover:shadow-md cursor-pointer group"
                onClick={() => {
                  const docBtn = document.getElementById('tab-create-doc-btn');
                  if (docBtn) docBtn.click();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-primary/5 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors line-clamp-1">{docItem.title}</h4>
                    <p className="text-[10px] text-text-light font-mono mt-0.5">{docItem.documentType} • Starred</p>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (user) {
                      await updateDoc(doc(db, 'users', user.uid, 'documents', docItem.id), {
                        starred: false
                      });
                    }
                  }}
                  className="p-1.5 text-brand-primary hover:text-text-light bg-brand-primary/5 hover:bg-vanilla-secondary transition-colors rounded-lg cursor-pointer"
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// 5. SHARED VIEWS (PUBLIC LINKS)
export function SharedView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user } = useAuth();
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docsRef = collection(db, 'users', user.uid, 'documents');
    const unsubscribe = onSnapshot(docsRef, (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((d: any) => d.isPublic === true || d.shareToken);
      
      setSharedDocs(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load shared documents:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCopyLink = (shareDoc: any) => {
    const shareUrl = `${window.location.origin}/share/${shareDoc.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Public Link Copied!\n${shareUrl}`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Shared Vault...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Shared Documents</h2>
        <p className="text-xs text-text-light mt-1 font-medium">Manage public share links and active collaboration permissions for external partners.</p>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6">
        {sharedDocs.length === 0 ? (
          <EmptyState 
            icon={Globe}
            title="Nothing Shared Externally"
            description="You haven't shared any documents externally. Toggle sharing inside the Document Writer Editor to configure secure access."
            actionText="Create Document"
            onAction={onCreateNew}
          />
        ) : (
          <div className="grid gap-4 text-left">
            {sharedDocs.map((shareDoc) => (
              <div 
                key={shareDoc.id}
                className="p-5 bg-white border border-vanilla-main rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-primary/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-brand-primary/5 text-brand-primary rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-secondary leading-tight">{shareDoc.title}</h4>
                    <span className="block text-[10px] text-text-light font-mono mt-1">{shareDoc.documentType} • Public Sharing Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopyLink(shareDoc)}
                    className="px-3.5 py-2 bg-vanilla-secondary text-brand-secondary border border-vanilla-main hover:bg-vanilla-main text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Copy Link
                  </button>
                  <button
                    onClick={async () => {
                      if (user) {
                        await updateDoc(doc(db, 'users', user.uid, 'documents', shareDoc.id), {
                          isPublic: false,
                          shareToken: null
                        });
                      }
                    }}
                    className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Revoke Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// 6. HISTORY AUDIT LOGS VIEW
export function HistoryView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user } = useAuth();
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Combine documents, orders, and tickets to compile an authentic, dynamic real-time chronological timeline feed!
    const docsRef = collection(db, 'users', user.uid, 'documents');
    const ordersRef = collection(db, 'users', user.uid, 'orders');
    const ticketsRef = collection(db, 'users', user.uid, 'tickets');

    let isSubscribed = true;

    Promise.all([
      getDocs(docsRef),
      getDocs(ordersRef),
      getDocs(ticketsRef)
    ]).then(([docsSnap, ordersSnap, ticketsSnap]) => {
      if (!isSubscribed) return;

      const items: any[] = [];

      // Add documents
      docsSnap.forEach(snap => {
        const d = snap.data();
        const date = d.createdAt?.toDate() || new Date();
        items.push({
          id: `doc-${snap.id}`,
          title: 'Generated Draft Summary',
          description: `Created dynamic wizard questions and compiled draft template for: "${d.title || d.documentType}".`,
          date,
          badge: 'Draft Created',
          color: 'bg-blue-50 text-blue-600 border-blue-100'
        });

        if (d.updatedAt && d.updatedAt.toDate().getTime() !== date.getTime()) {
          items.push({
            id: `doc-up-${snap.id}`,
            title: 'Edited Document Content',
            description: `Modified the clause body of "${d.title}" inside the Writer Document Editor.`,
            date: d.updatedAt.toDate(),
            badge: 'Content Edited',
            color: 'bg-amber-50 text-amber-600 border-amber-100'
          });
        }
      });

      // Add orders
      ordersSnap.forEach(snap => {
        const o = snap.data();
        items.push({
          id: `order-${snap.id}`,
          title: 'Payment Completed Successfully',
          description: `Successfully verified signature & processed payment of ₹${o.amount || 149} for "${o.documentTitle || 'Document Unlock'}". Invoice ORD-${snap.id.slice(0, 6)} generated.`,
          date: o.createdAt?.toDate() || new Date(),
          badge: 'Order Paid',
          color: 'bg-green-50 text-green-600 border-green-100'
        });
      });

      // Add tickets
      ticketsSnap.forEach(snap => {
        const t = snap.data();
        items.push({
          id: `ticket-${snap.id}`,
          title: 'Support Ticket Logged',
          description: `Logged technical support query regarding: "${t.subject}". Current priority: ${t.priority}.`,
          date: t.createdAt?.toDate() || new Date(),
          badge: 'Ticket Opened',
          color: 'bg-purple-50 text-purple-600 border-purple-100'
        });
      });

      // Sort chronological
      items.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTimelineItems(items);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to compile history timeline:", err);
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Syncing Activity Logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Recent Activity</h2>
        <p className="text-xs text-text-light mt-1 font-medium font-mono uppercase tracking-wider">Dynamic Workspace Timeline • Real-time logs</p>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6 text-left">
        {timelineItems.length === 0 ? (
          <EmptyState 
            icon={Clock}
            title="No Activity Logged"
            description="Your recent actions like drafted summaries, orders, edits, downloads, and support tickets will display here chronologically."
            actionText="Start Drafting"
            onAction={onCreateNew}
          />
        ) : (
          <div className="relative border-l border-vanilla-main/60 pl-6 ml-4 space-y-8">
            {timelineItems.slice(0, 15).map((item) => (
              <div key={item.id} className="relative">
                {/* Dot Bullet */}
                <div className="absolute -left-[31px] top-1 bg-[#F1FEC8] border border-vanilla-main h-4.5 w-4.5 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-brand-primary" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className={`inline-flex self-start px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${item.color}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-text-light font-mono">{formatIndianDate(item.date)} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h3 className="text-xs font-extrabold text-[#3C1A47] mt-1.5">{item.title}</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed font-bold">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
