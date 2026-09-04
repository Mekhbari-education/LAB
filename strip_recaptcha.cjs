const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Replace the recaptcha block in login
content = content.replace(/\s*\/\/\s*Execute reCAPTCHA Enterprise\s*const siteKey = import\.meta\.env\.VITE_RECAPTCHA_SITE_KEY;\s*if \(siteKey && window\.grecaptcha\?\.enterprise\) {[\s\S]*?}\s*}\s*/g, '\n');

fs.writeFileSync('src/pages/Login.tsx', content);
