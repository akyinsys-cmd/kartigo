import React, { useState } from 'react';
import { 
  LifeBuoy, MessageSquare, BookOpen, Star, Users, 
  Search, Filter, Plus, Edit2, Trash2, CheckCircle2,
  Clock, AlertCircle
} from 'lucide-react';

interface AdminSupportManagerProps {
  viewMode: 'tickets' | 'faqs' | 'knowledge' | 'feedback' | 'staff';
}

export default function AdminSupportManager({ viewMode }: AdminSupportManagerProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'resolved'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (viewMode) {
      case 'tickets':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Support Tickets</h2>
                <p className="text-xs text-text-light mt-1">Manage customer inquiries, bug reports, and assistance requests.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-brand-primary/20 rounded-[16px] p-5 shadow-sm border-l-4 border-l-brand-primary">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Open Tickets</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">24</div>
              </div>
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Pending User</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">12</div>
              </div>
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Avg Response</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">1.5h</div>
              </div>
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Resolved (7d)</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">143</div>
              </div>
            </div>

            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-vanilla-main bg-vanilla-secondary/30 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                  <input 
                    type="text" 
                    placeholder="Search tickets by ID, email, or subject..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30"
                  />
                </div>
                <div className="flex gap-2">
                  {['open', 'pending', 'resolved'].map(status => (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-colors ${
                        activeTab === status ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-text-secondary border-vanilla-main'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="divide-y divide-vanilla-main">
                {[1, 2, 3].map((ticket) => (
                  <div key={ticket} className="p-4 hover:bg-vanilla-secondary/20 transition-colors cursor-pointer group flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-brand-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-text-light">#TK-{8493 + ticket}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">High</span>
                        </div>
                        <h4 className="text-sm font-bold text-brand-secondary mt-1">Payment failed during checkout</h4>
                        <p className="text-xs text-text-secondary mt-1">user{ticket}@example.com • Updated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex -space-x-2">
                         <div className="h-6 w-6 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-800">JD</div>
                      </div>
                      <button className="text-xs font-bold text-brand-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                        View Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">FAQ Manager</h2>
                <p className="text-xs text-text-light mt-1">Manage categories and questions in the Help Center.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> Add FAQ
              </button>
            </div>
            <div className="bg-white border border-vanilla-main rounded-[20px] p-12 text-center shadow-sm">
              <LifeBuoy className="h-12 w-12 text-vanilla-main mx-auto mb-4" />
              <h3 className="text-sm font-bold text-brand-secondary">FAQ Database Connected</h3>
              <p className="text-xs text-text-light mt-2 max-w-md mx-auto">
                The dynamic FAQ engine is ready. You can categorize questions, track view counts, and update answers instantly.
              </p>
            </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Knowledge Base</h2>
                <p className="text-xs text-text-light mt-1">Long-form articles, tutorials, and guides.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> New Article
              </button>
            </div>
             <div className="bg-white border border-vanilla-main rounded-[20px] p-12 text-center shadow-sm">
              <BookOpen className="h-12 w-12 text-vanilla-main mx-auto mb-4" />
              <h3 className="text-sm font-bold text-brand-secondary">Knowledge Base Engine</h3>
              <p className="text-xs text-text-light mt-2 max-w-md mx-auto">
                Rich text editor and markdown support available for authoring comprehensive tutorials.
              </p>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Customer Feedback & Surveys</h2>
                <p className="text-xs text-text-light mt-1">Review NPS scores, ratings, and feature requests.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white border border-vanilla-main rounded-[20px] p-6 shadow-sm">
                 <h3 className="text-sm font-bold text-brand-secondary font-display mb-4">Average Satisfaction</h3>
                 <div className="flex items-end gap-3 mb-2">
                   <span className="text-4xl font-bold text-brand-secondary">4.8</span>
                   <div className="flex items-center text-amber-400 mb-1">
                     <Star className="h-5 w-5 fill-current" />
                     <Star className="h-5 w-5 fill-current" />
                     <Star className="h-5 w-5 fill-current" />
                     <Star className="h-5 w-5 fill-current" />
                     <Star className="h-5 w-5 fill-current opacity-50" />
                   </div>
                 </div>
                 <p className="text-xs text-text-light">Based on 1,245 recent document generation surveys.</p>
               </div>
               
               <div className="bg-white border border-vanilla-main rounded-[20px] p-6 shadow-sm">
                 <h3 className="text-sm font-bold text-brand-secondary font-display mb-4">Recent Feedback</h3>
                 <div className="space-y-4">
                   <div className="border-b border-vanilla-main pb-3">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-brand-secondary">"Very easy to use!"</span>
                       <span className="text-[10px] text-text-light">Today</span>
                     </div>
                     <p className="text-[11px] text-text-secondary mt-1">The interface is super clean and the NDA generated perfectly.</p>
                   </div>
                   <div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-brand-secondary">Feature Request</span>
                       <span className="text-[10px] text-text-light">Yesterday</span>
                     </div>
                     <p className="text-[11px] text-text-secondary mt-1">Would love an integration directly to Google Drive for saves.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        );
        
      case 'staff':
        return (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Support Staff & Routing</h2>
                <p className="text-xs text-text-light mt-1">Manage agents, departments, and auto-routing rules.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> Add Agent
              </button>
            </div>
            
             <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm overflow-hidden">
               <div className="divide-y divide-vanilla-main">
                 {['Sarah Connor (Tier 1)', 'John Smith (Billing)', 'Mike Legal (Escalations)'].map((agent) => (
                    <div key={agent} className="p-4 flex items-center justify-between hover:bg-vanilla-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-vanilla-secondary rounded-full flex items-center justify-center shrink-0 border border-vanilla-main">
                          <Users className="h-5 w-5 text-brand-secondary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-brand-secondary">{agent}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="block h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-[11px] text-text-light">Online • 4 Active Tickets</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-brand-primary border border-vanilla-main px-3 py-1.5 rounded-lg hover:bg-vanilla-secondary">
                        Manage
                      </button>
                    </div>
                 ))}
               </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {renderContent()}
    </div>
  );
}
