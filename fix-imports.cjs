const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

if (!c.includes('Clock,')) {
  c = c.replace(/AlertCircle, FileText, ChevronRight, /, 'AlertCircle, FileText, ChevronRight, Clock, ');
}
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
