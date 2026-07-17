import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, CheckCircle, HelpCircle, Globe, Languages } from 'lucide-react';

export default function AdminLanguageSettings() {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kartigo_admin_language_settings', JSON.stringify(langSettings));
    setSaveSuccess(true);
    // Dispatch a storage event so DocumentAgent can update live
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between border-b border-[#E5F5B8] pb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
            <Languages className="h-5 w-5 text-[#2B9348]" />
            Language Settings
          </h2>
          <p className="text-xs text-[#8395A7] mt-1">
            Manage your V1.0 Language Policy configurations. Auto-detection handles English & Hinglish style responses, while keeping all generated documents in English.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-[24px] border border-[#E5F5B8] shadow-sm p-6 md:p-8 space-y-6">
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            Language settings updated successfully! Changes are live immediately.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default language selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1">
              Default Conversation Style
              <span className="group relative cursor-pointer">
                <HelpCircle className="h-3 w-3 text-[#8395A7]" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#3C1A47] text-white text-[10px] p-2 rounded-lg w-48 font-normal leading-normal">
                  Initial style used before a style is detected or if auto-detection is disabled.
                </span>
              </span>
            </label>
            <select 
              value={langSettings.defaultLanguage} 
              onChange={e => setLangSettings(prev => ({ ...prev, defaultLanguage: e.target.value as 'English' | 'Hinglish' }))}
              className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] font-bold focus:outline-hidden focus:border-[#2B9348]"
            >
              <option value="English">English</option>
              <option value="Hinglish">Hinglish</option>
            </select>
            <p className="text-[10px] text-[#8395A7]">Sets the starting conversational style of AI Assistant.</p>
          </div>

          {/* Auto detection toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono flex items-center gap-1">
              Auto Language Detection
              <span className="group relative cursor-pointer">
                <HelpCircle className="h-3 w-3 text-[#8395A7]" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#3C1A47] text-white text-[10px] p-2 rounded-lg w-48 font-normal leading-normal">
                  When enabled, AI Assistant automatically detects English or Hinglish on the first message and responds in that style.
                </span>
              </span>
            </label>
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
            <p className="text-[10px] text-[#8395A7]">Detect style naturally and transition based on user inputs.</p>
          </div>

          {/* English Greeting Textarea */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Greeting Message (English)</label>
            <textarea 
              rows={3}
              value={langSettings.greetingEnglish}
              onChange={e => setLangSettings(prev => ({ ...prev, greetingEnglish: e.target.value }))}
              className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348] font-medium"
              placeholder="E.g., Hello! I'm AI Assistant, your document assistant..."
              required
            />
            <p className="text-[10px] text-[#8395A7]">Initial message sent when chat starts in English mode.</p>
          </div>

          {/* Hinglish Greeting Textarea */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Greeting Message (Hinglish)</label>
            <textarea 
              rows={3}
              value={langSettings.greetingHinglish}
              onChange={e => setLangSettings(prev => ({ ...prev, greetingHinglish: e.target.value }))}
              className="w-full bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-3 text-sm text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348] font-medium"
              placeholder="E.g., Namaste! Main AI Assistant hoon..."
              required
            />
            <p className="text-[10px] text-[#8395A7]">Initial message sent when chat starts in Hinglish mode.</p>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-[#E5F5B8] flex justify-end">
          <button 
            type="submit"
            className="flex items-center gap-2 bg-[#3C1A47] text-[#F1FEC8] hover:bg-[#2C1335] px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Check className="h-4 w-4" /> Save Language Settings
          </button>
        </div>
      </form>

      {/* Info card highlighting the English-Only generated document rule */}
      <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5 flex items-start gap-3">
        <Globe className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-[#3C1A47] font-display">Document Generation Enforce Policy</h4>
          <p className="text-xs text-[#8395A7] mt-1 leading-relaxed">
            Please note that under the V1.0 Language Policy, all output templates, agreements, drafts, and document text generated by the backend engine will be strictly drafted in formal <strong>English</strong>, regardless of whether the chat is conducted in English or Hinglish. This maintains high quality and complies with Indian regulatory and professional standards.
          </p>
        </div>
      </div>
    </div>
  );
}
