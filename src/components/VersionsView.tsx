import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { formatIndianDate } from '../utils/dateUtils';
import { Clock, FileText, ChevronRight, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './CustomerWorkspacePlaceholders';

interface Version {
  id: string;
  versionNumber: number;
  content: string;
  title: string;
  createdAt: any;
}

interface DocumentWithVersions {
  id: string;
  title: string;
  documentType: string;
  versions: Version[];
}

export function VersionsView({ onCreateNew }: { onCreateNew: () => void }) {
  const { user } = useAuth();
  const [docsWithVersions, setDocsWithVersions] = useState<DocumentWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithVersions | null>(null);
  const [notification, setNotification] = useState<{ text: string, type: string } | null>(null);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    if (!user) return;

    const fetchAllVersions = async () => {
      setLoading(true);
      try {
        const docsRef = collection(db, 'users', user.uid, 'documents');
        const docsSnap = await getDocs(query(docsRef, orderBy('createdAt', 'desc')));
        
        const results: DocumentWithVersions[] = [];

        for (const docSnap of docsSnap.docs) {
          const docData = docSnap.data();
          const versionsRef = collection(db, 'users', user.uid, 'documents', docSnap.id, 'versions');
          const versionsSnap = await getDocs(query(versionsRef, orderBy('createdAt', 'desc')));
          
          if (!versionsSnap.empty) {
            results.push({
              id: docSnap.id,
              title: docData.title,
              documentType: docData.documentType,
              versions: versionsSnap.docs.map(v => ({
                id: v.id,
                ...v.data(),
                createdAt: v.data().createdAt?.toDate() || new Date()
              })) as Version[]
            });
          }
        }
        setDocsWithVersions(results);
      } catch (err) {
        console.error("Failed to load versions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVersions();
  }, [user]);

  const handleRestoreVersion = async (docId: string, version: Version) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to restore "${selectedDoc?.title}" to Version ${version.versionNumber}? Current content will be overwritten.`)) return;

    try {
      const docRef = doc(db, 'users', user.uid, 'documents', docId);
      await updateDoc(docRef, {
        content: version.content,
        title: version.title,
        updatedAt: new Date()
      });
      triggerNotification(`Restored to Version ${version.versionNumber} successfully!`, "success");
      // Update local state if needed or refetch
    } catch (err) {
      console.error("Failed to restore version:", err);
      triggerNotification("Failed to restore version.", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-bold text-text-light font-mono flex items-center justify-center gap-2">
        <span className="h-4 w-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span>Compiling Version History...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {notification.type === 'success' ? <RotateCcw className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            <span className="text-xs font-bold">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Iteration Vault</h2>
          <p className="text-xs text-text-light mt-1 font-medium">View and restore previous iterations of your finalized legal documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono mb-2">Documents with History</h3>
          {docsWithVersions.length === 0 ? (
            <div className="bg-white border border-vanilla-main rounded-[20px] p-8 text-center">
              <EmptyState 
                icon={Clock}
                title="No Version History"
                description="Once you edit and save changes to your finalized documents in the editor, previous versions will be stored here."
                actionText="Go to Documents"
                onAction={onCreateNew}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {docsWithVersions.map((docItem) => (
                <button
                  key={docItem.id}
                  onClick={() => setSelectedDoc(docItem)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedDoc?.id === docItem.id 
                      ? 'bg-brand-primary/5 border-brand-primary shadow-sm' 
                      : 'bg-white border-vanilla-main hover:border-brand-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedDoc?.id === docItem.id ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-secondary line-clamp-1">{docItem.title}</h4>
                      <span className="text-[9px] text-text-light font-mono">{docItem.versions.length} versions saved</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${selectedDoc?.id === docItem.id ? 'translate-x-1 text-brand-primary' : 'text-text-light'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Version Timeline */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="bg-white border border-vanilla-main rounded-[24px] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
              <div className="p-5 border-b border-vanilla-main bg-vanilla-secondary/20 flex justify-between items-center text-left">
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary">{selectedDoc.title}</h3>
                  <p className="text-[10px] text-text-light mt-0.5">Select a version below to restore or compare content.</p>
                </div>
                <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-bold">
                  {selectedDoc.documentType}
                </div>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto max-h-[600px] text-left">
                <div className="relative border-l-2 border-vanilla-main ml-4 pl-8 space-y-8 py-2">
                  {selectedDoc.versions.map((version, idx) => (
                    <div key={version.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[41px] top-1.5 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                        idx === 0 ? 'bg-brand-primary' : 'bg-vanilla-main'
                      }`}>
                        {idx === 0 && <RotateCcw className="h-3 w-3 text-white" />}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-brand-secondary">Version {version.versionNumber}</span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded-md">Latest</span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-light font-mono">{formatIndianDate(version.createdAt)}</span>
                      </div>

                      <div className="bg-vanilla-secondary/20 rounded-2xl p-4 border border-vanilla-main/50 group">
                        <h4 className="text-[11px] font-bold text-brand-secondary mb-2">{version.title}</h4>
                        <p className="text-[10px] text-text-light line-clamp-3 mb-4 leading-relaxed italic">
                          "{version.content.substring(0, 200)}..."
                        </p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreVersion(selectedDoc.id, version)}
                            disabled={idx === 0}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                              idx === 0 
                                ? 'bg-vanilla-secondary text-text-light cursor-not-allowed' 
                                : 'bg-white border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm'
                            }`}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore This iteration
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-vanilla-secondary/10 border border-dashed border-vanilla-main rounded-[24px] flex flex-col items-center justify-center p-12 text-center">
              <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-text-light mb-4">
                <Info className="h-8 w-8 opacity-20" />
              </div>
              <h3 className="text-sm font-bold text-brand-secondary">Select a Document</h3>
              <p className="text-xs text-text-light mt-1 max-w-xs mx-auto">
                Select a document from the left panel to view its full version history and restore points.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
