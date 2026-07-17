const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

c = c.replace(/  const \[sidePanel, setSidePanel\] = useState/, "  const [isShareModalOpen, setIsShareModalOpen] = useState(false);\n  const [shareEmail, setShareEmail] = useState('');\n  const [isSharingEmail, setIsSharingEmail] = useState(false);\n  const [sidePanel, setSidePanel] = useState");

const shareModalUI = `
      {/* SHARE VIA EMAIL MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-vanilla-secondary/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-vanilla-main w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="p-4 border-b border-vanilla-main flex items-center justify-between bg-vanilla-secondary/30">
                <h3 className="font-bold text-brand-secondary flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-primary" /> Share Document via Email
                </h3>
                <button onClick={() => setIsShareModalOpen(false)} className="p-1 hover:bg-vanilla-secondary rounded-lg text-text-light cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-xs text-text-light font-medium mb-4">Send a secure link to this document to a collaborator.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1.5">Collaborator Email</label>
                    <input 
                      type="email" 
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full px-3 py-2 bg-vanilla-secondary border border-vanilla-main rounded-xl text-xs font-bold text-brand-secondary focus:outline-hidden focus:border-brand-primary/40"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!shareEmail) return;
                      setIsSharingEmail(true);
                      try {
                        const link = \`\${window.location.origin}/share/\${documentId}\`;
                        await axios.post("/api/email/send", {
                          to: shareEmail,
                          subject: \`Shared Document: \${title}\`,
                          html: \`
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                              <h1 style="color: #6D28D9;">Kartigo Draft</h1>
                              <p>Hi,</p>
                              <p>A document titled <strong>\${title}</strong> has been shared with you.</p>
                              <a href="\${link}" style="display: inline-block; padding: 10px 20px; background-color: #6D28D9; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Document</a>
                            </div>
                          \`
                        });
                        triggerNotification("Email sent successfully!", "success");
                        setIsShareModalOpen(false);
                        setShareEmail('');
                      } catch (err) {
                        console.error(err);
                        triggerNotification("Failed to send email.", "error");
                      } finally {
                        setIsSharingEmail(false);
                      }
                    }}
                    disabled={!shareEmail || isSharingEmail}
                    className="w-full py-2.5 bg-brand-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSharingEmail ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Send Link
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;
c = c.replace(/      \{\/\* NOTIFICATION TOAST \*\/\}/, shareModalUI + '\n      {/* NOTIFICATION TOAST */}');

c = c.replace(/              onClick=\{handleDownloadDocx\}\n              className="px-3 py-2 bg-indigo-600/, `              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              title="Share via Email"
            >
              <Mail className="h-3.5 w-3.5" /> Share Link
            </button>
            <button
              onClick={handleDownloadDocx}
              className="px-3 py-2 bg-indigo-600`);

fs.writeFileSync('src/components/DocumentEditor.tsx', c);
