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

let content = fs.readFileSync('src/pages/BudgetPurchases.tsx', 'utf8');
content = content.replace(/const budgetDoc = await getDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), 'budget'\)\);/, `const budgetDoc = await getDoc(doc(getUserCollection(schoolId, 'budget_config'), 'budget'));`);
content = content.replace(/const supSnap = await getDocs\(query\(getUserCollection\(schoolId, 'equipment'\)\)\);/, `const supSnap = await getDocs(query(getUserCollection(schoolId, 'suppliers')));`);
content = content.replace(/const ordSnap = await getDocs\(query\(getUserCollection\(schoolId, 'equipment'\), orderBy\('date', 'desc'\)\)\);/, `const ordSnap = await getDocs(query(getUserCollection(schoolId, 'purchase_orders'), orderBy('date', 'desc')));`);
content = content.replace(/const chemSnap = await getDocs\(query\(getUserCollection\(schoolId, 'equipment'\)\)\);/, `const chemSnap = await getDocs(query(getUserCollection(schoolId, 'chemicals')));`);

content = content.replace(/await updateDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), currentSupplier\.id\), currentSupplier\);/, `await updateDoc(doc(getUserCollection(schoolId, 'suppliers'), currentSupplier.id), currentSupplier);`);
content = content.replace(/await addDoc\(getUserCollection\(schoolId, 'equipment'\), currentSupplier\);/, `await addDoc(getUserCollection(schoolId, 'suppliers'), currentSupplier);`);

content = content.replace(/await updateDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), currentOrder\.id\), orderData\);/, `await updateDoc(doc(getUserCollection(schoolId, 'purchase_orders'), currentOrder.id), orderData);`);
content = content.replace(/await addDoc\(getUserCollection\(schoolId, 'equipment'\), { \.\.\.orderData, orderNumber: currentOrder\.orderNumber \|\| newOrderNum }\);/, `await addDoc(getUserCollection(schoolId, 'purchase_orders'), { ...orderData, orderNumber: currentOrder.orderNumber || newOrderNum });`);

content = content.replace(/await updateDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), orderId\), { status }\);/, `await updateDoc(doc(getUserCollection(schoolId, 'purchase_orders'), orderId), { status });`);
content = content.replace(/await setDoc\(doc\(getUserCollection\(schoolId, 'equipment'\), 'budget'\), budgetConfig\);/, `await setDoc(doc(getUserCollection(schoolId, 'budget_config'), 'budget'), budgetConfig);`);

fs.writeFileSync('src/pages/BudgetPurchases.tsx', content);
console.log('Updated BudgetPurchases.tsx');
