const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

c = c.replace(
  /const \[saveStatus, setSaveStatus\] = useState<'idle' \| 'saving' \| 'saved' \| 'error'>\('saved'\);/,
  `const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');\n  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);\n  const [pdfProgress, setPdfProgress] = useState(0);`
);

const downloadPdfFunc = `  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress(10);
    setSaveStatus('saving');
    
    // Simulate generation progress visually
    const progressInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.2;
      });
    }, 400);

    try {
      // Create a pristine, beautifully-styled container for the off-screen PDF render
      const printContainer = document.createElement('div');
      printContainer.style.padding = '15mm 15mm';
      printContainer.style.background = '#ffffff';
      printContainer.style.color = '#111111';
      printContainer.style.fontFamily = '"Times New Roman", Times, Georgia, serif';
      printContainer.style.fontSize = '10.5pt';
      printContainer.style.lineHeight = '1.5';
      printContainer.style.boxSizing = 'border-box';
      
      // Top header layout
      const headerDiv = document.createElement('div');
      headerDiv.style.display = 'flex';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.borderBottom = '1px solid #cbd5e1';
      headerDiv.style.paddingBottom = '6px';
      headerDiv.style.marginBottom = '20px';
      headerDiv.style.fontSize = '8pt';
      headerDiv.style.fontWeight = 'bold';
      headerDiv.style.color = '#64748b';
      headerDiv.style.textTransform = 'uppercase';
      headerDiv.style.letterSpacing = '0.07em';
      headerDiv.innerHTML = \`<span>KARTIGO DRAFT</span><span>\${title}</span>\`;
      printContainer.appendChild(headerDiv);

      // Main Document Title
      const titleEl = document.createElement('h1');
      titleEl.style.fontSize = '17pt';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.color = '#0f172a';
      titleEl.style.marginBottom = '25px';
      titleEl.style.textAlign = 'center';
      titleEl.style.lineHeight = '1.3';
      titleEl.innerText = title;
      printContainer.appendChild(titleEl);

      // Render Markdown to HTML and inject
      const contentDiv = document.createElement('div');
      contentDiv.className = 'prose max-w-none';
      contentDiv.style.textAlign = 'justify';
      contentDiv.innerHTML = renderMarkdownToHtml(content);
      
      // Fine-grained styling overrides for print elements
      const paragraphs = contentDiv.getElementsByTagName('p');
      for (let i = 0; i < paragraphs.length; i++) {
        paragraphs[i].style.marginBottom = '12px';
        paragraphs[i].style.fontSize = '10.5pt';
        paragraphs[i].style.color = '#1e293b';
        paragraphs[i].style.lineHeight = '1.6';
      }
      
      const h1s = contentDiv.getElementsByTagName('h1');
      for (let i = 0; i < h1s.length; i++) {
        h1s[i].style.fontSize = '14pt';
        h1s[i].style.fontWeight = 'bold';
        h1s[i].style.marginTop = '22px';
        h1s[i].style.marginBottom = '10px';
        h1s[i].style.color = '#0f172a';
        h1s[i].style.borderBottom = '1px solid #f1f5f9';
        h1s[i].style.paddingBottom = '4px';
      }

      const h2s = contentDiv.getElementsByTagName('h2');
      for (let i = 0; i < h2s.length; i++) {
        h2s[i].style.fontSize = '12pt';
        h2s[i].style.fontWeight = 'bold';
        h2s[i].style.marginTop = '18px';
        h2s[i].style.marginBottom = '8px';
        h2s[i].style.color = '#1e293b';
      }

      const h3s = contentDiv.getElementsByTagName('h3');
      for (let i = 0; i < h3s.length; i++) {
        h3s[i].style.fontSize = '11pt';
        h3s[i].style.fontWeight = 'bold';
        h3s[i].style.marginTop = '14px';
        h3s[i].style.marginBottom = '6px';
        h3s[i].style.color = '#334155';
      }

      const lists = contentDiv.getElementsByTagName('li');
      for (let i = 0; i < lists.length; i++) {
        lists[i].style.fontSize = '10.5pt';
        lists[i].style.marginBottom = '6px';
        lists[i].style.color = '#1e293b';
      }

      const tables = contentDiv.getElementsByTagName('table');
      for (let i = 0; i < tables.length; i++) {
        tables[i].style.width = '100%';
        tables[i].style.borderCollapse = 'collapse';
        tables[i].style.marginTop = '16px';
        tables[i].style.marginBottom = '16px';
        tables[i].style.fontSize = '9.5pt';
      }

      const ths = contentDiv.getElementsByTagName('th');
      for (let i = 0; i < ths.length; i++) {
        ths[i].style.border = '1px solid #cbd5e1';
        ths[i].style.padding = '8px';
        ths[i].style.backgroundColor = '#f8fafc';
        ths[i].style.textAlign = 'left';
        ths[i].style.fontWeight = 'bold';
      }

      const tds = contentDiv.getElementsByTagName('td');
      for (let i = 0; i < tds.length; i++) {
        tds[i].style.border = '1px solid #cbd5e1';
        tds[i].style.padding = '8px';
      }

      printContainer.appendChild(contentDiv);

      // Bottom footer layout
      const footerDiv = document.createElement('div');
      footerDiv.style.display = 'flex';
      footerDiv.style.justifyContent = 'space-between';
      footerDiv.style.borderTop = '1px solid #cbd5e1';
      footerDiv.style.paddingTop = '8px';
      footerDiv.style.marginTop = '35px';
      footerDiv.style.fontSize = '7.5pt';
      footerDiv.style.fontWeight = 'bold';
      footerDiv.style.color = '#94a3b8';
      footerDiv.style.textTransform = 'uppercase';
      footerDiv.style.letterSpacing = '0.07em';
      footerDiv.innerHTML = \`<span>DRAFT ID: \${documentId.substring(0, 8)}</span><span>CONFIDENTIAL & SECURE</span>\`;
      printContainer.appendChild(footerDiv);

      // Options configuration for html2pdf.js
      const opt = {
        margin: [15, 15, 15, 15], // 15mm print margins
        filename: \`\${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf\`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, // Crisp high-fidelity resolution
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Execute pdf rendering
      await html2pdf().from(printContainer).set(opt).save();
      
      setPdfProgress(100);
      clearInterval(progressInterval);
      triggerNotification("PDF exported successfully! Your download has started.", "success");
      
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfProgress(0);
      }, 2000);
      
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsGeneratingPdf(false);
      setPdfProgress(0);
      console.error("PDF download failed", err);
      triggerNotification("Failed to generate offline PDF.", "error");
    } finally {
      setSaveStatus('saved');
    }
  };`;

c = c.replace(/  const handleDownloadPdf = async \(\) => \{[\s\S]*?  \};\n/, downloadPdfFunc + '\n');

// Also inject the progress bar UI near the document header or absolute overlay
const overlayUI = `
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-vanilla-secondary/80 backdrop-blur-sm">
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

c = c.replace(/(return \(\n\s*<div className="flex flex-col h-full bg-\[#FDFCF6\]">)/, '$1' + overlayUI);

fs.writeFileSync('src/components/DocumentEditor.tsx', c);
