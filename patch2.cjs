const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

code = code.replace("handleManualSave();", "handleSaveDocument();");

fs.writeFileSync('src/components/DocumentEditor.tsx', code);
