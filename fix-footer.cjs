const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

const footer = `
      {/* Editor Footer */}
      <div className="bg-vanilla-secondary/80 border-t border-vanilla-main/60 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-text-light uppercase tracking-wider shrink-0 mt-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Secure Draft</span>
          <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Words: <span className="text-brand-secondary">{wordCount}</span></span>
          <span className="flex items-center gap-1.5 hidden sm:flex"><Clock className="h-3 w-3" /> Est. Read: <span className="text-brand-secondary">{Math.max(1, Math.ceil(wordCount / 200))} mins</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span>{saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Auto-saving...' : 'Draft Unsaved'}</span>
        </div>
      </div>
`;
c = c.replace(/    <\/div>\n  \);\n\}/, footer + '    </div>\n  );\n}');
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
