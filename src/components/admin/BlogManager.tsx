import React, { useState } from 'react';
import { PenTool, Plus, Search, Edit2, Trash2, CheckCircle, Clock, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function BlogManager() {
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');

  const [posts] = useState([
    { id: 1, title: 'How to Write a Bulletproof NDA in 2026', category: 'Legal', status: 'published', date: '2026-07-12' },
    { id: 2, title: 'Top 5 HR Policies Every Startup Needs', category: 'HR', status: 'draft', date: '2026-07-15' },
    { id: 3, title: 'Understanding Commercial Leases', category: 'Business', status: 'scheduled', date: '2026-08-01' },
  ]);

  return (
    <div className="space-y-6">
      {activeView === 'list' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[#E5F5B8] shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
              <input 
                type="text" 
                placeholder="Search blog posts..."
                className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-2 text-sm text-[#3C1A47] placeholder:text-[#8395A7] focus:outline-hidden focus:border-[#2B9348]"
              />
            </div>
            
            <button 
              onClick={() => setActiveView('editor')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3C1A47] text-white rounded-xl hover:bg-[#2C1335] transition-colors text-sm font-bold shadow-md"
            >
              <Plus className="h-4 w-4" />
              New Article
            </button>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5F5B8]">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-[#F1FEC8]/20 transition-colors group">
                      <td className="p-4 font-bold text-[#3C1A47] text-sm">{post.title}</td>
                      <td className="p-4 text-sm text-[#8395A7]">{post.category}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          post.status === 'published' ? 'bg-[#2B9348]/10 text-[#2B9348]' :
                          post.status === 'draft' ? 'bg-amber-50 text-amber-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {post.status === 'published' && <CheckCircle className="h-3 w-3" />}
                          {post.status === 'scheduled' && <Clock className="h-3 w-3" />}
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono text-[#8395A7]">{post.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setActiveView('editor')} className="p-1.5 text-[#8395A7] hover:text-[#3C1A47] hover:bg-[#F1FEC8] rounded-md transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-[#8395A7] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveView('list')}
              className="text-[#8395A7] hover:text-[#3C1A47] text-sm font-bold transition-colors"
            >
              &larr; Back to Articles
            </button>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-[#E5F5B8] text-[#3C1A47] bg-white hover:bg-[#F1FEC8]/30 rounded-xl text-sm font-bold transition-colors">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md transition-colors">
                Publish Article
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Article Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter article title..."
                    className="w-full mt-1.5 text-xl font-bold bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono mb-1.5 block">Content Editor</label>
                  <div className="border border-[#E5F5B8] rounded-xl overflow-hidden bg-white">
                    <div className="bg-[#F1FEC8]/30 border-b border-[#E5F5B8] p-2 flex gap-2 overflow-x-auto custom-scrollbar">
                       {/* Toolbar mock */}
                       {['B', 'I', 'U', 'H1', 'H2', 'Link', 'Image', 'Code'].map(tool => (
                         <button key={tool} className="px-2 py-1 text-sm font-bold text-[#3C1A47] hover:bg-[#E5F5B8] rounded-md">
                           {tool}
                         </button>
                       ))}
                    </div>
                    <textarea 
                      rows={15}
                      className="w-full p-4 text-sm text-[#3C1A47] focus:outline-hidden resize-y"
                      placeholder="Write your content here... (Rich text editor placeholder)"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#3C1A47] to-[#2C1335] p-6 rounded-[24px] shadow-sm text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#F1FEC8]" />
                  <h3 className="font-bold font-display">AI Content Preparation</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">Generate articles, improve SEO, or rewrite existing content using AI.</p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">Suggest Title</button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">Generate Outline</button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">Improve SEO</button>
                  <button className="px-4 py-2 bg-[#F1FEC8] text-[#3C1A47] hover:bg-[#E5F5B8] rounded-xl text-xs font-bold transition-colors ml-auto">
                    Generate Full Article
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4">
                <h3 className="font-bold text-[#3C1A47] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#8395A7]" /> Publish Settings
                </h3>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Status</label>
                  <select className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden">
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Category</label>
                  <select className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden">
                    <option>Legal</option>
                    <option>HR</option>
                    <option>Business</option>
                    <option>Startup</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm space-y-4">
                <h3 className="font-bold text-[#3C1A47]">SEO Settings</h3>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Meta Title</label>
                  <input type="text" className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Meta Description</label>
                  <textarea rows={3} className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">SEO URL Slug</label>
                  <input type="text" placeholder="e.g. how-to-write-nda" className="w-full mt-1.5 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-3 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
