import React, { useState } from 'react';
import { Globe, MessageSquare, DollarSign, Settings, Search, Edit2, CheckCircle, XCircle, Plus, ChevronDown, Check, Activity } from 'lucide-react';

interface AdminLocalizationManagerProps {
  activeTab?: string;
}

export default function AdminLocalizationManager({ activeTab: initialTab = 'languages' }: AdminLocalizationManagerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [langSettings, setLangSettings] = useState(() => {
    const stored = localStorage.getItem('kartigo_admin_language_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return {
      defaultLanguage: 'English' as 'English' | 'Hinglish',
      autoDetect: true,
      greetingEnglish: "Hello! I'm AI Assistant, your document assistant.\n\nTell me what document you'd like to create today.",
      greetingHinglish: "Namaste! Main AI Assistant hoon, aapka document assistant. Mujhe batayein, aaj kaunsa document banana hai?"
    };
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('kartigo_admin_date_format') || 'text';
  });

  const handleDateFormatChange = (newFormat: string) => {
    setDateFormat(newFormat);
    localStorage.setItem('kartigo_admin_date_format', newFormat);
    // Dispatch storage event so everything can update
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveLanguageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kartigo_admin_language_settings', JSON.stringify(langSettings));
    setSaveSuccess(true);
    // Also dispatch storage event so DocumentAgent can pick it up immediately
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const languages = [
    { id: 'en', name: 'English', code: 'EN', default: true, status: 'active', completeness: '100%' },
    { id: 'hi', name: 'Hindi', code: 'HI', default: false, status: 'inactive', completeness: '45%' },
    { id: 'ar', name: 'Arabic', code: 'AR', default: false, status: 'inactive', completeness: '12%' },
  ];

  const currencies = [
    { id: 'inr', name: 'Indian Rupee', code: 'INR', symbol: '₹', exchangeRate: 1.0, status: 'active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[#3C1A47]">Localization & Global</h2>
          <p className="text-xs text-[#8395A7] mt-1">Manage languages, currencies, and regional settings.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar hide-scrollbar">
        {[
          { id: 'languages', label: 'Languages', icon: MessageSquare },
          { id: 'currencies', label: 'Currencies', icon: DollarSign },
          { id: 'settings', label: 'Global Settings', icon: Settings },
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

      {activeTab === 'languages' && (
        <form onSubmit={handleSaveLanguageSettings} className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6 md:p-8 space-y-6">
          <div className="border-b border-[#E5F5B8] pb-4">
            <h3 className="text-lg font-bold font-display text-[#3C1A47] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#2B9348]" />
              Language Policy Configuration (V1.0)
            </h3>
            <p className="text-xs text-[#8395A7] mt-1">
              Configure English and Hinglish conversation parameters for AI Assistant. Documents are generated in English only.
            </p>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              Settings saved successfully! Change is now live.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Default Conversation Language</label>
              <select 
                value={langSettings.defaultLanguage} 
                onChange={e => setLangSettings(prev => ({ ...prev, defaultLanguage: e.target.value as 'English' | 'Hinglish' }))}
                className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] font-bold focus:outline-hidden focus:border-[#2B9348]"
              >
                <option value="English">English</option>
                <option value="Hinglish">Hinglish</option>
              </select>
              <p className="text-[10px] text-[#8395A7]">Used as the initial style before detection or if auto-detection is disabled.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Auto Language Detection</label>
              <div className="flex items-center justify-between p-3 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30 mt-1">
                <span className="text-xs font-bold text-[#3C1A47]">
                  {langSettings.autoDetect ? "Enabled (On)" : "Disabled (Off)"}
                </span>
                <button 
                  type="button"
                  onClick={() => setLangSettings(prev => ({ ...prev, autoDetect: !prev.autoDetect }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${langSettings.autoDetect ? 'bg-[#2B9348]' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${langSettings.autoDetect ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-[10px] text-[#8395A7]">Automatically switch styles based on the first user message.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Greeting in English</label>
              <textarea 
                rows={3}
                value={langSettings.greetingEnglish}
                onChange={e => setLangSettings(prev => ({ ...prev, greetingEnglish: e.target.value }))}
                className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                placeholder="English greeting..."
                required
              />
              <p className="text-[10px] text-[#8395A7]">Greeting message sent when the chat initiates in English style.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Greeting in Hinglish</label>
              <textarea 
                rows={3}
                value={langSettings.greetingHinglish}
                onChange={e => setLangSettings(prev => ({ ...prev, greetingHinglish: e.target.value }))}
                className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
                placeholder="Hinglish greeting..."
                required
              />
              <p className="text-[10px] text-[#8395A7]">Greeting message sent when the chat initiates in Hinglish style.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5F5B8] flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 bg-[#3C1A47] text-[#F1FEC8] hover:bg-[#2C1335] px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Check className="h-4 w-4" /> Save Language Settings
            </button>
          </div>
        </form>
      )}

      {activeTab === 'currencies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
            <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-6">Currency Configuration</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1FEC8]/50 text-[10px] uppercase tracking-wider font-mono text-[#8395A7] border-b border-[#E5F5B8]">
                    <th className="p-4 font-bold">Currency</th>
                    <th className="p-4 font-bold">Code / Symbol</th>
                    <th className="p-4 font-bold">Exchange Rate (Base: INR)</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5F5B8] text-sm">
                  {currencies.map(currency => (
                    <tr key={currency.id}>
                      <td className="p-4 font-bold text-[#3C1A47]">{currency.name}</td>
                      <td className="p-4 text-[#8395A7] font-mono">{currency.code} ({currency.symbol})</td>
                      <td className="p-4">
                        <input type="number" defaultValue={currency.exchangeRate} className="w-24 bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-lg px-2 py-1 text-sm text-[#3C1A47] focus:outline-hidden" />
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit ${currency.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {currency.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-[#2B9348] font-bold text-xs hover:underline">Update Rate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6">
           <h3 className="text-lg font-bold font-display text-[#3C1A47] mb-4">Global Platform Settings</h3>
           <p className="text-xs text-[#8395A7] mb-6">Kartigo Draft is configured for single-jurisdiction deployment (India Only). All compliance, currency, and language engines are locked to this region.</p>
           
           <div className="space-y-6 max-w-2xl">
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                   <div>
                     <div className="text-sm font-bold text-[#3C1A47]">Jurisdiction Mode</div>
                     <div className="text-xs text-[#8395A7]">Locked to local regulations, stamp duties, and Indian states</div>
                   </div>
                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                     India Only
                   </span>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                   <div>
                     <div className="text-sm font-bold text-[#3C1A47]">Enable Localized Pricing</div>
                     <div className="text-xs text-[#8395A7]">Show prices in local Indian Rupee currency (INR) and enable automatic tax structures</div>
                   </div>
                   <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2B9348] transition-colors">
                     <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                   </button>
                 </div>
                  <div className="flex items-center justify-between p-4 border border-[#E5F5B8] rounded-xl bg-vanilla-secondary/30">
                    <div>
                      <div className="text-sm font-bold text-[#3C1A47]">Default Date Display Format</div>
                      <div className="text-xs text-[#8395A7]">Select how dates are formatted in document transcripts and generated agreements</div>
                    </div>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleDateFormatChange(e.target.value)}
                      className="bg-white border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#3C1A47] focus:outline-hidden cursor-pointer"
                    >
                      <option value="text">15 July 2026 (DD Month YYYY)</option>
                      <option value="numeric">15/07/2026 (DD/MM/YYYY)</option>
                    </select>
                  </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
