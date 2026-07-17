const fs = require('fs');
let c = fs.readFileSync('src/components/BrowseDocumentsSection.tsx', 'utf8');

const onOpenDetailStr = `
                          onClick={() => {
                            if (searchQuery) saveSearchToHistory(searchQuery);
                            onOpenDocumentDetail(doc);
                          }}
`;

const onStartDraftingStr = `
                          onClick={() => {
                            if (searchQuery) saveSearchToHistory(searchQuery);
                            if (onStartDrafting) {
                              onStartDrafting(doc.title);
                            } else {
                              onOpenComingSoon(\`Assistant: Draft \${doc.title}\`);
                            }
                          }}
`;

c = c.replace(/onClick=\{\(\) => onOpenDocumentDetail\(doc\)\}/g, onOpenDetailStr.trim());
c = c.replace(/onClick=\{\(\) => \{\s*if \(onStartDrafting\) \{\s*onStartDrafting\(doc\.title\);\s*\} else \{\s*onOpenComingSoon\(\`Assistant: Draft \$\{doc\.title\}\`\);\s*\}\s*\}\}/g, onStartDraftingStr.trim());

fs.writeFileSync('src/components/BrowseDocumentsSection.tsx', c);
