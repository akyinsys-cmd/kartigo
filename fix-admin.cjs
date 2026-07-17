const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const mockPdfBtn = `
                    {/* Mock PDF Export */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={async () => {
                          const { generatePdf } = await import('./lib/document-generator');
                          const blob = await generatePdf("# Mock PDF Test\\n\\nThis is a diagnostic output generated from the Admin Control Center.", { title: "Diagnostic PDF Export" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', 'diagnostic-test.pdf');
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          alert("Diagnostic PDF exported successfully.");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Execute Mock PDF Export
                      </button>
                    </div>
`;

c = c.replace(/                    \{\/\* Admin Access \*\/\}/, mockPdfBtn + '\n                    {/* Admin Access */}');

// Make sure FileDown is imported
if (!c.includes('FileDown,')) {
  c = c.replace(/Globe, /, 'Globe, FileDown, ');
}

fs.writeFileSync('src/App.tsx', c);
