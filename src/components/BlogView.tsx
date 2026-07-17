import React, { useState } from 'react';
import { Search, Tag, Calendar, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import Breadcrumbs from './Breadcrumbs';

interface BlogViewProps {
  onReadPost: (slug: string) => void;
  onNavigateHome: () => void;
}

const CATEGORIES = ['All', 'Legal', 'HR', 'Business', 'Startup', 'Technology'];

const BLOG_POSTS = [
  { slug: 'bulletproof-nda-2026', title: 'How to Write a Bulletproof NDA in 2026', category: 'Legal', date: 'Jul 12, 2026', author: 'Legal Team', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800' },
  { slug: 'hr-policies-startup', title: 'Top 5 HR Policies Every Startup Needs', category: 'HR', date: 'Jul 10, 2026', author: 'HR Dept', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800' },
  { slug: 'understanding-commercial-leases', title: 'Understanding Commercial Leases: A Beginner’s Guide', category: 'Business', date: 'Jul 08, 2026', author: 'Business Desk', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
  { slug: 'protect-ip-early-stage', title: 'Protecting Your Intellectual Property at Early Stage', category: 'Startup', date: 'Jul 05, 2026', author: 'Legal Team', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800' },
];

export default function BlogView({ onReadPost, onNavigateHome }: BlogViewProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = BLOG_POSTS.filter(post => 
    (activeCategory === 'All' || post.category === activeCategory) &&
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-vanilla-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="mb-4 pt-8">
          <Breadcrumbs 
            onBackHome={onNavigateHome}
            items={[{ label: 'Blog', isActive: true }]} 
          />
        </div>
        {/* Header section */}
        <div className="text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 bg-vanilla-main/50 rounded-full border border-brand-primary/10 mb-4">
             <span className="text-sm font-bold text-brand-primary uppercase tracking-wider font-mono">Kartigo Insights</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl md:text-5xl font-extrabold font-display text-text-cosmic tracking-tight">
            Latest in Legal, HR, & Business
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-text-light max-w-2xl mx-auto">
            Practical guides, templates advice, and professional insights to help you build and protect your business.
          </motion.p>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-vanilla-main/50">
          <div className="w-full md:w-auto overflow-x-auto custom-scrollbar flex gap-2 pb-2 md:pb-0">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                  activeCategory === cat ? 'bg-brand-primary text-white' : 'bg-vanilla-secondary text-text-light hover:bg-vanilla-main hover:text-text-cosmic'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
            <input 
              type="text" 
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vanilla-secondary border-none rounded-2xl pl-10 pr-4 py-3 text-sm text-text-cosmic placeholder:text-text-light focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 transition-shadow"
            />
          </div>
        </div>

        {/* Featured Post (if All and no search) */}
        {activeCategory === 'All' && !searchQuery && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] overflow-hidden border border-vanilla-main/50 shadow-md group cursor-pointer" onClick={() => onReadPost(BLOG_POSTS[0].slug)}>
            <div className="grid grid-cols-1 md:grid-cols-2">
               <div className="h-64 md:h-auto overflow-hidden">
                 <img src={BLOG_POSTS[0].image} alt={BLOG_POSTS[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               </div>
               <div className="p-8 md:p-12 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{BLOG_POSTS[0].category}</span>
                   <span className="flex items-center gap-1.5 text-xs text-text-light font-mono"><Calendar className="h-3.5 w-3.5" /> {BLOG_POSTS[0].date}</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-bold font-display text-text-cosmic leading-tight mb-4 group-hover:text-brand-primary transition-colors">
                   {BLOG_POSTS[0].title}
                 </h2>
                 <p className="text-text-light mb-8 line-clamp-3">
                   Discover the key elements that make a non-disclosure agreement legally sound and protective of your business's most valuable trade secrets and proprietary information.
                 </p>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-vanilla-main rounded-full flex items-center justify-center text-brand-primary"><User className="h-5 w-5" /></div>
                    <div className="text-sm font-bold text-text-cosmic">{BLOG_POSTS[0].author}</div>
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, idx) => {
            if (activeCategory === 'All' && !searchQuery && idx === 0) return null; // Skip featured if showing featured
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={post.slug} 
                className="bg-white rounded-3xl overflow-hidden border border-vanilla-main/50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                onClick={() => onReadPost(post.slug)}
              >
                <div className="h-48 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{post.category}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-text-cosmic leading-tight mb-3 group-hover:text-brand-primary transition-colors flex-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-vanilla-main/50 text-xs text-text-light font-mono">
                     <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                     <span className="flex items-center gap-1 group-hover:text-brand-primary font-bold">Read <ChevronRight className="h-3 w-3" /></span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <Tag className="h-12 w-12 text-vanilla-main mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-cosmic mb-2">No articles found</h3>
            <p className="text-text-light">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
