const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentAgent.tsx', 'utf8');

// Find the section that renders the form
const formStart = `                  <div className="space-y-3">
                    {questions.map((q) => {
                      if (q.id === 'profile_prefill_confirmation') return null;

                      const isRequired = q.required;
                      const currentVal = answers[q.id] || '';

                      return (`;

if (code.includes(formStart)) {
  const wizardImplementation = `
                  {/* Wizard Progress Indicator */}
                  <div className="mb-6 flex items-center gap-2">
                    {Array.from({ length: Math.ceil(questions.filter(q => q.id !== 'profile_prefill_confirmation').length / 3) }).map((_, idx) => (
                      <div key={idx} className="flex-1 h-1.5 rounded-full bg-vanilla-main overflow-hidden">
                        <div className={\`h-full transition-all duration-300 \${idx < formWizardStep ? 'bg-[#3C1A47]' : idx === formWizardStep ? 'bg-brand-primary' : 'bg-transparent'}\`} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {questions.filter(q => q.id !== 'profile_prefill_confirmation').slice(formWizardStep * 3, (formWizardStep + 1) * 3).map((q) => {
                      const isRequired = q.required;
                      const currentVal = answers[q.id] || '';

                      return (`;
                      
  code = code.replace(formStart, wizardImplementation);

  // Now replace the buttons
  const buttonsStart = `                  <div className="flex items-center gap-3 pt-4 border-t border-vanilla-main mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        const missing = questions.filter(q => q.id !== 'profile_prefill_confirmation' && q.required && !answers[q.id]);
                        if (missing.length > 0) {
                          const errMsg = \`Please answer all required fields: \${missing.map(m => m.label).join(', ')}\`;
                          setValidationError(errMsg);
                          triggerNotification(errMsg, 'error');
                          return;
                        }
                        setDraftStage('review');
                        triggerNotification('Summary draft compiled!', 'success');
                      }}
                      className="flex-1 py-3 bg-[#3C1A47] text-[#F1FEC8] border border-[#E5F5B8]/30 hover:opacity-95 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-4 w-4" />
                      Continue to Summary Review
                    </button>
                  </div>`;
                  
  const wizardButtons = `                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-vanilla-main mt-6">
                    {formWizardStep > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormWizardStep(prev => prev - 1)}
                        className="py-2.5 px-4 bg-vanilla-secondary text-brand-secondary hover:bg-vanilla-main text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const currentQs = questions.filter(q => q.id !== 'profile_prefill_confirmation').slice(formWizardStep * 3, (formWizardStep + 1) * 3);
                        const missing = currentQs.filter(q => q.required && !answers[q.id]);
                        if (missing.length > 0) {
                          const errMsg = \`Please answer all required fields in this step.\`;
                          setValidationError(errMsg);
                          triggerNotification(errMsg, 'error');
                          return;
                        }
                        
                        const totalSteps = Math.ceil(questions.filter(q => q.id !== 'profile_prefill_confirmation').length / 3);
                        if (formWizardStep < totalSteps - 1) {
                           setFormWizardStep(prev => prev + 1);
                        } else {
                           setDraftStage('review');
                           triggerNotification('Summary draft compiled!', 'success');
                        }
                      }}
                      className="flex-1 py-3 bg-[#3C1A47] text-[#F1FEC8] border border-[#E5F5B8]/30 hover:opacity-95 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {formWizardStep < Math.ceil(questions.filter(q => q.id !== 'profile_prefill_confirmation').length / 3) - 1 ? (
                        <>Continue <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        <><FileCheck className="h-4 w-4" /> Review Summary</>
                      )}
                    </button>
                  </div>`;
                  
  code = code.replace(buttonsStart, wizardButtons);
}

fs.writeFileSync('src/components/DocumentAgent.tsx', code);
