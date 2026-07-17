const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

if (!c.includes('const [highContrastMode')) {
  c = c.replace(/  const \[isAdminOpen, setIsAdminOpen\] = useState\(false\);/, "  const [isAdminOpen, setIsAdminOpen] = useState(false);\n  const [highContrastMode, setHighContrastMode] = useState(false);");
}

if (!c.includes('useEffect(() => {\\n    if (highContrastMode) {\\n      document.body.classList.add')) {
  c = c.replace(/  useEffect\(\(\) => \{\n    \/\/ Handle splash screen timer/, "  useEffect(() => {\n    if (highContrastMode) {\n      document.body.classList.add('high-contrast-mode');\n    } else {\n      document.body.classList.remove('high-contrast-mode');\n    }\n  }, [highContrastMode]);\n\n  useEffect(() => {\n    // Handle splash screen timer");
}

const adminButtons = `
                    {/* Log Application State */}
                    <div className="pt-2 border-t border-vanilla-main/60">
                      <button
                        onClick={() => {
                          console.log("=== APP STATE LOG ===");
                          console.log("Current User Profile:", profile || "Not logged in");
                          console.log("Active View:", currentView);
                          console.log("Dashboard Tab:", dashboardTab);
                          alert("App state logged to browser console.");
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white border border-transparent text-[10px] font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Layout className="h-3.5 w-3.5" />
                        Log Application State
                      </button>
                    </div>

                    {/* High Contrast Mode Toggle */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-vanilla-secondary border border-vanilla-main/60 mt-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Layout className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="text-xs font-bold text-brand-secondary">High Contrast Mode</span>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-normal">
                          Accessible high-contrast colors.
                        </p>
                      </div>
                      <button
                        onClick={() => setHighContrastMode(!highContrastMode)}
                        className="focus:outline-hidden hover:scale-105 active:scale-95 transition-all duration-300 ease-out shrink-0"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={highContrastMode ? 'on' : 'off'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {highContrastMode ? (
                              <ToggleRight className="h-7 w-7 text-brand-primary" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-text-light" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
`;

c = c.replace(/                    \{\/\* Mock PDF Export \*\/\}/, adminButtons.trim() + '\\n\\n                    {/* Mock PDF Export */}');

// Update preset options and logic
c = c.replace(/\} else if \(preset === 'clean'\) \{/, "} else if (preset === 'clean') {");
c = c.replace(/setShowAds\(false\);\n                              setDebugOutlines\(false\);\n                            \}/, "setShowAds(false);\n                              setDebugOutlines(false);\n                            } else if (preset === 'dev-debug') {\n                              setShowAds(true);\n                              setDebugOutlines(true);\n                            }");

if (!c.includes('Developer Debug')) {
  c = c.replace(/\<option value="clean"\>Clean\/Minimal \(No Ads, UI Only\)\<\/option\>/, '<option value="clean">Clean/Minimal (No Ads, UI Only)</option>\n                          <option value="dev-debug">Developer Debug</option>');
}

fs.writeFileSync('src/App.tsx', c);
