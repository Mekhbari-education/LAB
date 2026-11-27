import{c as q,g,a as A,n as T}from"./Chemicals-BgNposcQ.js";import{k as B,n as F}from"./index-DOZM0k_R.js";import"./vendor-react-6z4eij2j.js";import"./vendor-pdf-xlsx-D2V6XYzc.js";import"./QRScanner-O9jhgmzj.js";import"./vendor-icons-BMz-oU5Q.js";import"./geminiService-ffK5UJZA.js";import"./loggingService-DfEcyNl_.js";import"./vendor-firebase-V1xyB863.js";import"./vendor-charts-Cu8ARVQL.js";import"./index-DFRzkOUW.js";import"./useSqlCollection-fVbMbOWN.js";const P=new Set(["مسؤول / ملحق المخبر","المسؤول / ملحق المخبر","مسؤول المخبر","المسؤول عن المخبر","مسير المخبر","مدير المؤسسة التعليمية","الناظر (المشرف البيداغوجي)","أستاذ المادة التعليمية","المقتصد / المسير المالي والمادي"]);function U(e){const a=(e||"").trim();return!a||P.has(a)?!0:a.includes("مسؤول / ملحق")||a.includes("المسؤول / ملحق")}function Y(e,a){const d=([e,...a||[]].find(p=>!U(p))||"").trim();return d?d.includes("ملحق")||d.includes("عون")||d.includes("معاون")?F(d):d:"الملحق الرئيس بالمخابر"}function _(e,a){const r=(e||"").trim(),o=(a||"").trim();return r==="CEM"||r.includes("متوسط")?"مدير المتوسطة":r==="Lycée"||r.includes("ثانوي")?"مدير الثانوية":r.includes("ابتدائي")?"مدير المدرسة":o.includes("متوسط")?"مدير المتوسطة":o.includes("ثانوي")?"مدير الثانوية":o.includes("ابتدائي")||o.includes("مدرسة")?"مدير المدرسة":"مدير المؤسسة"}function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function W(e){if(!e||!e.trim())return"غير محدد";if(!e.includes("-"))return e;const[a,r,o]=e.split("-");return!a||!r||!o?e:`${o}/${r}/${a}`}function st(e,a){const r=new Date().toLocaleDateString("en-GB"),o=i(B(a.schoolName||"المؤسسة التربوية",a.commune||"")),d=i(a.directorate||"مديرية التربية"),p=i(a.academicYear||"2025 / 2026"),R=i(Y(a.officerRank,a.officerRankCandidates)),b=i(_(a.educationLevel,a.schoolName));return`
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>بطاقات مخزون المواد الكيميائية</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <style>
          :root {
            --primary: #0f4c6e;
            --primary-dark: #09354d;
            --primary-soft: #eef5f9;
            --secondary: #475569;
            --border-color: #cbd5e1;
            --danger: #b91c1c;
            --danger-bg: #fef2f2;
            --danger-border: #fecaca;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', 'Amiri', sans-serif;
            direction: rtl;
            background: transparent;
            color: #0f172a;
            padding: 0;
          }

          .pcard {
            background: #ffffff;
            width: 148mm;
            height: 210mm;
            margin: 0 auto 14px auto;
            padding: 6mm;
            border-radius: 6px;
            box-shadow: 0 6px 18px rgba(15, 76, 110, 0.12);
            display: flex;
            flex-direction: column;
            border: 1.5px solid var(--primary);
            position: relative;
            overflow: hidden;
          }

          .pcard.back { border-style: dashed; margin-bottom: 18px; }

          .ph-container {
            background: var(--primary-soft);
            margin: -6mm -6mm 2.5mm -6mm;
            padding: 4mm 6mm 3mm 6mm;
            border-bottom: 2px solid var(--primary);
          }
          .ph {
            display: grid;
            grid-template-columns: 1.15fr 1.35fr 0.95fr;
            font-size: 6.8pt;
            gap: 6px;
            align-items: start;
            color: #334155;
          }
          .ph-r { text-align: right; line-height: 1.45; font-weight: 700; }
          .ph-c { text-align: center; font-weight: 800; line-height: 1.45; color: #0f172a; }
          .ph-c .doc-sub { font-size: 6.5pt; color: var(--primary); margin-top: 2px; font-weight: 800; }
          .ph-l { text-align: left; line-height: 1.4; font-weight: 700; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }

          .card-ref-pill {
            background: #ffffff;
            color: var(--primary);
            border: 1px solid #93c5fd;
            padding: 1px 7px;
            border-radius: 4px;
            font-size: 6.8pt;
            font-weight: 900;
            font-family: monospace;
          }

          .header-stamp {
            width: 28mm;
            height: 10mm;
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5.8pt;
            color: #64748b;
            background: rgba(255, 255, 255, 0.75);
          }

          .pcard-title {
            text-align: center;
            font-size: 12pt;
            font-weight: 900;
            color: var(--primary-dark);
            margin: 1mm 0 2.5mm 0;
          }

          .ic-top-row {
            display: flex;
            gap: 6px;
            align-items: stretch;
            margin-bottom: 2.5mm;
          }
          .ic-meta-expressive {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .ic-field {
            border-radius: 6px;
            padding: 4.5px 9px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .ic-field.main {
            background: #f0f7fb;
            border-right: 3px solid var(--primary);
            border-top: 1px solid #bae6fd;
            border-bottom: 1px solid #bae6fd;
            border-left: 1px solid #bae6fd;
          }
          .ic-field.sub {
            background: #f8fafc;
            border-right: 3px solid #64748b;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            border-left: 1px solid #e2e8f0;
          }
          .ic-field .l { font-weight: 700; color: #475569; font-size: 7pt; white-space: nowrap; }
          .ic-field .v { font-weight: 800; font-size: 9.2pt; text-align: left; color: #0f172a; }
          .ic-field .v.en { font-family: sans-serif; font-size: 8pt; direction: ltr; color: #1e293b; text-transform: uppercase; }

          .ic-ghs-panel {
            min-width: 24mm;
            max-width: 30mm;
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            flex-shrink: 0;
          }
          .ic-ghs-panel.grid-2x2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px;
          }
          .ghs-mini {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1px;
          }
          .ghs-mini img {
            width: 8.5mm;
            height: 8.5mm;
            object-fit: contain;
            display: block;
          }
          .ghs-mini span {
            font-size: 5pt;
            font-weight: 800;
            font-family: monospace;
            color: #334155;
            line-height: 1;
          }
          .ghs-safe-box {
            text-align: center;
            color: #047857;
            padding: 2px 4px;
          }
          .ghs-safe-box span {
            display: block;
            font-size: 8.5pt;
            font-weight: 900;
          }
          .ghs-safe-box small {
            display: block;
            font-size: 5.5pt;
            font-weight: 700;
          }

          .ic-grid-info {
            display: grid;
            grid-template-columns: 1.3fr 1fr 0.9fr 0.9fr 0.9fr;
            gap: 4px;
            margin-bottom: 2.5mm;
          }
          .ic-info-box {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            padding: 3.5px 4px;
            text-align: center;
          }
          .ic-info-box .l {
            display: block;
            font-size: 5.8pt;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 1px;
            white-space: nowrap;
          }
          .ic-info-box .v {
            font-weight: 800;
            font-size: 7.4pt;
            display: block;
            line-height: 1.25;
            color: #0f172a;
          }
          .ic-info-box .v.mono {
            font-family: monospace;
            direction: ltr;
            font-size: 7.5pt;
          }
          .molar-tag {
            font-size: 6pt;
            color: #475569;
            font-weight: 700;
          }
          .ic-info-box.status-danger {
            background: var(--danger-bg);
            border-color: var(--danger-border);
          }
          .ic-info-box.status-danger .v {
            color: var(--danger);
          }

          .ic-safety-strip {
            border-radius: 5px;
            padding: 4px 8px;
            font-size: 6.8pt;
            margin-bottom: 2.5mm;
            line-height: 1.35;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
          }
          .ic-safety-strip.is-danger {
            background: #7f1d1d;
            color: #ffffff;
          }
          .ic-safety-strip.is-safe {
            background: var(--primary);
            color: #ffffff;
          }
          .ic-safety-strip .sep { margin: 0 3px; opacity: 0.55; }

          .ic-table-container {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            margin-bottom: 0;
          }
          .pcard.back .ic-table-container {
            margin-bottom: 2.5mm;
          }
          .ic-tbl {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
            font-size: 7pt;
            table-layout: fixed;
          }
          .ic-tbl th, .ic-tbl td { border: 0.6pt solid #94a3b8; padding: 2px 2.5px; text-align: center; }
          .ic-tbl thead th { height: 4.8mm; }
          .ic-tbl th { background: #eef5f9 !important; color: var(--primary-dark) !important; font-weight: 800; font-size: 6.4pt; }
          .ic-tbl td { height: 5mm; background: #ffffff; color: #0f172a; }
          .ic-tbl td.mono { font-family: monospace; font-size: 6.8pt; }
          tr.initial-stock td { background: #f0fdf4 !important; font-weight: 700; }
          tr.carry-over td { background: #f8fafc !important; font-weight: 700; }
          .bold { font-weight: 900; }

          .back-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 4px;
            margin-bottom: 3mm;
            font-weight: 900;
            font-size: 9.5pt;
            color: var(--primary-dark);
          }
          .back-header .ref { font-size: 7.5pt; font-family: monospace; color: #475569; direction: ltr; }

          .ic-safety-rules h3 {
            font-size: 8pt;
            font-weight: 900;
            color: var(--primary-dark);
            margin-bottom: 4px;
          }
          .ghs-details-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 5px;
          }
          .ghs-detail-item {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 6.5pt;
          }
          .ghs-detail-item img {
            width: 5.5mm;
            height: 5.5mm;
            object-fit: contain;
          }
          .ghs-detail-item strong {
            font-family: monospace;
            color: var(--danger);
            margin-left: 3px;
          }
          .ghs-detail-item span {
            font-weight: 700;
            color: #1e293b;
          }
          .rules-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 9px;
            border-radius: 6px;
            font-size: 7pt;
            color: #1e293b;
            line-height: 1.5;
          }
          .rules-box.danger-box {
            background: #fff8f8;
            border-color: #fecaca;
            color: #450a0a;
          }
          .fiscal-close-box {
            margin-top: 6px;
            border: 1px solid var(--primary);
            border-radius: 6px;
            overflow: hidden;
            background: #ffffff;
          }
          .fiscal-close-header {
            background: var(--primary-soft);
            color: var(--primary-dark);
            border-bottom: 1px solid #cbd5e1;
            padding: 3px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 7pt;
            font-weight: 900;
          }
          .fiscal-close-actor {
            font-size: 6.4pt;
            font-weight: 800;
            color: var(--primary);
          }
          .fiscal-close-tbl {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 6.5pt;
          }
          .fiscal-close-tbl th,
          .fiscal-close-tbl td {
            border-top: 0.6pt solid #cbd5e1;
            border-left: 0.6pt solid #cbd5e1;
            text-align: center;
            padding: 2px 4px;
          }
          .fiscal-close-tbl th:last-child,
          .fiscal-close-tbl td:last-child {
            border-left: none;
          }
          .fiscal-close-tbl th {
            background: #f8fafc;
            color: #334155;
            font-weight: 800;
            font-size: 6.1pt;
            height: 4.4mm;
          }
          .fiscal-close-tbl td {
            height: 4.8mm;
            color: #64748b;
            font-weight: 700;
            background: #ffffff;
          }
          .signatures-strip {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 6px;
          }
          .sig-box {
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            background: #fafcff;
            padding: 5px 10px 6px 10px;
            min-height: 21mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
          }
          .sig-title {
            font-size: 7.6pt;
            font-weight: 900;
            color: var(--primary-dark);
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
          }
          .sig-sub {
            font-size: 6.3pt;
            font-weight: 700;
            color: #64748b;
            margin-top: auto;
          }

          @media print {
            body { background: white !important; padding: 0 !important; }
            @page { size: A5 portrait; margin: 3mm; }
            .pcard {
              width: 100% !important;
              height: calc(210mm - 6mm) !important;
              margin: 0 !important;
              border: 1.5px solid var(--primary) !important;
              border-radius: 6px !important;
              box-shadow: none !important;
              page-break-after: always !important;
              padding: 6mm !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pcard.back { border-style: dashed !important; }
            .pcard:last-child { page-break-after: avoid !important; }
            .ph-container { margin: -6mm -6mm 2.5mm -6mm; padding: 4mm 6mm 3mm 6mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ic-tbl th { background: #eef5f9 !important; color: var(--primary-dark) !important; border: 0.6pt solid #94a3b8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ic-tbl td { border: 0.6pt solid #94a3b8 !important; }
            .ic-safety-strip, .ic-field, .ic-info-box, .rules-box, .card-ref-pill, .ghs-detail-item, .sig-box, .fiscal-close-box, .fiscal-close-header, .fiscal-close-tbl th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div id="body">
          ${e.map((t,E)=>{var w,k,$,z,j,D,C;const h=`CHM-${String(E+1).padStart(3,"0")}`,L=t.state==="solid"?"صلب":t.state==="liquid"?"سائل":"غاز",f=t.hazardClass==="danger"||Array.isArray(t.ghs)&&t.ghs.length>0,n=Array.isArray(t.ghs)?t.ghs.filter(Boolean):[],x=q(t.formula),S=(w=t.formula)!=null&&w.trim()?`${i(t.formula.trim())}${x?` <span class="molar-tag">(${x} g/mol)</span>`:""}`:"—",H=W(t.expiryDate),u=!!(t.expiryDate&&!Number.isNaN(new Date(t.expiryDate).getTime())&&new Date(t.expiryDate)<new Date),v=n.map(s=>g(s)).filter(Boolean),N=f?`مادة خطرة${v.length>0?` — ${v.join(" · ")}`:""}`:"مادة آمنة (الاستعمال المخبري القياسي)",G=n.length>0?n.slice(0,4).map(s=>{const c=A(s),m=i(g(s)),l=i(T(s));return c?`<div class="ghs-mini" title="${m}"><img src="${c}" alt="${l}" /><span>${l}</span></div>`:`<div class="ghs-mini"><span>${l}</span></div>`}).join(""):'<div class="ghs-safe-box"><span>آمن</span><small>بدون مخاطر GHS</small></div>',y=n.length>0?n.map(s=>{const c=A(s),m=i(g(s)),l=i(T(s));return`
                  <div class="ghs-detail-item">
                    ${c?`<img src="${c}" alt="${l}" />`:""}
                    <div>
                      <strong>${l}</strong>
                      <span>${m}</span>
                    </div>
                  </div>
                `}).join(""):"",M=f?"يجب ارتداء القفازات المقاومة للمواد الكيميائية والنظارات الواقية والمعطف المخبري، والعمل تحت ساحب الهواء عند اللزوم. يُحفظ في عبوة محكمة الإغلاق بعيداً عن المواد المتعارضة ومصادر الحرارة.":"يُحفظ في مكان جاف وجيد التهوية ضمن الرف المخصص مع الالتزام بقواعد السلامة المخبرية المدرسية.",O=i((k=t.notes)!=null&&k.trim()?t.notes.trim():M);return`
        <div class="pcard">
          <div class="ph-container">
            <div class="ph">
              <div class="ph-r">
                <div>${d}</div>
                <div>${o}</div>
                <div>مخبر العلوم الفيزيائية والكيميائية</div>
              </div>
              <div class="ph-c">
                <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div>وزارة التربية الوطنية</div>
                <div class="doc-sub">بطاقة متابعة مخزون المواد الكيميائية</div>
              </div>
              <div class="ph-l">
                <div>السنة الدراسية: ${p}</div>
                <div class="card-ref-pill">بطاقة رقم: ${h}</div>
                <div class="header-stamp">ختم المؤسسة</div>
              </div>
            </div>
          </div>

          <h1 class="pcard-title">بطاقة مخزون مادة كيميائية (Fiche de Stock)</h1>

          <div class="ic-top-row">
            <div class="ic-meta-expressive">
              <div class="ic-field main">
                <span class="l">التسمية بالعربية</span>
                <span class="v">${i(t.nameAr||t.nameEn||"—")}</span>
              </div>
              <div class="ic-field sub">
                <span class="l">NOM DU PRODUIT</span>
                <span class="v en">${i(t.nameEn||t.nameAr||"—")}</span>
              </div>
            </div>
            <div class="ic-ghs-panel ${n.length>2?"grid-2x2":"row-flex"}">
              ${G}
            </div>
          </div>

          <div class="ic-grid-info">
            <div class="ic-info-box">
              <span class="l">الصيغة والكتلة المولية</span>
              <span class="v mono">${S}</span>
            </div>
            <div class="ic-info-box">
              <span class="l">رقم CAS</span>
              <span class="v mono">${i((($=t.casNumber)==null?void 0:$.trim())||"—")}</span>
            </div>
            <div class="ic-info-box">
              <span class="l">الحالة / الوحدة</span>
              <span class="v">${L} (${i(t.unit||"g")})</span>
            </div>
            <div class="ic-info-box">
              <span class="l">الرف / الخزانة</span>
              <span class="v">${i(((z=t.shelf)==null?void 0:z.trim())||"غير محدد")}</span>
            </div>
            <div class="ic-info-box ${u?"status-danger":""}">
              <span class="l">انتهاء الصلاحية</span>
              <span class="v mono">${i(H)}</span>
            </div>
          </div>

          <div class="ic-safety-strip ${f?"is-danger":"is-safe"}">
            <span><b>طبيعة الخطورة:</b> ${i(N)}</span>
            <span class="sep">|</span>
            <span><b>التخزين:</b> ${i(((j=t.storageTemp)==null?void 0:j.trim())||"حرارة الغرفة")}</span>
            <span class="sep">|</span>
            <span><b>الرصيد الحالي:</b> ${i(t.quantity)} ${i(t.unit||"g")}</span>
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="13%">التاريخ</th>
                  <th colspan="2" width="15%">سند الطلب</th>
                  <th rowspan="2" width="21%">المصدر / المخبر / الأستاذ</th>
                  <th rowspan="2" width="9%">الثمن</th>
                  <th colspan="3" width="22%">الكمية (${i(t.unit||"g")})</th>
                  <th rowspan="2">ملاحظات</th>
                </tr>
                <tr>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>الباقي</th>
                </tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td class="mono">${r}</td>
                  <td>—</td>
                  <td>—</td>
                  <td>رصيد افتتاحي مسجل</td>
                  <td>—</td>
                  <td>—</td>
                  <td class="mono">${i(t.quantity)}</td>
                  <td class="bold mono">${i(t.quantity)}</td>
                  <td>${u?"منتهية الصلاحية":"رصيد أول المدة"}</td>
                </tr>
                ${Array(17).fill("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
                <tr class="carry-over">
                  <td colspan="5">الرصيد المنقول إلى ظهر البطاقة</td>
                  <td></td>
                  <td></td>
                  <td class="bold">..........</td>
                  <td>ينقل ←</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pcard back">
          <div class="back-header">
            <span>تتمة حركة المخزون الكيميائي — ${i(t.nameAr||t.nameEn)}</span>
            <span class="ref">${h} · ${i(t.formula||"")}</span>
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="13%">التاريخ</th>
                  <th colspan="2" width="15%">سند الطلب</th>
                  <th rowspan="2" width="21%">المصدر / الاستعمال</th>
                  <th rowspan="2" width="9%">الثمن</th>
                  <th colspan="3" width="22%">الكمية (${i(t.unit||"g")})</th>
                  <th rowspan="2">ملاحظات / إتلاف</th>
                </tr>
                <tr>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>خروج</th>
                  <th>دخول</th>
                  <th>الباقي</th>
                </tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td colspan="5">المجموع المنقول من وجه البطاقة</td>
                  <td></td>
                  <td></td>
                  <td class="bold">..........</td>
                  <td>نقل ←</td>
                </tr>
                ${Array(n.length>4?10:n.length>0?12:14).fill("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
              </tbody>
            </table>
          </div>

          <div class="ic-safety-rules">
            <h3>إرشادات السلامة الكيميائية وشروط التخزين (FDS)</h3>
            ${y?`<div class="ghs-details-grid">${y}</div>`:""}
            <div class="rules-box ${f?"danger-box":""}">
              <div><b>تعليمات الحفظ والتعامل:</b> ${O}</div>
              <div style="margin-top: 3px;">
                <b>درجة التخزين الموصى بها:</b> ${i(((D=t.storageTemp)==null?void 0:D.trim())||"درجة حرارة الغرفة المعتدلة")}
                <span style="margin: 0 8px; opacity: 0.5;">|</span>
                <b>مكان الحفظ:</b> ${i(((C=t.shelf)==null?void 0:C.trim())||"غير محدد")}
              </div>
            </div>
            <div class="fiscal-close-box">
              <div class="fiscal-close-header">
                <span>إطار غلق البطاقة عند نهاية كل سنة مالية</span>
                <span class="fiscal-close-actor">خاص بـ ${b}</span>
              </div>
              <table class="fiscal-close-tbl">
                <thead>
                  <tr>
                    <th width="28%">السنة المالية</th>
                    <th width="37%">الرصيد عند الغلق (${i(t.unit||"g")})</th>
                    <th width="35%">تاريخ الغلق</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>${p}</td><td></td><td>.... / .... / ....</td><td></td></tr>
                </tbody>
              </table>
            </div>
            <div class="signatures-strip">
              <div class="sig-box">
                <div class="sig-title">${R}</div>
                <div class="sig-sub">(الختم والإمضاء)</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">${b}</div>
                <div class="sig-sub">(الختم والإمضاء)</div>
              </div>
            </div>
          </div>
        </div>
      `}).join("")}
        </div>
      </body>
    </html>
  `}export{st as buildChemicalStockCardsHtml,U as isGenericRolePlaceholder};
