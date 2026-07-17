import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CornerDownRight, X, Filter } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCMSContext } from '../context/CMSContext';
import { DocumentTemplate } from '../types';
import LayoutContainer from './LayoutContainer';
import GoogleAd from './GoogleAd';
import { Clock as HistoryIcon } from 'lucide-react';

interface BrowseDocumentsSectionProps {
  onOpenComingSoon: (featureName: string) => void;
  onOpenDocumentDetail: (doc: DocumentTemplate) => void;
  onStartDrafting?: (title: string) => void;
}


const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded-sm">{part}</span> : <span key={i}>{part}</span>
      )}
    </>
  );
};

const CategoryIcon = ({ icon, className = 'h-6 w-6' }: { icon: any; className?: string }) => {
  if (!icon) return <Icons.FileText className={className} />;
  if (typeof icon === 'string') {
    if (icon === 'CategoryLegalIllustration') return <div className={className}><CategoryLegalIllustration /></div>;
    if (icon === 'CategoryHRIllustration') return <div className={className}><CategoryHRIllustration /></div>;
    if (icon === 'CategoryBusinessIllustration') return <div className={className}><CategoryBusinessIllustration /></div>;
    
    const IconComponent = (Icons as any)[icon];
    if (!IconComponent) return <Icons.FileText className={className} />;
    return <IconComponent className={className} />;
  }
  const Component = icon;
  // If it's a component (not a string) we can wrap it or try to pass className if it supports it
  try {
    return <div className={className}><Component /></div>;
  } catch {
    return <Component className={className} />;
  }
};

import { 
  CategoryLegalIllustration, 
  CategoryHRIllustration, 
  CategoryBusinessIllustration,
  EmptySearchIllustration
} from './Illustrations';

const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
};

const isTypoMatch = (source: string, target: string, maxDistance = 2): boolean => {
  const sourceWords = source.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  
  // Basic includes check first
  if (source.toLowerCase().includes(target.toLowerCase())) return true;
  
  // Word by word typo check
  return targetWords.every(targetWord => {
    return sourceWords.some(sourceWord => {
      if (sourceWord.includes(targetWord) || targetWord.includes(sourceWord)) return true;
      if (sourceWord.length < 3 || targetWord.length < 3) return sourceWord === targetWord;
      return getLevenshteinDistance(sourceWord, targetWord) <= maxDistance;
    });
  });
};

export default function BrowseDocumentsSection({ onOpenComingSoon, onOpenDocumentDetail, onStartDrafting }: BrowseDocumentsSectionProps) {
  const { categories, documents } = useCMSContext();

  const resolvedCategories = useMemo(() => {
    // Deduplicate categories by ID
    const uniqueCats = Array.from(new Map(categories.map(c => [c.id, c])).values());
    
    return uniqueCats.map(c => {
      let illustration: any = 'FileText';
      if (c.id === 'legal') illustration = 'Scale';
      else if (c.id === 'hr') illustration = 'Users';
      else if (c.id === 'business') illustration = 'Briefcase';
      else if (c.id === 'real_estate') illustration = 'Building';
      else if (c.id === 'corporate') illustration = 'Building2';
      else if (c.id === 'technology') illustration = 'Monitor';
      else if (c.id === 'finance') illustration = 'CircleDollarSign';
      else if (c.icon) illustration = c.icon;
      
      return {
        id: c.id,
        title: c.title,
        icon: illustration,
        description: c.description || 'Vetted templates'
      };
    });
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'recently_added' | 'trending' | 'recommended' | 'favorites'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kartigo_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchToHistory = (query: string) => {
    if (!query || query.trim().length < 2) return;
    const trimmed = query.trim();
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('kartigo_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSearchToHistory(searchQuery);
  };

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kartigo_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(docId);
      const updated = isFav ? prev.filter(id => id !== docId) : [...prev, docId];
      localStorage.setItem('kartigo_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const quickChips = [
    { title: 'Appointment Letter', icon: '🏢' },
    { title: 'Rent Agreement', icon: '🏠' },
    { title: 'Service Agreement', icon: '🤝' },
    { title: 'NDA', icon: '📄' },
    { title: 'Offer Letter', icon: '💼' },
    { title: 'Leave Letter', icon: '📋' },
    { title: 'Partnership Deed', icon: '🏢' },
    { title: 'Affidavit', icon: '📑' }
  ];

  const handleQuickChipClick = (title: string) => {
    if (onStartDrafting) {
      onStartDrafting(title);
    } else {
      onOpenComingSoon(`Draft ${title}`);
    }
  };

  const filteredDocuments = useMemo(() => {
    // Deduplicate documents by ID
    let docs = Array.from(new Map(documents.map(d => [d.id, d])).values());
    
    if (selectedCategoryId) {
      docs = docs.filter(doc => {
        if (doc.category === selectedCategoryId) return true;
        // Smart mapping for extended categories to ensure no empty results / dead buttons
        if (selectedCategoryId === 'real_estate' || selectedCategoryId === 'property') {
          return doc.id === 'rental-agreement' || doc.id === 'rent-receipt';
        }
        if (selectedCategoryId === 'corporate' || selectedCategoryId === 'technology' || selectedCategoryId === 'startup') {
          return doc.category === 'startup' || doc.category === 'business' || doc.id === 'nda';
        }
        if (selectedCategoryId === 'employment') {
          return doc.category === 'hr';
        }
        if (selectedCategoryId === 'banking' || selectedCategoryId === 'tax' || selectedCategoryId === 'insurance') {
          return doc.category === 'finance' || doc.id === 'rent-receipt';
        }
        if (selectedCategoryId === 'travel' || selectedCategoryId === 'others') {
          return doc.category === 'personal';
        }
        if (selectedCategoryId === 'healthcare') {
          return doc.id === 'nda' || doc.category === 'hr';
        }
        if (selectedCategoryId === 'import_export') {
          return doc.id === 'vendor-agreement' || doc.id === 'service-agreement';
        }
        if (selectedCategoryId === 'consumer') {
          return doc.id === 'bill-of-sale';
        }
        return false;
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      docs = docs.filter(doc => {
        const docCategoryObj = resolvedCategories.find(c => c.id === doc.category);
        const categoryName = docCategoryObj ? docCategoryObj.title : '';
        return (
          isTypoMatch(doc.title, query) || 
          isTypoMatch(doc.description, query) ||
          isTypoMatch(categoryName, query)
        );
      });
    }
    
    // Simple mock logic for tabs
    if (activeTab === 'recently_added') {
      docs = docs.reverse(); // Mock sorting
    } else if (activeTab === 'trending') {
      docs = docs.filter(d => d.popularity >= 90);
    } else if (activeTab === 'recommended') {
      docs = docs.filter(d => d.id.length % 2 === 0);
    } else if (activeTab === 'favorites') {
      docs = docs.filter(d => favorites.includes(d.id));
    }
    
    return docs;
  }, [searchQuery, selectedCategoryId, activeTab, favorites, documents, resolvedCategories]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSelectedIndustry('');
  };

  return (
    <section id="search-filter-section" className="py-16 bg-vanilla-alt border-y border-vanilla-main">
      <LayoutContainer>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl">
            Browse Documents
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Search our extensive knowledge base of expert-vetted business, employment, and legal templates.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 relative max-w-2xl mx-auto z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-light" />
            </div>
            <input
              type="text"
              className="block w-full rounded-2xl border border-vanilla-main bg-white pl-12 pr-10 py-4 text-base text-text-cosmic placeholder:text-text-light focus:outline-hidden focus:ring-2 focus:ring-brand-primary shadow-sm transition-all"
              placeholder="Instant Search (e.g. Appointment Letter, HR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-12 pr-4 flex items-center text-text-light hover:text-text-cosmic focus:outline-hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute inset-y-0 right-0 pr-4 pl-4 flex items-center text-text-light hover:text-brand-primary focus:outline-hidden border-l border-vanilla-main my-2"
            >
              <Filter className="h-5 w-5 ml-2" />
            </button>

            {/* Search Dropdown - Recent Searches */}
            <AnimatePresence>
              {isSearchFocused && !searchQuery && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-vanilla-main overflow-hidden text-left py-2 z-30"
                >
                  <div className="px-4 py-2 flex items-center justify-between border-b border-vanilla-main/50 mb-1">
                    <span className="text-[10px] font-bold text-text-light uppercase tracking-widest flex items-center gap-1.5">
                      <HistoryIcon className="w-3 h-3" />
                      Recent Searches
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchHistory([]);
                        localStorage.removeItem('kartigo_search_history');
                      }}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((query, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSearchQuery(query)}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-brand-secondary hover:bg-vanilla-main/30 hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-text-light/50" />
                      {query}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick Start Chips */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4 max-w-2xl mx-auto">
             <span className="text-xs font-semibold text-text-light uppercase tracking-wider mr-1">Quick Start:</span>
             {quickChips.map((chip) => (
               <button
                 key={chip.title}
                 onClick={() => handleQuickChipClick(chip.title)}
                 className="px-4 py-2 bg-white border border-vanilla-main rounded-lg text-xs text-brand-secondary cursor-pointer hover:bg-vanilla-secondary hover:border-brand-primary/30 transition-all font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
               >
                 <span className="text-base">{chip.icon}</span>
                 {chip.title}
               </button>
             ))}
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
<div className="bg-white p-4 rounded-xl border border-vanilla-main flex flex-wrap gap-4 text-left shadow-sm justify-center">
                  <div className="flex-1 min-w-[200px] max-w-sm">
                    <label className="block text-xs font-bold text-text-cosmic mb-1">Industry</label>
                    <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)} className="w-full text-sm border border-vanilla-main rounded-lg p-2 focus:ring-brand-primary">
                      <option value="">All Industries</option>
                      <option value="IT">Technology</option>
                      <option value="Health">Healthcare</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px] max-w-sm">
                    <label className="block text-xs font-bold text-text-cosmic mb-1">Category Filter</label>
                    <select value={selectedCategoryId || ''} onChange={e => setSelectedCategoryId(e.target.value || null)} className="w-full text-sm border border-vanilla-main rounded-lg p-2 focus:ring-brand-primary">
                      <option value="">All Categories</option>
                      {resolvedCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-16">
          <div className="text-center md:text-left mb-6">
            <h3 className="text-sm font-bold font-display text-brand-secondary uppercase tracking-wider">
              Browse by Categories
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {resolvedCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                  className={`group text-left p-4 rounded-xl border transition-all duration-300 focus:outline-hidden cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'border-brand-primary bg-vanilla-main ring-1 ring-brand-primary'
                      : 'border-vanilla-main bg-white hover:border-brand-primary/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold transition-colors ${
                    isSelected ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'
                  }`}>
                    <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold secondary-text leading-tight group-hover:text-brand-primary transition-colors">
                      {cat.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div id="browse-documents-anchor" className="border-t border-vanilla-main pt-12">
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full xl:w-auto">
              <div className="flex bg-white rounded-lg p-1 border border-vanilla-main overflow-x-auto relative">
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'recently_added', label: 'Recently Added' },
                  { id: 'trending', label: 'Trending' },
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'favorites', label: 'Favorites' }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 text-xs font-bold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer relative overflow-hidden ${
                        isActive ? 'text-white' : 'text-text-light hover:text-text-cosmic hover:bg-vanilla-secondary'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="browseActiveTabBackground"
                          className="absolute inset-0 bg-brand-primary rounded-md z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {tab.id === 'favorites' && (
                          <Icons.Heart className={`h-3 w-3 ${isActive ? 'fill-current text-white' : 'text-red-500'}`} />
                        )}
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-lg p-1 border border-vanilla-main overflow-x-auto relative">
                <span className="text-[10px] font-bold text-text-light uppercase tracking-wider px-2 font-mono">Quick Category Filter:</span>
                {[
                  { id: null, label: 'All' },
                  { id: 'business', label: 'Business' },
                  { id: 'real_estate', label: 'Real Estate' },
                  { id: 'personal', label: 'Personal' },
                  { id: 'legal', label: 'Legal' },
                  { id: 'employment', label: 'Employment' },
                  { id: 'startup', label: 'Startup' }
                ].map(cat => {
                  const isActive = selectedCategoryId === cat.id;
                  return (
                    <motion.button
                      key={cat.id || 'all'}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all whitespace-nowrap border cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'text-brand-primary border-brand-primary/20'
                          : 'text-text-secondary border-transparent hover:bg-vanilla-secondary'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="categoryActiveBackground"
                          className="absolute inset-0 bg-brand-primary/10 z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
             
             {(selectedCategoryId || searchQuery || selectedIndustry) && (
               <button
                 onClick={handleResetFilters}
                 className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-primary bg-vanilla-main border border-brand-primary/20 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
               >
                 Clear Filters
                 <X className="h-3.5 w-3.5" />
               </button>
             )}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredDocuments.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white rounded-[40px] border border-vanilla-main p-8 shadow-sm"
              >
                <div className="mb-6">
                  <EmptySearchIllustration />
                </div>
                <h4 className="text-xl font-bold text-text-cosmic">No documents match your filter</h4>
                <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
                  AI Assistant couldn't find what you're looking for. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-8 px-8 py-3 text-sm font-bold text-white bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all active:scale-95"
                >
                  Reset all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredDocuments.map((doc) => {
                  const docCategoryObj = resolvedCategories.find(c => c.id === doc.category) || resolvedCategories[0] || { title: 'Legal', icon: 'Scale' };
                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="relative overflow-hidden flex flex-col justify-between bg-white rounded-2xl border border-vanilla-main p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-brand-primary/40 transition-all duration-300 group min-h-[250px] h-full"
                    >
                      <div>
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(doc.id, e)}
                          className={`absolute top-4 right-4 z-30 p-2 rounded-full border transition-all cursor-pointer ${
                            favorites.includes(doc.id)
                              ? 'bg-red-50 border-red-200 text-red-500 shadow-xs'
                              : 'bg-white border-vanilla-main text-text-light hover:text-red-500 hover:border-red-200'
                          }`}
                          title={favorites.includes(doc.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Icons.Heart className={`h-4 w-4 ${favorites.includes(doc.id) ? 'fill-current text-red-500' : ''}`} />
                        </button>

                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="p-1 rounded-md bg-vanilla-main text-brand-primary">
                            <CategoryIcon icon={docCategoryObj.icon} className="h-3.5 w-3.5 text-brand-primary" />
                          </span>
                          <span className="text-[10px] font-bold text-text-light uppercase tracking-widest font-mono">
                            <HighlightText text={docCategoryObj.title} highlight={searchQuery} />
                          </span>
                        </div>

                        <h4 className="text-base font-bold font-display text-brand-secondary tracking-tight group-hover:text-brand-primary transition-colors pr-8">
                          <HighlightText text={doc.title} highlight={searchQuery} />
                        </h4>
                        
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>

                      {/* Quick View Hover Overlay */}
                      <div className="absolute inset-0 bg-brand-secondary/5 backdrop-blur-[1.5px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20 pointer-events-none group-hover:pointer-events-auto">
                        <button
                          onClick={() => {
                            if (searchQuery) saveSearchToHistory(searchQuery);
                            onOpenDocumentDetail(doc);
                          }}
                          className="px-4 py-2.5 bg-white text-brand-secondary font-bold text-xs rounded-xl shadow-md hover:bg-brand-primary hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300 flex items-center gap-1.5 border border-vanilla-main/50 cursor-pointer"
                        >
                          <Icons.Eye className="h-4 w-4" />
                          Quick View
                        </button>
                      </div>

                      <div className="mt-auto pt-5 border-t border-vanilla-main flex items-center justify-between gap-4 relative z-10">
                        <button
                          onClick={() => {
                            if (searchQuery) saveSearchToHistory(searchQuery);
                            onOpenDocumentDetail(doc);
                          }}
                          className="text-xs font-bold text-brand-secondary hover:text-brand-primary transition-colors inline-flex items-center gap-1 focus:outline-hidden"
                        >
                          View Details
                          <CornerDownRight className="h-3.5 w-3.5 text-brand-primary" />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (searchQuery) saveSearchToHistory(searchQuery);
                            if (onStartDrafting) {
                              onStartDrafting(doc.title);
                            } else {
                              onOpenComingSoon(`Assistant: Draft ${doc.title}`);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-vanilla-main px-4 py-2 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all focus:outline-hidden cursor-pointer whitespace-nowrap border border-brand-primary/10"
                        >
                          Start Creating
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <GoogleAd slot="browse-bottom" className="mt-16" />
      </LayoutContainer>
    </section>
  );
}
