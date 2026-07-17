const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentAgent.tsx', 'utf8');

c = c.replace(/<h3 className="text-base font-bold text-brand-secondary mb-1">⚡ Quick Form<\/h3>\s*<p className="text-\[11px\] text-text-light leading-relaxed">\s*Complete a structured 2–3 minute wizard. Best for speed and clarity.\s*<\/p>/g, '<h3 className="text-base font-bold text-brand-secondary mb-1">⚡ Quick Form (Recommended)</h3>\n                    <p className="text-[11px] text-text-light leading-relaxed">\n                      Recommended for faster document creation. A dynamic form is generated based on the selected document.\n                    </p>');

c = c.replace(/<p className="text-\[11px\] text-text-light leading-relaxed">\s*Discuss your requirements conversationally with Manaz, our AI assistant.\s*<\/p>/g, '<p className="text-[11px] text-text-light leading-relaxed">\n                      Chat naturally with our AI. Manaz will ask relevant questions to build your document.\n                    </p>');

fs.writeFileSync('src/components/DocumentAgent.tsx', c);
