const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(/\);\s*setTimeout\(resolve, 3000\);\s*\}\);\s*\}/g, '');

fs.writeFileSync('src/pages/Login.tsx', content);
