const fs = require('fs');
let c = fs.readFileSync('src/components/DocumentEditor.tsx', 'utf8');

c = c.replace(/  const \[isReadOnly, setIsReadOnly\] = useState\(false\);\n  const \[isReadOnly, setIsReadOnly\] = useState\(false\);/, "  const [isReadOnly, setIsReadOnly] = useState(false);");
fs.writeFileSync('src/components/DocumentEditor.tsx', c);
