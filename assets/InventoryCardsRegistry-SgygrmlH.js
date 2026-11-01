import{w as er,k as Le,r as n,j as e,h as rr,u as tr}from"./vendor-react-DmbYBmZj.js";import{W as sr,k as we,A as ke,m as Se,v as He,u as ar,j as lr,R as nr,d as R}from"./index-B9ghwCbf.js";import{Q as qe}from"./index--QcqAzwn.js";import{u as ce,w as Ve}from"./vendor-pdf-xlsx-BMrgM8wc.js";import{u as or}from"./useSqlCollection-CJs31JdM.js";import{updateEquipment as ir}from"./equipment-DKClxCPQ.js";import{_ as be,n as Fe,aw as Ye,bq as Ze,a4 as fe,aR as Qe,aq as Ge,az as dr,aA as cr,X as Ke,P as Me,h as br,o as xr,aj as We,ay as pr,al as mr,am as hr,ar as ur,j as Te,aI as fr,ag as Ue,e as Ee,g as gr,ad as jr,D as Pe,br as vr,bt as yr,V as Nr,bu as wr,aM as kr}from"./vendor-icons-Bv2K7oul.js";import"./vendor-firebase-35I7n-h0.js";import"./vendor-charts-GhEvU5-v.js";function Sr(t){return t.includes("مجهر")?"أجهزة بصرية":t.includes("أنبوب")||t.includes("بيشر")||t.includes("حوجلة")||t.includes("مخبار")?"زجاجيات مخبرية":t.includes("مولد")||t.includes("ميزان")||t.includes("فولطمتر")||t.includes("أمبيرمتر")?"أجهزة قياس وكهرباء":t.includes("مجسم")||t.includes("هيكل")||t.includes("لوحة")?"وسائل إيضاح ومجسمات":"عتاد وأجهزة علمية تعليمية"}function Cr(t,c=26){try{return er.renderToStaticMarkup(Le.createElement(qe,{value:t,size:c,level:"M",includeMargin:!1}))}catch{return'<div style="font-size: 6pt; font-weight: bold; border: 1px solid #000; padding: 2px;">QR</div>'}}function $r(t){const{items:c,paperFormat:o,printSides:p,printScope:m,directorate:h,schoolName:w,commune:v,includeOfficialHeader:E=!0,includeQrCode:$=!0,includeStampBox:B=!0,includeSupervisorStamp:Y=!0,colorMode:Q="color",isEconomical:z=!1}=t,u=m==="table",i=o==="A5"&&!u;return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بطاقات الجرد الرسمية — ${w}</title>
  <style>
    @page {
      size: ${i?"A5":"A4"} ${u?"landscape":"portrait"};
      margin: ${i?"4mm":u?"8mm":"6mm"};
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
      font-size: ${i?"7pt":"8pt"};
      line-height: 1.25;
      overflow: visible !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      ${Q==="grayscale"||z?"filter: grayscale(100%);":""}
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
      border: ${i?"1.5px":"2px"} solid #000000;
      padding: ${i?"3.5mm 4.5mm":"5.5mm 6.5mm"};
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: ${i?"198mm":"278mm"};
      max-height: ${i?"201mm":"281mm"};
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
      font-size: ${i?"6.5pt":"7.5pt"};
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
      font-size: ${i?"7.5pt":"8.5pt"};
      font-weight: 900;
    }

    .min-title {
      font-size: ${i?"7pt":"8pt"};
      font-weight: 700;
    }

    .year-title {
      font-size: ${i?"6.5pt":"7pt"};
      color: #333333;
    }

    .sn-box {
      font-size: ${i?"9pt":"10pt"};
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
      padding: ${i?"1px 16px":"2px 24px"};
      border-radius: 2px;
    }

    .title-pill h1 {
      margin: 0;
      font-size: ${i?"10pt":"11.5pt"};
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
      font-size: ${i?"6.5pt":"7.5pt"};
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
      font-size: ${i?"6.5pt":"7.5pt"};
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
      height: ${i?"20px":"26px"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .sn-large {
      font-size: ${i?"9pt":"10.5pt"};
      letter-spacing: 1px;
      font-family: monospace;
    }

    /* Identification Details Box */
    .details-box {
      border: 1.5px solid #000000;
      padding: ${i?"4px 6px":"6px 8px"};
      margin-bottom: 5px;
      background: #ffffff;
      font-size: ${i?"7pt":"8pt"};
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
      font-size: ${i?"6.8pt":"7.8pt"};
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
      font-size: ${i?"6.5pt":"7.5pt"};
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
      height: ${i?"16px":"20px"};
    }

    /* Stamps & Signatures Grid */
    .stamps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${i?"8px":"14px"};
      border-top: 1.5px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
      text-align: center;
      font-size: ${i?"6.5pt":"7.5pt"};
      font-weight: bold;
    }

    .stamp-box {
      border: 1px solid #9ca3af;
      background: #f9fafb;
      padding: 3px;
      border-radius: 2px;
    }

    .stamp-space {
      height: ${i?"26px":"36px"};
    }

    /* Back Side Elements */
    .back-hdr-banner {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${i?"6.8pt":"7.8pt"};
      font-weight: bold;
    }

    .back-title {
      font-weight: 900;
      font-size: ${i?"8.5pt":"9.5pt"};
      text-decoration: underline;
    }

    .back-sec-title {
      background: #f3f4f6;
      border: 1px solid #000000;
      padding: 2px 6px;
      font-weight: 900;
      font-size: ${i?"6.8pt":"7.8pt"};
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
<body class="${i?"format-a5":o==="A4_DUAL"&&!u?"format-dual":"format-a4"}">
  ${u?zr(c,t):_r(c,t)}
</body>
</html>`}function zr(t,c){const{directorate:o,schoolName:p,commune:m}=c,h=c.academicYear||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025 / 2026",w=new Date().toLocaleDateString("ar-DZ");return`
    <div class="registry-sheet">
      <div class="official-header">
        <div class="header-columns">
          <div class="header-right">
            ${o}<br>
            ${p} (${m})<br>
            مخبر الوسائل التعليمية والعلوم
          </div>
          <div class="header-center">
            <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
            <div class="min-title">وزارة التربية الوطنية</div>
            <div class="year-title">السنة الدراسية: ${h}</div>
          </div>
          <div class="header-left">
            سجل بطاقات الجرد العام<br>
            تاريخ الطباعة: ${w}<br>
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
          ${t.map((v,E)=>`
            <tr>
              <td style="font-weight: bold; text-align: center;">${E+1}</td>
              <td style="font-weight: 800; text-align: center; font-family: monospace;">${v.serialNumber}</td>
              <td style="text-align: center;">${v.foundationalInventory||"—"}</td>
              <td style="font-weight: 700; text-align: right; padding-right: 6px;">${v.name}</td>
              <td>${v.supplier||"—"}</td>
              <td style="text-align: center; font-weight: 700;">${v.price?`${v.price} دج`:"—"}</td>
              <td>${v.location||"مخبر الوسائل"}</td>
              <td style="text-align: center;">${v.exitDate||"—"}</td>
              <td style="font-size: 6.8pt; color: #374151;">${v.notes||"—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="registry-stamps" style="grid-template-columns: repeat(${c.includeSupervisorStamp!==!1?"4":"3"}, 1fr);">
        <div class="stamp-box">
          <div>المقتصد / مسير المصالح الاقتصادية:</div>
          <div style="height: 48px;"></div>
        </div>
        <div class="stamp-box">
          <div>مسؤول المخبر الرئيسي:</div>
          <div style="height: 48px;"></div>
        </div>
        ${c.includeSupervisorStamp!==!1?`
        <div class="stamp-box">
          <div>الناظر (التوقيع والختم):</div>
          <div style="height: 48px;"></div>
        </div>
        `:""}
        <div class="stamp-box">
          <div>رئيس المؤسسة (المدير):</div>
          <div style="height: 48px;"></div>
        </div>
      </div>
    </div>
  `}function _r(t,c){const{paperFormat:o,printSides:p}=c;if(o==="A4_DUAL"){const m=[];for(let h=0;h<t.length;h+=2)m.push(t.slice(h,h+2));return m.map(h=>`
      <div class="dual-page-wrapper">
        <div class="dual-card">
          ${Re(h[0],c,!0)}
        </div>
        <div class="dual-cut-line">✂ خط القطع والفصل المعتمد للبطاقات (A5) ✂</div>
        ${h[1]?`
          <div class="dual-card">
            ${Re(h[1],c,!0)}
          </div>
        `:`
          <div class="dual-card" style="border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #888;">
            بطاقة فارغة (نهاية القائمة)
          </div>
        `}
      </div>
    `).join("")}return t.map(m=>`
    ${p==="both"||p==="front"?`
      <div class="card-page">
        ${Re(m,c,!1)}
      </div>
    `:""}
    ${p==="both"||p==="back"?`
      <div class="card-page">
        ${Ar(m,c)}
      </div>
    `:""}
  `).join("")}function Re(t,c,o=!1){const{directorate:p,schoolName:m,commune:h,includeOfficialHeader:w=!0,includeQrCode:v=!0,includeStampBox:E=!0,paperFormat:$,academicYear:B}=c,Y=B||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025 / 2026",Q=$==="A5",z=v?Cr(`DZ-EDU-INV:${t.serialNumber}:${t.name}`,Q?24:26):"",u=Sr(t.name),i=t.price&&!isNaN(Number(t.price))?`${(Number(t.price)*t.totalQuantity).toLocaleString("ar-DZ")} دج`:"—",y=o?1:Q?2:3;return`
    <div>
      ${w?`
        <div class="official-header">
          <div class="header-columns">
            <div class="header-right">
              ${p}<br>
              ${m} (${h})<br>
              مخبر الوسائل التعليمية
            </div>
            <div class="header-center">
              <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div class="min-title">وزارة التربية الوطنية</div>
              <div class="year-title">السنة الدراسية: ${Y}</div>
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
          <div class="tech-col-body">${u}</div>
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
            ${v?z:'<span style="font-size: 6pt; color: #888;">مربع الختم</span>'}
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
              <td style="font-weight: 900;">${i}</td>
              <td>${t.supplier||"—"}</td>
              <td style="font-size: 6.8pt;">مخبر الوسائل</td>
            </tr>
            ${Array.from({length:y}).map(()=>`
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    ${E?`
      <div class="stamps-grid" style="grid-template-columns: repeat(${c.includeSupervisorStamp!==!1?"3":"2"}, 1fr);">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:</div>
          <div class="stamp-space"></div>
        </div>
        ${c.includeSupervisorStamp!==!1?`
        <div class="stamp-box">
          <div>الناظر (التوقيع والختم):</div>
          <div class="stamp-space"></div>
        </div>
        `:""}
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة (المدير):</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    `:""}
  `}function Ar(t,c){const{includeStampBox:o=!0,paperFormat:p}=c,m=p==="A5";return`
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
            ${Array.from({length:m?3:4}).map(()=>`
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

    ${o?`
      <div class="stamps-grid" style="grid-template-columns: repeat(${c.includeSupervisorStamp!==!1?"3":"2"}, 1fr);">
        <div class="stamp-box">
          <div>تأشيرة وختم المقتصد:</div>
          <div class="stamp-space"></div>
        </div>
        ${c.includeSupervisorStamp!==!1?`
        <div class="stamp-box">
          <div>الناظر (التوقيع والختم):</div>
          <div class="stamp-space"></div>
        </div>
        `:""}
        <div class="stamp-box">
          <div>تأشيرة وختم رئيس المؤسسة:</div>
          <div class="stamp-space"></div>
        </div>
      </div>
    `:""}

    <div class="back-footer-notice">
      هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر.
    </div>
  `}async function Xe(t){const c=$r(t),o=t.printScope==="table"?"سجل بطاقات الجرد العام":t.items.length===1?`بطاقة جرد رقم ${t.items[0].serialNumber} - ${t.items[0].name}`:`بطاقات الجرد (${t.items.length} تجهيز)`;await sr.printHtml(c,{title:o})}function Ir({isOpen:t,onClose:c,items:o,initialItem:p,initialScope:m="all",initialMode:h="filled",initialPaperFormat:w="A5",initialPrintSides:v="both",initialColorMode:E="color",initialIncludeHeader:$=!0,initialIncludeQr:B=!0,initialIncludeStamp:Y=!0,initialIncludeSupervisorStamp:Q=!0,initialCopies:z=1,schoolInfo:u}){const[i,y]=n.useState(h),[g,P]=n.useState(m),[I,X]=n.useState(w),[L,J]=n.useState(v),[N,xe]=n.useState("front"),[D,U]=n.useState(0),[S,te]=n.useState(""),[Ce,ge]=n.useState(100),[Z,$e]=n.useState(!1),[G,ze]=n.useState(!0),[K,_e]=n.useState(!1),[H,se]=n.useState(z),[k,ae]=n.useState(E),[le,ee]=n.useState(E==="grayscale"),[M,pe]=n.useState($),[T,je]=n.useState(B),[C,ne]=n.useState(Y),[q,me]=n.useState(Q),[W,ve]=n.useState("dotted"),[he,Ae]=n.useState(6),[re,oe]=n.useState(!1),[ye,F]=n.useState(!1);n.useEffect(()=>{if(t)if(y(h),P(m),X(w),J(v),ae(E),ee(E==="grayscale"),pe($),je(B),ne(Y),me(Q),se(z),p&&o.length>0){const s=o.findIndex(d=>d.id===p.id||d.serialNumber===p.serialNumber);U(s>=0?s:0)}else U(0)},[t,p,m,h,w,v,E,$,B,Y,Q,z,o]);const f=n.useMemo(()=>o.length===0?{id:"dummy",serialNumber:"001/2026",name:"مجهر ضوئي ثنائي العينية",foundationalInventory:"تأسيسي 2024",decennialReview:"عشرية 2025",totalQuantity:4,supplier:"الديوان الوطني للمطبوعات المدرسية",price:"45000.00 دج",location:"مخبر العلوم الطبيعية - خزانة 02",status:"جيدة",notes:"معدات بصرية كاملة الملحقات"}:o[D]||o[0],[o,D]);n.useMemo(()=>{if(!S.trim())return o;const s=S.toLowerCase();return o.filter(d=>d.name.toLowerCase().includes(s)||d.serialNumber.toLowerCase().includes(s)||d.supplier&&d.supplier.toLowerCase().includes(s))},[o,S]);const j=i==="blank",_=n.useCallback(async()=>{oe(!0);try{let s=[];j?s=[{id:"blank",serialNumber:"",name:"",foundationalInventory:"",decennialReview:"",totalQuantity:0,supplier:"",price:"",location:"",status:"",notes:""}]:g==="table"||g==="all"?s=o:s=[f],await Xe({items:s,paperFormat:I,printSides:L,printScope:j?"single":g,directorate:u.directorate,schoolName:u.schoolName,commune:u.commune,academicYear:u.academicYear||"2025/2026",includeOfficialHeader:M,includeQrCode:T,includeStampBox:C,includeSupervisorStamp:q,colorMode:k,isEconomical:k==="grayscale"||le,copies:H})}catch(s){console.error("Print cards error:",s)}finally{oe(!1)}},[j,g,o,f,I,L,u,M,T,C,q,k,le,H]);n.useEffect(()=>{if(!t)return;const s=d=>{(d.ctrlKey||d.metaKey)&&d.key.toLowerCase()==="p"?(d.preventDefault(),_()):d.key==="Escape"?c():d.key==="ArrowRight"&&g==="single"&&!j?U(O=>O>0?O-1:o.length-1):d.key==="ArrowLeft"&&g==="single"&&!j&&U(O=>O<o.length-1?O+1:0)};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[t,_,c,g,j,o.length]);const ie=()=>{F(!0);try{const s=o.map((A,Ne)=>({"الرقم الترتيبي":Ne+1,"رقم الجرد العام":A.serialNumber,"تعيين الشيء / التجهيز":A.name,"الجرد التأسيسي":A.foundationalInventory||"---","المراجعة العشرية":A.decennialReview||"---","الكمية الإجمالية":A.totalQuantity,"المصدر والممون":A.supplier||"---","مكان الحفظ والتواجد":A.location||"---","الحالة الوظيفية":A.status||"جيدة","تاريخ الخروج":A.exitDate||"---",ملاحظات:A.notes||"---"})),d=ce.json_to_sheet(s);d["!cols"]=[{wch:10},{wch:15},{wch:30},{wch:15},{wch:15},{wch:10},{wch:25},{wch:25},{wch:15},{wch:15},{wch:30}];const O=ce.book_new();ce.book_append_sheet(O,d,"سجل بطاقات الجرد"),Ve(O,`سجل_بطاقات_الجرد_${u.schoolName}_${new Date().toISOString().split("T")[0]}.xlsx`)}catch(s){console.error("Excel export error:",s)}finally{F(!1)}};if(!t)return null;const x=we(u.schoolName,u.commune),ue=g==="table"?{w:"297mm",h:"210mm",isLandscape:!0}:I==="A5"?{w:"148mm",h:"210mm",isLandscape:!1}:{w:"210mm",h:"297mm",isLandscape:!1};return e.jsx(ke,{children:e.jsx("div",{className:"fixed inset-0 z-[120] flex items-center justify-center p-1 sm:p-3 md:p-4 bg-black/75 backdrop-blur-sm rtl font-sans no-print select-none",dir:"rtl",children:e.jsxs(Se.div,{initial:{opacity:0,scale:.96,y:12},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.96,y:12},transition:{duration:.2},className:`relative w-full bg-surface rounded-3xl shadow-2xl border border-outline/15 flex flex-col overflow-hidden transition-all duration-300 ${Z?"max-w-[99vw] h-[98vh] max-h-[99vh] rounded-xl":"max-w-7xl h-[95vh] max-h-[980px]"}`,children:[e.jsxs("div",{className:"px-4 sm:px-5 py-3 bg-surface-container-low border-b border-outline/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0",children:e.jsx(be,{size:20})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-sm sm:text-base font-black text-primary leading-tight flex items-center gap-2",children:[e.jsx("span",{children:"معاينة وإعدادات طباعة بطاقات الجرد الرسمية"}),e.jsx("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20",children:"النموذج الوزاري المعتمد"})]}),e.jsxs("p",{className:"text-[11px] text-on-surface/60 font-medium",children:[x," • ",u.directorate," • ",o.length," تجهيز مسجل"]})]})]}),e.jsxs("div",{className:"flex items-center bg-surface p-1 rounded-2xl border border-outline/10 shadow-xs",children:[e.jsxs("button",{type:"button",onClick:()=>{y("filled"),P("single")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!j&&g==="single"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(Fe,{size:13}),"بطاقة مفردة"]}),e.jsxs("button",{type:"button",onClick:()=>{y("filled"),P("all")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!j&&g==="all"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(Ye,{size:13}),"جميع البطاقات (",o.length,")"]}),e.jsxs("button",{type:"button",onClick:()=>{y("blank"),P("single")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${j?"bg-amber-600 text-white shadow-xs":"text-on-surface/70 hover:text-amber-700"}`,children:[e.jsx(Ze,{size:13}),"استمارة فارغة (للملء اليدوي)"]}),e.jsxs("button",{type:"button",onClick:()=>{y("filled"),P("table")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!j&&g==="table"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(fe,{size:13}),"السجل كجدول"]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 sm:gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>ze(s=>!s),className:`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${G?"bg-primary/15 text-primary border-primary/30 shadow-xs":"bg-surface text-on-surface/70 border-outline/10 hover:text-primary hover:bg-surface-container"}`,title:"إظهار / إخفاء لوحة خيارات وتنسيق الطباعة",children:[e.jsx(Qe,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"خيارات الطباعة"})]}),e.jsxs("button",{type:"button",onClick:ie,disabled:ye,className:"px-3 py-2 rounded-xl text-xs font-black bg-surface text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50",title:"تصدير السجل إلى ملف Excel",children:[e.jsx(fe,{size:14}),e.jsx("span",{className:"hidden md:inline",children:"تصدير Excel"})]}),e.jsxs("button",{type:"button",onClick:_,disabled:re,className:"px-3 py-2 rounded-xl text-xs font-black bg-surface text-rose-700 dark:text-rose-400 border border-rose-300/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50",title:"حفظ أو تحميل كملف PDF (عبر نافذة الطباعة الرسمية)",children:[e.jsx(Ge,{size:14}),e.jsx("span",{className:"hidden md:inline",children:"تحميل PDF"})]}),e.jsx("button",{type:"button",onClick:()=>$e(s=>!s),className:"p-2 text-on-surface/60 hover:text-primary hover:bg-surface-container rounded-xl transition-colors cursor-pointer border border-outline/10",title:Z?"إنهاء ملء الشاشة":"ملء الشاشة",children:Z?e.jsx(dr,{size:16}):e.jsx(cr,{size:16})}),e.jsx("button",{type:"button",onClick:_,disabled:re,className:"px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-black shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:re?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsx("span",{children:"جاري الطباعة..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(be,{size:16}),e.jsx("span",{children:"طباعة الآن (Ctrl+P)"})]})}),e.jsx("button",{type:"button",onClick:c,className:"p-2 text-on-surface/60 hover:text-error hover:bg-error/10 rounded-xl transition-colors cursor-pointer border border-outline/10",title:"إغلاق النافذة (Esc)",children:e.jsx(Ke,{size:18})})]})]}),e.jsxs("div",{className:"flex-1 flex overflow-hidden relative",children:[e.jsx(ke,{initial:!1,children:G&&e.jsx(Se.div,{initial:{width:0,opacity:0},animate:{width:320,opacity:1},exit:{width:0,opacity:0},transition:{duration:.2},className:"bg-surface-container-low border-e border-outline/10 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10",children:e.jsxs("div",{className:"p-4 space-y-5 text-right",children:[g==="single"&&!j&&e.jsxs("div",{className:"p-3.5 bg-surface rounded-2xl border border-primary/15 shadow-xs space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Me,{size:14}),e.jsx("span",{children:"التجهيز المحدد للمعاينة"})]}),e.jsxs("span",{className:"text-[10px] font-mono font-bold text-on-surface/60 bg-surface-container px-2 py-0.5 rounded-full",children:[D+1," / ",o.length]})]}),e.jsxs("div",{className:"flex items-center justify-between gap-1.5",children:[e.jsxs("button",{type:"button",onClick:()=>U(s=>s>0?s-1:o.length-1),className:"p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer",title:"التجهيز السابق",children:[e.jsx(br,{size:14}),e.jsx("span",{children:"السابق"})]}),e.jsx("div",{className:"text-[11px] font-black text-primary truncate max-w-[150px] text-center",children:f.name}),e.jsxs("button",{type:"button",onClick:()=>U(s=>s<o.length-1?s+1:0),className:"p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer",title:"التجهيز التالي",children:[e.jsx("span",{children:"التالي"}),e.jsx(xr,{size:14})]})]}),e.jsx("div",{className:"relative pt-1",children:e.jsx("select",{value:D,onChange:s=>U(Number(s.target.value)),className:"w-full px-2.5 py-1.5 rounded-xl border border-outline/15 bg-surface text-xs font-bold focus:border-primary outline-none cursor-pointer",children:o.map((s,d)=>e.jsxs("option",{value:d,children:[d+1,". ",s.serialNumber," — ",s.name]},s.id||d))})})]}),g!=="table"&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:[e.jsx("span",{children:"1. مقاس الورق (Format):"}),e.jsx("span",{className:"text-[10px] text-primary font-bold",children:"A5 قياسي"})]}),e.jsx("div",{className:"grid grid-cols-3 gap-1.5",children:[{id:"A5",label:"A5 قياسي",desc:"148×210 mm"},{id:"A4",label:"A4 كامل",desc:"210×297 mm"},{id:"A4_DUAL",label:"A4 مزدوج",desc:"بطاقتان/ورقة"}].map(s=>e.jsxs("button",{type:"button",onClick:()=>X(s.id),className:`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${I===s.id?"border-primary bg-primary/10 text-primary shadow-xs":"border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70"}`,children:[e.jsx("div",{className:"text-xs font-black",children:s.label}),e.jsx("div",{className:"text-[9px] text-on-surface/50 font-mono mt-0.5",children:s.desc})]},s.id))})]}),g!=="table"&&e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:e.jsx("span",{children:"2. أوجه الطباعة (Recto / Verso):"})}),e.jsx("div",{className:"grid grid-cols-3 gap-1.5",children:[{id:"both",label:"الوجهان معاً"},{id:"front",label:"أمامي فقط"},{id:"back",label:"خلفي فقط"}].map(s=>e.jsx("button",{type:"button",onClick:()=>J(s.id),className:`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer text-xs font-black ${L===s.id?"border-primary bg-primary/10 text-primary shadow-xs":"border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70"}`,children:s.label},s.id))})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:[e.jsx("span",{children:"3. عدد النسخ للطباعة:"}),e.jsxs("span",{className:"text-xs font-mono font-bold text-primary",children:[H," نسخة"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",onClick:()=>se(s=>Math.max(1,s-1)),className:"w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer",children:"-"}),e.jsx("input",{type:"number",min:"1",max:"99",value:H,onChange:s=>se(Math.max(1,parseInt(s.target.value)||1)),className:"flex-1 py-1.5 bg-surface text-center rounded-xl border border-outline/15 font-bold font-mono text-xs outline-none focus:border-primary"}),e.jsx("button",{type:"button",onClick:()=>se(s=>s+1),className:"w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer",children:"+"})]})]}),e.jsxs("div",{className:"space-y-2 pt-2 border-t border-outline/10",children:[e.jsx("span",{className:"text-xs font-black text-on-surface/80 block",children:"4. خيارات المظهر والتوثيق الرسمي:"}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsx("span",{children:"إدراج الترويسة الرسمية للجمهورية"}),e.jsx("input",{type:"checkbox",checked:M,onChange:s=>pe(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(We,{size:14,className:"text-primary"}),e.jsx("span",{children:"رمز الاستجابة السريعة (QR Code)"})]}),e.jsx("input",{type:"checkbox",checked:T,onChange:s=>je(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsx("span",{children:"خانة تأشيرة المقتصد والمدير"}),e.jsx("input",{type:"checkbox",checked:C,onChange:s=>ne(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),C&&e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-primary/20 cursor-pointer text-xs font-bold text-primary hover:bg-primary/5 transition-colors",children:[e.jsx("span",{children:"تضمين خانة الناظر (التوقيع والختم)"}),e.jsx("input",{type:"checkbox",checked:q,onChange:s=>me(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-surface border border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/80 block",children:"نمط الألوان واستهلاك الحبر:"}),e.jsxs("div",{className:"grid grid-cols-3 gap-1",children:[e.jsx("button",{type:"button",onClick:()=>{ae("color"),ee(!1)},className:`py-1.5 px-1.5 rounded-lg text-[10.5px] font-black border transition-all cursor-pointer text-center ${k==="color"?"bg-primary text-white border-primary shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,children:"ملون رسمي"}),e.jsx("button",{type:"button",onClick:()=>{ae("grayscale"),ee(!0)},className:`py-1.5 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer text-center ${k==="grayscale"?"bg-zinc-800 text-white border-zinc-900 shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,title:"تدرج رمادي لتوفير الحبر مع نصوص سوداء واضحة",children:"تدرج رمادي"}),e.jsx("button",{type:"button",onClick:()=>{ae("bw"),ee(!0)},className:`py-1.5 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer text-center ${k==="bw"?"bg-black text-white border-black shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,title:"أبيض وأسود للنسخ والتصوير",children:"أبيض وأسود"})]})]})]}),j&&e.jsxs("div",{className:"space-y-2 pt-2 border-t border-outline/10",children:[e.jsx("span",{className:"text-xs font-black text-amber-800 dark:text-amber-300 block",children:"تنسيق الاستمارة الفارغة:"}),e.jsxs("div",{className:"grid grid-cols-2 gap-1.5",children:[e.jsx("button",{type:"button",onClick:()=>ve("dotted"),className:`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${W==="dotted"?"bg-amber-600 text-white":"bg-surface border-outline/15"}`,children:"أسطر منقطة (...)"}),e.jsx("button",{type:"button",onClick:()=>ve("solid"),className:`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${W==="solid"?"bg-amber-600 text-white":"bg-surface border-outline/15"}`,children:"أسطر متصلة (___)"})]})]}),e.jsxs("div",{className:"pt-2",children:[e.jsxs("button",{type:"button",onClick:()=>_e(s=>!s),className:"w-full text-right text-[11px] font-bold text-primary hover:underline flex items-center justify-between",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(pr,{size:13}),e.jsx("span",{children:"إرشادات طباعة الوجهين (Recto-Verso)"})]}),e.jsx("span",{children:K?"▲":"▼"})]}),K&&e.jsxs("div",{className:"mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-[10px] text-on-surface/80 leading-relaxed space-y-1",children:[e.jsxs("p",{children:["• ",e.jsx("b",{children:"مقاس A5:"})," هو المقاس الرسمي المعتمد لبطاقات جرد الوسائل التعليمية بالجزائر."]}),e.jsxs("p",{children:["• ",e.jsx("b",{children:"الطباعة على وجهين:"}),' قم بتحديد (الوجهان معاً) وضبط الطابعة على "Flip on short edge" لقلب الورقة بشكل سليم.']}),e.jsxs("p",{children:["• ",e.jsx("b",{children:"توفير الورق (A4 مزدوج):"})," يتيح طباعة بطاقتين مستقلتين في ورقة واحدة وقصها لاحقاً."]})]})]})]})})}),e.jsxs("div",{className:"flex-1 bg-zinc-200/70 dark:bg-zinc-950 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 relative",children:[e.jsxs("div",{className:"w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 z-20 bg-surface/90 backdrop-blur-md p-2 rounded-2xl border border-outline/15 shadow-sm",children:[g!=="table"&&e.jsxs("div",{className:"flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10 text-xs font-bold",children:[e.jsx("button",{type:"button",onClick:()=>xe("front"),className:`px-3 py-1 rounded-lg transition-all cursor-pointer ${N==="front"?"bg-primary text-white shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:"الوجه الأمامي (Recto)"}),e.jsx("button",{type:"button",onClick:()=>xe("back"),className:`px-3 py-1 rounded-lg transition-all cursor-pointer ${N==="back"?"bg-primary text-white shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:"الوجه الخلفي (Verso)"})]}),e.jsxs("div",{className:"text-xs font-bold text-on-surface/70 flex items-center gap-1.5",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("span",{children:g==="table"?"معاينة السجل كجدول":g==="all"?`معاينة البطاقة ${D+1} من ${o.length}`:j?"استمارة بطاقة جرد فارغة":`بطاقة رقم: ${f.serialNumber}`})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10",children:[e.jsx("button",{type:"button",onClick:()=>ge(s=>Math.max(50,s-15)),className:"p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer",title:"تصغير",children:e.jsx(mr,{size:15})}),e.jsxs("span",{className:"text-[11px] font-mono font-bold px-1.5 text-on-surface/80",children:[Ce,"%"]}),e.jsx("button",{type:"button",onClick:()=>ge(s=>Math.min(180,s+15)),className:"p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer",title:"تكبير",children:e.jsx(hr,{size:15})}),e.jsx("button",{type:"button",onClick:()=>ge(100),className:"p-1 rounded-lg hover:bg-surface text-on-surface/50 hover:text-primary transition-colors cursor-pointer",title:"إعادة ضبط 100%",children:e.jsx(ur,{size:13})})]})]}),e.jsx("div",{className:"transition-transform duration-200 origin-top my-auto shadow-2xl rounded-sm",style:{transform:`scale(${Ce/100})`,width:ue.w,minHeight:ue.h,backgroundColor:"#ffffff",color:"#000000",boxShadow:"0 20px 40px -15px rgba(0,0,0,0.3)",border:"1px solid #d4d4d8",filter:k==="grayscale"?"grayscale(100%)":"none"},children:g==="table"?e.jsxs("div",{className:"p-6 text-right font-sans text-black",dir:"rtl",children:[e.jsxs("div",{className:"border-b-2 border-black pb-3 mb-4 flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-bold text-xs",children:u.directorate}),e.jsx("div",{className:"font-bold text-xs",children:x})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-sm",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-xs",children:"وزارة التربية الوطنية"}),e.jsx("h2",{className:"text-base font-black mt-2 underline",children:"سجل بطاقات الجرد العام للوسائل والتجهيزات"})]}),e.jsxs("div",{className:"text-left font-bold text-xs",children:[e.jsxs("div",{children:["السنة الدراسية: ",u.academicYear||"2025/2026"]}),e.jsxs("div",{children:["العدد الإجمالي: ",o.length]})]})]}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[9px] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1.5 w-8",children:"#"}),e.jsx("th",{className:"border border-black p-1.5 w-24",children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1.5 text-right",children:"تعيين الشيء ومواصفاته"}),e.jsx("th",{className:"border border-black p-1.5 w-20",children:"الجرد التأسيسي"}),e.jsx("th",{className:"border border-black p-1.5 w-20",children:"المراجعة العشرية"}),e.jsx("th",{className:"border border-black p-1.5 w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1.5 w-28",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1.5 w-16",children:"الحالة"}),e.jsx("th",{className:"border border-black p-1.5 w-24",children:"ملاحظات"})]})}),e.jsx("tbody",{children:o.slice(0,15).map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-6",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:d+1}),e.jsx("td",{className:"border border-black p-1 font-mono font-bold",children:s.serialNumber}),e.jsx("td",{className:"border border-black p-1 text-right font-bold",children:s.name}),e.jsx("td",{className:"border border-black p-1",children:s.foundationalInventory||"---"}),e.jsx("td",{className:"border border-black p-1",children:s.decennialReview||"---"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:s.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:s.supplier||"---"}),e.jsx("td",{className:"border border-black p-1",children:s.status||"جيدة"}),e.jsx("td",{className:"border border-black p-1",children:s.notes||"---"})]},s.id||d))})]}),o.length>15&&e.jsxs("div",{className:"text-center text-[8px] text-gray-500 mt-2 italic",children:["(يتم طباعة كافة التجهيزات الـ ",o.length," موزعة على صفحات السجل تلقائياً)"]})]}):e.jsx("div",{className:"p-4 sm:p-5 flex flex-col justify-between h-full font-sans text-black",dir:"rtl",style:{minHeight:ue.h},children:N==="front"?e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[M&&e.jsxs("div",{className:"border-b border-black pb-2 mb-2 flex items-start justify-between",children:[e.jsxs("div",{className:"text-[7pt] leading-tight font-bold text-right",children:[e.jsx("div",{children:u.directorate}),e.jsx("div",{children:x})]}),e.jsxs("div",{className:"text-center flex-1",children:[e.jsx("div",{className:"text-[8pt] font-black tracking-tight",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"text-[7pt] font-bold",children:"وزارة التربية الوطنية"})]}),e.jsx("div",{className:"text-[7pt] font-bold text-left",children:e.jsxs("div",{children:["السنة: ",u.academicYear||"2025/2026"]})})]}),e.jsxs("div",{className:"border-2 border-black p-1.5 mb-2 flex items-center justify-between bg-gray-50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 rounded border border-black flex items-center justify-center p-0.5 bg-white",children:e.jsx("img",{src:He,alt:"Logo",className:"max-w-full max-h-full object-contain"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-[10pt] font-black leading-none m-0",children:"بطاقة جرد الوسائل التعليمية"}),e.jsx("span",{className:"text-[6.5pt] font-bold text-gray-600 block mt-0.5",children:"FICHE D'INVENTAIRE DU MATÉRIEL DIDACTIQUE"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"border border-black px-2 py-0.5 bg-white text-center",children:[e.jsx("span",{className:"text-[6.5pt] font-bold block text-gray-500",children:"رقم الجرد العام:"}),e.jsx("span",{className:"text-[9pt] font-black font-mono",children:j?"....................":f.serialNumber})]}),T&&!j&&e.jsx("div",{className:"border border-black p-0.5 bg-white",children:e.jsx(qe,{value:`INV:${f.serialNumber}|${f.name}|${u.schoolName}`,size:30,level:"M"})})]})]}),e.jsxs("div",{className:"border border-black mb-2 text-[7.5pt]",children:[e.jsxs("div",{className:"grid grid-cols-12 border-b border-black",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-black border-l border-black",children:"تعيين الشيء (Désignation):"}),e.jsx("div",{className:"col-span-9 p-1 font-black text-[8.5pt]",children:j?"....................................................................................................":f.name})]}),e.jsxs("div",{className:"grid grid-cols-12 border-b border-black",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"المصدر / الممون (Fournisseur):"}),e.jsx("div",{className:"col-span-4 p-1 font-bold border-l border-black",children:j?"....................................":f.supplier||"وزارة التربية الوطنية"}),e.jsx("div",{className:"col-span-2 bg-gray-100 p-1 font-bold border-l border-black text-center",children:"الكمية الإجمالية:"}),e.jsx("div",{className:"col-span-3 p-1 font-black text-center font-mono",children:j?"..........":f.totalQuantity})]}),e.jsxs("div",{className:"grid grid-cols-12",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"الجرد التأسيسي:"}),e.jsx("div",{className:"col-span-3 p-1 font-bold border-l border-black",children:j?"................":f.foundationalInventory||"---"}),e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"المراجعة العشرية:"}),e.jsx("div",{className:"col-span-3 p-1 font-bold",children:j?"................":f.decennialReview||"---"})]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"جدول حركات وتداول الشيء في المخابر والحصص التطبيقية:"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-16",rowSpan:2,children:"التاريخ"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الرصيد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"الأستاذ / المستلم"}),e.jsx("th",{className:"border border-black p-1 w-20",rowSpan:2,children:"التأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-10",children:"دخول"}),e.jsx("th",{className:"border border-black p-0.5 w-10",children:"خروج"})]})]}),e.jsx("tbody",{children:[...Array(I==="A4"?8:5)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},d))})]})]})]}),C&&e.jsxs("div",{className:`grid ${q?"grid-cols-3":"grid-cols-2"} gap-2 text-center text-[6.5pt] font-bold border-t border-black pt-1.5 mt-2`,children:[e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم المقتصد:"}),e.jsx("div",{className:"h-6"})]}),q&&e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"الناظر (التوقيع والختم):"}),e.jsx("div",{className:"h-6"})]}),e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم رئيس المؤسسة:"}),e.jsx("div",{className:"h-6"})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center",children:"بطاقة جرد دائمة رسمية — يمنع إتلاف أو شطب أي بيان دون محضر رسمي معتمد من المصالح الاقتصادية."})]}):e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"border border-black bg-gray-100 p-1 mb-2 text-center font-black text-[8pt]",children:"الوجه الخلفي لبطاقة الجرد — المتابعة الدورية والإسقاط"}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"font-bold text-[7.5pt] mb-1",children:"1. المعاينة الدورية والحالة الفنية للتجهيز (Vérification et État):"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",children:"تاريخ المعاينة"}),e.jsx("th",{className:"border border-black p-1 w-16",children:"الحالة الفنية"}),e.jsx("th",{className:"border border-black p-1",children:"ملاحظات مسؤول المخبر / الصيانة"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"تأشيرة المخبري"})]})}),e.jsx("tbody",{children:[...Array(I==="A4"?6:4)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black",children:d===0&&!j?f.status:""}),e.jsx("td",{className:"border border-black",children:d===0&&!j?f.notes:""}),e.jsx("td",{className:"border border-black"})]},d))})]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"font-bold text-[7.5pt] mb-1",children:"2. الإسقاط والإتلاف والتكهين (Réforme / Sortie / Décharge):"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",rowSpan:2,children:"تاريخ السند"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج / الإسقاط"}),e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"رقم محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"التأشيرة والختم"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المدير"})]})]}),e.jsx("tbody",{children:[...Array(I==="A4"?4:3)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},d))})]})]})]}),C&&e.jsxs("div",{className:"grid grid-cols-2 gap-3 mt-3",children:[e.jsxs("div",{className:"border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between",children:[e.jsx("div",{children:"تأشيرة وختم المقتصد:"}),e.jsx("div",{className:"text-gray-400 text-[6pt]",children:"(الاسم والتوقيع والختم)"})]}),e.jsxs("div",{className:"border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between",children:[e.jsx("div",{children:"تأشيرة ومصادقة رئيس المؤسسة:"}),e.jsx("div",{className:"text-gray-400 text-[6pt]",children:"(الاسم والتوقيع والختم)"})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center",children:"هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر."})]})})})]})]}),e.jsxs("div",{className:"px-5 py-3 bg-surface-container-low border-t border-outline/10 flex flex-wrap items-center justify-between gap-3 shrink-0",children:[e.jsxs("div",{className:"text-xs font-bold text-on-surface/70 flex items-center gap-2",children:[e.jsx("span",{className:"p-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",children:e.jsx(Te,{size:14})}),e.jsxs("span",{children:["النموذج جاهز للطباعة بالتنسيق المعتمد (",I," • ",L==="both"?"الوجهان معاً":L==="front"?"وجه أمامي":"وجه خلفي"," • ",g==="table"?"السجل كجدول":g==="all"?`جميع البطاقات (${o.length})`:"بطاقة مفردة",")"]})]}),e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{type:"button",onClick:c,className:"px-4 py-2 bg-surface text-on-surface/70 hover:text-on-surface hover:bg-surface-container rounded-xl text-xs font-bold transition-all border border-outline/10 cursor-pointer",children:"إغلاق"}),e.jsx("button",{type:"button",onClick:_,disabled:re,className:"px-7 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:re?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsx("span",{children:"جاري الطباعة..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(be,{size:15}),e.jsx("span",{children:"طباعة البطاقات الآن"})]})})]})]})]})})})}function qr(){var Be;const{t,i18n:c}=rr(),{schoolId:o,schoolName:p,directorate:m,commune:h,academicYear:w}=ar(),{openPrintSettingsModal:v,openPrintPreview:E}=lr(),[$,B]=n.useState([]),[Y,Q]=n.useState(!0),[z,u]=n.useState(""),[i,y]=n.useState(null),[g,P]=n.useState(!1),[I,X]=n.useState("filled"),[L,J]=n.useState(0),[N,xe]=n.useState("A5"),[D,U]=n.useState("both"),[S,te]=n.useState("all"),[Ce,ge]=n.useState("front"),[Z,$e]=n.useState(!0),[G,ze]=n.useState(!0),[K,_e]=n.useState(!0),[H,se]=n.useState(!0),[k,ae]=n.useState("color"),[le,ee]=n.useState(1),[M,pe]=n.useState(!1),[T,je]=n.useState("all"),[C,ne]=n.useState(""),[q,me]=n.useState(!1),[W,ve]=n.useState("index"),[he,Ae]=n.useState("asc"),re=tr(),{data:oe,loading:ye}=or("equipment","/api/db/equipment");n.useEffect(()=>{const r=()=>{};return window.addEventListener("afterprint",r),()=>window.removeEventListener("afterprint",r)},[]),n.useEffect(()=>{if(oe){const r=oe.map(a=>({id:a.id,serialNumber:a.serialNumber||"",name:a.smartNameAr||a.name||"",foundationalInventory:a.registrationDate||a.foundationalInventory||"",decennialReview:a.decennialReview||"",totalQuantity:a.totalQuantity||1,supplier:a.source||a.supplier||"",price:a.price||"",location:a.location||"",exitDate:a.exitDate||"",status:a.status==="functional"?"جيدة":a.status==="maintenance"?"تحتاج صيانة":a.status==="broken"?"عاطلة":a.status||"جيدة",notes:a.notes||""}));B(r),Q(ye)}},[oe,ye]);const F=async(r,a,l)=>{try{let b=l,de=a;a==="status"&&(l==="جيدة"?b="functional":l==="تحتاج صيانة"||l==="في الإصلاح"?b="maintenance":(l==="عاطلة"||l==="مفقودة")&&(b="broken")),await ir(r,{[de]:b}),B(Ie=>Ie.map(De=>De.id===r?{...De,[a]:l}:De))}catch(b){console.error("Failed to update equipment card:",b)}},f=r=>{W===r?Ae(a=>a==="asc"?"desc":"asc"):(ve(r),Ae("asc"))},_=[...$].sort((r,a)=>{if(!he||W==="index")return 0;const l=r[W],b=a[W];return typeof l=="string"&&typeof b=="string"?he==="asc"?l.localeCompare(b,"ar"):b.localeCompare(l,"ar"):typeof l=="number"&&typeof b=="number"?he==="asc"?l-b:b-l:0}).filter(r=>r.name.toLowerCase().includes(z.toLowerCase())||r.serialNumber.toLowerCase().includes(z.toLowerCase())||r.supplier&&r.supplier.toLowerCase().includes(z.toLowerCase())||r.location&&r.location.toLowerCase().includes(z.toLowerCase())||r.notes&&r.notes.toLowerCase().includes(z.toLowerCase())),ie={total:$.length,good:$.filter(r=>r.status==="جيدة"||r.status==="functional").length,maintenance:$.filter(r=>r.status==="تحتاج صيانة"||r.status==="maintenance").length,broken:$.filter(r=>r.status==="عاطلة"||r.status==="broken"||r.status==="مفقودة").length},x=Le.useMemo(()=>{let r=_;return T==="functional"?r=r.filter(a=>a.status==="جيدة"||a.status==="functional"):T==="maintenance"?r=r.filter(a=>a.status==="تحتاج صيانة"||a.status==="maintenance"||a.status==="في الإصلاح"):T==="broken"&&(r=r.filter(a=>a.status==="عاطلة"||a.status==="broken"||a.status==="مفقودة")),r},[_,T]),Oe=r=>{const a=x.findIndex(l=>l.id===r.id);J(a>=0?a:0),ne(r.id),y(r),te("single"),X("filled"),P(!0)},ue=()=>{y(null),te("all"),X("filled"),J(0),P(!0)},s=()=>{y(null),te("single"),X("blank"),J(0),P(!0)},d=()=>{E({title:"سجل بطاقات الجرد العام للوسائل والتجهيزات التعليمية",subtitle:`${m} • ${we(p,h)} • السنة الدراسية: ${w||"2025/2026"}`,type:"table",headers:["#","رقم الجرد العام","تعيين الشيء / التجهيز","الجرد التأسيسي","المراجعة العشرية","الكمية","المصدر / الممون","الموقع والمقر","الحالة الوظيفية","ملاحظات"],rows:x.map((r,a)=>[a+1,r.serialNumber,r.name,r.foundationalInventory||"—",r.decennialReview||"—",r.totalQuantity,r.supplier||"—",r.location||"مخبر الوسائل",r.status,r.notes||"—"]),suggestedOrientation:"landscape"})},O=()=>{try{const r=x.map((b,de)=>({الرقم:de+1,"رقم الجرد العام":b.serialNumber,"تعيين الشيء":b.name,"الجرد التأسيسي":b.foundationalInventory||"—","المراجعة العشرية":b.decennialReview||"—",الكمية:b.totalQuantity,"المصدر / الممون":b.supplier||"—","مكان الحفظ والموقع":b.location||"—","الحالة الوظيفية":b.status,ملاحظات:b.notes||"—"})),a=ce.json_to_sheet(r);a["!cols"]=[{wch:8},{wch:16},{wch:32},{wch:16},{wch:16},{wch:10},{wch:26},{wch:22},{wch:16},{wch:28}];const l=ce.book_new();ce.book_append_sheet(l,a,"سجل بطاقات الجرد"),Ve(l,`سجل_بطاقات_الجرد_${p||"المؤسسة"}_${new Date().toISOString().split("T")[0]}.xlsx`)}catch(r){console.error("Excel export error:",r)}},A=async(r=S,a)=>{if(te(r),a)y(a);else if(r==="single"&&C){const l=x.find(b=>b.id===C);l&&y(l)}else r==="single"&&x[L]?y(x[L]):y(null);me(!0);try{let l=[];if(I==="blank")l=[{id:"blank",serialNumber:"",name:"",foundationalInventory:"",decennialReview:"",totalQuantity:0,supplier:"",price:"",location:"",status:"",notes:""}];else if(r==="table"||r==="all")l=x;else{const b=C?x.find(Ie=>Ie.id===C):null,de=a||b||(x[L]?x[L]:i||x[0]);l=de?[de]:[]}await Xe({items:l,paperFormat:N,printSides:D,printScope:I==="blank"?"single":r,directorate:m,schoolName:p,commune:h,academicYear:w,includeOfficialHeader:H,includeQrCode:Z,includeStampBox:G,includeSupervisorStamp:K,colorMode:k,isEconomical:k==="grayscale",copies:le})}catch(l){console.warn("Iframe print error, falling back to window.print():",l),setTimeout(()=>{window.print()},100)}finally{me(!1)}},Ne=_[L]||_[0]||i,V=({field:r})=>W!==r?e.jsx(wr,{size:14,className:"opacity-30 group-hover:opacity-100 transition-opacity"}):he==="asc"?e.jsx(kr,{size:14}):e.jsx(Ue,{size:14});if(Y)return e.jsx("div",{className:"flex items-center justify-center min-h-[400px]",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary"})});const Je=S==="single"?i?[i]:Ne?[Ne]:[]:_;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"hidden print:block font-sans rtl",dir:"rtl",children:[e.jsx("style",{children:`
            @media print {
              @page {
                ${N==="A5"?"size: A5 portrait; margin: 4mm;":S==="table"?"size: A4 landscape; margin: 8mm;":"size: A4 portrait; margin: 6mm;"}
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
          `}),S==="table"?e.jsxs("div",{className:"w-full text-black",children:[e.jsx("div",{className:"border-b-2 border-black pb-3 mb-4",children:e.jsxs("div",{className:"flex justify-between items-start text-xs font-bold leading-tight",children:[e.jsxs("div",{children:[m,e.jsx("br",{}),p," (",h,")",e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-sm font-black",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"text-xs font-bold",children:"وزارة التربية الوطنية"}),e.jsx("div",{className:"text-base font-black mt-1 underline decoration-double",children:"سجل بطاقات الجرد العام للوسائل التعليمية"})]}),e.jsxs("div",{className:"text-left text-xs font-bold",children:["السنة الدراسية: ",w||"2025/2026",e.jsx("br",{}),"تاريخ الطباعة: ",new Date().toLocaleDateString("ar-DZ"),e.jsx("br",{}),"عدد التجهيزات: ",_.length]})]})}),e.jsxs("table",{className:"w-full border-collapse border-2 border-black text-[9pt]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b-2 border-black",children:[e.jsx("th",{className:"border border-black p-1 text-center w-8",children:"رقم"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1 text-right",children:"تعيين الجهاز / المادة"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"الجرد التأسيسي"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"المراجعة العشرية"}),e.jsx("th",{className:"border border-black p-1 text-center w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 text-center w-28",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 text-center w-20",children:"الحالة"}),e.jsx("th",{className:"border border-black p-1 text-right w-40",children:"ملاحظات"})]})}),e.jsx("tbody",{children:_.map((r,a)=>e.jsxs("tr",{className:"border-b border-black",children:[e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:a+1}),e.jsx("td",{className:"border border-black p-1 text-center font-black",children:r.serialNumber}),e.jsx("td",{className:"border border-black p-1 text-right font-bold",children:r.name}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.foundationalInventory||"—"}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.decennialReview||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:r.totalQuantity}),e.jsx("td",{className:"border border-black p-1 text-center",children:r.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-semibold",children:r.status}),e.jsx("td",{className:"border border-black p-1 text-right text-[8pt]",children:r.notes||"—"})]},r.id))})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-6 text-center text-xs font-bold mt-8 pt-4 border-t-2 border-black",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"المقتصد / مسير المصالح الاقتصادية"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"مسؤول المخبر الرئيسي"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"رئيس المؤسسة (المدير)"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]})]})]}):e.jsx("div",{children:Je.map(r=>e.jsxs(Le.Fragment,{children:[(D==="both"||D==="front")&&e.jsxs("div",{className:N==="A5"?"pcard-a5":"pcard-a4",children:[H&&e.jsx("div",{className:"border-b-2 border-black pb-1 mb-1",children:e.jsxs("div",{className:"flex justify-between items-start text-[7pt] md:text-[8pt] font-bold leading-tight",children:[e.jsxs("div",{className:"text-right",children:["مديرية التربية لولاية: ",m,e.jsx("br",{}),we(p,h),e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-[8pt]",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-[7.5pt]",children:"وزارة التربية الوطنية"}),e.jsxs("div",{className:"font-bold text-[7pt] text-gray-700",children:["السنة الدراسية: ",w||"2025/2026"]})]}),e.jsxs("div",{className:"text-left text-[7pt]",children:["بطاقة الجرد رقم:",e.jsx("br",{}),e.jsx("span",{className:"font-black text-[9pt] underline",children:r.serialNumber})]})]})}),e.jsx("div",{className:"text-center my-1",children:e.jsx("div",{className:"inline-block border-2 border-black bg-gray-100 px-6 py-0.5 rounded-sm",children:e.jsx("h1",{className:"text-[11pt] font-black tracking-wide underline decoration-double",children:"بــطــاقـــة الجـــرد"})})}),e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold border border-black bg-gray-50 px-2 py-1 mb-1.5",children:[e.jsxs("div",{children:[e.jsx("span",{children:"الجرد التأسيسي لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:r.foundationalInventory||"2015-10-15"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"المراجعة العشرية لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:r.decennialReview||"2025-10-15"})]})]}),e.jsxs("div",{className:"grid grid-cols-4 border-2 border-black text-center text-[7.5pt] mb-2 divide-x divide-x-reverse divide-black",children:[e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفهرس (الصنف)"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:r.name.includes("مجهر")?"أجهزة بصرية":r.name.includes("أنبوب")||r.name.includes("بيشر")?"زجاجيات مخبرية":r.name.includes("مولد")||r.name.includes("ميزان")?"أجهزة قياس وكهرباء":"أجهزة وعتاد تعليمي"})]}),e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفرع / الجناح"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:"مخبر العلوم والوسائل"})]}),e.jsxs("div",{className:"p-1 bg-yellow-50/20",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"رقم الجرد العام"}),e.jsx("div",{className:"font-black text-[10pt] text-black h-7 flex items-center justify-center tracking-wider",children:r.serialNumber})]}),e.jsxs("div",{className:"p-1 relative",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-0.5",children:"ختم المؤسسة والتأشيرة"}),e.jsx("div",{className:"h-7 flex items-center justify-center",children:Z?e.jsx(qe,{value:`DZ-EDU-INV:${r.serialNumber}:${r.name}`,size:26}):e.jsx("span",{className:"text-[6pt] text-gray-400",children:"مربع الختم"})})]})]}),e.jsxs("div",{className:"border border-black p-2 mb-2 text-[8pt] space-y-1.5 bg-white",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-black whitespace-nowrap",children:"الـتـعـيـيـن (تعيين الشيء) :"}),e.jsx("span",{className:"font-black text-[9pt] border-b border-dotted border-black flex-1 pb-0.5",children:r.name})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الـخـصـائـص والمـواصـفـات :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.notes||"جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة."})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 pt-1",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الموقع / الحفظ :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.location||"مخبر الوسائل التعليمية - الخزانة الرئيسية"})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الممون / المصدر :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:r.supplier||"المؤسسة الوطنية للوسائل التعليمية"})]})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"text-[7.5pt] font-black mb-1 flex justify-between items-center",children:[e.jsx("span",{children:"جدول حركات الدخول والتكفل بالعتاد:"}),e.jsx("span",{className:"text-[6.5pt] font-normal text-gray-600",children:"(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)"})]}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",children:"تاريخ الدخول"}),e.jsx("th",{className:"border border-black p-1 w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"سعر الوحدة"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"المبلغ الإجمالي"}),e.jsx("th",{className:"border border-black p-1",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"التعيين الجديد (الموقع)"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"ملاحظات"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{className:"border-b border-black font-semibold",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:r.foundationalInventory||"2023-09-15"}),e.jsx("td",{className:"border border-black p-1 font-black text-[8.5pt]",children:r.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:r.price?`${r.price} دج`:"—"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:r.price&&!isNaN(Number(r.price))?`${(Number(r.price)*r.totalQuantity).toLocaleString("ar-DZ")} دج`:"—"}),e.jsx("td",{className:"border border-black p-1",children:r.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:"مخبر الوسائل التعليمية"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:r.status})]}),[...Array(N==="A4"?5:2)].map((a,l)=>e.jsxs("tr",{className:"border-b border-black h-6",children:[e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"})]},l))]})]})]}),G&&e.jsxs("div",{className:`grid ${K?"grid-cols-3":"grid-cols-2"} gap-4 text-center text-[7pt] font-bold border-t border-black pt-1.5 mt-2`,children:[e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:"}),e.jsx("div",{className:"h-9"})]}),K&&e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"الناظر (التوقيع والختم):"}),e.jsx("div",{className:"h-9"})]}),e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم رئيس المؤسسة (المدير):"}),e.jsx("div",{className:"h-9"})]})]})]})]}),(D==="both"||D==="back")&&e.jsxs("div",{className:N==="A5"?"pcard-a5":"pcard-a4",children:[e.jsx("div",{className:"border-b-2 border-black pb-1 mb-2",children:e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold",children:[e.jsx("div",{children:"التكفل المستمر وحركات التعيين والإتلاف"}),e.jsxs("div",{className:"text-center font-black text-[9pt] underline",children:["بطاقة جرد رقم: ",r.serialNumber," — ",r.name]}),e.jsx("div",{children:"الجمهورية الجزائرية الديمقراطية الشعبية"})]})}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",children:"التاريخ"}),e.jsx("th",{className:"border border-black p-1",children:"اسم ولقب الموظف المسؤول"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"الصفة / الوظيفة"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"إمضاء المعني"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"تأشيرة المقتصد"})]})}),e.jsx("tbody",{children:[...Array(N==="A4"?6:4)].map((a,l)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},l))})]})]}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم الجرد الجديد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"التعيين الجديد (المخبر / القاعة)"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"العون المسؤول"})]})]}),e.jsx("tbody",{children:[...Array(N==="A4"?4:2)].map((a,l)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},l))})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"3. الإسـقـاط والإتـلاف والخـروج (Réforme / Sortie / Décharge)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار / السند"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج أو الإتلاف (كسر / تقادم)"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"رئيس المؤسسة"})]})]}),e.jsx("tbody",{children:[...Array(N==="A4"?3:2)].map((a,l)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},l))})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-700 italic border-t border-black pt-1 mt-2 text-center",children:"هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر."})]})]})]},r.id))})]}),e.jsxs("div",{className:"max-w-7xl mx-auto p-4 md:p-8 bg-surface shadow-2xl rounded-[40px] my-8 font-sans transition-all duration-500 no-print",dir:c.language==="ar"?"rtl":"ltr",children:[e.jsxs("div",{className:"border-b-4 border-double border-primary/20 pb-8 mb-10",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start gap-8 text-sm font-bold text-on-surface/80",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),t("inventory_cards.directorate_label","مديرية التربية لولاية:")," ",m]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),we(p,h)]})]}),e.jsxs("div",{className:"text-center space-y-2 flex-1",children:[e.jsx("div",{className:"flex justify-center mb-4",children:e.jsx("img",{src:He,alt:"Ministry Logo",className:"h-20 w-auto object-contain"})}),e.jsx("p",{className:"text-xl font-black text-primary tracking-tight",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("p",{className:"text-lg font-bold",children:"وزارة التربية الوطنية"})]}),e.jsx("div",{className:"space-y-2 text-start md:text-end",children:e.jsxs("p",{className:"bg-primary/5 px-4 py-1.5 rounded-full inline-block",children:[t("inventory_cards.academic_year","السنة الدراسية:")," ",e.jsx("span",{className:"font-black",children:w||"2025/2026"})]})})]}),e.jsxs("div",{className:"mt-12 text-center relative",children:[e.jsx("div",{className:"absolute inset-0 flex items-center","aria-hidden":"true",children:e.jsx("div",{className:"w-full border-t border-primary/10"})}),e.jsx("h2",{className:"relative inline-block bg-surface px-8 text-3xl font-black text-primary tracking-tighter decoration-primary decoration-4 underline-offset-8",children:t("inventory_cards.registry_title","سجل بطاقات الجرد - مخبر الوسائل التعليمية")})]})]}),e.jsxs("div",{className:"flex flex-wrap justify-between items-center gap-4 mb-6 no-print",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsxs("button",{onClick:()=>re(nr.EQUIPMENT),className:"group flex items-center gap-2 px-5 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer",children:[e.jsx(fr,{size:18,className:"group-hover:rotate-90 transition-transform duration-300"}),t("inventory_cards.btn_add_equipment","إضافة تجهيز")]}),e.jsxs("button",{onClick:()=>pe(r=>!r),className:R("group flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-black shadow-lg transition-all text-sm cursor-pointer border-2",M?"bg-amber-600 text-white border-amber-500 shadow-amber-600/30 scale-[1.02]":"bg-surface-container-high hover:bg-surface-container-highest text-primary border-primary/20 hover:border-primary/40 shadow-sm"),title:"فتح وإغلاق لوحة خيارات وإعدادات الطباعة الرسمية",children:[e.jsx(Qe,{size:18,className:R("transition-transform duration-300",M&&"rotate-90")}),e.jsx("span",{children:"خيارات الطباعة"}),e.jsxs("span",{className:R("text-[10px] px-2 py-0.5 rounded-full font-bold",M?"bg-white/25 text-white":"bg-primary/10 text-primary"),children:[N," • ",k==="color"?"ملون":k==="grayscale"?"رمادي":"أبيض/أسود"]}),e.jsx(Ue,{size:14,className:R("transition-transform duration-300",M&&"rotate-180")})]}),e.jsxs("button",{onClick:ue,className:"flex items-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer",title:"معاينة نموذج البطاقة وتنسيقها في نافذة مخصصة",children:[e.jsx(Ee,{size:18}),e.jsx("span",{children:"معاينة نموذج الطباعة"})]}),e.jsxs("button",{onClick:()=>A(S),disabled:q,className:"flex items-center gap-2 px-5 py-3.5 bg-secondary hover:bg-secondary-dim text-white rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-50",title:"طباعة بطاقات الجرد مباشرة بالإعدادات المحددة",children:[q?e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}):e.jsx(be,{size:18}),e.jsx("span",{children:t("inventory_cards.btn_print_cards","طباعة بطاقات الجرد")})]}),e.jsxs("button",{onClick:s,className:"flex items-center gap-2 px-4 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-2xl font-black shadow-sm transition-all text-xs cursor-pointer",title:"طباعة استمارة بطاقة جرد فارغة للملء اليدوي",children:[e.jsx(Ze,{size:16}),e.jsx("span",{children:"استمارة فارغة"})]}),e.jsxs("button",{onClick:d,className:"flex items-center gap-2 px-4 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-black shadow transition-all text-xs cursor-pointer",title:"معاينة وطباعة السجل الإجمالي كجدول رسمي A4 أفقي",children:[e.jsx(fe,{size:16}),e.jsx("span",{children:"السجل كجدول"})]})]}),e.jsxs("div",{className:"relative flex-1 max-w-sm group",children:[e.jsx(gr,{className:R("absolute top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors",c.language==="ar"?"right-5":"left-5"),size:18}),e.jsx("input",{type:"text",placeholder:t("inventory_cards.search_placeholder","بحث في السجل بالرقم أو التعيين أو الممون..."),className:R("w-full py-3.5 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl font-bold text-xs md:text-sm shadow-inner transition-all outline-none",c.language==="ar"?"pr-12 pl-4":"pl-12 pr-4"),value:z,onChange:r=>u(r.target.value)})]})]}),e.jsx(ke,{children:M&&e.jsx(Se.div,{initial:{opacity:0,height:0,y:-10},animate:{opacity:1,height:"auto",y:0},exit:{opacity:0,height:0,y:-10},transition:{duration:.25},className:"overflow-hidden mb-8 no-print",children:e.jsxs("div",{className:"bg-gradient-to-br from-surface-container-low to-surface-container p-5 md:p-6 rounded-3xl border-2 border-amber-500/30 shadow-xl space-y-6",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline/10",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/25",children:e.jsx(Qe,{size:20})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-black text-primary flex items-center gap-2",children:[e.jsx("span",{children:"لوحة خيارات وإعدادات طباعة بطاقات وسجل الجرد"}),e.jsx("span",{className:"text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",children:"النموذج الجزائري الرسمي المعتمد"})]}),e.jsx("p",{className:"text-xs text-on-surface/60 font-medium mt-0.5",children:"تخصيص كامل للمقاس، الأوجه، الترويسة، الأختام، نمط الألوان والتوفير الاقتصادي للحبر"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:v,className:"px-3.5 py-2 rounded-xl text-xs font-black bg-surface hover:bg-surface-container text-primary border border-primary/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer",title:"فتح إعدادات الطباعة العامة للمؤسسة والشعار",children:[e.jsx(jr,{size:14}),e.jsx("span",{children:"إعدادات المؤسسة والشعار"})]}),e.jsx("button",{type:"button",onClick:()=>pe(!1),className:"p-2 rounded-xl text-on-surface/50 hover:text-on-surface hover:bg-surface transition-colors cursor-pointer",title:"إخفاء لوحة خيارات الطباعة",children:e.jsx(Ke,{size:18})})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Ye,{size:14}),e.jsx("span",{children:"1. نطاق البطاقات المراد طباعتها:"})]}),e.jsxs("span",{className:"text-[10px] font-mono font-bold text-on-surface/60",children:[x.length," تجهيز"]})]}),e.jsx("div",{className:"space-y-1.5",children:[{id:"all",label:`جميع البطاقات (${$.length})`,icon:Pe},{id:"table",label:"سجل الجرد العام كجدول رسمي A4",icon:fe},{id:"single",label:"بطاقة تجهيز مفردة",icon:Fe}].map(r=>e.jsxs("button",{type:"button",onClick:()=>{te(r.id),r.id==="table"&&xe("A4"),r.id==="single"&&!C&&x[0]&&ne(x[0].id)},className:R("w-full p-2.5 rounded-xl text-right text-xs font-black border transition-all flex items-center justify-between cursor-pointer",S===r.id?"bg-primary text-white border-primary shadow-xs":"bg-surface-container-low hover:bg-surface-container text-on-surface/80 border-transparent"),children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(r.icon,{size:14}),e.jsx("span",{children:r.label})]}),S===r.id&&e.jsx(Te,{size:14})]},r.id))}),S==="single"&&e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-on-surface/70 block",children:"اختر التجهيز للطباعة:"}),e.jsx("select",{value:C||((Be=x[0])==null?void 0:Be.id)||"",onChange:r=>{ne(r.target.value);const a=x.find(l=>l.id===r.target.value);a&&y(a)},className:"w-full p-2 bg-surface-container-low rounded-xl border border-outline/15 text-xs font-bold outline-none focus:border-primary cursor-pointer",children:x.map((r,a)=>e.jsxs("option",{value:r.id,children:[r.serialNumber," — ",r.name]},r.id||a))})]}),e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70 block",children:"تصفية التجهيزات حسب الحالة:"}),e.jsx("div",{className:"grid grid-cols-2 gap-1 text-[10px]",children:[{id:"all",label:"الكل"},{id:"functional",label:"جيدة فقط"},{id:"maintenance",label:"صيانة"},{id:"broken",label:"عاطلة / مفقودة"}].map(r=>e.jsx("button",{type:"button",onClick:()=>je(r.id),className:R("py-1.5 px-2 rounded-lg font-bold border transition-all text-center cursor-pointer",T===r.id?"bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/60"),children:r.label},r.id))})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Fe,{size:14}),e.jsx("span",{children:"2. مقاس الورق والتخطيط:"})]}),e.jsx("div",{className:"space-y-2",children:[{id:"A5",label:"A5 قياسي (148×210 mm)",desc:"النموذج الوزاري المعتمد لكل بطاقة"},{id:"A4",label:"A4 كامل (210×297 mm)",desc:"صفحة كاملة لكل بطاقة بخط كبير"},{id:"A4_DUAL",label:"A4 مزدوج (بطاقتان في الورقة)",desc:"يوفر 50% من الورق مع خط قص منقط"}].map(r=>e.jsxs("button",{type:"button",onClick:()=>xe(r.id),className:R("w-full p-2.5 rounded-xl text-right border transition-all cursor-pointer",N===r.id?"bg-primary/10 border-primary text-primary shadow-xs":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/80"),children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-black",children:r.label}),N===r.id&&e.jsx(Te,{size:14})]}),e.jsx("p",{className:"text-[10px] text-on-surface/50 font-medium mt-0.5",children:r.desc})]},r.id))}),S!=="table"&&e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70 block",children:"أوجه الطباعة:"}),e.jsx("div",{className:"grid grid-cols-3 gap-1",children:[{id:"both",label:"الوجهان"},{id:"front",label:"أمامي"},{id:"back",label:"خلفي"}].map(r=>e.jsx("button",{type:"button",onClick:()=>U(r.id),className:R("py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",D===r.id?"bg-primary text-white border-primary":"bg-surface-container-low border-transparent text-on-surface/70 hover:bg-surface-container"),children:r.label},r.id))})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(vr,{size:14}),e.jsx("span",{children:"3. نمط الألوان واستهلاك الحبر:"})]}),e.jsx("div",{className:"space-y-2",children:[{id:"color",label:"ملون رسمي",desc:"ألوان متناسقة للوثائق الرسمية المميزة",badge:"عالي الجودة"},{id:"grayscale",label:"تدرج رمادي لتوفير الحبر",desc:"خلفيات رمادية ونصوص سوداء حادة لتوفير مسحوق الحبر",badge:"اقتصادي (Eco)"},{id:"bw",label:"أبيض وأسود للنسخ",desc:"أبيض وأسود عالي التباين مناسب لآلات النسخ والفاكس",badge:"نسخ سريع"}].map(r=>e.jsxs("button",{type:"button",onClick:()=>ae(r.id),className:R("w-full p-2.5 rounded-xl text-right border transition-all cursor-pointer",k===r.id?"bg-amber-500/15 border-amber-600 text-amber-900 dark:text-amber-200 shadow-xs":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/80"),children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-black",children:r.label}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-surface border border-outline/10 font-bold",children:r.badge})]}),e.jsx("p",{className:"text-[10px] text-on-surface/50 font-medium mt-0.5",children:r.desc})]},r.id))}),e.jsxs("div",{className:"pt-2 border-t border-outline/10 flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70",children:"عدد النسخ:"}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("button",{type:"button",onClick:()=>ee(r=>Math.max(1,r-1)),className:"w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline/15 font-black text-xs cursor-pointer flex items-center justify-center",children:"-"}),e.jsx("span",{className:"w-8 text-center font-mono font-black text-xs",children:le}),e.jsx("button",{type:"button",onClick:()=>ee(r=>r+1),className:"w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline/15 font-black text-xs cursor-pointer flex items-center justify-center",children:"+"})]})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(yr,{size:14}),e.jsx("span",{children:"4. عناصر التوثيق والأختام الرسمية:"})]}),e.jsxs("div",{className:"space-y-2 text-xs font-bold text-on-surface/80",children:[e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsx("span",{children:"الترويسة الرسمية للجمهورية"}),e.jsx("input",{type:"checkbox",checked:H,onChange:r=>se(r.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(We,{size:13,className:"text-primary"}),e.jsx("span",{children:"رمز الاستجابة السريعة (QR)"})]}),e.jsx("input",{type:"checkbox",checked:Z,onChange:r=>$e(r.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsx("span",{children:"خانات التأشيرات والأختام الرسمية"}),e.jsx("input",{type:"checkbox",checked:G,onChange:r=>ze(r.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),G&&e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary transition-colors cursor-pointer",children:[e.jsx("span",{children:"خانة الناظر (التوقيع والختم)"}),e.jsx("input",{type:"checkbox",checked:K,onChange:r=>_e(r.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-outline/10 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("button",{type:"button",onClick:()=>{J(0),P(!0)},className:"px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer",children:[e.jsx(Ee,{size:15}),e.jsx("span",{children:"معاينة وتنسيق نموذج الطباعة"})]}),e.jsxs("button",{type:"button",onClick:()=>A(S),disabled:q,className:"px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:[q?e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}):e.jsx(be,{size:15}),e.jsx("span",{children:"طباعة فورية بالإعدادات الحالية"})]}),e.jsxs("button",{type:"button",onClick:d,className:"px-4 py-2.5 rounded-xl bg-surface text-on-surface border border-outline/20 font-black text-xs hover:bg-surface-container hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",title:"معاينة وطباعة السجل كجدول رسمي A4 أفقي",children:[e.jsx(fe,{size:15}),e.jsx("span",{children:"معاينة السجل الموحدة"})]}),e.jsxs("button",{type:"button",onClick:O,className:"px-4 py-2.5 rounded-xl bg-surface text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 font-black text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",title:"تصدير بيانات السجل إلى ملف Excel",children:[e.jsx(Ge,{size:15}),e.jsx("span",{children:"تصدير Excel"})]})]}),e.jsxs("div",{className:"text-xs font-bold text-on-surface/50",children:["جاهز للطباعة: ",x.length," تجهيز • مقاس ",N," • ",k==="color"?"ملون":k==="grayscale"?"تدرج رمادي":"أبيض/أسود"]})]})]})})}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 no-print",children:[{label:t("inventory_cards.stat_total","إجمالي بطاقات الجرد"),value:ie.total,color:"border-primary",icon:Pe},{label:t("inventory_cards.stat_good","في حالة جيدة"),value:ie.good,color:"border-success",icon:Me},{label:t("inventory_cards.stat_maintenance","تحتاج صيانة"),value:ie.maintenance,color:"border-warning",icon:Me},{label:t("inventory_cards.stat_broken","عاطلة / مفقودة"),value:ie.broken,color:"border-error",icon:Nr}].map((r,a)=>e.jsxs("div",{className:R("p-5 bg-surface-container-low rounded-3xl border-t-4 shadow-sm hover:shadow transition-all",r.color),children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx(r.icon,{size:20,className:"text-on-surface/40"}),e.jsx("div",{className:"text-2xl font-black text-on-surface",children:r.value})]}),e.jsx("div",{className:"text-xs font-black text-on-surface/60",children:r.label})]},a))}),e.jsx("div",{className:"overflow-x-auto rounded-3xl border border-primary/10 shadow-sm",children:e.jsxs("table",{className:"w-full border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-primary text-white",children:[e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[50px] cursor-pointer group",onClick:()=>f("index"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_index","رقم"),e.jsx(V,{field:"index"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-[130px]",onClick:()=>f("serialNumber"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_serial","رقم الجرد"),e.jsx(V,{field:"serialNumber"})]})}),e.jsx("th",{className:"p-4 font-black text-xs uppercase tracking-widest border-l border-white/10 w-[24%] text-center cursor-pointer group",onClick:()=>f("name"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_name","تعيين الشيء"),e.jsx(V,{field:"name"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>f("foundationalInventory"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_foundational","الجرد التأسيسي"),e.jsx(V,{field:"foundationalInventory"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>f("decennialReview"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_decennial","المراجعة العشرية"),e.jsx(V,{field:"decennialReview"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-20",onClick:()=>f("totalQuantity"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_quantity","الكمية"),e.jsx(V,{field:"totalQuantity"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group",onClick:()=>f("supplier"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_supplier","الممون"),e.jsx(V,{field:"supplier"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-24",onClick:()=>f("status"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_status","الحالة"),e.jsx(V,{field:"status"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[14%] cursor-pointer group",onClick:()=>f("notes"),children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[t("inventory_cards.col_notes","ملاحظات"),e.jsx(V,{field:"notes"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest no-print w-[120px]",children:t("common.actions","إجراءات الطباعة")})]})}),e.jsx("tbody",{children:e.jsx(ke,{mode:"popLayout",children:_.map((r,a)=>e.jsxs(Se.tr,{initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.98},transition:{duration:.15,delay:a*.015},className:"border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group",children:[e.jsx("td",{className:"p-3 text-center font-bold text-xs text-on-surface/40 border-l border-primary/5",children:a+1}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all underline decoration-dotted decoration-primary/20",value:r.serialNumber,onChange:l=>F(r.id,"serialNumber",l.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all decoration-primary/20",value:r.name,onChange:l=>F(r.id,"name",l.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"الجرد التأسيسي",value:r.foundationalInventory,onChange:l=>F(r.id,"foundationalInventory",l.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"المراجعة العشرية",value:r.decennialReview,onChange:l=>F(r.id,"decennialReview",l.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"number",className:"w-14 bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1 font-bold text-xs text-center transition-all",value:r.totalQuantity,onChange:l=>F(r.id,"totalQuantity",parseInt(l.target.value)||0)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all",value:r.supplier,onChange:l=>F(r.id,"supplier",l.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsxs("select",{className:"bg-transparent border-none focus:outline-none font-bold text-xs p-1 rounded-lg cursor-pointer",value:r.status,onChange:l=>F(r.id,"status",l.target.value),children:[e.jsx("option",{value:"جيدة",children:t("equipment.status_functional","جيدة")}),e.jsx("option",{value:"تحتاج صيانة",children:t("equipment.status_maintenance","تحتاج صيانة")}),e.jsx("option",{value:"عاطلة",children:t("equipment.status_broken","عاطلة")}),e.jsx("option",{value:"في الإصلاح",children:t("equipment.status_repair","في الإصلاح")}),e.jsx("option",{value:"مفقودة",children:t("equipment.status_missing","مفقودة")})]})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all",value:r.notes,onChange:l=>F(r.id,"notes",l.target.value)})}),e.jsx("td",{className:"p-3 text-center no-print",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>Oe(r),title:"معاينة وتنسيق نموذج هذه البطاقة",className:"p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400 cursor-pointer",children:e.jsx(Ee,{size:15})}),e.jsx("button",{onClick:()=>A("single",r),title:t("inventory_cards.print_individual","طباعة فورية لبطاقة هذا التجهيز"),className:"p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40 cursor-pointer",children:e.jsx(be,{size:15})})]})})]},r.id))})})]})}),e.jsxs("div",{className:"mt-8 flex flex-wrap justify-between items-center text-xs font-black text-on-surface/40 no-print gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Pe,{size:16}),t("inventory_cards.item_count","عدد التجهيزات في السجل: {{count}} من أصل {{total}}",{count:x.length,total:$.length})]}),e.jsx("div",{className:"italic text-[11pt] text-gray-500",children:t("inventory_cards.official_notice","هذا السجل ونماذج بطاقات الجرد تعتبر وثائق رسمية لجرد الوسائل التعليمية المعتمدة")})]})]}),e.jsx(Ir,{isOpen:g,onClose:()=>P(!1),items:x,initialItem:C&&x.find(r=>r.id===C)||i,initialScope:S,initialMode:I,initialPaperFormat:N,initialPrintSides:D,initialColorMode:k,initialIncludeHeader:H,initialIncludeQr:Z,initialIncludeStamp:G,initialIncludeSupervisorStamp:K,initialCopies:le,schoolInfo:{directorate:m||"مديرية التربية لولاية أم البواقي",schoolName:p||"متوسطة قطاف الطاهر",commune:h||"عين كرشة",academicYear:w||"2025/2026"}})]})}export{qr as default};
