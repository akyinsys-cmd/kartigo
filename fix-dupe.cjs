const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

const dupe = `<button
              onClick={handleDownloadDocx}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Download DOCX"
            >
              <FileDown className="h-3.5 w-3.5" /> Download DOCX
            </button>`;

c = c.replace(dupe + dupe, dupe);
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
