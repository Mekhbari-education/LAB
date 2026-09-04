import fs from 'fs';
function replaceInFile(filepath: string, replacements: {from: RegExp, to: string}[]) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;
  for (const r of replacements) content = content.replace(r.from, r.to);
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filepath}`);
  }
}

replaceInFile('src/pages/DailyReport.tsx', [
  {from: /getUserCollection\(schoolId, 'equipment'\)/g, to: "getUserCollection(schoolId, 'daily_reports')"}
]);
