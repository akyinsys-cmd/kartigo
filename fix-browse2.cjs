const fs = require('fs');
let c = fs.readFileSync('src/components/BrowseDocumentsSection.tsx', 'utf8');

c = c.replace(/const regex = new RegExp.*?gi'\);/, "const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');");

c = c.replace(/onOpenComingSoon\(\`Assistant: Draft \$\<HighlightText text=\{doc\.title\} highlight=\{searchQuery\} \/\>\`\);/, "onOpenComingSoon(`Assistant: Draft ${doc.title}`);");

fs.writeFileSync('src/components/BrowseDocumentsSection.tsx', c);
