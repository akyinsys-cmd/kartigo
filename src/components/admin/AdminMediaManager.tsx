import React, { useState } from 'react';
import { Image as ImageIcon, File, UploadCloud, Search, Filter, ShieldCheck, HardDrive, Trash2, Settings } from 'lucide-react';

export default function AdminMediaManager() {
  const [activeTab, setActiveTab] = useState<'files' | 'settings'>('files');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">File & Media Manager</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage secure uploads, storage, and file restrictions.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border ${
            activeTab === 'files' ? 'bg-[#2B9348] text-white border-[#2B9348]' : 'bg-white text-[#8395A7] border-[#E5F5B8] hover:border-[#2B9348]/30 hover:text-[#2B9348]'
          }`}
        >
          <HardDrive className="h-4 w-4" /> Storage
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs border ${
            activeTab === 'settings' ? 'bg-[#2B9348] text-white border-[#2B9348]' : 'bg-white text-[#8395A7] border-[#E5F5B8] hover:border-[#2B9348]/30 hover:text-[#2B9348]'
          }`}
        >
          <Settings className="h-4 w-4" /> Security Settings
        </button>
      </div>

      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
              <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider">Storage Used</span>
              <div className="text-2xl font-bold font-display text-[#3C1A47] mt-2">45.2 GB</div>
              <div className="text-[#8395A7] text-[10px] font-bold mt-1">Out of 100 GB (45.2%)</div>
            </div>
            <div className="bg-white p-5 rounded-[20px] border border-[#E5F5B8] shadow-sm">
              <span className="text-[#8395A7] text-[10px] font-bold uppercase tracking-wider">Files Scanned (24h)</span>
              <div className="text-2xl font-bold font-display text-[#3C1A47] mt-2">1,204</div>
              <div className="text-[#2B9348] text-[10px] font-bold mt-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> All clean</div>
            </div>
            <div className="bg-[#F1FEC8]/30 border border-[#E5F5B8] p-5 rounded-[20px] shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#F1FEC8]/50 transition-colors border-dashed border-2">
              <div className="text-center">
                <UploadCloud className="h-6 w-6 text-[#2B9348] mx-auto mb-2" />
                <span className="text-sm font-bold text-[#3C1A47]">Secure Upload</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <ImageIcon className="h-12 w-12 text-[#E5F5B8] mb-3" />
            <p className="text-sm font-bold text-[#3C1A47]">Media Library</p>
            <p className="text-xs text-[#8395A7] max-w-md mt-1">View and manage uploaded files here. Files are automatically scanned for malware upon upload.</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
           <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">File Upload & Security Rules</h3>
           <div className="space-y-6 max-w-2xl">
             
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Maximum File Size (MB)</label>
                 <input type="number" defaultValue={25} className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
               </div>
               <div>
                 <label className="text-xs font-bold text-[#8395A7] mb-1.5 block">Allowed File Extensions (Comma separated)</label>
                 <input type="text" defaultValue=".pdf,.png,.jpg,.jpeg,.docx" className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm text-[#3C1A47] focus:outline-hidden" />
               </div>
             </div>

             <div className="space-y-3 pt-4 border-t border-[#E5F5B8]">
                <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                  <div>
                    <div className="text-sm font-bold text-[#3C1A47]">Real-time Virus Scan</div>
                    <div className="text-xs text-[#8395A7]">Automatically scan all incoming files using antivirus definitions</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                  <div>
                    <div className="text-sm font-bold text-[#3C1A47]">Secure Download Links</div>
                    <div className="text-xs text-[#8395A7]">Force authentication to access uploaded attachments and media</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
             </div>

             <button className="px-6 py-2 bg-[#3C1A47] hover:bg-[#2C1335] text-white rounded-xl text-sm font-bold shadow-md transition-colors mt-6">
                Save File Settings
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
