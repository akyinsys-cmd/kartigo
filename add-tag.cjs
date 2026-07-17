const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

c = c.replace(
  /const \[isLoaded, setIsLoaded\] = useState\(false\);/,
  `const [isLoaded, setIsLoaded] = useState(false);\n  const [documentTag, setDocumentTag] = useState<string>('');\n  const [isTagging, setIsTagging] = useState(false);`
);

const autoTagFunc = `
  const handleAutoTag = async () => {
    setIsTagging(true);
    try {
      const response = await fetch('/api/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (data.tag) {
        setDocumentTag(data.tag);
        triggerNotification(\`Document tagged as: \${data.tag}\`, "success");
      }
    } catch (err) {
      triggerNotification("Failed to auto-tag document.", "error");
    } finally {
      setIsTagging(false);
    }
  };
`;

c = c.replace(/  const handleDownloadDocx = async \(\) => \{/, autoTagFunc + '\n  const handleDownloadDocx = async () => {');

const headerUI = `
                      className="text-sm font-extrabold font-display text-brand-secondary hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      {title} <Edit3 className="h-3 w-3 text-text-light opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h1>
                  )}
                  {documentTag && (
                    <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-wider rounded-md">
                      {documentTag}
                    </span>
                  )}
                  <button 
                    onClick={handleAutoTag}
                    disabled={isTagging}
                    className="ml-2 px-2 py-1 bg-vanilla-secondary hover:bg-vanilla-main text-[10px] font-bold text-text-secondary rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isTagging ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-brand-primary" />}
                    Auto-Tag
                  </button>
`;

c = c.replace(/                      className="text-sm font-extrabold font-display text-brand-secondary hover:underline cursor-pointer flex items-center gap-1\.5"\n                    >\n                      \{title\} \<Edit3 className="h-3 w-3 text-text-light opacity-0 group-hover:opacity-100 transition-opacity" \/\>\n                    \<\/h1\>\n                  \)\}/, headerUI);

fs.writeFileSync('src/components/DocumentEditor.tsx', c);
