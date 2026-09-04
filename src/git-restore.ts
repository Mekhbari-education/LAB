import { execSync } from 'child_process';
console.log(execSync('git checkout -- src/pages').toString());
