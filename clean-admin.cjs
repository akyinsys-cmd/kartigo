const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/\\n\\n                    \{\/\* Mock PDF Export \*\/\}/g, '\n                    {/* Mock PDF Export */}');

// Remove duplicate Mock PDF Export block
const parts = c.split('{/* Mock PDF Export */}');
if (parts.length > 2) {
  // It appears more than once
  c = parts[0] + '{/* Mock PDF Export */}' + parts[1] + '{/* Admin Access */}' + parts[2].split('{/* Admin Access */}').slice(1).join('{/* Admin Access */}');
}

fs.writeFileSync('src/App.tsx', c);
