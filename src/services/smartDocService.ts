import { callGeminiAPI } from './geminiService';
import { PDFService } from './pdfService';
import { formatSchoolWithCommune } from '../lib/utils';

export interface SmartDocItem {
  id: string;
  itemNumber: string;
  designation: string; // تعيين المادة أو الوسيلة
  referenceOrSpecs: string; // المرجع / المواصفات الفنية
  unit: string; // الوحدة (قطعة، لتر، علبة...)
  quantity: string; // الكمية المطلوبة
  purposeOrNotes: string; // البيان / الغرض البيداغوجي
}

export interface SmartAdminDocument {
  id: string;
  title: string; // e.g. "سند طلب مصلحي داخلي"
  department: string; // المصلحة أو الجهة الطالبة
  recipient: string; // الجهة الموجه إليها
  academicYear: string; // السنة الدراسية
  date: string; // تاريخ التحرير
  referenceCode: string; // رقم القيد / المرجع الإداري
  subject: string; // الموضوع
  contextAndPurpose: string; // الديباجة والسياق الإداري
  items: SmartDocItem[];
  notes: string; // ملاحظات وتعليمات تنظيمية
  signers: string[]; // التوقيعات الرسمية
  approvalOptions: {
    principalDecision: 'approved' | 'postponed' | 'rejected' | 'pending';
    principalNotes: string;
    bursarStatus: 'in_stock' | 'to_purchase' | 'budget_allocated' | 'pending';
    bursarNotes: string;
  };
  markdownPreview: string;
}

export interface SchoolContext {
  schoolName?: string;
  directorate?: string;
  commune?: string;
  country?: string;
  ministry?: string;
}

const SYSTEM_PROMPT = `
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
`;

export async function generateSmartAdminDocument(
  prompt: string,
  schoolContext: SchoolContext
): Promise<SmartAdminDocument> {
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear - 1} / ${currentYear}`;
  const currentDate = new Date().toISOString().split('T')[0];
  const schoolFormatted = formatSchoolWithCommune(schoolContext.schoolName, schoolContext.commune) || 'المؤسسة التعليمية';

  try {
    const response = await callGeminiAPI({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            {
              text: `
بيانات المؤسسة المرجعية:
- اسم المؤسسة: ${schoolFormatted}
- مديرية التربية: ${schoolContext.directorate || 'مديرية التربية لولاية الجزائر'}
- السنة الدراسية: ${academicYear}
- تاريخ اليوم: ${currentDate}

طلب المستخدم:
"${prompt}"

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
`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = (response?.data as any)?.text;
    if (text) {
      const parsed = JSON.parse(text.trim());
      const items: SmartDocItem[] = (parsed.items || []).map((it: any, idx: number) => ({
        id: `item_${Date.now()}_${idx}`,
        itemNumber: it.itemNumber || (idx + 1).toString().padStart(2, '0'),
        designation: it.designation || '',
        referenceOrSpecs: it.referenceOrSpecs || '---',
        unit: it.unit || 'قطعة',
        quantity: it.quantity || '01',
        purposeOrNotes: it.purposeOrNotes || ''
      }));

      const doc: SmartAdminDocument = {
        id: `smart_doc_${Date.now()}`,
        title: parsed.title || 'سند طلب مصلحي داخلي',
        department: parsed.department || 'مخبر العلوم والتكنولوجيا',
        recipient: parsed.recipient || 'السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)',
        academicYear,
        date: currentDate,
        referenceCode: parsed.referenceCode || `رقم: ${Math.floor(Math.random() * 80 + 1).toString().padStart(2, '0')} / مخ / ${currentYear}`,
        subject: parsed.subject || 'سند طلب مصلحي داخلي لاقتناء عتاد ومواد',
        contextAndPurpose: parsed.contextAndPurpose || 'يشرفني أن أتقدم إلى سيادتكم المحترمة بهذا السند المصلحي قصد التكرم بالموافقة على تزويد المخبر بالمواد والوسائل المبينة أدناه.',
        items,
        notes: parsed.notes || 'تم ترتيب المواد وفق درجة الأولوية البيداغوجية لتنفيذ البرامج الرسمية.',
        signers: parsed.signers || ['مسؤول المخبر / أستاذ المادة', 'المصالح المادية والمالية (المقتصد)', 'تأشيرة وموافقة السيد المدير'],
        approvalOptions: {
          principalDecision: 'pending',
          principalNotes: '',
          bursarStatus: 'pending',
          bursarNotes: ''
        },
        markdownPreview: ''
      };

      doc.markdownPreview = buildMarkdownOutput(doc, schoolContext);
      return doc;
    }
  } catch (error) {
    console.warn('AI generation fell back to rule-based template:', error);
  }

  // Fallback generation
  return generateFallbackSmartDocument(prompt, schoolContext);
}

export function generateFallbackSmartDocument(
  prompt: string,
  schoolContext: SchoolContext
): SmartAdminDocument {
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear - 1} / ${currentYear}`;
  const currentDate = new Date().toISOString().split('T')[0];

  let title = 'سند طلب مصلحي داخلي';
  let department = 'مخبر العلوم الطبيعية والفيزيائية';
  let subject = 'طلب تزويد المخبر بالعتاد والمواد اللازمة للأعمال التطبيقية';
  let context = 'يشرفنا التوجه إلى سيادتكم المحترمة بهذا السند المصلحي الداخلي قصد التكرم بالموافقة على توفير المواد والتجهيزات البيداغوجية المبينة في الجدول أدناه، حرصاً على السير الحسن للتجارب والدروس التطبيقية المقررة.';
  
  let defaultItems: SmartDocItem[] = [
    {
      id: 'item_1',
      itemNumber: '01',
      designation: 'كواشف ومحاليل كيميائية نقية',
      referenceOrSpecs: 'فئة مخبرية نقية مع شهادات السلامة SDS',
      unit: 'لتر / علبة',
      quantity: '05',
      purposeOrNotes: 'تجارب تفاعلات الأكسدة والإرجاع والتحليل الكيميائي'
    },
    {
      id: 'item_2',
      itemNumber: '02',
      designation: 'أواني وزجاجيات قياسية (مخابر وكؤوس)',
      referenceOrSpecs: 'زجاج بيركس مقاوم للحرارة والصدمات فئة A',
      unit: 'قطعة',
      quantity: '15',
      purposeOrNotes: 'أفواج السنة الأولى والثانية ثانوي'
    },
    {
      id: 'item_3',
      itemNumber: '03',
      designation: 'أدوات الوقاية والسلامة المخبرية',
      referenceOrSpecs: 'نظارات واقية + قفازات نتريل غير مسببة للحساسية',
      unit: 'علبة',
      quantity: '03',
      purposeOrNotes: 'حماية التلاميذ وأساتذة المخبر أثناء التجارب'
    }
  ];

  if (prompt.includes('صيانة') || prompt.includes('إصلاح')) {
    title = 'مراسلة داخلية — طلب صيانة وتأهيل عتاد مخبري';
    subject = 'طلب صيانة وإصلاح أجهزة ووسائل تعليمية متوقفة';
    context = 'نلفت عناية سيادتكم الكريمة إلى وجود عدد من الأجهزة المخبرية الموضحة في الجدول بحاجة ماسة إلى صيانة تقنية متخصصة لإعادة إدماجها في النشاط البيداغوجي.';
    defaultItems = [
      {
        id: 'item_1',
        itemNumber: '01',
        designation: 'مجاهر ضوئية ثنائية العينية',
        referenceOrSpecs: 'خلل في المنظومة الضوئية والمكثف',
        unit: 'جهاز',
        quantity: '04',
        purposeOrNotes: 'دروس علم الأحياء والخلايا النباتية والحيوانية'
      },
      {
        id: 'item_2',
        itemNumber: '02',
        designation: 'ميزان إلكتروني دقيق 0.01g',
        referenceOrSpecs: 'بحاجة إلى معايرة وضبط الحساسية الرقمية',
        unit: 'جهاز',
        quantity: '02',
        purposeOrNotes: 'قياس كتل الكواشف بدقة متناهية'
      }
    ];
  } else if (prompt.includes('فيزياء') || prompt.includes('كهرباء')) {
    department = 'مخبر العلوم الفيزيائية والتكنولوجيا';
    subject = 'طلب تزويد مخبر الفيزياء بأجهزة القياس والمولدات الكهربائية';
    defaultItems = [
      {
        id: 'item_1',
        itemNumber: '01',
        designation: 'أجهزة قياس متعددة رقمية (Multimètre)',
        referenceOrSpecs: 'دقة عالية مع أسلاك توصيل قياسية محمية',
        unit: 'جهاز',
        quantity: '06',
        purposeOrNotes: 'دراسة الدارات الكهربائية والظواهر التحريضية'
      },
      {
        id: 'item_2',
        itemNumber: '02',
        designation: 'مولدات تيار مستمر قابلة للضبط 0-30V',
        referenceOrSpecs: 'تثبيت الجهد والتيار مع قاطع أمان ضد القصر',
        unit: 'جهاز',
        quantity: '04',
        purposeOrNotes: 'تغذية التجارب الكهربائية البيداغوجية'
      }
    ];
  }

  const doc: SmartAdminDocument = {
    id: `smart_doc_${Date.now()}`,
    title,
    department,
    recipient: 'السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)',
    academicYear,
    date: currentDate,
    referenceCode: `رقم: 08 / م.ع / ${currentYear}`,
    subject,
    contextAndPurpose: context,
    items: defaultItems,
    notes: 'تمت معاينة الاحتياجات الميدانية بالتنسيق مع أساتذة المادة وفق الرزنامة البيداغوجية المقررة.',
    signers: ['مسؤول المخبر / أستاذ المادة', 'المصالح الاقتصادية (المقتصد)', 'تأشيرة وموافقة السيد المدير'],
    approvalOptions: {
      principalDecision: 'pending',
      principalNotes: '',
      bursarStatus: 'pending',
      bursarNotes: ''
    },
    markdownPreview: ''
  };

  doc.markdownPreview = buildMarkdownOutput(doc, schoolContext);
  return doc;
}

export function buildMarkdownOutput(doc: SmartAdminDocument, schoolContext: SchoolContext): string {
  const schoolFormatted = formatSchoolWithCommune(schoolContext.schoolName, schoolContext.commune) || 'المؤسسة التعليمية';
  const directorate = schoolContext.directorate || 'مديرية التربية الوطنية';

  return `
# الجمهورية الجزائرية الديمقراطية الشعبية
## وزارة التربية الوطنية
**${directorate}** | **${schoolFormatted}**
*السنة الدراسية:* ${doc.academicYear} | *التاريخ:* ${doc.date} | *المرجع:* ${doc.referenceCode}

---

### **${doc.title}**
**المصلحة الطالبة:** ${doc.department}  
**إلى السيد:** ${doc.recipient}  
**الموضوع:** ${doc.subject}  

#### السند والبيان الإداري:
${doc.contextAndPurpose}

---

### جدول المواد والوسائل المطلوبة:

| الرقم | تعيين المادة / الوسيلة | المرجع / المواصفات | الوحدة | الكمية | البيان / الغرض البيداغوجي |
| :---: | :--- | :--- | :---: | :---: | :--- |
${doc.items.map(it => `| ${it.itemNumber} | ${it.designation} | ${it.referenceOrSpecs} | ${it.unit} | ${it.quantity} | ${it.purposeOrNotes} |`).join('\n')}

---

${doc.notes ? `> **ملاحظة وتوجيهات:** ${doc.notes}\n\n---` : ''}

### تأشيرات والمصادقة الإدارية:
- [ ] **مقبول ومعتمد للتنفيذ الفوري**
- [ ] **مؤجل لميزانية الفصل اللاحق**
- [ ] **مرفوض مع التعليل**

| ${doc.signers[0] || 'مسؤول المخبر'} | ${doc.signers[1] || 'المقتصد'} | ${doc.signers[2] || 'مدير المؤسسة'} |
| :---: | :---: | :---: |
| *(الاسم، التوقيع والختم)* | *(تأشيرة الاعتماد المالي)* | *(المصادقة والختم الرسمي)* |
| بتاريخ: .................... | بتاريخ: .................... | بتاريخ: .................... |

---

### 📎 المرفق الرقمي المعتمد:
> **[📄 فتح وإنشاء مستند Google Docs: ${doc.title} — ${doc.subject}](https://docs.google.com/document/create)**  
*(تم إعداد التنسيق والجداول تلقائياً؛ يمكنك نسخه أو فتحه مباشرة في Google Docs)*
`.trim();
}

/**
 * Generates official Google Doc formatted HTML designed to paste directly into Google Docs or download.
 */
export function generateGoogleDocHtml(doc: SmartAdminDocument, schoolContext: SchoolContext): string {
  const schoolFormatted = formatSchoolWithCommune(schoolContext.schoolName, schoolContext.commune) || 'المؤسسة التعليمية';
  const directorate = schoolContext.directorate || 'مديرية التربية الوطنية';

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'
          dir='rtl' lang='ar'>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>${doc.title} — ${doc.subject}</title>
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
            <div><strong>${directorate}</strong></div>
            <div><strong>${schoolFormatted}</strong></div>
            <div><strong>السنة الدراسية:</strong> ${doc.academicYear}</div>
          </td>
          <td style="text-align: left; width: 40%;" dir="ltr">
            <div><strong>التاريخ:</strong> ${doc.date}</div>
            <div><strong>المرجع:</strong> ${doc.referenceCode}</div>
          </td>
        </tr>
      </table>

      <div class="title-box">
        <h1>${doc.title}</h1>
      </div>

      <div class="info-panel">
        <p><strong>المصلحة / القسم الطالب:</strong> ${doc.department}</p>
        <p><strong>إلى السيد:</strong> ${doc.recipient}</p>
        <p style="color: #0f766e; font-weight: bold;"><strong>الموضوع:</strong> ${doc.subject}</p>
      </div>

      <p style="text-align: justify; line-height: 1.6; margin: 10pt 0;">
        ${doc.contextAndPurpose}
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
          ${doc.items.map((it, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="text-align: center; font-weight: bold;">${it.itemNumber}</td>
              <td style="text-align: right; font-weight: bold;">${it.designation}</td>
              <td style="text-align: right;">${it.referenceOrSpecs}</td>
              <td style="text-align: center;">${it.unit}</td>
              <td style="text-align: center; font-weight: bold;">${it.quantity}</td>
              <td style="text-align: right;">${it.purposeOrNotes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${doc.notes ? `
        <div style="border-right: 3pt solid #d97706; background-color: #fffbeb; padding: 6pt 10pt; margin: 10pt 0; font-size: 10pt; color: #92400e;">
          <strong>ملاحظة هامة:</strong> ${doc.notes}
        </div>
      ` : ''}

      <div class="approval-box">
        <strong>خانة التأشيرة والمصادقة الإدارية:</strong><br>
        [ &nbsp; ] مقبول ومعتمد للتنفيذ المالي والمادي &nbsp;&nbsp;&nbsp;&nbsp;
        [ &nbsp; ] مؤجل للدورة المالية اللاحقة &nbsp;&nbsp;&nbsp;&nbsp;
        [ &nbsp; ] مرفوض مع التعليل
      </div>

      <table class="signatures-table" dir="rtl">
        <tr>
          ${doc.signers.map(sig => `
            <td>
              <div class="sig-header">${sig}</div>
              <div class="sig-space">(الاسم، التوقيع والختم الرسمي)</div>
              <div style="font-size: 8pt; color: #64748b;">حرر بتاريخ: ....................</div>
            </td>
          `).join('')}
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Downloads Word file (.doc) matching the exact Algerian official format.
 */
export function downloadSmartDocWord(doc: SmartAdminDocument, schoolContext: SchoolContext): void {
  const html = generateGoogleDocHtml(doc, schoolContext);
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (doc.title + '_' + doc.subject).slice(0, 50).replace(/[/\\?%*:|"<>]/g, '_');
  link.download = `${safeName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Downloads official PDF file matching the document.
 */
export async function downloadSmartDocPdf(doc: SmartAdminDocument, schoolContext: SchoolContext): Promise<void> {
  const schoolFormatted = formatSchoolWithCommune(schoolContext.schoolName, schoolContext.commune) || 'المؤسسة التعليمية';
  
  await PDFService.generateAdministrativeDocumentPDF({
    title: doc.title,
    reference: doc.referenceCode,
    category: 'سند طلب مصلحي',
    date: doc.date,
    sender: doc.department,
    recipient: doc.recipient,
    subject: doc.subject,
    content: doc.contextAndPurpose,
    notes: doc.notes,
    hasTable: true,
    tableHeaders: ['الرقم', 'تعيين المادة / الوسيلة', 'المرجع والمواصفات', 'الكمية / الوحدة'],
    tableRows: doc.items.map(it => [
      it.itemNumber,
      it.designation,
      it.referenceOrSpecs,
      `${it.quantity} ${it.unit}`
    ]),
    signers: doc.signers,
    schoolInfo: {
      country: schoolContext.country || 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: schoolContext.ministry || 'وزارة التربية الوطنية',
      directorate: schoolContext.directorate || 'مديرية التربية لولاية الجزائر',
      school: schoolFormatted,
      commune: schoolContext.commune
    },
    fileName: `${doc.title}.pdf`,
    save: true
  });
}

/**
 * Copies rich formatted HTML and plain text to clipboard so user can paste with 100% fidelity into Google Docs.
 */
export async function copyToGoogleDocsClipboard(doc: SmartAdminDocument, schoolContext: SchoolContext): Promise<boolean> {
  try {
    const html = generateGoogleDocHtml(doc, schoolContext);
    const plain = buildMarkdownOutput(doc, schoolContext);

    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plain], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      await navigator.clipboard.writeText(plain);
      return true;
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}
