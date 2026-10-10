import{w as ue,k as ae,f as ge,r as x,h as je,j as e}from"./vendor-react-DvF83VeL.js";import{P as ve,u as Ne,f as O,n as ye,R as ke,b as g,A as K,m as ee}from"./index-Cqp08n5M.js";import{Q as Z}from"./index-DkyxtQEV.js";import{u as we}from"./useSqlCollection-Cd7FDoxp.js";import{updateEquipment as $e}from"./equipment-KT4Z5f85.js";import{aA as Ce,ad as re,v as V,Q as Se,g as ze,D as te,P as se,t as _e,b as Ae,X as Ie,al as De,j as Pe,aw as Le,bm as Re,aE as Qe,a8 as Ee}from"./vendor-icons-qqAGvUGr.js";import"./vendor-pdf-xlsx-Dv7mFGGG.js";import"./vendor-firebase-DVX7uQCg.js";import"./vendor-charts-CXCRutjN.js";import"./client-DdQAyOL4.js";function Fe(t){return t.includes("مجهر")?"أجهزة بصرية":t.includes("أنبوب")||t.includes("بيشر")||t.includes("حوجلة")||t.includes("مخبار")?"زجاجيات مخبرية":t.includes("مولد")||t.includes("ميزان")||t.includes("فولطمتر")||t.includes("أمبيرمتر")?"أجهزة قياس وكهرباء":t.includes("مجسم")||t.includes("هيكل")||t.includes("لوحة")?"وسائل إيضاح ومجسمات":"عتاد وأجهزة علمية تعليمية"}function Te(t,i=26){try{return ue.renderToStaticMarkup(ae.createElement(Z,{value:t,size:i,level:"M",includeMargin:!1}))}catch{return'<div style="font-size: 6pt; font-weight: bold; border: 1px solid #000; padding: 2px;">QR</div>'}}function qe(t){const{items:i,paperFormat:h,printSides:p,printScope:c,directorate:o,schoolName:n,commune:w,includeOfficialHeader:D=!0,includeQrCode:P=!0,includeStampBox:j=!0}=t,N=c==="table",l=h==="A5"&&!N;return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بطاقات الجرد الرسمية — ${n}</title>
  <style>
    @page {
      size: ${l?"A5":"A4"} ${N?"landscape":"portrait"};
      margin: ${l?"4mm":N?"8mm":"6mm"};
    }

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      overflow: visible !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      direction: rtl !important;
      font-family: 'Cairo', 'Amiri', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: ${l?"7pt":"8pt"};
      line-height: 1.25;
      overflow: visible !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    ::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    /* Card Page Container */
    .card-page {
      width: 100%;
      background: #ffffff;
      border: ${l?"1.5px":"2px"} solid #000000;
      padding: ${l?"3.5mm 4.5mm":"5.5mm 6.5mm"};
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: ${l?"198mm":"278mm"};
      max-height: ${l?"201mm":"281mm"};
      margin: 0 auto;
    }

    /* Dual Cards Wrapper (2 cards per A4 page) */
    .dual-page-wrapper {
      width: 100%;
      height: 280mm;
      max-height: 282mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
      margin: 0 auto;
    }

    .dual-card {
      width: 100%;
      background: #ffffff;
      border: 1.5px solid #000000;
      padding: 3mm 4mm;
      box-sizing: border-box;
      height: 135mm;
      max-height: 136mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 6.8pt;
      line-height: 1.2;
    }

    .dual-cut-line {
      text-align: center;
      font-size: 7.5pt;
      color: #555555;
      border-top: 1px dashed #666666;
      margin: 2mm 0;
      padding-top: 1mm;
      font-weight: bold;
    }

    .card-page:last-child,
    .dual-page-wrapper:last-child,
    .registry-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Header Components */
    .official-header {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
    }

    .header-columns {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: ${l?"6.5pt":"7.5pt"};
      font-weight: bold;
      line-height: 1.25;
    }

    .header-right {
      text-align: right;
    }

    .header-center {
      text-align: center;
    }

    .header-left {
      text-align: left;
    }

    .rep-title {
      font-size: ${l?"7.5pt":"8.5pt"};
      font-weight: 900;
    }

    .min-title {
      font-size: ${l?"7pt":"8pt"};
      font-weight: 700;
    }

    .year-title {
      font-size: ${l?"6.5pt":"7pt"};
      color: #333333;
    }

    .sn-box {
      font-size: ${l?"9pt":"10pt"};
      font-weight: 900;
      text-decoration: underline;
      font-family: monospace;
    }

    /* Card Title Badge */
    .title-banner {
      text-align: center;
      margin: 3px 0;
    }

    .title-pill {
      display: inline-block;
      border: 2px solid #000000;
      background: #f3f4f6;
      padding: ${l?"1px 16px":"2px 24px"};
      border-radius: 2px;
    }

    .title-pill h1 {
      margin: 0;
      font-size: ${l?"10pt":"11.5pt"};
      font-weight: 900;
      letter-spacing: 0.5px;
      text-decoration: underline;
      text-decoration-style: double;
    }

    /* Review Dates Bar */
    .review-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #000000;
      background: #fafafa;
      padding: 2px 8px;
      font-size: ${l?"6.5pt":"7.5pt"};
      font-weight: bold;
      margin-bottom: 4px;
    }

    .review-val {
      font-weight: 900;
      text-decoration: underline;
    }

    /* 4-Box Technical Header Grid */
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border: 2px solid #000000;
      text-align: center;
      font-size: ${l?"6.5pt":"7.5pt"};
      margin-bottom: 4px;
      background: #ffffff;
    }

    .tech-col {
      padding: 2px;
      border-left: 1px solid #000000;
    }

    .tech-col:last-child {
      border-left: none;
    }

    .tech-col-sn {
      background: #fffbeb;
    }

    .tech-col-hdr {
      font-weight: bold;
      color: #374151;
      border-bottom: 1px solid #000000;
      padding-bottom: 1px;
      margin-bottom: 2px;
    }

    .tech-col-body {
      height: ${l?"20px":"26px"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .sn-large {
      font-size: ${l?"9pt":"10.5pt"};
      letter-spacing: 1px;
      font-family: monospace;
    }

    /* Identification Details Box */
    .details-box {
      border: 1.5px solid #000000;
      padding: ${l?"4px 6px":"6px 8px"};
      margin-bottom: 5px;
      background: #ffffff;
      font-size: ${l?"7pt":"8pt"};
    }

    .detail-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 3px;
    }

    .detail-lbl {
      font-weight: 900;
      white-space: nowrap;
    }

    .detail-val {
      border-bottom: 1px dotted #333333;
      flex: 1;
      padding-bottom: 1px;
    }

    .detail-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 1px;
    }

    /* Movements Section & Table */
    .table-section {
      margin-bottom: 4px;
    }

    .section-title {
      font-weight: 900;
      font-size: ${l?"6.8pt":"7.8pt"};
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-sub {
      font-size: 6pt;
      font-weight: normal;
      color: #4b5563;
    }

    .official-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      text-align: center;
      font-size: ${l?"6.5pt":"7.5pt"};
    }

    .official-table th {
      background: #f3f4f6 !important;
      border: 1px solid #000000;
      font-weight: 900;
      padding: 3px 2px;
      color: #000000;
    }

    .official-table td {
      border: 1px solid #000000;
      padding: 2.5px 2px;
    }

    .data-row td {
      font-weight: 600;
    }

    .empty-row td {
      height: ${l?"16px":"20px"};
    }

    /* Stamps & Signatures Grid */
    .stamps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${l?"8px":"14px"};
      border-top: 1.5px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
      text-align: center;
      font-size: ${l?"6.5pt":"7.5pt"};
      font-weight: bold;
    }

    .stamp-box {
      border: 1px solid #9ca3af;
      background: #f9fafb;
      padding: 3px;
      border-radius: 2px;
    }

    .stamp-space {
      height: ${l?"26px":"36px"};
    }

    /* Back Side Elements */
    .back-hdr-banner {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${l?"6.8pt":"7.8pt"};
      font-weight: bold;
    }

    .back-title {
      font-weight: 900;
      font-size: ${l?"8.5pt":"9.5pt"};
      text-decoration: underline;
    }

    .back-sec-title {
      background: #f3f4f6;
      border: 1px solid #000000;
      padding: 2px 6px;
      font-weight: 900;
      font-size: ${l?"6.8pt":"7.8pt"};
      margin-bottom: 2px;
    }

    .back-footer-notice {
      font-size: 6.5pt;
      color: #374151;
      font-style: italic;
      border-top: 1px solid #000000;
      padding-top: 2px;
      margin-top: 4px;
      text-align: center;
    }

    /* Full Registry Table Sheet (A4 Landscape) */
    .registry-sheet {
      width: 100%;
      background: #ffffff;
      padding: 0;
      box-sizing: border-box;
      font-size: 7.5pt;
    }

    .registry-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000000;
      text-align: center;
      font-size: 7.5pt;
      margin-top: 6px;
    }

    .registry-table th {
      background: #f3f4f6 !important;
      border: 1px solid #000000;
      font-weight: 900;
      padding: 4px 2px;
      color: #000000;
    }

    .registry-table td {
      border: 1px solid #000000;
      padding: 3.5px 2px;
    }

    .registry-stamps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
      text-align: center;
      font-size: 8pt;
      font-weight: bold;
    }
  </style>
</head>
<body class="${l?"format-a5":h==="A4_DUAL"&&!N?"format-dual":"format-a4"}">
  ${N?Ue(i,t):Be(i,t)}
</body>
</html>`}function Ue(t,i){const{directorate:h,schoolName:p,commune:c}=i,o=new Date().toLocaleDateString("ar-DZ");return`
    <div class="registry-sheet">
      <div class="official-header">
        <div class="header-columns">
          <div class="header-right">
            مديرية التربية لولاية: ${h}<br>
            المؤسسة: ${p} (${c})<br>
            مخبر الوسائل التعليمية والعلوم
          </div>
          <div class="header-center">
            <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
            <div class="min-title">وزارة التربية الوطنية</div>
            <div class="year-title">السنة الدراسية: 2025 / 2026</div>
          </div>
          <div class="header-left">
            سجل بطاقات الجرد العام<br>
            تاريخ الطباعة: ${o}<br>
            مجموع التجهيزات: ${t.length}
          </div>
        </div>
      </div>

      <div class="title-banner" style="margin: 8px 0 10px 0;">
        <div class="title-pill">
          <h1>ســجــل بـطــاقـــات الجـــرد الـعــام للـوســائـل والـتـجـهـيـزات الـتـعـلـيـمـيـة</h1>
        </div>
      </div>

      <table class="registry-table">
        <thead>
          <tr>
            <th style="width: 4%;">الرقم</th>
            <th style="width: 12%;">رقم التسجيل</th>
            <th style="width: 12%;">تاريخ التكفل بالتسجيل</th>
            <th style="width: 20%;">تعيين الشيء (العتاد)</th>
            <th style="width: 13%;">مصدره (الممون)</th>
            <th style="width: 10%;">قيمته (دج)</th>
            <th style="width: 12%;">التعيين / الموقع</th>
            <th style="width: 8%;">خروجه</th>
            <th style="width: 9%;">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((n,w)=>`
            <tr>
              <td style="font-weight: bold; text-align: center;">${w+1}</td>
              <td style="font-weight: 800; text-align: center; font-family: monospace;">${n.serialNumber}</td>
              <td style="text-align: center;">${n.foundationalInventory||"—"}</td>
              <td style="font-weight: 700; text-align: right; padding-right: 6px;">${n.name}</td>
              <td>${n.supplier||"—"}</td>
              <td style="text-align: center; font-weight: 700;">${n.price?`${n.price} دج`:"—"}</td>
              <td>${n.location||"مخبر الوسائل"}</td>
              <td style="text-align: center;">${n.exitDate||"—"}</td>
              <td style="font-size: 6.8pt; color: #374151;">${n.notes||"—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="registry-stamps">
        <div class="stamp-box">
          <div>المقتصد / مسير المصالح الاقتصادية:</div>
          <div style="height: 48px;"></div>
        </div>
        <div class="stamp-box">
          <div>مسؤول المخبر الرئيسي:</div>
          <div style="height: 48px;"></div>
        </div>
        <div class="stamp-box">
          <div>رئيس المؤسسة (المدير):</div>
          <div style="height: 48px;"></div>
        </div>
      </div>
    </div>
  `}function Be(t,i){const{paperFormat:h,printSides:p}=i;if(h==="A4_DUAL"){const c=[];for(let o=0;o<t.length;o+=2)c.push(t.slice(o,o+2));return c.map(o=>`
      <div class="dual-page-wrapper">
        <div class="dual-card">
          ${H(o[0],i,!0)}
        </div>
        <div class="dual-cut-line">✂ خط القطع والفصل المعتمد للبطاقات (A5) ✂</div>
        ${o[1]?`
          <div class="dual-card">
            ${H(o[1],i,!0)}
          </div>
        `:`
          <div class="dual-card" style="border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #888;">
            بطاقة فارغة (نهاية القائمة)
          </div>
        `}
      </div>
    `).join("")}return t.map(c=>`
    ${p==="both"||p==="front"?`
      <div class="card-page">
        ${H(c,i,!1)}
      </div>
    `:""}
    ${p==="both"||p==="back"?`
      <div class="card-page">
        ${Me(c,i)}
      </div>
    `:""}
  `).join("")}function H(t,i,h=!1){const{directorate:p,schoolName:c,commune:o,includeOfficialHeader:n=!0,includeQrCode:w=!0,includeStampBox:D=!0,paperFormat:P}=i,j=P==="A5",N=w?Te(`DZ-EDU-INV:${t.serialNumber}:${t.name}`,j?24:26):"",l=Fe(t.name),$=t.price&&!isNaN(Number(t.price))?`${(Number(t.price)*t.totalQuantity).toLocaleString("ar-DZ")} دج`:"—",L=h?1:j?2:3;return`
    <div>
      ${n?`
        <div class="official-header">
          <div class="header-columns">
            <div class="header-right">
              مديرية التربية لولاية: ${p}<br>
              ${c} (${o})<br>
              مخبر الوسائل التعليمية
            </div>
            <div class="header-center">
              <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div class="min-title">وزارة التربية الوطنية</div>
              <div class="year-title">السنة الدراسية: 2025 / 2026</div>
            </div>
            <div class="header-left">
              بطاقة الجرد رقم:<br>
              <span class="sn-box">${t.serialNumber}</span>
            </div>
          </div>
        </div>
      `:""}

      <div class="title-banner">
        <div class="title-pill">
          <h1>بـطــاقـــة الجـــرد</h1>
        </div>
      </div>

      <div class="review-bar">
        <div>
          <span>الجرد التأسيسي لسنة : </span>
          <span class="review-val">${t.foundationalInventory||"2015-10-15"}</span>
        </div>
        <div>
          <span>المراجعة العشرية لسنة : </span>
          <span class="review-val">${t.decennialReview||"2025-10-15"}</span>
        </div>
      </div>

      <div class="tech-grid">
        <div class="tech-col">
          <div class="tech-col-hdr">الفهرس (الصنف)</div>
          <div class="tech-col-body">${l}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">الفرع / الجناح</div>
          <div class="tech-col-body">مخبر العلوم والوسائل</div>
        </div>
        <div class="tech-col tech-col-sn">
          <div class="tech-col-hdr">رقم الجرد العام</div>
          <div class="tech-col-body sn-large">${t.serialNumber}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">ختم المؤسسة والتأشيرة</div>
          <div class="tech-col-body">
            ${w?N:'<span style="font-size: 6pt; color: #888;">مربع الختم</span>'}
          </div>
        </div>
      </div>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-lbl">الـتـعـيـيـن (تعيين الشيء) :</span>
          <span class="detail-val" style="font-weight: 900;">${t.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">الـخـصـائـص والمـواصـفـات :</span>
          <span class="detail-val">${t.notes||"جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة."}</span>
        </div>
        <div class="detail-grid-2">
          <div class="detail-row">
            <span class="detail-lbl">الموقع / الحفظ :</span>
            <span class="detail-val">${t.location||"مخبر الوسائل التعليمية - الخزانة الرئيسية"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-lbl">الممون / المصدر :</span>
            <span class="detail-val">${t.supplier||"المؤسسة الوطنية للوسائل التعليمية"}</span>
          </div>
        </div>
      </div>

      <div class="table-section">
        <div class="section-title">
          <span>جدول حركات الدخول والتكفل بالعتاد:</span>
          <span class="section-sub">(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)</span>
        </div>
        <table class="official-table">
          <thead>
            <tr>
              <th style="width: 18%;">تاريخ الدخول</th>
              <th style="width: 10%;">الكمية</th>
              <th style="width: 15%;">سعر الوحدة</th>
              <th style="width: 18%;">المبلغ الإجمالي</th>
              <th style="width: 21%;">الممون</th>
              <th style="width: 18%;">التعيين الجديد</th>
            </tr>
          </thead>
          <tbody>
            <tr class="data-row">
              <td>${t.foundationalInventory||"2023-09-15"}</td>
              <td style="font-weight: 900;">${t.totalQuantity}</td>
              <td>${t.price?`${t.price} دج`:"—"}</td>
              <td style="font-weight: 900;">${$}</td>
              <td>${t.supplier||"—"}</td>
              <td style="font-size: 6.8pt;">مخبر الوسائل</td>
            </tr>
            ${Array.from({length:L}).map(()=>`
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    ${D?`
      <div class="stamps-grid">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:</div>
          <div class="stamp-space"></div>
        </div>
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة (المدير):</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    `:""}
  `}function Me(t,i){const{includeStampBox:h=!0,paperFormat:p}=i,c=p==="A5";return`
    <div>
      <div class="back-hdr-banner">
        <div>التكفل المستمر وحركات التعيين والإتلاف</div>
        <div class="back-title">بطاقة جرد رقم: ${t.serialNumber} — ${t.name}</div>
        <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
      </div>

      <!-- Section 1 -->
      <div class="table-section">
        <div class="back-sec-title">1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th style="width: 16%;">التاريخ</th>
              <th>اسم ولقب الموظف المسؤول</th>
              <th style="width: 20%;">الصفة / الوظيفة</th>
              <th style="width: 18%;">الإمضاء</th>
              <th style="width: 18%;">تأشيرة المقتصد</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({length:c?3:4}).map(()=>`
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Section 2 -->
      <div class="table-section">
        <div class="back-sec-title">2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 16%;">تاريخ القرار</th>
              <th rowspan="2" style="width: 9%;">الكمية</th>
              <th rowspan="2" style="width: 18%;">رقم الجرد</th>
              <th rowspan="2">التعيين الجديد</th>
              <th colspan="2" style="width: 25%;">الإمضاء والتأشيرة</th>
            </tr>
            <tr>
              <th style="width: 12.5%;">المقتصد</th>
              <th style="width: 12.5%;">العون</th>
            </tr>
          </thead>
          <tbody>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>

      <!-- Section 3 -->
      <div class="table-section">
        <div class="back-sec-title">3. الإسـقـاط والإتـلاف والخـروج (Sorties / Réformes)</div>
        <table class="official-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 16%;">تاريخ القرار</th>
              <th rowspan="2" style="width: 9%;">الكمية</th>
              <th rowspan="2" style="width: 22%;">سبب الخروج</th>
              <th rowspan="2">محضر الإسقاط</th>
              <th colspan="2" style="width: 25%;">الإمضاء والتأشيرة</th>
            </tr>
            <tr>
              <th style="width: 12.5%;">المقتصد</th>
              <th style="width: 12.5%;">المدير</th>
            </tr>
          </thead>
          <tbody>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    ${h?`
      <div class="stamps-grid">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد:</div>
          <div class="stamp-space"></div>
        </div>
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة:</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    `:""}

    <div class="back-footer-notice">
      هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر.
    </div>
  `}async function Oe(t){const i=qe(t),h=t.printScope==="table"?"سجل بطاقات الجرد العام":t.items.length===1?`بطاقة جرد رقم ${t.items[0].serialNumber} - ${t.items[0].name}`:`بطاقات الجرد (${t.items.length} تجهيز)`;await ve.printHtml(i,{title:h})}function tr(){const{t,i18n:i}=ge(),{schoolId:h,schoolName:p,directorate:c,commune:o}=Ne(),[n,w]=x.useState([]),[D,P]=x.useState(!0),[j,N]=x.useState(""),[l,$]=x.useState(null),[L,_]=x.useState(!1),[v,A]=x.useState(0),[f,le]=x.useState("A4"),[C,de]=x.useState("both"),[u,z]=x.useState("single"),[U,G]=x.useState("front"),[R,ie]=x.useState(!0),[Q,ne]=x.useState(!0),[E,ce]=x.useState(!0),[W,X]=x.useState(!1),[I,oe]=x.useState("index"),[F,Y]=x.useState("asc"),be=je(),{data:B,loading:J}=we("equipment","/api/db/equipment");x.useEffect(()=>{const r=()=>{};return window.addEventListener("afterprint",r),()=>window.removeEventListener("afterprint",r)},[]),x.useEffect(()=>{if(B){const r=B.map(s=>({id:s.id,serialNumber:s.serialNumber||"",name:s.smartNameAr||s.name||"",foundationalInventory:s.registrationDate||s.foundationalInventory||"",decennialReview:s.decennialReview||"",totalQuantity:s.totalQuantity||1,supplier:s.source||s.supplier||"",price:s.price||"",location:s.location||"",exitDate:s.exitDate||"",status:s.status==="functional"?"جيدة":s.status==="maintenance"?"تحتاج صيانة":s.status==="broken"?"عاطلة":s.status||"جيدة",notes:s.notes||""}));w(r),P(J)}},[B,J]);const S=async(r,s,a)=>{try{let m=a,he=s;s==="status"&&(a==="جيدة"?m="functional":a==="تحتاج صيانة"||a==="في الإصلاح"?m="maintenance":(a==="عاطلة"||a==="مفقودة")&&(m="broken")),await $e(r,{[he]:m}),w(fe=>fe.map(M=>M.id===r?{...M,[s]:a}:M))}catch(m){console.error("Failed to update equipment card:",m)}},y=r=>{I===r?Y(s=>s==="asc"?"desc":"asc"):(oe(r),Y("asc"))},b=[...n].sort((r,s)=>{if(!F||I==="index")return 0;const a=r[I],m=s[I];return typeof a=="string"&&typeof m=="string"?F==="asc"?a.localeCompare(m,"ar"):m.localeCompare(a,"ar"):typeof a=="number"&&typeof m=="number"?F==="asc"?a-m:m-a:0}).filter(r=>r.name.toLowerCase().includes(j.toLowerCase())||r.serialNumber.toLowerCase().includes(j.toLowerCase())||r.supplier&&r.supplier.toLowerCase().includes(j.toLowerCase())||r.location&&r.location.toLowerCase().includes(j.toLowerCase())||r.notes&&r.notes.toLowerCase().includes(j.toLowerCase())),T={total:n.length,good:n.filter(r=>r.status==="جيدة"||r.status==="functional").length,maintenance:n.filter(r=>r.status==="تحتاج صيانة"||r.status==="maintenance").length,broken:n.filter(r=>r.status==="عاطلة"||r.status==="broken"||r.status==="مفقودة").length},xe=r=>{const s=b.findIndex(a=>a.id===r.id);A(s>=0?s:0),$(r),z("single"),_(!0)},pe=()=>{$(null),z("all"),A(0),_(!0)},q=async(r,s)=>{z(r),s?$(s):r==="single"&&b[v]?$(b[v]):$(null),X(!0);try{let a=[];if(r==="table"||r==="all")a=b;else{const m=s||(b[v]?b[v]:l||b[0]);a=m?[m]:[]}await Oe({items:a,paperFormat:f,printSides:C,printScope:r,directorate:c,schoolName:p,commune:o,includeOfficialHeader:E,includeQrCode:R,includeStampBox:Q})}catch(a){console.warn("Iframe print error, falling back to window.print():",a),setTimeout(()=>{window.print()},100)}finally{X(!1)}},d=b[v]||b[0]||l,k=({field:r})=>I!==r?e.jsx(Re,{size:14,className:"opacity-30 group-hover:opacity-100 transition-opacity"}):F==="asc"?e.jsx(Qe,{size:14}):e.jsx(Ee,{size:14});if(D)return e.jsx("div",{className:"flex items-center justify-center min-h-[400px]",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary"})});const me=u==="single"?l?[l]:d?[d]:[]:b;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"hidden print:block font-sans rtl",dir:"rtl",children:[e.jsx("style",{children:`
            @media print {
              @page {
                ${f==="A5"?"size: A5 portrait; margin: 4mm;":u==="table"?"size: A4 landscape; margin: 8mm;":"size: A4 portrait; margin: 6mm;"}
              }

              *, *::before, *::after {
                box-sizing: border-box !important;
                overflow: visible !important;
                scrollbar-width: none !important;
              }

              html, body {
                background: white !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Cairo', 'Amiri', system-ui, -apple-system, sans-serif !important;
              }

              ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }

              .no-print, .no-print * {
                display: none !important;
              }

              /* A4 Full Card Styling */
              .pcard-a4 {
                background: white;
                border: 2px solid #000;
                padding: 5.5mm 6.5mm;
                width: 100%;
                box-sizing: border-box;
                min-height: 276mm;
                max-height: 280mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
                margin: 0 auto;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* A5 Official Standard Card */
              .pcard-a5 {
                background: white;
                border: 1.5px solid #000;
                padding: 3.5mm 4.5mm;
                width: 100%;
                box-sizing: border-box;
                min-height: 198mm;
                max-height: 200mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
                margin: 0 auto;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* A4 Dual Cards (2 cards on A4 with cut line) */
              .pcard-dual-wrapper {
                height: 280mm;
                max-height: 282mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-after: always;
                break-after: page;
                page-break-inside: avoid;
                break-inside: avoid;
                box-sizing: border-box;
                overflow: visible !important;
              }

              .pcard-dual {
                background: white;
                border: 1.5px solid #000;
                padding: 3mm 4mm;
                width: 100%;
                box-sizing: border-box;
                height: 135mm;
                max-height: 136mm;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: visible !important;
              }

              .dual-cut-line {
                text-align: center;
                font-size: 8pt;
                color: #555;
                border-top: 1px dashed #777;
                margin: 2mm 0;
                padding-top: 1mm;
              }

              .pcard:last-child, .pcard-a4:last-child, .pcard-a5:last-child, .pcard-dual-wrapper:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              /* Common Official Card Components */
              .official-table {
                width: 100%;
                border-collapse: collapse;
                border: 1.5px solid #000;
                table-layout: fixed;
              }

              .official-table th {
                background: #f1f3f0 !important;
                color: #000 !important;
                border: 1px solid #000;
                font-weight: 800;
                text-align: center;
                padding: 2px 4px;
              }

              .official-table td {
                border: 1px solid #000;
                padding: 2px 4px;
                text-align: center;
              }

              .underlined-field {
                border-bottom: 1px dotted #444;
                display: inline-block;
                padding: 0 4px;
                font-weight: 700;
              }
            }
          `}),u==="table"?e.jsxs("div",{className:"w-full text-black",children:[e.jsx("div",{className:"border-b-2 border-black pb-3 mb-4",children:e.jsxs("div",{className:"flex justify-between items-start text-xs font-bold leading-tight",children:[e.jsxs("div",{children:["مديرية التربية لولاية: ",c,e.jsx("br",{}),"المؤسسة: ",p," (",o,")",e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-sm font-black",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"text-xs font-bold",children:"وزارة التربية الوطنية"}),e.jsx("div",{className:"text-base font-black mt-1 underline decoration-double",children:"سجل بطاقات الجرد العام للوسائل التعليمية"})]}),e.jsxs("div",{className:"text-left text-xs font-bold",children:["السنة الدراسية: 2025 / 2026",e.jsx("br",{}),"تاريخ الطباعة: ",new Date().toLocaleDateString("ar-DZ"),e.jsx("br",{}),"عدد التجهيزات: ",b.length]})]})}),e.jsxs("table",{className:"w-full border-collapse border-2 border-black text-[9pt]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b-2 border-black",children:[e.jsx("th",{className:"border border-black p-1 text-center w-8",children:"رقم"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1 text-right",children:"تعيين الجهاز / المادة"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"الجرد التأسيسي"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"المراجعة العشرية"}),e.jsx("th",{className:"border border-black p-1 text-center w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 text-center w-28",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 text-center w-20",children:"الحالة"}),e.jsx("th",{className:"border border-black p-1 text-right w-40",children:"ملاحظات"})]})}),e.jsx("tbody",{children:b.map((r,s)=>e.jsxs("tr",{className:"border-b border-black",children:[e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:s+1}),e.jsx("td",{className:"border border-black p-1 text-center font-black",children:r.serialNumber}),e.jsx("td",{className:"border border-black p-1 text-right font-bold",children:r.name}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.foundationalInventory||"—"}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.decennialReview||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:r.totalQuantity}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-semibold",children:r.status}),e.jsx("td",{className:"border border-black p-1 text-right text-[8pt]",children:r.notes||"—"})]},r.id))})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-6 text-center text-xs font-bold mt-8 pt-4 border-t-2 border-black",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"المقتصد / مسير المصالح الاقتصادية"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"مسؤول المخبر الرئيسي"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"رئيس المؤسسة (المدير)"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]})]})]}):e.jsx("div",{children:me.map(r=>e.jsxs(ae.Fragment,{children:[(C==="both"||C==="front")&&e.jsxs("div",{className:f==="A5"?"pcard-a5":"pcard-a4",children:[E&&e.jsx("div",{className:"border-b-2 border-black pb-1 mb-1",children:e.jsxs("div",{className:"flex justify-between items-start text-[7pt] md:text-[8pt] font-bold leading-tight",children:[e.jsxs("div",{className:"text-right",children:["مديرية التربية لولاية: ",c,e.jsx("br",{}),O(p,o),e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-[8pt]",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-[7.5pt]",children:"وزارة التربية الوطنية"}),e.jsx("div",{className:"font-bold text-[7pt] text-gray-700",children:"السنة الدراسية: 2025 / 2026"})]}),e.jsxs("div",{className:"text-left text-[7pt]",children:["بطاقة الجرد رقم:",e.jsx("br",{}),e.jsx("span",{className:"font-black text-[9pt] underline",children:r.serialNumber})]})]})}),e.jsx("div",{className:"text-center my-1",children:e.jsx("div",{className:"inline-block border-2 border-black bg-gray-100 px-6 py-0.5 rounded-sm",children:e.jsx("h1",{className:"text-[11pt] font-black tracking-wide underline decoration-double",children:"بــطــاقـــة الجـــرد"})})}),e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold border border-black bg-gray-50 px-2 py-1 mb-1.5",children:[e.jsxs("div",{children:[e.jsx("span",{children:"الجرد التأسيسي لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:r.foundationalInventory||"2015-10-15"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"المراجعة العشرية لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:r.decennialReview||"2025-10-15"})]})]}),e.jsxs("div",{className:"grid grid-cols-4 border-2 border-black text-center text-[7.5pt] mb-2 divide-x divide-x-reverse divide-black",children:[e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفهرس (الصنف)"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:r.name.includes("مجهر")?"أجهزة بصرية":r.name.includes("أنبوب")||r.name.includes("بيشر")?"زجاجيات مخبرية":r.name.includes("مولد")||r.name.includes("ميزان")?"أجهزة قياس وكهرباء":"أجهزة وعتاد تعليمي"})]}),e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفرع / الجناح"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:"مخبر العلوم والوسائل"})]}),e.jsxs("div",{className:"p-1 bg-yellow-50/20",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"رقم الجرد العام"}),e.jsx("div",{className:"font-black text-[10pt] text-black h-7 flex items-center justify-center tracking-wider",children:r.serialNumber})]}),e.jsxs("div",{className:"p-1 relative",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-0.5",children:"ختم المؤسسة والتأشيرة"}),e.jsx("div",{className:"h-7 flex items-center justify-center",children:R?e.jsx(Z,{value:`DZ-EDU-INV:${r.serialNumber}:${r.name}`,size:26}):e.jsx("span",{className:"text-[6pt] text-gray-400",children:"مربع الختم"})})]})]}),e.jsxs("div",{className:"border border-black p-2 mb-2 text-[8pt] space-y-1.5 bg-white",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-black whitespace-nowrap",children:"الـتـعـيـيـن (تعيين الشيء) :"}),e.jsx("span",{className:"font-black text-[9pt] border-b border-dotted border-black flex-1 pb-0.5",children:r.name})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الـخـصـائـص والمـواصـفـات :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.notes||"جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة."})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 pt-1",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الموقع / الحفظ :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.location||"مخبر الوسائل التعليمية - الخزانة الرئيسية"})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الممون / المصدر :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.supplier||"المؤسسة الوطنية للوسائل التعليمية"})]})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"text-[7.5pt] font-black mb-1 flex justify-between items-center",children:[e.jsx("span",{children:"جدول حركات الدخول والتكفل بالعتاد:"}),e.jsx("span",{className:"text-[6.5pt] font-normal text-gray-600",children:"(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)"})]}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",children:"تاريخ الدخول"}),e.jsx("th",{className:"border border-black p-1 w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"سعر الوحدة"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"المبلغ الإجمالي"}),e.jsx("th",{className:"border border-black p-1",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"التعيين الجديد (الموقع)"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"ملاحظات"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{className:"border-b border-black font-semibold",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:r.foundationalInventory||"2023-09-15"}),e.jsx("td",{className:"border border-black p-1 font-black text-[8.5pt]",children:r.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:r.price?`${r.price} دج`:"—"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:r.price&&!isNaN(Number(r.price))?`${(Number(r.price)*r.totalQuantity).toLocaleString("ar-DZ")} دج`:"—"}),e.jsx("td",{className:"border border-black p-1",children:r.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:"مخبر الوسائل التعليمية"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:r.status})]}),[...Array(f==="A4"?5:2)].map((s,a)=>e.jsxs("tr",{className:"border-b border-black h-6",children:[e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"})]},a))]})]})]}),Q&&e.jsxs("div",{className:"grid grid-cols-2 gap-4 text-center text-[7pt] font-bold border-t border-black pt-1.5 mt-2",children:[e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:"}),e.jsx("div",{className:"h-9"})]}),e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم رئيس المؤسسة (المدير):"}),e.jsx("div",{className:"h-9"})]})]})]})]}),(C==="both"||C==="back")&&e.jsxs("div",{className:f==="A5"?"pcard-a5":"pcard-a4",children:[e.jsx("div",{className:"border-b-2 border-black pb-1 mb-2",children:e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold",children:[e.jsx("div",{children:"التكفل المستمر وحركات التعيين والإتلاف"}),e.jsxs("div",{className:"text-center font-black text-[9pt] underline",children:["بطاقة جرد رقم: ",r.serialNumber," — ",r.name]}),e.jsx("div",{children:"الجمهورية الجزائرية الديمقراطية الشعبية"})]})}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",children:"التاريخ"}),e.jsx("th",{className:"border border-black p-1",children:"اسم ولقب الموظف المسؤول"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"الصفة / الوظيفة"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"إمضاء المعني"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"تأشيرة المقتصد"})]})}),e.jsx("tbody",{children:[...Array(f==="A4"?6:4)].map((s,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم الجرد الجديد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"التعيين الجديد (المخبر / القاعة)"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"العون المسؤول"})]})]}),e.jsx("tbody",{children:[...Array(f==="A4"?4:2)].map((s,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"3. الإسـقـاط والإتـلاف والخـروج (Réforme / Sortie / Décharge)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار / السند"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج أو الإتلاف (كسر / تقادم)"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"رئيس المؤسسة"})]})]}),e.jsx("tbody",{children:[...Array(f==="A4"?3:2)].map((s,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-700 italic border-t border-black pt-1 mt-2 text-center",children:"هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر."})]})]})]},r.id))})]}),e.jsxs("div",{className:"max-w-7xl mx-auto p-4 md:p-8 bg-surface shadow-2xl rounded-[40px] my-8 font-sans transition-all duration-500 no-print",dir:i.language==="ar"?"rtl":"ltr",children:[e.jsxs("div",{className:"border-b-4 border-double border-primary/20 pb-8 mb-10",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start gap-8 text-sm font-bold text-on-surface/80",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),t("inventory_cards.directorate_label","مديرية التربية لولاية:")," ",c]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),O(p,o)]})]}),e.jsxs("div",{className:"text-center space-y-2 flex-1",children:[e.jsx("div",{className:"flex justify-center mb-4",children:e.jsx("img",{src:ye,alt:"Ministry Logo",className:"h-20 w-auto object-contain"})}),e.jsx("p",{className:"text-xl font-black text-primary tracking-tight",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("p",{className:"text-lg font-bold",children:"وزارة التربية الوطنية"})]}),e.jsx("div",{className:"space-y-2 text-start md:text-end",children:e.jsxs("p",{className:"bg-primary/5 px-4 py-1.5 rounded-full inline-block",children:[t("inventory_cards.academic_year","السنة الدراسية:")," ",e.jsx("span",{className:"font-black",children:"2025 - 2026"})]})})]}),e.jsxs("div",{className:"mt-12 text-center relative",children:[e.jsx("div",{className:"absolute inset-0 flex items-center","aria-hidden":"true",children:e.jsx("div",{className:"w-full border-t border-primary/10"})}),e.jsx("h2",{className:"relative inline-block bg-surface px-8 text-3xl font-black text-primary tracking-tighter decoration-primary decoration-4 underline-offset-8",children:t("inventory_cards.registry_title","سجل بطاقات الجرد - مخبر الوسائل التعليمية")})]})]}),e.jsxs("div",{className:"flex flex-wrap justify-between items-center gap-4 mb-8 no-print",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsxs("button",{onClick:()=>be(ke.EQUIPMENT),className:"group flex items-center gap-2.5 px-6 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm",children:[e.jsx(Ce,{size:18,className:"group-hover:rotate-90 transition-transform duration-300"}),t("inventory_cards.btn_add_equipment","إضافة تجهيز")]}),e.jsxs("button",{onClick:pe,className:"flex items-center gap-2.5 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm",children:[e.jsx(re,{size:18}),e.jsx("span",{children:"معاينة وتنسيق نموذج الطباعة"})]}),e.jsxs("button",{onClick:()=>q("all"),className:"flex items-center gap-2.5 px-6 py-3.5 bg-secondary text-white rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm",children:[e.jsx(V,{size:18}),t("inventory_cards.btn_print_cards","طباعة بطاقات الجرد")]}),e.jsxs("button",{onClick:()=>q("table"),className:"flex items-center gap-2.5 px-5 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-black shadow transition-all text-sm",title:"طباعة السجل الإجمالي كجدول رسمي A4 أفقي",children:[e.jsx(Se,{size:18}),e.jsx("span",{children:"طباعة السجل كجدول"})]})]}),e.jsxs("div",{className:"relative flex-1 max-w-sm group",children:[e.jsx(ze,{className:g("absolute top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors",i.language==="ar"?"right-5":"left-5"),size:18}),e.jsx("input",{type:"text",placeholder:t("inventory_cards.search_placeholder","بحث في السجل بالرقم أو التعيين أو الممون..."),className:g("w-full py-3.5 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl font-bold text-xs md:text-sm shadow-inner transition-all outline-none",i.language==="ar"?"pr-12 pl-4":"pl-12 pr-4"),value:j,onChange:r=>N(r.target.value)})]})]}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 no-print",children:[{label:t("inventory_cards.stat_total","إجمالي بطاقات الجرد"),value:T.total,color:"border-primary",icon:te},{label:t("inventory_cards.stat_good","في حالة جيدة"),value:T.good,color:"border-success",icon:se},{label:t("inventory_cards.stat_maintenance","تحتاج صيانة"),value:T.maintenance,color:"border-warning",icon:se},{label:t("inventory_cards.stat_broken","عاطلة / مفقودة"),value:T.broken,color:"border-error",icon:_e}].map((r,s)=>e.jsxs("div",{className:g("p-5 bg-surface-container-low rounded-3xl border-t-4 shadow-sm hover:shadow transition-all",r.color),children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx(r.icon,{size:20,className:"text-on-surface/40"}),e.jsx("div",{className:"text-2xl font-black text-on-surface",children:r.value})]}),e.jsx("div",{className:"text-xs font-black text-on-surface/60",children:r.label})]},s))}),e.jsx("div",{className:"overflow-x-auto rounded-3xl border border-primary/10 shadow-sm",children:e.jsxs("table",{className:"w-full border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-primary text-white",children:[e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[50px] cursor-pointer group",onClick:()=>y("index"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_index","رقم"),e.jsx(k,{field:"index"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-[130px]",onClick:()=>y("serialNumber"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_serial","رقم الجرد"),e.jsx(k,{field:"serialNumber"})]})}),e.jsx("th",{className:"p-4 font-black text-xs uppercase tracking-widest border-l border-white/10 w-[24%] text-center cursor-pointer group",onClick:()=>y("name"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_name","تعيين الشيء"),e.jsx(k,{field:"name"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>y("foundationalInventory"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_foundational","الجرد التأسيسي"),e.jsx(k,{field:"foundationalInventory"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>y("decennialReview"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_decennial","المراجعة العشرية"),e.jsx(k,{field:"decennialReview"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-20",onClick:()=>y("totalQuantity"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_quantity","الكمية"),e.jsx(k,{field:"totalQuantity"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>y("supplier"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_supplier","الممون"),e.jsx(k,{field:"supplier"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-24",onClick:()=>y("status"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_status","الحالة"),e.jsx(k,{field:"status"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[14%] cursor-pointer group",onClick:()=>y("notes"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_notes","ملاحظات"),e.jsx(k,{field:"notes"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest no-print w-[120px]",children:t("common.actions","إجراءات الطباعة")})]})}),e.jsx("tbody",{children:e.jsx(K,{mode:"popLayout",children:b.map((r,s)=>e.jsxs(ee.tr,{initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.98},transition:{duration:.15,delay:s*.015},className:"border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group",children:[e.jsx("td",{className:"p-3 text-center font-bold text-xs text-on-surface/40 border-l border-primary/5",children:s+1}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all underline decoration-dotted decoration-primary/20",value:r.serialNumber,onChange:a=>S(r.id,"serialNumber",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all decoration-primary/20",value:r.name,onChange:a=>S(r.id,"name",a.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"الجرد التأسيسي",value:r.foundationalInventory,onChange:a=>S(r.id,"foundationalInventory",a.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"المراجعة العشرية",value:r.decennialReview,onChange:a=>S(r.id,"decennialReview",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"number",className:"w-14 bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1 font-bold text-xs text-center transition-all",value:r.totalQuantity,onChange:a=>S(r.id,"totalQuantity",parseInt(a.target.value)||0)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all",value:r.supplier,onChange:a=>S(r.id,"supplier",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsxs("select",{className:"bg-transparent border-none focus:outline-none font-bold text-xs p-1 rounded-lg cursor-pointer",value:r.status,onChange:a=>S(r.id,"status",a.target.value),children:[e.jsx("option",{value:"جيدة",children:t("equipment.status_functional","جيدة")}),e.jsx("option",{value:"تحتاج صيانة",children:t("equipment.status_maintenance","تحتاج صيانة")}),e.jsx("option",{value:"عاطلة",children:t("equipment.status_broken","عاطلة")}),e.jsx("option",{value:"في الإصلاح",children:t("equipment.status_repair","في الإصلاح")}),e.jsx("option",{value:"مفقودة",children:t("equipment.status_missing","مفقودة")})]})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all",value:r.notes,onChange:a=>S(r.id,"notes",a.target.value)})}),e.jsx("td",{className:"p-3 text-center no-print",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>xe(r),title:"معاينة وتنسيق نموذج هذه البطاقة",className:"p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400",children:e.jsx(Ae,{size:15})}),e.jsx("button",{onClick:()=>q("single",r),title:t("inventory_cards.print_individual","طباعة فورية لهذه البطاقة"),className:"p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40",children:e.jsx(V,{size:15})})]})})]},r.id))})})]})}),e.jsxs("div",{className:"mt-8 flex flex-wrap justify-between items-center text-xs font-black text-on-surface/40 no-print gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(te,{size:16}),t("inventory_cards.item_count","عدد التجهيزات في السجل: {{count}} من أصل {{total}}",{count:b.length,total:n.length})]}),e.jsx("div",{className:"italic text-[11pt] text-gray-500",children:t("inventory_cards.official_notice","هذا السجل ونماذج بطاقات الجرد تعتبر وثائق رسمية لجرد الوسائل التعليمية المعتمدة")})]})]}),e.jsx(K,{children:L&&d&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto no-print",children:e.jsxs(ee.div,{initial:{opacity:0,scale:.95,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:10},className:"bg-surface rounded-3xl shadow-2xl border border-primary/20 w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[92vh]",dir:"rtl",children:[e.jsxs("div",{className:"p-5 border-b border-primary/10 bg-primary/5 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"p-2.5 bg-primary/10 text-primary rounded-xl",children:e.jsx(re,{size:20})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-black text-on-surface",children:"معاينة وتنسيق نموذج بطاقة الجرد للطباعة"}),e.jsx("p",{className:"text-xs font-bold text-on-surface/60",children:"تخصيص أبعاد الورق، الوجهين، والبيانات الرسمية وفق مواصفات وزارة التربية الوطنية"})]})]}),e.jsx("button",{onClick:()=>_(!1),className:"p-2 rounded-xl text-on-surface/50 hover:bg-black/5 hover:text-on-surface transition-colors",children:e.jsx(Ie,{size:20})})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto",children:[e.jsxs("div",{className:"lg:col-span-4 p-5 border-l border-primary/10 bg-surface-container-lowest space-y-5 text-sm",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-on-surface/70 mb-2",children:"نطاق الطباعة:"}),e.jsxs("div",{className:"grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl",children:[e.jsx("button",{onClick:()=>z("single"),className:g("py-2 text-xs font-black rounded-lg transition-all",u==="single"?"bg-primary text-white shadow":"text-on-surface/70 hover:bg-black/5"),children:"بطاقة مفردة"}),e.jsx("button",{onClick:()=>z("all"),className:g("py-2 text-xs font-black rounded-lg transition-all",u==="all"?"bg-primary text-white shadow":"text-on-surface/70 hover:bg-black/5"),children:"جميع البطاقات"}),e.jsx("button",{onClick:()=>z("table"),className:g("py-2 text-xs font-black rounded-lg transition-all",u==="table"?"bg-primary text-white shadow":"text-on-surface/70 hover:bg-black/5"),children:"السجل كجدول"})]})]}),u!=="table"&&e.jsxs("div",{className:"bg-surface-container-low p-3 rounded-2xl border border-primary/10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("label",{className:"text-xs font-black text-on-surface/70",children:"اختيار التجهيز للمعاينة:"}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{onClick:()=>A(r=>Math.max(0,r-1)),disabled:v===0,className:"p-1 rounded bg-surface hover:bg-primary/10 disabled:opacity-30",children:e.jsx(De,{size:16})}),e.jsxs("span",{className:"text-xs font-black px-1.5",children:[v+1," / ",b.length]}),e.jsx("button",{onClick:()=>A(r=>Math.min(b.length-1,r+1)),disabled:v>=b.length-1,className:"p-1 rounded bg-surface hover:bg-primary/10 disabled:opacity-30",children:e.jsx(Pe,{size:16})})]})]}),e.jsx("select",{className:"w-full bg-surface border border-primary/20 rounded-xl p-2 text-xs font-bold",value:v,onChange:r=>A(Number(r.target.value)),children:b.map((r,s)=>e.jsxs("option",{value:s,children:["[",r.serialNumber,"] ",r.name]},r.id))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-on-surface/70 mb-2",children:"تنسيق وحجم الورق المطبعي:"}),e.jsx("div",{className:"space-y-2",children:[{id:"A4",label:"A4 قياسي (بطاقة كاملة مفصلة)",desc:"210 × 297 مم - النموذج الأوضح والأشمل"},{id:"A5",label:"A5 كرتوني (بطاقة الجرد الوزارية القياسية)",desc:"148 × 210 مم - الحجم المعتمد لعلب البطاقات"},{id:"A4_DUAL",label:"A4 اقتصادي (بطاقتان في صفحة واحدة)",desc:"بطاقتان A5 في ورقة A4 مع خط قطع ✂"}].map(r=>e.jsxs("div",{onClick:()=>le(r.id),className:g("p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3",f===r.id?"border-primary bg-primary/5 shadow-sm":"border-transparent bg-surface hover:bg-surface-container"),children:[e.jsx("div",{className:g("w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0",f===r.id?"border-primary bg-primary":"border-on-surface/30"),children:f===r.id&&e.jsx("div",{className:"w-1.5 h-1.5 bg-white rounded-full"})}),e.jsxs("div",{children:[e.jsx("div",{className:"font-black text-xs text-on-surface",children:r.label}),e.jsx("div",{className:"text-[10px] text-on-surface/50 font-bold",children:r.desc})]})]},r.id))})]}),u!=="table"&&e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-on-surface/70 mb-2",children:"أوجه البطاقة المراد طباعتها:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{id:"both",label:"الوجهان معاً"},{id:"front",label:"الوجه الأمامي"},{id:"back",label:"الظهر (الخلفي)"}].map(r=>e.jsx("button",{onClick:()=>de(r.id),className:g("p-2 rounded-xl text-xs font-black border-2 transition-all text-center",C===r.id?"border-primary bg-primary/10 text-primary":"border-primary/10 text-on-surface/70 hover:bg-black/5"),children:r.label},r.id))})]}),e.jsxs("div",{className:"pt-2 border-t border-primary/10 space-y-2",children:[e.jsx("label",{className:"block text-xs font-black text-on-surface/70 mb-1",children:"عناصر النموذج الرسمي:"}),e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:R,onChange:r=>ie(r.target.checked),className:"rounded accent-primary"}),e.jsx("span",{className:"text-xs font-bold text-on-surface/80",children:"تضمين رمز QR Code السريع بالبطاقة"})]}),e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:E,onChange:r=>ce(r.target.checked),className:"rounded accent-primary"}),e.jsx("span",{className:"text-xs font-bold text-on-surface/80",children:"إظهار الترويسة الوزارية الرسمية"})]}),e.jsxs("label",{className:"flex items-center gap-2 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:Q,onChange:r=>ne(r.target.checked),className:"rounded accent-primary"}),e.jsx("span",{className:"text-xs font-bold text-on-surface/80",children:"إظهار خانات أختام وتأشيرة المقتصد والمدير"})]})]})]}),e.jsxs("div",{className:"lg:col-span-8 p-6 bg-gray-100 flex flex-col items-center justify-start overflow-y-auto min-h-[480px]",children:[u!=="table"&&e.jsxs("div",{className:"w-full max-w-xl flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200",children:[e.jsx("span",{className:"text-xs font-black text-gray-500",children:"معاينة الوجه:"}),e.jsx("button",{onClick:()=>G("front"),className:g("px-3 py-1 rounded-full text-xs font-black transition-all",U==="front"?"bg-primary text-white shadow-sm":"text-gray-600 hover:bg-gray-100"),children:"الوجه الأمامي (Recto)"}),e.jsx("button",{onClick:()=>G("back"),className:g("px-3 py-1 rounded-full text-xs font-black transition-all",U==="back"?"bg-primary text-white shadow-sm":"text-gray-600 hover:bg-gray-100"),children:"الوجه الخلفي (Verso)"})]}),e.jsxs("div",{className:"text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200",children:["المقاس: ",e.jsx("span",{className:"font-black text-black",children:f})," | ",C==="both"?"الوجهان":C==="front"?"وجه أمامي فقط":"وجه خلفي فقط"]})]}),e.jsxs("div",{className:"w-full max-w-xl bg-white shadow-xl rounded-md border-2 border-black p-6 text-black font-sans min-h-[620px] flex flex-col justify-between",children:[U==="front"?e.jsxs("div",{children:[E&&e.jsx("div",{className:"border-b-2 border-black pb-2 mb-2",children:e.jsxs("div",{className:"flex justify-between items-start text-[8pt] font-bold leading-tight",children:[e.jsxs("div",{children:["مديرية التربية لولاية: ",c,e.jsx("br",{}),O(p,o),e.jsx("br",{}),"مخبر الوسائل التعليمية"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-[9pt]",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-[8pt]",children:"وزارة التربية الوطنية"}),e.jsx("div",{className:"font-bold text-[7.5pt] text-gray-600",children:"السنة الدراسية: 2025 / 2026"})]}),e.jsxs("div",{className:"text-left text-[8pt]",children:["بطاقة الجرد رقم:",e.jsx("br",{}),e.jsx("span",{className:"font-black text-[10pt] underline",children:d.serialNumber})]})]})}),e.jsx("div",{className:"text-center my-2",children:e.jsx("div",{className:"inline-block border-2 border-black bg-gray-100 px-6 py-1 rounded-sm",children:e.jsx("h2",{className:"text-sm font-black underline decoration-double",children:"بـطــاقـــة الجـــرد"})})}),e.jsxs("div",{className:"flex justify-between items-center text-[8pt] font-bold border border-black bg-gray-50 px-3 py-1 mb-2",children:[e.jsxs("div",{children:[e.jsx("span",{children:"الجرد التأسيسي لسنة : "}),e.jsx("span",{className:"font-black underline",children:d.foundationalInventory||"2015-10-15"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"المراجعة العشرية لسنة : "}),e.jsx("span",{className:"font-black underline",children:d.decennialReview||"2025-10-15"})]})]}),e.jsxs("div",{className:"grid grid-cols-4 border-2 border-black text-center text-[8pt] mb-3 divide-x divide-x-reverse divide-black",children:[e.jsxs("div",{className:"p-1.5",children:[e.jsx("div",{className:"font-bold text-gray-600 border-b border-black pb-0.5 mb-1",children:"الفهرس"}),e.jsx("div",{className:"font-black text-[9pt] h-8 flex items-center justify-center",children:"أجهزة تعليمية"})]}),e.jsxs("div",{className:"p-1.5",children:[e.jsx("div",{className:"font-bold text-gray-600 border-b border-black pb-0.5 mb-1",children:"الفرع"}),e.jsx("div",{className:"font-black text-[9pt] h-8 flex items-center justify-center",children:"مخبر العلوم والوسائل"})]}),e.jsxs("div",{className:"p-1.5 bg-yellow-50/40",children:[e.jsx("div",{className:"font-bold text-gray-600 border-b border-black pb-0.5 mb-1",children:"رقم الجرد"}),e.jsx("div",{className:"font-black text-[11pt] h-8 flex items-center justify-center",children:d.serialNumber})]}),e.jsxs("div",{className:"p-1.5",children:[e.jsx("div",{className:"font-bold text-gray-600 border-b border-black pb-0.5 mb-1",children:"ختم المؤسسة"}),e.jsx("div",{className:"h-8 flex items-center justify-center",children:R?e.jsx(Z,{value:`DZ-EDU-INV:${d.serialNumber}:${d.name}`,size:28}):e.jsx("span",{className:"text-[7pt] text-gray-400",children:"مربع الختم"})})]})]}),e.jsxs("div",{className:"border border-black p-3 mb-3 text-[8.5pt] space-y-1.5 bg-white",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-black whitespace-nowrap",children:"الـتـعـيـيـن :"}),e.jsx("span",{className:"font-black text-[9.5pt] border-b border-dotted border-black flex-1 pb-0.5",children:d.name})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الـخـصـائـص :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:d.notes||"جهاز تعليمي مخبري مطابق للمعايير الرسمية"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 pt-1",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الموقع :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:d.location||"مخبر الوسائل التعليمية"})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الممون :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:d.supplier||"المؤسسة الوطنية للوسائل"})]})]})]}),e.jsxs("div",{className:"mt-2",children:[e.jsx("div",{className:"text-[8pt] font-black mb-1",children:"جدول حركات الدخول والتكفل:"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[8pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1",children:"تاريخ الدخول"}),e.jsx("th",{className:"border border-black p-1",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",children:"سعر الوحدة"}),e.jsx("th",{className:"border border-black p-1",children:"المبلغ الإجمالي"}),e.jsx("th",{className:"border border-black p-1",children:"الممون"}),e.jsx("th",{className:"border border-black p-1",children:"التعيين الجديد"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{className:"border-b border-black font-semibold",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:d.foundationalInventory||"2023-09-15"}),e.jsx("td",{className:"border border-black p-1 font-black",children:d.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:d.price?`${d.price} دج`:"—"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:d.price&&!isNaN(Number(d.price))?`${(Number(d.price)*d.totalQuantity).toLocaleString("ar-DZ")} دج`:"—"}),e.jsx("td",{className:"border border-black p-1",children:d.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-[7.5pt]",children:"مخبر الوسائل"})]}),[...Array(3)].map((r,s)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},s))]})]})]})]}):e.jsxs("div",{children:[e.jsx("div",{className:"border-b-2 border-black pb-1 mb-3",children:e.jsxs("div",{className:"flex justify-between items-center text-[8pt] font-bold",children:[e.jsx("div",{children:"التكفل المستمر وحركات التعيين والإتلاف"}),e.jsxs("div",{className:"text-center font-black text-[9pt] underline",children:["بطاقة رقم: ",d.serialNumber," — ",d.name]}),e.jsx("div",{children:"الجمهورية الجزائرية"})]})}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1",children:"1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",children:"التاريخ"}),e.jsx("th",{className:"border border-black p-1",children:"اسم ولقب الموظف المسؤول"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"الصفة"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"الإمضاء"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"تأشيرة المقتصد"})]})}),e.jsx("tbody",{children:[...Array(4)].map((r,s)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},s))})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1",children:"2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"التعيين الجديد"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-16",children:"العون"})]})]}),e.jsx("tbody",{children:[...Array(2)].map((r,s)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},s))})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[8pt] mb-1",children:"3. الإسـقـاط والإتـلاف والخـروج (Sorties / Réformes)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج"}),e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المدير"})]})]}),e.jsx("tbody",{children:[...Array(2)].map((r,s)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},s))})]})]})]}),Q&&e.jsxs("div",{className:"grid grid-cols-2 gap-4 text-center text-[7.5pt] font-bold border-t border-black pt-2 mt-4",children:[e.jsxs("div",{className:"border border-gray-300 p-1.5 rounded bg-gray-50",children:[e.jsx("div",{children:"تأشيرة وختم المقتصد:"}),e.jsx("div",{className:"h-8"})]}),e.jsxs("div",{className:"border border-gray-300 p-1.5 rounded bg-gray-50",children:[e.jsx("div",{children:"تأشيرة وختم رئيس المؤسسة:"}),e.jsx("div",{className:"h-8"})]})]})]})]})]}),e.jsxs("div",{className:"p-4 border-t border-primary/10 bg-surface-container-low flex flex-wrap items-center justify-between gap-4",children:[e.jsxs("div",{className:"text-xs font-bold text-on-surface/60 flex items-center gap-2",children:[e.jsx(Le,{size:16,className:"text-emerald-600"}),e.jsxs("span",{children:["النموذج جاهز للطباعة بالتنسيق المحدد (",f," — ",u==="table"?"سجل إجمالي":u==="all"?`جميع البطاقات (${b.length})`:"بطاقة واحدة",")"]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>_(!1),className:"px-5 py-2.5 rounded-xl font-black text-xs text-on-surface/70 hover:bg-black/5 transition-colors",children:"إغلاق"}),e.jsx("button",{onClick:()=>{q(u,u==="single"?d:void 0)},disabled:W,className:"flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-black text-sm shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed",children:W?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsx("span",{children:"جاري إرسال الأمر للطباعة..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(V,{size:18}),e.jsx("span",{children:"طباعة النموذج الآن"})]})})]})]})]})})})]})}export{tr as default};
