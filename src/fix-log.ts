import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filepath) => {
  if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts')) return;
  const original = fs.readFileSync(filepath, 'utf8');
  let result = original;

  result = result.replace(/logActivity\(LogAction/g, "logActivity(schoolId, LogAction");
  
  if (original !== result) {
    fs.writeFileSync(filepath, result);
    console.log(`Updated ${filepath}`);
  }
});
