import React, { useState } from 'react';
import { ShieldCheck, Bug, Activity, FileText, CheckCircle, AlertTriangle, Monitor, Smartphone, CheckSquare, Search, RefreshCw, XCircle } from 'lucide-react';

interface AdminQAManagerProps {
  activeTab?: string;
}

export default function AdminQAManager({ activeTab: initialTab = 'dashboard' }: AdminQAManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">QA & Testing Center</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage bug reports, accessibility audits, browser tests, and enterprise quality assurance.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-[#F1FEC8]/30 text-[#2B9348] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E5F5B8] hover:bg-[#F1FEC8]/50 transition-colors">
              <RefreshCw className="h-3 w-3" /> Run System Audit
           </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'dashboard', label: 'QA Overview', icon: Activity },
          { id: 'bugs', label: 'Bug Tracker', icon: Bug },
          { id: 'accessibility', label: 'Accessibility (A11y)', icon: CheckSquare },
          { id: 'crossbrowser', label: 'Cross-Browser', icon: Monitor },
          { id: 'reports', label: 'Audit Reports', icon: FileText },
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
               { label: 'Overall System Health', value: '99.8%', sub: 'Production Ready', status: 'optimal' },
               { label: 'Open Bug Tickets', value: '3', sub: '0 Critical, 3 Low', status: 'optimal' },
               { label: 'WCAG 2.2 AA', value: 'Pass', sub: '98% compliance', status: 'optimal' },
               { label: 'Failed Tests (CI/CD)', value: '0', sub: 'All 1,240 tests passing', status: 'optimal' },
             ].map((stat, i) => (
               <div key={i} className="bg-white rounded-xl p-4 border border-[#E5F5B8] shadow-sm">
                 <h4 className="text-xs font-bold text-[#8395A7] uppercase tracking-wider mb-2">{stat.label}</h4>
                 <div className="text-2xl font-bold text-[#3C1A47] mb-1">{stat.value}</div>
                 <div className={`text-[10px] font-bold ${stat.status === 'optimal' ? 'text-[#2B9348]' : 'text-amber-500'}`}>
                   {stat.sub}
                 </div>
               </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Recent Automated Audits</h3>
              <div className="space-y-3">
                 {[
                   { name: 'End-to-End User Journey Test', time: '10 mins ago', status: 'Pass', duration: '2m 14s' },
                   { name: 'Payment Gateway Regression', time: '1 hour ago', status: 'Pass', duration: '45s' },
                   { name: 'Document Generation Load Test', time: '3 hours ago', status: 'Pass', duration: '5m 10s' },
                   { name: 'Cross-Browser Visual Check', time: '5 hours ago', status: 'Warning', duration: '1m 20s' },
                 ].map((audit, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl">
                      <div className="flex items-center gap-3">
                         <div className={`h-8 w-8 rounded-full flex items-center justify-center ${audit.status === 'Pass' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                           {audit.status === 'Pass' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                         </div>
                         <div>
                           <div className="text-sm font-bold text-[#3C1A47]">{audit.name}</div>
                           <div className="text-[10px] text-[#8395A7]">{audit.time}</div>
                         </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-bold ${audit.status === 'Pass' ? 'text-green-600' : 'text-amber-600'}`}>{audit.status}</div>
                        <div className="text-[10px] font-mono text-[#8395A7] mt-0.5">{audit.duration}</div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Error Recovery Readiness</h3>
              <div className="space-y-4">
                 <div className="p-4 bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#2B9348] shrink-0" />
                    <div>
                       <h4 className="text-sm font-bold text-[#3C1A47] mb-1">Network Failure Handling</h4>
                       <p className="text-xs text-[#8395A7]">Automatic offline detection and API retry queues are configured and passing tests.</p>
                    </div>
                 </div>
                 <div className="p-4 bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#2B9348] shrink-0" />
                    <div>
                       <h4 className="text-sm font-bold text-[#3C1A47] mb-1">Payment Failure Recovery</h4>
                       <p className="text-xs text-[#8395A7]">Graceful fallback UI for declined cards and timeout handling during payment processing.</p>
                    </div>
                 </div>
                 <div className="p-4 bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#2B9348] shrink-0" />
                    <div>
                       <h4 className="text-sm font-bold text-[#3C1A47] mb-1">Global Error Boundaries</h4>
                       <p className="text-xs text-[#8395A7]">React Error Boundaries correctly catching rendering errors without crashing the entire app.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bugs' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5F5B8] flex justify-between items-center">
            <h3 className="text-lg font-bold font-display text-[#3C1A47]">Bug Tracker</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8395A7]" />
              <input type="text" placeholder="Search bugs..." className="bg-vanilla-secondary/30 border border-[#E5F5B8] rounded-xl pl-9 pr-4 py-1.5 text-sm text-[#3C1A47] focus:outline-hidden w-64" />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1FEC8]/30 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold">Severity</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Reported By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5F5B8] text-sm">
              {[
                { id: 'BUG-482', desc: 'Slight layout shift in Agent view on Firefox', severity: 'Low', status: 'Open', reporter: 'QA Automation' },
                { id: 'BUG-481', desc: 'Missing ARIA label on notification bell', severity: 'Low', status: 'In Progress', reporter: 'a11y-scanner' },
                { id: 'BUG-480', desc: 'Timeout not handled gracefully on slow 3G', severity: 'Medium', status: 'Resolved', reporter: 'Network Audit' },
                { id: 'BUG-479', desc: 'Payment modal fails to close on Escape key', severity: 'Low', status: 'Resolved', reporter: 'UX Review' },
              ].map((bug, i) => (
                <tr key={i} className="hover:bg-vanilla-secondary/20">
                  <td className="p-4 font-mono text-[#8395A7] text-xs">{bug.id}</td>
                  <td className="p-4 font-bold text-[#3C1A47] text-sm">{bug.desc}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      bug.severity === 'High' ? 'bg-red-50 text-red-600' :
                      bug.severity === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {bug.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      bug.status === 'Resolved' ? 'bg-green-50 text-green-600' :
                      bug.status === 'In Progress' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {bug.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#8395A7]">{bug.reporter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'accessibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold font-display text-[#3C1A47]">Accessibility Checklist (WCAG 2.2 AA)</h3>
                 <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                   <CheckCircle className="h-3 w-3" /> 98% Compliant
                 </span>
               </div>
               
               <div className="space-y-4">
                 {[
                   { name: 'Keyboard Navigation & Focus States', desc: 'All interactive elements are reachable via Tab key with visible focus rings.', status: 'pass' },
                   { name: 'Screen Reader Support (ARIA)', desc: 'Semantic HTML and aria-labels provided for icons and dynamic content.', status: 'pass' },
                   { name: 'Color Contrast Ratio', desc: 'Text contrast meets the 4.5:1 minimum requirement across the UI.', status: 'pass' },
                   { name: 'Touch Target Sizes', desc: 'Mobile buttons and links are at least 44x44px for easy tapping.', status: 'pass' },
                   { name: 'Reduced Motion Support', desc: 'Animations respect prefers-reduced-motion media queries.', status: 'warning' },
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/10">
                     <div className={`mt-0.5 shrink-0 ${item.status === 'pass' ? 'text-[#2B9348]' : 'text-amber-500'}`}>
                       {item.status === 'pass' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                     </div>
                     <div>
                       <div className="font-bold text-[#3C1A47] text-sm mb-1">{item.name}</div>
                       <div className="text-xs text-[#8395A7]">{item.desc}</div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
           
           <div className="space-y-6">
             <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
                <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Semantic HTML Checks</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#8395A7]">Proper Heading Hierarchy (h1-h6)</span>
                    <CheckCircle className="h-4 w-4 text-[#2B9348]" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#8395A7]">Alt text on all img tags</span>
                    <CheckCircle className="h-4 w-4 text-[#2B9348]" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#8395A7]">Form Labels & Inputs linked</span>
                    <CheckCircle className="h-4 w-4 text-[#2B9348]" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#8395A7]">Valid HTML5 landmarks</span>
                    <CheckCircle className="h-4 w-4 text-[#2B9348]" />
                  </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'crossbrowser' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
          <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Device & Browser Compatibility</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <h4 className="text-sm font-bold text-[#8395A7] uppercase tracking-wider mb-4 border-b border-[#E5F5B8] pb-2">Desktop Browsers</h4>
               <div className="space-y-3">
                 {[
                   { name: 'Google Chrome (Latest)', status: 'Verified', v: 'v114+' },
                   { name: 'Mozilla Firefox', status: 'Verified', v: 'v110+' },
                   { name: 'Apple Safari (macOS)', status: 'Verified', v: 'v16+' },
                   { name: 'Microsoft Edge', status: 'Verified', v: 'v114+' },
                 ].map((b, i) => (
                   <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-vanilla-secondary/30 rounded-lg">
                     <span className="font-bold text-[#3C1A47]">{b.name}</span>
                     <div className="flex items-center gap-3">
                       <span className="font-mono text-[10px] text-[#8395A7]">{b.v}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#2B9348] bg-green-50 px-2 py-1 rounded-md">{b.status}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             <div>
               <h4 className="text-sm font-bold text-[#8395A7] uppercase tracking-wider mb-4 border-b border-[#E5F5B8] pb-2">Mobile & Tablet</h4>
               <div className="space-y-3">
                 {[
                   { name: 'iOS Safari (iPhone)', status: 'Verified', v: 'iOS 16+' },
                   { name: 'Chrome for Android', status: 'Verified', v: 'Android 12+' },
                   { name: 'iPadOS (Tablet View)', status: 'Verified', v: 'iPadOS 16+' },
                   { name: 'Samsung Internet', status: 'Verified', v: 'v21+' },
                 ].map((b, i) => (
                   <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-vanilla-secondary/30 rounded-lg">
                     <span className="font-bold text-[#3C1A47]">{b.name}</span>
                     <div className="flex items-center gap-3">
                       <span className="font-mono text-[10px] text-[#8395A7]">{b.v}</span>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-[#2B9348] bg-green-50 px-2 py-1 rounded-md">{b.status}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
         <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-[#F1FEC8] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2B9348]">
               <FileText className="h-8 w-8" />
             </div>
             <h3 className="text-xl font-bold font-display text-[#3C1A47] mb-2">Generate QA & Audit Reports</h3>
             <p className="text-sm text-[#8395A7] max-w-md mx-auto mb-6">Export comprehensive QA reports, bug tracking history, and accessibility compliance certificates for stakeholder review.</p>
             <div className="flex justify-center gap-3">
               <button className="bg-[#3C1A47] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2C1335] transition-colors shadow-md">
                 Export PDF Report
               </button>
               <button className="bg-white border border-[#E5F5B8] text-[#3C1A47] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F1FEC8]/30 transition-colors">
                 Export CSV
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
