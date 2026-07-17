import React from 'react';
import { Calendar, User, ArrowLeft, Tag, Share2, Search, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import Breadcrumbs from './Breadcrumbs';

interface BlogPostViewProps {
  slug: string;
  onBack: () => void;
  onNavigateDocument: (docId: string) => void;
}

export default function BlogPostView({ slug, onBack, onNavigateDocument }: BlogPostViewProps) {
  // Mock data for the post based on slug
  const post = {
    title: slug.includes('nda') ? 'How to Write a Bulletproof NDA in 2026' : 'Understanding Commercial Leases: A Beginner’s Guide',
    category: slug.includes('nda') ? 'Legal' : 'Business',
    date: 'Jul 12, 2026',
    author: 'Legal Team',
    image: slug.includes('nda') ? 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200' : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>A Non-Disclosure Agreement (NDA) is one of the most common and vital legal documents in business. Whether you are hiring a new employee, engaging a contractor, or discussing a potential partnership, protecting your confidential information is paramount.</p>
      
      <h3>1. Identify the Parties Clearly</h3>
      <p>The first step in any robust NDA is to accurately and clearly identify who is disclosing the information (the Disclosing Party) and who is receiving it (the Receiving Party). Be sure to use full legal names and entity types.</p>
      
      <h3>2. Define "Confidential Information"</h3>
      <p>A vague definition is a weak definition. While it's tempting to categorize everything as confidential, courts often strike down overly broad NDAs. Specify the categories of information being protected (e.g., trade secrets, financial models, customer lists, proprietary algorithms).</p>
      
      <h3>3. Establish the Term</h3>
      <p>How long does the obligation of confidentiality last? Standard NDAs typically enforce confidentiality for 2 to 5 years. However, if trade secrets are involved, the obligation should last indefinitely, or as long as the information remains a trade secret under applicable law.</p>
      
      <div class="ad-slot my-8 p-4 bg-vanilla-main/30 border border-vanilla-main rounded-xl flex flex-col items-center justify-center min-h-[100px]">
         <span class="text-[10px] text-text-light uppercase tracking-wider font-mono mb-2">Advertisement</span>
         <div class="text-sm font-bold text-brand-secondary/50">Google AdSense Space</div>
      </div>

      <h3>4. Exceptions to Confidentiality</h3>
      <p>Every enforceable NDA must include standard exceptions. Information that is already public, independently developed by the receiving party, or lawfully obtained from a third party cannot be protected under the agreement.</p>
      
      <h3>5. The Consequences of Breach</h3>
      <p>Clearly state the remedies available if the agreement is breached. Injunctive relief (a court order stopping the party from sharing the information) is typically the most critical remedy, alongside monetary damages.</p>
    `,
    relatedDocs: [
      { id: '1', title: 'Non-Disclosure Agreement (NDA)', icon: FileText },
      { id: '2', title: 'Employment Contract', icon: User },
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="bg-vanilla-secondary pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-b border-vanilla-main/50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Breadcrumbs 
              onBackHome={onBack}
              items={[
                { label: 'Blog', onClick: onBack },
                { label: post.title, isActive: true }
              ]} 
            />
          </div>
          
          <div className="flex items-center gap-3 mb-6">
             <span className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
               {post.category}
             </span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold font-display text-text-cosmic leading-tight mb-8">
            {post.title}
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-6 text-sm text-text-light font-mono">
             <div className="flex items-center gap-2">
               <div className="h-8 w-8 bg-white border border-vanilla-main rounded-full flex items-center justify-center text-brand-primary">
                 <User className="h-4 w-4" />
               </div>
               <span className="font-bold text-text-cosmic">{post.author}</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Calendar className="h-4 w-4" /> {post.date}
             </div>
             <div className="flex items-center gap-1.5 ml-auto">
               <button className="p-2 hover:bg-white rounded-full transition-colors" title="Share Article">
                 <Share2 className="h-4 w-4" />
               </button>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-12 h-[300px] md:h-[400px]">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 pb-24">
          <div className="flex-1">
            <div 
              className="prose prose-lg prose-headings:font-display prose-headings:text-text-cosmic prose-p:text-text-light prose-a:text-brand-primary max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-vanilla-main/50 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-text-cosmic mr-2 flex items-center gap-1"><Tag className="h-4 w-4 text-text-light"/> Tags:</span>
              {['Legal', 'Startup', 'Contracts', 'Confidentiality'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-vanilla-secondary text-text-light rounded-lg text-xs font-mono font-bold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-8">
            {/* Search */}
            <div className="bg-vanilla-secondary p-6 rounded-3xl border border-vanilla-main/50">
              <h3 className="font-bold font-display text-text-cosmic mb-4">Search Blog</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                <input type="text" placeholder="Search..." className="w-full bg-white border border-vanilla-main rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-brand-primary" />
              </div>
            </div>

            {/* Related Documents CTA */}
            <div className="bg-gradient-to-br from-[#3C1A47] to-[#2C1335] p-6 rounded-3xl shadow-lg text-white">
              <h3 className="font-bold font-display text-xl mb-2">Need a document?</h3>
              <p className="text-sm text-white/70 mb-6">Create legally binding documents instantly with our AI Assistant.</p>
              
              <div className="space-y-3">
                {post.relatedDocs.map(doc => (
                  <button 
                    key={doc.id}
                    onClick={() => onNavigateDocument(doc.id)}
                    className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <doc.icon className="h-4 w-4 text-[#F1FEC8]" />
                      <span className="text-sm font-bold">{doc.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Ad Slot Sidebar */}
            <div className="p-4 bg-vanilla-main/30 border border-vanilla-main rounded-3xl flex flex-col items-center justify-center min-h-[250px]">
               <span className="text-[10px] text-text-light uppercase tracking-wider font-mono mb-2">Advertisement</span>
               <div className="text-sm font-bold text-brand-secondary/50">Sidebar Ad Slot</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
