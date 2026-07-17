import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LayoutContainer from './LayoutContainer';
import { DraftsIllustration } from './Illustrations';

export default function RecentDocumentsSection({ onStartDrafting, onOpenDashboard }: { onStartDrafting: (title: string) => void, onOpenDashboard: (tab: any) => void }) {
  const { user } = useAuth();
  const [hasUnfinishedDraft, setHasUnfinishedDraft] = useState(false);
  const [recentDocs, setRecentDocs] = useState([
    'Appointment Letter',
    'Rent Agreement',
    'Service Agreement'
  ]);
  
  // Simulated logic for checking drafts/history
  useEffect(() => {
    // In a real app, this would check Firestore or localStorage
    const savedConversations = localStorage.getItem('kartigo_document_progress');
    if (savedConversations || user) {
      if (user) {
         setHasUnfinishedDraft(true);
      } else {
         setHasUnfinishedDraft(false);
      }
    }
  }, [user]);

  return (
    <section id="recent-documents" className="py-16 bg-vanilla-main/30 border-y border-vanilla-main">
      <LayoutContainer>
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {hasUnfinishedDraft ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-brand-primary/20 hover:border-brand-primary/40 transition-all duration-300 flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0">
                  <DraftsIllustration />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-light uppercase tracking-widest font-mono mb-1">Continue Your Draft</h3>
                  <h4 className="text-lg font-bold text-brand-secondary">Rent Agreement</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-24 bg-vanilla-main rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary w-[85%] rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-primary">85% Complete</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onStartDrafting('Rent Agreement')}
                className="px-4 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2 shrink-0 border border-transparent shadow-sm active:scale-95"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-vanilla-main hover:border-brand-primary/40 transition-all duration-300 flex-1 w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xs font-bold text-text-light uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Recently Created
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {recentDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-brand-secondary bg-vanilla-secondary px-4 py-2 rounded-xl border border-vanilla-main">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary"></span>
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => onOpenDashboard('documents')}
                  className="px-4 py-3 bg-white border border-vanilla-main text-brand-secondary rounded-xl text-xs font-bold hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 shrink-0 whitespace-nowrap shadow-sm active:scale-95"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </LayoutContainer>
    </section>
  );
}
