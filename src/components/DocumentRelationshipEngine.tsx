import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { documents } from '../data/landingData';
import { DocumentTemplate } from '../types';

interface DocumentRelationshipEngineProps {
  currentDocId: string;
  onSelectDoc: (docId: string) => void;
}

export const DocumentRelationshipEngine: React.FC<DocumentRelationshipEngineProps> = ({ 
  currentDocId, 
  onSelectDoc 
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId);
  
  if (!currentDoc || !currentDoc.relatedDocumentIds || currentDoc.relatedDocumentIds.length === 0) {
    return null;
  }

  const relatedDocs = currentDoc.relatedDocumentIds
    .map(id => documents.find(d => d.id === id))
    .filter((d): d is DocumentTemplate => !!d);

  if (relatedDocs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-vanilla-secondary/30 border border-brand-primary/10 rounded-2xl p-6 mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-brand-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand-secondary">What's Next?</h3>
          <p className="text-[10px] text-text-light">Suggested documents based on your current goal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelectDoc(doc.id)}
            className="flex items-start gap-3 bg-white p-4 rounded-xl border border-vanilla-main hover:border-brand-primary/30 hover:shadow-sm transition-all group text-left cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0 group-hover:bg-brand-primary/5 transition-colors">
              <FileText className="h-5 w-5 text-text-secondary group-hover:text-brand-primary" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-xs font-bold text-brand-secondary truncate">{doc.title}</h4>
              <p className="text-[10px] text-text-light line-clamp-1 mt-0.5">{doc.description}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-brand-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Start Drafting <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
