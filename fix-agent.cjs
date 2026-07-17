const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentAgent.tsx', 'utf8');

const replacement = `
            <div className="flex items-center gap-2">
              <button
                onClick={() => isPaymentVerified ? handleDownloadPdf() : handleUnlock()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                {isPaymentVerified ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isPaymentVerified ? "Download PDF" : "Download"}
              </button>
              <button
                onClick={() => isPaymentVerified ? window.print() : handleUnlock()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vanilla-secondary text-brand-secondary border border-vanilla-main text-[10px] font-bold rounded-lg hover:bg-vanilla-alt transition-all cursor-pointer shadow-sm"
              >
                {isPaymentVerified ? <Printer className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                Print
              </button>
              <button
                onClick={() => isPaymentVerified ? alert("Share dialog opened") : handleUnlock()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vanilla-secondary text-brand-secondary border border-vanilla-main text-[10px] font-bold rounded-lg hover:bg-vanilla-alt transition-all cursor-pointer shadow-sm"
              >
                {isPaymentVerified ? <ExternalLink className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                Share
              </button>
            </div>
`;

c = c.replace(/\<div className="flex items-center gap-2"\>[\s\S]*?\<span className="text-\[10px\] font-bold font-mono text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider"\>\s*Draft Preview Mode\s*\<\/span\>\s*\<\/div\>/, replacement.trim());

fs.writeFileSync('src/components/DocumentAgent.tsx', c);
