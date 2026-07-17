import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, Eye, HelpCircle, CheckCircle2, 
  ArrowUp, ArrowDown, Layers, Settings, Database, Move, 
  Sparkles, Check, X, AlertCircle, FileText, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { documents as staticDocuments } from '../../data/landingData';
import { useAuth } from '../../context/AuthContext';

interface QuestionStep {
  id: string;
  label: string;
  questionText: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'currency' | 'address';
  options?: string[];
  required?: boolean;
  helpText?: string;
  condition?: {
    fieldId: string;
    value: string;
  };
}

export default function QuestionEngine() {
  const { profile: currentAdminProfile, user } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<string>(staticDocuments[0]?.id || '');
  const [steps, setSteps] = useState<QuestionStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Editing state for a single question
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuestionStep>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // Load questions from Firestore when selected document changes
  useEffect(() => {
    if (!selectedDocId) return;
    const loadDocQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/questions?docType=${encodeURIComponent(selectedDocId)}`);
        if (!res.ok) throw new Error('Failed to load questionnaire');
        const data = await res.json();
        if (data && data.steps && data.steps.length > 0) {
          setSteps(data.steps);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error loading questions from API:", err);
      }
      
      // Fallback: Generate some default questionnaire steps based on doc type if empty
      const defaultSteps: QuestionStep[] = [
        {
          id: 'effectiveDate',
          label: 'Effective Date',
          questionText: `What is the effective date of this ${selectedDocId}?`,
          placeholder: 'e.g. 2026-07-17',
          type: 'date',
          required: true,
          helpText: 'Date when the agreement becomes legally active.'
        },
        {
          id: 'partyOneName',
          label: 'First Party Name',
          questionText: 'What is the full legal name of the First Party?',
          placeholder: 'e.g. AKYIN Ventures Private Limited',
          type: 'text',
          required: true,
          helpText: 'The primary legal entity or person initiating the draft.'
        },
        {
          id: 'partyTwoName',
          label: 'Second Party Name',
          questionText: 'What is the full legal name of the Second Party?',
          placeholder: 'e.g. John Doe',
          type: 'text',
          required: true,
          helpText: 'The recipient entity or counterpart.'
        },
        {
          id: 'jurisdictionState',
          label: 'Governing Law State',
          questionText: 'Which Indian State applies to the jurisdiction and stamp duty?',
          placeholder: 'e.g. Delhi',
          type: 'select',
          options: ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Haryana', 'Gujarat'],
          required: true,
          helpText: 'Governing law and court jurisdiction state.'
        }
      ];
      setSteps(defaultSteps);
      setLoading(false);
    };

    loadDocQuestions();
  }, [selectedDocId]);

  const handleSaveToDatabase = async () => {
    if (!selectedDocId || !user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/admin/questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          docId: selectedDocId,
          steps: steps
        })
      });

      if (!res.ok) throw new Error('Failed to save questionnaire on backend.');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving questions to backend database:", err);
      alert("Failed to save changes: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ: QuestionStep = {
      id: editForm.id || `field_${Date.now().toString().slice(-4)}`,
      label: editForm.label || 'New Field',
      questionText: editForm.questionText || 'Enter the details:',
      placeholder: editForm.placeholder || 'e.g. Sample',
      type: (editForm.type as any) || 'text',
      required: editForm.required || false,
      helpText: editForm.helpText || '',
      options: editForm.options || []
    };

    if (editForm.condition?.fieldId) {
      newQ.condition = editForm.condition as any;
    }

    setSteps([...steps, newQ]);
    setShowAddForm(false);
    setEditForm({});
  };

  const handleStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditForm({ ...steps[idx] });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...steps];
    updated[editingIndex] = editForm as QuestionStep;
    setSteps(updated);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDelete = (idx: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updated = steps.filter((_, i) => i !== idx);
      setSteps(updated);
      if (editingIndex === idx) {
        setEditingIndex(null);
        setEditForm({});
      }
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSteps(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[#3C1A47] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#2B9348]" />
            No-Code Question Builder
          </h2>
          <p className="text-xs text-[#8395A7] font-mono mt-1">
            Build dynamic, conditional wizard questionnaires for Kartigo Draft templates.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#8395A7] uppercase font-mono shrink-0">Document Type:</label>
          <select 
            value={selectedDocId} 
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-[#F1FEC8]/30 border border-[#E5F5B8] rounded-xl px-4 py-2 text-sm font-bold text-[#3C1A47] focus:outline-hidden focus:border-[#2B9348]"
          >
            {staticDocuments.map((d) => (
              <option key={d.id} value={d.title}>{d.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Builder list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between border-b border-[#E5F5B8] pb-4 mb-4">
              <span className="text-sm font-bold text-[#3C1A47] font-display flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#2B9348]" />
                Steps Sequence ({steps.length})
              </span>
              <button 
                onClick={() => { setShowAddForm(true); setEditForm({ type: 'text', required: true }); }}
                className="px-3 py-1.5 bg-[#2B9348] text-white hover:bg-[#237c3c] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Field
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-20 text-[#8395A7]">
                <RefreshCw className="h-8 w-8 animate-spin text-[#2B9348] mb-2" />
                <span className="ml-2 font-bold text-sm">Loading dynamic steps...</span>
              </div>
            ) : steps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8395A7] py-20">
                <HelpCircle className="h-12 w-12 text-[#E5F5B8] mb-3" />
                <p className="font-bold">No custom fields defined</p>
                <p className="text-xs">Click "Add Field" to begin designing your form layout.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {steps.map((step, idx) => (
                  <div key={idx} className={`border rounded-2xl p-4 transition-all ${editingIndex === idx ? 'bg-[#F1FEC8]/10 border-[#2B9348]' : 'bg-white border-[#E5F5B8] hover:border-[#3C1A47]/30'}`}>
                    {editingIndex === idx ? (
                      /* Active Step Editor form */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5F5B8] pb-2">
                          <span className="text-xs font-bold text-[#3C1A47] font-mono">Editing Field {idx + 1}</span>
                          <div className="flex gap-1.5">
                            <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded-lg" title="Save changes">
                              <Check className="h-4.5 w-4.5" />
                            </button>
                            <button onClick={() => setEditingIndex(null)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel">
                              <X className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Unique Key (id)</label>
                            <input 
                              type="text" 
                              value={editForm.id || ''} 
                              onChange={(e) => setEditForm({...editForm, id: e.target.value.replace(/\s+/g, '')})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Short Label</label>
                            <input 
                              type="text" 
                              value={editForm.label || ''} 
                              onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Question Text (for AI / form)</label>
                            <input 
                              type="text" 
                              value={editForm.questionText || ''} 
                              onChange={(e) => setEditForm({...editForm, questionText: e.target.value})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Placeholder / Format Example</label>
                            <input 
                              type="text" 
                              value={editForm.placeholder || ''} 
                              onChange={(e) => setEditForm({...editForm, placeholder: e.target.value})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Field Type</label>
                            <select 
                              value={editForm.type || 'text'} 
                              onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            >
                              <option value="text">Text Input</option>
                              <option value="textarea">Text Area</option>
                              <option value="number">Number</option>
                              <option value="currency">Currency (INR)</option>
                              <option value="date">Date Picker</option>
                              <option value="select">Dropdown Menu</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone Number</option>
                              <option value="address">Postal Address</option>
                            </select>
                          </div>

                          {editForm.type === 'select' && (
                            <div className="space-y-1 col-span-2">
                              <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Dropdown Options (Comma Separated)</label>
                              <input 
                                type="text" 
                                placeholder="Delhi, Mumbai, Chennai" 
                                value={editForm.options?.join(', ') || ''} 
                                onChange={(e) => setEditForm({...editForm, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                                className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                              />
                            </div>
                          )}

                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-bold text-[#8395A7] uppercase tracking-wider font-mono">Help Text</label>
                            <input 
                              type="text" 
                              value={editForm.helpText || ''} 
                              onChange={(e) => setEditForm({...editForm, helpText: e.target.value})}
                              className="w-full bg-[#F1FEC8]/20 border border-[#E5F5B8] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-between p-2 bg-vanilla-secondary/50 rounded-xl mt-2 border border-[#E5F5B8]">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-extrabold text-[#3C1A47]">Required Field</span>
                              <span className="text-[9px] text-[#8395A7]">User cannot proceed without completing this field</span>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={!!editForm.required} 
                              onChange={(e) => setEditForm({...editForm, required: e.target.checked})}
                              className="h-4 w-4 rounded-md text-[#2B9348] border-[#E5F5B8] focus:ring-[#2B9348] cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only step presentation */
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#3C1A47]">{step.label}</span>
                            <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-vanilla-secondary text-[#3C1A47] uppercase">
                              {step.type}
                            </span>
                            {step.required && (
                              <span className="text-[9px] font-bold text-red-500 font-mono uppercase bg-red-50 px-1.5 rounded border border-red-100">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#3C1A47] font-medium mt-1 leading-relaxed">
                            "{step.questionText}"
                          </p>
                          {step.helpText && (
                            <p className="text-[10px] text-[#8395A7] mt-0.5 flex items-center gap-1">
                              <HelpCircle className="h-3 w-3" />
                              {step.helpText}
                            </p>
                          )}
                        </div>

                        {/* Actions (Edit, Delete, Move) */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveStep(idx, 'up')} disabled={idx === 0} className="p-1 text-[#8395A7] hover:text-[#3C1A47] disabled:opacity-30">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button onClick={() => moveStep(idx, 'down')} disabled={idx === steps.length - 1} className="p-1 text-[#8395A7] hover:text-[#3C1A47] disabled:opacity-30">
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStartEdit(idx)} className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Save Status & Action bar */}
            <div className="mt-6 pt-4 border-t border-[#E5F5B8] flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-[#2B9348] font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Layout saved successfully!
                  </div>
                )}
              </div>
              <button 
                onClick={handleSaveToDatabase}
                disabled={saving}
                className="px-5 py-2.5 bg-[#3C1A47] hover:bg-[#2C1335] disabled:opacity-50 text-[#F1FEC8] rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Publish Questionnaire
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Form Preview / Add Form Modal */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#3C1A47] text-white p-6 rounded-[24px] border border-[#3C1A47]/30 shadow-xl space-y-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold font-display flex items-center gap-1.5 text-[#F1FEC8]">
                    <Plus className="h-4.5 w-4.5" /> Define New Form Field
                  </h3>
                  <button onClick={() => setShowAddForm(false)} className="text-white/60 hover:text-white p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Unique Key (id)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. employeeName"
                        value={editForm.id || ''} 
                        onChange={(e) => setEditForm({...editForm, id: e.target.value.replace(/\s+/g, '')})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Short Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Employee Name"
                        value={editForm.label || ''} 
                        onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Question Text</label>
                    <input 
                      type="text" 
                      placeholder="What is the full legal name of the employee?"
                      value={editForm.questionText || ''} 
                      onChange={(e) => setEditForm({...editForm, questionText: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Field Type</label>
                      <select 
                        value={editForm.type || 'text'} 
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                      >
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="currency">Currency (INR)</option>
                        <option value="date">Date Picker</option>
                        <option value="select">Dropdown Menu</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Number</option>
                        <option value="address">Postal Address</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Placeholder</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={editForm.placeholder || ''} 
                        onChange={(e) => setEditForm({...editForm, placeholder: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                      />
                    </div>
                  </div>

                  {editForm.type === 'select' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Dropdown Options (Comma Separated)</label>
                      <input 
                        type="text" 
                        placeholder="Delhi, Karnataka, Maharashtra"
                        value={editForm.options?.join(', ') || ''} 
                        onChange={(e) => setEditForm({...editForm, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#E5F5B8]/80 uppercase tracking-wider font-mono">Help Text</label>
                    <input 
                      type="text" 
                      placeholder="Specify middle names if they are printed on Aadhaar."
                      value={editForm.helpText || ''} 
                      onChange={(e) => setEditForm({...editForm, helpText: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden focus:border-[#F1FEC8]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#F1FEC8]">Required field</span>
                      <span className="text-[10px] text-white/60">Must be answered to generate draft</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={!!editForm.required} 
                      onChange={(e) => setEditForm({...editForm, required: e.target.checked})}
                      className="h-4 w-4 rounded-md text-[#2B9348] border-white/20 focus:ring-[#F1FEC8] cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={handleAddQuestion}
                    className="w-full py-2.5 mt-4 bg-[#F1FEC8] hover:bg-[#E5F5B8] text-[#3C1A47] font-extrabold rounded-xl text-center transition-colors shadow-lg cursor-pointer"
                  >
                    Confirm & Add to Sequence
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Questionnaire Live Preview */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5F5B8] shadow-sm flex flex-col min-h-[500px]">
            <div className="border-b border-[#E5F5B8] pb-3 mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-[#3C1A47] font-display flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-[#2B9348]" />
                Interactive Live Preview
              </span>
              <span className="text-[9px] font-mono font-bold text-[#2B9348] bg-[#2B9348]/10 px-2 py-0.5 rounded-md uppercase">
                Mock UI Sandbox
              </span>
            </div>

            <p className="text-xs text-[#8395A7] mb-4 text-left leading-relaxed">
              This sandbox emulates exactly how your generated questions are rendered to the end-user inside the <strong>Manaz AI Wizard Form</strong>. Try typing in real responses!
            </p>

            <div className="space-y-4 text-left flex-1">
              {steps.map((q) => (
                <div key={q.id} className="space-y-1.5 border-b border-[#E5F5B8]/40 pb-3 last:border-0">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-bold text-[#3C1A47] flex items-center gap-1">
                      {q.label}
                      {q.required && <span className="text-red-500">*</span>}
                    </label>
                    <span className="text-[9px] font-mono text-[#8395A7]">{q.id}</span>
                  </div>

                  <p className="text-[11px] text-[#3C1A47]/80 italic">
                    "{q.questionText}"
                  </p>

                  {q.type === 'textarea' ? (
                    <textarea 
                      placeholder={q.placeholder}
                      className="w-full bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                      rows={2}
                    />
                  ) : q.type === 'select' ? (
                    <select className="w-full bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden">
                      <option value="">Choose an option...</option>
                      {q.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : q.type === 'date' ? (
                    <input 
                      type="date"
                      className="w-full bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                    />
                  ) : (
                    <div className="relative">
                      {q.type === 'currency' && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3C1A47]/60 font-mono">₹</span>
                      )}
                      <input 
                        type={q.type === 'number' || q.type === 'currency' ? 'number' : q.type === 'email' ? 'email' : 'text'}
                        placeholder={q.placeholder}
                        className={`w-full bg-[#F1FEC8]/10 border border-[#E5F5B8] rounded-xl py-2 text-xs focus:outline-hidden ${q.type === 'currency' ? 'pl-7 pr-3' : 'px-3'}`}
                      />
                    </div>
                  )}

                  {q.helpText && (
                    <p className="text-[9px] text-[#8395A7]">
                      {q.helpText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-vanilla-secondary/50 rounded-xl p-3 border border-vanilla-main/40 mt-4 flex items-center gap-2.5 text-left">
              <FileText className="h-4 w-4 text-[#3C1A47] shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold text-[#3C1A47] block">Auto-Mapping Enabled</span>
                <span className="text-[9px] text-text-light">Values entered in this wizard will map directly to matching draft sections.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
