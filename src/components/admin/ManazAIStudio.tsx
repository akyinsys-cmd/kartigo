import React, { useState, useEffect } from 'react';
import { 
  Bot, Save, Sparkles, MessageSquare, AlertCircle, CheckCircle2, 
  HelpCircle, Trash2, Plus, Shuffle, RefreshCw, Languages, 
  ShieldAlert, BookOpen, Layers, Zap, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function ManazAIStudio() {
  const { profile: currentAdminProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'personality' | 'flow' | 'safety' | 'cross_sell' | 'knowledge'>('personality');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manaz AI Configurations (state saved to Firestore or mock fallback)
  const [greeting, setGreeting] = useState("Namaste! Main aapka friendly AI Assistant Manaz hoon. Main aapki legal aur business drafting ko simple banata hoon. Aaj kaunsa agreement banana hai?");
  const [fallbackMessage, setFallbackMessage] = useState("Sorry, main sirf professional legal, business, aur HR documents ki queries handle kar sakta hoon. Chaliye dobara start karte hain!");
  const [conversationalTone, setConversationalTone] = useState("Friendly & Professional");
  const [languagePolicy, setLanguagePolicy] = useState("Hinglish & English");
  const [temperature, setTemperature] = useState(0.4);
  const [maxCompletionTokens, setMaxCompletionTokens] = useState(1024);

  // Blocked/Sensitive topics (Safety)
  const [blockedTopics, setBlockedTopics] = useState<string[]>([
    "Medical Advice", "Political Endorsements", "Gambling Software Agreements", "Crypto Scam Contracts", "Weapon Sales Bills"
  ]);
  const [newBlockedTopic, setNewBlockedTopic] = useState("");

  // Cross Sell Recommended Flows
  const [crossSells, setCrossSells] = useState([
    { trigger: "Appointment Letter", recommendation: "Employment Agreement", priority: "High" },
    { trigger: "Rental Agreement", recommendation: "Tenant Verification Request", priority: "Medium" },
    { trigger: "Co-Founder Agreement", recommendation: "Intellectual Property Transfer Deed", priority: "High" },
    { trigger: "Non-Disclosure Agreement", recommendation: "Vendor Master Contract", priority: "Medium" }
  ]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newRec, setNewRec] = useState("");

  // Prompt Rules & Guidelines
  const [promptRules, setPromptRules] = useState<string[]>([
    "Always greet user warmly in English or Hinglish based on their query.",
    "Do not invent mock data like 'John Doe' or random placeholders in drafts.",
    "Only provide genuine Indian standard legal guidelines (Aadhaar, GST rules).",
    "If the user asks an unrelated question, politely pivot back to document drafting."
  ]);
  const [newPromptRule, setNewPromptRule] = useState("");

  useEffect(() => {
    const loadAiConfig = async () => {
      setLoading(true);
      try {
        const configRef = doc(db, 'manaz_ai_config', 'main');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data.greeting) setGreeting(data.greeting);
          if (data.fallbackMessage) setFallbackMessage(data.fallbackMessage);
          if (data.conversationalTone) setConversationalTone(data.conversationalTone);
          if (data.languagePolicy) setLanguagePolicy(data.languagePolicy);
          if (data.temperature) setTemperature(data.temperature);
          if (data.maxCompletionTokens) setMaxCompletionTokens(data.maxCompletionTokens);
          if (data.blockedTopics) setBlockedTopics(data.blockedTopics);
          if (data.crossSells) setCrossSells(data.crossSells);
          if (data.promptRules) setPromptRules(data.promptRules);
        }
      } catch (e) {
        console.error("Firestore AI config loading error: ", e);
      } finally {
        setLoading(false);
      }
    };

    loadAiConfig();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const configRef = doc(db, 'manaz_ai_config', 'main');
      const payload = {
        greeting,
        fallbackMessage,
        conversationalTone,
        languagePolicy,
        temperature,
        maxCompletionTokens,
        blockedTopics,
        crossSells,
        promptRules,
        updatedAt: new Date().toISOString(),
        updatedBy: currentAdminProfile?.email || 'admin@kartigo.online'
      };

      await setDoc(configRef, payload);

      // Audit Log Action
      const logRef = doc(collection(db, 'audit_logs'));
      await setDoc(logRef, {
        id: logRef.id,
        adminEmail: currentAdminProfile?.email || 'admin@kartigo.online',
        adminName: currentAdminProfile?.firstName || 'System Admin',
        action: 'Updated Manaz AI Engine prompt rules & configuration',
        category: 'Manaz AI Studio',
        timestamp: new Date().toISOString(),
        newValue: JSON.stringify(payload)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to save AI config: ", e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedTopic = () => {
    if (!newBlockedTopic.trim()) return;
    setBlockedTopics([...blockedTopics, newBlockedTopic.trim()]);
    setNewBlockedTopic("");
  };

  const handleRemoveBlockedTopic = (index: number) => {
    setBlockedTopics(blockedTopics.filter((_, i) => i !== index));
  };

  const handleAddCrossSell = () => {
    if (!newTrigger.trim() || !newRec.trim()) return;
    setCrossSells([...crossSells, { trigger: newTrigger.trim(), recommendation: newRec.trim(), priority: "Medium" }]);
    setNewTrigger("");
    setNewRec("");
  };

  const handleRemoveCrossSell = (index: number) => {
    setCrossSells(crossSells.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    if (!newPromptRule.trim()) return;
    setPromptRules([...promptRules, newPromptRule.trim()]);
    setNewPromptRule("");
  };

  const handleRemoveRule = (index: number) => {
    setPromptRules(promptRules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#2B9348]" />
            Manaz AI Studio (V2.0)
          </h2>
          <p className="text-xs text-[#8395A7] font-mono mt-1">
            Re-program and calibrate Manaz's operational constitution, greeting habits, and safety guidelines.
          </p>
        </div>

        <button 
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-5 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] disabled:opacity-50 text-[#F1FEC8] rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Deploy AI Brain
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-[#2B9348]/10 border border-[#2B9348]/30 rounded-2xl flex items-center gap-2.5 text-sm font-bold text-[#2B9348]">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Manaz's prompt parameters have been updated and deployed to production servers instantly.
        </div>
      )}

      {/* Grid: Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Tabs Selector */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'personality', label: 'Personality & Greetings', icon: Bot },
            { id: 'flow', label: 'Conversation Rules', icon: Layers },
            { id: 'safety', label: 'Safety & Guardrails', icon: ShieldAlert },
            { id: 'cross_sell', label: 'Cross-Sell Engine', icon: Shuffle },
            { id: 'knowledge', label: 'Reference Materials', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#3C1A47] text-[#F1FEC8] shadow-md' 
                  : 'bg-white text-[#8395A7] border border-[#E5F5B8] hover:border-[#3C1A47]/30 hover:text-[#3C1A47]'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-[24px] border border-[#E5F5B8] shadow-sm min-h-[450px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#8395A7]">
              <RefreshCw className="h-8 w-8 animate-spin text-[#2B9348] mb-2" />
              <p className="font-bold">Syncing AI model configurations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tab 1: Personality & Greetings */}
              {activeTab === 'personality' && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5F5B8] pb-3">
                    <h3 className="font-bold text-[#3C1A47] text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#2B9348]" />
                      Model Temperature & Greetings
                    </h3>
                    <p className="text-xs text-[#8395A7]">Customize greeting habits, response warmth, and AI randomness parameters.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Greeting Welcome Message (AI Greeting)</label>
                    <textarea 
                      value={greeting} 
                      onChange={(e) => setGreeting(e.target.value)}
                      className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-4 py-3 text-xs font-medium text-[#3C1A47] focus:outline-hidden"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Unrecognized Query Fallback Message</label>
                    <textarea 
                      value={fallbackMessage} 
                      onChange={(e) => setFallbackMessage(e.target.value)}
                      className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-4 py-3 text-xs font-medium text-[#3C1A47] focus:outline-hidden"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Primary Voice Tone</label>
                      <select 
                        value={conversationalTone}
                        onChange={(e) => setConversationalTone(e.target.value)}
                        className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-4 py-2 text-xs font-bold text-[#3C1A47] focus:outline-hidden"
                      >
                        <option value="Friendly & Professional">Friendly & Professional (Recommended)</option>
                        <option value="Formal & legal">Highly Formal & Legal</option>
                        <option value="Humorous & Warm">Humorous & Warm</option>
                        <option value="Direct & Minimalist">Direct & Minimalist</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Creative Temperature ({temperature})</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-[#2B9348] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Conversation flow & Guidelines */}
              {activeTab === 'flow' && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5F5B8] pb-3">
                    <h3 className="font-bold text-[#3C1A47] text-sm flex items-center gap-1.5">
                      <Languages className="h-4 w-4 text-[#2B9348]" />
                      Manaz System Prompt Guidelines
                    </h3>
                    <p className="text-xs text-[#8395A7]">Edit core system guidelines mapped to Gemini context at runtime.</p>
                  </div>

                  <div className="space-y-3">
                    {promptRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-vanilla-secondary/50 rounded-xl border border-vanilla-main/40 text-xs">
                        <span className="font-medium text-[#3C1A47]">{idx + 1}. {rule}</span>
                        <button onClick={() => handleRemoveRule(idx)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add new prompt rule..." 
                        value={newPromptRule}
                        onChange={(e) => setNewPromptRule(e.target.value)}
                        className="flex-1 bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                      />
                      <button 
                        onClick={handleAddRule}
                        className="px-3.5 py-2 bg-[#2B9348] text-white hover:bg-[#237c3c] rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8395A7] uppercase tracking-wider font-mono">Language Capability Configuration</label>
                    <select 
                      value={languagePolicy}
                      onChange={(e) => setLanguagePolicy(e.target.value)}
                      className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-4 py-2 text-xs font-bold text-[#3C1A47] focus:outline-hidden"
                    >
                      <option value="Hinglish & English">Hinglish & English Mixed (Hinglish/Hinglish)</option>
                      <option value="English Only">Strictly English Only</option>
                      <option value="Hindi Only">Strictly Hindi Only</option>
                      <option value="All Indian Regional">All Indian Languages (Regional auto-detect)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 3: Safety & Guardrails */}
              {activeTab === 'safety' && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5F5B8] pb-3">
                    <h3 className="font-bold text-[#3C1A47] text-sm flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      Safety & Blocked Topics
                    </h3>
                    <p className="text-xs text-[#8395A7]">Prevent Manaz from giving legal advice or drafting illegal items.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {blockedTopics.map((topic, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-full font-bold">
                          {topic}
                          <button onClick={() => handleRemoveBlockedTopic(idx)} className="hover:opacity-70 text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add illegal/blocked draft topic..." 
                        value={newBlockedTopic}
                        onChange={(e) => setNewBlockedTopic(e.target.value)}
                        className="flex-1 bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                      />
                      <button 
                        onClick={handleAddBlockedTopic}
                        className="px-3.5 py-2 bg-[#2B9348] text-white hover:bg-[#237c3c] rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold block">Smart Escapes Mode Activated</span>
                      Whenever a blocked keyword or unsafe context is detected, Manaz will automatically push the query to human ticket escalation.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Cross-Sell Engine */}
              {activeTab === 'cross_sell' && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5F5B8] pb-3">
                    <h3 className="font-bold text-[#3C1A47] text-sm flex items-center gap-1.5">
                      <Shuffle className="h-4 w-4 text-[#2B9348]" />
                      Cross-Sell Recommendation Rules
                    </h3>
                    <p className="text-xs text-[#8395A7]">Map recommendations to completed drafts to boost average checkout size.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="divide-y divide-[#E5F5B8]/60">
                      {crossSells.map((rule, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#3C1A47]">{rule.trigger}</span>
                            <span className="text-[#8395A7] mx-2">recommends</span>
                            <span className="font-bold text-[#2B9348]">{rule.recommendation}</span>
                          </div>
                          <button onClick={() => handleRemoveCrossSell(idx)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="Trigger doc (e.g. GST Registration)" 
                        value={newTrigger}
                        onChange={(e) => setNewTrigger(e.target.value)}
                        className="bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                      />
                      <input 
                        type="text" 
                        placeholder="Recommended doc (e.g. MSME Certificate)" 
                        value={newRec}
                        onChange={(e) => setNewRec(e.target.value)}
                        className="bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                      />
                    </div>
                    <button 
                      onClick={handleAddCrossSell}
                      className="w-full py-2 bg-[#2B9348] text-white hover:bg-[#237c3c] rounded-xl text-xs font-bold"
                    >
                      Add Connection Rule
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 5: Reference Materials */}
              {activeTab === 'knowledge' && (
                <div className="space-y-5">
                  <div className="border-b border-[#E5F5B8] pb-3">
                    <h3 className="font-bold text-[#3C1A47] text-sm flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-[#2B9348]" />
                      AI Training Knowledge Base Articles
                    </h3>
                    <p className="text-xs text-[#8395A7]">Upload business rules, legal precedents, and Indian code guidelines.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Indian Partnership Act, 1932 Rules", type: "Federal Law", items: 5 },
                      { title: "Maharashtra Stamp Duty Schedule", type: "State Tax Rules", items: 12 },
                      { title: "Delhi Rental Control Act Guide", type: "Precedents", items: 3 },
                      { title: "Startup India Certificate Guidelines", type: "Government Circular", items: 8 }
                    ].map((article, i) => (
                      <div key={i} className="p-4 border border-[#E5F5B8] rounded-2xl bg-vanilla-secondary/20 flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-[#8395A7] uppercase font-mono">{article.type}</span>
                          <h4 className="text-xs font-bold text-[#3C1A47] mt-0.5">{article.title}</h4>
                          <span className="text-[10px] text-text-light font-mono mt-2 block">{article.items} paragraphs loaded</span>
                        </div>
                        <button className="text-[10px] bg-white border border-[#E5F5B8] text-[#3C1A47] px-2.5 py-1 rounded-xl font-bold hover:bg-vanilla-secondary">
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-2.5 border border-dashed border-[#2B9348] text-[#2B9348] hover:bg-[#2B9348]/5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <Plus className="h-4 w-4" /> Import External Knowledge URL or PDF
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
