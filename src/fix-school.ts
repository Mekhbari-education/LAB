import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const p = path.resolve(dir, file);
    const stat = fs.statSync(p);
    if (stat && stat.isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  });
}

walk('./src/pages', (filepath) => {
  if (!filepath.endsWith('.tsx')) return;
  const original = fs.readFileSync(filepath, 'utf8');
  let result = original;

  if (result.includes('getUserCollection(') && result.includes('schoolId') && !result.includes('useSchool()')) {
    // Need to import useSchool
    if (!result.includes('from \'../context/SchoolContext\'')) {
      result = result.replace(
        /(import .+?;)/, 
        "$1\nimport { useSchool } from '../context/SchoolContext';"
      );
    }

    // Attempt to inject the hook at start of component
    const functionMatch = result.match(/export default function ([a-zA-Z0-9_]+)\([^)]*\) {/);
    if (functionMatch) {
      result = result.replace(functionMatch[0], `${functionMatch[0]}\n  const { schoolId } = useSchool();`);
    } else {
        const arrowMatch = result.match(/const ([a-zA-Z0-9_]+) = \([^)]*\) => {/);
        if (arrowMatch) {
            result = result.replace(arrowMatch[0], `${arrowMatch[0]}\n  const { schoolId } = useSchool();`);
        }
    }
  }
  
  if (original !== result) {
    fs.writeFileSync(filepath, result);
  }
});
