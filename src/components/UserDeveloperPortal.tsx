import React, { useState } from 'react';
import { Key, Activity, Copy, RefreshCw, Trash2, Eye, EyeOff, Plus, FileText, ChevronRight, CheckCircle } from 'lucide-react';

export default function UserDeveloperPortal() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey] = useState('kd_live_8f92j3nklasd9023jlaskdf09');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-secondary">API & Integrations</h3>
        <p className="text-xs text-text-light mt-1">Manage your API keys, webhooks, and monitor API usage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-vanilla-secondary/50 rounded-2xl border border-vanilla-main p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                <Key className="h-4 w-4 text-brand-primary" /> API Keys
              </h4>
              <button className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Create New Key
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-vanilla-main relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-sm font-bold text-text-secondary">Production Key</h5>
                    <p className="text-[10px] text-text-light mt-0.5">Created on Jul 15, 2026 • Last used 2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1 bg-vanilla-main/30 font-mono text-xs text-text-secondary p-2.5 rounded-lg border border-vanilla-main flex items-center justify-between">
                    <span>{showKey ? apiKey : '••••••••••••••••••••••••••••••'}</span>
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="text-text-light hover:text-brand-secondary transition-colors"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition-colors border border-brand-primary/20"
                    title="Copy Key"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button className="p-2.5 bg-vanilla-main/50 text-text-light hover:text-brand-secondary rounded-lg transition-colors border border-vanilla-main" title="Rotate Key">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100" title="Revoke Key">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-vanilla-secondary/50 rounded-2xl border border-vanilla-main p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-primary" /> Webhooks
              </h4>
              <button className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add Endpoint
              </button>
            </div>
            
            <div className="text-center py-8 border-2 border-dashed border-vanilla-main rounded-xl bg-white">
              <Activity className="h-8 w-8 text-vanilla-main mx-auto mb-3" />
              <p className="text-sm font-bold text-text-secondary mb-1">No webhooks configured</p>
              <p className="text-xs text-text-light max-w-xs mx-auto mb-4">Set up endpoints to receive real-time updates when documents are generated or payments succeed.</p>
              <button className="text-xs font-bold text-white bg-brand-secondary px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all">
                Add First Webhook
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-vanilla-main p-6 shadow-sm">
            <h4 className="text-sm font-bold text-brand-secondary mb-4">Usage & Quotas</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-text-secondary">API Requests</span>
                  <span className="font-bold text-brand-secondary">1,245 / 10,000</span>
                </div>
                <div className="h-2 w-full bg-vanilla-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary w-[12.45%]" />
                </div>
                <p className="text-[10px] text-text-light mt-1">Resets in 14 days</p>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-text-secondary">Document Generations</span>
                  <span className="font-bold text-brand-secondary">42 / 100</span>
                </div>
                <div className="h-2 w-full bg-vanilla-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary w-[42%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-vanilla-secondary/30 rounded-2xl border border-vanilla-main p-6 text-center">
            <FileText className="h-6 w-6 text-brand-primary mx-auto mb-3" />
            <h4 className="text-sm font-bold text-brand-secondary mb-2">Developer Documentation</h4>
            <p className="text-xs text-text-light mb-4">Read our guides, SDKs, and endpoint references to integrate seamlessly.</p>
            <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-brand-secondary bg-white border border-vanilla-main px-4 py-2 rounded-lg hover:border-brand-primary/30 transition-all">
              View API Docs <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
