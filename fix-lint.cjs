const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/const tag = response\.text\(\)\.trim\(\);/, 'const tag = response.text.trim();');
fs.writeFileSync('server.ts', server);

let docEd = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');
docEd = docEd.replace(/const opt = \{/, 'const opt: any = {');
fs.writeFileSync('src/components/DocumentEditor.tsx', docEd);
