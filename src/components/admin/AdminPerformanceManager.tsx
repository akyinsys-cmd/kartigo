import React, { useState } from 'react';
import { Cloud, Activity, Cpu, Server, Database, HardDrive, Zap, RefreshCw, Layers, Shield, FileText, CheckCircle, AlertTriangle, Settings, Search, Trash2 } from 'lucide-react';

interface AdminPerformanceManagerProps {
  activeTab?: string;
}

export default function AdminPerformanceManager({ activeTab: initialTab = 'dashboard' }: AdminPerformanceManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Performance & Infrastructure</h2>
          <p className="text-xs text-[#8395A7] mt-1">Monitor system health, optimize caches, manage queues, and scale resources.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'dashboard', label: 'Performance Dashboard', icon: Activity },
          { id: 'health', label: 'Health Monitor', icon: CheckCircle },
          { id: 'cache', label: 'Cache & CDN', icon: Zap },
          { id: 'storage', label: 'Storage & DB', icon: Database },
          { id: 'queues', label: 'Background Queues', icon: Layers },
          { id: 'logs', label: 'System Logs', icon: FileText },
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

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { label: 'Global Uptime', value: '99.99%', sub: 'Last 30 days', status: 'optimal' },
               { label: 'Avg Latency (TTFB)', value: '42ms', sub: '-12ms from last week', status: 'optimal' },
               { label: 'API Error Rate', value: '0.01%', sub: 'Well below 1% threshold', status: 'optimal' },
               { label: 'Active Users', value: '1,429', sub: 'Real-time connections', status: 'neutral' },
             ].map((stat, i) => (
               <div key={i} className="bg-white rounded-xl p-4 border border-[#E5F5B8] shadow-sm">
                 <h4 className="text-xs font-bold text-[#8395A7] uppercase tracking-wider mb-2">{stat.label}</h4>
                 <div className="text-2xl font-bold text-[#3C1A47] mb-1">{stat.value}</div>
                 <div className={`text-[10px] font-bold ${stat.status === 'optimal' ? 'text-[#2B9348]' : 'text-[#8395A7]'}`}>
                   {stat.sub}
                 </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Core Web Vitals</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Largest Contentful Paint (LCP)</span>
                    <span className="font-bold text-[#2B9348]">1.2s (Excellent)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2B9348] w-[85%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Interaction to Next Paint (INP)</span>
                    <span className="font-bold text-[#2B9348]">45ms (Excellent)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2B9348] w-[92%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Cumulative Layout Shift (CLS)</span>
                    <span className="font-bold text-[#2B9348]">0.01 (Excellent)</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2B9348] w-[95%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Resource Utilization</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Server CPU</span>
                    <span className="font-bold text-[#3C1A47]">18%</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3C1A47] w-[18%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Memory Usage</span>
                    <span className="font-bold text-[#3C1A47]">42%</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3C1A47] w-[42%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Database Connections</span>
                    <span className="font-bold text-amber-500">65%</span>
                  </div>
                  <div className="h-2 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-[#3C1A47]">System Health Monitor</h3>
              <p className="text-xs text-[#8395A7]">Live status of all microservices and external providers.</p>
            </div>
            <button className="flex items-center gap-2 bg-[#F1FEC8]/30 text-[#2B9348] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E5F5B8] hover:bg-[#F1FEC8]/50 transition-colors">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Frontend Application', type: 'Core Service', status: 'Operational', latency: '42ms' },
              { name: 'Document API', type: 'Core Service', status: 'Operational', latency: '120ms' },
              { name: 'Firestore Database', type: 'Infrastructure', status: 'Operational', latency: '8ms' },
              { name: 'Redis Cache', type: 'Infrastructure', status: 'Operational', latency: '2ms' },
              { name: 'AI Models (Primary)', type: 'Provider', status: 'Operational', latency: '850ms' },
              { name: 'Cloud Storage', type: 'Provider', status: 'Operational', latency: '45ms' },
              { name: 'Payment Gateway', type: 'Provider', status: 'Operational', latency: '320ms' },
              { name: 'Email Delivery (Resend)', type: 'Provider', status: 'Operational', latency: '150ms' },
              { name: 'Background Workers', type: 'Queue', status: 'Operational', latency: 'N/A' },
            ].map((service, i) => (
              <div key={i} className="border border-[#E5F5B8] rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-[#3C1A47] text-sm">{service.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8395A7]">{service.type}</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#2B9348]"></span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2B9348] flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {service.status}
                  </span>
                  <span className="font-mono text-[#8395A7]">{service.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cache' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Cache Manager</h3>
              
              <div className="space-y-4">
                {[
                  { name: 'API Response Cache', description: 'Caches GET requests for public endpoints.', size: '42.5 MB', items: '12,450' },
                  { name: 'Document Template Cache', description: 'Pre-rendered document structures.', size: '18.2 MB', items: '145' },
                  { name: 'Database Query Cache', description: 'Frequent database lookups (Redis).', size: '124 MB', items: '84,200' },
                  { name: 'Static Asset CDN Edge', description: 'Images, JS, CSS served from edge.', size: '845 MB', items: '2,400' },
                ].map((cache, i) => (
                  <div key={i} className="p-4 border border-[#E5F5B8] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-[#3C1A47] text-sm">{cache.name}</h4>
                      <p className="text-xs text-[#8395A7] mt-1">{cache.description}</p>
                      <div className="flex gap-4 mt-2 text-[10px] font-mono text-[#8395A7]">
                        <span>Size: {cache.size}</span>
                        <span>Items: {cache.items}</span>
                      </div>
                    </div>
                    <button className="whitespace-nowrap px-3 py-1.5 bg-[#F1FEC8]/30 hover:bg-[#F1FEC8]/60 text-[#3C1A47] text-xs font-bold rounded-lg border border-[#E5F5B8] transition-colors">
                      Purge Cache
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">CDN Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-[#2B9348]" />
                    <span className="font-bold text-sm text-[#3C1A47]">Cloudflare Edge</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">ACTIVE</span>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#3C1A47]">Aggressive Caching</span>
                    <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2B9348]">
                      <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#3C1A47]">Auto Minify JS/CSS</span>
                    <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2B9348]">
                      <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#3C1A47]">Brotli Compression</span>
                    <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2B9348]">
                      <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-display text-[#3C1A47]">Database Optimization</h3>
                  <button className="text-xs font-bold text-[#2B9348] hover:underline">Run Maintenance</button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-vanilla-secondary/30 rounded-xl border border-[#E5F5B8]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-[#3C1A47]">Table Size (PostgreSQL)</span>
                      <span className="text-xs text-[#8395A7]">1.2 GB Total</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8395A7]">document_drafts</span>
                        <span className="font-mono">450 MB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8395A7]">event_logs</span>
                        <span className="font-mono">320 MB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8395A7]">users</span>
                        <span className="font-mono">15 MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border border-[#E5F5B8] rounded-xl text-xs">
                    <span className="font-bold text-[#3C1A47]">Auto-archive logs older than 30 days</span>
                    <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2B9348]">
                      <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-5" />
                    </button>
                  </div>
                </div>
             </div>

             <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold font-display text-[#3C1A47]">Blob Storage</h3>
                  <button className="text-xs font-bold text-[#3C1A47] hover:underline flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Clean Unused
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#8395A7]">Storage Used (S3)</span>
                    <span className="font-bold text-[#3C1A47]">420 GB / 1 TB</span>
                  </div>
                  <div className="h-3 w-full bg-[#F1FEC8]/50 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#2B9348] w-[25%]" title="PDFs" />
                    <div className="h-full bg-blue-500 w-[10%]" title="Images" />
                    <div className="h-full bg-amber-500 w-[7%]" title="Backups" />
                  </div>
                  <div className="flex gap-4 mt-3 text-[10px] font-bold text-[#8395A7]">
                    <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#2B9348]"></span> PDFs</div>
                    <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Images</div>
                    <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Backups</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-[#E5F5B8] rounded-xl text-xs">
                  <span className="font-bold text-[#3C1A47]">Auto-compress uploaded images</span>
                  <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2B9348]">
                    <span className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform translate-x-5" />
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'queues' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5F5B8] flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-[#3C1A47]">Background Worker Queues</h3>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-[#F1FEC8]/30 text-[#3C1A47] text-xs font-bold rounded-lg border border-[#E5F5B8] hover:bg-[#F1FEC8]/60 transition-colors">Pause All</button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1FEC8]/30 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                <th className="p-4 font-bold">Queue Name</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Pending</th>
                <th className="p-4 font-bold">Processed (24h)</th>
                <th className="p-4 font-bold">Failed</th>
                <th className="p-4 font-bold text-right">Workers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5F5B8] text-sm">
              {[
                { name: 'document-generation', pending: 12, processed: '14,230', failed: 2, workers: 8 },
                { name: 'email-delivery', pending: 0, processed: '45,100', failed: 15, workers: 4 },
                { name: 'webhook-dispatch', pending: 5, processed: '8,400', failed: 0, workers: 4 },
                { name: 'analytics-aggregation', pending: 0, processed: '24', failed: 0, workers: 1 },
                { name: 'database-cleanup', pending: 0, processed: '12', failed: 0, workers: 1 },
              ].map((queue, i) => (
                <tr key={i} className="hover:bg-vanilla-secondary/20">
                  <td className="p-4 font-bold text-[#3C1A47]">{queue.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                  </td>
                  <td className="p-4 font-mono text-[#3C1A47]">{queue.pending}</td>
                  <td className="p-4 font-mono text-[#8395A7]">{queue.processed}</td>
                  <td className={`p-4 font-mono ${queue.failed > 0 ? 'text-red-500 font-bold' : 'text-[#8395A7]'}`}>{queue.failed}</td>
                  <td className="p-4 text-right font-mono text-[#3C1A47]">{queue.workers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display text-[#3C1A47]">Centralized Logs</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
                <input type="text" placeholder="Search logs..." className="bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-1.5 text-sm text-[#3C1A47] focus:outline-hidden w-64" />
              </div>
              <select className="bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl px-3 py-1.5 text-sm font-bold text-[#3C1A47] focus:outline-hidden">
                <option>All Levels</option>
                <option>Error</option>
                <option>Warning</option>
                <option>Info</option>
              </select>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-4 font-mono text-[11px] text-gray-300 h-96 overflow-y-auto space-y-1">
            <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
              <span className="text-gray-500">2026-07-15 14:32:01</span>
              <span className="text-blue-400 font-bold w-12">INFO</span>
              <span className="text-green-400">[document.worker]</span>
              <span className="text-gray-100">Successfully generated document req_8923a1 (142ms)</span>
            </div>
            <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
              <span className="text-gray-500">2026-07-15 14:31:45</span>
              <span className="text-blue-400 font-bold w-12">INFO</span>
              <span className="text-green-400">[auth.service]</span>
              <span className="text-gray-100">User login successful: usr_b729x1</span>
            </div>
            <div className="flex gap-4 hover:bg-white/5 p-1 rounded bg-red-900/20">
              <span className="text-gray-500">2026-07-15 14:30:12</span>
              <span className="text-red-400 font-bold w-12">ERROR</span>
              <span className="text-green-400">[webhook.dispatcher]</span>
              <span className="text-red-200">Failed to deliver webhook to https://api.client.com (Timeout) - Retry 1 queued</span>
            </div>
            <div className="flex gap-4 hover:bg-white/5 p-1 rounded bg-amber-900/20">
              <span className="text-gray-500">2026-07-15 14:28:55</span>
              <span className="text-amber-400 font-bold w-12">WARN</span>
              <span className="text-green-400">[cache.redis]</span>
              <span className="text-amber-200">Memory usage exceeded 80% of allocated limit</span>
            </div>
            <div className="flex gap-4 hover:bg-white/5 p-1 rounded">
              <span className="text-gray-500">2026-07-15 14:25:33</span>
              <span className="text-blue-400 font-bold w-12">INFO</span>
              <span className="text-green-400">[db.maintenance]</span>
              <span className="text-gray-100">Automated vacuum completed successfully on table 'event_logs'</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
