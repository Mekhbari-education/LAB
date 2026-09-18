const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./chemicals-CCSMwdmg.js","./client-DUUftx-B.js","./index-C7MMdS2n.js","./index-C6Cm5LKs.css"])))=>i.map(i=>d[i]);
import{b as lt,j as e,l as xe,m as H,X as Be,k as pe,c as j,at as Fe,u as ot,aj as ct,r as b,x as dt,al as Q,a7 as _e,a8 as De,a9 as Ee,h as Ae,O as de,ap as pt,am as X,an as Je,N as mt,b3 as Oe,aq as xt,ar as Qe,i as $e,w as Xe,ah as ht,y as ut,S as bt,K as Me,T as Ke,n as ft}from"./index-C7MMdS2n.js";import{Q as gt}from"./QRScanner-AK9N3qpQ.js";import{R as yt}from"./rotate-ccw-BXVoXqQb.js";import{u as vt}from"./index-Cp_GAzHZ.js";import{u as wt}from"./useSqlCollection-Cq7bRTm2.js";import{P as jt}from"./pdfService-Q3Kldc6L.js";import{C as Nt}from"./chevron-up-CJBKBRo_.js";import{D as We}from"./download-BZiuH2sc.js";import{P as kt}from"./plus-SfgIUMkX.js";import{F as St}from"./funnel-BlDSvfTC.js";import{S as Ct}from"./square-pen-BTsiqfXf.js";import"./client-DUUftx-B.js";import"./jspdf.plugin.autotable-BkXDWLpD.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zt=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]],Ze=lt("wand-sparkles",zt);function _t({isOpen:z,onClose:a,onSubmit:p,onSmartFill:g,isGenerating:_,newChemical:x,editingChemical:q,onChange:f}){var R;return z?e.jsx(xe,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:a,className:"absolute inset-0 bg-primary/20 backdrop-blur-sm"}),e.jsxs(H.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5 relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8"}),e.jsxs("div",{className:"relative z-10 flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(Ze,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:q?"تعديل بيانات المادة":"إضافة مادة كيميائية جديدة"})]}),e.jsx("button",{onClick:a,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(Be,{size:24})})]}),e.jsxs("form",{onSubmit:p,className:"p-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsxs("div",{className:"md:col-span-2 flex items-end gap-4",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"PRODUIT CHIMIQUE"}),e.jsx("input",{required:!0,className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.nameEn||"",onChange:i=>f("nameEn",i.target.value)})]}),e.jsxs("button",{type:"button",onClick:g,disabled:_,className:"bg-primary-container text-primary px-6 py-4 rounded-2xl flex items-center gap-2 font-black hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50 h-[58px]",title:"تعبئة ذكية للمعلومات",children:[_?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(Ze,{size:20}),e.jsx("span",{className:"hidden md:inline",children:"تعبئة ذكية"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الاسم العربي"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.nameAr||"",onChange:i=>f("nameAr",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الصيغة الكيميائية"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.formula||"",onChange:i=>f("formula",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"رقم CAS"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.casNumber||"",onChange:i=>f("casNumber",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"درجة حرارة التخزين"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.storageTemp||"",onChange:i=>f("storageTemp",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الحالة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer",value:x.state||"solid",onChange:i=>f("state",i.target.value),children:[e.jsx("option",{value:"solid",children:"صلب (Solid)"}),e.jsx("option",{value:"liquid",children:"سائل (Liquid)"}),e.jsx("option",{value:"gas",children:"غاز (Gas)"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الكمية"}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("input",{type:"number",required:!0,className:"flex-1 bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.quantity||0,onChange:i=>f("quantity",Number(i.target.value))}),e.jsxs("select",{className:"bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer",value:x.unit||"g",onChange:i=>f("unit",i.target.value),children:[e.jsx("option",{value:"g",children:"g"}),e.jsx("option",{value:"kg",children:"kg"}),e.jsx("option",{value:"ml",children:"ml"}),e.jsx("option",{value:"L",children:"L"}),e.jsx("option",{value:"unit",children:"Unit"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"تصنيف الخطورة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer",value:x.hazardClass||"safe",onChange:i=>f("hazardClass",i.target.value),children:[e.jsx("option",{value:"safe",children:"آمن"}),e.jsx("option",{value:"danger",children:"خطر"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"GHS (فواصل بين الرموز)"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",placeholder:"GHS01, GHS02...",value:((R=x.ghs)==null?void 0:R.join(", "))||"",onChange:i=>f("ghs",i.target.value.split(",").map(M=>M.trim()).filter(Boolean))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الرف"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.shelf||"",onChange:i=>f("shelf",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"الصلاحية ⚠"}),e.jsx("input",{type:"date",className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:x.expiryDate||"",onChange:i=>f("expiryDate",i.target.value)})]}),e.jsxs("div",{className:"md:col-span-2 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest mr-2",children:"ملاحظات"}),e.jsx("textarea",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold min-h-[100px]",value:x.notes||"",onChange:i=>f("notes",i.target.value)})]}),e.jsx("div",{className:"md:col-span-2 pt-6",children:e.jsx("button",{type:"submit",className:"w-full bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:q?"حفظ التعديلات":"تأكيد إضافة المادة للمخزن"})})]})]})]})}):null}function Dt({isOpen:z,chemicalsLength:a,onClose:p,onConfirm:g}){return z?e.jsx(xe,{children:e.jsxs("div",{className:"fixed inset-0 z-[100] flex items-center justify-center p-6",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:p,className:"absolute inset-0 bg-black/60 backdrop-blur-sm"}),e.jsxs(H.div,{initial:{opacity:0,scale:.9,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9,y:20},className:"relative bg-surface-container-lowest rounded-[32px] p-10 max-w-md w-full shadow-2xl border border-outline/10 text-right",children:[e.jsx("div",{className:"w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8",children:e.jsx(pe,{size:40,className:"text-primary"})}),e.jsx("h3",{className:"text-3xl font-black text-primary mb-4 tracking-tight",children:"تحديث ذكي شامل"}),e.jsxs("p",{className:"text-secondary/80 text-lg leading-relaxed mb-10",children:["هل أنت متأكد من رغبتك في تحديث معلومات ",e.jsx("span",{className:"font-black text-primary",children:a})," مادة ذكياً؟",e.jsx("br",{}),e.jsx("br",{}),"قد تستغرق هذه العملية بعض الوقت. سيتم تحديث البيانات تلقائياً بناءً على اقتراحات الذكاء الاصطناعي."]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:g,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:"بدء التحديث"}),e.jsx("button",{onClick:p,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95",children:"إلغاء"})]})]})]})}):null}function Et({isOpen:z,suggestedUpdate:a,selectedChemical:p,onClose:g,onApprove:_}){return!z||!a||!p?null:e.jsx(xe,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:g,className:"absolute inset-0 bg-primary/20 backdrop-blur-xl"}),e.jsxs(H.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(pe,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:"مراجعة التحديث الذكي"})]}),e.jsx("button",{onClick:g,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(Be,{size:24})})]}),e.jsxs("div",{className:"p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsx("p",{className:"text-secondary/80 font-bold text-center bg-surface-container-low p-4 rounded-2xl border border-outline/5",children:"تم العثور على معلومات أكثر دقة لهذه المادة. يرجى مراجعة التغييرات المقترحة أدناه قبل الموافقة."}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-secondary/40 uppercase tracking-widest border-b border-outline/5 pb-2",children:"المعلومات الحالية"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-secondary",children:[p.nameEn," / ",p.nameAr]})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-secondary",children:p.formula})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-secondary",children:p.casNumber||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-secondary",children:p.storageTemp||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-secondary",children:p.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-secondary/60",children:p.notes||"لا توجد"})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2",children:"المعلومات المقترحة ✨"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.nameEn!==p.nameEn||a.nameAr!==p.nameAr?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-primary",children:[a.nameEn," / ",a.nameAr]})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.formula!==p.formula?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-primary",children:a.formula})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.casNumber!==p.casNumber?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-primary",children:a.casNumber})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.storageTemp!==p.storageTemp?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-primary",children:a.storageTemp})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.hazardClass!==p.hazardClass?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-primary",children:a.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",a.notes!==p.notes?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-primary/80",children:a.notes})]})]})]})]})]}),e.jsxs("div",{className:"p-10 bg-surface-container-low border-t border-outline/5 flex gap-4",children:[e.jsxs("button",{onClick:_,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(Fe,{size:24}),"موافقة وتحديث البيانات"]}),e.jsxs("button",{onClick:g,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(yt,{size:24}),"إلغاء التغييرات"]})]})]})]})})}const ee={GHS01:"/ghs/GHS01.png",GHS02:"/ghs/GHS02.png",GHS03:"/ghs/GHS03.png",GHS04:"/ghs/GHS04.png",GHS05:"/ghs/GHS05.png",GHS06:"/ghs/GHS06.png",GHS07:"/ghs/GHS07.png",GHS08:"/ghs/GHS08.png",GHS09:"/ghs/GHS09.png"},me={GHS01:"متفجرات",GHS02:"قابل للاشتعال",GHS03:"مؤكسد",GHS04:"غاز تحت الضغط",GHS05:"أكال / مسبب للتآكل",GHS06:"سمية حادة (قاتل)",GHS07:"تهيج / تحسس / خطر",GHS08:"خطر صحي جسيم",GHS09:"خطر بيئي"};function At(z=!1){const{schoolId:a,schoolName:p,directorate:g}=ot(),[_]=ct(),[x,q]=b.useState([]),[f,R]=b.useState(!0),[i,M]=b.useState(""),[he,K]=b.useState(_.get("filter")==="low"),[k,I]=b.useState(null),[ue,te]=b.useState(!1),[T,ae]=b.useState(null),re=b.useRef(null),[be,W]=b.useState(!1),[A,F]=b.useState(!1),[Ie,se]=b.useState(!1),[Te,fe]=b.useState(!1),[ie,Z]=b.useState({current:0,total:0}),[B,G]=b.useState([]),[N,ne]=b.useState(null),[ge,le]=b.useState(!1),[v,ye]=b.useState(null),[Le,Pe]=b.useState(!1),ve=t=>{if(!t)return"غير محدد";if(!t.includes("-"))return t;const[r,s,l]=t.split("-");return!r||!s||!l?t:`${l}/${s}/${r}`},[L,V]=b.useState({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""}),{data:$,loading:D,error:He}=wt("chemicals","/api/db/chemicals");b.useEffect(()=>{if(!D){q($),R(!1);const t=_.get("id");if(t){let r=t;t.startsWith("APP_ID_")&&(r=t.split("_").slice(2,-1).join("_")),M(r);const s=$.find(l=>l.id===t||l.id===r);s?I(s):$.length>0&&!k&&I($[0])}else $.length>0&&!k&&I($[0])}},[$,D,_]);const qe=async t=>{t.preventDefault();try{if(T){const{id:r}=T,{updateChemical:s}=await Q(async()=>{const{updateChemical:l}=await import("./chemicals-CCSMwdmg.js");return{updateChemical:l}},__vite__mapDeps([0,1,2,3]),import.meta.url);await s(r,L),await _e(a,De.UPDATE,Ee.CHEMICALS,`تعديل بيانات المادة: ${L.nameAr}`,r)}else{const{createChemical:r}=await Q(async()=>{const{createChemical:l}=await import("./chemicals-CCSMwdmg.js");return{createChemical:l}},__vite__mapDeps([0,1,2,3]),import.meta.url),s=await r(L);await _e(a,De.CREATE,Ee.CHEMICALS,`إضافة مادة جديدة: ${L.nameAr}`,s.id)}te(!1),ae(null),V({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""})}catch(r){Ae(r,T?de.UPDATE:de.CREATE,"chemicals")}},Re=async()=>{const t=L.nameEn||L.nameAr;if(!t){alert("يرجى إدخال اسم المادة أولاً (بالعربية أو الإنجليزية)");return}F(!0);try{const r=await Oe(t);if(r){let s="";if(r.expiryYears>0){const l=new Date;l.setFullYear(l.getFullYear()+r.expiryYears),s=l.toISOString().split("T")[0]}V(l=>({...l,nameEn:r.nameEn||l.nameEn,nameAr:r.nameAr||l.nameAr,formula:r.formula||l.formula,casNumber:r.casNumber||l.casNumber,storageTemp:r.storageTemp||l.storageTemp,hazardClass:r.hazardClass||l.hazardClass,ghs:r.ghs||l.ghs,expiryDate:s||l.expiryDate,notes:r.notes||l.notes}))}else alert("لم نتمكن من الحصول على معلومات دقيقة لهذه المادة. يرجى إدخالها يدوياً.")}catch(r){console.error("Smart fill error:",r),alert("حدث خطأ أثناء محاولة الحصول على المعلومات الذكية.")}finally{F(!1)}},J=async t=>{const r=t||k;if(r){F(!0);try{const s=await Oe(r.nameEn||r.nameAr);s?(ne(s),t&&I(t),le(!0)):alert("لم نتمكن من الحصول على اقتراحات تحديث لهذه المادة.")}catch(s){console.error("Smart update request error:",s),alert("حدث خطأ أثناء طلب التحديث الذكي.")}finally{F(!1)}}},oe=async()=>{if(!(!k||!N))try{let t=k.expiryDate;if(N.expiryYears>0){const s=new Date;s.setFullYear(s.getFullYear()+N.expiryYears),t=s.toISOString().split("T")[0]}const{updateChemical:r}=await Q(async()=>{const{updateChemical:s}=await import("./chemicals-CCSMwdmg.js");return{updateChemical:s}},__vite__mapDeps([0,1,2,3]),import.meta.url);await r(k.id,{nameEn:N.nameEn,nameAr:N.nameAr,formula:N.formula,casNumber:N.casNumber,storageTemp:N.storageTemp,hazardClass:N.hazardClass,ghs:N.ghs,expiryDate:t,notes:N.notes}),le(!1),ne(null),alert("تم تحديث معلومات المادة بنجاح!")}catch(t){Ae(t,de.UPDATE,`chemicals/${k.id}`)}},P=async()=>{if(fe(!1),!await mt()){alert("يرجى اختيار مفتاح API الخاص بك لاستخدام ميزة التحديث الذكي.");return}se(!0),Z({current:0,total:x.length});let r=0,s=0;for(let l=0;l<x.length;l++){const m=x[l];Z({current:l+1,total:x.length});try{const o=await Oe(m.nameEn||m.nameAr);if(o){let d=m.expiryDate;if(o.expiryYears>0){const E=new Date;E.setFullYear(E.getFullYear()+o.expiryYears),d=E.toISOString().split("T")[0]}const{updateChemical:O}=await Q(async()=>{const{updateChemical:E}=await import("./chemicals-CCSMwdmg.js");return{updateChemical:E}},__vite__mapDeps([0,1,2,3]),import.meta.url);await O(m.id,{nameEn:o.nameEn||m.nameEn,nameAr:o.nameAr||m.nameAr,formula:o.formula||m.formula,casNumber:o.casNumber||m.casNumber,storageTemp:o.storageTemp||m.storageTemp,hazardClass:o.hazardClass||m.hazardClass,ghs:o.ghs||m.ghs,expiryDate:d||m.expiryDate,notes:o.notes||m.notes}),r++}else s++}catch(o){console.error(`Error updating chemical ${m.nameEn}:`,o),s++;const d=(o==null?void 0:o.message)||String(o);if(d.includes("quota")||d.includes("RESOURCE_EXHAUSTED")){alert("تم إيقاف التحديث التلقائي بسبب تجاوز حصة الاستخدام المسموح بها (Quota Exceeded). يرجى المحاولة لاحقاً أو التحقق من حساب Gemini API الخاص بك.");break}}await new Promise(o=>setTimeout(o,5e3))}se(!1),alert(`اكتمل التحديث الذكي!
تم تحديث: ${r} مادة بنجاح
فشل: ${s} مادة`)},we=async(t,r)=>{try{const{deleteChemical:s}=await Q(async()=>{const{deleteChemical:l}=await import("./chemicals-CCSMwdmg.js");return{deleteChemical:l}},__vite__mapDeps([0,1,2,3]),import.meta.url);await s(t),await _e(a,De.DELETE,Ee.CHEMICALS,`حذف المادة: ${r}`,t),(k==null?void 0:k.id)===t&&I(x.find(l=>l.id!==t)||null)}catch(s){Ae(s,de.DELETE,`chemicals/${t}`)}},Ge=()=>{const t=window.open("","_blank");if(!t){alert("يرجى السماح بالنوافذ المنبثقة لطباعة القائمة");return}const r=U.filter(d=>d.ghs&&d.ghs.length>0||d.hazardClass==="danger").length,l=new Date().toLocaleDateString("ar-DZ",{day:"2-digit",month:"2-digit",year:"numeric"}),m="2025/2026",o=U.map((d,O)=>{const E=d.ghs&&d.ghs.length>0||d.hazardClass==="danger",ce=(d.ghs||[]).map(Y=>`<div class="ghs-pic"><img src="${ee[Y]}" alt="${Y}" /></div>`).join("");return`
        <tr class="${E?"hazardous-row":""}">
          <td class="text-center">${O+1}</td>
          <td class="font-bold text-lg">${d.nameAr}</td>
          <td class="text-sm en-font">${d.nameEn}</td>
          <td class="mono-font">${d.formula||"—"}</td>
          <td class="text-center">${d.unit}</td>
          <td class="text-center font-bold">${d.quantity}</td>
          <td class="text-center">${d.state==="solid"?"صلب":d.state==="liquid"?"سائل":"غاز"}</td>
          <td class="text-center">${d.shelf||"—"}</td>
          <td><div class="ghs-container">${ce}</div></td>
          <td class="notes-cell">${d.notes||"—"}</td>
        </tr>
      `}).join("");t.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>سجل المواد الكيميائية — ${p}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #006494;
              --on-primary: #ffffff;
              --primary-container: #cbe6ff;
              --secondary: #50606e;
              --surface: #fdfcff;
              --surface-variant: #dee3eb;
              --outline: #71787e;
              --error: #ba1a1a;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl; 
              background: #f8f9fb; 
              color: #1a1c1e;
              padding: 20px;
            }

            #toolbar {
              position: fixed; top: 0; left: 0; right: 0; 
              z-index: 100; background: #1a1c1e; color: white;
              padding: 12px 24px; display: flex; align-items: center; gap: 15px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            #toolbar h3 { flex: 1; font-weight: 800; font-size: 16px; }
            .tb-btn { 
              padding: 10px 20px; border: none; border-radius: 20px; 
              cursor: pointer; font-weight: 700; font-size: 13px; font-family: Cairo;
              transition: all 0.2s;
            }
            .tb-print { background: #00b894; color: white; }
            .tb-close { background: #e74c3c; color: white; }

            .page-sheet {
              background: white;
              width: 297mm;
              min-height: 210mm;
              margin: 60px auto 20px;
              padding: 15mm;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
            }

            /* --- Header Layout --- */
            .official-header {
              display: grid;
              grid-template-columns: 1fr 2fr 1fr;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid var(--primary);
              align-items: start;
            }
            .oh-right { text-align: right; line-height: 1.6; font-size: 10pt; }
            .oh-center { text-align: center; line-height: 1.5; font-size: 11pt; font-weight: 800; }
            .oh-left { text-align: left; line-height: 1.6; font-size: 10pt; }
            .oh-center img { height: 50px; margin-bottom: 5px; }

            .main-title {
              text-align: center;
              font-size: 22pt;
              font-weight: 900;
              color: var(--primary);
              margin: 10px 0;
              letter-spacing: -0.5px;
              text-shadow: 1px 1px 0 rgba(0,0,0,0.05);
            }

            .registry-meta {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin-bottom: 20px;
              padding: 10px;
              background: var(--primary-container);
              border-radius: 12px;
              font-weight: 700;
              color: var(--on-primary-container);
            }

            /* --- Table Design --- */
            .registry-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              font-size: 10pt;
              margin-bottom: 20px;
            }
            .registry-table th {
              background: #f0f4f8;
              color: var(--secondary);
              font-weight: 800;
              padding: 12px 8px;
              border: 1px solid #d1d5db;
              text-align: center;
              font-size: 9pt;
            }
            .registry-table td {
              padding: 10px 8px;
              border: 1px solid #e5e7eb;
              line-height: 1.4;
            }
            .registry-table tr:nth-child(even) { background: #fafbfc; }
            .hazardous-row { background-color: #fff1f2 !important; }
            .hazardous-row td:first-child { border-right: 4px solid var(--error); }

            .text-center { text-align: center; }
            .font-bold { font-weight: 800; }
            .mono-font { font-family: 'JetBrains Mono', monospace; font-size: 9pt; }
            .en-font { font-family: sans-serif; color: var(--secondary); }
            .notes-cell { font-size: 9pt; color: #444; font-style: italic; }

            .ghs-container { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
            .ghs-pic { 
              width: 32px; height: 32px; border: 1px solid #ddd; 
              border-radius: 4px; background: white; padding: 2px;
              display: flex; align-items: center; justify-content: center;
            }
            .ghs-pic img { width: 100%; height: 100%; object-fit: contain; }

            /* --- Footer --- */
            .registry-footer {
              margin-top: auto;
              padding-top: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }
            .sign-box {
              text-align: center;
              border: 1px solid #eee;
              padding: 15px;
              border-radius: 12px;
              background: #fafafa;
            }
            .sign-box h4 { margin-bottom: 50px; font-weight: 800; text-decoration: underline; color: var(--secondary); }
            
            .inst-stamp {
              width: 40mm;
              height: 25mm;
              border: 2px dashed #ccc;
              border-radius: 12px;
              margin: 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8pt;
              color: #999;
            }

            @media print {
              #toolbar { display: none !important; }
              body { background: white !important; padding: 0 !important; }
              .page-sheet { 
                margin: 0 !important; box-shadow: none !important; 
                width: 100% !important; padding: 10mm !important;
                border-radius: 0 !important;
              }
              @page { size: A4 landscape; margin: 0; }
              .registry-table th { background: #eee !important; -webkit-print-color-adjust: exact; }
              .hazardous-row { background-color: #fff1f1 !important; -webkit-print-color-adjust: exact; }
              .registry-meta { background: #eee !important; color: black !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div id="toolbar">
              <h3>📄 جرد المواد الكيميائية — سجل المخبر</h3>
              <button class="tb-btn tb-print" onclick="window.print()">🖨️ طباعة السجل</button>
              <button class="tb-btn tb-close" onclick="window.close()">✕ إغلاق</button>
          </div>

          <div class="page-sheet">
            <header class="official-header">
              <div class="oh-right">
                <div>وزارة التربية الوطنية</div>
                <div>مديرية التربية لولاية: ${g}</div>
                <div>المؤسسة: ${p}</div>
              </div>
              <div class="oh-center">
                <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <div class="main-title">سجل جرد المواد الكيميائية للمخبر</div>
              </div>
              <div class="oh-left">
                <div>السنة الدراسية: ${m}</div>
                <div>تاريخ الطباعة: ${l}</div>
                <div class="inst-stamp">ختم المؤسسة</div>
              </div>
            </header>

            <div class="registry-meta">
              <span>إجمالي المواد: ${U.length}</span>
              <span style="border-right: 2px solid rgba(0,0,0,0.1); padding-right: 20px;">المواد الخطرة: ${r}</span>
            </div>

            <table class="registry-table">
              <thead>
                <tr>
                  <th width="40">رقم</th>
                  <th>الاسم العربي للمادة</th>
                  <th>Désignation (En)</th>
                  <th width="120">الصيغة</th>
                  <th width="60">الوحدة</th>
                  <th width="60">الكمية</th>
                  <th width="70">الحالة</th>
                  <th width="60">الرف</th>
                  <th width="100">GHS Pictograms</th>
                  <th>ملاحظات إضافية</th>
                </tr>
              </thead>
              <tbody>
                ${o}
              </tbody>
            </table>

            <footer class="registry-footer">
              <div class="sign-box"><h4>المخبري الرئيسي</h4></div>
              <div class="sign-box"><h4>المقتصد</h4></div>
              <div class="sign-box"><h4>مدير المؤسسة</h4></div>
              <div class="sign-box"><h4>مفتش التربية الوطنية</h4></div>
            </footer>
          </div>
        </body>
      </html>
    `),t.document.close()},S=async()=>{const t=["#","الاسم العلمي","الاسم العربي","الصيغة","الكمية","الرف","تاريخ الصلاحية"],r=h.map((s,l)=>[l+1,s.nameEn||"",s.nameAr||"",s.formula||"",`${s.quantity} ${s.unit}`,s.shelf||"",ve(s.expiryDate)]);await jt.generateTablePDF("تقرير جرد المواد الكيميائية",t,r,`chemicals_inventory_${new Date().toISOString().split("T")[0]}.pdf`)},je=()=>{const t=X.json_to_sheet(h.map(s=>({"الاسم (EN)":s.nameEn,"الاسم (AR)":s.nameAr,الصيغة:s.formula,"رقم CAS":s.casNumber,الكمية:s.quantity,الوحدة:s.unit,الحالة:s.state,الخطورة:s.hazardClass,الرف:s.shelf,"تاريخ الصلاحية":s.expiryDate,ملاحظات:s.notes}))),r=X.book_new();X.book_append_sheet(r,t,"Inventory"),Je(r,`chemical_inventory_${new Date().toISOString().split("T")[0]}.xlsx`)},Ne=async t=>{var l;const r=(l=t.target.files)==null?void 0:l[0];if(!r)return;W(!0);const s=new FileReader;s.onload=async m=>{var o;try{const d=(o=m.target)==null?void 0:o.result,O=pt(d,{type:"binary",cellDates:!0}),E=O.SheetNames[0],ce=O.Sheets[E],Y=X.sheet_to_json(ce),Ce=u=>{if(!u)return"";if(u instanceof Date)return u.toISOString().split("T")[0];const ze=new Date(u);return isNaN(ze.getTime())?String(u).trim():ze.toISOString().split("T")[0]},C=(u,ze)=>{const st=Object.keys(u);for(const it of ze){const Ye=st.find(nt=>nt.toLowerCase().trim()===it.toLowerCase().trim());if(Ye)return u[Ye]}},Ue=Y.map(u=>({nameAr:String(C(u,["الاسم بالعربية","nameAr","arabic name","الاسم","اسم المادة"])||"مادة كيميائية").trim(),nameEn:String(C(u,["الاسم بالإنجليزية","nameEn","english name","name"])||"").trim(),formula:String(C(u,["الصيغة الكيميائية","formula","الصيغة"])||"").trim(),casNumber:String(C(u,["رقم CAS","cas","casNumber","cas_number"])||"").trim(),unit:String(C(u,["الوحدة","unit"])||"g").trim(),quantity:Number(C(u,["الكمية","quantity"])||0),storageTemp:String(C(u,["درجة حرارة التخزين","storageTemp","درجة التخزين"])||"").trim(),state:String(C(u,["الحالة الفيزيائية","state","الحالة"])||"solid").trim(),hazardClass:String(C(u,["فئة الخطورة","hazardClass","الخطورة"])||"safe").trim(),shelf:String(C(u,["الرف","shelf","مكان التخزين"])||"").trim(),expiryDate:Ce(C(u,["تاريخ انتهاء الصلاحية","expiryDate","تاريخ الانتهاء"])),notes:String(C(u,["ملاحظات","notes"])||"").trim()})),{createChemicalsBulk:rt}=await Q(async()=>{const{createChemicalsBulk:u}=await import("./chemicals-CCSMwdmg.js");return{createChemicalsBulk:u}},__vite__mapDeps([0,1,2,3]),import.meta.url);await rt(Ue),alert(`تم استيراد ${Ue.length} مادة بنجاح!`)}catch(d){console.error("Error importing XLS:",d),alert("حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.")}finally{W(!1),re.current&&(re.current.value="")}},s.readAsBinaryString(r)},ke=t=>{const r=window.open("","_blank");if(!r){alert("يرجى السماح بالنوافذ المنبثقة لطباعة البطاقات");return}const s=new Date,l="2025/2026",m=t.map((o,d)=>{var Y,Ce;const O=o.state==="solid"?"صلب":o.state==="liquid"?"سائل":"غاز",E=o.hazardClass==="danger"?(Y=o.ghs)!=null&&Y[0]?me[o.ghs[0]]:"خطر":"آمن",ce=(Ce=o.ghs)!=null&&Ce[0]?"☠️":"—";return`
        <div class="pcard">
          <div class="ph-container">
            <div class="ph">
              <div class="ph-r">مديرية التربية لولاية: ${g}<br>ثانوية: ${p}</div>
              <div class="ph-c">الجمهورية الجزائرية الديمقراطية الشعبية<br>وزارة التربية الوطنية</div>
              <div class="ph-l">
                <div>السنة الدراسية: ${l}</div>
                <div class="header-stamp">ختم المؤسسة</div>
              </div>
            </div>
          </div>

          <div class="pcard-badge">رقم البطاقة: ${d+1}</div>
          <h1 class="pcard-title">بطاقة مخزون مادة كيميائية</h1>
          
          <div class="ic-meta-expressive">
             <div class="ic-field main">
                <span class="l">اسم المادة (AR)</span>
                <span class="v">${o.nameAr}</span>
             </div>
             <div class="ic-field sub">
                <span class="l">NOM DU PRODUIT</span>
                <span class="v en">${o.nameEn}</span>
             </div>
          </div>

          <div class="ic-grid-info">
             <div class="ic-info-box">
                <span class="l">الصيغة</span>
                <span class="v en-bold">${o.formula||"—"}</span>
             </div>
             <div class="ic-info-box">
                <span class="l">الحالة</span>
                <span class="v">${O}</span>
             </div>
             <div class="ic-info-box">
                <span class="l">الرف</span>
                <span class="v">${o.shelf||"—"}</span>
             </div>
             <div class="ic-info-box danger">
                <span class="l">GHS</span>
                <span class="v emoji">${ce}</span>
             </div>
          </div>

          <div class="ic-safety-strip">
             <b>طبيعة الخطورة:</b> ${E} 
             <span style="margin-right: 15px">|</span> 
             <b>وحدة القياس:</b> ${o.unit}
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="12%">التاريخ</th>
                  <th colspan="2">سند الطلب</th>
                  <th rowspan="2">المصدر</th>
                  <th rowspan="2" width="10%">الثمن</th>
                  <th colspan="3">الكمية</th>
                  <th rowspan="2">ملاحظات</th>
                </tr>
                <tr><th>خروج</th><th>دخول</th><th>خروج</th><th>دخول</th><th>المخزون</th></tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td>${s.toLocaleDateString("en-GB")}</td>
                  <td>-</td><td>-</td>
                  <td>رصيد أول المدة</td>
                  <td>-</td>
                  <td>-</td><td>${o.quantity}</td><td>${o.quantity}</td>
                  <td>رصيد ابتدائي</td>
                </tr>
                ${Array(14).fill("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
                <tr class="carry-over">
                  <td colspan="5">الرصيد المنقول لظهر البطاقة</td>
                  <td></td><td></td><td class="bold">..........</td>
                  <td>ينقل ←</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pcard back">
          <div class="back-header">
             <span>تتمة حركة المخزون — ${o.nameAr}</span>
             <span class="ref">REF: ${d+1}</span>
          </div>

          <div class="ic-table-container">
            <table class="ic-tbl">
              <thead>
                <tr>
                  <th rowspan="2" width="12%">التاريخ</th>
                  <th colspan="2">سند الطلب</th>
                  <th rowspan="2">المصدر</th>
                  <th rowspan="2" width="10%">الثمن</th>
                  <th colspan="3">الكمية</th>
                  <th rowspan="2">ملاحظات</th>
                </tr>
                <tr><th>خروج</th><th>دخول</th><th>خروج</th><th>دخول</th><th>المخزون</th></tr>
              </thead>
              <tbody>
                <tr class="initial-stock">
                  <td colspan="5">المجموع المنقول من وجه البطاقة</td>
                  <td></td><td></td><td>..........</td>
                  <td>نقل ←</td>
                </tr>
                ${Array(22).fill("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>").join("")}
              </tbody>
            </table>
          </div>

          <div class="ic-safety-rules">
             <h3>⚠️ تعليمات السلامة الخاصة بالتخزين</h3>
             <div class="rules-box">
                ${o.notes||"يجب حفظ هذه المادة في ظروف ملائمة بعيداً عن الرطوبة والحرارة ووفق معايير السلامة المنصوص عليها في دليل المختبرات."}
             </div>
          </div>
        </div>
      `}).join("");r.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>بطاقة مخزون</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #006494;
              --on-primary: #ffffff;
              --primary-container: #cbe6ff;
              --on-primary-container: #001e30;
              --secondary: #50606e;
              --tertiary: #65587b;
              --error: #ba1a1a;
              --outline: #71787e;
              --surface: #fdfcff;
              --surface-variant: #dee3eb;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl; 
              background: #f0f2f5; 
              color: #1a1c1e;
              padding: 20px;
            }

            #toolbar {
              position: fixed; top: 0; left: 0; right: 0; 
              z-index: 100; background: #1a1c1e; color: white;
              padding: 12px 24px; display: flex; align-items: center; gap: 15px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            #toolbar h3 { flex: 1; font-weight: 800; font-size: 16px; }
            .tb-btn { 
              padding: 10px 20px; border: none; border-radius: 20px; 
              cursor: pointer; font-weight: 700; font-size: 13px; font-family: Cairo;
              transition: all 0.2s;
            }
            .tb-print { background: #00b894; color: white; }
            .tb-close { background: #e74c3c; color: white; }

            #body { padding-top: 60px; max-width: 900px; margin: 0 auto; }

            .pcard {
              background: white;
              width: 148mm;
              height: 210mm;
              margin: 20px auto;
              padding: 8mm;
              border-radius: 24px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
              display: flex;
              flex-direction: column;
              border: 1px solid rgba(0,0,0,0.05);
              position: relative;
              overflow: hidden;
            }

            .pcard.back { border-style: dashed; }

            .ph-container {
              background: var(--surface-variant);
              margin: -8mm -8mm 4mm -8mm;
              padding: 6mm 8mm;
              border-radius: 0 0 24px 24px;
            }
            .ph {
              display: grid; grid-template-columns: 1fr 1.5fr 1fr;
              font-size: 7.5pt; gap: 4px; align-items: start; color: var(--secondary);
            }
            .ph-r { text-align: right; line-height: 1.5; }
            .ph-c { text-align: center; font-weight: 800; line-height: 1.5; }
            .ph-l { text-align: left; line-height: 1.5; }

            .header-stamp {
              margin-top: 5px;
              width: 35mm;
              height: 20mm;
              border: 1px dashed var(--outline);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6pt;
              color: var(--outline);
              font-weight: 400;
            }

            .pcard-badge {
              position: absolute; top: 12mm; left: 8mm;
              background: var(--primary-container); color: var(--on-primary-container);
              padding: 2px 12px; border-radius: 12px; font-size: 8pt; font-weight: 700;
            }

            .pcard-title {
              text-align: center; font-size: 14pt; font-weight: 900;
              color: var(--primary); margin: 4mm 0;
            }

            .ic-meta-expressive { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6mm; }
            .ic-field { border-radius: 12px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; }
            .ic-field.main { background: #f0f4f9; border-right: 4px solid var(--primary); }
            .ic-field.sub { background: #fafbfc; border-right: 4px solid var(--outline); font-size: 9pt; }
            .ic-field .l { font-weight: 700; color: var(--secondary); font-size: 8.5pt; }
            .ic-field .v { font-weight: 800; font-size: 11pt; }
            .ic-field .v.en { font-family: sans-serif; font-size: 9pt; text-transform: uppercase; }

            .ic-grid-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 6mm; }
            .ic-info-box { background: #fff; border: 1px solid var(--surface-variant); border-radius: 12px; padding: 6px; text-align: center; }
            .ic-info-box .l { display: block; font-size: 7pt; font-weight: 700; color: var(--tertiary); margin-bottom: 2px; }
            .ic-info-box .v { font-weight: 800; font-size: 9.5pt; }
            .ic-info-box .v.en-bold { font-family: monospace; font-weight: 900; font-size: 10pt; }
            .ic-info-box.danger { border-color: var(--error); background: #fff8f8; }

            .ic-safety-strip { background: var(--on-primary-container); color: white; border-radius: 8px; padding: 5px 12px; font-size: 8.5pt; margin-bottom: 6mm; }

            .ic-table-container { flex: 1; margin-bottom: 4mm; }
            .ic-tbl { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: fixed; }
            .ic-tbl th, .ic-tbl td { border: 0.5pt solid var(--surface-variant); padding: 4px; text-align: center; }
            .ic-tbl th { background: #e8ecef; color: var(--secondary); font-weight: 800; font-size: 7pt; }
            .ic-tbl td { height: 6mm; }
            tr.initial-stock { background: #f0fdf4; font-weight: 600; }
            .bold { font-weight: 900; }

            .back-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary); padding-bottom: 5px; margin-bottom: 6mm; font-weight: 900; font-size: 11pt; color: var(--primary); }
            .rules-box { background: #fffafa; border: 1px solid #ffeded; padding: 10px; border-radius: 12px; font-size: 8.5pt; color: #444; line-height: 1.6; }

            @media print {
              #toolbar { display: none !important; }
              body { background: white !important; padding: 0 !important; }
              @page { size: A5 portrait; margin: 3mm; }
              .pcard {
                width: 100% !important; height: calc(210mm - 6mm) !important;
                margin: 0 !important; border: 1px solid #000 !important;
                border-radius: 0 !important; box-shadow: none !important;
                page-break-after: always !important; padding: 5mm !important;
              }
              .ph-container { border-radius: 0 !important; margin-bottom: 2mm !important; }
              .ic-meta-expressive .ic-field { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
              .ic-tbl th { background: #f0f0f0 !important; border: 0.5pt solid #000 !important; print-color-adjust: exact; }
              .ic-tbl td { border: 0.5pt solid #000 !important; }
            }
          </style>
        </head>
        <body>
          <div id="toolbar">
              <h3>🎨 جرد كيميائي — ${t.length} عنصر</h3>
              <button class="tb-btn tb-print" onclick="window.print()">🖨️ بدء الطباعة</button>
              <button class="tb-btn tb-close" onclick="window.close()">✕ إغلاق المعاينة</button>
          </div>
          <div id="body">
            ${m}
          </div>
        </body>
      </html>
    `),r.document.close()},Se=t=>{const r=window.open("","_blank");r&&(r.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة مادة - ${t.nameEn}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #2b3d22; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #2b3d22; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .label { font-weight: bold; color: #5c6146; }
            .hazard { color: #e11d48; font-weight: bold; }
            .footer { margin-top: 50px; text-align: left; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">بطاقة تعريف مادة كيميائية</div>
            <div>نظام تسيير المخابر المدرسية</div>
          </div>
          <div class="details">
            <div class="item"><span class="label">PRODUIT CHIMIQUE:</span> ${t.nameEn}</div>
            <div class="item"><span class="label">الاسم العربي:</span> ${t.nameAr}</div>
            <div class="item"><span class="label">الصيغة الكيميائية:</span> ${t.formula}</div>
            <div class="item"><span class="label">رقم CAS:</span> ${t.casNumber||"غير متوفر"}</div>
            <div class="item"><span class="label">درجة التخزين:</span> ${t.storageTemp||"غير متوفر"}</div>
            <div class="item"><span class="label">الحالة:</span> ${t.state}</div>
            <div class="item"><span class="label">الكمية الحالية:</span> ${t.quantity} ${t.unit}</div>
            <div class="item"><span class="label">الرف:</span> ${t.shelf}</div>
            <div class="item"><span class="label">الصلاحية:</span> ${t.expiryDate||"غير محدد"}</div>
            <div class="item" style="grid-column: span 2;">
              <span class="label">رموز السلامة GHS:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${(t.ghs||[]).map(s=>`
                  <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #ccc; padding: 5px; border-radius: 8px; width: 70px; background: #fff;">
                    <img src="${ee[s]}" style="width: 40px; height: 40px;" />
                    <span style="font-size: 9px; margin-top: 4px; text-align: center; font-weight: bold;">${me[s]||s}</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="item"><span class="label">تصنيف الخطورة:</span> <span class="${t.hazardClass==="danger"?"hazard":""}">${t.hazardClass==="danger"?"خطر":"آمن"}</span></div>
            <div class="item" style="grid-column: span 2;"><span class="label">ملاحظات:</span> ${t.notes||"لا توجد"}</div>
          </div>
          <div class="footer">طبع بتاريخ: ${new Date().toLocaleString("ar-DZ")}</div>
          <script>window.print();<\/script>
        </body>
      </html>
    `),r.document.close())},c=t=>{let r="asc";v&&v.key===t&&v.direction==="asc"&&(r="desc"),ye({key:t,direction:r})},y=t=>{G(r=>r.includes(t)?r.filter(s=>s!==t):[...r,t])},n=()=>{B.length===h.length?G([]):G(h.map(t=>t.id))},w=async()=>{if(window.confirm(`هل أنت متأكد من حذف ${B.length} مادة؟`))try{const{deleteChemical:t}=await Q(async()=>{const{deleteChemical:r}=await import("./chemicals-CCSMwdmg.js");return{deleteChemical:r}},__vite__mapDeps([0,1,2,3]),import.meta.url);await Promise.all(B.map(r=>t(r))),await _e(a,De.DELETE,Ee.CHEMICALS,`حذف جماعي لـ ${B.length} مادة`),G([]),alert("تم الحذف بنجاح!")}catch(t){Ae(t,de.DELETE,"chemicals/bulk")}},h=x.filter(t=>{var l,m,o;const r=((l=t.nameEn)==null?void 0:l.toLowerCase().includes(i.toLowerCase()))||((m=t.nameAr)==null?void 0:m.toLowerCase().includes(i.toLowerCase()))||((o=t.formula)==null?void 0:o.toLowerCase().includes(i.toLowerCase())),s=!he||t.quantity<10;return r&&s}),U=b.useMemo(()=>{const t=[...h];return v!==null&&t.sort((r,s)=>{const l=r[v.key],m=s[v.key];return l===void 0||m===void 0?0:l<m?v.direction==="asc"?-1:1:l>m?v.direction==="asc"?1:-1:0}),t},[h,v]),et=t=>(v==null?void 0:v.key)===t?v.direction==="asc"?e.jsx(Nt,{size:14,className:"mr-1"}):e.jsx(dt,{size:14,className:"mr-1"}):e.jsx("div",{className:"w-[14px] mr-1"}),tt=x.filter(t=>t.quantity<10).length,Ve=b.useRef(null),at=vt({count:U.length,getScrollElement:()=>Ve.current,estimateSize:()=>72,overscan:10});return{searchParams:_,chemicals:x,setChemicals:q,loading:f,setLoading:R,searchTerm:i,setSearchTerm:M,filterLowStock:he,setFilterLowStock:K,selectedChemical:k,setSelectedChemical:I,isAddModalOpen:ue,setIsAddModalOpen:te,editingChemical:T,setEditingChemical:ae,fileInputRef:re,isImporting:be,setIsImporting:W,isGenerating:A,setIsGenerating:F,isBulkUpdating:Ie,setIsBulkUpdating:se,isBulkConfirmOpen:Te,setIsBulkConfirmOpen:fe,bulkProgress:ie,setBulkProgress:Z,selectedIds:B,setSelectedIds:G,suggestedUpdate:N,setSuggestedUpdate:ne,isReviewModalOpen:ge,setIsReviewModalOpen:le,sortConfig:v,setSortConfig:ye,isQRScannerOpen:Le,setIsQRScannerOpen:Pe,formatDisplayDate:ve,newChemical:L,setNewChemical:V,handleAddChemical:qe,handleSmartFill:Re,handleRequestSmartUpdate:J,handleApproveUpdate:oe,handleBulkSmartUpdate:P,handleDeleteChemical:we,handlePrintList:Ge,handleExportPDF:S,handleExportXLS:je,handleImportXLS:Ne,handlePrintInventoryCards:ke,handlePrint:Se,handleSort:c,handleToggleSelect:y,handleSelectAll:n,handleBulkDelete:w,filteredChemicals:h,sortedChemicals:U,getSortIcon:et,lowStockCount:tt,parentRef:Ve,rowVirtualizer:at,chemicalsList:$,chemicalsLoading:D,error:He,schoolId:a,schoolName:p,stateName:g}}function Vt({isNested:z=!1}){var je,Ne,ke,Se;const{t:a,i18n:p}=xt(),{chemicals:g,loading:_,searchTerm:x,setSearchTerm:q,filterLowStock:f,setFilterLowStock:R,selectedChemical:i,setSelectedChemical:M,isAddModalOpen:he,setIsAddModalOpen:K,editingChemical:k,setEditingChemical:I,fileInputRef:ue,isImporting:te,isGenerating:T,isBulkUpdating:ae,isBulkConfirmOpen:re,setIsBulkConfirmOpen:be,bulkProgress:W,selectedIds:A,setSelectedIds:F,suggestedUpdate:Ie,isReviewModalOpen:se,setIsReviewModalOpen:Te,isQRScannerOpen:fe,setIsQRScannerOpen:ie,formatDisplayDate:Z,newChemical:B,setNewChemical:G,handleAddChemical:N,handleSmartFill:ne,handleRequestSmartUpdate:ge,handleApproveUpdate:le,handleBulkSmartUpdate:v,handleDeleteChemical:ye,handlePrintList:Le,handleExportPDF:Pe,handleExportXLS:ve,handleImportXLS:L,handlePrintInventoryCards:V,handlePrint:$,handleSort:D,handleToggleSelect:He,handleSelectAll:qe,handleBulkDelete:Re,filteredChemicals:J,sortedChemicals:oe,getSortIcon:P,lowStockCount:we,parentRef:Ge,rowVirtualizer:S}=At(z);return e.jsxs("div",{className:j("space-y-10 max-w-7xl mx-auto pb-20",!z&&"px-4"),dir:p.language==="ar"?"rtl":"ltr",children:[!z&&e.jsxs("header",{className:"flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("h1",{className:"text-4xl font-black text-primary tracking-tighter",children:a("chemicals.title","المخزن الكيميائي")}),e.jsx("p",{className:"text-secondary/80 text-base font-medium",children:a("chemicals.subtitle","إدارة وتتبع المحاليل والكواشف الكيميائية")})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx("input",{type:"file",ref:ue,onChange:L,className:"hidden",accept:".xls,.xlsx"}),e.jsxs("button",{onClick:()=>ie(!0),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(Qe,{size:20}),a("common.scan_qr","مسح QR")]}),e.jsxs("button",{onClick:Le,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx($e,{size:20}),a("equipment.btn_print_list","طباعة القائمة")]}),e.jsxs("button",{onClick:()=>V(oe),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx($e,{size:20,className:"text-primary"}),a("chemicals.btn_print_stock_cards","طباعة بطاقات المخزون")]}),e.jsxs("button",{onClick:Pe,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(Xe,{size:20}),a("common.export_pdf","تصدير PDF")]}),e.jsxs("button",{onClick:()=>{var c;return(c=ue.current)==null?void 0:c.click()},disabled:te,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm disabled:opacity-50",children:[te?e.jsx("div",{className:"w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"}):e.jsx(ht,{size:20}),a("common.import_xls","استيراد XLS")]}),e.jsxs("button",{onClick:ve,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(We,{size:20}),a("common.export_xls","تصدير الجرد")]}),e.jsxs("button",{onClick:()=>be(!0),disabled:ae||g.length===0,className:"bg-primary text-on-primary px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50",title:"تحديث ذكي لجميع المواد في القائمة",children:[ae?e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsxs("span",{className:"text-xs",children:[W.current,"/",W.total]})]}):e.jsx(pe,{size:20}),a("equipment.btn_smart_update","تحديث ذكي للكل")]}),e.jsxs("button",{onClick:()=>K(!0),className:"bg-primary text-on-primary px-8 py-3.5 rounded-full flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95",children:[e.jsx(kt,{size:20}),a("chemicals.btn_add","إضافة مادة")]})]})]}),!z&&e.jsxs("section",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"bg-surface-container-low p-7 rounded-[32px] border border-outline/5 hover:border-outline/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-secondary/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.stat_total_chemicals","إجمالي المواد")}),e.jsx("h3",{className:"text-4xl font-black text-primary group-hover:scale-110 transition-transform origin-right",children:g.length})]}),e.jsxs("div",{className:"bg-error-container/40 p-7 rounded-[32px] border border-error/10 hover:border-error/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-error-container/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.col_hazard","مواد خطرة")}),e.jsx("h3",{className:"text-4xl font-black text-error group-hover:scale-110 transition-transform origin-right",children:g.filter(c=>c.ghs&&c.ghs.length>0||c.hazardClass==="danger").length})]}),e.jsxs("div",{className:"bg-tertiary-fixed/40 p-7 rounded-[32px] border border-tertiary/10 hover:border-tertiary/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-tertiary-fixed/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.stat_expired","تنتهي قريباً")}),e.jsx("h3",{className:"text-4xl font-black text-tertiary group-hover:scale-110 transition-transform origin-right",children:g.filter(c=>{if(!c.expiryDate)return!1;const y=new Date(c.expiryDate),n=new Date;return n.setMonth(n.getMonth()+3),y<n&&y>new Date}).length.toString().padStart(2,"0")})]}),e.jsxs("div",{className:"bg-primary p-7 rounded-[32px] text-on-primary shadow-xl shadow-primary/20 hover:shadow-2xl transition-all group relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-surface/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10",children:[e.jsx("p",{className:"text-white/60 text-xs font-black uppercase tracking-widest mb-3",children:a("equipment.field_quantity","سعة التخزين")}),e.jsx("h3",{className:"text-4xl font-black",children:"68%"})]})]})]}),we>0&&e.jsxs(H.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},className:"bg-error-container/30 backdrop-blur-sm text-on-error-container p-5 rounded-[32px] flex items-center justify-between border border-error/10 shadow-lg shadow-error/5",children:[e.jsxs("div",{className:"flex items-center gap-4 text-error",children:[e.jsx("div",{className:"bg-error p-3 rounded-2xl text-white shadow-lg shadow-error/20",children:e.jsx(ut,{size:20})}),e.jsxs("span",{className:"font-black text-base",children:[a("chemicals.low_stock_badge","تنبيه: يوجد مواد منخفضة المخزون!")," (",we,")"]})]}),e.jsx("button",{onClick:()=>R(!f),className:"text-sm font-black underline underline-offset-4 text-error px-6 py-2.5 hover:bg-error/10 rounded-full transition-all active:scale-95",children:f?a("common.all","عرض الكل"):a("chemicals.filter_low_stock","عرض المواد المنخفضة")})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-10",children:[e.jsx("div",{className:"lg:col-span-8 space-y-8",children:e.jsxs("div",{className:"bg-surface-container-lowest rounded-[32px] overflow-hidden border border-outline/10 shadow-sm",children:[e.jsxs("div",{className:"p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low/30 border-b border-outline/5",children:[e.jsxs("div",{className:"relative w-full md:w-80",children:[e.jsx(bt,{className:"absolute right-4 top-1/2 -translate-y-1/2 text-outline/60",size:20}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-full pr-12 pl-6 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all",placeholder:a("chemicals.search_placeholder","بحث عن مادة (اسم أو صيغة)..."),value:x,onChange:c=>q(c.target.value)})]}),e.jsx("div",{className:"flex gap-3",children:e.jsx("button",{onClick:()=>R(!f),className:j("p-3 border rounded-full transition-all active:scale-90",f?"bg-primary text-on-primary border-primary shadow-lg shadow-primary/20":"bg-surface-container-low hover:bg-surface-container-high border-outline/10 text-secondary"),title:f?a("common.all","عرض الكل"):a("chemicals.filter_low_stock","تصفية المواد المنخفضة"),children:e.jsx(St,{size:22})})})]}),e.jsx("div",{ref:Ge,className:"overflow-auto scrollbar-hide relative max-h-[700px] w-full",children:e.jsxs("table",{className:"w-full text-right border-collapse table-auto relative",children:[e.jsx("thead",{className:"sticky top-0 z-20 bg-surface-container-lowest",children:e.jsxs("tr",{className:"bg-surface-container-low/50 text-secondary/60 text-[11px] font-black uppercase tracking-widest",children:[e.jsx("th",{className:"px-3 py-5 text-right w-12",children:e.jsx("div",{onClick:qe,className:j("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",A.length===J.length&&J.length>0?"bg-primary border-primary text-white":"border-outline/30 hover:border-primary/50"),children:A.length===J.length&&J.length>0&&e.jsx(Fe,{size:12})})}),e.jsx("th",{className:"px-3 py-5 text-right w-10",children:"#"}),e.jsx("th",{className:"px-3 py-5 text-right min-w-[140px] cursor-pointer hover:text-primary transition-colors",onClick:()=>D("nameEn"),children:e.jsxs("div",{className:"flex items-center",children:[P("nameEn"),a("chemicals.col_name_en","المادة (EN/AR)")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-16 hidden sm:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>D("formula"),children:e.jsxs("div",{className:"flex items-center",children:[P("formula"),a("chemicals.col_formula","الصيغة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 cursor-pointer hover:text-primary transition-colors",onClick:()=>D("quantity"),children:e.jsxs("div",{className:"flex items-center",children:[P("quantity"),a("chemicals.col_quantity","الكمية")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden lg:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>D("state"),children:e.jsxs("div",{className:"flex items-center",children:[P("state"),a("common.status","الحالة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-18 cursor-pointer hover:text-primary transition-colors",onClick:()=>D("hazardClass"),children:e.jsxs("div",{className:"flex items-center",children:[P("hazardClass"),a("chemicals.col_hazard","الخطورة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 hidden xl:table-cell",children:"GHS"}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden md:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>D("shelf"),children:e.jsxs("div",{className:"flex items-center",children:[P("shelf"),a("chemicals.col_location","الرف")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-24 cursor-pointer hover:text-primary transition-colors",onClick:()=>D("expiryDate"),children:e.jsxs("div",{className:"flex items-center",children:[P("expiryDate"),a("chemicals.col_expiry","الصلاحية")]})}),e.jsx("th",{className:"px-3 py-5 text-right hidden 2xl:table-cell",children:a("common.notes","ملاحظات")}),e.jsx("th",{className:"px-3 py-5 text-center w-24",children:a("common.actions","إجراءات")})]})}),e.jsx("tbody",{className:"divide-y divide-outline/5 relative w-full",children:_?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:a("common.loading","جاري التحميل...")})}):oe.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:a("common.empty","لا توجد مواد مطابقة للبحث")})}):e.jsxs(e.Fragment,{children:[S.getVirtualItems().length>0&&S.getVirtualItems()[0].start>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${S.getVirtualItems()[0].start}px`},colSpan:12})}),S.getVirtualItems().map(c=>{var w;const y=c.index,n=oe[y];return e.jsxs("tr",{onClick:()=>M(n),ref:S.measureElement,"data-index":y,className:j("hover:bg-surface-container-low/40 transition-all group cursor-pointer text-base",(i==null?void 0:i.id)===n.id&&"bg-surface-container-low/60 border-r-4 border-primary"),children:[e.jsx("td",{className:"px-3 py-4",children:e.jsx("div",{onClick:h=>{h.stopPropagation(),He(n.id)},className:j("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",A.includes(n.id)?"bg-primary border-primary text-white scale-110":"border-outline/30 group-hover:border-primary/50"),children:A.includes(n.id)&&e.jsx(Fe,{size:12})})}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/60",children:y+1}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"font-black text-primary break-words leading-tight",children:n.nameEn}),e.jsx("span",{className:"text-xs text-secondary/60 break-words mt-0.5",children:n.nameAr})]})}),e.jsx("td",{className:"px-3 py-4 font-mono font-bold text-secondary/80 hidden sm:table-cell text-xs",children:n.formula}),e.jsxs("td",{className:"px-3 py-4 font-black text-primary whitespace-nowrap",children:[n.quantity," ",e.jsx("span",{className:"text-[10px] text-secondary/60",children:n.unit})]}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/80 hidden lg:table-cell text-xs",children:n.state==="solid"?"صلب":n.state==="liquid"?"سائل":"غاز"}),e.jsx("td",{className:"px-3 py-4",children:e.jsx("span",{className:j("px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm",n.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-primary-fixed/40 text-primary"),children:n.hazardClass==="danger"?"خطر":"آمن"})}),e.jsx("td",{className:"px-3 py-4 hidden xl:table-cell",children:e.jsxs("div",{className:"flex gap-1.5",children:[(w=n.ghs)==null?void 0:w.slice(0,3).map((h,U)=>e.jsxs("div",{className:"w-9 h-9 bg-surface rounded-lg flex items-center justify-center border border-outline/20 p-1 shadow-sm hover:scale-125 transition-transform z-10 relative group/ghs",title:me[h]||h,children:[ee[h]?e.jsx("img",{src:ee[h],alt:h,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("span",{className:"text-[8px] font-black",children:h}),e.jsx("div",{className:"absolute bottom-full mb-2 hidden group-hover/ghs:block bg-secondary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none shadow-xl",children:me[h]||h})]},U)),n.ghs&&n.ghs.length>3&&e.jsxs("span",{className:"text-[10px] text-secondary/40 self-center font-bold",children:["+",n.ghs.length-3]})]})}),e.jsx("td",{className:"px-3 py-4 font-bold text-primary hidden md:table-cell text-xs",children:n.shelf}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("span",{className:j("font-bold whitespace-nowrap text-xs",n.expiryDate&&new Date(n.expiryDate)<new Date?"text-error flex items-center gap-1":"text-secondary/80"),children:[Z(n.expiryDate),n.expiryDate&&new Date(n.expiryDate)<new Date&&e.jsx(Me,{size:14})]})}),e.jsx("td",{className:"px-3 py-4 text-xs text-secondary/60 hidden 2xl:table-cell min-w-[200px] leading-relaxed break-words",children:n.notes}),e.jsx("td",{className:"px-3 py-4 text-center",children:e.jsxs("div",{className:"flex gap-1 justify-center",children:[e.jsx("button",{onClick:h=>{h.stopPropagation(),ge(n)},disabled:T,className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تحديث ذكي",children:e.jsx(pe,{size:16})}),e.jsx("button",{onClick:h=>{h.stopPropagation(),I(n),G({nameEn:n.nameEn,nameAr:n.nameAr,formula:n.formula,casNumber:n.casNumber||"",storageTemp:n.storageTemp||"",unit:n.unit,quantity:n.quantity,state:n.state,hazardClass:n.hazardClass,ghs:n.ghs,shelf:n.shelf,expiryDate:n.expiryDate,notes:n.notes}),K(!0)},className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تعديل",children:e.jsx(Ct,{size:16})}),e.jsx("button",{onClick:h=>{h.stopPropagation(),ye(n.id,n.nameAr)},className:"p-1.5 text-outline/40 hover:text-error hover:bg-error/10 transition-all rounded-full active:scale-90",title:"حذف",children:e.jsx(Ke,{size:16})})]})})]},n.id)}),S.getVirtualItems().length>0&&S.getTotalSize()-(((Ne=(je=S.getVirtualItems())==null?void 0:je.at(-1))==null?void 0:Ne.end)||0)>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${S.getTotalSize()-(((Se=(ke=S.getVirtualItems())==null?void 0:ke.at(-1))==null?void 0:Se.end)||0)}px`},colSpan:12})})]})})]})})]})}),e.jsxs("div",{className:"lg:col-span-4 space-y-8",children:[i?e.jsxs(H.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},className:"bg-surface-container-lowest rounded-[32px] p-10 relative overflow-hidden border border-outline/10 shadow-sm",children:[e.jsx("div",{className:"absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[120px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10 space-y-8",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("span",{className:j("text-[11px] px-4 py-1.5 rounded-[28px_28px_4px_28px] font-black uppercase tracking-widest shadow-sm",i.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-tertiary-fixed/60 text-tertiary"),children:i.hazardClass==="danger"?a("chemicals.hazard_danger","مادة خطرة"):a("chemicals.hazard_safe","مادة آمنة")}),i.hazardClass==="danger"&&e.jsx("div",{className:"flex gap-2 text-error animate-pulse",children:e.jsx(Me,{size:28})})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-3xl font-black text-primary mb-1 tracking-tight",children:i.nameEn}),e.jsx("h3",{className:"text-xl font-bold text-secondary mb-2 tracking-tight",children:i.nameAr}),e.jsx("p",{className:"text-lg font-mono font-bold text-secondary/60",children:i.formula})]}),e.jsxs("div",{className:"space-y-5 pt-8 border-t border-outline/5",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.field_cas","رقم CAS")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.casNumber||a("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.field_storage_temp","درجة التخزين")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.storageTemp||a("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("common.status","الحالة")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.state==="solid"?a("chemicals.state_solid","صلب"):i.state==="liquid"?a("chemicals.state_liquid","سائل"):a("chemicals.state_gas","غاز")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.col_location","الرف")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.shelf})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.col_expiry","الصلاحية")}),e.jsx("span",{className:j("font-black text-lg",i.expiryDate&&new Date(i.expiryDate)<new Date?"text-error":"text-primary"),children:Z(i.expiryDate)})]}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("common.notes","ملاحظات")}),e.jsx("span",{className:"font-black text-primary text-sm text-left flex-1 mr-4 leading-relaxed break-words",children:i.notes||a("common.none","لا توجد")})]}),i.ghs&&i.ghs.length>0&&e.jsxs("div",{className:"pt-6 border-t border-outline/5",children:[e.jsx("span",{className:"text-[11px] font-black text-secondary/40 uppercase tracking-[0.2em] block mb-4",children:a("chemicals.ghs_symbols","رموز السلامة GHS")}),e.jsx("div",{className:"grid grid-cols-3 gap-4",children:i.ghs.map((c,y)=>e.jsxs("div",{className:"bg-surface p-3 rounded-2xl border border-outline/10 shadow-md hover:shadow-lg hover:border-primary/30 transition-all flex flex-col items-center gap-2 group/card",children:[e.jsx("div",{className:"w-16 h-16 flex items-center justify-center group-hover/card:scale-110 transition-transform",children:ee[c]?e.jsx("img",{src:ee[c],alt:c,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("div",{className:"w-full h-full flex items-center justify-center text-xs font-black bg-surface-container-high rounded-xl",children:c})}),e.jsx("span",{className:"text-[10px] font-black text-secondary text-center leading-tight",children:me[c]||c})]},y))})]}),e.jsxs("div",{className:"space-y-3 pt-2",children:[e.jsxs("div",{className:"flex justify-between items-end",children:[e.jsx("span",{className:"text-sm font-black text-primary uppercase tracking-widest",children:a("chemicals.col_quantity","مستوى المخزون")}),e.jsxs("span",{className:"text-2xl font-black text-primary",children:[i.quantity," ",e.jsx("span",{className:"text-sm text-secondary/60",children:i.unit})]})]}),e.jsx("div",{className:"h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline/5 shadow-inner",children:e.jsx("div",{className:"h-full bg-primary rounded-full shadow-sm",style:{width:"70%"}})})]})]}),e.jsxs("div",{className:"flex gap-3 pt-4",children:[e.jsx("button",{onClick:()=>$(i),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("common.print","طباعة تعريفية"),children:e.jsx($e,{size:22})}),e.jsx("button",{onClick:()=>V([i]),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("chemicals.btn_print_stock_cards","طباعة بطاقة المخزون"),children:e.jsx(Xe,{size:22})}),e.jsx("button",{onClick:()=>ge(),disabled:T,className:"p-3 bg-primary-container hover:bg-primary/20 border border-primary/10 rounded-full text-primary transition-all active:scale-90 disabled:opacity-50",title:a("equipment.btn_smart_update","تحديث ذكي للمعلومات"),children:T?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(pe,{size:22})}),e.jsx("button",{className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("common.scan_qr","توليد رمز QR"),children:e.jsx(Qe,{size:22})})]})]})]},i.id):e.jsx("div",{className:"bg-surface-container-lowest rounded-[32px] p-12 text-center text-outline/60 font-bold border border-outline/10 border-dashed",children:a("chemicals.select_prompt","اختر مادة من القائمة لعرض تفاصيلها المخبرية")}),e.jsxs("div",{className:"bg-primary-container/30 backdrop-blur-sm p-8 rounded-[32px] text-on-primary-container border border-primary/10 relative overflow-hidden group shadow-sm",children:[e.jsxs("div",{className:"relative z-10",children:[e.jsxs("h4",{className:"font-black text-lg mb-3 flex items-center gap-2 text-primary",children:[e.jsx(ft,{size:20}),a("chemicals.safety_instructions","تعليمات السلامة")]}),e.jsx("p",{className:"text-sm font-medium text-primary/80 leading-relaxed",children:(i==null?void 0:i.hazardClass)==="danger"?"يجب ارتداء القفازات والنظارات الواقية عند التعامل مع هذه المادة. يحفظ في مكان بارد وجيد التهوية بعيداً عن مصادر الحرارة.":"يرجى اتباع بروتوكولات المختبر القياسية عند التعامل مع هذه المادة لضمان سلامتك وسلامة الزملاء."})]}),e.jsx(Me,{className:"absolute -bottom-6 -left-6 text-primary/5 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700"})]})]})]}),e.jsx(xe,{children:A.length>0&&e.jsxs(H.div,{initial:{y:100,opacity:0},animate:{y:0,opacity:1},exit:{y:100,opacity:0},className:"fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-10 min-w-[500px]",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsxs("span",{className:"text-sm font-black",children:[A.length," ",a("common.selected","مادة مختارة")]}),e.jsx("span",{className:"text-[10px] text-white/60 font-bold",children:a("chemicals.bulk_operations_hint","يمكنك إجراء عمليات جماعية على هذه المواد")})]}),e.jsx("div",{className:"h-10 w-px bg-surface/10"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("button",{onClick:Re,className:"flex items-center gap-2 px-6 py-2.5 rounded-full bg-error/20 text-error-container hover:bg-error hover:text-white transition-all font-black text-sm",children:[e.jsx(Ke,{size:18}),a("common.delete_selected","حذف المختار")]}),e.jsxs("button",{className:"flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface/10 hover:bg-surface/20 transition-all font-black text-sm",onClick:()=>{const c=g.filter(w=>A.includes(w.id)),y=X.json_to_sheet(c.map(w=>({Chemical:w.nameEn,Arabic:w.nameAr,Formula:w.formula,Qty:w.quantity,Unit:w.unit}))),n=X.book_new();X.book_append_sheet(n,y,"SelectedItems"),Je(n,`selected_chemicals_${new Date().getTime()}.xlsx`)},children:[e.jsx(We,{size:18}),a("common.export_selected","تصدير المختار")]}),e.jsxs("button",{onClick:()=>{const c=g.filter(y=>A.includes(y.id));V(c)},className:"flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/20 text-primary-container hover:bg-primary hover:text-white transition-all font-black text-sm",children:[e.jsx($e,{size:18}),a("chemicals.btn_print_stock_cards","بطاقات المختار")]}),e.jsx("button",{onClick:()=>F([]),className:"p-2.5 hover:bg-surface/10 rounded-full transition-all",children:e.jsx(Be,{size:20})})]})]})}),e.jsx(_t,{isOpen:he,onClose:()=>K(!1),onSubmit:N,onSmartFill:ne,isGenerating:T,newChemical:B,editingChemical:k,onChange:(c,y)=>G(n=>({...n,[c]:y}))}),e.jsx(Dt,{isOpen:re,chemicalsLength:g.length,onClose:()=>be(!1),onConfirm:v}),e.jsx(Et,{isOpen:se,suggestedUpdate:Ie,selectedChemical:i,onClose:()=>Te(!1),onApprove:le}),e.jsx(xe,{children:fe&&e.jsx(gt,{onClose:()=>ie(!1),onScan:c=>{ie(!1);let y=c;c.startsWith("APP_ID_")&&(y=c.split("_").slice(2,-1).join("_")),q(y);const n=g.find(w=>w.id===y||w.id===c);n?(M(n),I(n),K(!0)):alert("عذراً، لم يتم العثور على المادة بهذه الشيفرة.")}})})]})}export{Vt as default};
