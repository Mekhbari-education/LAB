import{r as p,j as e,h as ot}from"./vendor-react-V-qA7iMV.js";import{f as te,i as ge,u as We,e as Ue,m as xe,A as Se,d as he,P as it}from"./index-DoNRr-2I.js";import{A as ct,k as $e,K as dt,z as xt,P as _e,N as Me,M as pt,h as bt}from"./vendor-firebase-DVX7uQCg.js";import{c as ut}from"./geminiService-j0oOPeY2.js";import{aw as Te,x as ye,X as Ie,aD as Ce,bz as ft,b as pe,bA as mt,aT as ht,Q as gt,aA as ze,t as Ae,C as yt,d as Be,e as Le,f as jt,ae as ce,af as de,aO as Ye,A as vt,bB as wt,bC as Nt,bD as Ee,g as kt,bE as $t,at as Dt,i as Ge,v as De,bF as St}from"./vendor-icons-DdoQCnEC.js";import"./vendor-pdf-xlsx-DFxlBnSh.js";import"./vendor-charts-Cu9m5RRG.js";import"./loggingService-6Laqs5vL.js";const Tt=`
ROLE & CONTEXT:
You are an AI Smart Document Generator tailored for educational and administrative institutions in Algeria.
When a user requests a formal administrative internal communication (مراسلة داخلية / سند طلب مصلحي) originating from a department (e.g., مخبر العلوم الطبيعية والفيزيائية) addressed to the school administration (إدارة المؤسسة):

1. CONTEXT SWITCHING:
   - Immediately switch tone and format from a personal handwriting request (طلب شخصي) to an official administrative internal memo/order (سند طلب داخلي / مراسلة داخلية).
   - Apply full official branding structure: Header (Republique/Ministry), Institution Name, Department, Academic Year, Date, Reference Code, Structured Table of Items, Signatures, and Approval Checkboxes.

2. AUTOMATED STRUCTURE & FORMATTING:
   - When generating or formatting an administrative request, generate a fully structured document containing the formatted request.
   - Use proper layout formatting: bold headers, aligned tables for item lists with columns:
     (الرقم, تعيين المادة / الوسيلة, المرجع / المواصفات, الوحدة, الكمية, البيان / الغرض البيداغوجي)
   - Clear separation for administrator signatures and approval checkboxes:
     [ ] مقبول / موافقة تامة    [ ] مؤجل للميزانية القادمة    [ ] مرفوض مع التعليل

3. OUTPUT REQUIREMENTS:
   - Return strict JSON matching the requested schema.
   - Include a ready-to-print Markdown preview in "markdownPreview".
   - At the end of the markdown, include the official Google Doc chip link:
     [📄 فتح وإنشاء مستند Google Docs: مراسلة داخلية — سند طلب مصلحي](https://docs.google.com/document/create)
`;async function Ct(l,d){var N;const b=new Date().getFullYear(),f=`${b-1} / ${b}`,c=new Date().toISOString().split("T")[0],g=te(d.schoolName,d.commune)||"المؤسسة التعليمية";try{const m=await ut({contents:[{role:"user",parts:[{text:Tt},{text:`
بيانات المؤسسة المرجعية:
- اسم المؤسسة: ${g}
- مديرية التربية: ${d.directorate||"مديرية التربية لولاية الجزائر"}
- السنة الدراسية: ${f}
- تاريخ اليوم: ${c}

طلب المستخدم:
"${l}"

المطلوب:
حوّل هذا الطلب إلى مراسلة داخلية / سند طلب مصلحي رسمي متكامل وفق البنية الإدارية المعتمدة في الجزائر بصيغة JSON التالية بدقة:
{
  "title": "سند طلب مصلحي داخلي",
  "department": "مخبر العلوم الطبيعية والحياة",
  "recipient": "السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)",
  "referenceCode": "رقم: 05 / م.ع.ط / 2026",
  "subject": "طلب توفير مستلزمات وتجهيزات مخبرية",
  "contextAndPurpose": "يشرفنا إحاطتكم علماً بحاجة المخبر إلى التزود بالمواد والتجهيزات الموضحة أدناه قصد ضمان سير الأعمال التطبيقية المقررة في المناهج الرسمية في أفضل الظروف البيداغوجية والوقائية.",
  "items": [
    {
      "itemNumber": "01",
      "designation": "مخبر مدرج 100 مل زجاجي",
      "referenceOrSpecs": "فئة A دقة عالية مقاوم للحرارة",
      "unit": "قطعة",
      "quantity": "08",
      "purposeOrNotes": "تجارب قياس الحجوم لسنوات الأولى والثانية ثانوي"
    }
  ],
  "notes": "يرجى التكرم بتسريع الإجراءات نظراً لقرب انطلاق الحصص التطبيقية للثلاثي الجاري.",
  "signers": [
    "مسؤول المخبر / أستاذ المادة",
    "المصالح الاقتصادية (المقتصد)",
    "تأشيرة وموافقة السيد المدير"
  ]
}
`}]}],config:{responseMimeType:"application/json"}}),j=(N=m==null?void 0:m.data)==null?void 0:N.text;if(j){const h=JSON.parse(j.trim()),T=(h.items||[]).map((k,G)=>({id:`item_${Date.now()}_${G}`,itemNumber:k.itemNumber||(G+1).toString().padStart(2,"0"),designation:k.designation||"",referenceOrSpecs:k.referenceOrSpecs||"---",unit:k.unit||"قطعة",quantity:k.quantity||"01",purposeOrNotes:k.purposeOrNotes||""})),u={id:`smart_doc_${Date.now()}`,title:h.title||"سند طلب مصلحي داخلي",department:h.department||"مخبر العلوم والتكنولوجيا",recipient:h.recipient||"السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)",academicYear:f,date:c,referenceCode:h.referenceCode||`رقم: ${Math.floor(Math.random()*80+1).toString().padStart(2,"0")} / مخ / ${b}`,subject:h.subject||"سند طلب مصلحي داخلي لاقتناء عتاد ومواد",contextAndPurpose:h.contextAndPurpose||"يشرفني أن أتقدم إلى سيادتكم المحترمة بهذا السند المصلحي قصد التكرم بالموافقة على تزويد المخبر بالمواد والوسائل المبينة أدناه.",items:T,notes:h.notes||"تم ترتيب المواد وفق درجة الأولوية البيداغوجية لتنفيذ البرامج الرسمية.",signers:h.signers||["مسؤول المخبر / أستاذ المادة","المصالح المادية والمالية (المقتصد)","تأشيرة وموافقة السيد المدير"],approvalOptions:{principalDecision:"pending",principalNotes:"",bursarStatus:"pending",bursarNotes:""},markdownPreview:""};return u.markdownPreview=je(u,d),u}}catch(m){console.warn("AI generation fell back to rule-based template:",m)}return Pe(l,d)}function Pe(l,d){const b=new Date().getFullYear(),f=`${b-1} / ${b}`,c=new Date().toISOString().split("T")[0];let g="سند طلب مصلحي داخلي",N="مخبر العلوم الطبيعية والفيزيائية",m="طلب تزويد المخبر بالعتاد والمواد اللازمة للأعمال التطبيقية",j="يشرفنا التوجه إلى سيادتكم المحترمة بهذا السند المصلحي الداخلي قصد التكرم بالموافقة على توفير المواد والتجهيزات البيداغوجية المبينة في الجدول أدناه، حرصاً على السير الحسن للتجارب والدروس التطبيقية المقررة.",h=[{id:"item_1",itemNumber:"01",designation:"كواشف ومحاليل كيميائية نقية",referenceOrSpecs:"فئة مخبرية نقية مع شهادات السلامة SDS",unit:"لتر / علبة",quantity:"05",purposeOrNotes:"تجارب تفاعلات الأكسدة والإرجاع والتحليل الكيميائي"},{id:"item_2",itemNumber:"02",designation:"أواني وزجاجيات قياسية (مخابر وكؤوس)",referenceOrSpecs:"زجاج بيركس مقاوم للحرارة والصدمات فئة A",unit:"قطعة",quantity:"15",purposeOrNotes:"أفواج السنة الأولى والثانية ثانوي"},{id:"item_3",itemNumber:"03",designation:"أدوات الوقاية والسلامة المخبرية",referenceOrSpecs:"نظارات واقية + قفازات نتريل غير مسببة للحساسية",unit:"علبة",quantity:"03",purposeOrNotes:"حماية التلاميذ وأساتذة المخبر أثناء التجارب"}];l.includes("صيانة")||l.includes("إصلاح")?(g="مراسلة داخلية — طلب صيانة وتأهيل عتاد مخبري",m="طلب صيانة وإصلاح أجهزة ووسائل تعليمية متوقفة",j="نلفت عناية سيادتكم الكريمة إلى وجود عدد من الأجهزة المخبرية الموضحة في الجدول بحاجة ماسة إلى صيانة تقنية متخصصة لإعادة إدماجها في النشاط البيداغوجي.",h=[{id:"item_1",itemNumber:"01",designation:"مجاهر ضوئية ثنائية العينية",referenceOrSpecs:"خلل في المنظومة الضوئية والمكثف",unit:"جهاز",quantity:"04",purposeOrNotes:"دروس علم الأحياء والخلايا النباتية والحيوانية"},{id:"item_2",itemNumber:"02",designation:"ميزان إلكتروني دقيق 0.01g",referenceOrSpecs:"بحاجة إلى معايرة وضبط الحساسية الرقمية",unit:"جهاز",quantity:"02",purposeOrNotes:"قياس كتل الكواشف بدقة متناهية"}]):(l.includes("فيزياء")||l.includes("كهرباء"))&&(N="مخبر العلوم الفيزيائية والتكنولوجيا",m="طلب تزويد مخبر الفيزياء بأجهزة القياس والمولدات الكهربائية",h=[{id:"item_1",itemNumber:"01",designation:"أجهزة قياس متعددة رقمية (Multimètre)",referenceOrSpecs:"دقة عالية مع أسلاك توصيل قياسية محمية",unit:"جهاز",quantity:"06",purposeOrNotes:"دراسة الدارات الكهربائية والظواهر التحريضية"},{id:"item_2",itemNumber:"02",designation:"مولدات تيار مستمر قابلة للضبط 0-30V",referenceOrSpecs:"تثبيت الجهد والتيار مع قاطع أمان ضد القصر",unit:"جهاز",quantity:"04",purposeOrNotes:"تغذية التجارب الكهربائية البيداغوجية"}]);const T={id:`smart_doc_${Date.now()}`,title:g,department:N,recipient:"السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)",academicYear:f,date:c,referenceCode:`رقم: 08 / م.ع / ${b}`,subject:m,contextAndPurpose:j,items:h,notes:"تمت معاينة الاحتياجات الميدانية بالتنسيق مع أساتذة المادة وفق الرزنامة البيداغوجية المقررة.",signers:["مسؤول المخبر / أستاذ المادة","المصالح الاقتصادية (المقتصد)","تأشيرة وموافقة السيد المدير"],approvalOptions:{principalDecision:"pending",principalNotes:"",bursarStatus:"pending",bursarNotes:""},markdownPreview:""};return T.markdownPreview=je(T,d),T}function je(l,d){const b=te(d.schoolName,d.commune)||"المؤسسة التعليمية";return`
# الجمهورية الجزائرية الديمقراطية الشعبية
## وزارة التربية الوطنية
**${d.directorate||"مديرية التربية الوطنية"}** | **${b}**
*السنة الدراسية:* ${l.academicYear} | *التاريخ:* ${l.date} | *المرجع:* ${l.referenceCode}

---

### **${l.title}**
**المصلحة الطالبة:** ${l.department}  
**إلى السيد:** ${l.recipient}  
**الموضوع:** ${l.subject}  

#### السند والبيان الإداري:
${l.contextAndPurpose}

---

### جدول المواد والوسائل المطلوبة:

| الرقم | تعيين المادة / الوسيلة | المرجع / المواصفات | الوحدة | الكمية | البيان / الغرض البيداغوجي |
| :---: | :--- | :--- | :---: | :---: | :--- |
${l.items.map(c=>`| ${c.itemNumber} | ${c.designation} | ${c.referenceOrSpecs} | ${c.unit} | ${c.quantity} | ${c.purposeOrNotes} |`).join(`
`)}

---

${l.notes?`> **ملاحظة وتوجيهات:** ${l.notes}

---`:""}

### تأشيرات والمصادقة الإدارية:
- [ ] **مقبول ومعتمد للتنفيذ الفوري**
- [ ] **مؤجل لميزانية الفصل اللاحق**
- [ ] **مرفوض مع التعليل**

| ${l.signers[0]||"مسؤول المخبر"} | ${l.signers[1]||"المقتصد"} | ${l.signers[2]||"مدير المؤسسة"} |
| :---: | :---: | :---: |
| *(الاسم، التوقيع والختم)* | *(تأشيرة الاعتماد المالي)* | *(المصادقة والختم الرسمي)* |
| بتاريخ: .................... | بتاريخ: .................... | بتاريخ: .................... |

---

### 📎 المرفق الرقمي المعتمد:
> **[📄 فتح وإنشاء مستند Google Docs: ${l.title} — ${l.subject}](https://docs.google.com/document/create)**  
*(تم إعداد التنسيق والجداول تلقائياً؛ يمكنك نسخه أو فتحه مباشرة في Google Docs)*
`.trim()}function Ve(l,d){const b=te(d.schoolName,d.commune)||"المؤسسة التعليمية",f=d.directorate||"مديرية التربية الوطنية";return`
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'
          dir='rtl' lang='ar'>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>${l.title} — ${l.subject}</title>
      <style>
        body {
          font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          font-size: 11.5pt;
          color: #1a1a1a;
          line-height: 1.5;
          direction: rtl;
          text-align: right;
          background: #ffffff;
          padding: 20pt;
        }
        .header-rep {
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 2pt;
        }
        .header-min {
          text-align: center;
          font-weight: bold;
          font-size: 11pt;
          color: #475569;
          margin-bottom: 12pt;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14pt;
        }
        .meta-table td {
          border: none;
          padding: 3pt 0;
          font-size: 11pt;
        }
        .title-box {
          border: 2pt solid #0f766e;
          background-color: #f0fdfa;
          text-align: center;
          padding: 8pt 12pt;
          margin: 12pt 0;
        }
        .title-box h1 {
          font-size: 15pt;
          color: #0f766e;
          margin: 0;
          font-weight: bold;
        }
        .info-panel {
          border: 1pt solid #cbd5e1;
          background-color: #f8fafc;
          padding: 8pt 12pt;
          margin-bottom: 12pt;
        }
        .info-panel p {
          margin: 3pt 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 14pt 0;
          border: 1.5pt solid #0f766e;
        }
        .items-table th {
          background-color: #0f766e;
          color: #ffffff;
          border: 1pt solid #0d9488;
          padding: 7pt 8pt;
          font-weight: bold;
          font-size: 10.5pt;
          text-align: center;
        }
        .items-table td {
          border: 1pt solid #cbd5e1;
          padding: 6pt 8pt;
          font-size: 10pt;
          color: #1e293b;
        }
        .approval-box {
          border: 1pt dashed #0f766e;
          background-color: #f0fdfa;
          padding: 8pt 12pt;
          margin: 12pt 0;
          font-size: 10.5pt;
        }
        .signatures-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24pt;
          border: none;
        }
        .signatures-table td {
          border: none;
          text-align: center;
          vertical-align: top;
          padding: 0 10pt;
          width: 33.33%;
        }
        .sig-header {
          border-top: 1.5pt solid #334155;
          padding-top: 6pt;
          font-weight: bold;
          font-size: 11pt;
          color: #0f172a;
        }
        .sig-space {
          height: 50pt;
          padding-top: 15pt;
          color: #94a3b8;
          font-size: 9pt;
        }
      </style>
    </head>
    <body dir="rtl">
      <div class="header-rep">الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div class="header-min">وزارة التربية الوطنية</div>

      <table class="meta-table" dir="rtl">
        <tr>
          <td style="text-align: right; width: 60%;">
            <div><strong>${f}</strong></div>
            <div><strong>${b}</strong></div>
            <div><strong>السنة الدراسية:</strong> ${l.academicYear}</div>
          </td>
          <td style="text-align: left; width: 40%;" dir="ltr">
            <div><strong>التاريخ:</strong> ${l.date}</div>
            <div><strong>المرجع:</strong> ${l.referenceCode}</div>
          </td>
        </tr>
      </table>

      <div class="title-box">
        <h1>${l.title}</h1>
      </div>

      <div class="info-panel">
        <p><strong>المصلحة / القسم الطالب:</strong> ${l.department}</p>
        <p><strong>إلى السيد:</strong> ${l.recipient}</p>
        <p style="color: #0f766e; font-weight: bold;"><strong>الموضوع:</strong> ${l.subject}</p>
      </div>

      <p style="text-align: justify; line-height: 1.6; margin: 10pt 0;">
        ${l.contextAndPurpose}
      </p>

      <table class="items-table" dir="rtl">
        <thead>
          <tr>
            <th style="width: 35pt;">الرقم</th>
            <th style="text-align: right;">تعيين المادة / الوسيلة</th>
            <th style="text-align: right; width: 110pt;">المرجع والمواصفات</th>
            <th style="width: 45pt;">الوحدة</th>
            <th style="width: 45pt;">الكمية</th>
            <th style="text-align: right;">البيان / الغرض البيداغوجي</th>
          </tr>
        </thead>
        <tbody>
          ${l.items.map((c,g)=>`
            <tr style="background-color: ${g%2===0?"#ffffff":"#f8fafc"};">
              <td style="text-align: center; font-weight: bold;">${c.itemNumber}</td>
              <td style="text-align: right; font-weight: bold;">${c.designation}</td>
              <td style="text-align: right;">${c.referenceOrSpecs}</td>
              <td style="text-align: center;">${c.unit}</td>
              <td style="text-align: center; font-weight: bold;">${c.quantity}</td>
              <td style="text-align: right;">${c.purposeOrNotes}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      ${l.notes?`
        <div style="border-right: 3pt solid #d97706; background-color: #fffbeb; padding: 6pt 10pt; margin: 10pt 0; font-size: 10pt; color: #92400e;">
          <strong>ملاحظة هامة:</strong> ${l.notes}
        </div>
      `:""}

      <div class="approval-box">
        <strong>خانة التأشيرة والمصادقة الإدارية:</strong><br>
        [ &nbsp; ] مقبول ومعتمد للتنفيذ المالي والمادي &nbsp;&nbsp;&nbsp;&nbsp;
        [ &nbsp; ] مؤجل للدورة المالية اللاحقة &nbsp;&nbsp;&nbsp;&nbsp;
        [ &nbsp; ] مرفوض مع التعليل
      </div>

      <table class="signatures-table" dir="rtl">
        <tr>
          ${l.signers.map(c=>`
            <td>
              <div class="sig-header">${c}</div>
              <div class="sig-space">(الاسم، التوقيع والختم الرسمي)</div>
              <div style="font-size: 8pt; color: #64748b;">حرر بتاريخ: ....................</div>
            </td>
          `).join("")}
        </tr>
      </table>
    </body>
    </html>
  `}function zt(l,d){const b=Ve(l,d),f=new Blob(["\uFEFF",b],{type:"application/msword;charset=utf-8"}),c=URL.createObjectURL(f),g=document.createElement("a");g.href=c;const N=(l.title+"_"+l.subject).slice(0,50).replace(/[/\\?%*:|"<>]/g,"_");g.download=`${N}.doc`,document.body.appendChild(g),g.click(),document.body.removeChild(g),setTimeout(()=>URL.revokeObjectURL(c),1e4)}async function At(l,d){const b=te(d.schoolName,d.commune)||"المؤسسة التعليمية";await ge.generateAdministrativeDocumentPDF({title:l.title,reference:l.referenceCode,category:"سند طلب مصلحي",date:l.date,sender:l.department,recipient:l.recipient,subject:l.subject,content:l.contextAndPurpose,notes:l.notes,hasTable:!0,tableHeaders:["الرقم","تعيين المادة / الوسيلة","المرجع والمواصفات","الكمية / الوحدة"],tableRows:l.items.map(f=>[f.itemNumber,f.designation,f.referenceOrSpecs,`${f.quantity} ${f.unit}`]),signers:l.signers,schoolInfo:{country:d.country||"الجمهورية الجزائرية الديمقراطية الشعبية",ministry:d.ministry||"وزارة التربية الوطنية",directorate:d.directorate||"مديرية التربية لولاية الجزائر",school:b,commune:d.commune},fileName:`${l.title}.pdf`,save:!0})}async function Pt(l,d){try{const b=Ve(l,d),f=je(l,d);if(navigator.clipboard&&window.ClipboardItem){const c=new Blob([b],{type:"text/html"}),g=new Blob([f],{type:"text/plain"}),N=new ClipboardItem({"text/html":c,"text/plain":g});return await navigator.clipboard.write([N]),!0}else return await navigator.clipboard.writeText(f),!0}catch(b){return console.error("Clipboard copy error:",b),!1}}const Ot=[{title:"طلب كواشف وزجاجيات لمخبر العلوم",icon:"🧪",prompt:"أريد مراسلة داخلية رسمية من أستاذ مسؤول مخبر العلوم الطبيعية إلى مدير المؤسسة والمقتصد لطلب توفير كواشف كيميائية نقية وأواني زجاجية بيركس للأعمال التطبيقية للثلاثي الثاني."},{title:"طلب صيانة وإصلاح مجاهر ضوئية",icon:"🔬",prompt:"طلب صيانة عاجل لأربعة مجاهر ضوئية ثنائية العينية وميزان إلكتروني دقيق معطلين في مخبر البيولوجيا والعلوم الطبيعية."},{title:"سند طلب أدوات الوقاية والسلامة",icon:"🦺",prompt:"سند طلب مصلحي داخلي موجه للمصالح الاقتصادية لاقتناء نظارات واقية، قفازات نتريل، ومطافئ حريق بودرة لتأمين مخبر العلوم."},{title:"تجهيزات كهربائية لمخبر الفيزياء",icon:"⚡",prompt:"طلب تزويد مخبر العلوم الفيزيائية بأجهزة قياس متعددة (Multimètre) ومولدات تيار مستمر قابلة للضبط 0-30V لدروس الكهرباء."}];function Ft({isOpen:l,onClose:d,onSaveDocument:b}){const{schoolName:f,directorate:c,commune:g}=We(),{openPdfPreview:N}=Ue(),[m,j]=p.useState(""),[h,T]=p.useState(!1),[u,k]=p.useState("editor"),[G,W]=p.useState(!1),[ve,L]=p.useState(!1),[be,re]=p.useState(!1),[A,se]=p.useState(null),[s,P]=p.useState(null),S={schoolName:f,directorate:c,commune:g,country:"الجمهورية الجزائرية الديمقراطية الشعبية",ministry:"وزارة التربية الوطنية"},Y=te(f,g)||"المؤسسة التعليمية";p.useEffect(()=>{if(l&&!s){const n=Pe("طلب كواشف وزجاجيات لمخبر العلوم",S);P(n),j("طلب توفير كواشف كيميائية وزجاجيات مخبرية للأعمال التطبيقية للفصل الدراسي الجاري.")}},[l]);const v=(n,o="success")=>{se({message:n,type:o}),setTimeout(()=>se(null),4e3)},U=async n=>{const o=n||m;if(o.trim()){T(!0);try{const i=await Ct(o,S);P(i),v("تم توليد المراسلة وسند الطلب المصلحي الذكي بنجاح وفق المعايير الرسمية!","success")}catch(i){console.error("Error generating smart document:",i),v("حدث خطأ أثناء التوليد، تم الاعتماد على النموذج التلقائي المقنن.","info");const w=Pe(o,S);P(w)}finally{T(!1)}}},y=(n,o)=>{if(!s)return;const i={...s,[n]:o};i.markdownPreview=je(i,S),P(i)},C=(n,o,i)=>{if(!s)return;const w=[...s.items];w[n]={...w[n],[o]:i},y("items",w)},q=()=>{if(!s)return;const n=(s.items.length+1).toString().padStart(2,"0"),o={id:`item_${Date.now()}`,itemNumber:n,designation:"",referenceOrSpecs:"",unit:"قطعة",quantity:"01",purposeOrNotes:""};y("items",[...s.items,o])},ne=n=>{if(!s)return;const o=s.items.filter((i,w)=>w!==n);y("items",o)},H=async()=>{if(!s)return;await Pt(s,S)&&(L(!0),v("تم نسخ التنسيق والجداول بنجاح! الصق في Google Docs (Ctrl+V)","success"),setTimeout(()=>L(!1),3e3))},ae=async()=>{s&&(await navigator.clipboard.writeText(s.markdownPreview),W(!0),v("تم نسخ نص الـ Markdown بالكامل للحافظة","success"),setTimeout(()=>W(!1),3e3))},_=()=>{s&&(zt(s,S),v("تم تنزيل ملف Word (.doc) بنجاح مطابق تماماً للـ PDF!","success"))},le=async()=>{if(s)try{await At(s,S),v("تم تنزيل ملف PDF بنجاح!","success")}catch(n){console.error("PDF error:",n),v("حدث خطأ أثناء تنزيل PDF","error")}},M=async()=>{if(s)try{const n=await ge.generateAdministrativeDocumentPDF({title:s.title,reference:s.referenceCode,category:"سند طلب مصلحي",date:s.date,sender:s.department,recipient:s.recipient,subject:s.subject,content:s.contextAndPurpose,notes:s.notes,hasTable:!0,tableHeaders:["الرقم","تعيين المادة / الوسيلة","المرجع والمواصفات","الكمية / الوحدة"],tableRows:s.items.map(o=>[o.itemNumber,o.designation,o.referenceOrSpecs,`${o.quantity} ${o.unit}`]),signers:s.signers,schoolInfo:{country:S.country,ministry:S.ministry,directorate:S.directorate,school:Y,commune:S.commune},fileName:`${s.title}.pdf`,save:!1});N({file:n,title:s.title,fileName:`${s.title}.pdf`,category:"سند طلب مصلحي",description:s.subject})}catch(n){console.error("Preview error:",n)}},oe=()=>{if(s){re(!0);try{const n={id:`doc_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,templateId:"smart_generator",title:s.title,category:"requests",date:s.date,reference:s.referenceCode,sender:s.department,recipient:s.recipient,subject:s.subject,content:s.contextAndPurpose,notes:s.notes,rows:s.items.map(o=>({col1:o.itemNumber,col2:o.designation,col3:`${o.quantity} ${o.unit}`,col4:`${o.referenceOrSpecs} — ${o.purposeOrNotes}`})),signers:s.signers,createdAt:new Date().toISOString()};b&&b(n),v("تم حفظ الوثيقة بنجاح في أرشيف وثائقك الإدارية!","success")}catch(n){console.error("Save error:",n),v("حدث خطأ أثناء الحفظ","error")}finally{re(!1)}}};return l?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md rtl overflow-hidden",dir:"rtl",children:e.jsxs(xe.div,{initial:{opacity:0,scale:.96,y:15},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.96,y:15},className:"bg-surface w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl flex flex-col border border-outline-variant/40 overflow-hidden",children:[e.jsx(Se,{children:A&&e.jsxs(xe.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},className:`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 ${A.type==="success"?"bg-emerald-600 text-white":A.type==="error"?"bg-rose-600 text-white":"bg-primary text-white"}`,children:[e.jsx(Te,{size:18}),e.jsx("span",{children:A.message})]})}),e.jsxs("header",{className:"px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/30 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center shadow-md",children:e.jsx(ye,{size:20})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h2",{className:"text-xl font-black text-primary",children:"المولّد الذكي للوثائق والمراسلات الداخلية"}),e.jsx("span",{className:"px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-black border border-primary/20",children:"AI Smart Document Generator"})]}),e.jsx("p",{className:"text-xs text-secondary opacity-80",children:"تحويل الطلبات العادية إلى مراسلات وسندات طلب مصلحية رسمية مع إمكانية التعديل الكامل والربط بـ Google Docs و Word"})]})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsx("button",{onClick:d,className:"p-2 hover:bg-surface-container-high rounded-full text-secondary transition-colors",children:e.jsx(Ie,{size:20})})})]}),e.jsxs("section",{className:"p-4 bg-surface-container-lowest border-b border-outline-variant/30 shrink-0",children:[e.jsxs("div",{className:"flex flex-col md:flex-row gap-2.5",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx("input",{type:"text",value:m,onChange:n=>j(n.target.value),onKeyDown:n=>{n.key==="Enter"&&U()},placeholder:"اكتب فكرة أو طلبك باللغة الطبيعية (مثال: نحتاج توفير كواشف كيميائية لمخبر العلوم مع أنابيب وموازين للثلاثي الثاني)...",className:"w-full bg-surface border-2 border-outline-variant/50 focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none transition-all pl-10"}),e.jsx(Ce,{size:18,className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none"})]}),e.jsx("button",{onClick:()=>U(),disabled:h||!m.trim(),className:"px-6 py-3 bg-gradient-to-r from-primary to-emerald-700 hover:from-primary/90 hover:to-emerald-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0",children:h?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),e.jsx("span",{children:"جاري الصياغة الذكية..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(ye,{size:18}),e.jsx("span",{children:"توليد الوثيقة بالذكاء الاصطناعي"})]})})]}),e.jsxs("div",{className:"flex items-center gap-1.5 overflow-x-auto pt-2.5 no-scrollbar",children:[e.jsx("span",{className:"text-[11px] font-black text-secondary shrink-0 ml-1",children:"نماذج سريعة:"}),Ot.map((n,o)=>e.jsxs("button",{onClick:()=>{j(n.prompt),U(n.prompt)},disabled:h,className:"px-3 py-1 rounded-xl bg-surface hover:bg-primary/10 border border-outline-variant/30 text-xs font-bold text-secondary hover:text-primary transition-all whitespace-nowrap flex items-center gap-1 shrink-0",children:[e.jsx("span",{children:n.icon}),e.jsx("span",{children:n.title})]},o))]})]}),e.jsxs("div",{className:"px-6 pt-3 pb-2 bg-surface-container flex items-center justify-between border-b border-outline-variant/20 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-1 bg-surface-container-high p-1 rounded-2xl border border-outline-variant/30",children:[e.jsxs("button",{onClick:()=>k("editor"),className:`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${u==="editor"?"bg-surface text-primary shadow-xs":"text-secondary hover:text-primary"}`,children:[e.jsx(ft,{size:15}),e.jsx("span",{children:"وضع التعديل الحي (متاح للتعديل)"})]}),e.jsxs("button",{onClick:()=>k("print"),className:`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${u==="print"?"bg-surface text-primary shadow-xs":"text-secondary hover:text-primary"}`,children:[e.jsx(pe,{size:15}),e.jsx("span",{children:"المعاينة الرسمية الجاهزة للطباعة"})]}),e.jsxs("button",{onClick:()=>k("markdown"),className:`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${u==="markdown"?"bg-surface text-primary shadow-xs":"text-secondary hover:text-primary"}`,children:[e.jsx(mt,{size:15}),e.jsx("span",{children:"معاينة Markdown"})]})]}),s&&e.jsxs("div",{className:"hidden sm:flex items-center gap-2 text-xs font-bold text-secondary",children:[e.jsxs("span",{className:"px-2 py-0.5 rounded-lg bg-surface border border-outline-variant/30 font-mono",children:[s.items.length," مواد"]}),e.jsx("span",{children:"•"}),e.jsx("span",{className:"text-primary truncate max-w-[220px]",children:s.title})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-lowest custom-scrollbar",children:s?u==="editor"?e.jsxs("div",{className:"space-y-6 max-w-5xl mx-auto",children:[e.jsxs("div",{className:"p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-outline-variant/20 pb-3",children:[e.jsxs("h3",{className:"font-black text-primary text-base flex items-center gap-2",children:[e.jsx(ht,{size:18}),e.jsx("span",{children:"الترويسة والمعلومات الإدارية (قابلة للتعديل)"})]}),e.jsxs("span",{className:"text-xs text-secondary",children:[Y," — ",c]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"عنوان الوثيقة / السند"}),e.jsx("input",{type:"text",value:s.title,onChange:n=>y("title",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"المصلحة أو القسم الطالب"}),e.jsx("input",{type:"text",value:s.department,onChange:n=>y("department",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"الجهة الموجه إليها (المستلم)"}),e.jsx("input",{type:"text",value:s.recipient,onChange:n=>y("recipient",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"المرجع الإداري / الترقيم"}),e.jsx("input",{type:"text",value:s.referenceCode,onChange:n=>y("referenceCode",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"تاريخ التحرير"}),e.jsx("input",{type:"date",value:s.date,onChange:n=>y("date",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"السنة الدراسية"}),e.jsx("input",{type:"text",value:s.academicYear,onChange:n=>y("academicYear",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-bold text-on-surface"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"الموضوع (Objet)"}),e.jsx("input",{type:"text",value:s.subject,onChange:n=>y("subject",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-2 text-sm font-black text-primary"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-secondary mb-1",children:"نص الديباجة والسياق الإداري"}),e.jsx("textarea",{rows:3,value:s.contextAndPurpose,onChange:n=>y("contextAndPurpose",n.target.value),className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 text-sm font-medium text-on-surface leading-relaxed resize-none"})]})]}),e.jsxs("div",{className:"p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-outline-variant/20 pb-3",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"font-black text-primary text-base flex items-center gap-2",children:[e.jsx(gt,{size:18}),e.jsxs("span",{children:["جدول المواد والتجهيزات المطلوبة (",s.items.length," بنود)"]})]}),e.jsx("p",{className:"text-xs text-secondary mt-0.5",children:"يمكنك تعديل أي خانة مباشرة أو إضافة وحذف بنود حسب الحاجة الميدانية"})]}),e.jsxs("button",{type:"button",onClick:q,className:"px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-black flex items-center gap-1 transition-all",children:[e.jsx(ze,{size:14}),e.jsx("span",{children:"إضافة مادة / بند +"})]})]}),e.jsx("div",{className:"overflow-x-auto border border-outline-variant/30 rounded-2xl",children:e.jsxs("table",{className:"w-full text-right border-collapse text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-surface-container-high text-secondary font-black border-b border-outline-variant/30",children:[e.jsx("th",{className:"p-2.5 text-center w-12",children:"الرقم"}),e.jsx("th",{className:"p-2.5",children:"تعيين المادة أو الوسيلة"}),e.jsx("th",{className:"p-2.5 w-48",children:"المرجع والمواصفات الفنية"}),e.jsx("th",{className:"p-2.5 text-center w-24",children:"الوحدة"}),e.jsx("th",{className:"p-2.5 text-center w-24",children:"الكمية"}),e.jsx("th",{className:"p-2.5",children:"البيان / الغرض البيداغوجي"}),e.jsx("th",{className:"p-2.5 text-center w-12",children:"حذف"})]})}),e.jsx("tbody",{className:"divide-y divide-outline-variant/20",children:s.items.map((n,o)=>e.jsxs("tr",{className:"hover:bg-primary/[0.02]",children:[e.jsx("td",{className:"p-2 text-center",children:e.jsx("input",{type:"text",value:n.itemNumber,onChange:i=>C(o,"itemNumber",i.target.value),className:"w-10 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1 text-xs font-bold"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",value:n.designation,onChange:i=>C(o,"designation",i.target.value),placeholder:"اسم المادة أو العتاد...",className:"w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-bold text-primary"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",value:n.referenceOrSpecs,onChange:i=>C(o,"referenceOrSpecs",i.target.value),placeholder:"مواصفات / مرجع...",className:"w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs"})}),e.jsx("td",{className:"p-2 text-center",children:e.jsx("input",{type:"text",value:n.unit,onChange:i=>C(o,"unit",i.target.value),className:"w-16 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-medium"})}),e.jsx("td",{className:"p-2 text-center",children:e.jsx("input",{type:"text",value:n.quantity,onChange:i=>C(o,"quantity",i.target.value),className:"w-16 text-center bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs font-black text-emerald-700"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",value:n.purposeOrNotes,onChange:i=>C(o,"purposeOrNotes",i.target.value),placeholder:"الغرض البيداغوجي / ملاحظة...",className:"w-full bg-transparent border border-outline-variant/40 rounded-lg p-1.5 text-xs"})}),e.jsx("td",{className:"p-2 text-center",children:e.jsx("button",{type:"button",onClick:()=>ne(o),className:"p-1 hover:bg-rose-500/10 text-rose-600 rounded-lg transition-colors",title:"حذف البند",children:e.jsx(Ae,{size:15})})})]},n.id))})]})})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-3",children:[e.jsxs("h4",{className:"font-black text-primary text-sm flex items-center gap-1.5",children:[e.jsx(yt,{size:16}),e.jsx("span",{children:"ملاحظات وتوجيهات تنظيمية"})]}),e.jsx("textarea",{rows:3,value:s.notes,onChange:n=>y("notes",n.target.value),placeholder:"أدخل أي ملاحظات استعجالية أو إدارية...",className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl p-3 text-xs font-medium resize-none"})]}),e.jsxs("div",{className:"p-5 bg-surface rounded-2xl border border-outline-variant/40 shadow-xs space-y-3",children:[e.jsxs("h4",{className:"font-black text-primary text-sm flex items-center gap-1.5",children:[e.jsx(Te,{size:16}),e.jsx("span",{children:"الموقعون والتأشيرات الإدارية"})]}),e.jsx("div",{className:"space-y-2",children:s.signers.map((n,o)=>e.jsx("input",{type:"text",value:n,onChange:i=>{const w=[...s.signers];w[o]=i.target.value,y("signers",w)},className:"w-full bg-surface-container border border-outline-variant/50 rounded-xl px-3 py-1.5 text-xs font-bold"},o))})]})]})]}):u==="print"?e.jsxs("div",{className:"max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 font-sans print:p-0 print:border-none print:shadow-none",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx("p",{className:"font-bold text-base text-slate-800",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("p",{className:"font-bold text-sm text-slate-600",children:"وزارة التربية الوطنية"})]}),e.jsxs("div",{className:"flex justify-between items-start border-b-2 border-slate-300 pb-4 mb-6 text-sm font-bold",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{children:c||"مديرية التربية الوطنية"}),e.jsx("p",{children:Y}),e.jsxs("p",{className:"text-emerald-800 font-black",children:["السنة الدراسية: ",s.academicYear]})]}),e.jsxs("div",{className:"text-left space-y-1",dir:"ltr",children:[e.jsxs("p",{children:["التاريخ: ",s.date]}),e.jsxs("p",{className:"font-mono",children:["المرجع: ",s.referenceCode]})]})]}),e.jsx("div",{className:"border-2 border-emerald-800 bg-emerald-50 text-center py-2.5 px-4 rounded-xl mb-6 shadow-xs",children:e.jsx("h1",{className:"text-xl sm:text-2xl font-black text-emerald-900",children:s.title})}),e.jsxs("div",{className:"border border-slate-300 bg-slate-50 p-4 rounded-xl mb-6 text-sm space-y-2",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-black text-slate-700",children:"المصلحة / القسم الطالب:"})," ",e.jsx("span",{className:"font-bold",children:s.department})]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-black text-slate-700",children:"إلى السيد:"})," ",e.jsx("span",{className:"font-bold",children:s.recipient})]}),e.jsxs("p",{className:"text-emerald-800 font-black",children:[e.jsx("span",{className:"text-slate-700",children:"الموضوع:"})," ",s.subject]})]}),e.jsx("div",{className:"text-justify text-sm leading-relaxed mb-6 font-medium text-slate-800",children:s.contextAndPurpose}),e.jsx("div",{className:"mb-6 overflow-hidden rounded-xl border border-emerald-800",children:e.jsxs("table",{className:"w-full text-right border-collapse text-xs",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-emerald-800 text-white font-black",children:[e.jsx("th",{className:"p-2.5 text-center w-12 border-l border-emerald-700",children:"الرقم"}),e.jsx("th",{className:"p-2.5 border-l border-emerald-700",children:"تعيين المادة أو الوسيلة"}),e.jsx("th",{className:"p-2.5 border-l border-emerald-700 w-44",children:"المرجع والمواصفات"}),e.jsx("th",{className:"p-2.5 text-center w-16 border-l border-emerald-700",children:"الوحدة"}),e.jsx("th",{className:"p-2.5 text-center w-16 border-l border-emerald-700",children:"الكمية"}),e.jsx("th",{className:"p-2.5",children:"البيان / الغرض البيداغوجي"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-200",children:s.items.map((n,o)=>e.jsxs("tr",{className:o%2===0?"bg-white":"bg-slate-50",children:[e.jsx("td",{className:"p-2 text-center font-bold border-l border-slate-200",children:n.itemNumber}),e.jsx("td",{className:"p-2 font-bold text-slate-900 border-l border-slate-200",children:n.designation}),e.jsx("td",{className:"p-2 text-slate-600 border-l border-slate-200",children:n.referenceOrSpecs}),e.jsx("td",{className:"p-2 text-center border-l border-slate-200",children:n.unit}),e.jsx("td",{className:"p-2 text-center font-black text-emerald-800 border-l border-slate-200",children:n.quantity}),e.jsx("td",{className:"p-2 text-slate-700",children:n.purposeOrNotes})]},n.id))})]})}),s.notes&&e.jsxs("div",{className:"border-r-4 border-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-bold text-amber-900 mb-6",children:[e.jsx("strong",{children:"ملاحظة هامة:"})," ",s.notes]}),e.jsxs("div",{className:"border border-dashed border-emerald-700 bg-emerald-50/50 p-4 rounded-xl text-xs font-bold text-slate-800 mb-8",children:[e.jsx("p",{className:"font-black text-emerald-900 mb-2",children:"تأشيرة وموافقة إدارة المؤسسة:"}),e.jsxs("div",{className:"flex flex-wrap gap-6",children:[e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",className:"accent-emerald-700 w-4 h-4"}),e.jsx("span",{children:"مقبول ومعتمد للتنفيذ الفوري"})]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",className:"accent-emerald-700 w-4 h-4"}),e.jsx("span",{children:"مؤجل للاعتماد المالي القادم"})]}),e.jsxs("label",{className:"flex items-center gap-1.5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",className:"accent-emerald-700 w-4 h-4"}),e.jsx("span",{children:"مرفوض مع التعليل المرفق"})]})]})]}),e.jsx("div",{className:"grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center",children:s.signers.map((n,o)=>e.jsxs("div",{className:"space-y-12",children:[e.jsx("p",{className:"font-black text-xs text-slate-800 border-t border-slate-400 pt-2",children:n}),e.jsx("p",{className:"text-[10px] text-slate-400 font-bold",children:"(الاسم، التوقيع والختم الرسمي)"})]},o))})]}):e.jsxs("div",{className:"max-w-4xl mx-auto space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between bg-surface p-3 rounded-2xl border border-outline-variant/30",children:[e.jsx("span",{className:"text-xs font-black text-secondary",children:"معاينة وثيقة Markdown الرسمية (قابلة للنسخ والطباعة الفورية)"}),e.jsxs("button",{type:"button",onClick:ae,className:"px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all",children:[G?e.jsx(Be,{size:14}):e.jsx(Le,{size:14}),e.jsx("span",{children:G?"تم النسخ!":"نسخ Markdown"})]})]}),e.jsx("div",{className:"bg-surface rounded-2xl p-6 border border-outline-variant/40 font-mono text-xs leading-relaxed text-on-surface whitespace-pre-wrap select-all overflow-x-auto shadow-inner",dir:"rtl",children:s.markdownPreview})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center h-full text-center py-20 opacity-60",children:[e.jsx(Ce,{size:48,className:"text-primary mb-3"}),e.jsx("p",{className:"text-base font-bold",children:"قم بإدخال نص الطلب أو اختيار نموذج سريع لبدء التوليد"})]})}),e.jsxs("footer",{className:"p-4 bg-surface-container border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("a",{href:"https://docs.google.com/document/create",target:"_blank",rel:"noopener noreferrer",onClick:H,className:"px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all",title:"فتح Google Docs ونسخ التنسيق تلقائياً (الصق Ctrl+V داخل المستند)",children:[e.jsx(jt,{size:15}),e.jsx("span",{children:ve?"تم نسخ التنسيق! جاري الفتح...":"📎 فتح في Google Docs مع نسخ التنسيق"})]}),e.jsxs("button",{type:"button",onClick:_,className:"px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs",title:"تنزيل ملف Word (.doc) رسمي بنفس تفاصيل وهيئة الـ PDF",children:[e.jsx(ce,{size:15}),e.jsx("span",{children:"تنزيل Word (.doc)"})]}),e.jsxs("button",{type:"button",onClick:le,className:"px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs",title:"تنزيل كملف PDF رسمي",children:[e.jsx(de,{size:15}),e.jsx("span",{children:"تنزيل PDF (.pdf)"})]}),e.jsxs("button",{type:"button",onClick:M,className:"px-3 py-2.5 bg-surface text-secondary hover:text-primary border border-outline-variant/40 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all",title:"معاينة ملف PDF بملء الشاشة",children:[e.jsx(pe,{size:15}),e.jsx("span",{children:"معاينة PDF"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:oe,disabled:be,className:"px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50",title:"حفظ في الأرشيف الشخصي للوثائق الإدارية",children:[e.jsx(Ye,{size:15}),e.jsx("span",{children:be?"جاري الحفظ...":"حفظ في الأرشيف"})]}),e.jsx("button",{type:"button",onClick:d,className:"px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-2xl font-bold text-xs transition-colors",children:"إغلاق"})]})]})]})}):null}const R=[{id:"req-equipment-purchase",category:"requests",title:"طلب اقتناء عتاد ومواد مخبرية جديدة",subTitle:"نموذج موجه للمدير والمقتصد لطلب وسائل تعليمية ومحاليل كيميائية",tag:"طلب اقتناء",recipientDefault:"السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)",senderDefault:"الأستاذ المسؤول عن مادة العلوم الفيزيائية / مسير المخبر",subjectDefault:"طلب تزويد المخبر بالعتاد والمواد الكيميائية الضرورية للموسم الدراسي",contentDefault:"يشرفني أن أتقدم إلى سيادتكم المحترمة بهذا الطلب قصد التكرم بالموافقة على تزويد المخبر بالعتاد والوسائل التعليمية والمواد الكيميائية المبينة في الجدول أسفله، وذلك قصد تمكين الأساتذة والتلاميذ من إنجاز الأعمال التطبيقية والتجارب المقررة في المناهج الرسمية في أحسن الظروف ووفق المعايير البيداغوجية المعتمدة.",notesDefault:"ملاحظة: تم ترتيب المواد حسب درجة الأولوية والاستعجال لإنجاز البرامج البيداغوجية المقررة.",hasTable:!0,tableHeaders:["الرقم","اسم الوسيلة أو المحلول","الكمية المطلوبة","المواصفات / الملاحظات"],defaultRows:[{col1:"01",col2:"مخبار مدرج سعة 100 مل زجاجي",col3:"10 قطع",col4:"فئة A مقاوم للحرارة"},{col1:"02",col2:"محلول حمض كلور الماء 1M",col3:"02 لتر",col4:"نقي للاستعمال المخبري"},{col1:"03",col2:"أنابيب اختبار زجاجية قياس 16*160",col3:"50 أنبوب",col4:"مع حوامل خشبية"},{col1:"04",col2:"ميزان إلكتروني حساس دقة 0.01g",col3:"02 جهاز",col4:"مع محول كهربائي"}],signers:["الأستاذ / مسير المخبر","المصالح المالية والمادية (المقتصد)","تأشيرة وموافقة السيد المدير"]},{id:"req-maintenance-repair",category:"requests",title:"طلب صيانة وإصلاح أجهزة علمية مخبرية",subTitle:"طلب تدخل فني لإصلاح الميكروسكوبات والموازين والمولدات",tag:"صيانة وإصلاح",recipientDefault:"السيد: مدير المؤسسة التربوية (مصلحة الصيانة والوسائل)",senderDefault:"المسؤول عن تسيير مخابر العلوم الطبيعية والفيزيائية",subjectDefault:"طلب صيانة وإصلاح عتاد مخبري متعطل",contentDefault:"نحيط سيادتكم علماً بتسجيل بعض الأعطاب التقنية في التجهيزات المخبرية الموضحة أدناه، والتي توقفت عن العمل نتيجة الاستعمال الدوري أو أعطاب كهربائية وميكانيكية، مما يعيق السير الحسن للأعمال المخبرية، وعليه نلتمس منكم التنسيق لإجراء الصيانة اللازمة أو الاتصال بمصالح الصيانة المختصة لإعادة تشغيلها.",notesDefault:"الأجهزة حالياً موضوعة في جناح العزل تفادياً لأي تفاقم للأعطاب أو أخطار كهربائية.",hasTable:!0,tableHeaders:["الرقم","اسم الجهاز ورقمه التسلسلي","طبيعة العطب الملاحظ","القرار المقترح"],defaultRows:[{col1:"01",col2:"مجهر ضوئي ثنائي العدسة N°04",col3:"عطل في نظام الإضاءة والمكثف",col4:"استبدال مصباح LED وفحص الدارة"},{col1:"02",col2:"مولد تيار مستمر ومتناوب 0-12V",col3:"انقطاع المنصهرة وحرق بالمقاومة",col4:"صيانة كهربائية داخلية"},{col1:"03",col2:"ميزان رقمي دقيق N°02",col3:"عدم استقرار القراءة والصفير",col4:"معايرة الحساس الداخلي"}],signers:["مسير المخبر","المقتصد","السيد المدير"]},{id:"req-safety-equipment",category:"requests",title:"طلب تزويد المخبر بوسائل الوقاية ومكافحة الحرائق",subTitle:"تأمين مطافئ الحريق، حقائب الإسعافات، النظارات الواقية والقفازات",tag:"أمن وسلامة",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"مسؤول الأمن المخبري وأساتذة المواد التجريبية",subjectDefault:"طلب توفير وتجديد وسائل السلامة والوقاية المخبرية",contentDefault:"حرصاً على سلامة أبنائنا التلاميذ والطاقم التربوي والتقني العامل بالمخابر، وامتثالاً للتعليمات الوزارية المنظمة للأمن المخبري، نلتمس من سيادتكم التكرم بتزويد المخبر بوسائل الوقاية الفردية والجماعية وتجديد منتهية الصلاحية منها وفق ما هو مبين أدناه.",notesDefault:"تعتبر هذه الوسائل إلزامية قانوناً قبل الشروع في أي تجارب كيميائية محفوفة بالمخاطر.",hasTable:!0,tableHeaders:["الرقم","وسيلة السلامة المطلوبة","الكمية","الملاحظات ومكان التثبيت"],defaultRows:[{col1:"01",col2:"مطافئ حريق غاز CO2 سعة 5 كغ",col3:"02 مطفأة",col4:"لحرائق المواد الكيميائية والأجهزة"},{col1:"02",col2:"حقيبة إسعافات أولية مع محاليل غسيل العيون",col3:"01 حقيبة",col4:"تثبيت جداري بجانب الباب"},{col1:"03",col2:"نظارات واقية مقاومة للرذاذ",col3:"20 نظارة",col4:"لحماية أعين التلاميذ"},{col1:"04",col2:"قفازات نيتريل مقاس M و L",col3:"04 علب",col4:"للتعامل مع الأحماض والمذيبات"}],signers:["مسؤول السلامة المخبرية","المقتصد","مدير المؤسسة"]},{id:"req-excursion-approval",category:"requests",title:"طلب ترخيص بتنظيم خرجة علمية استكشافية ميدانية",subTitle:"طلب موافقة على نشاط بيئي أو زيارة مركز علمي / محطة مياه",tag:"أنشطة علمية",recipientDefault:"السيد: مدير المؤسسة التربوية (لإحالتها لمديرية التربية)",senderDefault:"أستاذ مادة علوم الطبيعة والحياة / العلوم الفيزيائية",subjectDefault:"طلب ترخيص لتنظيم خرجة علمية ميدانية لفائدة تلاميذ القسم",contentDefault:"في إطار إثراء المعارف البيداغوجية وربط المفاهيم النظرية بالتطبيقات الميدانية والبيئية وفق المنهاج الوزاري، يشرفني أن أطلب من سيادتكم التكرم بالترخيص لنا بتنظيم خرجة علمية لفائدة تلاميذ الأقسام المذكورة، مع التعهد التام بتأطيرهم والالتزام الصارم بشروط السلامة والانضباط.",notesDefault:"مرفق: قائمة التلاميذ المشاركين، ترخيصات الأولياء الموقعة، وبرنامج الزيارة الزمني.",hasTable:!0,tableHeaders:["الوجهة المقصودة","تاريخ وتوقيت الزيارة","المستوى الدراسي المعني","الأساتذة والمؤطرون المرافقون"],defaultRows:[{col1:"محطة معالجة المياه / الحديقة النباتية",col2:"يوم الخميس من 08:30 إلى 12:00",col3:"السنة الثانية ثانوي علوم تجريبية",col4:"أستاذ العلوم الطبيعية + ملحق المخبر"}],signers:["الأستاذ المنظم","مستشار التربية","موافقة وختم مدير المؤسسة"]},{id:"req-afterhours-lab",category:"requests",title:"طلب ترخيص باستغلال المخبر خارج الساعات النظامية",subTitle:"أنشطة النوادي العلمية، التحضير للمسابقات، أو التجارب الاستدراكية",tag:"أنشطة لاصفية",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"منشط النادي العلمي / أستاذ المادة",subjectDefault:"طلب استغلال فضاء المخبر خارج الساعات الرسمية",contentDefault:"قصد تمكين أعضاء النادي العلمي والتلاميذ المهتمين بالابتكارات العلمية من استكمال مشاريعهم وتجاربهم في أحسن الظروف، نلتمس من سيادتكم الموافقة على فتح المخبر العلمي واستغلال تجهيزاته في الفترات المحددة، مع التزامنا الكامل بالحفاظ على العتاد وتأمين النظافة والسلامة بعد انتهاء النشاط.",hasTable:!0,tableHeaders:["اليوم","الفترة الزمنية","طبيعة النشاط أو التجربة","عدد التلاميذ المشرف عليهم"],defaultRows:[{col1:"مساء الثلاثاء",col2:"من 14:30 إلى 16:30",col3:"تجارب تحضير الروبوت ومعايرة المحاليل",col4:"12 تلميذاً مع أستاذ مؤطر"}],signers:["الأستاذ المؤطر","مسير المخبر","مدير المؤسسة"]},{id:"req-leave-absence",category:"requests",title:"طلب عطلة استثنائية أو غياب مبرر لموظف المخبر",subTitle:"طلب غياب رسمي للملحق بالمخبر أو التقني وفق التشريع المدرسي",tag:"شؤون الموظفين",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"الاسم واللقب: ..................... / الرتبة: ملحق بالمخبر",subjectDefault:"طلب الاستفادة من عطلة استثنائية / غياب مرخص",contentDefault:"بمقتضى الأمر 06-03 المتضمن القانون الأساسي العام للوظيفة العمومية، وبناءً على المبررات القانونية المرفقة، يشرفني أن ألتمس من سيادتكم منحي رخصة غياب / عطلة استثنائية مدفوعة الأجر للأسباب والأيام الموضحة في هذا الطلب، مع تأكيد تسليم مفاتيح ومهام تسيير المخبر للزميل المناوب لضمان استمرارية المرفق العام.",notesDefault:"مرفق: الوثائق والشهادات المبررة للغياب.",hasTable:!1,signers:["الموظف المعني","المقتصد (للتأشير)","قرار مدير المؤسسة (مقبول / مرفوض)"]},{id:"rep-lab-accident",category:"reports",title:"تقرير عن حادث مخبري أو تلوث كيميائي أو كسر خطير",subTitle:"توثيق رسمي مفصل لحوادث الانسكاب، التفاعلات العنيفة، أو إصابات التلاميذ",tag:"تقرير حادث",recipientDefault:"السيد: مدير المؤسسة التربوية (نسخة لمفتش المادة وطبيب الصحة المدرسية)",senderDefault:"أستاذ المادة المؤطر / المشرف على الحصة المخبرية",subjectDefault:"تقرير إخباري مفصل بخصوص حادث عرضي وقع بالمخبر",contentDefault:"نعلم سيادتكم أنه بتاريخ اليوم المذكور أدناه، وخلال إجراء الحصة التطبيقية المقررة لمستوى القسم المعني، وقع حادث عرضي في فضاء المخبر. تم على الفور تطبيق بروتوكول الطوارئ وعزل المنطقة وتقديم الإسعافات الأولية ونقل المصاب إن وُجد إلى قاعة التمريض، ونوافيكم بحيثيات الحادث والأسباب المباشرة والتدابير المتخذة.",notesDefault:"تم تأمين موقع الحادث وإيقاف كافة التفاعلات ومراجعة إجراءات السلامة.",hasTable:!0,tableHeaders:["تاريخ وتوقيت الحادث","مكان الحادث بالمخبر","الأضرار المادية أو الجسدية","الإجراءات الاستعجالية المتخذة"],defaultRows:[{col1:"2026/10/04 - 10:15 صباحاً",col2:"طاولة التجريب رقم 03",col3:"انكسار أنبوب وتسرب طفيف لمحلول حمضي مخفف دون إصابات بشرية",col4:"معادلة الحمض ببيكربونات الصوديوم وتهوية القاعة فوراً"}],signers:["أستاذ الحصة الشاهد","مسير المخبر","طبيب / ممرض الصحة المدرسية","مدير المؤسسة"]},{id:"rep-trimester-status",category:"reports",title:"تقرير دوري ثلاثي عن الوضعية العامة للمخبر",subTitle:"حصيلة شاملة عن جاهزية الأجهزة، الاستهلاك، ونسبة إنجاز التجارب",tag:"تقرير دوري",recipientDefault:"السيد: مدير المؤسسة التربوية والمفتش البيداغوجي للمادة",senderDefault:"مسؤول التنسيق المخبري وأساتذة المواد العلمية",subjectDefault:"التقرير الدوري لتقييم نشاط المخابر خلال الثلاثي الدراسي",contentDefault:"يسرنا أن نرفع إلى كريم علمكم التقرير الدوري المفصل حول الوضعية العامة للمخابر العلمية خلال هذا الثلاثي، والذي يبرز نسبة إنجاز التجارب البيداغوجية، حجم استهلاك المواد الكيميائية والزجاجيات، حالة الأجهزة العلمية ونقائص الصيانة المسجلة، بهدف اتخاذ التدابير التصحيحية اللازمة.",notesDefault:"بلغت النسبة الإجمالية لإنجاز الأعمال المخبرية المقررة في المنهاج 92% بفضل تضافر جهود الطاقم.",hasTable:!0,tableHeaders:["المؤشر البيداغوجي","العدد / النسبة","الملاحظات والتقييم","الاحتياج المسجل"],defaultRows:[{col1:"عدد الحصص المخبرية المنجزة",col2:"48 حصة مخبرية",col3:"تغطية منتظمة لكافة الأفواج",col4:"لا يوجد"},{col1:"نسبة توفر المواد الكيميائية",col2:"85%",col3:"نقص في كواشف الكيمياء الحيوية",col4:"طلب شراء تكميلي"},{col1:"حالة الأجهزة والميكروسكوبات",col2:"24 جهاز صالح / 3 أعطاب",col3:"تم عزل الأجهزة المعطلة",col4:"طلب صيانة دورية"}],signers:["منسق المادة والمخبر","المقتصد","مدير المؤسسة"]},{id:"rep-defective-equipment",category:"reports",title:"تقرير فني عن أجهزة وتجهيزات غير قابلة للإصلاح",subTitle:"معاينة هندسية وتقنية للأجهزة المستهلكة تمهيداً لإسقاطها من السجل",tag:"تقرير معاينة فنية",recipientDefault:"السيد: مدير المؤسسة التربوية (لجنة الجرد والإسقاط)",senderDefault:"لجنة المعاينة التقنية للمخابر والتجهيزات العلمية",subjectDefault:"تقرير فني ومعاينة عتاد علمي غير قابل للإصلاح (عتاد هالك)",contentDefault:"بناءً على المعاينة الميدانية الدقيقة التي قامت بها اللجنة التقنية المختصة بالمؤسسة للأجهزة والوسائل المدرجة في الجدول، وبعد فحصها ومحاولة صيانتها محلياً، تبين أنها أصيبت بأعطاب جسيمة وتآكل متقدم يستحيل معه إصلاحها اقتصادياً أو تقنياً، وعليه نقترح إخراجها من الخدمة تمهيداً لإسقاطها وتبرئة ذمة المخبر.",hasTable:!0,tableHeaders:["اسم العتاد والماركة","الرقم التسلسلي / الجرد","تاريخ الشراء / الدخول","السبب الفني لعدم الصلاحية"],defaultRows:[{col1:"مجهر بصري روسي الصنع",col2:"جرد: 142/08",col3:"2008",col4:"كسر داخلي بالمنشور البصري وتلف ميكانيكي بحامل العدسات"},{col1:"جهاز راسم الاهتزاز المهبطي أنالوج",col2:"جرد: 88/11",col3:"2011",col4:"حرق بالمحول عالي التوتر وانعدام قطع الغيار الأصلية"},{col1:"مضخة تفريغ الهواء يدوية",col2:"جرد: 205/14",col3:"2014",col4:"تلف الأسطوانة والمانومتر وتسرب مستمر"}],signers:["تقني / مسير المخبر","أستاذ المادة ذو الخبرة","المقتصد","مدير المؤسسة"]},{id:"rep-expired-chemicals",category:"reports",title:"تقرير عن الكواشف والمواد الكيميائية منتهية الصلاحية",subTitle:"حصر المواد المتدهورة أو الخطرة تمهيداً لمعالجتها وتحييدها بأمان",tag:"مواد منتهية",recipientDefault:"السيد: مدير المؤسسة ومصلحة الوقاية والأمن بمديرية التربية",senderDefault:"المسؤول عن تسيير مخزن المواد الكيميائية والمخبر",subjectDefault:"تقرير حصر المواد الكيميائية منتهية الصلاحية وخطورة التخزين",contentDefault:"نعلمكم بأن عملية المراقبة الدورية لتواريخ نهاية صلاحية الكواشف المخبرية أسفرت عن حصر مجموعة من المواد الكيميائية التي فقدت فعاليتها أو طرأ عليها تغير في خواصها الفيزيائية، وتعتبر استمراريتها في المخزن مصدراً محتملاً للخطر، ولذا نقترح اتخاذ الإجراءات البيئية السليمة لتحييدها وإتلافها بالتنسيق مع الجهات الوصية.",hasTable:!0,tableHeaders:["اسم المادة الكيميائية والصيغة","الحالة والتركيز","الكمية المحصورة","طبيعة الخطر وتاريخ الانتهاء"],defaultRows:[{col1:"نترات الفضة AgNO3",col2:"بلورات متكتلة متأكسدة",col3:"100 غرام",col4:"مؤكسد قوي - منتهية منذ 2021"},{col1:"برمنغنات البوتاسيوم KMnO4",col2:"محلول مائي 0.1M",col3:"500 مل",col4:"تفكك وتحول للون البني - منتهية 2022"},{col1:"حمض النيتريك HNO3",col2:"سائل مركز 65%",col3:"01 لتر",col4:"تآكل الغطاء وتصاعد أبخرة - غير آمن"}],signers:["مسير مخزن الكيماويات","أستاذ الفيزياء والكيمياء","المقتصد","مدير المؤسسة"]},{id:"min-equipment-reception",category:"minutes",title:"محضر استلام ومطابقة تجهيزات ومواد مخبرية جديدة",subTitle:"محضر استلام قانوني لمطابقة طلبيات التموين والمناقصات وسندات التسليم",tag:"محضر استلام",recipientDefault:"ملف المقتصدية والمخزن المركزي للمؤسسة التربوية",senderDefault:"لجنة استلام وتفتيش المواد والتجهيزات البيداغوجية بالمؤسسة",subjectDefault:"محضر استلام ومطابقة العتاد المخبري موضوع سند التسليم",contentDefault:"في يومه وتاريخه، اجتمعت اللجنة المكلفة باستلام التجهيزات والمواد المخبرية بمقر المخبر، بحضور أعضائها المذكورين، وقامت بفحص وتجريب ومعاينة الوسائل المسلمة من طرف المورد المعتمد، ومطابقتها مع المواصفات التقنية الواردة في سند الطلب، وقد خلصت اللجنة إلى النتائج الموضحة في هذا المحضر.",notesDefault:"قرار اللجنة: تم قبول الاستلام المؤقت بعد التحقق من سلامة الأجهزة والمطابقة الكاملة للشروط.",hasTable:!0,tableHeaders:["الرقم","تعيين المادة أو العتاد","الكمية المسلمة","المطابقة التقنية والقرار"],defaultRows:[{col1:"01",col2:"حقائب تجارب الكهرباء والمغناطيسية",col3:"04 حقائب",col4:"مطابقة وسليمة بنسبة 100%"},{col1:"02",col2:"ميكروسكوبات بصرية مع عدسات زيتية",col3:"06 أجهزة",col4:"مطابقة وتم تجريب الإضاءة وتكبيرها"},{col1:"03",col2:"كواشف كيميائية نقية للتحليل",col3:"12 عبوة زجاجية",col4:"مطابقة للمواصفات وبطاقات السلامة"}],signers:["المورد / مندوب التسليم","أستاذ المادة الخبير","المقتصد (مسؤول المالية والمادية)","رئيس اللجنة / مدير المؤسسة"]},{id:"min-equipment-scrapping",category:"minutes",title:"محضر إسقاط وتخريد عتاد مخبري هالك أو متلاشٍ",subTitle:"محضر الشطب النهائي من سجل الجرد بعد موافقة مجلس التوجيه والتسيير",tag:"محضر إسقاط",recipientDefault:"مديرية التربية (مصلحة المالية والوسائل) وأرشيف المؤسسة",senderDefault:"لجنة الجرد والإسقاط بالمؤسسة التربوية",subjectDefault:"محضر اجتماع لجنة إسقاط العتاد والوسائل المخبرية غير الصالحة",contentDefault:"تنفيذاً للتعليمات الوزارية الخاصة بتسيير سجلات الجرد وإسقاط العتاد المستهلك، اجتمعت اللجنة المشكلة بالقرار الداخلي، وقامت بالمعاينة النهائية للأصناف المقترحة للإسقاط والتي استوفت الإجراءات التقنية والمالية، وقررت شطبها نهائياً من سجلات الجرد العام للمؤسسة لعدم جدواها وتآكلها التام.",hasTable:!0,tableHeaders:["رقم الجرد","بيان الصنف والعتاد","سنة التخصيص","القيمة المقدرة","القرار النهائي"],defaultRows:[{col1:"042/PHY",col2:"راسم اهتزاز مهبطي قديم",col3:"2005",col4:"00.00 دج (هالك)",col5:"شطب وتحويل لمستودع الخردة"},{col1:"115/BIO",col2:"مجموعة زجاجيات متصدعة ومشروخة",col3:"2012",col4:"00.00 دج (متلاشٍ)",col5:"إتلاف تام"}],signers:["مسير المخبر","المقتصد","أستاذ ممثل عن المادة","رئيس المؤسسة"]},{id:"min-breakage-loss",category:"minutes",title:"محضر ضياع أو إتلاف عتاد مخبري من طرف التلاميذ",subTitle:"تسجيل التلفيات والحوادث أثناء الحصص العملية وتحديد المسؤوليات والتعويض",tag:"محضر كسر",recipientDefault:"السيد: مدير المؤسسة والسيد المقتصد",senderDefault:"أستاذ المادة المشرف على الفوج المخبري",subjectDefault:"محضر إثبات كسر أو ضياع أدوات مخبرية أثناء حصة تطبيقية",contentDefault:"نحيطكم علماً بأنه في التاريخ والساعة المبينة، وأثناء إنجاز حصة الأعمال التطبيقية المقررة للفوج المعني، وقع كسر / ضياع للأدوات المخبرية الموضحة في هذا المحضر نتيجة خطأ في المناولة أو سقوط غير مقصود، وقد تم اتخاذ الإجراءات التأمينية وإلزام المتسبب بالإجراءات المنصوص عليها في النظام الداخلي للمخبر.",hasTable:!0,tableHeaders:["اسم التلميذ(ة) المعني","القسم والفوج","الأداة المكسورة / الضائعة","طبيعة الحادث وحكم التعويض"],defaultRows:[{col1:"اسم التلميذ هنا",col2:"2 ع ت 1 - فوج أ",col3:"مخبار مدرج زجاجي 250 مل",col4:"سقوط عرضي - تعويض عيني بالمطابقة"}],signers:["التلميذ(ة) المعني","أستاذ الحصة","مسير المخبر","المقتصد"]},{id:"min-coordination-meeting",category:"minutes",title:"محضر جلسة تنسيقية لأساتذة المادة ومسؤول المخبر",subTitle:"تنسيق رزنامة التجارب، توزيع القاعات، ومتابعة الاحتياجات الدورية",tag:"جلسة تنسيقية",recipientDefault:"السيد: مدير المؤسسة ومفتش المادة البيداغوجي",senderDefault:"منسق المادة وأساتذة العلوم بالمؤسسة",subjectDefault:"محضر اجتماع التنسيق البيداغوجي والتسيير المخبري",contentDefault:"في إطار التنسيق البيداغوجي الدوري، انعقدت بمقر المخبر الجلسة التنسيقية المشتركة برئاسة منسق المادة وبحضور السادة الأساتذة ومسؤولي المخابر، حيث تم تداول جدول الأعمال المتعلق برزنامة التجارب للفصل، ضبط جداول استعمال المخابر، مراجعة اشتراطات الأمان، وتحديد الاحتياجات الضرورية.",notesDefault:"خرج المجتمعون بالتوصيات التالية: الالتزام الصارم بارتداء المئزر والنظارات، وتأكيد حجز الحصص قبل 48 ساعة.",hasTable:!0,tableHeaders:["نقطة جدول الأعمال","المناقشات والآراء المطروحة","القرار والاتفاق المتخذ","المسؤول عن التنفيذ"],defaultRows:[{col1:"رزنامة الأعمال التطبيقية",col2:"تنسيق التوقيت وتفادي التداخل بين الأساتذة",col3:"اعتماد الرزنامة الأسبوعية الموحدة",col4:"مسير المخبر والأساتذة"},{col1:"تدابير السلامة والنفايات",col2:"عزل المحاليل الخطرة وعدم سكبها في المجاري",col3:"توفير عبوات خاصة لجمع النفايات",col4:"الجميع"}],signers:["أساتذة المادة الحاضرون","مسير المخبر","منسق المادة","تأشيرة مدير المؤسسة"]},{id:"form-equipment-loan",category:"forms",title:"استمارة إعارة واسترجاع عتاد مخبري لأستاذ المادة",subTitle:"سند إعارة رسمي لضبط خروج واسترجاع التجهيزات والمجسمات البيداغوجية",tag:"استمارة إعارة",recipientDefault:"أرشيف تسيير المخبر وسجل الإعارات",senderDefault:"الأستاذ المستعير: ...................... / مادة التدريس: ......................",subjectDefault:"استمارة تسليم واسترجاع وسائل تعليمية مخبرية",contentDefault:"أقر أنا الموقع أدناه، الأستاذ(ة) المذكور، بأنني استلمت من مسير المخبر التجهيزات والوسائل التعليمية المبينة بالجدول في حالة جيدة وسليمة وصالحة للاستعمال، وأتعهد باستغلالها في الإطار البيداغوجي المخصص لها، وإعادتها فور انتهاء الحصة المقررة بحالتها الأصلية.",hasTable:!0,tableHeaders:["اسم العتاد والوسيلة","الرقم التسلسلي / الكود","تاريخ الاستلام وساعة الخروج","تاريخ وساعة الإرجاع وحالة العتاد"],defaultRows:[{col1:"مجسم الجهاز الهضمي للإنسان",col2:"BIO-MOD-08",col3:"2026/10/04 - 08:30",col4:"2026/10/04 - 10:30 (سليم)"},{col1:"صندوق عدسات ومرايا بصرية",col2:"OPT-BOX-02",col3:"2026/10/04 - 10:30",col4:"قيد الاستعمال"}],signers:["الأستاذ المستعير","مسير المخبر (عند التسليم)","مسير المخبر (عند الاسترجاع)"]},{id:"form-tech-equipment-sheet",category:"forms",title:"بطاقة فنية وتعريفية لجهاز مخبري نوعي",subTitle:"بطاقة هوية شاملة للجهاز: بلد الصنع، الخصائص الكهربائية، ومحاذير الاستعمال",tag:"بطاقة فنية للجهاز",recipientDefault:"تثبت على غلاف الجهاز أو تحفظ في ملف الأجهزة النوعية",senderDefault:"المسؤول عن التوثيق التقني للمخابر",subjectDefault:"بطاقة الهوية الفنية والمواصفات لجهاز مخبري",contentDefault:"تعتبر هذه البطاقة وثيقة تعريفية مرجعية للجهاز العلمي، تتضمن معلومات الصنع، الخصائص التشغيلية الكهربائية والميكانيكية، إجراءات الصيانة الوقائية، وقواعد السلامة الإلزامية قبل وأثناء التشغيل لضمان استدامته وحمايته من التلف.",hasTable:!0,tableHeaders:["البيان الفني","المعلومة المرجعية","حدود التشغيل الآمن","إجراء الصيانة الدوري"],defaultRows:[{col1:"اسم الجهاز التجاري والماركة",col2:"مسبار قياس الأس الهيدروجيني pH-mètre",col3:"درجة حرارة 10-40°C",col4:"حفظ الإلكترود في محلول KCl 3M"},{col1:"التغذية الكهربائية",col2:"بطارية 9V أو محول 220V/50Hz",col3:"استقرار التوتر",col4:"فصل المحول بعد انتهاء العمل"},{col1:"نطاق القياس والدقة",col2:"0.00 إلى 14.00 pH بمعدل خطأ ±0.01",col3:"معايرة بمحلولين عياريين pH 4 و pH 7",col4:"غسيل بالماء المقطر بعد كل قياس"}],signers:["معد البطاقة (تقني المخبر)","أستاذ المادة","المقتصد"]},{id:"form-sensitive-chemicals-log",category:"forms",title:"سجل تتبع استهلاك المواد الكيميائية الحساسة والخاضعة للرقابة",subTitle:"متابعة دقيقة بالمليغرام للمواد السامة أو المؤكسدة الشديدة أو القابلة للاشتعال",tag:"متابعة الكيماويات",recipientDefault:"سجل الرقابة المخبرية الدائم بالمؤسسة",senderDefault:"المسؤول الحصري عن خزينة المواد الكيميائية",subjectDefault:"استمارة ضبط واستهلاك مادة كيميائية خاضعة للتتبع الدقيق",contentDefault:"تطبيقاً للبروتوكول الوزاري الخاص بتداول وحفظ المواد الكيميائية الخطرة أو الحساسة، تُسجل في هذه الاستمارة كل حركة خروج واستعمال للمادة المحددة، متضمنة هوية الأستاذ المستلم، الغرض البيداغوجي، الكمية المستهلكة بالتدقيق، والرصيد المتبقي في الخزانة المؤمنة.",hasTable:!0,tableHeaders:["تاريخ السحب","اسم الأستاذ المستلم","التجربة المستهدفة","الكمية المسحوبة","الرصيد المتبقي بالخزانة"],defaultRows:[{col1:"2026/10/02",col2:"أ. فلان (فيزياء)",col3:"معايرة حمض وأساس (2 ثانوي)",col4:"50 مل محلول هيدروكسيد الصوديوم 1M",col5:"950 مل"},{col1:"2026/10/04",col2:"أ. علان (علوم)",col3:"الكشف عن السكريات المرجعة",col4:"20 مل كاشف فهلنج A+B",col5:"480 مل"}],signers:["الأستاذ المستلم","المسؤول عن خزانة المواد الكيميائية","تأشيرة مدير المؤسسة"]}];function Ut(){const l=ot(),{schoolName:d,directorate:b,commune:f}=We(),c="الجمهورية الجزائرية الديمقراطية الشعبية",g="وزارة التربية الوطنية",{openPdfPreview:N}=Ue(),[m,j]=p.useState("all"),[h,T]=p.useState(""),[u,k]=p.useState(null),[G,W]=p.useState(!1),[ve,L]=p.useState(!1),[be,re]=p.useState(null),[A,se]=p.useState(null),[s,P]=p.useState([]),[S,Y]=p.useState(!1),[v,U]=p.useState(new Date().toISOString().split("T")[0]),[y,C]=p.useState(""),[q,ne]=p.useState(""),[H,ae]=p.useState(""),[_,le]=p.useState(""),[M,oe]=p.useState(""),[n,o]=p.useState(""),[i,w]=p.useState([]),[I,we]=p.useState([]),[Je,Oe]=p.useState(!1),V=te(d,f)||"المؤسسة التربوية";p.useEffect(()=>{Ke()},[]);const Ke=async()=>{Y(!0);try{const t=localStorage.getItem("local_admin_documents");let r=t?JSON.parse(t):[];try{const a=ct($e(he,"user_admin_documents"),dt("createdAt","desc")),z=(await xt(a)).docs.map($=>({id:$.id,...$.data()})),B=new Set(r.map($=>$.id));z.forEach($=>{B.has($.id)||r.push($)})}catch{}P(r)}catch(t){console.warn("Error loading saved documents:",t)}finally{Y(!1)}},O=(t,r="success")=>{se({message:t,type:r}),setTimeout(()=>se(null),4e3)},Ne=t=>{k(t),U(new Date().toISOString().split("T")[0]),C(`مخ/${new Date().getFullYear()}/${Math.floor(100+Math.random()*900)}`),ne(t.senderDefault),ae(t.recipientDefault),le(t.subjectDefault),oe(t.contentDefault),o(t.notesDefault||""),w(t.defaultRows?JSON.parse(JSON.stringify(t.defaultRows)):[]),we([...t.signers]),W(!0)},Fe=t=>{const r=R.find(a=>a.id===t.templateId)||{id:t.templateId||"custom",category:"requests",title:t.title,subTitle:"وثيقة إدارية محفوظة",tag:"وثيقة مخصصة",recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,notesDefault:t.notes,hasTable:!!(t.rows&&t.rows.length>0),tableHeaders:["الرقم","البيان والتعيين","الكمية / المواصفة","الملاحظات"],defaultRows:t.rows,signers:t.signers};k(r),U(t.date||new Date().toISOString().split("T")[0]),C(t.reference||""),ne(t.sender||""),ae(t.recipient||""),le(t.subject||""),oe(t.content||""),o(t.notes||""),w(t.rows||[]),we(t.signers||["مسير المخبر","مدير المؤسسة"]),W(!0)},Qe=async(t,r)=>{if(r.stopPropagation(),!!window.confirm("هل أنت متأكد من حذف هذه الوثيقة المحفوظة؟"))try{const a=s.filter(x=>x.id!==t);P(a),localStorage.setItem("local_admin_documents",JSON.stringify(a));try{await pt(bt(he,"user_admin_documents",t))}catch{}O("تم حذف الوثيقة بنجاح من الأرشيف","info")}catch(a){console.error("Error deleting doc:",a)}},Xe=()=>{const t=(i.length+1).toString().padStart(2,"0");w([...i,{col1:t,col2:"",col3:"",col4:""}])},Ze=t=>{w(i.filter((r,a)=>a!==t))},ue=(t,r,a)=>{const x=[...i];x[t][r]=a,w(x)},et=async()=>{if(u){Oe(!0);try{const t={id:`doc_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,templateId:u.id,title:u.title,category:u.category,date:v,reference:y,sender:q,recipient:H,subject:_,content:M,notes:n,rows:i,signers:I,createdAt:new Date().toISOString()},r=[t,...s];P(r),localStorage.setItem("local_admin_documents",JSON.stringify(r));try{await _e($e(he,"user_admin_documents"),{...t,createdAt:Me()})}catch{}O("تم حفظ الوثيقة بنجاح في أرشيفك الشخصي!","success")}catch(t){console.error("Error saving document:",t),O("تعذر الحفظ في السحابة، تم الحفظ محلياً.","info")}finally{Oe(!1)}}},tt=()=>{if(!u)return"";const t=u.tableHeaders||["الرقم","البيان","الكمية","الملاحظات"];let r="";u.hasTable&&i.length>0&&(r=`
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; text-align: center;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #1e293b;">
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 60px;">${t[0]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right;">${t[1]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 140px;">${t[2]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">${t[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${i.map((x,z)=>`
              <tr style="background-color: ${z%2===0?"#ffffff":"#fafaf9"};">
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: bold;">${x.col1||z+1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: right;">${x.col2||"-"}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${x.col3||"-"}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${x.col4||"-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `);const a=`
      <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 10px; text-align: center;">
        ${I.map(x=>`
          <div style="flex: 1; margin: 0 10px; border-top: 1px dashed #94a3b8; padding-top: 8px;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${x}</div>
            <div style="height: 55px; margin-top: 8px; color: #94a3b8; font-size: 11px;">(التوقيع والختم)</div>
          </div>
        `).join("")}
      </div>
    `;return`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${u.title} - ${V}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: 'Amiri', 'Traditional Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #0f172a;
            line-height: 1.6;
            direction: rtl;
            background: #fff;
          }
          .header-center {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .inst-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 13px;
            font-weight: bold;
            border-bottom: 2px solid #334155;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .title-box {
            background-color: #f8fafc;
            border: 2px solid #0f766e;
            border-radius: 8px;
            padding: 10px 16px;
            text-align: center;
            margin: 16px 0;
          }
          .title-box h1 {
            margin: 0;
            font-size: 19px;
            color: #0f766e;
            font-weight: 900;
          }
          .correspondence-meta {
            background-color: #fafaf9;
            border-right: 4px solid #0f766e;
            padding: 10px 14px;
            margin: 14px 0;
            font-size: 13.5px;
          }
          .body-content {
            font-size: 14px;
            text-align: justify;
            margin: 18px 0;
            white-space: pre-line;
            line-height: 1.8;
          }
          .notes-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 8px 12px;
            font-size: 12px;
            color: #92400e;
            border-radius: 6px;
            margin: 12px 0;
          }
        </style>
      </head>
      <body>
        <div class="header-center">${c}</div>
        <div class="header-center" style="font-size: 13px; color: #475569;">${g}</div>

        <div class="inst-info">
          <div>
            <div>${b||"مديرية التربية الوطنية"}</div>
            <div>${V}</div>
          </div>
          <div style="text-align: left;" dir="ltr">
            <div>التاريخ: ${v}</div>
            ${y?`<div>المرجع: ${y}</div>`:""}
          </div>
        </div>

        <div class="title-box">
          <h1>${u.title}</h1>
        </div>

        <div class="correspondence-meta">
          <div><strong>من:</strong> ${q}</div>
          <div style="margin-top: 4px;"><strong>إلى:</strong> ${H}</div>
          <div style="margin-top: 4px; color: #0f766e;"><strong>الموضوع:</strong> ${_}</div>
        </div>

        <div class="body-content">${M}</div>

        ${r}

        ${n?`<div class="notes-box"><strong>ملاحظة هامة:</strong> ${n}</div>`:""}

        ${a}
      </body>
      </html>
    `},ke=async()=>{const t=tt();if(t)try{await it.printHtml(t,{title:u==null?void 0:u.title})}catch(r){console.error("Print error:",r)}},Re=async(t,r)=>{const a=t||u;if(!a)return;const x=(t?t.senderDefault:q)||a.senderDefault,z=(t?t.recipientDefault:H)||a.recipientDefault,B=(t?t.subjectDefault:_)||a.subjectDefault,$=(t?t.contentDefault:M)||a.contentDefault,J=t?t.notesDefault:n,K=t?new Date().toISOString().split("T")[0]:v,Q=t?"":y,F=(t?t.defaultRows:i)||[],X=(t?t.signers:I)||a.signers,E=a.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];try{const D=await ge.generateAdministrativeDocumentPDF({title:a.title,reference:Q,category:a.tag,date:K,sender:x,recipient:z,subject:B,content:$,notes:J,hasTable:!!(a.hasTable&&F.length>0),tableHeaders:E,tableRows:F.map(Z=>[Z.col1,Z.col2,Z.col3,Z.col4]),signers:X,schoolInfo:{country:c,ministry:g,directorate:b,school:d,commune:f},fileName:`${a.title}.pdf`});N({file:new File([D],`${a.title}.pdf`,{type:"application/pdf"}),title:a.title,fileName:`${a.title}.pdf`,category:a.tag})}catch(D){console.error("PDF Preview error:",D),O("حدث خطأ أثناء إعداد معاينة PDF","error")}},fe=async(t,r)=>{const a=t||u;if(!a)return;const x=(r==null?void 0:r.sender)||(t?t.senderDefault:q)||a.senderDefault,z=(r==null?void 0:r.recipient)||(t?t.recipientDefault:H)||a.recipientDefault,B=(r==null?void 0:r.subject)||(t?t.subjectDefault:_)||a.subjectDefault,$=(r==null?void 0:r.content)||(t?t.contentDefault:M)||a.contentDefault,J=(r==null?void 0:r.notes)!==void 0?r.notes:t?t.notesDefault:n,K=(r==null?void 0:r.date)||(t?new Date().toISOString().split("T")[0]:v),Q=(r==null?void 0:r.reference)||(t?"":y),F=(r==null?void 0:r.rows)||(t?t.defaultRows:i)||[],X=(r==null?void 0:r.signers)||(t?t.signers:I)||a.signers,E=a.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];try{await ge.generateAdministrativeDocumentPDF({title:a.title,reference:Q,category:a.tag,date:K,sender:x,recipient:z,subject:B,content:$,notes:J,hasTable:!!(a.hasTable&&F.length>0),tableHeaders:E,tableRows:F.map(D=>[D.col1,D.col2,D.col3,D.col4]),signers:X,schoolInfo:{country:c,ministry:g,directorate:b,school:d,commune:f},fileName:`${a.title}.pdf`,save:!0}),O(`تم تنزيل وثيقة "${a.title}" بصيغة PDF بنجاح!`,"success")}catch(D){console.error("PDF Download error:",D),O("حدث خطأ أثناء تنزيل ملف PDF","error")}},me=(t,r)=>{const a=t||u;if(!a)return;const x=(r==null?void 0:r.sender)||q||a.senderDefault,z=(r==null?void 0:r.recipient)||H||a.recipientDefault,B=(r==null?void 0:r.subject)||_||a.subjectDefault,$=(r==null?void 0:r.content)||M||a.contentDefault,J=(r==null?void 0:r.notes)!==void 0?r.notes:n!==void 0?n:a.notesDefault,K=(r==null?void 0:r.date)||v,Q=(r==null?void 0:r.reference)||y,F=(r==null?void 0:r.rows)||i,X=(r==null?void 0:r.signers)||I||a.signers,E=a.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];let D="";a.hasTable&&F&&F.length>0&&(D=`
        <table class="items-table" style="width: 100%; border-collapse: collapse; margin-top: 16pt; margin-bottom: 16pt; border: 1.5pt solid #0f766e;" dir="rtl">
          <thead>
            <tr style="background-color: #0f766e; color: #ffffff;">
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 45pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${E[0]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${E[1]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 90pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${E[2]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${E[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${F.map((ee,He)=>`
              <tr style="background-color: ${He%2===0?"#ffffff":"#f8fafc"};">
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-weight: bold; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${ee.col1||He+1}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${ee.col2||"-"}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${ee.col3||"-"}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${ee.col4||"-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `);const Z=`
      <table class="signatures-table" style="width: 100%; border-collapse: collapse; margin-top: 36pt; border: none;" dir="rtl">
        <tr>
          ${X.map(ee=>`
            <td style="width: ${Math.floor(100/Math.max(X.length,1))}%; text-align: center; vertical-align: top; padding: 0 10pt; border: none;">
              <div style="border-top: 1.5pt dashed #64748b; padding-top: 8pt; font-weight: bold; font-size: 11.5pt; color: #1e293b; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                ${ee}
              </div>
              <div style="height: 55pt; padding-top: 18pt; color: #94a3b8; font-size: 9.5pt; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                (الاسم، التوقيع والختم الرسمي)
              </div>
            </td>
          `).join("")}
        </tr>
      </table>
    `,nt=`
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${a.title} - ${V}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
            <w:Compatibility>
              <w:UseWord2002TableStyleRules/>
            </w:Compatibility>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 595.35pt 841.95pt;
            margin: 45.0pt 45.0pt 45.0pt 45.0pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
            font-size: 13.5pt;
            color: #0f172a;
            line-height: 1.6;
            direction: rtl;
            text-align: right;
            background-color: #ffffff;
          }
          p {
            margin: 0 0 7pt 0;
          }
          .header-main {
            text-align: center;
            font-size: 13.5pt;
            font-weight: bold;
            color: #1e293b;
            margin: 0 0 2pt 0;
          }
          .header-sub {
            text-align: center;
            font-size: 11.5pt;
            font-weight: bold;
            color: #475569;
            margin: 0 0 10pt 0;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            border-bottom: 2pt solid #0f766e;
            padding-bottom: 6pt;
            margin-bottom: 14pt;
          }
          .meta-table td {
            border: none;
            padding: 2pt 0;
          }
          .title-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14pt 0;
            background-color: #f0fdfa;
            border: 2pt solid #0f766e;
          }
          .title-table td {
            padding: 10pt 16pt;
            text-align: center;
            border: none;
          }
          .title-table h1 {
            margin: 0;
            font-size: 17pt;
            font-weight: bold;
            color: #0f766e;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .correspondence-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14pt 0;
            background-color: #f8fafc;
            border: 1pt solid #cbd5e1;
            border-right: 4.5pt solid #0f766e;
          }
          .correspondence-table td {
            padding: 10pt 14pt;
            border: none;
            text-align: right;
            font-size: 12.5pt;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .body-content {
            font-size: 13.5pt;
            text-align: justify;
            text-justify: inter-word;
            margin: 16pt 0;
            line-height: 1.85;
            white-space: pre-line;
            color: #0f172a;
          }
          .notes-table {
            width: 100%;
            border-collapse: collapse;
            margin: 14pt 0;
            background-color: #fffbeb;
            border: 1pt solid #fef3c7;
            border-right: 4pt solid #d97706;
          }
          .notes-table td {
            padding: 8pt 12pt;
            border: none;
            text-align: right;
            font-size: 11.5pt;
            color: #92400e;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          <p class="header-main">${c}</p>
          <p class="header-sub">${g}</p>

          <table class="meta-table" dir="rtl">
            <tr>
              <td style="text-align: right; vertical-align: top; font-weight: bold; font-size: 11.5pt; color: #1e293b;">
                <div>${b||"مديرية التربية الوطنية"}</div>
                <div>${V}</div>
              </td>
              <td style="text-align: left; vertical-align: top; font-weight: bold; font-size: 11pt; color: #334155;" dir="ltr">
                <div>التاريخ: ${K}</div>
                ${Q?`<div>المرجع: ${Q}</div>`:""}
              </td>
            </tr>
          </table>

          <table class="title-table" dir="rtl">
            <tr>
              <td>
                <h1>${a.title}</h1>
              </td>
            </tr>
          </table>

          <table class="correspondence-table" dir="rtl">
            <tr>
              <td>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>من:</strong> ${x}</p>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>إلى:</strong> ${z}</p>
                <p style="margin: 0; color: #0f766e; font-weight: bold;"><strong>الموضوع:</strong> ${B}</p>
              </td>
            </tr>
          </table>

          <div class="body-content">${$}</div>

          ${D}

          ${J?`
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>ملاحظة هامة:</strong> ${J}</td>
              </tr>
            </table>
          `:""}

          ${Z}

          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 28pt; border: none; border-top: 1pt solid #e2e8f0;">
            <tr>
              <td style="text-align: right; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية والتعليمية
              </td>
              <td style="text-align: left; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;" dir="ltr">
                ${K}
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `,at=new Blob(["\uFEFF",nt],{type:"application/msword;charset=utf-8"}),qe=URL.createObjectURL(at),ie=document.createElement("a");ie.href=qe;const lt=(a.title||"وثيقة_إدارية").replace(/[/\\?%*:|"<>]/g,"_");ie.download=`${lt}.doc`,document.body.appendChild(ie),ie.click(),document.body.removeChild(ie),setTimeout(()=>URL.revokeObjectURL(qe),1e4),O(`تم تنزيل وثيقة "${a.title}" بصيغة Word (.doc) بنجاح بنفس تفاصيل وهيئة الـ PDF!`,"success")},rt=t=>{const r=`
الجمهورية الجزائرية الديمقراطية الشعبية
وزارة التربية الوطنية
${b||"مديرية التربية"} - ${V}
التاريخ: ${new Date().toLocaleDateString("ar-DZ")}

${t.title}
---------------------------------------------
من: ${t.senderDefault}
إلى: ${t.recipientDefault}
الموضوع: ${t.subjectDefault}

${t.contentDefault}

${t.notesDefault?`ملاحظة: ${t.notesDefault}`:""}
الموقعون: ${t.signers.join(" - ")}
    `.trim();navigator.clipboard.writeText(r),re(t.id),setTimeout(()=>re(null),2500),O("تم نسخ نص النموذج إلى الحافظة بنجاح!","success")},st=p.useMemo(()=>R.filter(t=>{const r=m==="all"||t.category===m,a=t.title.includes(h)||t.subTitle.includes(h)||t.subjectDefault.includes(h)||t.tag.includes(h);return r&&a}),[m,h]);return e.jsxs("div",{className:"space-y-8 max-w-7xl mx-auto px-4 md:px-6 pb-24 rtl font-sans",dir:"rtl",children:[e.jsx(Se,{children:A&&e.jsxs(xe.div,{initial:{opacity:0,y:-20,scale:.95},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:-20,scale:.95},className:`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold backdrop-blur-md ${A.type==="success"?"bg-emerald-500/95 text-white border-emerald-400":A.type==="error"?"bg-error/95 text-white border-error/50":"bg-primary/95 text-white border-primary/50"}`,children:[e.jsx(Te,{size:18}),e.jsx("span",{children:A.message})]})}),e.jsxs("header",{className:"flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6",children:[e.jsx("div",{className:"space-y-2",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>l(-1),className:"p-2 hover:bg-surface-container rounded-full text-secondary transition-colors",title:"رجوع",children:e.jsx(vt,{size:22})}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-inner",children:e.jsx(wt,{size:28})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h1",{className:"text-2xl md:text-3xl font-black text-primary",children:"نماذج وثائق ومراسلات إدارية"}),e.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-500/30 flex items-center gap-1",children:[e.jsx(Nt,{size:13}),e.jsx("span",{children:"معايير وزارة التربية الوطنية"})]})]}),e.jsx("p",{className:"text-secondary text-sm mt-0.5",children:"مكتبة شاملة للوثائق المقننة: طلبات شراء وصيانة، تقارير حوادث، محاضر استلام وإتلاف، واستمارات تسيير المخابر."})]})]})}),e.jsxs("div",{className:"flex items-center gap-2.5 shrink-0 flex-wrap",children:[e.jsxs("button",{onClick:()=>L(!0),className:"px-5 py-3.5 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 hover:from-amber-600 hover:to-teal-800 text-white rounded-2xl font-black shadow-lg shadow-emerald-700/20 hover:shadow-xl transition-all flex items-center gap-2 text-sm active:scale-95 border border-white/20",title:"توليد مراسلة وسند طلب مصلحي ذكي بالذكاء الاصطناعي مع إمكانية التعديل",children:[e.jsx(ye,{size:18,className:"animate-pulse"}),e.jsx("span",{children:"المولّد الذكي للوثائق (AI)"}),e.jsx("span",{className:"px-1.5 py-0.5 rounded-md bg-white/25 text-[10px] font-black uppercase tracking-wider",children:"جديد"})]}),e.jsxs("button",{onClick:()=>{Ne({id:`custom_${Date.now()}`,category:"requests",title:"وثيقة ومراسلة إدارية مخصصة",subTitle:"نموذج فارغ قابل للتعديل والطباعة المباشرة",tag:"وثيقة مخصصة",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"مسؤول المخبر / أستاذ المادة",subjectDefault:"الموضوع: ............................................",contentDefault:"يشرفني أن أتقدم إلى سيادتكم المحترمة بهذه المراسلة قصد .................................................",hasTable:!0,tableHeaders:["الرقم","البيان","الكمية","ملاحظات"],defaultRows:[{col1:"01",col2:"",col3:"",col4:""}],signers:["المحرر / مسؤول المخبر","المقتصد","مدير المؤسسة"]})},className:"px-5 py-3.5 bg-surface text-primary border border-outline-variant/40 hover:bg-surface-container rounded-2xl font-bold transition-all flex items-center gap-2 text-sm shadow-xs",children:[e.jsx(ze,{size:18}),e.jsx("span",{children:"وثيقة فارغة"})]})]})]}),e.jsxs("div",{className:"bg-surface rounded-3xl p-4 border border-outline-variant/40 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center",children:[e.jsxs("div",{className:"flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar",children:[e.jsxs("button",{onClick:()=>j("all"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="all"?"bg-primary text-on-primary shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"جميع النماذج"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:R.length})]}),e.jsxs("button",{onClick:()=>j("requests"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="requests"?"bg-emerald-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"الطلبات الإدارية"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:R.filter(t=>t.category==="requests").length})]}),e.jsxs("button",{onClick:()=>j("reports"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="reports"?"bg-amber-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"التقارير وحوادث المخبر"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:R.filter(t=>t.category==="reports").length})]}),e.jsxs("button",{onClick:()=>j("minutes"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="minutes"?"bg-indigo-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"المحاضر الرسمية"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:R.filter(t=>t.category==="minutes").length})]}),e.jsxs("button",{onClick:()=>j("forms"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="forms"?"bg-cyan-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"الاستمارات وبطاقات التسيير"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:R.filter(t=>t.category==="forms").length})]}),e.jsxs("button",{onClick:()=>j("saved"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${m==="saved"?"bg-tertiary text-on-tertiary shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx(Ee,{size:14}),e.jsx("span",{children:"وثائقي المحفوظة"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:s.length})]})]}),e.jsxs("div",{className:"relative w-full md:w-72 shrink-0",children:[e.jsx(kt,{className:"absolute right-3.5 top-1/2 -translate-y-1/2 text-outline",size:17}),e.jsx("input",{type:"text",placeholder:"بحث في أسماء ومواضيع النماذج...",value:h,onChange:t=>T(t.target.value),className:"w-full bg-surface-container-high px-10 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-xs font-bold"})]})]}),e.jsxs("div",{className:"bg-gradient-to-l from-emerald-900/10 via-primary/5 to-amber-500/10 border-2 border-emerald-600/30 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5",children:[e.jsxs("div",{className:"flex items-start sm:items-center gap-4",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md",children:e.jsx(ye,{size:24,className:"animate-pulse"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("h3",{className:"text-lg font-black text-primary",children:"المولّد الذكي للوثائق والمراسلات الإدارية"}),e.jsx("span",{className:"px-2.5 py-0.5 rounded-full bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-600/30",children:"AI Smart Generator"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-black border border-amber-500/30",children:"مع إمكانية التعديل الشامل"})]}),e.jsx("p",{className:"text-secondary text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed",children:"حوّل أي طلب عادي إلى مراسلة داخلية أو سند طلب مصلحي رسمي متكامل وفق معايير وزارة التربية الوطنية: ترويسة الدولة، جدول بنود منسق (الرقم، التعيين، المرجع، الوحدة، الكمية، الغرض)، تأشيرات المصادقة، والربط المباشر بـ Google Docs و Word و PDF."})]})]}),e.jsxs("button",{onClick:()=>L(!0),className:"px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95 border border-white/20 whitespace-nowrap",children:[e.jsx(Ce,{size:18}),e.jsx("span",{children:"فتح المولّد الذكي والتعديل"})]})]}),m==="saved"?e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-black text-primary flex items-center gap-2",children:[e.jsx(Ee,{className:"text-tertiary",size:20}),e.jsxs("span",{children:["الأرشيف الشخصي للوثائق المحررة (",s.length,")"]})]}),e.jsx("span",{className:"text-xs text-secondary",children:"تُحفظ الوثائق التي قمت بتعديلها محلياً وسحابياً لإعادة طباعتها أو مراجعتها أي وقت."})]}),s.length===0?e.jsxs("div",{className:"bg-surface-container-low rounded-3xl p-16 text-center border border-dashed border-outline-variant",children:[e.jsx($t,{size:48,className:"mx-auto text-outline mb-3 opacity-40"}),e.jsx("h4",{className:"text-xl font-bold text-secondary mb-1",children:"لا توجد وثائق محفوظة بعد"}),e.jsx("p",{className:"text-xs text-secondary/80 max-w-sm mx-auto",children:'اختر أي نموذج من الأقسام أعلاه، عدّل بياناته، ثم اضغط على زر "حفظ الوثيقة في أرشيفي" ليظهر هنا.'})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",children:s.map(t=>e.jsxs("div",{onClick:()=>Fe(t),className:"bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group",children:[e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold",children:t.reference||"وثيقة محررة"}),e.jsxs("span",{className:"text-[11px] text-outline flex items-center gap-1 font-mono",children:[e.jsx(Dt,{size:12}),t.date]})]}),e.jsx("h4",{className:"text-base font-black text-primary group-hover:text-primary transition-colors",children:t.title}),e.jsx("p",{className:"text-xs text-secondary font-medium line-clamp-2",children:t.subject||t.content}),e.jsx("div",{className:"text-[11px] text-secondary/70 pt-1 border-t border-outline-variant/30 flex items-center justify-between",children:e.jsxs("span",{className:"truncate max-w-[180px]",children:["إلى: ",t.recipient]})})]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 mt-3 border-t border-outline-variant/30",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{onClick:r=>{r.stopPropagation(),Fe(t)},className:"text-xs font-bold text-primary flex items-center gap-1 hover:underline",children:[e.jsx(pe,{size:13}),"معاينة وتحرير"]}),e.jsxs("button",{onClick:r=>{r.stopPropagation();const a=R.find(x=>x.id===t.templateId)||{id:t.templateId,category:t.category,title:t.title,tag:t.category,recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,signers:t.signers||["مسير المخبر","المدير"],hasTable:!!(t.rows&&t.rows.length>0)};me(a,t)},className:"text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF",children:[e.jsx(ce,{size:13}),e.jsx("span",{children:"Word"})]}),e.jsxs("button",{onClick:r=>{r.stopPropagation();const a=R.find(x=>x.id===t.templateId)||{id:t.templateId,category:t.category,title:t.title,subTitle:"",tag:t.category,recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,signers:t.signers||["مسير المخبر","المدير"],hasTable:!!(t.rows&&t.rows.length>0)};fe(a,t)},className:"text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline",title:"تحميل كملف PDF",children:[e.jsx(de,{size:13}),e.jsx("span",{children:"PDF"})]})]}),e.jsx("button",{onClick:r=>Qe(t.id,r),className:"p-1.5 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors",title:"حذف من الأرشيف",children:e.jsx(Ae,{size:15})})]})]},t.id))})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:st.map((t,r)=>{const a=be===t.id;return e.jsxs(xe.div,{initial:{opacity:0,y:15},animate:{opacity:1,y:0},transition:{delay:r*.03},className:"bg-surface rounded-3xl p-6 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden",children:[e.jsxs("div",{className:"space-y-3 mb-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${t.category==="requests"?"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300":t.category==="reports"?"bg-amber-500/15 text-amber-700 dark:text-amber-300":t.category==="minutes"?"bg-indigo-500/15 text-indigo-700 dark:text-indigo-300":"bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"}`,children:t.tag}),e.jsxs("button",{onClick:()=>rt(t),className:"p-1.5 hover:bg-surface-container rounded-xl text-secondary hover:text-primary transition-colors text-xs flex items-center gap-1 font-bold",title:"نسخ نص النموذج",children:[a?e.jsx(Be,{size:14,className:"text-emerald-500"}):e.jsx(Le,{size:14}),e.jsx("span",{className:"text-[10px]",children:a?"تم النسخ":"نسخ"})]})]}),e.jsx("h3",{className:"text-lg font-black text-primary group-hover:text-primary transition-colors leading-tight",children:t.title}),e.jsx("p",{className:"text-xs text-secondary/80 leading-relaxed",children:t.subTitle}),e.jsxs("div",{className:"bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-[11px] text-secondary space-y-1",children:[e.jsxs("div",{className:"truncate",children:[e.jsx("strong",{children:"المرسل إليه:"})," ",t.recipientDefault]}),e.jsxs("div",{className:"truncate",children:[e.jsx("strong",{children:"الموضوع:"})," ",t.subjectDefault]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-outline-variant/40 flex items-center gap-1.5 flex-wrap",children:[e.jsxs("button",{onClick:()=>Ne(t),className:"flex-1 min-w-[110px] py-2 bg-primary text-on-primary hover:opacity-95 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all",children:[e.jsx(Ge,{size:14}),e.jsx("span",{children:"تعديل وطباعة"})]}),e.jsxs("button",{onClick:x=>{x.stopPropagation(),me(t)},className:"p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)",children:[e.jsx(ce,{size:14}),e.jsx("span",{children:"Word"})]}),e.jsxs("button",{onClick:x=>{x.stopPropagation(),fe(t)},className:"p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold",title:"تحميل كملف PDF رسمي (.pdf)",children:[e.jsx(de,{size:14}),e.jsx("span",{children:"PDF"})]}),e.jsx("button",{onClick:x=>{x.stopPropagation(),Re(t)},className:"p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl transition-colors",title:"معاينة PDF في المتصفح",children:e.jsx(pe,{size:15})}),e.jsx("button",{onClick:()=>{Ne(t),setTimeout(ke,300)},className:"p-2 bg-surface-container hover:bg-surface-container-highest text-primary rounded-xl transition-colors",title:"طباعة سريعة",children:e.jsx(De,{size:15})})]})]},t.id)})}),e.jsx(Se,{children:G&&u&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-scrim/60 backdrop-blur-md overflow-y-auto",children:e.jsxs(xe.div,{initial:{opacity:0,scale:.95,y:15},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:15},className:"bg-surface w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant flex flex-col max-h-[94vh]",children:[e.jsxs("div",{className:"p-4 sm:p-5 bg-surface-container-low border-b border-outline-variant/50 flex items-center justify-between shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center",children:e.jsx(Ge,{size:22})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg sm:text-xl font-black text-primary leading-tight",children:u.title}),e.jsx("p",{className:"text-[11px] text-secondary",children:"قم بضبط الحقول، إضافة العناصر، ثم اضغط على طباعة رسمية أو معاينة PDF."})]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{onClick:et,disabled:Je,className:"px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50",title:"حفظ في أرشيفي",children:[e.jsx(Ye,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"حفظ بالأرشيف"})]}),e.jsxs("button",{onClick:()=>Re(),className:"px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"معاينة PDF داخلية",children:[e.jsx(pe,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"معاينة PDF"})]}),e.jsxs("button",{onClick:()=>fe(),className:"px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف PDF",children:[e.jsx(de,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"تحميل PDF"})]}),e.jsxs("button",{onClick:()=>me(),className:"px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل مستند Word بنفس تفاصيل وهيئة الـ PDF (.doc)",children:[e.jsx(ce,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"تحميل Word"})]}),e.jsxs("button",{onClick:ke,className:"px-4 py-2 bg-primary text-on-primary hover:opacity-90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",children:[e.jsx(De,{size:15}),e.jsx("span",{children:"طباعة"})]}),e.jsx("button",{onClick:()=>W(!1),className:"p-2 hover:bg-surface-container rounded-full text-secondary transition-colors",children:e.jsx(Ie,{size:20})})]})]}),e.jsxs("div",{className:"p-4 sm:p-6 overflow-y-auto space-y-6 flex-1",children:[e.jsxs("div",{className:"bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 text-center space-y-1",children:[e.jsx("div",{className:"text-xs font-black text-primary",children:c}),e.jsx("div",{className:"text-[11px] text-secondary font-bold",children:g}),e.jsxs("div",{className:"text-[11px] text-secondary font-medium",children:[b||"مديرية التربية الوطنية"," — ",V]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"تاريخ تحرير الوثيقة"}),e.jsx("input",{type:"date",value:v,onChange:t=>U(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"الرقم المرجعي (اختياري)"}),e.jsx("input",{type:"text",placeholder:"مثال: مخ/2026/14",value:y,onChange:t=>C(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"المرسِل / المحرر"}),e.jsx("input",{type:"text",value:q,onChange:t=>ne(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"المرسَل إليه (الجهة المعنية)"}),e.jsx("input",{type:"text",value:H,onChange:t=>ae(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"موضوع المراسلة أو التقرير"}),e.jsx("input",{type:"text",value:_,onChange:t=>le(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"نص الوثيقة / العرض الإداري"}),e.jsx("textarea",{rows:5,value:M,onChange:t=>oe(t.target.value),className:"w-full bg-surface p-3 rounded-xl border border-outline-variant text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none leading-relaxed"})]}),u.hasTable&&e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"block text-xs font-black text-primary",children:["جدول التعيينات والوسائل المرفقة (",i.length," عناصر)"]}),e.jsxs("button",{type:"button",onClick:Xe,className:"px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold flex items-center gap-1 transition-colors",children:[e.jsx(ze,{size:13}),e.jsx("span",{children:"إضافة سطر"})]})]}),e.jsx("div",{className:"border border-outline-variant rounded-2xl overflow-hidden shadow-xs",children:e.jsxs("table",{className:"w-full text-xs text-right border-collapse",children:[e.jsx("thead",{className:"bg-surface-container-high text-primary font-black",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-16 text-center",children:"الرقم"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant",children:"البيان والتسمية"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-32",children:"الكمية"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant",children:"ملاحظات / مواصفة"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-12 text-center"})]})}),e.jsx("tbody",{className:"divide-y divide-outline-variant/40 bg-surface",children:i.map((t,r)=>e.jsxs("tr",{className:"hover:bg-surface-container-low/50",children:[e.jsx("td",{className:"p-2 text-center",children:e.jsx("input",{type:"text",value:t.col1,onChange:a=>ue(r,"col1",a.target.value),className:"w-full text-center bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"اسم العتاد أو المادة...",value:t.col2,onChange:a=>ue(r,"col2",a.target.value),className:"w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"مثال: 05 قطع",value:t.col3,onChange:a=>ue(r,"col3",a.target.value),className:"w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"المواصفات...",value:t.col4,onChange:a=>ue(r,"col4",a.target.value),className:"w-full bg-transparent border-0 focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2 text-center",children:e.jsx("button",{type:"button",onClick:()=>Ze(r),className:"p-1 text-error/60 hover:text-error rounded-lg",title:"حذف السطر",children:e.jsx(Ae,{size:14})})})]},r))})]})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"ملاحظات أو توصيات إضافية (اختياري)"}),e.jsx("input",{type:"text",value:n,onChange:t=>o(t.target.value),placeholder:"ملاحظات تظهر أسفل الوثيقة...",className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-2",children:"الموقعون والمصادقون على الوثيقة"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:I.map((t,r)=>e.jsxs("div",{className:"bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40 flex items-center gap-2",children:[e.jsx(St,{size:16,className:"text-primary shrink-0"}),e.jsx("input",{type:"text",value:t,onChange:a=>{const x=[...I];x[r]=a.target.value,we(x)},className:"bg-transparent border-0 text-xs font-bold focus:ring-0 outline-none w-full"})]},r))})]})]}),e.jsxs("div",{className:"p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant/50 flex items-center justify-between shrink-0",children:[e.jsx("span",{className:"text-xs text-secondary font-medium",children:"جاهزة للطباعة بحجم A4 قياسي وفق مواصفات مراسلات وزارة التربية الوطنية."}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("button",{onClick:()=>W(!1),className:"px-4 py-2.5 bg-surface hover:bg-surface-container text-secondary rounded-xl text-xs font-bold border border-outline-variant/60 transition-colors",children:"إغلاق"}),e.jsxs("button",{onClick:()=>fe(),className:"px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف PDF",children:[e.jsx(de,{size:15}),e.jsx("span",{children:"تحميل PDF"})]}),e.jsxs("button",{onClick:()=>me(),className:"px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF",children:[e.jsx(ce,{size:15}),e.jsx("span",{children:"تحميل ملف Word (.doc)"})]}),e.jsxs("button",{onClick:ke,className:"px-5 py-2.5 bg-primary text-on-primary hover:opacity-95 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all",children:[e.jsx(De,{size:15}),e.jsx("span",{children:"طباعة الوثيقة الآن"})]})]})]})]})})}),e.jsx(Ft,{isOpen:ve,onClose:()=>L(!1),onSaveDocument:t=>{const r=[t,...s];P(r),localStorage.setItem("local_admin_documents",JSON.stringify(r));try{_e($e(he,"user_admin_documents"),{...t,createdAt:Me()})}catch{}O("تمت إضافة الوثيقة الذكية إلى أرشيفك الشخصي بنجاح!","success")}})]})}export{Ut as default};
