const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

const crossSellCode = `
            {/* Cross-Sell Recommendations */}
            <div className="bg-vanilla-secondary border border-vanilla-main rounded-2xl p-6 mt-8 no-print text-left">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-brand-secondary">Recommended Next Steps</h4>
              </div>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed font-medium">
                Based on your {documentType || 'document'}, users typically create these companion documents.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Employment Agreement', 'Non-Disclosure Agreement (NDA)', 'HR Policy Guide'].map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => alert('Starting new document: ' + rec)}
                    className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-vanilla-main/60 hover:border-brand-primary/40 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-brand-secondary group-hover:text-brand-primary transition-colors text-left">{rec}</span>
                    <span className="text-[10px] font-mono text-text-light uppercase tracking-wider text-left">Start Drafting <ArrowRight className="h-3 w-3 inline" /></span>
                  </button>
                ))}
              </div>
            </div>
`;

c = c.replace(/\<\/div\>\s*\{\/\* Quick Context Float Action menu \*\/\}/, crossSellCode + '\n            </div>\n\n            {/* Quick Context Float Action menu */}');

fs.writeFileSync('src/components/DocumentEditor.tsx', c);
