import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, CornerDownRight, X, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { categories, documents } from '../data/landingData';
import { DocumentTemplate } from '../types';

interface SearchAndFilterProps {
  onOpenComingSoon: (featureName: string) => void;
  onOpenDocumentDetail: (doc: DocumentTemplate) => void;
}

// Helper to render dynamic lucide icons
const CategoryIcon = ({ name, className = 'h-6 w-6' }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.FileText className={className} />;
  return <IconComponent className={className} />;
};

export default function SearchAndFilter({ onOpenComingSoon, onOpenDocumentDetail }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const suggestions = [
    'Appointment Letter',
    'Offer Letter',
    'Resignation Letter',
    'Leave Letter',
    'NDA',
    'Rent Agreement',
    'Partnership Deed',
    'Service Agreement'
  ];

  // Handle clicking example suggestions
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSelectedCategoryId(null); // Clear category filter to show match
    
    // Scroll smoothly to popular documents header to focus user attention
    const docsHeader = document.getElementById('popular-documents-anchor');
    if (docsHeader) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = docsHeader.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Filter documents dynamically
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Matches category filter if active
      const matchesCategory = selectedCategoryId ? doc.category === selectedCategoryId : true;
      
      // Matches search query if present
      const matchesSearch = searchQuery.trim() 
        ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.whyUseIt.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategoryId]);

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

  return (
    <section
      id="search-filter-section"
      className="py-16 bg-vanilla-alt border-y border-vanilla-main"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Large Search Block */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl">
            What document do you need today?
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Search our extensive database of expert-vetted business, employment, and legal contracts.
          </p>

          {/* Search Input Bar */}
          <div className="mt-6 relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-light" />
            </div>
            <input
              id="main-document-search-input"
              type="text"
              className="block w-full rounded-2xl border border-vanilla-main bg-white pl-12 pr-10 py-4 text-base text-text-cosmic placeholder:text-text-light focus:outline-hidden focus:ring-2 focus:ring-brand-primary focus:border-transparent shadow-sm transition-all"
              placeholder="e.g. Non-Disclosure Agreement, Rental Lease, Resignation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-light hover:text-text-cosmic focus:outline-hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestion Chips */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-text-light uppercase tracking-wider mr-1">Trending:</span>
            {suggestions.map((sug) => (
              <button
                id={`suggestion-chip-${sug.replace(/\s+/g, '-')}`}
                key={sug}
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-1 bg-vanilla-secondary border border-vanilla-main rounded text-[11px] text-text-secondary cursor-pointer hover:bg-vanilla-main transition-all font-medium border-0 focus:outline-hidden"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Section Grid */}
        <div className="mb-16">
          <div className="text-center md:text-left mb-6">
            <h3 className="text-sm font-bold font-display text-brand-secondary uppercase tracking-wider">
              Browse by Legal & Business Categories
            </h3>
            <p className="text-xs text-text-light mt-1">Select a core category to filter down templates.</p>
          </div>

          <div id="categories-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  id={`category-card-${cat.id}`}
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                  className={`group text-left p-4 rounded-2xl border transition-all duration-300 focus:outline-hidden cursor-pointer flex items-center gap-4 card-shadow ${
                    isSelected
                      ? 'border-brand-primary bg-vanilla-main ring-1 ring-brand-primary'
                      : 'border-vanilla-main bg-white hover:border-brand-primary/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    isSelected ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'
                  }`}>
                    <CategoryIcon name={cat.icon} className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold secondary-text leading-tight group-hover:text-brand-primary transition-colors">
                      {cat.title}
                    </h4>
                     <span className="text-[10px] text-text-light block mt-0.5 font-mono">
                      {cat.id === 'hr' ? 'Offer, Letters...' : cat.id === 'legal' ? 'NDA, Agreements...' : cat.id === 'business' ? 'Partnership, Services...' : 'Invoices, Loans...'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Documents Header Anchor */}
        <div id="popular-documents-anchor" className="border-t border-vanilla-main pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-center md:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono">
                Expert Templates
              </span>
              <h3 className="text-2xl font-bold font-display text-brand-secondary mt-1">
                {selectedCategoryId 
                  ? `${categories.find(c => c.id === selectedCategoryId)?.title} Templates`
                  : searchQuery 
                    ? `Search Results for "${searchQuery}"`
                    : 'Popular & Requested Documents'
                }
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Showing {filteredDocuments.length} professional ready-to-draft templates.
              </p>
            </div>

            {/* Clear filters badge if any filter is active */}
            {(selectedCategoryId || searchQuery) && (
              <button
                id="reset-filters-btn"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-primary bg-vanilla-main border border-brand-primary/20 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                Clear all filters
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Grid Layout of Document Cards */}
          <AnimatePresence mode="popLayout">
            {filteredDocuments.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 bg-white rounded-[20px] border border-vanilla-main p-8"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vanilla-secondary text-brand-secondary/40 mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-text-cosmic">No documents match your filter</h4>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  We couldn't find any templates matching "{searchQuery}". Try modifying your keyword search or select another category above.
                </p>
                <button
                  id="no-results-reset-btn"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                >
                  Reset all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                id="documents-list-grid"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredDocuments.map((doc) => {
                  const docCategoryObj = categories.find(c => c.id === doc.category);
                  return (
                    <motion.div
                      id={`doc-card-${doc.id}`}
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col bg-white rounded-[20px] border border-vanilla-main/60 p-6 card-shadow hover:border-brand-primary/40 transition-all group"
                    >
                      {/* Document Category Badge */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="p-1 rounded-md bg-vanilla-main text-brand-primary">
                          {docCategoryObj && <CategoryIcon name={docCategoryObj.icon} className="h-3.5 w-3.5 text-brand-primary" />}
                        </span>
                        <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">
                          {docCategoryObj ? docCategoryObj.title : doc.category}
                        </span>
                        {doc.popularity >= 95 && (
                          <span className="ml-auto inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            Hot
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold font-display text-brand-secondary tracking-tight group-hover:text-brand-primary transition-colors">
                        {doc.title}
                      </h4>
                      
                      <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed flex-grow">
                        {doc.description}
                      </p>

                      <div className="mt-5 pt-4 border-t border-vanilla-main flex items-center justify-between">
                        <button
                          id={`doc-learn-more-${doc.id}`}
                          onClick={() => onOpenDocumentDetail(doc)}
                          className="text-xs font-bold text-brand-secondary hover:text-brand-primary transition-colors inline-flex items-center gap-1 focus:outline-hidden"
                        >
                          Learn More
                          <CornerDownRight className="h-3.5 w-3.5 text-brand-primary" />
                        </button>
                        
                        <button
                          id={`doc-draft-now-${doc.id}`}
                          onClick={() => onOpenComingSoon(`Assistant: Draft ${doc.title}`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-vanilla-main px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all focus:outline-hidden"
                        >
                          Draft Now
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
