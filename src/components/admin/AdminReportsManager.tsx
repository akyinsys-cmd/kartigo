import React, { useState } from 'react';
import { 
  FileText, Download, Target, Bell, Settings, Filter, Search, 
  Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Mail, Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminReportsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'goals' | 'alerts' | 'exports' | 'settings'>('generate');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (reportType: string, format: 'csv' | 'json') => {
    if (!user) {
      alert('You must be authenticated as an administrator to download system logs or reports.');
      return;
    }
    setIsExporting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/reports/export?type=${reportType}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 403) {
        alert('Access Denied: You do not have the required role privileges (Admin/Super Admin) to access this analytical resource.');
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to generate report export streams.');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kartigo_${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Audit report stream failure:', err);
      alert(`Report Generation Failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'revenue', title: 'Daily Revenue Summary', desc: 'Detailed breakdown of all transactions and refunds for the day.', type: 'Financial' },
                { id: 'users', title: 'Weekly User Growth', desc: 'New signups, active users, and churn rate over 7 days.', type: 'Audience' },
                { id: 'support', title: 'Monthly AI Performance', desc: 'Generation speeds, error rates, and estimated API costs.', type: 'Technical' },
                { id: 'revenue', title: 'Quarterly Sales Forecast', desc: 'Predicted revenue based on historical growth patterns.', type: 'Business' },
                { id: 'documents', title: 'Document Usage Audit', desc: 'Most popular templates and average generation times.', type: 'Product' },
                { id: 'support', title: 'Security & Access Log', desc: 'Admin logins, permission changes, and failed attempts.', type: 'Security' }
              ].map((report, i) => (
                <div key={i} className="bg-white border border-vanilla-main rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{report.type}</span>
                    <button className="text-text-light hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-brand-secondary mb-1">{report.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6">{report.desc}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleExport(report.id, 'json')}
                      disabled={isExporting}
                      className="flex-1 bg-[#3C1A47] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#2C1335] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      Export JSON
                    </button>
                    <button 
                      onClick={() => handleExport(report.id, 'csv')}
                      disabled={isExporting}
                      className="px-3 py-2 bg-[#F1FEC8] text-[#2B9348] border border-[#E5F5B8] rounded-xl hover:bg-[#E5F5B8] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-vanilla-secondary/50 border border-vanilla-main rounded-[20px] p-6 text-center">
              <h4 className="text-sm font-bold text-brand-secondary mb-2">Need a custom report?</h4>
              <p className="text-xs text-text-light mb-4">You can build custom queries using the data warehouse builder.</p>
              <button className="bg-white border border-vanilla-main text-brand-secondary px-4 py-2 rounded-xl text-xs font-bold hover:bg-vanilla-main shadow-xs transition-colors mx-auto flex items-center gap-2 cursor-pointer">
                <Database className="h-4 w-4" /> Build Custom Report
              </button>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-brand-secondary">Business Targets</h3>
               <button className="flex items-center gap-2 text-xs font-bold bg-brand-primary text-white px-3 py-1.5 rounded-xl shadow-xs">
                 <Plus className="h-3 w-3" /> New Goal
               </button>
            </div>
            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm overflow-hidden">
               <div className="divide-y divide-vanilla-main">
                 {[
                   { name: 'Monthly Revenue Goal', target: '₹41,25,000', current: '₹28,21,200', pct: 68 },
                   { name: 'New Users (Q3)', target: '5,000', current: '3,102', pct: 62 },
                   { name: 'Document Generations', target: '10,000', current: '8,450', pct: 84 },
                   { name: 'Avg Resolution Time', target: '< 2 hours', current: '1.5 hours', pct: 100 }
                 ].map((goal, i) => (
                   <div key={i} className="p-5 flex items-center justify-between hover:bg-vanilla-secondary/20">
                     <div className="flex-1 mr-6">
                       <div className="flex justify-between mb-2">
                         <span className="text-sm font-bold text-brand-secondary">{goal.name}</span>
                         <span className="text-xs font-mono text-text-secondary">{goal.current} / {goal.target}</span>
                       </div>
                       <div className="w-full bg-vanilla-secondary rounded-full h-2">
                         <div className={`h-2 rounded-full ${goal.pct >= 100 ? 'bg-green-500' : 'bg-brand-primary'}`} style={{ width: `${Math.min(goal.pct, 100)}%` }}></div>
                       </div>
                     </div>
                     <button className="text-xs font-bold text-brand-primary hover:underline">Edit</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-brand-secondary">Automated System Alerts</h3>
               <button className="flex items-center gap-2 text-xs font-bold bg-brand-primary text-white px-3 py-1.5 rounded-xl shadow-xs">
                 <Plus className="h-3 w-3" /> Create Alert
               </button>
            </div>
            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm p-4">
               <div className="space-y-3">
                 {[
                   { title: 'High Failure Rate (AI)', condition: 'Error rate > 2% for 5 mins', status: 'Active', notify: 'Admin Email' },
                   { title: 'Revenue Drop', condition: 'Daily revenue < ₹41,250', status: 'Active', notify: 'Push Notification' },
                   { title: 'Traffic Spike', condition: 'Active users > 500', status: 'Active', notify: 'Admin Dashboard' },
                   { title: 'Fraud Detection', condition: 'Multiple failed payments from same IP', status: 'Active', notify: 'Security Team' }
                 ].map((alert, i) => (
                   <div key={i} className="p-4 border border-vanilla-main rounded-xl flex justify-between items-center bg-vanilla-secondary/30">
                     <div>
                       <div className="flex items-center gap-2">
                         <Bell className="h-4 w-4 text-brand-primary" />
                         <span className="text-sm font-bold text-brand-secondary">{alert.title}</span>
                       </div>
                       <p className="text-xs text-text-secondary mt-1">Triggers when: <span className="font-mono">{alert.condition}</span></p>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{alert.notify}</span>
                       <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer">
                         <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'exports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-brand-secondary">Export History & Downloads</h3>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleExport('revenue', 'csv')}
                   disabled={isExporting}
                   className="flex items-center gap-2 text-xs font-bold bg-white border border-vanilla-main text-brand-secondary px-3 py-1.5 rounded-xl shadow-xs hover:bg-vanilla-secondary disabled:opacity-50 cursor-pointer"
                 >
                   <Download className="h-3 w-3" /> {isExporting ? 'Exporting...' : 'Export Revenue (CSV)'}
                 </button>
                 <button 
                   onClick={() => handleExport('users', 'csv')}
                   disabled={isExporting}
                   className="flex items-center gap-2 text-xs font-bold bg-white border border-vanilla-main text-brand-secondary px-3 py-1.5 rounded-xl shadow-xs hover:bg-vanilla-secondary disabled:opacity-50 cursor-pointer"
                 >
                   <Download className="h-3 w-3" /> {isExporting ? 'Exporting...' : 'Export Users (CSV)'}
                 </button>
                 <button 
                   onClick={() => handleExport('documents', 'json')}
                   disabled={isExporting}
                   className="flex items-center gap-2 text-xs font-bold bg-brand-primary text-white px-3 py-1.5 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                 >
                   <FileText className="h-3 w-3" /> {isExporting ? 'Generating...' : 'Export Docs (JSON)'}
                 </button>
               </div>
            </div>
            <div className="bg-white border border-vanilla-main rounded-[20px] shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-vanilla-main text-xs uppercase tracking-wider text-text-light font-bold bg-vanilla-secondary/30">
                       <th className="py-3 px-4">Report Name</th>
                       <th className="py-3 px-4">Type</th>
                       <th className="py-3 px-4">Generated By</th>
                       <th className="py-3 px-4">Date</th>
                       <th className="py-3 px-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {[
                       { name: 'Monthly Revenue Summary - July', type: 'JSON', id: 'revenue', format: 'json', user: 'admin@kartigo.com', date: 'Just now' },
                       { name: 'User Growth Q2 2026', type: 'CSV', id: 'users', format: 'csv', user: 'admin@kartigo.com', date: '2 hours ago' },
                       { name: 'Document Template Usage', type: 'JSON', id: 'documents', format: 'json', user: 'system_auto', date: 'Yesterday' },
                       { name: 'AI API Costs Analysis', type: 'CSV', id: 'support', format: 'csv', user: 'admin@kartigo.com', date: 'Jul 10, 2026' }
                     ].map((doc, i) => (
                       <tr key={i} className="border-b border-vanilla-main/50 hover:bg-vanilla-secondary/50">
                         <td className="py-3 px-4 font-bold text-brand-secondary flex items-center gap-2">
                           <FileText className="h-4 w-4 text-brand-primary" /> {doc.name}
                         </td>
                         <td className="py-3 px-4 text-xs font-mono">{doc.type}</td>
                         <td className="py-3 px-4 text-xs text-text-secondary">{doc.user}</td>
                         <td className="py-3 px-4 text-xs text-text-light">{doc.date}</td>
                         <td className="py-3 px-4 text-right">
                           <button 
                             onClick={() => handleExport(doc.id, doc.format as any)}
                             disabled={isExporting}
                             className="text-brand-primary hover:underline text-xs font-bold flex items-center gap-1 justify-end w-full cursor-pointer disabled:opacity-50"
                           >
                             <Download className="h-3 w-3" /> Download
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white border border-vanilla-main rounded-[20px] p-12 text-center shadow-sm">
            <Settings className="h-12 w-12 text-vanilla-main mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-secondary font-display mb-2 capitalize">{activeTab} Settings</h3>
            <p className="text-xs text-text-light max-w-md mx-auto">
              Configure export permissions, audit logs, and secure report distribution lists here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-brand-secondary">Reports & Alerts</h2>
          <p className="text-xs text-text-light mt-1">Generate PDF/CSV reports, manage goals, and configure system alerts.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'generate', label: 'Generate Reports', icon: FileText },
          { id: 'goals', label: 'Business Goals', icon: Target },
          { id: 'alerts', label: 'System Alerts', icon: Bell },
          { id: 'exports', label: 'Export History', icon: Download },
          { id: 'settings', label: 'Report Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-text-secondary border-vanilla-main hover:border-brand-primary/30 hover:text-brand-primary'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
