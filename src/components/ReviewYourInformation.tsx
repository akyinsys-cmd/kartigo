import React, { useState } from 'react';
import { 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface QuestionStep {
  id: string;
  label: string;
  questionText: string;
  type: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface ReviewYourInformationProps {
  questions: QuestionStep[];
  answers: Record<string, string>;
  onUpdateAnswer: (fieldId: string, value: string) => void;
  onGenerate: () => void;
  onBackToChat: () => void;
  onBackToForm: () => void;
}

export const ReviewYourInformation: React.FC<ReviewYourInformationProps> = React.memo(({
  questions,
  answers,
  onUpdateAnswer,
  onGenerate,
  onBackToChat,
  onBackToForm
}) => {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const filteredQuestions = questions.filter(q => q.id !== 'profile_prefill_confirmation');
  
  const missingRequiredFields = filteredQuestions.filter(q => q.required && !answers[q.id]);

  const handleStartEdit = (qId: string, currentVal: string) => {
    setEditingFieldId(qId);
    setEditInputValue(currentVal);
    setLocalError(null);
  };

  const handleSaveEdit = (qId: string, required?: boolean) => {
    const trimmedVal = editInputValue.trim();
    if (required && !trimmedVal) {
      setLocalError("This field is required.");
      return;
    }
    onUpdateAnswer(qId, trimmedVal);
    setEditingFieldId(null);
    setLocalError(null);
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setLocalError(null);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <div className="space-y-4 text-left" id="review_your_info_section">
      {/* Header Banner */}
      <div className="bg-[#3C1A47] text-white p-4 rounded-2xl shadow-sm border border-[#E5F5B8]/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-mono uppercase bg-[#2B9348]/40 text-[#F1FEC8] px-2 py-0.5 rounded-md font-bold tracking-wider">
              Verification Engine Active
            </span>
            <span className="text-[9px] font-mono uppercase bg-white/10 text-white px-2 py-0.5 rounded-md font-bold tracking-wider">
              India Market Locked
            </span>
          </div>
          <h4 className="text-base font-extrabold font-display text-white">
            Review Your Information
          </h4>
          <p className="text-[11px] text-[#F1FEC8]/80 leading-relaxed font-semibold mt-1">
            Please verify all values. All prices are auto-locked in Indian Rupees (₹), and dates are formatted in legal DD Month YYYY format. No placeholders or invented data are permitted.
          </p>
        </div>
        <div className="absolute right-3 bottom-0 translate-y-1/4 opacity-10">
          <Sparkles className="h-28 w-28 text-[#F1FEC8]" />
        </div>
      </div>

      {/* Required Validation Alert if any missing */}
      {missingRequiredFields.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-red-800">
              Required Information Missing
            </h5>
            <p className="text-[11px] text-red-700 leading-normal font-semibold">
              The legal draft generator requires valid entries for all mandatory fields. Please edit the highlighted items below to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Field Editor List */}
      <div className="bg-white rounded-2xl p-4 border border-vanilla-main shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-vanilla-main pb-2">
          <h5 className="text-[10px] font-bold text-brand-secondary font-mono uppercase tracking-wider">
            Collected Draft State Keys
          </h5>
          <span className="text-[9px] font-mono text-text-light font-bold">
            {filteredQuestions.length - missingRequiredFields.length}/{filteredQuestions.length} Fields Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredQuestions.map((q) => {
            const isEditing = editingFieldId === q.id;
            const currentVal = answers[q.id] || '';
            const isRequired = q.required;
            const isEmpty = !currentVal.trim();

            return (
              <div 
                key={q.id}
                id={`review_field_${q.id}`}
                className={`p-3 rounded-xl border transition-all relative ${
                  isEditing 
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-100' 
                    : isEmpty && isRequired
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-vanilla-secondary/20 border-vanilla-main hover:border-[#3C1A47]/20 shadow-2xs'
                }`}
              >
                {/* Field Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8395A7] font-bold flex items-center gap-1">
                    {q.label}
                    {isRequired && <span className="text-red-500 font-bold">*</span>}
                  </span>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(q.id, currentVal)}
                      className="p-2.5 text-[#8395A7] hover:text-[#3C1A47] hover:bg-white rounded transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit field"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Field Value or Editor */}
                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    {q.type === 'textarea' ? (
                      <textarea
                        value={editInputValue}
                        onChange={(e) => setEditInputValue(e.target.value)}
                        onFocus={handleInputFocus}
                        className="w-full text-xs font-medium bg-white border border-amber-300 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-[#3C1A47] h-16"
                        autoFocus
                      />
                    ) : q.type === 'select' ? (
                      <select
                        value={editInputValue}
                        onChange={(e) => setEditInputValue(e.target.value)}
                        onFocus={handleInputFocus}
                        className="w-full text-xs font-bold bg-white border border-amber-300 rounded-lg p-2 focus:outline-hidden"
                        autoFocus
                      >
                        <option value="">Select option...</option>
                        {q.options?.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={q.type === 'number' ? 'number' : 'text'}
                        value={editInputValue}
                        onChange={(e) => setEditInputValue(e.target.value)}
                        onFocus={handleInputFocus}
                        className="w-full text-xs font-medium bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#3C1A47]"
                        autoFocus
                      />
                    )}
                    {localError && (
                      <p className="text-[10px] text-red-600 font-bold">{localError}</p>
                    )}
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(q.id, isRequired)}
                        className="px-2 py-1 bg-[#2B9348] text-white text-[10px] font-bold rounded-md hover:opacity-90 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-md hover:bg-gray-300 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-[#3C1A47] break-words">
                    {currentVal ? (
                      currentVal
                    ) : isRequired ? (
                      <span className="text-red-600 bg-red-100/50 px-2 py-0.5 rounded-md font-mono text-[9px] font-extrabold tracking-tight flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 inline shrink-0 text-red-600 animate-bounce" />
                        [MISSING MANDATORY DATA - CLICK EDIT]
                      </span>
                    ) : (
                      <span className="text-gray-400 italic font-medium">[Not Specified]</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons to change views */}
        <div className="flex items-center gap-3 pt-4 border-t border-vanilla-main mt-5">
          <button
            type="button"
            onClick={onBackToForm}
            className="flex-1 py-2.5 bg-vanilla-secondary text-[#3C1A47] hover:bg-vanilla-main/60 text-xs font-bold rounded-xl border border-vanilla-main transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Go to Form Generator
          </button>
          <button
            type="button"
            onClick={onBackToChat}
            className="flex-1 py-2.5 bg-white text-[#3C1A47] hover:bg-vanilla-secondary text-xs font-bold rounded-xl border border-vanilla-main transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Chat with AI Assistant
          </button>
        </div>
      </div>

      {/* Primary Action Panel */}
      <div className="bg-[#3C1A47] text-[#F1FEC8] rounded-[24px] p-5 border border-[#E5F5B8]/30 shadow-lg text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles className="h-32 w-32" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1 bg-[#2B9348]/30 border border-[#2B9348]/40 text-[#F1FEC8] px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            Integrity Check Passed
          </div>
          <h4 className="text-base font-extrabold font-display text-white">
            Ready to Generate Draft?
          </h4>
          <p className="text-xs text-[#F1FEC8]/80 leading-relaxed font-bold">
            All gathered fields will be processed securely using the Gemini legal compiler. It will output a pristine, professional legal contract.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto relative z-10">
          <button
            type="button"
            onClick={() => {
              if (missingRequiredFields.length > 0) {
                setLocalError(`Cannot generate. Missing: ${missingRequiredFields.map(m => m.label).join(', ')}`);
                return;
              }
              onGenerate();
            }}
            disabled={missingRequiredFields.length > 0}
            className={`flex-1 py-3.5 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-display uppercase tracking-wider ${
              missingRequiredFields.length > 0
                ? 'bg-gray-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[#2B9348] to-[#55A630] hover:opacity-95 animate-pulse hover:animate-none'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            Generate High-Fidelity Draft
          </button>
        </div>
      </div>
    </div>
  );
});
