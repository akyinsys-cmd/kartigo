import React from 'react';
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react';

interface BlogSectionProps {
  onOpenComingSoon: (featureName: string) => void;
  onNavigateToBlog: () => void;
  onReadArticle: (slug: string) => void;
}

export default function BlogSection({ onOpenComingSoon, onNavigateToBlog, onReadArticle }: BlogSectionProps) {
  const posts = [
    {
      id: 'post-1',
      title: 'Drafting Commercial NDAs: Key Mistakes to Avoid in 2026',
      excerpt: 'Learn the critical pitfalls founders face when drafting proprietary agreements, and why specifying precise exclusions is essential to preserve IP protection.',
      readTime: '4 min read',
      tag: 'Legal Insights',
      date: 'July 10, 2026'
    },
    {
      id: 'post-2',
      title: 'Standardizing Offer Letters and Appointment Contracts',
      excerpt: 'A compliance handbook for scaling tech startups on drafting airtight employment offer documents that minimize labor and regulatory liabilities.',
      readTime: '6 min read',
      tag: 'HR Best Practices',
      date: 'June 28, 2026'
    },
    {
      id: 'post-3',
      title: 'Structuring Tenancy Terms and Lease Security Deposits',
      excerpt: 'A comprehensive financial and legal breakdown of how landlords and tenants can draft fair, mutually beneficial commercial or residential rent agreements.',
      readTime: '5 min read',
      tag: 'Real Estate',
      date: 'May 14, 2026'
    }
  ];

  return (
    <section id="blog-section" className="py-20 bg-vanilla-secondary border-b border-vanilla-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-16">
          <div className="text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary font-mono bg-vanilla-main px-3.5 py-1.5 rounded-full border border-brand-primary/10">
              Expert Resources
            </span>
            <h2 className="text-3xl font-bold font-display tracking-tight text-brand-secondary sm:text-4xl mt-4">
              Kartigo Legal & HR Blog
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-md">
              Vetted commentary, guides, and compliance walk-throughs written by industry professionals.
            </p>
          </div>

          <button
            id="read-all-posts-btn"
            onClick={onNavigateToBlog}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-primary bg-white border border-brand-primary/20 rounded-xl px-4.5 py-2.5 hover:bg-vanilla-main transition-colors focus:outline-hidden cursor-pointer"
          >
            Read All Articles
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Blog Posts Grid */}
        <div id="blog-posts-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              id={post.id}
              key={post.id}
              onClick={() => onReadArticle('bulletproof-nda-2026')}
              className="bg-white rounded-[20px] border border-vanilla-main p-6 card-shadow hover:border-brand-primary/40 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center text-[10px] font-bold text-brand-primary bg-vanilla-main px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    {post.tag}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] text-text-light font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold font-display text-brand-secondary tracking-tight group-hover:text-brand-primary transition-colors leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-vanilla-main flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-light font-mono">
                  {post.date}
                </span>
                
                <span className="text-xs font-bold text-brand-secondary group-hover:text-brand-primary transition-colors inline-flex items-center gap-1">
                  Read Article
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
