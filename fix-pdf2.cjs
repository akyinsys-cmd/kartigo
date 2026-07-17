const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

const overlayUI = `
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-vanilla-secondary/80 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-brand-primary/20 max-w-sm w-full mx-4 text-center">
            <h3 className="text-sm font-bold text-brand-secondary mb-4 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
              Generating Pristine PDF...
            </h3>
            <div className="w-full h-2 bg-vanilla-main rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary transition-all duration-300"
                style={{ width: \`\${pdfProgress}%\` }}
              />
            </div>
            <p className="text-[10px] text-text-light font-mono mt-2 font-bold">{Math.round(pdfProgress)}% COMPLETE</p>
          </div>
        </div>
      )}
`;

c = c.replace(/(\<div className=\{`\$\{isFullscreen \? 'fixed inset-0 z-\[9999\] bg-\[#F1FEC8\] p-0 overflow-hidden' : 'min-h-screen bg-vanilla-main\/30 z-50'\}` flex flex-col relative`\}>)/, '$1' + overlayUI);

fs.writeFileSync('src/components/DocumentEditor.tsx', c);
