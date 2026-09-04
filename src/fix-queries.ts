import fs from 'fs';
import path from 'path';

function replaceInFile(filepath: string, replacements: {from: RegExp, to: string}[]) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;
  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }
  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated ${filepath}`);
  }
}

replaceInFile('src/pages/Chemicals.tsx', [
  {from: /getUserCollection\(schoolId, 'equipment'\)/g, to: "getUserCollection(schoolId, 'chemicals')"}
]);

replaceInFile('src/pages/ChemicalStorage.tsx', [
  {from: /getUserCollection\(schoolId, 'equipment'\)/g, to: "getUserCollection(schoolId, 'chemicals')"}
]);

replaceInFile('src/pages/Teachers.tsx', [
  {from: /getUserCollection\(schoolId, 'equipment'\)/g, to: "getUserCollection(schoolId, 'teachers')"}
]);

replaceInFile('src/pages/LabExperiments.tsx', [
  {from: /const q = query\(getUserCollection\(schoolId, 'equipment'\)/g, to: "const q = query(getUserCollection(schoolId, 'experiment_logs')"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\)/g, to: "await addDoc(getUserCollection(schoolId, 'experiment_logs')"},
  {from: /batch\.delete\(doc\(getUserCollection\(schoolId, 'equipment'\)/g, to: "batch.delete(doc(getUserCollection(schoolId, 'experiment_logs')"},
  {from: /chemSnap = await getDocs\(query\(getUserCollection\(schoolId, 'equipment'\)\)\);/g, to: "chemSnap = await getDocs(query(getUserCollection(schoolId, 'chemicals')));"},
  {from: /glassSnap = await getDocs\(query\(getUserCollection\(schoolId, 'equipment'\)\)\);/g, to: "glassSnap = await getDocs(query(getUserCollection(schoolId, 'equipment')));"}
]);

replaceInFile('src/pages/ActivityRequest.tsx', [
  {from: /unsubTeachers = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers')"},
  {from: /unsubEquip = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment')"},
  {from: /unsubChem = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubChem = onSnapshot(getUserCollection(schoolId, 'chemicals')"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\)/g, to: "await addDoc(getUserCollection(schoolId, 'activity_requests')"}
]);

replaceInFile('src/pages/LoanRequest.tsx', [
  {from: /unsubTeachers = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers')"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\)/g, to: "await addDoc(getUserCollection(schoolId, 'loan_requests')"}
]);

replaceInFile('src/pages/FollowUpRegistry.tsx', [
  {from: /const q = query\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "const q = query(getUserCollection(schoolId, 'teachers'));"}
]);

replaceInFile('src/pages/Dashboard.tsx', [
  {from: /unsubReports = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubReports = onSnapshot(getUserCollection(schoolId, 'reports')"},
  {from: /unsubExps = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubExps = onSnapshot(getUserCollection(schoolId, 'experiment_logs')"},
  {from: /unsubEquip = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubEquip = onSnapshot(getUserCollection(schoolId, 'equipment')"},
  {from: /unsubChem = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubChem = onSnapshot(getUserCollection(schoolId, 'chemicals')"},
  {from: /unsubTeachers = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubTeachers = onSnapshot(getUserCollection(schoolId, 'teachers')"},
  {from: /unsubIncidents = onSnapshot\(getUserCollection\(schoolId, 'equipment'\)/g, to: "unsubIncidents = onSnapshot(getUserCollection(schoolId, 'safety_incidents')"},
  {from: /docRef = doc\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "docRef = doc(getUserCollection(schoolId, 'tasks'));"},
  {from: /getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "getDocs(getUserCollection(schoolId, 'tasks'));"},
  {from: /docRef = doc\(getUserCollection\(schoolId, 'equipment'\), update.id\);/g, to: "docRef = doc(getUserCollection(schoolId, 'tasks'), update.id);"},
  {from: /chemSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "chemSnap = await getDocs(getUserCollection(schoolId, 'chemicals'));"},
  {from: /equipSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "equipSnap = await getDocs(getUserCollection(schoolId, 'equipment'));"},
  {from: /teachSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "teachSnap = await getDocs(getUserCollection(schoolId, 'teachers'));"}
]);

replaceInFile('src/pages/Reports.tsx', [
  {from: /chemSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "chemSnap = await getDocs(getUserCollection(schoolId, 'chemicals'));"},
  {from: /equipSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "equipSnap = await getDocs(getUserCollection(schoolId, 'equipment'));"},
  {from: /teacherSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "teacherSnap = await getDocs(getUserCollection(schoolId, 'teachers'));"},
  {from: /incidentSnap = await getDocs\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "incidentSnap = await getDocs(getUserCollection(schoolId, 'safety_incidents'));"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\)/g, to: "await addDoc(getUserCollection(schoolId, 'reports')"}
]);

replaceInFile('src/pages/Safety.tsx', [
  {from: /qEquip = query\(getUserCollection\(schoolId, 'equipment'\)\);/g, to: "qEquip = query(getUserCollection(schoolId, 'equipment'));"},
  {from: /qIncidents = query\(getUserCollection\(schoolId, 'equipment'\)/g, to: "qIncidents = query(getUserCollection(schoolId, 'safety_incidents')"},
  {from: /doc\(getUserCollection\(schoolId, 'equipment'\), editingEquip.id\)/g, to: "doc(getUserCollection(schoolId, 'equipment'), editingEquip.id)"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\), \{\n\s*name/g, to: "await addDoc(getUserCollection(schoolId, 'equipment'), {\n              name"},
  {from: /await addDoc\(getUserCollection\(schoolId, 'equipment'\), \{\n\s*title/g, to: "await addDoc(getUserCollection(schoolId, 'safety_incidents'), {\n              title"},
  {from: /updateDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), incident.id\)/g, to: "updateDoc(doc(getUserCollection(schoolId, 'safety_incidents'), incident.id)"},
  {from: /deleteDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), id/g, to: "deleteDoc(doc(getUserCollection(schoolId, 'safety_incidents'), id"}
]);

// Wait, I should just fix safety manually or with a better script. Let's start with these.
