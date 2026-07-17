import React, { useState } from 'react';
import { Settings, Key, Link2, Zap, Cloud, Cpu, FileText, ChevronRight, Activity, Plus, Shield, Search, Copy, CheckCircle, Clock } from 'lucide-react';

interface AdminIntegrationManagerProps {
  activeTab?: string;
}

export default function AdminIntegrationManager({ activeTab: initialTab = 'api' }: AdminIntegrationManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Platform & Integrations</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage API, webhooks, third-party integrations, and automated workflows.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'api', label: 'API Configuration', icon: Key },
          { id: 'providers', label: 'Core Providers', icon: Cloud },
          { id: 'integrations', label: 'App Integrations', icon: Link2 },
          { id: 'automation', label: 'Automation Engine', icon: Zap },
          { id: 'queues', label: 'Queues & Events', icon: Activity },
          { id: 'docs', label: 'Developer Portal', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#2B9348] text-white border-[#2B9348]'
                : 'bg-white text-[#8395A7] border-[#E5F5B8] hover:border-[#2B9348]/30 hover:text-[#2B9348]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold font-display text-[#3C1A47]">API Rate Limits</h3>
                    <button className="text-[#2B9348] font-bold text-xs hover:underline">Edit Limits</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                      <div className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider mb-2">Guest Tier</div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-[#3C1A47]">100</span>
                        <span className="text-xs text-[#8395A7] mb-1">req / hour</span>
                      </div>
                    </div>
                    <div className="p-4 border border-[#E5F5B8] rounded-xl bg-[#F1FEC8]/30">
                      <div className="text-[10px] font-bold text-[#2B9348] uppercase tracking-wider mb-2">Registered Tier</div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-[#3C1A47]">1,000</span>
                        <span className="text-xs text-[#8395A7] mb-1">req / hour</span>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-display text-[#3C1A47]">Active Webhooks</h3>
                  <button className="flex items-center gap-2 bg-[#3C1A47] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#2C1335] transition-colors">
                    <Plus className="h-3 w-3" /> New Endpoint
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 border border-[#E5F5B8] rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47] flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        CRM Sync (Production)
                      </div>
                      <div className="text-xs text-[#8395A7] font-mono mt-1">https://api.internal-crm.com/v1/webhooks/kartigo</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#3C1A47]">2.4k calls</div>
                      <div className="text-[10px] text-green-600 font-bold mt-0.5">99.9% Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Platform Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Strict OAuth Validation</div>
                      <div className="text-xs text-[#8395A7]">Require state parameter</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Require Signatures</div>
                      <div className="text-xs text-[#8395A7]">For outgoing webhooks</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Email Delivery', icon: Cloud, active: 'Resend', fallback: 'Amazon SES', status: 'Healthy' },
             { title: 'File Storage', icon: Cloud, active: 'Google Cloud Storage', fallback: 'AWS S3', status: 'Healthy' },
             { title: 'Payment Gateway', icon: Cloud, active: 'Razorpay (India)', fallback: 'Stripe', status: 'Healthy' },
             { title: 'AI Model Engine', icon: Cpu, active: 'Internal Provider Manager', fallback: 'Automated Failover', status: 'Healthy' },
           ].map((provider, i) => (
             <div key={i} className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#2B9348]"></div>
               <div className="flex justify-between items-start mb-4">
                 <div className="h-10 w-10 rounded-xl bg-[#F1FEC8]/50 text-[#2B9348] flex items-center justify-center">
                   <provider.icon className="h-5 w-5" />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                   <CheckCircle className="h-3 w-3" /> {provider.status}
                 </span>
               </div>
               <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">{provider.title}</h3>
               
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between border-b border-[#E5F5B8] pb-2">
                   <span className="text-[#8395A7] font-bold text-xs">Primary</span>
                   <span className="text-[#3C1A47] font-bold text-xs">{provider.active}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-[#8395A7] font-bold text-xs">Fallback</span>
                   <span className="text-[#3C1A47] text-xs">{provider.fallback}</span>
                 </div>
               </div>
               
               <button className="w-full mt-6 bg-[#F1FEC8]/30 hover:bg-[#F1FEC8]/60 text-[#3C1A47] text-xs font-bold py-2 rounded-xl border border-[#E5F5B8] transition-colors">
                 Configure Provider
               </button>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display text-[#3C1A47]">Marketplace Integrations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
              <input type="text" placeholder="Search apps..." className="bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden w-64" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Google Drive', 'Slack', 'Zapier', 'Notion', 'Microsoft Teams', 'Dropbox', 'Asana'].map((app, i) => (
              <div key={i} className="border border-[#E5F5B8] rounded-xl p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Link2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-sm font-bold text-[#3C1A47] mb-1">{app}</div>
                <div className="text-[10px] text-[#8395A7] font-bold uppercase tracking-wider mb-4">Ready to Connect</div>
                <button className="text-xs font-bold text-[#2B9348] bg-[#F1FEC8]/30 px-3 py-1.5 rounded-lg w-full">Enable</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="text-lg font-bold font-display text-[#3C1A47]">Workflow Automation</h3>
               <p className="text-xs text-[#8395A7]">Build rules triggered by events.</p>
             </div>
             <button className="flex items-center gap-2 bg-[#3C1A47] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2C1335] transition-colors shadow-md">
                <Plus className="h-4 w-4" /> Create Workflow
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white border border-[#E5F5B8] rounded-2xl p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="font-bold text-[#3C1A47]">Enterprise Payment Alert</h4>
                   <p className="text-xs text-[#8395A7]">Triggered on successful Enterprise plan purchase</p>
                 </div>
                 <span className="h-2 w-2 rounded-full bg-green-500"></span>
               </div>
               
               <div className="bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl p-4 space-y-3 mb-4">
                 <div className="flex items-center gap-3 text-sm">
                   <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">1</div>
                   <span className="font-bold text-[#3C1A47]">Trigger:</span>
                   <span className="text-[#8395A7]">payment.success</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                   <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">2</div>
                   <span className="font-bold text-[#3C1A47]">Condition:</span>
                   <span className="text-[#8395A7]">plan === 'enterprise'</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                   <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">3</div>
                   <span className="font-bold text-[#3C1A47]">Action:</span>
                   <span className="text-[#8395A7]">Send Slack Message</span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center">
                 <span className="text-xs text-[#8395A7] font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> Last run 2h ago</span>
                 <button className="text-xs font-bold text-[#2B9348] hover:underline">Edit Workflow</button>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'queues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Document Generation', pending: 12, processed: '14.2k' },
              { name: 'Email Delivery', pending: 0, processed: '45.1k' },
              { name: 'Webhook Delivery', pending: 5, processed: '8.4k' },
              { name: 'Dead Letter Queue', pending: 3, processed: '-', isError: true },
            ].map((q, i) => (
              <div key={i} className={`bg-white rounded-xl p-4 border ${q.isError ? 'border-red-200' : 'border-[#E5F5B8]'} shadow-sm`}>
                <h4 className="text-xs font-bold text-[#8395A7] uppercase tracking-wider mb-2">{q.name}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-[#8395A7] mb-0.5">Pending</div>
                    <div className={`text-xl font-bold ${q.isError && q.pending > 0 ? 'text-red-500' : 'text-[#3C1A47]'}`}>{q.pending}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#8395A7] mb-0.5">Processed 24h</div>
                    <div className="text-sm font-bold text-[#3C1A47]">{q.processed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Event Stream (Live)</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex gap-4 p-2 bg-[#F1FEC8]/30 rounded-lg text-[#3C1A47]">
                <span className="text-[#8395A7]">14:32:01</span>
                <span className="font-bold text-green-600">[SUCCESS]</span>
                <span>document.created</span>
                <span className="text-[#8395A7] ml-auto">req_8923a1</span>
              </div>
              <div className="flex gap-4 p-2 bg-vanilla-secondary/30 rounded-lg text-[#3C1A47]">
                <span className="text-[#8395A7]">14:31:45</span>
                <span className="font-bold text-blue-600">[INFO]</span>
                <span>user.login</span>
                <span className="text-[#8395A7] ml-auto">usr_b729x1</span>
              </div>
              <div className="flex gap-4 p-2 bg-red-50 rounded-lg text-[#3C1A47]">
                <span className="text-[#8395A7]">14:30:12</span>
                <span className="font-bold text-red-600">[FAILED]</span>
                <span>webhook.delivery</span>
                <span className="text-[#8395A7] ml-auto">retry_1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-[#F1FEC8] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2B9348]">
               <FileText className="h-8 w-8" />
             </div>
             <h3 className="text-xl font-bold font-display text-[#3C1A47] mb-2">Developer Portal Manager</h3>
             <p className="text-sm text-[#8395A7] max-w-md mx-auto mb-6">Customize the public-facing API documentation, interactive examples, and SDK generation tools.</p>
             <button className="bg-[#3C1A47] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2C1335] transition-colors shadow-md">
               Launch Documentation Editor
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
