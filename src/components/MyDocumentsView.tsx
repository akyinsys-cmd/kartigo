import React, { useState } from 'react';
import { 
  Search, Filter, ChevronDown, MoreVertical, FileText, 
  Eye, Edit3, Copy, Download, Share2, Star, Trash2,
  Clock, ArrowUp, ArrowDown, Sparkles, CheckCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './CustomerWorkspacePlaceholders';
import { formatIndianDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc, collection } from 'firebase/firestore';
import Breadcrumbs from './Breadcrumbs';

interface Document {
  id: string;
  title: string;
  documentType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  starred?: boolean;
}

interface MyDocumentsViewProps {
  documents: Document[];
  onOpenDoc: (doc: Document) => void;
  onDeleteDoc: (docId: string, e: React.MouseEvent) => void;
  onCreateNew: () => void;
}

export default function MyDocumentsView({ documents, onOpenDoc, onDeleteDoc, onCreateNew }: MyDocumentsViewProps) {
  const { user, addMockNotification } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Filter and sort logic
  const filteredDocs = documents.filter(doc => {
    return doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    let aCmp: string | number;
    let bCmp: string | number;
    if (sortField === 'title') {
      aCmp = aVal ? String(aVal).toLowerCase() : '';
      bCmp = bVal ? String(bVal).toLowerCase() : '';
    } else {
      aCmp = aVal ? new Date(aVal).getTime() : 0;
      bCmp = bVal ? new Date(bVal).getTime() : 0;
    }
    if (aCmp < bCmp) return sortDirection === 'asc' ? -1 : 1;
    if (aCmp > bCmp) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'title' | 'createdAt' | 'updatedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionMenuOpen === id) setActionMenuOpen(null);
    else setActionMenuOpen(id);
  };

  // 1. STAR / FAVORITE TOGGLE
  const handleToggleStar = async (docObj: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'documents', docObj.id);
      const nextStarState = !docObj.starred;
      await updateDoc(docRef, { starred: nextStarState });
      
      await addMockNotification(
        nextStarState ? "Added to Favorites" : "Removed from Favorites",
        `"${docObj.title}" has been updated in your Favorites collection.`,
        "success"
      );
    } catch (err) {
      console.error("Star toggle failed:", err);
    } finally {
      setActionMenuOpen(null);
    }
  };

  // 2. DUPLICATE CLONE DOCUMENT
  const handleDuplicateDoc = async (docObj: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const newDocRef = doc(collection(db, 'users', user.uid, 'documents'));
      const clonedData = {
        title: `${docObj.title} (Copy)`,
        documentType: docObj.documentType,
        content: docObj.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        starred: false
      };
      await setDoc(newDocRef, clonedData);

      await addMockNotification(
        "Document Duplicated",
        `Successfully cloned "${docObj.title}" as "${clonedData.title}".`,
        "success"
      );
    } catch (err) {
      console.error("Duplication failed:", err);
    } finally {
      setActionMenuOpen(null);
    }
  };

  // 3. COPY PUBLIC SHARE LINK
  const handleShareDoc = async (docObj: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `https://kartigo.online/shared/doc/${docObj.id}?token=ktg_${Math.random().toString(36).substring(2, 10)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);

      if (user) {
        // Register in shared subcollection
        const sharedRef = doc(db, 'users', user.uid, 'shared', docObj.id);
        await setDoc(sharedRef, {
          id: docObj.id,
          title: docObj.title,
          documentType: docObj.documentType,
          sharedAt: new Date(),
          clicks: 1,
          active: true
        });

        await addMockNotification(
          "Public Share Enabled",
          `A secure web access token has been generated for "${docObj.title}". Link copied to clipboard.`,
          "info"
        );
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    } finally {
      setActionMenuOpen(null);
    }
  };

  // 4. DOWNLOAD TRIGGER
  const handleDownloadDoc = async (docObj: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      // 1. Register Download entry
      const downloadId = `dl-${Date.now()}`;
      const downloadRef = doc(db, 'users', user.uid, 'downloads', downloadId);
      await setDoc(downloadRef, {
        id: downloadId,
        title: docObj.title,
        documentType: docObj.documentType,
        unlocked: true,
        downloadedAt: new Date(),
        pricePaid: 99,
        invoiceId: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
      });

      // 2. Trigger Client browser mock download
      const element = document.createElement("a");
      const file = new Blob([docObj.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${docObj.title.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      await addMockNotification(
        "Download Initiated",
        `Your clean, unwatermarked TXT copy of "${docObj.title}" has been downloaded.`,
        "success"
      );
    } catch (err) {
      console.error("Download registering failed:", err);
    } finally {
      setActionMenuOpen(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs 
        onBackHome={() => {}}
        items={[{ label: 'My Documents', isActive: true }]} 
      />

      {/* Alert toast for share links */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-[#3C1A47] text-[#F1FEC8] px-4 py-3.5 rounded-xl border border-brand-primary/20 shadow-xl z-50 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
            <span>Secure share URL copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">
            My Documents
          </h2>
          <p className="text-xs text-text-light mt-1 font-medium">
            Manage your generated documents, drafts, and finalized templates.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-primary px-4.5 py-3 rounded-xl hover:opacity-95 transition-opacity card-shadow cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-[#F1FEC8]" />
          Create New Document
        </button>
      </div>

      <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-vanilla-main flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-vanilla-secondary/50 border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30 transition-colors text-text-secondary font-bold"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] text-text-light font-mono font-bold uppercase">Total: {filteredDocs.length} Docs</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-vanilla-secondary/30 text-xs font-bold text-text-light uppercase tracking-wider font-mono border-b border-vanilla-main">
                <th className="px-5 py-4 cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Document {sortField === 'title' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</div>
                </th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4 cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">Created {sortField === 'createdAt' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</div>
                </th>
                <th className="px-5 py-4 cursor-pointer hover:text-brand-primary transition-colors hidden md:table-cell" onClick={() => handleSort('updatedAt')}>
                  <div className="flex items-center gap-1">Updated {sortField === 'updatedAt' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</div>
                </th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vanilla-main text-xs text-text-secondary">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-vanilla-secondary/20 transition-colors group cursor-pointer" onClick={() => onOpenDoc(doc)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 text-brand-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-brand-secondary group-hover:text-brand-primary transition-colors line-clamp-1">{doc.title}</span>
                        {doc.starred && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-light font-bold">{doc.documentType}</td>
                    <td className="px-5 py-4 whitespace-nowrap">{formatIndianDate(doc.createdAt)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-text-light hidden md:table-cell">{formatIndianDate(doc.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
                        Completed
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right relative">
                      <button 
                        onClick={(e) => toggleActionMenu(doc.id, e)}
                        className="p-1.5 text-text-light hover:text-brand-primary rounded-lg transition-colors focus:outline-hidden cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      <AnimatePresence>
                        {actionMenuOpen === doc.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-8 top-8 w-48 bg-white border border-vanilla-main rounded-xl shadow-lg z-20 py-1 text-left"
                          >
                            <button className="w-full text-left px-4 py-2 hover:bg-vanilla-secondary flex items-center gap-2 text-brand-secondary cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); onOpenDoc(doc); setActionMenuOpen(null); }}>
                              <Eye className="h-4 w-4 text-text-light font-bold" /> Open & Edit
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-vanilla-secondary flex items-center gap-2 text-brand-secondary cursor-pointer font-bold" onClick={(e) => handleToggleStar(doc, e)}>
                              <Star className={`h-4 w-4 ${doc.starred ? 'text-amber-500 fill-amber-500' : 'text-text-light'}`} /> 
                              {doc.starred ? 'Unstar Favorite' : 'Star Favorite'}
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-vanilla-secondary flex items-center gap-2 text-brand-secondary cursor-pointer font-bold" onClick={(e) => handleDuplicateDoc(doc, e)}>
                              <Copy className="h-4 w-4 text-text-light" /> Duplicate Clone
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-vanilla-secondary flex items-center gap-2 text-brand-secondary cursor-pointer font-bold" onClick={(e) => handleDownloadDoc(doc, e)}>
                              <Download className="h-4 w-4 text-text-light" /> Unwatermarked PDF
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-vanilla-secondary flex items-center gap-2 text-brand-secondary cursor-pointer font-bold" onClick={(e) => handleShareDoc(doc, e)}>
                              <Share2 className="h-4 w-4 text-text-light" /> Share Public URL
                            </button>
                            <div className="border-t border-vanilla-main my-1"></div>
                            <button className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-bold" onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id, e); setActionMenuOpen(null); }}>
                              <Trash2 className="h-4 w-4" /> Delete Permanently
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-6">
                    <EmptyState 
                      icon={FileText} 
                      title="No documents found" 
                      description="You haven't generated any documents matching this search." 
                      actionText="Draft New Document" 
                      onAction={onCreateNew} 
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-vanilla-main/60">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 bg-white hover:bg-vanilla-secondary/20 transition-colors" onClick={() => onOpenDoc(doc)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brand-primary/10 rounded-lg flex items-center justify-center shrink-0 text-brand-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-brand-secondary line-clamp-1 flex items-center gap-1">
                        {doc.title}
                        {doc.starred && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                      </span>
                      <span className="text-[10px] text-text-light font-mono block mt-0.5">{doc.documentType}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleActionMenu(doc.id, e); }}
                    className="p-3 text-text-light hover:text-brand-primary rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-text-light">{formatIndianDate(doc.createdAt)}</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
                    Completed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6">
              <EmptyState 
                icon={FileText} 
                title="No documents found" 
                description="You haven't generated any documents matching this search." 
                actionText="Draft New Document" 
                onAction={onCreateNew} 
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-vanilla-main flex items-center justify-between text-xs text-text-light bg-vanilla-secondary/30 rounded-b-[20px]">
          <span>Showing 1 to {filteredDocs.length} of {filteredDocs.length} entries</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 border border-vanilla-main bg-white rounded-md hover:bg-vanilla-secondary disabled:opacity-50 text-text-secondary cursor-pointer font-medium min-w-[44px] min-h-[44px] flex items-center justify-center">Previous</button>
            <button className="px-4 py-2.5 border border-vanilla-main bg-brand-primary text-white rounded-md font-bold min-w-[44px] min-h-[44px] flex items-center justify-center">1</button>
            <button className="px-4 py-2.5 border border-vanilla-main bg-white rounded-md hover:bg-vanilla-secondary disabled:opacity-50 text-text-secondary cursor-pointer font-medium min-w-[44px] min-h-[44px] flex items-center justify-center">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
