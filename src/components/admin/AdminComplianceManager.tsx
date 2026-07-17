import React, { useState } from 'react';
import { Shield, FileCheck, Database, FileText, Download, Save } from 'lucide-react';

export default function AdminComplianceManager() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'retention'>('privacy');

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 shrink-0 space-y-2">
        {[
          { id: 'privacy', label: 'Privacy & Policies', icon: Shield },
          { id: 'retention', label: 'Data Retention', icon: Database },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === item.id 
                ? 'bg-[#3C1A47] text-white shadow-md' 
                : 'bg-white text-[#8395A7] border border-[#E5F5B8] hover:border-[#3C1A47]/30 hover:text-[#3C1A47]'
            }`}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 bg-white p-6 md:p-8 rounded-[24px] border border-[#E5F5B8] shadow-sm">
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#2B9348]" />
                Privacy & Compliance Settings
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure GDPR/CCPA settings, consent management, and legal notices.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Cookie Consent Banner</div>
                  <div className="text-xs text-[#8395A7]">Require explicit consent for tracking cookies</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Data Export Requests</div>
                  <div className="text-xs text-[#8395A7]">Allow users to download their activity data automatically</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                <div>
                  <div className="text-sm font-bold text-[#3C1A47]">Account Deletion Protocol</div>
                  <div className="text-xs text-[#8395A7]">Require 30-day grace period before hard delete</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="space-y-6">
            <div className="border-b border-[#E5F5B8] pb-4 mb-6">
              <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
                <Database className="h-5 w-5 text-[#2B9348]" />
                Data Retention Policies
              </h3>
              <p className="text-sm text-[#8395A7] mt-1">
                Configure how long different types of data are kept before automatic deletion.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8395A7] block mb-1.5">Draft Documents (Days)</label>
                  <input type="number" defaultValue={30} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] block mb-1.5">Audit Logs (Days)</label>
                  <input type="number" defaultValue={365} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] block mb-1.5">Support Tickets (Days)</label>
                  <input type="number" defaultValue={180} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8395A7] block mb-1.5">Notification History (Days)</label>
                  <input type="number" defaultValue={90} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
                </div>
              </div>
              <button className="px-6 py-2 mt-4 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-colors">
                <Save className="h-4 w-4" /> Save Policies
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
