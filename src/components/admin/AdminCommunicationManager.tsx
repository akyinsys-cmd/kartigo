import React, { useState } from 'react';
import { Mail, Download, Bell, Megaphone, Send, Filter, Search, Plus, Edit2, Trash2, Globe, Users, Clock, CheckCircle } from 'lucide-react';

interface AdminCommunicationManagerProps {
  viewMode: 'emails' | 'push' | 'announcements' | 'newsletter';
}

export default function AdminCommunicationManager({ viewMode }: AdminCommunicationManagerProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'drafts' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (viewMode) {
      case 'emails':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Email Templates</h2>
                <p className="text-xs text-text-light mt-1">Manage transactional and marketing email templates.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> New Template
              </button>
            </div>

            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-vanilla-main bg-vanilla-secondary/30 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light" />
                  <input 
                    type="text" 
                    placeholder="Search templates..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-vanilla-main rounded-xl text-xs focus:outline-hidden focus:border-brand-primary/30"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-vanilla-main">
                {['Welcome Email', 'Password Reset', 'Document Ready', 'Payment Success', 'Invoice'].map((template) => (
                  <div key={template} className="p-4 flex items-center justify-between hover:bg-vanilla-secondary/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-secondary">{template}</h4>
                        <p className="text-[11px] text-text-light mt-0.5">Transactional • Last updated 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-secondary hover:text-brand-primary bg-white border border-vanilla-main rounded-lg shadow-xs"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button className="p-2 text-text-secondary hover:text-red-600 bg-white border border-vanilla-main rounded-lg shadow-xs"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'push':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Push Notifications</h2>
                <p className="text-xs text-text-light mt-1">Configure real-time app notifications for specific user segments.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Send className="h-4 w-4" /> Send Notification
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6 text-center text-text-light">
                <Bell className="h-12 w-12 text-vanilla-main mx-auto mb-4" />
                <h3 className="text-sm font-bold text-brand-secondary mb-1">No Active Campaigns</h3>
                <p className="text-xs">Create a new push notification to engage your users.</p>
              </div>
              
              <div className="bg-vanilla-secondary/50 border border-vanilla-main rounded-[20px] p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2 font-mono">Targeting Criteria</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Globe className="h-4 w-4 text-brand-primary" /> Target by State/District/City
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Users className="h-4 w-4 text-brand-primary" /> Target by User Segment
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Clock className="h-4 w-4 text-brand-primary" /> Scheduled Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Global Announcements</h2>
                <p className="text-xs text-text-light mt-1">Manage banners and platform-wide alerts.</p>
              </div>
              <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> New Announcement
              </button>
            </div>

            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6">
               <div className="border border-brand-primary/20 bg-brand-primary/5 rounded-xl p-4 flex items-start gap-4">
                 <div className="mt-0.5">
                   <Megaphone className="h-5 w-5 text-brand-primary" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-brand-secondary">System Maintenance Scheduled</h4>
                   <p className="text-xs text-text-secondary mt-1">Scheduled for upcoming weekend. Displaying to all active users.</p>
                   <div className="mt-3 flex items-center gap-3">
                     <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Status: Active</span>
                     <span className="text-[10px] font-bold text-text-light">Expires in 2 days</span>
                   </div>
                 </div>
                 <div className="ml-auto">
                   <button className="text-xs font-bold text-brand-primary hover:underline">Edit</button>
                 </div>
               </div>
            </div>
          </div>
        );
             case 'newsletter':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-brand-secondary font-display">Newsletter Management</h2>
                <p className="text-xs text-text-light mt-1">Manage subscribers, double opt-in rules, and export lists.</p>
              </div>
              <button className="flex items-center gap-2 bg-white border border-vanilla-main text-brand-secondary px-4 py-2 rounded-xl text-xs font-bold hover:bg-vanilla-secondary transition-colors shadow-xs">
                <Download className="h-4 w-4" /> Export Subscribers
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Total Subscribers</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">12,458</div>
                <div className="text-green-600 text-[10px] font-bold mt-1 flex items-center gap-1">
                  <span className="text-green-500">↑</span> +142 this week
                </div>
              </div>
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Avg Open Rate</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">34.2%</div>
              </div>
              <div className="bg-white border border-vanilla-main rounded-[16px] p-5 shadow-sm">
                <span className="text-text-light text-xs font-bold uppercase tracking-wider">Unsubscribe Rate</span>
                <div className="text-2xl font-bold font-display text-brand-secondary mt-2">1.1%</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6">
                <h3 className="text-sm font-bold text-brand-secondary mb-4">Subscription Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-vanilla-main rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-brand-secondary">Double Opt-In</div>
                      <div className="text-xs text-text-light">Require email verification for new subscribers</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-primary transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-vanilla-main rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-brand-secondary">Email Preferences</div>
                      <div className="text-xs text-text-light">Allow users to choose topics (Offers, Updates, etc.)</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-primary transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-6 flex flex-col justify-center items-center text-center">
                <Mail className="h-10 w-10 text-vanilla-main mb-3" />
                <h3 className="text-sm font-bold text-brand-secondary mb-2">Email Campaign Architecture</h3>
                <p className="text-xs text-text-light mb-4">
                  Ready for future integration with email providers (e.g., SendGrid, Mailchimp) for newsletters, offers, and announcements.
                </p>
                <button className="px-4 py-2 bg-vanilla-secondary text-brand-secondary border border-vanilla-main rounded-xl text-xs font-bold">
                  Configure SMTP Provider
                </button>
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
