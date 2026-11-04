import{w as lt,k as ye,r as n,j as e,h as nt,u as it}from"./vendor-react-CYyeVs3H.js";import{l as ot,k as $e,A as ze,m as _e,w as Ke,u as dt,j as ct,R as bt,d as w}from"./index-CJhQniYM.js";import{Q as qe}from"./index-CzEssw5d.js";import{u as pe,w as We}from"./vendor-pdf-xlsx-C91FhsmE.js";import{u as xt}from"./useSqlCollection-BLQQASf-.js";import{updateEquipment as pt}from"./equipment-CNdu49XI.js";import{_ as me,n as Le,aw as Xe,br as Je,a4 as Ne,aS as Fe,aq as et,az as mt,aA as ht,X as tt,P as Me,h as ut,o as ft,aj as rt,ay as gt,al as jt,am as vt,ar as yt,j as Te,aI as Nt,ag as He,e as Ee,aT as wt,g as kt,ad as St,D as Re,bs as Ct,bu as $t,V as zt,bv as _t,aM as At}from"./vendor-icons-4CHgYVg8.js";import{g as Ve,a as Ye,b as Ze,n as Ge}from"./useEquipmentLogic-BKVfFwBo.js";import"./vendor-firebase-35I7n-h0.js";import"./vendor-charts-DGM1EJS4.js";import"./index-C41q8Jzc.js";import"./geminiService-Cc1pKcVi.js";import"./loggingService-Mucsn22i.js";function It(r){return r.includes("مجهر")?"أجهزة بصرية":r.includes("أنبوب")||r.includes("بيشر")||r.includes("حوجلة")||r.includes("مخبار")?"زجاجيات مخبرية":r.includes("مولد")||r.includes("ميزان")||r.includes("فولطمتر")||r.includes("أمبيرمتر")?"أجهزة قياس وكهرباء":r.includes("مجسم")||r.includes("هيكل")||r.includes("لوحة")?"وسائل إيضاح ومجسمات":"عتاد وأجهزة علمية تعليمية"}function Dt(r,c=26){try{return lt.renderToStaticMarkup(ye.createElement(qe,{value:r,size:c,level:"M",includeMargin:!1}))}catch{return'<div style="font-size: 6pt; font-weight: bold; border: 1px solid #000; padding: 2px;">QR</div>'}}function Pt(r){const{items:c,paperFormat:i,printSides:h,printScope:u,directorate:f,schoolName:$,commune:k,includeOfficialHeader:L=!0,includeQrCode:_=!0,includeStampBox:Y=!0,includeSupervisorStamp:X=!0,colorMode:O="color",isEconomical:A=!1}=r,g=u==="table",o=i==="A5"&&!g;return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>بطاقات الجرد الرسمية — ${$}</title>
  <style>
    @page {
      size: ${o?"A5":"A4"} ${g?"landscape":"portrait"};
      margin: ${o?"4mm":g?"8mm":"6mm"};
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
      font-size: ${o?"7pt":"8pt"};
      line-height: 1.25;
      overflow: visible !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
      ${O==="grayscale"||A?"filter: grayscale(100%);":""}
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
      border: ${o?"1.5px":"2px"} solid #000000;
      padding: ${o?"3.5mm 4.5mm":"5.5mm 6.5mm"};
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: ${o?"198mm":"278mm"};
      max-height: ${o?"201mm":"281mm"};
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
      font-size: ${o?"6.5pt":"7.5pt"};
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
      font-size: ${o?"7.5pt":"8.5pt"};
      font-weight: 900;
    }

    .min-title {
      font-size: ${o?"7pt":"8pt"};
      font-weight: 700;
    }

    .year-title {
      font-size: ${o?"6.5pt":"7pt"};
      color: #333333;
    }

    .sn-box {
      font-size: ${o?"9pt":"10pt"};
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
      padding: ${o?"1px 16px":"2px 24px"};
      border-radius: 2px;
    }

    .title-pill h1 {
      margin: 0;
      font-size: ${o?"10pt":"11.5pt"};
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
      font-size: ${o?"6.5pt":"7.5pt"};
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
      font-size: ${o?"6.5pt":"7.5pt"};
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
      height: ${o?"20px":"26px"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }

    .sn-large {
      font-size: ${o?"9pt":"10.5pt"};
      letter-spacing: 1px;
      font-family: monospace;
    }

    /* Identification Details Box */
    .details-box {
      border: 1.5px solid #000000;
      padding: ${o?"4px 6px":"6px 8px"};
      margin-bottom: 5px;
      background: #ffffff;
      font-size: ${o?"7pt":"8pt"};
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
      font-size: ${o?"6.8pt":"7.8pt"};
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
      font-size: ${o?"6.5pt":"7.5pt"};
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
      height: ${o?"16px":"20px"};
    }

    /* Stamps & Signatures Grid */
    .stamps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${o?"8px":"14px"};
      border-top: 1.5px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
      text-align: center;
      font-size: ${o?"6.5pt":"7.5pt"};
      font-weight: bold;
    }

    .stamp-box {
      border: 1px solid #9ca3af;
      background: #f9fafb;
      padding: 3px;
      border-radius: 2px;
    }

    .stamp-space {
      height: ${o?"26px":"36px"};
    }

    /* Back Side Elements */
    .back-hdr-banner {
      border-bottom: 2px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${o?"6.8pt":"7.8pt"};
      font-weight: bold;
    }

    .back-title {
      font-weight: 900;
      font-size: ${o?"8.5pt":"9.5pt"};
      text-decoration: underline;
    }

    .back-sec-title {
      background: #f3f4f6;
      border: 1px solid #000000;
      padding: 2px 6px;
      font-weight: 900;
      font-size: ${o?"6.8pt":"7.8pt"};
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
<body class="${o?"format-a5":i==="A4_DUAL"&&!g?"format-dual":"format-a4"}">
  ${g?Et(c,r):Rt(c,r)}
</body>
</html>`}function Et(r,c){const{directorate:i,schoolName:h,commune:u}=c,f=c.academicYear||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025 / 2026",$=new Date().toLocaleDateString("ar-DZ");return`
    <div class="registry-sheet">
      <div class="official-header">
        <div class="header-columns">
          <div class="header-right">
            ${i}<br>
            ${h} (${u})<br>
            مخبر الوسائل التعليمية والعلوم
          </div>
          <div class="header-center">
            <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
            <div class="min-title">وزارة التربية الوطنية</div>
            <div class="year-title">السنة الدراسية: ${f}</div>
          </div>
          <div class="header-left">
            سجل بطاقات الجرد العام<br>
            تاريخ الطباعة: ${$}<br>
            مجموع التجهيزات: ${r.length}
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
          ${r.map((k,L)=>`
            <tr>
              <td style="font-weight: bold; text-align: center;">${L+1}</td>
              <td style="font-weight: 800; text-align: center; font-family: monospace;">${k.serialNumber}</td>
              <td style="text-align: center;">${k.foundationalInventory||"—"}</td>
              <td style="font-weight: 700; text-align: right; padding-right: 6px;">${k.name}</td>
              <td>${k.supplier||"—"}</td>
              <td style="text-align: center; font-weight: 700;">${k.price?`${k.price} دج`:"—"}</td>
              <td>${k.location||"مخبر الوسائل"}</td>
              <td style="text-align: center;">${k.exitDate||"—"}</td>
              <td style="font-size: 6.8pt; color: #374151;">${k.notes||"—"}</td>
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
  `}function Rt(r,c){const{paperFormat:i,printSides:h}=c;if(i==="A4_DUAL"){const u=[];for(let f=0;f<r.length;f+=2)u.push(r.slice(f,f+2));return u.map(f=>`
      <div class="dual-page-wrapper">
        <div class="dual-card">
          ${Qe(f[0],c,!0)}
        </div>
        <div class="dual-cut-line">✂ خط القطع والفصل المعتمد للبطاقات (A5) ✂</div>
        ${f[1]?`
          <div class="dual-card">
            ${Qe(f[1],c,!0)}
          </div>
        `:`
          <div class="dual-card" style="border: 1px dashed #999; display: flex; align-items: center; justify-content: center; color: #888;">
            بطاقة فارغة (نهاية القائمة)
          </div>
        `}
      </div>
    `).join("")}return r.map(u=>`
    ${h==="both"||h==="front"?`
      <div class="card-page">
        ${Qe(u,c,!1)}
      </div>
    `:""}
    ${h==="both"||h==="back"?`
      <div class="card-page">
        ${Qt(u,c)}
      </div>
    `:""}
  `).join("")}function Qe(r,c,i=!1){const{directorate:h,schoolName:u,commune:f,includeOfficialHeader:$=!0,includeQrCode:k=!0,includeStampBox:L=!0,paperFormat:_,academicYear:Y}=c,X=Y||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025 / 2026",O=_==="A5",A=k?Dt(`DZ-EDU-INV:${r.serialNumber}:${r.name}`,O?24:26):"",g=It(r.name),o=r.price&&!isNaN(Number(r.price))?`${(Number(r.price)*r.totalQuantity).toLocaleString("ar-DZ")} دج`:"—",S=i?1:O?2:3;return`
    <div>
      ${$?`
        <div class="official-header">
          <div class="header-columns">
            <div class="header-right">
              ${h}<br>
              ${u} (${f})<br>
              مخبر الوسائل التعليمية
            </div>
            <div class="header-center">
              <div class="rep-title">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div class="min-title">وزارة التربية الوطنية</div>
              <div class="year-title">السنة الدراسية: ${X}</div>
            </div>
            <div class="header-left">
              بطاقة الجرد رقم:<br>
              <span class="sn-box">${r.serialNumber}</span>
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
          <span class="review-val">${r.foundationalInventory||"2015-10-15"}</span>
        </div>
        <div>
          <span>المراجعة العشرية لسنة : </span>
          <span class="review-val">${r.decennialReview||"2025-10-15"}</span>
        </div>
      </div>

      <div class="tech-grid">
        <div class="tech-col">
          <div class="tech-col-hdr">الفهرس (الصنف)</div>
          <div class="tech-col-body">${g}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">الفرع / الجناح</div>
          <div class="tech-col-body">مخبر العلوم والوسائل</div>
        </div>
        <div class="tech-col tech-col-sn">
          <div class="tech-col-hdr">رقم الجرد العام</div>
          <div class="tech-col-body sn-large">${r.serialNumber}</div>
        </div>
        <div class="tech-col">
          <div class="tech-col-hdr">ختم المؤسسة والتأشيرة</div>
          <div class="tech-col-body">
            ${k?A:'<span style="font-size: 6pt; color: #888;">مربع الختم</span>'}
          </div>
        </div>
      </div>

      <div class="details-box">
        <div class="detail-row">
          <span class="detail-lbl">الـتـعـيـيـن (تعيين الشيء) :</span>
          <span class="detail-val" style="font-weight: 900;">${r.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-lbl">الـخـصـائـص والمـواصـفـات :</span>
          <span class="detail-val">${r.notes||"جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة."}</span>
        </div>
        <div class="detail-grid-2">
          <div class="detail-row">
            <span class="detail-lbl">الموقع / الحفظ :</span>
            <span class="detail-val">${r.location||"مخبر الوسائل التعليمية - الخزانة الرئيسية"}</span>
          </div>
          <div class="detail-row">
            <span class="detail-lbl">الممون / المصدر :</span>
            <span class="detail-val">${r.supplier||"المؤسسة الوطنية للوسائل التعليمية"}</span>
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
              <td>${r.foundationalInventory||"2023-09-15"}</td>
              <td style="font-weight: 900;">${r.totalQuantity}</td>
              <td>${r.price?`${r.price} دج`:"—"}</td>
              <td style="font-weight: 900;">${o}</td>
              <td>${r.supplier||"—"}</td>
              <td style="font-size: 6.8pt;">مخبر الوسائل</td>
            </tr>
            ${Array.from({length:S}).map(()=>`
              <tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    ${L?`
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
  `}function Qt(r,c){const{includeStampBox:i=!0,paperFormat:h}=c,u=h==="A5";return`
    <div>
      <div class="back-hdr-banner">
        <div>التكفل المستمر وحركات التعيين والإتلاف</div>
        <div class="back-title">بطاقة جرد رقم: ${r.serialNumber} — ${r.name}</div>
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
            ${Array.from({length:u?3:4}).map(()=>`
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

    ${i?`
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
  `}async function st(r){const c=Pt(r),i=r.printScope==="table"?"سجل بطاقات الجرد العام":r.items.length===1?`بطاقة جرد رقم ${r.items[0].serialNumber} - ${r.items[0].name}`:`بطاقات الجرد (${r.items.length} تجهيز)`;await ot.printHtml(c,{title:i})}function Lt({isOpen:r,onClose:c,items:i,initialItem:h,initialScope:u="all",initialMode:f="filled",initialPaperFormat:$="A5",initialPrintSides:k="both",initialColorMode:L="color",initialIncludeHeader:_=!0,initialIncludeQr:Y=!0,initialIncludeStamp:X=!0,initialIncludeSupervisorStamp:O=!0,initialCopies:A=1,schoolInfo:g}){const[o,S]=n.useState(f),[v,F]=n.useState(u),[R,re]=n.useState($),[T,se]=n.useState(k),[C,he]=n.useState("front"),[Q,Z]=n.useState(0),[I,ie]=n.useState(""),[Ae,we]=n.useState(100),[J,Ie]=n.useState(!1),[ee,De]=n.useState(!0),[te,Pe]=n.useState(!1),[G,oe]=n.useState(A),[z,de]=n.useState(L),[ce,ae]=n.useState(L==="grayscale"),[B,ue]=n.useState(_),[U,ke]=n.useState(Y),[D,be]=n.useState(X),[H,fe]=n.useState(O),[b,ge]=n.useState("dotted"),[M,je]=n.useState(6),[le,ne]=n.useState(!1),[Se,q]=n.useState(!1);n.useEffect(()=>{if(r)if(S(f),F(u),re($),se(k),de(L),ae(L==="grayscale"),ue(_),ke(Y),be(X),fe(O),oe(A),h&&i.length>0){const s=i.findIndex(d=>d.id===h.id||d.serialNumber===h.serialNumber);Z(s>=0?s:0)}else Z(0)},[r,h,u,f,$,k,L,_,Y,X,O,A,i.length]);const j=n.useMemo(()=>i.length===0?{id:"dummy",serialNumber:"001/2026",name:"مجهر ضوئي ثنائي العينية",foundationalInventory:"تأسيسي 2024",decennialReview:"عشرية 2025",totalQuantity:4,supplier:"الديوان الوطني للمطبوعات المدرسية",price:"45000.00 دج",location:"مخبر العلوم الطبيعية - خزانة 02",status:"جيدة",notes:"معدات بصرية كاملة الملحقات"}:i[Q]||i[0],[i,Q]);n.useMemo(()=>{if(!I.trim())return i;const s=I.toLowerCase();return i.filter(d=>d.name.toLowerCase().includes(s)||d.serialNumber.toLowerCase().includes(s)||d.supplier&&d.supplier.toLowerCase().includes(s))},[i,I]);const p=o==="blank",P=n.useCallback(async()=>{ne(!0);try{let s=[];p?s=[{id:"blank",serialNumber:"",name:"",foundationalInventory:"",decennialReview:"",totalQuantity:0,supplier:"",price:"",location:"",status:"",notes:""}]:v==="table"||v==="all"?s=i:s=[j],await st({items:s,paperFormat:R,printSides:T,printScope:p?"single":v,directorate:g.directorate,schoolName:g.schoolName,commune:g.commune,academicYear:g.academicYear||"2025/2026",includeOfficialHeader:B,includeQrCode:U,includeStampBox:D,includeSupervisorStamp:H,colorMode:z,isEconomical:z==="grayscale"||ce,copies:G})}catch(s){console.error("Print cards error:",s)}finally{ne(!1)}},[p,v,i,j,R,T,g,B,U,D,H,z,ce,G]);n.useEffect(()=>{if(!r)return;const s=d=>{(d.ctrlKey||d.metaKey)&&d.key.toLowerCase()==="p"?(d.preventDefault(),P()):d.key==="Escape"?c():d.key==="ArrowRight"&&v==="single"&&!p?Z(V=>V>0?V-1:i.length-1):d.key==="ArrowLeft"&&v==="single"&&!p&&Z(V=>V<i.length-1?V+1:0)};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[r,P,c,v,p,i.length]);const xe=()=>{q(!0);try{const s=i.map((E,Ce)=>({"الرقم الترتيبي":Ce+1,"رقم الجرد العام":E.serialNumber,"تعيين الشيء / التجهيز":E.name,"الجرد التأسيسي":E.foundationalInventory||"---","المراجعة العشرية":E.decennialReview||"---","الكمية الإجمالية":E.totalQuantity,"المصدر والممون":E.supplier||"---","مكان الحفظ والتواجد":E.location||"---","الحالة الوظيفية":E.status||"جيدة","تاريخ الخروج":E.exitDate||"---",ملاحظات:E.notes||"---"})),d=pe.json_to_sheet(s);d["!cols"]=[{wch:10},{wch:15},{wch:30},{wch:15},{wch:15},{wch:10},{wch:25},{wch:25},{wch:15},{wch:15},{wch:30}];const V=pe.book_new();pe.book_append_sheet(V,d,"سجل بطاقات الجرد"),We(V,`سجل_بطاقات_الجرد_${g.schoolName}_${new Date().toISOString().split("T")[0]}.xlsx`)}catch(s){console.error("Excel export error:",s)}finally{q(!1)}};if(!r)return null;const m=$e(g.schoolName,g.commune),ve=v==="table"?{w:"297mm",h:"210mm",isLandscape:!0}:R==="A5"?{w:"148mm",h:"210mm",isLandscape:!1}:{w:"210mm",h:"297mm",isLandscape:!1};return e.jsx(ze,{children:e.jsx("div",{className:"fixed inset-0 z-[120] flex items-center justify-center p-1 sm:p-3 md:p-4 bg-black/75 backdrop-blur-sm rtl font-sans no-print select-none",dir:"rtl",children:e.jsxs(_e.div,{initial:{opacity:0,scale:.96,y:12},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.96,y:12},transition:{duration:.2},className:`relative w-full bg-surface rounded-3xl shadow-2xl border border-outline/15 flex flex-col overflow-hidden transition-all duration-300 ${J?"max-w-[99vw] h-[98vh] max-h-[99vh] rounded-xl":"max-w-7xl h-[95vh] max-h-[980px]"}`,children:[e.jsxs("div",{className:"px-4 sm:px-5 py-3 bg-surface-container-low border-b border-outline/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0",children:e.jsx(me,{size:20})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-sm sm:text-base font-black text-primary leading-tight flex items-center gap-2",children:[e.jsx("span",{children:"معاينة وإعدادات طباعة بطاقات الجرد الرسمية"}),e.jsx("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20",children:"النموذج الوزاري المعتمد"})]}),e.jsxs("p",{className:"text-[11px] text-on-surface/60 font-medium",children:[m," • ",g.directorate," • ",i.length," تجهيز مسجل"]})]})]}),e.jsxs("div",{className:"flex items-center bg-surface p-1 rounded-2xl border border-outline/10 shadow-xs",children:[e.jsxs("button",{type:"button",onClick:()=>{S("filled"),F("single")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!p&&v==="single"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(Le,{size:13}),"بطاقة مفردة"]}),e.jsxs("button",{type:"button",onClick:()=>{S("filled"),F("all")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!p&&v==="all"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(Xe,{size:13}),"جميع البطاقات (",i.length,")"]}),e.jsxs("button",{type:"button",onClick:()=>{S("blank"),F("single")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${p?"bg-amber-600 text-white shadow-xs":"text-on-surface/70 hover:text-amber-700"}`,children:[e.jsx(Je,{size:13}),"استمارة فارغة (للملء اليدوي)"]}),e.jsxs("button",{type:"button",onClick:()=>{S("filled"),F("table")},className:`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${!p&&v==="table"?"bg-primary text-on-primary shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:[e.jsx(Ne,{size:13}),"السجل كجدول"]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 sm:gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>De(s=>!s),className:`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${ee?"bg-primary/15 text-primary border-primary/30 shadow-xs":"bg-surface text-on-surface/70 border-outline/10 hover:text-primary hover:bg-surface-container"}`,title:"إظهار / إخفاء لوحة خيارات وتنسيق الطباعة",children:[e.jsx(Fe,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"خيارات الطباعة"})]}),e.jsxs("button",{type:"button",onClick:xe,disabled:Se,className:"px-3 py-2 rounded-xl text-xs font-black bg-surface text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50",title:"تصدير السجل إلى ملف Excel",children:[e.jsx(Ne,{size:14}),e.jsx("span",{className:"hidden md:inline",children:"تصدير Excel"})]}),e.jsxs("button",{type:"button",onClick:P,disabled:le,className:"px-3 py-2 rounded-xl text-xs font-black bg-surface text-rose-700 dark:text-rose-400 border border-rose-300/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50",title:"حفظ أو تحميل كملف PDF (عبر نافذة الطباعة الرسمية)",children:[e.jsx(et,{size:14}),e.jsx("span",{className:"hidden md:inline",children:"تحميل PDF"})]}),e.jsx("button",{type:"button",onClick:()=>Ie(s=>!s),className:"p-2 text-on-surface/60 hover:text-primary hover:bg-surface-container rounded-xl transition-colors cursor-pointer border border-outline/10",title:J?"إنهاء ملء الشاشة":"ملء الشاشة",children:J?e.jsx(mt,{size:16}):e.jsx(ht,{size:16})}),e.jsx("button",{type:"button",onClick:P,disabled:le,className:"px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-black shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:le?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsx("span",{children:"جاري الطباعة..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(me,{size:16}),e.jsx("span",{children:"طباعة الآن (Ctrl+P)"})]})}),e.jsx("button",{type:"button",onClick:c,className:"p-2 text-on-surface/60 hover:text-error hover:bg-error/10 rounded-xl transition-colors cursor-pointer border border-outline/10",title:"إغلاق النافذة (Esc)",children:e.jsx(tt,{size:18})})]})]}),e.jsxs("div",{className:"flex-1 flex overflow-hidden relative",children:[e.jsx(ze,{initial:!1,children:ee&&e.jsx(_e.div,{initial:{width:0,opacity:0},animate:{width:320,opacity:1},exit:{width:0,opacity:0},transition:{duration:.2},className:"bg-surface-container-low border-e border-outline/10 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10",children:e.jsxs("div",{className:"p-4 space-y-5 text-right",children:[v==="single"&&!p&&e.jsxs("div",{className:"p-3.5 bg-surface rounded-2xl border border-primary/15 shadow-xs space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Me,{size:14}),e.jsx("span",{children:"التجهيز المحدد للمعاينة"})]}),e.jsxs("span",{className:"text-[10px] font-mono font-bold text-on-surface/60 bg-surface-container px-2 py-0.5 rounded-full",children:[Q+1," / ",i.length]})]}),e.jsxs("div",{className:"flex items-center justify-between gap-1.5",children:[e.jsxs("button",{type:"button",onClick:()=>Z(s=>s>0?s-1:i.length-1),className:"p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer",title:"التجهيز السابق",children:[e.jsx(ut,{size:14}),e.jsx("span",{children:"السابق"})]}),e.jsx("div",{className:"text-[11px] font-black text-primary truncate max-w-[150px] text-center",children:j.name}),e.jsxs("button",{type:"button",onClick:()=>Z(s=>s<i.length-1?s+1:0),className:"p-1.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all text-xs font-bold border border-outline/10 flex items-center gap-1 cursor-pointer",title:"التجهيز التالي",children:[e.jsx("span",{children:"التالي"}),e.jsx(ft,{size:14})]})]}),e.jsx("div",{className:"relative pt-1",children:e.jsx("select",{value:Q,onChange:s=>Z(Number(s.target.value)),className:"w-full px-2.5 py-1.5 rounded-xl border border-outline/15 bg-surface text-xs font-bold focus:border-primary outline-none cursor-pointer",children:i.map((s,d)=>e.jsxs("option",{value:d,children:[d+1,". ",s.serialNumber," — ",s.name]},s.id||d))})})]}),v!=="table"&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:[e.jsx("span",{children:"1. مقاس الورق (Format):"}),e.jsx("span",{className:"text-[10px] text-primary font-bold",children:"A5 قياسي"})]}),e.jsx("div",{className:"grid grid-cols-3 gap-1.5",children:[{id:"A5",label:"A5 قياسي",desc:"148×210 mm"},{id:"A4",label:"A4 كامل",desc:"210×297 mm"},{id:"A4_DUAL",label:"A4 مزدوج",desc:"بطاقتان/ورقة"}].map(s=>e.jsxs("button",{type:"button",onClick:()=>re(s.id),className:`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${R===s.id?"border-primary bg-primary/10 text-primary shadow-xs":"border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70"}`,children:[e.jsx("div",{className:"text-xs font-black",children:s.label}),e.jsx("div",{className:"text-[9px] text-on-surface/50 font-mono mt-0.5",children:s.desc})]},s.id))})]}),v!=="table"&&e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:e.jsx("span",{children:"2. أوجه الطباعة (Recto / Verso):"})}),e.jsx("div",{className:"grid grid-cols-3 gap-1.5",children:[{id:"both",label:"الوجهان معاً"},{id:"front",label:"أمامي فقط"},{id:"back",label:"خلفي فقط"}].map(s=>e.jsx("button",{type:"button",onClick:()=>se(s.id),className:`py-2 px-1 rounded-xl text-center border-2 transition-all cursor-pointer text-xs font-black ${T===s.id?"border-primary bg-primary/10 text-primary shadow-xs":"border-outline/15 hover:border-outline/30 bg-surface text-on-surface/70"}`,children:s.label},s.id))})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("label",{className:"text-xs font-black text-on-surface/80 flex items-center justify-between",children:[e.jsx("span",{children:"3. عدد النسخ للطباعة:"}),e.jsxs("span",{className:"text-xs font-mono font-bold text-primary",children:[G," نسخة"]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",onClick:()=>oe(s=>Math.max(1,s-1)),className:"w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer",children:"-"}),e.jsx("input",{type:"number",min:"1",max:"99",value:G,onChange:s=>oe(Math.max(1,parseInt(s.target.value)||1)),className:"flex-1 py-1.5 bg-surface text-center rounded-xl border border-outline/15 font-bold font-mono text-xs outline-none focus:border-primary"}),e.jsx("button",{type:"button",onClick:()=>oe(s=>s+1),className:"w-9 h-9 rounded-xl bg-surface border border-outline/15 flex items-center justify-center font-black text-base hover:bg-surface-container cursor-pointer",children:"+"})]})]}),e.jsxs("div",{className:"space-y-2 pt-2 border-t border-outline/10",children:[e.jsx("span",{className:"text-xs font-black text-on-surface/80 block",children:"4. خيارات المظهر والتوثيق الرسمي:"}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsx("span",{children:"إدراج الترويسة الرسمية للجمهورية"}),e.jsx("input",{type:"checkbox",checked:B,onChange:s=>ue(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(rt,{size:14,className:"text-primary"}),e.jsx("span",{children:"رمز الاستجابة السريعة (QR Code)"})]}),e.jsx("input",{type:"checkbox",checked:U,onChange:s=>ke(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline/10 cursor-pointer text-xs font-bold text-on-surface/80 hover:bg-surface-container-low transition-colors",children:[e.jsx("span",{children:"خانة تأشيرة المقتصد والمدير"}),e.jsx("input",{type:"checkbox",checked:D,onChange:s=>be(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),D&&e.jsxs("label",{className:"flex items-center justify-between p-2.5 rounded-xl bg-surface border border-primary/20 cursor-pointer text-xs font-bold text-primary hover:bg-primary/5 transition-colors",children:[e.jsx("span",{children:"تضمين خانة الناظر (التوقيع والختم)"}),e.jsx("input",{type:"checkbox",checked:H,onChange:s=>fe(s.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-surface border border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/80 block",children:"نمط الألوان واستهلاك الحبر:"}),e.jsxs("div",{className:"grid grid-cols-3 gap-1",children:[e.jsx("button",{type:"button",onClick:()=>{de("color"),ae(!1)},className:`py-1.5 px-1.5 rounded-lg text-[10.5px] font-black border transition-all cursor-pointer text-center ${z==="color"?"bg-primary text-white border-primary shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,children:"ملون رسمي"}),e.jsx("button",{type:"button",onClick:()=>{de("grayscale"),ae(!0)},className:`py-1.5 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer text-center ${z==="grayscale"?"bg-zinc-800 text-white border-zinc-900 shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,title:"تدرج رمادي لتوفير الحبر مع نصوص سوداء واضحة",children:"تدرج رمادي"}),e.jsx("button",{type:"button",onClick:()=>{de("bw"),ae(!0)},className:`py-1.5 px-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer text-center ${z==="bw"?"bg-black text-white border-black shadow-xs":"bg-surface border-outline/15 text-on-surface/70 hover:bg-surface-container"}`,title:"أبيض وأسود للنسخ والتصوير",children:"أبيض وأسود"})]})]})]}),p&&e.jsxs("div",{className:"space-y-2 pt-2 border-t border-outline/10",children:[e.jsx("span",{className:"text-xs font-black text-amber-800 dark:text-amber-300 block",children:"تنسيق الاستمارة الفارغة:"}),e.jsxs("div",{className:"grid grid-cols-2 gap-1.5",children:[e.jsx("button",{type:"button",onClick:()=>ge("dotted"),className:`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${b==="dotted"?"bg-amber-600 text-white":"bg-surface border-outline/15"}`,children:"أسطر منقطة (...)"}),e.jsx("button",{type:"button",onClick:()=>ge("solid"),className:`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${b==="solid"?"bg-amber-600 text-white":"bg-surface border-outline/15"}`,children:"أسطر متصلة (___)"})]})]}),e.jsxs("div",{className:"pt-2",children:[e.jsxs("button",{type:"button",onClick:()=>Pe(s=>!s),className:"w-full text-right text-[11px] font-bold text-primary hover:underline flex items-center justify-between",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(gt,{size:13}),e.jsx("span",{children:"إرشادات طباعة الوجهين (Recto-Verso)"})]}),e.jsx("span",{children:te?"▲":"▼"})]}),te&&e.jsxs("div",{className:"mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-[10px] text-on-surface/80 leading-relaxed space-y-1",children:[e.jsxs("p",{children:["• ",e.jsx("b",{children:"مقاس A5:"})," هو المقاس الرسمي المعتمد لبطاقات جرد الوسائل التعليمية بالجزائر."]}),e.jsxs("p",{children:["• ",e.jsx("b",{children:"الطباعة على وجهين:"}),' قم بتحديد (الوجهان معاً) وضبط الطابعة على "Flip on short edge" لقلب الورقة بشكل سليم.']}),e.jsxs("p",{children:["• ",e.jsx("b",{children:"توفير الورق (A4 مزدوج):"})," يتيح طباعة بطاقتين مستقلتين في ورقة واحدة وقصها لاحقاً."]})]})]})]})})}),e.jsxs("div",{className:"flex-1 bg-zinc-200/70 dark:bg-zinc-950 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 relative",children:[e.jsxs("div",{className:"w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 z-20 bg-surface/90 backdrop-blur-md p-2 rounded-2xl border border-outline/15 shadow-sm",children:[v!=="table"&&e.jsxs("div",{className:"flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10 text-xs font-bold",children:[e.jsx("button",{type:"button",onClick:()=>he("front"),className:`px-3 py-1 rounded-lg transition-all cursor-pointer ${C==="front"?"bg-primary text-white shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:"الوجه الأمامي (Recto)"}),e.jsx("button",{type:"button",onClick:()=>he("back"),className:`px-3 py-1 rounded-lg transition-all cursor-pointer ${C==="back"?"bg-primary text-white shadow-xs":"text-on-surface/70 hover:text-primary"}`,children:"الوجه الخلفي (Verso)"})]}),e.jsxs("div",{className:"text-xs font-bold text-on-surface/70 flex items-center gap-1.5",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),e.jsx("span",{children:v==="table"?"معاينة السجل كجدول":v==="all"?`معاينة البطاقة ${Q+1} من ${i.length}`:p?"استمارة بطاقة جرد فارغة":`بطاقة رقم: ${j.serialNumber}`})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline/10",children:[e.jsx("button",{type:"button",onClick:()=>we(s=>Math.max(50,s-15)),className:"p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer",title:"تصغير",children:e.jsx(jt,{size:15})}),e.jsxs("span",{className:"text-[11px] font-mono font-bold px-1.5 text-on-surface/80",children:[Ae,"%"]}),e.jsx("button",{type:"button",onClick:()=>we(s=>Math.min(180,s+15)),className:"p-1 rounded-lg hover:bg-surface text-on-surface/70 hover:text-primary transition-colors cursor-pointer",title:"تكبير",children:e.jsx(vt,{size:15})}),e.jsx("button",{type:"button",onClick:()=>we(100),className:"p-1 rounded-lg hover:bg-surface text-on-surface/50 hover:text-primary transition-colors cursor-pointer",title:"إعادة ضبط 100%",children:e.jsx(yt,{size:13})})]})]}),e.jsx("div",{className:"transition-transform duration-200 origin-top my-auto shadow-2xl rounded-sm",style:{transform:`scale(${Ae/100})`,width:ve.w,minHeight:ve.h,backgroundColor:"#ffffff",color:"#000000",boxShadow:"0 20px 40px -15px rgba(0,0,0,0.3)",border:"1px solid #d4d4d8",filter:z==="grayscale"?"grayscale(100%)":"none"},children:v==="table"?e.jsxs("div",{className:"p-6 text-right font-sans text-black",dir:"rtl",children:[e.jsxs("div",{className:"border-b-2 border-black pb-3 mb-4 flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-bold text-xs",children:g.directorate}),e.jsx("div",{className:"font-bold text-xs",children:m})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-sm",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-xs",children:"وزارة التربية الوطنية"}),e.jsx("h2",{className:"text-base font-black mt-2 underline",children:"سجل بطاقات الجرد العام للوسائل والتجهيزات"})]}),e.jsxs("div",{className:"text-left font-bold text-xs",children:[e.jsxs("div",{children:["السنة الدراسية: ",g.academicYear||"2025/2026"]}),e.jsxs("div",{children:["العدد الإجمالي: ",i.length]})]})]}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[9px] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1.5 w-8",children:"#"}),e.jsx("th",{className:"border border-black p-1.5 w-24",children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1.5 text-right",children:"تعيين الشيء ومواصفاته"}),e.jsx("th",{className:"border border-black p-1.5 w-20",children:"الجرد التأسيسي"}),e.jsx("th",{className:"border border-black p-1.5 w-20",children:"المراجعة العشرية"}),e.jsx("th",{className:"border border-black p-1.5 w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1.5 w-28",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1.5 w-16",children:"الحالة"}),e.jsx("th",{className:"border border-black p-1.5 w-24",children:"ملاحظات"})]})}),e.jsx("tbody",{children:i.slice(0,15).map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-6",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:d+1}),e.jsx("td",{className:"border border-black p-1 font-mono font-bold",children:s.serialNumber}),e.jsx("td",{className:"border border-black p-1 text-right font-bold",children:s.name}),e.jsx("td",{className:"border border-black p-1",children:s.foundationalInventory||"---"}),e.jsx("td",{className:"border border-black p-1",children:s.decennialReview||"---"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:s.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:s.supplier||"---"}),e.jsx("td",{className:"border border-black p-1",children:s.status||"جيدة"}),e.jsx("td",{className:"border border-black p-1",children:s.notes||"---"})]},s.id||d))})]}),i.length>15&&e.jsxs("div",{className:"text-center text-[8px] text-gray-500 mt-2 italic",children:["(يتم طباعة كافة التجهيزات الـ ",i.length," موزعة على صفحات السجل تلقائياً)"]})]}):e.jsx("div",{className:"p-4 sm:p-5 flex flex-col justify-between h-full font-sans text-black",dir:"rtl",style:{minHeight:ve.h},children:C==="front"?e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[B&&e.jsxs("div",{className:"border-b border-black pb-2 mb-2 flex items-start justify-between",children:[e.jsxs("div",{className:"text-[7pt] leading-tight font-bold text-right",children:[e.jsx("div",{children:g.directorate}),e.jsx("div",{children:m})]}),e.jsxs("div",{className:"text-center flex-1",children:[e.jsx("div",{className:"text-[8pt] font-black tracking-tight",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"text-[7pt] font-bold",children:"وزارة التربية الوطنية"})]}),e.jsx("div",{className:"text-[7pt] font-bold text-left",children:e.jsxs("div",{children:["السنة: ",g.academicYear||"2025/2026"]})})]}),e.jsxs("div",{className:"border-2 border-black p-1.5 mb-2 flex items-center justify-between bg-gray-50",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 rounded border border-black flex items-center justify-center p-0.5 bg-white",children:e.jsx("img",{src:Ke,alt:"Logo",className:"max-w-full max-h-full object-contain"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-[10pt] font-black leading-none m-0",children:"بطاقة جرد الوسائل التعليمية"}),e.jsx("span",{className:"text-[6.5pt] font-bold text-gray-600 block mt-0.5",children:"FICHE D'INVENTAIRE DU MATÉRIEL DIDACTIQUE"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"border border-black px-2 py-0.5 bg-white text-center",children:[e.jsx("span",{className:"text-[6.5pt] font-bold block text-gray-500",children:"رقم الجرد العام:"}),e.jsx("span",{className:"text-[9pt] font-black font-mono",children:p?"....................":j.serialNumber})]}),U&&!p&&e.jsx("div",{className:"border border-black p-0.5 bg-white",children:e.jsx(qe,{value:`INV:${j.serialNumber}|${j.name}|${g.schoolName}`,size:30,level:"M"})})]})]}),e.jsxs("div",{className:"border border-black mb-2 text-[7.5pt]",children:[e.jsxs("div",{className:"grid grid-cols-12 border-b border-black",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-black border-l border-black",children:"تعيين الشيء (Désignation):"}),e.jsx("div",{className:"col-span-9 p-1 font-black text-[8.5pt]",children:p?"....................................................................................................":j.name})]}),e.jsxs("div",{className:"grid grid-cols-12 border-b border-black",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"المصدر / الممون (Fournisseur):"}),e.jsx("div",{className:"col-span-4 p-1 font-bold border-l border-black",children:p?"....................................":j.supplier||"وزارة التربية الوطنية"}),e.jsx("div",{className:"col-span-2 bg-gray-100 p-1 font-bold border-l border-black text-center",children:"الكمية الإجمالية:"}),e.jsx("div",{className:"col-span-3 p-1 font-black text-center font-mono",children:p?"..........":j.totalQuantity})]}),e.jsxs("div",{className:"grid grid-cols-12",children:[e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"الجرد التأسيسي:"}),e.jsx("div",{className:"col-span-3 p-1 font-bold border-l border-black",children:p?"................":j.foundationalInventory||"---"}),e.jsx("div",{className:"col-span-3 bg-gray-100 p-1 font-bold border-l border-black",children:"المراجعة العشرية:"}),e.jsx("div",{className:"col-span-3 p-1 font-bold",children:p?"................":j.decennialReview||"---"})]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"جدول حركات وتداول الشيء في المخابر والحصص التطبيقية:"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-16",rowSpan:2,children:"التاريخ"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الرصيد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"الأستاذ / المستلم"}),e.jsx("th",{className:"border border-black p-1 w-20",rowSpan:2,children:"التأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-10",children:"دخول"}),e.jsx("th",{className:"border border-black p-0.5 w-10",children:"خروج"})]})]}),e.jsx("tbody",{children:[...Array(R==="A4"?8:5)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},d))})]})]})]}),D&&e.jsxs("div",{className:`grid ${H?"grid-cols-3":"grid-cols-2"} gap-2 text-center text-[6.5pt] font-bold border-t border-black pt-1.5 mt-2`,children:[e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم المقتصد:"}),e.jsx("div",{className:"h-6"})]}),H&&e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"الناظر (التوقيع والختم):"}),e.jsx("div",{className:"h-6"})]}),e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم رئيس المؤسسة:"}),e.jsx("div",{className:"h-6"})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center",children:"بطاقة جرد دائمة رسمية — يمنع إتلاف أو شطب أي بيان دون محضر رسمي معتمد من المصالح الاقتصادية."})]}):e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"border border-black bg-gray-100 p-1 mb-2 text-center font-black text-[8pt]",children:"الوجه الخلفي لبطاقة الجرد — المتابعة الدورية والإسقاط"}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"font-bold text-[7.5pt] mb-1",children:"1. المعاينة الدورية والحالة الفنية للتجهيز (Vérification et État):"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",children:"تاريخ المعاينة"}),e.jsx("th",{className:"border border-black p-1 w-16",children:"الحالة الفنية"}),e.jsx("th",{className:"border border-black p-1",children:"ملاحظات مسؤول المخبر / الصيانة"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"تأشيرة المخبري"})]})}),e.jsx("tbody",{children:[...Array(R==="A4"?6:4)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black",children:d===0&&!p?j.status:""}),e.jsx("td",{className:"border border-black",children:d===0&&!p?j.notes:""}),e.jsx("td",{className:"border border-black"})]},d))})]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"font-bold text-[7.5pt] mb-1",children:"2. الإسقاط والإتلاف والتكهين (Réforme / Sortie / Décharge):"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",rowSpan:2,children:"تاريخ السند"}),e.jsx("th",{className:"border border-black p-1 w-12",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج / الإسقاط"}),e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"رقم محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"التأشيرة والختم"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-16",children:"المدير"})]})]}),e.jsx("tbody",{children:[...Array(R==="A4"?4:3)].map((s,d)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},d))})]})]})]}),D&&e.jsxs("div",{className:"grid grid-cols-2 gap-3 mt-3",children:[e.jsxs("div",{className:"border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between",children:[e.jsx("div",{children:"تأشيرة وختم المقتصد:"}),e.jsx("div",{className:"text-gray-400 text-[6pt]",children:"(الاسم والتوقيع والختم)"})]}),e.jsxs("div",{className:"border border-black p-2 bg-gray-50 text-[7pt] font-bold text-center h-16 flex flex-col justify-between",children:[e.jsx("div",{children:"تأشيرة ومصادقة رئيس المؤسسة:"}),e.jsx("div",{className:"text-gray-400 text-[6pt]",children:"(الاسم والتوقيع والختم)"})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-600 italic border-t border-black pt-1 mt-2 text-center",children:"هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر."})]})})})]})]}),e.jsxs("div",{className:"px-5 py-3 bg-surface-container-low border-t border-outline/10 flex flex-wrap items-center justify-between gap-3 shrink-0",children:[e.jsxs("div",{className:"text-xs font-bold text-on-surface/70 flex items-center gap-2",children:[e.jsx("span",{className:"p-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",children:e.jsx(Te,{size:14})}),e.jsxs("span",{children:["النموذج جاهز للطباعة بالتنسيق المعتمد (",R," • ",T==="both"?"الوجهان معاً":T==="front"?"وجه أمامي":"وجه خلفي"," • ",v==="table"?"السجل كجدول":v==="all"?`جميع البطاقات (${i.length})`:"بطاقة مفردة",")"]})]}),e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{type:"button",onClick:c,className:"px-4 py-2 bg-surface text-on-surface/70 hover:text-on-surface hover:bg-surface-container rounded-xl text-xs font-bold transition-all border border-outline/10 cursor-pointer",children:"إغلاق"}),e.jsx("button",{type:"button",onClick:P,disabled:le,className:"px-7 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:le?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsx("span",{children:"جاري الطباعة..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(me,{size:15}),e.jsx("span",{children:"طباعة البطاقات الآن"})]})})]})]})]})})})}function Wt(){var Be;const{t:r,i18n:c}=nt(),{schoolId:i,schoolName:h,directorate:u,commune:f,academicYear:$}=dt(),{openPrintSettingsModal:k,openPrintPreview:L}=ct(),[_,Y]=n.useState([]),[X,O]=n.useState(!0),[A,g]=n.useState(""),[o,S]=n.useState(null),[v,F]=n.useState(!1),[R,re]=n.useState("filled"),[T,se]=n.useState(0),[C,he]=n.useState("A5"),[Q,Z]=n.useState("both"),[I,ie]=n.useState("all"),[Ae,we]=n.useState("front"),[J,Ie]=n.useState(!0),[ee,De]=n.useState(!0),[te,Pe]=n.useState(!0),[G,oe]=n.useState(!0),[z,de]=n.useState("color"),[ce,ae]=n.useState(1),[B,ue]=n.useState(!1),[U,ke]=n.useState("all"),[D,be]=n.useState(""),[H,fe]=n.useState(!1),[b,ge]=n.useState("serialNumber"),[M,je]=n.useState("asc"),le=it(),{data:ne,loading:Se}=xt("equipment","/api/db/equipment");n.useEffect(()=>{const t=()=>{};return window.addEventListener("afterprint",t),()=>window.removeEventListener("afterprint",t)},[]),n.useEffect(()=>{ne&&(Y(t=>t.length===ne.length&&t.length===0?t:ne.map(a=>({id:a.id,serialNumber:a.serialNumber||"",name:a.smartNameAr||a.name||"",foundationalInventory:a.registrationDate||a.foundationalInventory||"",decennialReview:a.decennialReview||"",totalQuantity:a.totalQuantity||1,supplier:a.source||a.supplier||"",price:a.price||"",location:a.location||"",exitDate:a.exitDate||"",status:a.status==="functional"?"جيدة":a.status==="maintenance"?"تحتاج صيانة":a.status==="broken"?"عاطلة":a.status||"جيدة",notes:a.notes||""}))),O(Se))},[ne,Se]);const q=async(t,l,a)=>{try{let x=a,W=l;l==="status"&&(a==="جيدة"?x="functional":a==="تحتاج صيانة"||a==="في الإصلاح"?x="maintenance":(a==="عاطلة"||a==="مفقودة")&&(x="broken")),await pt(t,{[W]:x}),Y(y=>y.map(N=>N.id===t?{...N,[l]:a}:N))}catch(x){console.error("Failed to update equipment card:",x)}},j=t=>{b===t?je(l=>l==="asc"?"desc":"asc"):(ge(t),je(t==="totalQuantity"||t==="foundationalInventory"||t==="decennialReview"||t==="price"||t==="exitDate"?"desc":"asc"))},p=ye.useMemo(()=>[..._].sort((t,l)=>{if(!M)return 0;if(b==="index"||b==="serialNumber"){const y=Ve(t.serialNumber),N=Ve(l.serialNumber);return y!==N?M==="asc"?y-N:N-y:M==="asc"?(t.serialNumber||"").localeCompare(l.serialNumber||"",void 0,{numeric:!0}):(l.serialNumber||"").localeCompare(t.serialNumber||"",void 0,{numeric:!0})}if(b==="totalQuantity"){const y=Number(t.totalQuantity)||0,N=Number(l.totalQuantity)||0;return M==="desc"?N-y:y-N}if(b==="foundationalInventory"||b==="decennialReview"||b==="exitDate"){const y=Ye(t[b]),N=Ye(l[b]);return y<0&&N<0?0:y<0?1:N<0?-1:M==="desc"?N-y:y-N}if(b==="price"){const y=Ze(t.price),N=Ze(l.price);return y<0&&N<0?0:y<0?1:N<0?-1:M==="desc"?N-y:y-N}if(b==="name"){const y=Ge(t.name),N=Ge(l.name),Ue=y.localeCompare(N,"ar",{numeric:!0,sensitivity:"base"});return M==="asc"?Ue:-Ue}const a=String(t[b]||"").trim(),x=String(l[b]||"").trim();if(!a&&!x)return 0;if(!a)return 1;if(!x)return-1;const W=a.localeCompare(x,"ar",{numeric:!0,sensitivity:"base"});return M==="asc"?W:-W}),[_,M,b]),P=ye.useMemo(()=>p.filter(t=>t.name.toLowerCase().includes(A.toLowerCase())||t.serialNumber.toLowerCase().includes(A.toLowerCase())||t.supplier&&t.supplier.toLowerCase().includes(A.toLowerCase())||t.location&&t.location.toLowerCase().includes(A.toLowerCase())||t.notes&&t.notes.toLowerCase().includes(A.toLowerCase())),[p,A]),xe={total:_.length,good:_.filter(t=>t.status==="جيدة"||t.status==="functional").length,maintenance:_.filter(t=>t.status==="تحتاج صيانة"||t.status==="maintenance").length,broken:_.filter(t=>t.status==="عاطلة"||t.status==="broken"||t.status==="مفقودة").length},m=ye.useMemo(()=>{let t=P;return U==="functional"?t=t.filter(l=>l.status==="جيدة"||l.status==="functional"):U==="maintenance"?t=t.filter(l=>l.status==="تحتاج صيانة"||l.status==="maintenance"||l.status==="في الإصلاح"):U==="broken"&&(t=t.filter(l=>l.status==="عاطلة"||l.status==="broken"||l.status==="مفقودة")),t},[P,U]),Oe=t=>{const l=m.findIndex(a=>a.id===t.id);se(l>=0?l:0),be(t.id),S(t),ie("single"),re("filled"),F(!0)},ve=()=>{S(null),ie("all"),re("filled"),se(0),F(!0)},s=()=>{S(null),ie("single"),re("blank"),se(0),F(!0)},d=()=>{L({title:"سجل بطاقات الجرد العام للوسائل والتجهيزات التعليمية",subtitle:`${u} • ${$e(h,f)} • السنة الدراسية: ${$||"2025/2026"}`,type:"table",headers:["#","رقم الجرد العام","تعيين الشيء / التجهيز","الجرد التأسيسي","المراجعة العشرية","الكمية","المصدر / الممون","الموقع والمقر","الحالة الوظيفية","ملاحظات"],rows:m.map((t,l)=>[l+1,t.serialNumber,t.name,t.foundationalInventory||"—",t.decennialReview||"—",t.totalQuantity,t.supplier||"—",t.location||"مخبر الوسائل",t.status,t.notes||"—"]),suggestedOrientation:"landscape"})},V=()=>{try{const t=m.map((x,W)=>({الرقم:W+1,"رقم الجرد العام":x.serialNumber,"تعيين الشيء":x.name,"الجرد التأسيسي":x.foundationalInventory||"—","المراجعة العشرية":x.decennialReview||"—",الكمية:x.totalQuantity,"المصدر / الممون":x.supplier||"—","مكان الحفظ والموقع":x.location||"—","الحالة الوظيفية":x.status,ملاحظات:x.notes||"—"})),l=pe.json_to_sheet(t);l["!cols"]=[{wch:8},{wch:16},{wch:32},{wch:16},{wch:16},{wch:10},{wch:26},{wch:22},{wch:16},{wch:28}];const a=pe.book_new();pe.book_append_sheet(a,l,"سجل بطاقات الجرد"),We(a,`سجل_بطاقات_الجرد_${h||"المؤسسة"}_${new Date().toISOString().split("T")[0]}.xlsx`)}catch(t){console.error("Excel export error:",t)}},E=async(t=I,l)=>{if(ie(t),l)S(l);else if(t==="single"&&D){const a=m.find(x=>x.id===D);a&&S(a)}else t==="single"&&m[T]?S(m[T]):S(null);fe(!0);try{let a=[];if(R==="blank")a=[{id:"blank",serialNumber:"",name:"",foundationalInventory:"",decennialReview:"",totalQuantity:0,supplier:"",price:"",location:"",status:"",notes:""}];else if(t==="table"||t==="all")a=m;else{const x=D?m.find(y=>y.id===D):null,W=l||x||(m[T]?m[T]:o||m[0]);a=W?[W]:[]}await st({items:a,paperFormat:C,printSides:Q,printScope:R==="blank"?"single":t,directorate:u,schoolName:h,commune:f,academicYear:$,includeOfficialHeader:G,includeQrCode:J,includeStampBox:ee,includeSupervisorStamp:te,colorMode:z,isEconomical:z==="grayscale",copies:ce})}catch(a){console.warn("Iframe print error, falling back to window.print():",a),setTimeout(()=>{window.print()},100)}finally{fe(!1)}},Ce=P[T]||P[0]||o,K=({field:t})=>b!==t?e.jsx(_t,{size:14,className:"opacity-30 group-hover:opacity-100 transition-opacity"}):M==="asc"?e.jsx(At,{size:14}):e.jsx(He,{size:14});if(X)return e.jsx("div",{className:"flex items-center justify-center min-h-[400px]",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary"})});const at=I==="single"?o?[o]:Ce?[Ce]:[]:P;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"hidden print:block font-sans rtl",dir:"rtl",children:[e.jsx("style",{children:`
            @media print {
              @page {
                ${C==="A5"?"size: A5 portrait; margin: 4mm;":I==="table"?"size: A4 landscape; margin: 8mm;":"size: A4 portrait; margin: 6mm;"}
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
          `}),I==="table"?e.jsxs("div",{className:"w-full text-black",children:[e.jsx("div",{className:"border-b-2 border-black pb-3 mb-4",children:e.jsxs("div",{className:"flex justify-between items-start text-xs font-bold leading-tight",children:[e.jsxs("div",{children:[u,e.jsx("br",{}),h," (",f,")",e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-sm font-black",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"text-xs font-bold",children:"وزارة التربية الوطنية"}),e.jsx("div",{className:"text-base font-black mt-1 underline decoration-double",children:"سجل بطاقات الجرد العام للوسائل التعليمية"})]}),e.jsxs("div",{className:"text-left text-xs font-bold",children:["السنة الدراسية: ",$||"2025/2026",e.jsx("br",{}),"تاريخ الطباعة: ",new Date().toLocaleDateString("ar-DZ"),e.jsx("br",{}),"عدد التجهيزات: ",P.length]})]})}),e.jsxs("table",{className:"w-full border-collapse border-2 border-black text-[9pt]",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b-2 border-black",children:[e.jsx("th",{className:"border border-black p-1 text-center w-8",children:"رقم"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"رقم الجرد"}),e.jsx("th",{className:"border border-black p-1 text-right",children:"تعيين الجهاز / المادة"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"الجرد التأسيسي"}),e.jsx("th",{className:"border border-black p-1 text-center w-24",children:"المراجعة العشرية"}),e.jsx("th",{className:"border border-black p-1 text-center w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 text-center w-28",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 text-center w-20",children:"الحالة"}),e.jsx("th",{className:"border border-black p-1 text-right w-40",children:"ملاحظات"})]})}),e.jsx("tbody",{children:P.map((t,l)=>e.jsxs("tr",{className:"border-b border-black",children:[e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:l+1}),e.jsx("td",{className:"border border-black p-1 text-center font-black",children:t.serialNumber}),e.jsx("td",{className:"border border-black p-1 text-right font-bold",children:t.name}),e.jsx("td",{className:"border border-black p-1 text-center",children:t.foundationalInventory||"—"}),e.jsx("td",{className:"border border-black p-1 text-center",children:t.decennialReview||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-bold",children:t.totalQuantity}),e.jsx("td",{className:"border border-black p-1 text-center",children:t.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-center font-semibold",children:t.status}),e.jsx("td",{className:"border border-black p-1 text-right text-[8pt]",children:t.notes||"—"})]},t.id))})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-6 text-center text-xs font-bold mt-8 pt-4 border-t-2 border-black",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"المقتصد / مسير المصالح الاقتصادية"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"مسؤول المخبر الرئيسي"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-14",children:"رئيس المؤسسة (المدير)"}),e.jsx("div",{className:"w-36 border-b border-black mx-auto"})]})]})]}):e.jsx("div",{children:at.map(t=>e.jsxs(ye.Fragment,{children:[(Q==="both"||Q==="front")&&e.jsxs("div",{className:C==="A5"?"pcard-a5":"pcard-a4",children:[G&&e.jsx("div",{className:"border-b-2 border-black pb-1 mb-1",children:e.jsxs("div",{className:"flex justify-between items-start text-[7pt] md:text-[8pt] font-bold leading-tight",children:[e.jsxs("div",{className:"text-right",children:["مديرية التربية لولاية: ",u,e.jsx("br",{}),$e(h,f),e.jsx("br",{}),"مخبر الوسائل التعليمية والعلوم"]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-black text-[8pt]",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("div",{className:"font-bold text-[7.5pt]",children:"وزارة التربية الوطنية"}),e.jsxs("div",{className:"font-bold text-[7pt] text-gray-700",children:["السنة الدراسية: ",$||"2025/2026"]})]}),e.jsxs("div",{className:"text-left text-[7pt]",children:["بطاقة الجرد رقم:",e.jsx("br",{}),e.jsx("span",{className:"font-black text-[9pt] underline",children:t.serialNumber})]})]})}),e.jsx("div",{className:"text-center my-1",children:e.jsx("div",{className:"inline-block border-2 border-black bg-gray-100 px-6 py-0.5 rounded-sm",children:e.jsx("h1",{className:"text-[11pt] font-black tracking-wide underline decoration-double",children:"بــطــاقـــة الجـــرد"})})}),e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold border border-black bg-gray-50 px-2 py-1 mb-1.5",children:[e.jsxs("div",{children:[e.jsx("span",{children:"الجرد التأسيسي لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:t.foundationalInventory||"2015-10-15"})]}),e.jsxs("div",{children:[e.jsx("span",{children:"المراجعة العشرية لسنة : "}),e.jsx("span",{className:"font-black text-[8pt] underline",children:t.decennialReview||"2025-10-15"})]})]}),e.jsxs("div",{className:"grid grid-cols-4 border-2 border-black text-center text-[7.5pt] mb-2 divide-x divide-x-reverse divide-black",children:[e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفهرس (الصنف)"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:t.name.includes("مجهر")?"أجهزة بصرية":t.name.includes("أنبوب")||t.name.includes("بيشر")?"زجاجيات مخبرية":t.name.includes("مولد")||t.name.includes("ميزان")?"أجهزة قياس وكهرباء":"أجهزة وعتاد تعليمي"})]}),e.jsxs("div",{className:"p-1",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"الفرع / الجناح"}),e.jsx("div",{className:"font-black text-[8pt] h-7 flex items-center justify-center",children:"مخبر العلوم والوسائل"})]}),e.jsxs("div",{className:"p-1 bg-yellow-50/20",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-1",children:"رقم الجرد العام"}),e.jsx("div",{className:"font-black text-[10pt] text-black h-7 flex items-center justify-center tracking-wider",children:t.serialNumber})]}),e.jsxs("div",{className:"p-1 relative",children:[e.jsx("div",{className:"font-bold text-gray-700 border-b border-black pb-0.5 mb-0.5",children:"ختم المؤسسة والتأشيرة"}),e.jsx("div",{className:"h-7 flex items-center justify-center",children:J?e.jsx(qe,{value:`DZ-EDU-INV:${t.serialNumber}:${t.name}`,size:26}):e.jsx("span",{className:"text-[6pt] text-gray-400",children:"مربع الختم"})})]})]}),e.jsxs("div",{className:"border border-black p-2 mb-2 text-[8pt] space-y-1.5 bg-white",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-black whitespace-nowrap",children:"الـتـعـيـيـن (تعيين الشيء) :"}),e.jsx("span",{className:"font-black text-[9pt] border-b border-dotted border-black flex-1 pb-0.5",children:t.name})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الـخـصـائـص والمـواصـفـات :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:t.notes||"جهاز تعليمي مخبري مطابق للمعايير البيداغوجية والتقنية المعتمدة."})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 pt-1",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الموقع / الحفظ :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:t.location||"مخبر الوسائل التعليمية - الخزانة الرئيسية"})]}),e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"font-bold whitespace-nowrap",children:"الممون / المصدر :"}),e.jsx("span",{className:"border-b border-dotted border-black flex-1 pb-0.5",children:t.supplier||"المؤسسة الوطنية للوسائل التعليمية"})]})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"text-[7.5pt] font-black mb-1 flex justify-between items-center",children:[e.jsx("span",{children:"جدول حركات الدخول والتكفل بالعتاد:"}),e.jsx("span",{className:"text-[6.5pt] font-normal text-gray-600",children:"(يسجل هنا كل استلام أو زيادة في رصيد هذا التجهيز)"})]}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7.5pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-20",children:"تاريخ الدخول"}),e.jsx("th",{className:"border border-black p-1 w-12",children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"سعر الوحدة"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"المبلغ الإجمالي"}),e.jsx("th",{className:"border border-black p-1",children:"الممون / المصدر"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"التعيين الجديد (الموقع)"}),e.jsx("th",{className:"border border-black p-1 w-20",children:"ملاحظات"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{className:"border-b border-black font-semibold",children:[e.jsx("td",{className:"border border-black p-1 font-bold",children:t.foundationalInventory||"2023-09-15"}),e.jsx("td",{className:"border border-black p-1 font-black text-[8.5pt]",children:t.totalQuantity}),e.jsx("td",{className:"border border-black p-1",children:t.price?`${t.price} دج`:"—"}),e.jsx("td",{className:"border border-black p-1 font-bold",children:t.price&&!isNaN(Number(t.price))?`${(Number(t.price)*t.totalQuantity).toLocaleString("ar-DZ")} دج`:"—"}),e.jsx("td",{className:"border border-black p-1",children:t.supplier||"—"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:"مخبر الوسائل التعليمية"}),e.jsx("td",{className:"border border-black p-1 text-[7pt]",children:t.status})]}),[...Array(C==="A4"?5:2)].map((l,a)=>e.jsxs("tr",{className:"border-b border-black h-6",children:[e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"}),e.jsx("td",{className:"border border-black p-1"})]},a))]})]})]}),ee&&e.jsxs("div",{className:`grid ${te?"grid-cols-3":"grid-cols-2"} gap-4 text-center text-[7pt] font-bold border-t border-black pt-1.5 mt-2`,children:[e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم المقتصد / مسير المصالح الاقتصادية:"}),e.jsx("div",{className:"h-9"})]}),te&&e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"الناظر (التوقيع والختم):"}),e.jsx("div",{className:"h-9"})]}),e.jsxs("div",{className:"border border-black/40 p-1 rounded-sm bg-gray-50/50",children:[e.jsx("span",{children:"تأشيرة وختم رئيس المؤسسة (المدير):"}),e.jsx("div",{className:"h-9"})]})]})]})]}),(Q==="both"||Q==="back")&&e.jsxs("div",{className:C==="A5"?"pcard-a5":"pcard-a4",children:[e.jsx("div",{className:"border-b-2 border-black pb-1 mb-2",children:e.jsxs("div",{className:"flex justify-between items-center text-[7.5pt] font-bold",children:[e.jsx("div",{children:"التكفل المستمر وحركات التعيين والإتلاف"}),e.jsxs("div",{className:"text-center font-black text-[9pt] underline",children:["بطاقة جرد رقم: ",t.serialNumber," — ",t.name]}),e.jsx("div",{children:"الجمهورية الجزائرية الديمقراطية الشعبية"})]})}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"1. التـكـفـل الـمـسـتـمـر (Prise en charge continue)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",children:"التاريخ"}),e.jsx("th",{className:"border border-black p-1",children:"اسم ولقب الموظف المسؤول"}),e.jsx("th",{className:"border border-black p-1 w-28",children:"الصفة / الوظيفة"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"إمضاء المعني"}),e.jsx("th",{className:"border border-black p-1 w-24",children:"تأشيرة المقتصد"})]})}),e.jsx("tbody",{children:[...Array(C==="A4"?6:4)].map((l,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsxs("div",{className:"mb-2",children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"2. تـغـيـيـر الـتـعـيـيـن (Changement d'affectation)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم الجرد الجديد"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"التعيين الجديد (المخبر / القاعة)"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"العون المسؤول"})]})]}),e.jsx("tbody",{children:[...Array(C==="A4"?4:2)].map((l,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"bg-gray-100 border border-black px-2 py-0.5 font-black text-[7.5pt] mb-1",children:"3. الإسـقـاط والإتـلاف والخـروج (Réforme / Sortie / Décharge)"}),e.jsxs("table",{className:"w-full border-collapse border border-black text-[7pt] text-center",children:[e.jsxs("thead",{children:[e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-1 w-24",rowSpan:2,children:"تاريخ القرار / السند"}),e.jsx("th",{className:"border border-black p-1 w-14",rowSpan:2,children:"الكمية"}),e.jsx("th",{className:"border border-black p-1",rowSpan:2,children:"سبب الخروج أو الإتلاف (كسر / تقادم)"}),e.jsx("th",{className:"border border-black p-1 w-28",rowSpan:2,children:"رقم محضر الإسقاط"}),e.jsx("th",{className:"border border-black p-0.5",colSpan:2,children:"الإمضاء والتأشيرة"})]}),e.jsxs("tr",{className:"bg-gray-50 font-bold border-b border-black",children:[e.jsx("th",{className:"border border-black p-0.5 w-20",children:"المقتصد"}),e.jsx("th",{className:"border border-black p-0.5 w-20",children:"رئيس المؤسسة"})]})]}),e.jsx("tbody",{children:[...Array(C==="A4"?3:2)].map((l,a)=>e.jsxs("tr",{className:"border-b border-black h-5",children:[e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"}),e.jsx("td",{className:"border border-black"})]},a))})]})]}),e.jsx("div",{className:"text-[6.5pt] text-gray-700 italic border-t border-black pt-1 mt-2 text-center",children:"هذه البطاقة وثيقة محاسبية وإدارية رسمية تابعة للجرد الدائم للوسائل التعليمية، وتحفظ في ملف الجرد بمصلحة الاقتصاد والمخبر."})]})]})]},t.id))})]}),e.jsxs("div",{className:"max-w-7xl mx-auto p-4 md:p-8 bg-surface shadow-2xl rounded-[40px] my-8 font-sans transition-all duration-500 no-print",dir:c.language==="ar"?"rtl":"ltr",children:[e.jsxs("div",{className:"border-b-4 border-double border-primary/20 pb-8 mb-10",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start gap-8 text-sm font-bold text-on-surface/80",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),r("inventory_cards.directorate_label","مديرية التربية لولاية:")," ",u]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"w-1.5 h-1.5 bg-primary rounded-full"}),$e(h,f)]})]}),e.jsxs("div",{className:"text-center space-y-2 flex-1",children:[e.jsx("div",{className:"flex justify-center mb-4",children:e.jsx("img",{src:Ke,alt:"Ministry Logo",className:"h-20 w-auto object-contain"})}),e.jsx("p",{className:"text-xl font-black text-primary tracking-tight",children:"الجمهورية الجزائرية الديمقراطية الشعبية"}),e.jsx("p",{className:"text-lg font-bold",children:"وزارة التربية الوطنية"})]}),e.jsx("div",{className:"space-y-2 text-start md:text-end",children:e.jsxs("p",{className:"bg-primary/5 px-4 py-1.5 rounded-full inline-block",children:[r("inventory_cards.academic_year","السنة الدراسية:")," ",e.jsx("span",{className:"font-black",children:$||"2025/2026"})]})})]}),e.jsxs("div",{className:"mt-12 text-center relative",children:[e.jsx("div",{className:"absolute inset-0 flex items-center","aria-hidden":"true",children:e.jsx("div",{className:"w-full border-t border-primary/10"})}),e.jsx("h2",{className:"relative inline-block bg-surface px-8 text-3xl font-black text-primary tracking-tighter decoration-primary decoration-4 underline-offset-8",children:r("inventory_cards.registry_title","سجل بطاقات الجرد - مخبر الوسائل التعليمية")})]})]}),e.jsxs("div",{className:"flex flex-wrap justify-between items-center gap-4 mb-6 no-print",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsxs("button",{onClick:()=>le(bt.EQUIPMENT),className:"group flex items-center gap-2 px-5 py-3.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer",children:[e.jsx(Nt,{size:18,className:"group-hover:rotate-90 transition-transform duration-300"}),r("inventory_cards.btn_add_equipment","إضافة تجهيز")]}),e.jsxs("button",{onClick:()=>ue(t=>!t),className:w("group flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-black shadow-lg transition-all text-sm cursor-pointer border-2",B?"bg-amber-600 text-white border-amber-500 shadow-amber-600/30 scale-[1.02]":"bg-surface-container-high hover:bg-surface-container-highest text-primary border-primary/20 hover:border-primary/40 shadow-sm"),title:"فتح وإغلاق لوحة خيارات وإعدادات الطباعة الرسمية",children:[e.jsx(Fe,{size:18,className:w("transition-transform duration-300",B&&"rotate-90")}),e.jsx("span",{children:"خيارات الطباعة"}),e.jsxs("span",{className:w("text-[10px] px-2 py-0.5 rounded-full font-bold",B?"bg-white/25 text-white":"bg-primary/10 text-primary"),children:[C," • ",z==="color"?"ملون":z==="grayscale"?"رمادي":"أبيض/أسود"]}),e.jsx(He,{size:14,className:w("transition-transform duration-300",B&&"rotate-180")})]}),e.jsxs("button",{onClick:ve,className:"flex items-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer",title:"معاينة نموذج البطاقة وتنسيقها في نافذة مخصصة",children:[e.jsx(Ee,{size:18}),e.jsx("span",{children:"معاينة نموذج الطباعة"})]}),e.jsxs("button",{onClick:()=>E(I),disabled:H,className:"flex items-center gap-2 px-5 py-3.5 bg-secondary hover:bg-secondary-dim text-white rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-50",title:"طباعة بطاقات الجرد مباشرة بالإعدادات المحددة",children:[H?e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}):e.jsx(me,{size:18}),e.jsx("span",{children:r("inventory_cards.btn_print_cards","طباعة بطاقات الجرد")})]}),e.jsxs("button",{onClick:s,className:"flex items-center gap-2 px-4 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-2xl font-black shadow-sm transition-all text-xs cursor-pointer",title:"طباعة استمارة بطاقة جرد فارغة للملء اليدوي",children:[e.jsx(Je,{size:16}),e.jsx("span",{children:"استمارة فارغة"})]}),e.jsxs("button",{onClick:d,className:"flex items-center gap-2 px-4 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl font-black shadow transition-all text-xs cursor-pointer",title:"معاينة وطباعة السجل الإجمالي كجدول رسمي A4 أفقي",children:[e.jsx(Ne,{size:16}),e.jsx("span",{children:"السجل كجدول"})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-3 flex-1 max-w-xl justify-end",children:[e.jsxs("div",{className:"flex items-center gap-1.5 bg-surface-container-low px-3 py-2 rounded-2xl border border-primary/20 shadow-inner",title:"فرز وتنسيق سجل بطاقات الجرد حسب رقم الجرد، التسمية، الجرد التأسيسي، أو الكمية",children:[e.jsx(wt,{size:16,className:"text-primary shrink-0"}),e.jsxs("select",{className:"bg-transparent border-none text-xs font-black text-primary focus:ring-0 cursor-pointer py-1",value:`${b}_${M}`,onChange:t=>{const l=t.target.value,[a,x]=l.split("_");ge(a),je(x)},children:[e.jsx("option",{value:"serialNumber_asc",children:"الترتيب: رقم الجرد (تصاعدي 1 ← 99)"}),e.jsx("option",{value:"serialNumber_desc",children:"الترتيب: رقم الجرد (تنازلي 99 ← 1)"}),e.jsx("option",{value:"name_asc",children:"الترتيب: التسمية (أبجدياً أ ← ي)"}),e.jsx("option",{value:"name_desc",children:"الترتيب: التسمية (أبجدياً ي ← أ)"}),e.jsx("option",{value:"foundationalInventory_desc",children:"الترتيب: الجرد التأسيسي (الأحدث أولاً)"}),e.jsx("option",{value:"foundationalInventory_asc",children:"الترتيب: الجرد التأسيسي (الأقدم أولاً)"}),e.jsx("option",{value:"totalQuantity_desc",children:"الترتيب: الكمية (من الأكبر إلى الأصغر)"}),e.jsx("option",{value:"totalQuantity_asc",children:"الترتيب: الكمية (من الأصغر إلى الأكبر)"}),e.jsx("option",{value:"supplier_asc",children:"الترتيب: الممون"}),e.jsx("option",{value:"status_asc",children:"الترتيب: الحالة الوظيفية"})]})]}),e.jsxs("div",{className:"relative flex-1 min-w-[220px] max-w-sm group",children:[e.jsx(kt,{className:w("absolute top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors",c.language==="ar"?"right-5":"left-5"),size:18}),e.jsx("input",{type:"text",placeholder:r("inventory_cards.search_placeholder","بحث في السجل بالرقم أو التعيين أو الممون..."),className:w("w-full py-3.5 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface rounded-2xl font-bold text-xs md:text-sm shadow-inner transition-all outline-none",c.language==="ar"?"pr-12 pl-4":"pl-12 pr-4"),value:A,onChange:t=>g(t.target.value)})]})]})]}),e.jsx(ze,{children:B&&e.jsx(_e.div,{initial:{opacity:0,height:0,y:-10},animate:{opacity:1,height:"auto",y:0},exit:{opacity:0,height:0,y:-10},transition:{duration:.25},className:"overflow-hidden mb-8 no-print",children:e.jsxs("div",{className:"bg-gradient-to-br from-surface-container-low to-surface-container p-5 md:p-6 rounded-3xl border-2 border-amber-500/30 shadow-xl space-y-6",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline/10",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/25",children:e.jsx(Fe,{size:20})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-black text-primary flex items-center gap-2",children:[e.jsx("span",{children:"لوحة خيارات وإعدادات طباعة بطاقات وسجل الجرد"}),e.jsx("span",{className:"text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30",children:"النموذج الجزائري الرسمي المعتمد"})]}),e.jsx("p",{className:"text-xs text-on-surface/60 font-medium mt-0.5",children:"تخصيص كامل للمقاس، الأوجه، الترويسة، الأختام، نمط الألوان والتوفير الاقتصادي للحبر"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:k,className:"px-3.5 py-2 rounded-xl text-xs font-black bg-surface hover:bg-surface-container text-primary border border-primary/20 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer",title:"فتح إعدادات الطباعة العامة للمؤسسة والشعار",children:[e.jsx(St,{size:14}),e.jsx("span",{children:"إعدادات المؤسسة والشعار"})]}),e.jsx("button",{type:"button",onClick:()=>ue(!1),className:"p-2 rounded-xl text-on-surface/50 hover:text-on-surface hover:bg-surface transition-colors cursor-pointer",title:"إخفاء لوحة خيارات الطباعة",children:e.jsx(tt,{size:18})})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Xe,{size:14}),e.jsx("span",{children:"1. نطاق البطاقات المراد طباعتها:"})]}),e.jsxs("span",{className:"text-[10px] font-mono font-bold text-on-surface/60",children:[m.length," تجهيز"]})]}),e.jsx("div",{className:"space-y-1.5",children:[{id:"all",label:`جميع البطاقات (${_.length})`,icon:Re},{id:"table",label:"سجل الجرد العام كجدول رسمي A4",icon:Ne},{id:"single",label:"بطاقة تجهيز مفردة",icon:Le}].map(t=>e.jsxs("button",{type:"button",onClick:()=>{ie(t.id),t.id==="table"&&he("A4"),t.id==="single"&&!D&&m[0]&&be(m[0].id)},className:w("w-full p-2.5 rounded-xl text-right text-xs font-black border transition-all flex items-center justify-between cursor-pointer",I===t.id?"bg-primary text-white border-primary shadow-xs":"bg-surface-container-low hover:bg-surface-container text-on-surface/80 border-transparent"),children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(t.icon,{size:14}),e.jsx("span",{children:t.label})]}),I===t.id&&e.jsx(Te,{size:14})]},t.id))}),I==="single"&&e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-on-surface/70 block",children:"اختر التجهيز للطباعة:"}),e.jsx("select",{value:D||((Be=m[0])==null?void 0:Be.id)||"",onChange:t=>{be(t.target.value);const l=m.find(a=>a.id===t.target.value);l&&S(l)},className:"w-full p-2 bg-surface-container-low rounded-xl border border-outline/15 text-xs font-bold outline-none focus:border-primary cursor-pointer",children:m.map((t,l)=>e.jsxs("option",{value:t.id,children:[t.serialNumber," — ",t.name]},t.id||l))})]}),e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70 block",children:"تصفية التجهيزات حسب الحالة:"}),e.jsx("div",{className:"grid grid-cols-2 gap-1 text-[10px]",children:[{id:"all",label:"الكل"},{id:"functional",label:"جيدة فقط"},{id:"maintenance",label:"صيانة"},{id:"broken",label:"عاطلة / مفقودة"}].map(t=>e.jsx("button",{type:"button",onClick:()=>ke(t.id),className:w("py-1.5 px-2 rounded-lg font-bold border transition-all text-center cursor-pointer",U===t.id?"bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/60"),children:t.label},t.id))})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Le,{size:14}),e.jsx("span",{children:"2. مقاس الورق والتخطيط:"})]}),e.jsx("div",{className:"space-y-2",children:[{id:"A5",label:"A5 قياسي (148×210 mm)",desc:"النموذج الوزاري المعتمد لكل بطاقة"},{id:"A4",label:"A4 كامل (210×297 mm)",desc:"صفحة كاملة لكل بطاقة بخط كبير"},{id:"A4_DUAL",label:"A4 مزدوج (بطاقتان في الورقة)",desc:"يوفر 50% من الورق مع خط قص منقط"}].map(t=>e.jsxs("button",{type:"button",onClick:()=>he(t.id),className:w("w-full p-2.5 rounded-xl text-right border transition-all cursor-pointer",C===t.id?"bg-primary/10 border-primary text-primary shadow-xs":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/80"),children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-black",children:t.label}),C===t.id&&e.jsx(Te,{size:14})]}),e.jsx("p",{className:"text-[10px] text-on-surface/50 font-medium mt-0.5",children:t.desc})]},t.id))}),I!=="table"&&e.jsxs("div",{className:"pt-2 border-t border-outline/10 space-y-1.5",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70 block",children:"أوجه الطباعة:"}),e.jsx("div",{className:"grid grid-cols-3 gap-1",children:[{id:"both",label:"الوجهان"},{id:"front",label:"أمامي"},{id:"back",label:"خلفي"}].map(t=>e.jsx("button",{type:"button",onClick:()=>Z(t.id),className:w("py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",Q===t.id?"bg-primary text-white border-primary":"bg-surface-container-low border-transparent text-on-surface/70 hover:bg-surface-container"),children:t.label},t.id))})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx(Ct,{size:14}),e.jsx("span",{children:"3. نمط الألوان واستهلاك الحبر:"})]}),e.jsx("div",{className:"space-y-2",children:[{id:"color",label:"ملون رسمي",desc:"ألوان متناسقة للوثائق الرسمية المميزة",badge:"عالي الجودة"},{id:"grayscale",label:"تدرج رمادي لتوفير الحبر",desc:"خلفيات رمادية ونصوص سوداء حادة لتوفير مسحوق الحبر",badge:"اقتصادي (Eco)"},{id:"bw",label:"أبيض وأسود للنسخ",desc:"أبيض وأسود عالي التباين مناسب لآلات النسخ والفاكس",badge:"نسخ سريع"}].map(t=>e.jsxs("button",{type:"button",onClick:()=>de(t.id),className:w("w-full p-2.5 rounded-xl text-right border transition-all cursor-pointer",z===t.id?"bg-amber-500/15 border-amber-600 text-amber-900 dark:text-amber-200 shadow-xs":"bg-surface-container-low hover:bg-surface-container border-transparent text-on-surface/80"),children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-black",children:t.label}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-surface border border-outline/10 font-bold",children:t.badge})]}),e.jsx("p",{className:"text-[10px] text-on-surface/50 font-medium mt-0.5",children:t.desc})]},t.id))}),e.jsxs("div",{className:"pt-2 border-t border-outline/10 flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-black text-on-surface/70",children:"عدد النسخ:"}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("button",{type:"button",onClick:()=>ae(t=>Math.max(1,t-1)),className:"w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline/15 font-black text-xs cursor-pointer flex items-center justify-center",children:"-"}),e.jsx("span",{className:"w-8 text-center font-mono font-black text-xs",children:ce}),e.jsx("button",{type:"button",onClick:()=>ae(t=>t+1),className:"w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline/15 font-black text-xs cursor-pointer flex items-center justify-center",children:"+"})]})]})]}),e.jsxs("div",{className:"p-4 bg-surface rounded-2xl border border-outline/10 space-y-3",children:[e.jsxs("span",{className:"text-xs font-black text-primary flex items-center gap-1.5",children:[e.jsx($t,{size:14}),e.jsx("span",{children:"4. عناصر التوثيق والأختام الرسمية:"})]}),e.jsxs("div",{className:"space-y-2 text-xs font-bold text-on-surface/80",children:[e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsx("span",{children:"الترويسة الرسمية للجمهورية"}),e.jsx("input",{type:"checkbox",checked:G,onChange:t=>oe(t.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(rt,{size:13,className:"text-primary"}),e.jsx("span",{children:"رمز الاستجابة السريعة (QR)"})]}),e.jsx("input",{type:"checkbox",checked:J,onChange:t=>Ie(t.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer",children:[e.jsx("span",{children:"خانات التأشيرات والأختام الرسمية"}),e.jsx("input",{type:"checkbox",checked:ee,onChange:t=>De(t.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]}),ee&&e.jsxs("label",{className:"flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary transition-colors cursor-pointer",children:[e.jsx("span",{children:"خانة الناظر (التوقيع والختم)"}),e.jsx("input",{type:"checkbox",checked:te,onChange:t=>Pe(t.target.checked),className:"rounded text-primary focus:ring-primary h-4 w-4"})]})]})]})]}),e.jsxs("div",{className:"pt-4 border-t border-outline/10 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("button",{type:"button",onClick:()=>{se(0),F(!0)},className:"px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer",children:[e.jsx(Ee,{size:15}),e.jsx("span",{children:"معاينة وتنسيق نموذج الطباعة"})]}),e.jsxs("button",{type:"button",onClick:()=>E(I),disabled:H,className:"px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-black text-xs shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50",children:[H?e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}):e.jsx(me,{size:15}),e.jsx("span",{children:"طباعة فورية بالإعدادات الحالية"})]}),e.jsxs("button",{type:"button",onClick:d,className:"px-4 py-2.5 rounded-xl bg-surface text-on-surface border border-outline/20 font-black text-xs hover:bg-surface-container hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",title:"معاينة وطباعة السجل كجدول رسمي A4 أفقي",children:[e.jsx(Ne,{size:15}),e.jsx("span",{children:"معاينة السجل الموحدة"})]}),e.jsxs("button",{type:"button",onClick:V,className:"px-4 py-2.5 rounded-xl bg-surface text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 font-black text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",title:"تصدير بيانات السجل إلى ملف Excel",children:[e.jsx(et,{size:15}),e.jsx("span",{children:"تصدير Excel"})]})]}),e.jsxs("div",{className:"text-xs font-bold text-on-surface/50",children:["جاهز للطباعة: ",m.length," تجهيز • مقاس ",C," • ",z==="color"?"ملون":z==="grayscale"?"تدرج رمادي":"أبيض/أسود"]})]})]})})}),e.jsx("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 no-print",children:[{label:r("inventory_cards.stat_total","إجمالي بطاقات الجرد"),value:xe.total,color:"border-primary",icon:Re},{label:r("inventory_cards.stat_good","في حالة جيدة"),value:xe.good,color:"border-success",icon:Me},{label:r("inventory_cards.stat_maintenance","تحتاج صيانة"),value:xe.maintenance,color:"border-warning",icon:Me},{label:r("inventory_cards.stat_broken","عاطلة / مفقودة"),value:xe.broken,color:"border-error",icon:zt}].map((t,l)=>e.jsxs("div",{className:w("p-5 bg-surface-container-low rounded-3xl border-t-4 shadow-sm hover:shadow transition-all",t.color),children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx(t.icon,{size:20,className:"text-on-surface/40"}),e.jsx("div",{className:"text-2xl font-black text-on-surface",children:t.value})]}),e.jsx("div",{className:"text-xs font-black text-on-surface/60",children:t.label})]},l))}),e.jsx("div",{className:"overflow-x-auto rounded-3xl border border-primary/10 shadow-sm",children:e.jsxs("table",{className:"w-full border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-primary text-white",children:[e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[50px] cursor-pointer group transition-colors",b==="index"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("index"),title:"الترتيب حسب الرقم التسلسلي",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_index","رقم"),e.jsx(K,{field:"index"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-[130px] transition-colors",b==="serialNumber"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("serialNumber"),title:"انقر للترتيب حسب رقم الجرد (1 ← 99 / 99 ← 1)",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_serial","رقم الجرد"),e.jsx(K,{field:"serialNumber"})]})}),e.jsx("th",{className:w("p-4 font-black text-xs uppercase tracking-widest border-l border-white/10 w-[24%] text-center cursor-pointer group transition-colors",b==="name"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("name"),title:"انقر للترتيب أبجدياً حسب تعيين الشيء (أ ← ي / ي ← أ)",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_name","تعيين الشيء"),e.jsx(K,{field:"name"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group transition-colors",b==="foundationalInventory"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("foundationalInventory"),title:"انقر للترتيب حسب تاريخ الجرد التأسيسي (الأحدث أولاً / الأقدم)",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_foundational","الجرد التأسيسي"),e.jsx(K,{field:"foundationalInventory"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group transition-colors",b==="decennialReview"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("decennialReview"),title:"انقر للترتيب حسب المراجعة العشرية",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_decennial","المراجعة العشرية"),e.jsx(K,{field:"decennialReview"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-20 transition-colors",b==="totalQuantity"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("totalQuantity"),title:"انقر للترتيب حسب الكمية (من الأكبر إلى الأصغر / من الأصغر إلى الأكبر)",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_quantity","الكمية"),e.jsx(K,{field:"totalQuantity"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group transition-colors",b==="supplier"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("supplier"),title:"انقر للترتيب حسب الممون",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_supplier","الممون"),e.jsx(K,{field:"supplier"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 cursor-pointer group w-24 transition-colors",b==="status"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("status"),title:"انقر للترتيب حسب الحالة الوظيفية",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_status","الحالة"),e.jsx(K,{field:"status"})]})}),e.jsx("th",{className:w("p-4 text-center font-black text-xs uppercase tracking-widest border-l border-white/10 w-[14%] cursor-pointer group transition-colors",b==="notes"?"bg-white/15 text-amber-200":"hover:bg-white/10"),onClick:()=>j("notes"),title:"انقر للترتيب حسب الملاحظات",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r("inventory_cards.col_notes","ملاحظات"),e.jsx(K,{field:"notes"})]})}),e.jsx("th",{className:"p-4 text-center font-black text-xs uppercase tracking-widest no-print w-[120px]",children:r("common.actions","إجراءات الطباعة")})]})}),e.jsx("tbody",{children:e.jsx(ze,{mode:"popLayout",children:P.map((t,l)=>e.jsxs(_e.tr,{initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.98},transition:{duration:.15,delay:l*.015},className:"border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group",children:[e.jsx("td",{className:"p-3 text-center font-bold text-xs text-on-surface/40 border-l border-primary/5",children:l+1}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all underline decoration-dotted decoration-primary/20",value:t.serialNumber,onChange:a=>q(t.id,"serialNumber",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all decoration-primary/20",value:t.name,onChange:a=>q(t.id,"name",a.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"الجرد التأسيسي",value:t.foundationalInventory,onChange:a=>q(t.id,"foundationalInventory",a.target.value)})}),e.jsx("td",{className:"p-3 text-center text-xs font-bold border-l border-primary/5 whitespace-nowrap",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none text-center font-bold text-xs",placeholder:"المراجعة العشرية",value:t.decennialReview,onChange:a=>q(t.id,"decennialReview",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"number",className:"w-14 bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1 font-bold text-xs text-center transition-all",value:t.totalQuantity,onChange:a=>q(t.id,"totalQuantity",parseInt(a.target.value)||0)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs text-center transition-all",value:t.supplier,onChange:a=>q(t.id,"supplier",a.target.value)})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsxs("select",{className:"bg-transparent border-none focus:outline-none font-bold text-xs p-1 rounded-lg cursor-pointer",value:t.status,onChange:a=>q(t.id,"status",a.target.value),children:[e.jsx("option",{value:"جيدة",children:r("equipment.status_functional","جيدة")}),e.jsx("option",{value:"تحتاج صيانة",children:r("equipment.status_maintenance","تحتاج صيانة")}),e.jsx("option",{value:"عاطلة",children:r("equipment.status_broken","عاطلة")}),e.jsx("option",{value:"في الإصلاح",children:r("equipment.status_repair","في الإصلاح")}),e.jsx("option",{value:"مفقودة",children:r("equipment.status_missing","مفقودة")})]})}),e.jsx("td",{className:"p-3 border-l border-primary/5",children:e.jsx("input",{type:"text",className:"w-full bg-transparent border-none focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 rounded px-1.5 font-bold text-xs transition-all",value:t.notes,onChange:a=>q(t.id,"notes",a.target.value)})}),e.jsx("td",{className:"p-3 text-center no-print",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>Oe(t),title:"معاينة وتنسيق نموذج هذه البطاقة",className:"p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400 cursor-pointer",children:e.jsx(Ee,{size:15})}),e.jsx("button",{onClick:()=>E("single",t),title:r("inventory_cards.print_individual","طباعة فورية لبطاقة هذا التجهيز"),className:"p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 hover:border-primary/40 cursor-pointer",children:e.jsx(me,{size:15})})]})})]},t.id))})})]})}),e.jsxs("div",{className:"mt-8 flex flex-wrap justify-between items-center text-xs font-black text-on-surface/40 no-print gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Re,{size:16}),r("inventory_cards.item_count","عدد التجهيزات في السجل: {{count}} من أصل {{total}}",{count:m.length,total:_.length})]}),e.jsx("div",{className:"italic text-[11pt] text-gray-500",children:r("inventory_cards.official_notice","هذا السجل ونماذج بطاقات الجرد تعتبر وثائق رسمية لجرد الوسائل التعليمية المعتمدة")})]})]}),e.jsx(Lt,{isOpen:v,onClose:()=>F(!1),items:m,initialItem:D&&m.find(t=>t.id===D)||o,initialScope:I,initialMode:R,initialPaperFormat:C,initialPrintSides:Q,initialColorMode:z,initialIncludeHeader:G,initialIncludeQr:J,initialIncludeStamp:ee,initialIncludeSupervisorStamp:te,initialCopies:ce,schoolInfo:{directorate:u||"مديرية التربية لولاية أم البواقي",schoolName:h||"متوسطة قطاف الطاهر",commune:f||"عين كرشة",academicYear:$||"2025/2026"}})]})}export{Wt as default};
