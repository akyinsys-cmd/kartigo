const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

c = c.replace(/                  readOnly={isReadOnly}\n                  readOnly={isReadOnly}/, "                  readOnly={isReadOnly}");
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
