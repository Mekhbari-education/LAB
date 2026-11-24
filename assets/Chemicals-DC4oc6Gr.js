const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./chemicals-BJh5_adp.js","./index-Dd6X_7_8.js","./vendor-react-6z4eij2j.js","./vendor-pdf-xlsx-DwRdWDJ0.js","./vendor-firebase-V1xyB863.js","./vendor-charts-Cu8ARVQL.js","./vendor-icons-7MiJvaMb.js","./index-CPtm6jtK.css"])))=>i.map(i=>d[i]);
import{j as e,v as jt,r as x,h as Nt}from"./vendor-react-6z4eij2j.js";import{_ as K,r as kt,u as Z,w as pt}from"./vendor-pdf-xlsx-DwRdWDJ0.js";import{A as ve,m as F,d as j,u as St,j as Ct,k as st,P as it,h as nt,O as Xe}from"./index-Dd6X_7_8.js";import{Q as zt}from"./QRScanner-BPv44Efo.js";import{aL as lt,X as He,S as ge,j as et,ar as _t,aM as Dt,ag as At,aj as ot,$ as Pe,ap as Et,n as ct,aG as $t,aq as dt,aI as It,r as Tt,g as Pt,aN as Lt,T as Ke,aO as qt,Y as Ze,p as Ot}from"./vendor-icons-7MiJvaMb.js";import{u as Ht}from"./index-DFRzkOUW.js";import{u as Gt}from"./useSqlCollection-CEJ0bC1S.js";import{e as Rt,a as Je}from"./geminiService-D6gc2G2n.js";import{logActivity as Le,LogAction as qe,LogModule as Oe}from"./loggingService-CAuKfCj8.js";import"./vendor-firebase-V1xyB863.js";import"./vendor-charts-Cu8ARVQL.js";function Ft({isOpen:E,onClose:r,onSubmit:p,onSmartFill:m,isGenerating:$,newChemical:y,editingChemical:L,onChange:h}){var P;return E?e.jsx(ve,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6",children:[e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:r,className:"absolute inset-0 bg-primary/20 backdrop-blur-sm"}),e.jsxs(F.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5 relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-ee-[100px] -me-8 -mt-8"}),e.jsxs("div",{className:"relative z-10 flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(lt,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:L?"تعديل بيانات المادة":"إضافة مادة كيميائية جديدة"})]}),e.jsx("button",{onClick:r,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(He,{size:24})})]}),e.jsxs("form",{onSubmit:p,className:"p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsxs("div",{className:"md:col-span-2 flex items-end gap-4",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"PRODUIT CHIMIQUE"}),e.jsx("input",{required:!0,className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:y.nameEn||"",onChange:n=>h("nameEn",n.target.value)})]}),e.jsxs("button",{type:"button",onClick:m,disabled:$,className:"bg-primary-container text-primary px-6 py-4 rounded-2xl flex items-center gap-2 font-black hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50 h-[58px]",title:"تعبئة ذكية للمعلومات",children:[$?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(lt,{size:20}),e.jsx("span",{className:"hidden md:inline",children:"تعبئة ذكية"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الاسم العربي"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:y.nameAr||"",onChange:n=>h("nameAr",n.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الصيغة الكيميائية"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:y.formula||"",onChange:n=>h("formula",n.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"رقم CAS"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:y.casNumber||"",onChange:n=>h("casNumber",n.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"درجة حرارة التخزين"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:y.storageTemp||"",onChange:n=>h("storageTemp",n.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الحالة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start",value:y.state||"solid",onChange:n=>h("state",n.target.value),children:[e.jsx("option",{value:"solid",children:"صلب (Solid)"}),e.jsx("option",{value:"liquid",children:"سائل (Liquid)"}),e.jsx("option",{value:"gas",children:"غاز (Gas)"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الكمية"}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("input",{type:"number",required:!0,className:"flex-1 bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:y.quantity||0,onChange:n=>h("quantity",Number(n.target.value))}),e.jsxs("select",{className:"bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer",value:y.unit||"g",onChange:n=>h("unit",n.target.value),children:[e.jsx("option",{value:"g",children:"g"}),e.jsx("option",{value:"kg",children:"kg"}),e.jsx("option",{value:"ml",children:"ml"}),e.jsx("option",{value:"L",children:"L"}),e.jsx("option",{value:"unit",children:"Unit"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"تصنيف الخطورة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start",value:y.hazardClass||"safe",onChange:n=>h("hazardClass",n.target.value),children:[e.jsx("option",{value:"safe",children:"آمن"}),e.jsx("option",{value:"danger",children:"خطر"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"GHS (فواصل بين الرموز)"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",placeholder:"GHS01, GHS02...",value:((P=y.ghs)==null?void 0:P.join(", "))||"",onChange:n=>h("ghs",n.target.value.split(",").map(q=>q.trim()).filter(Boolean))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الرف"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:y.shelf||"",onChange:n=>h("shelf",n.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الصلاحية ⚠"}),e.jsx("input",{type:"date",className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:y.expiryDate||"",onChange:n=>h("expiryDate",n.target.value)})]}),e.jsxs("div",{className:"md:col-span-2 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"ملاحظات"}),e.jsx("textarea",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold min-h-[100px] text-start",value:y.notes||"",onChange:n=>h("notes",n.target.value)})]}),e.jsx("div",{className:"md:col-span-2 pt-6",children:e.jsx("button",{type:"submit",className:"w-full bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:L?"حفظ التعديلات":"تأكيد إضافة المادة للمخزن"})})]})]})]})}):null}function Bt({isOpen:E,chemicalsLength:r,onClose:p,onConfirm:m}){return E?e.jsx(ve,{children:e.jsxs("div",{className:"fixed inset-0 z-[100] flex items-center justify-center p-6",children:[e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:p,className:"absolute inset-0 bg-black/60 backdrop-blur-sm"}),e.jsxs(F.div,{initial:{opacity:0,scale:.9,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9,y:20},className:"relative bg-surface-container-lowest rounded-[32px] p-10 max-w-md w-full shadow-2xl border border-outline/10 text-right",children:[e.jsx("div",{className:"w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8",children:e.jsx(ge,{size:40,className:"text-primary"})}),e.jsx("h3",{className:"text-3xl font-black text-primary mb-4 tracking-tight",children:"تحديث ذكي شامل"}),e.jsxs("p",{className:"text-secondary/80 text-lg leading-relaxed mb-10",children:["هل أنت متأكد من رغبتك في تحديث معلومات ",e.jsx("span",{className:"font-black text-primary",children:r})," مادة ذكياً؟",e.jsx("br",{}),e.jsx("br",{}),"قد تستغرق هذه العملية بعض الوقت. سيتم تحديث البيانات تلقائياً بناءً على اقتراحات الذكاء الاصطناعي."]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:m,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:"بدء التحديث"}),e.jsx("button",{onClick:p,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95",children:"إلغاء"})]})]})]})}):null}function Mt({isOpen:E,suggestedUpdate:r,selectedChemical:p,onClose:m,onApprove:$}){return!E||!r||!p?null:e.jsx(ve,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4",children:[e.jsx(F.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:m,className:"absolute inset-0 bg-primary/20 backdrop-blur-xl"}),e.jsxs(F.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(ge,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:"مراجعة التحديث الذكي"})]}),e.jsx("button",{onClick:m,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(He,{size:24})})]}),e.jsxs("div",{className:"p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsx("p",{className:"text-secondary/80 font-bold text-center bg-surface-container-low p-4 rounded-2xl border border-outline/5",children:"تم العثور على معلومات أكثر دقة لهذه المادة. يرجى مراجعة التغييرات المقترحة أدناه قبل الموافقة."}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-secondary/40 uppercase tracking-widest border-b border-outline/5 pb-2",children:"المعلومات الحالية"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-secondary",children:[p.nameEn," / ",p.nameAr]})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-secondary",children:p.formula})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-secondary",children:p.casNumber||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-secondary",children:p.storageTemp||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-secondary",children:p.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-secondary/60",children:p.notes||"لا توجد"})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2",children:"المعلومات المقترحة ✨"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.nameEn!==p.nameEn||r.nameAr!==p.nameAr?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-primary",children:[r.nameEn," / ",r.nameAr]})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.formula!==p.formula?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-primary",children:r.formula})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.casNumber!==p.casNumber?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-primary",children:r.casNumber})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.storageTemp!==p.storageTemp?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-primary",children:r.storageTemp})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.hazardClass!==p.hazardClass?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-primary",children:r.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:j("p-4 rounded-2xl border transition-all",r.notes!==p.notes?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-primary/80",children:r.notes})]})]})]})]})]}),e.jsxs("div",{className:"p-10 bg-surface-container-low border-t border-outline/5 flex gap-4",children:[e.jsxs("button",{onClick:$,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(et,{size:24}),"موافقة وتحديث البيانات"]}),e.jsxs("button",{onClick:m,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(_t,{size:24}),"إلغاء التغييرات"]})]})]})]})})}const re={GHS01:"/ghs/GHS01.png",GHS02:"/ghs/GHS02.png",GHS03:"/ghs/GHS03.png",GHS04:"/ghs/GHS04.png",GHS05:"/ghs/GHS05.png",GHS06:"/ghs/GHS06.png",GHS07:"/ghs/GHS07.png",GHS08:"/ghs/GHS08.png",GHS09:"/ghs/GHS09.png"},ye={GHS01:"متفجرات",GHS02:"قابل للاشتعال",GHS03:"مؤكسد",GHS04:"غاز تحت الضغط",GHS05:"أكال / مسبب للتآكل",GHS06:"سمية حادة (قاتل)",GHS07:"تهيج / تحسس / خطر",GHS08:"خطر صحي جسيم",GHS09:"خطر بيئي"};function Vt(E=!1){const{schoolId:r,schoolName:p,directorate:m,commune:$,academicYear:y}=St(),{openPrintPreview:L}=Ct(),h=y||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025/2026",[P]=jt(),[n,q]=x.useState([]),[Ge,V]=x.useState(!0),[J,se]=x.useState(""),[ie,we]=x.useState(P.get("filter")==="low"),[f,z]=x.useState(null),[Re,ne]=x.useState(!1),[ee,le]=x.useState(null),B=x.useRef(null),[U,oe]=x.useState(!1),[je,I]=x.useState(!1),[Fe,ce]=x.useState(!1),[Be,Ne]=x.useState(!1),[Me,Y]=x.useState(!1),[ke,Se]=x.useState(!1),[Ce,de]=x.useState(null),[Ve,te]=x.useState({current:0,total:0}),[pe,O]=x.useState([]),[S,me]=x.useState(null),[Ue,xe]=x.useState(!1),[v,ze]=x.useState(null),[he,Ye]=x.useState(!1),_=(a,s)=>{de({type:a,message:s}),setTimeout(()=>{de(t=>(t==null?void 0:t.message)===s?null:t)},4e3)},ue=a=>{if(!a)return"غير محدد";if(!a.includes("-"))return a;const[s,t,i]=a.split("-");return!s||!t||!i?a:`${i}/${t}/${s}`},[H,be]=x.useState({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""}),{data:C,loading:Q,error:G,invalidate:ae}=Gt("chemicals","/api/db/chemicals");x.useEffect(()=>{if(!Q){q(C),V(!1);const a=new Set(C.map(t=>t.id));O(t=>{const i=t.filter(o=>a.has(o));return i.length===t.length?t:i});const s=P.get("id");if(s){let t=s;s.startsWith("APP_ID_")&&(t=s.split("_").slice(2,-1).join("_")),se(t);const i=C.find(o=>o.id===s||o.id===t);i?z(i):C.length>0&&(!f||!a.has(f.id))?z(C[0]):C.length===0&&z(null)}else C.length===0?z(null):(!f||!a.has(f.id))&&z(C[0])}},[C,Q,P]);const Qe=async a=>{a.preventDefault();try{if(ee){const{id:s}=ee,{updateChemical:t}=await K(async()=>{const{updateChemical:i}=await import("./chemicals-BJh5_adp.js");return{updateChemical:i}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await t(s,H),await Le(r,qe.UPDATE,Oe.CHEMICALS,`تعديل بيانات المادة: ${H.nameAr}`,s)}else{const{createChemical:s}=await K(async()=>{const{createChemical:i}=await import("./chemicals-BJh5_adp.js");return{createChemical:i}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url),t=await s(H);await Le(r,qe.CREATE,Oe.CHEMICALS,`إضافة مادة جديدة: ${H.nameAr}`,t.id)}ne(!1),le(null),await ae(),be({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""})}catch(s){nt(s,ee?Xe.UPDATE:Xe.CREATE,"chemicals")}},D=async()=>{const a=H.nameEn||H.nameAr;if(!a){alert("يرجى إدخال اسم المادة أولاً (بالعربية أو الإنجليزية)");return}I(!0);try{const s=await Je(a);if(s){let t="";if(s.expiryYears>0){const i=new Date;i.setFullYear(i.getFullYear()+s.expiryYears),t=i.toISOString().split("T")[0]}be(i=>({...i,nameEn:s.nameEn||i.nameEn,nameAr:s.nameAr||i.nameAr,formula:s.formula||i.formula,casNumber:s.casNumber||i.casNumber,storageTemp:s.storageTemp||i.storageTemp,hazardClass:s.hazardClass||i.hazardClass,ghs:s.ghs||i.ghs,expiryDate:t||i.expiryDate,notes:s.notes||i.notes}))}else alert("لم نتمكن من الحصول على معلومات دقيقة لهذه المادة. يرجى إدخالها يدوياً.")}catch(s){console.error("Smart fill error:",s),alert("حدث خطأ أثناء محاولة الحصول على المعلومات الذكية.")}finally{I(!1)}},R=async a=>{const s=a||f;if(s){I(!0);try{const t=await Je(s.nameEn||s.nameAr);t?(me(t),a&&z(a),xe(!0)):alert("لم نتمكن من الحصول على اقتراحات تحديث لهذه المادة.")}catch(t){console.error("Smart update request error:",t),alert("حدث خطأ أثناء طلب التحديث الذكي.")}finally{I(!1)}}},fe=async()=>{if(!(!f||!S))try{let a=f.expiryDate;if(S.expiryYears>0){const t=new Date;t.setFullYear(t.getFullYear()+S.expiryYears),a=t.toISOString().split("T")[0]}const{updateChemical:s}=await K(async()=>{const{updateChemical:t}=await import("./chemicals-BJh5_adp.js");return{updateChemical:t}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await s(f.id,{nameEn:S.nameEn,nameAr:S.nameAr,formula:S.formula,casNumber:S.casNumber,storageTemp:S.storageTemp,hazardClass:S.hazardClass,ghs:S.ghs,expiryDate:a,notes:S.notes}),xe(!1),me(null),alert("تم تحديث معلومات المادة بنجاح!")}catch(a){nt(a,Xe.UPDATE,`chemicals/${f.id}`)}},_e=async()=>{if(Ne(!1),!await Rt()){alert("يرجى اختيار مفتاح API الخاص بك لاستخدام ميزة التحديث الذكي.");return}ce(!0),te({current:0,total:n.length});let s=0,t=0;for(let i=0;i<n.length;i++){const o=n[i];te({current:i+1,total:n.length});try{const c=await Je(o.nameEn||o.nameAr);if(c){let k=o.expiryDate;if(c.expiryYears>0){const T=new Date;T.setFullYear(T.getFullYear()+c.expiryYears),k=T.toISOString().split("T")[0]}const{updateChemical:M}=await K(async()=>{const{updateChemical:T}=await import("./chemicals-BJh5_adp.js");return{updateChemical:T}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await M(o.id,{nameEn:c.nameEn||o.nameEn,nameAr:c.nameAr||o.nameAr,formula:c.formula||o.formula,casNumber:c.casNumber||o.casNumber,storageTemp:c.storageTemp||o.storageTemp,hazardClass:c.hazardClass||o.hazardClass,ghs:c.ghs||o.ghs,expiryDate:k||o.expiryDate,notes:c.notes||o.notes}),s++}else t++}catch(c){console.error(`Error updating chemical ${o.nameEn}:`,c),t++;const k=(c==null?void 0:c.message)||String(c);if(k.includes("quota")||k.includes("RESOURCE_EXHAUSTED")){alert("تم إيقاف التحديث التلقائي بسبب تجاوز حصة الاستخدام المسموح بها (Quota Exceeded). يرجى المحاولة لاحقاً أو التحقق من حساب Gemini API الخاص بك.");break}}await new Promise(c=>setTimeout(c,5e3))}ce(!1),alert(`اكتمل التحديث الذكي!
تم تحديث: ${s} مادة بنجاح
فشل: ${t} مادة`)},De=async(a,s)=>{try{const{deleteChemical:t}=await K(async()=>{const{deleteChemical:i}=await import("./chemicals-BJh5_adp.js");return{deleteChemical:i}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await t(a),q(i=>i.filter(o=>o.id!==a)),O(i=>i.filter(o=>o!==a)),(f==null?void 0:f.id)===a&&z(n.find(i=>i.id!==a)||null),await ae();try{await Le(r,qe.DELETE,Oe.CHEMICALS,`حذف المادة: ${s}`,a)}catch{}_("success",`تم حذف "${s||"المادة"}" من المخزن الكيميائي.`)}catch(t){console.error("Error deleting chemical:",t),_("error","تعذر حذف المادة. حاول مرة أخرى.")}},Ae=()=>{const a=W.filter(c=>c.ghs&&c.ghs.length>0||c.hazardClass==="danger").length,t=new Date().toLocaleDateString("ar-DZ",{day:"2-digit",month:"2-digit",year:"numeric"}),i=W.map((c,k)=>{const M=c.ghs&&c.ghs.length>0||c.hazardClass==="danger",T=(c.ghs||[]).map(X=>`<div class="ghs-pic"><img src="${re[X]}" alt="${X}" /></div>`).join("");return`
        <tr class="${M?"hazardous-row":""}">
          <td class="text-center">${k+1}</td>
          <td class="font-bold text-lg">${c.nameAr}</td>
          <td class="text-sm en-font">${c.nameEn}</td>
          <td class="mono-font">${c.formula||"—"}</td>
          <td class="text-center">${c.unit}</td>
          <td class="text-center font-bold">${c.quantity}</td>
          <td class="text-center">${c.state==="solid"?"صلب":c.state==="liquid"?"سائل":"غاز"}</td>
          <td class="text-center">${c.shelf||"—"}</td>
          <td><div class="ghs-container">${T}</div></td>
          <td class="notes-cell">${c.notes||"—"}</td>
        </tr>
      `}).join(""),o=`
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
                <div>مديرية التربية لولاية: ${m}</div>
                <div>${st(p,$)}</div>
              </div>
              <div class="oh-center">
                <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <div class="main-title">سجل جرد المواد الكيميائية للمخبر</div>
              </div>
              <div class="oh-left">
                <div>السنة الدراسية: ${h}</div>
                <div>تاريخ الطباعة: ${t}</div>
                <div class="inst-stamp">ختم المؤسسة</div>
              </div>
            </header>

            <div class="registry-meta">
              <span>إجمالي المواد: ${W.length}</span>
              <span style="border-right: 2px solid rgba(0,0,0,0.1); padding-right: 20px;">المواد الخطرة: ${a}</span>
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
                ${i}
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
    `;L({title:`سجل المواد الكيميائية — ${p}`,subtitle:`مديرية التربية: ${m||"—"} · السنة الدراسية: ${h}`,type:"custom",customHtml:o,headers:["#","الاسم العربي","Désignation (En)","الصيغة","الوحدة","الكمية","الحالة","الرف"],rows:W.map((c,k)=>[k+1,c.nameAr,c.nameEn,c.formula||"—",c.unit,c.quantity,c.state==="solid"?"صلب":c.state==="liquid"?"سائل":"غاز",c.shelf||"—"]),summaryCards:[{label:"إجمالي المواد",value:W.length},{label:"المواد الخطرة",value:a}],suggestedOrientation:"landscape"})},Ee=async()=>{const a=["#","الاسم العلمي","الاسم العربي","الصيغة","الكمية","الرف","تاريخ الصلاحية"],s=N.map((t,i)=>[i+1,t.nameEn||"",t.nameAr||"",t.formula||"",`${t.quantity} ${t.unit}`,t.shelf||"",ue(t.expiryDate)]);await it.generateTablePDF("تقرير جرد المواد الكيميائية المخبرية",a,s,`chemicals_inventory_${new Date().toISOString().split("T")[0]}.pdf`,{subtitle:`سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${N.length}`,schoolInfo:{school:p,commune:$,directorate:m,laboratory:"مخبر الكيمياء والعلوم الفيزيائية"},summaryCards:[{label:"إجمالي المواد الكيميائية",value:N.length},{label:"المواد السائلة",value:N.filter(t=>t.state==="liquid").length},{label:"المواد الصلبة",value:N.filter(t=>t.state==="solid").length},{label:"تاريخ إعداد التقرير",value:new Date().toLocaleDateString("ar-DZ")}]})},$e=()=>{const a=["#","الاسم العلمي","الاسم العربي","الصيغة","الكمية","الرف","تاريخ الصلاحية"],s=N.map((t,i)=>[i+1,t.nameEn||"",t.nameAr||"",t.formula||"",`${t.quantity} ${t.unit}`,t.shelf||"",ue(t.expiryDate)]);it.downloadTableWord("تقرير جرد المواد الكيميائية المخبرية",a,s,`chemicals_inventory_${new Date().toISOString().split("T")[0]}.doc`,{subtitle:`سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${N.length}`,schoolInfo:{school:p,commune:$,directorate:m,laboratory:"مخبر الكيمياء والعلوم الفيزيائية"},summaryCards:[{label:"إجمالي المواد الكيميائية",value:N.length},{label:"المواد السائلة",value:N.filter(t=>t.state==="liquid").length},{label:"المواد الصلبة",value:N.filter(t=>t.state==="solid").length},{label:"تاريخ إعداد التقرير",value:new Date().toLocaleDateString("ar-DZ")}]})},d=()=>{const a=Z.json_to_sheet(N.map(t=>({"الاسم (EN)":t.nameEn,"الاسم (AR)":t.nameAr,الصيغة:t.formula,"رقم CAS":t.casNumber,الكمية:t.quantity,الوحدة:t.unit,الحالة:t.state,الخطورة:t.hazardClass,الرف:t.shelf,"تاريخ الصلاحية":t.expiryDate,ملاحظات:t.notes}))),s=Z.book_new();Z.book_append_sheet(s,a,"Inventory"),pt(s,`chemical_inventory_${new Date().toISOString().split("T")[0]}.xlsx`)},b=async a=>{var i;const s=(i=a.target.files)==null?void 0:i[0];if(!s)return;oe(!0);const t=new FileReader;t.onload=async o=>{var c;try{const k=(c=o.target)==null?void 0:c.result,M=kt(k,{type:"binary",cellDates:!0}),T=M.SheetNames[0],X=M.Sheets[T],Ie=Z.sheet_to_json(X),ft=u=>{if(!u)return"";if(u instanceof Date)return u.toISOString().split("T")[0];const Te=new Date(u);return isNaN(Te.getTime())?String(u).trim():Te.toISOString().split("T")[0]},A=(u,Te)=>{const yt=Object.keys(u);for(const vt of Te){const rt=yt.find(wt=>wt.toLowerCase().trim()===vt.toLowerCase().trim());if(rt)return u[rt]}},at=Ie.map(u=>({nameAr:String(A(u,["الاسم بالعربية","nameAr","arabic name","الاسم","اسم المادة"])||"مادة كيميائية").trim(),nameEn:String(A(u,["الاسم بالإنجليزية","nameEn","english name","name"])||"").trim(),formula:String(A(u,["الصيغة الكيميائية","formula","الصيغة"])||"").trim(),casNumber:String(A(u,["رقم CAS","cas","casNumber","cas_number"])||"").trim(),unit:String(A(u,["الوحدة","unit"])||"g").trim(),quantity:Number(A(u,["الكمية","quantity"])||0),storageTemp:String(A(u,["درجة حرارة التخزين","storageTemp","درجة التخزين"])||"").trim(),state:String(A(u,["الحالة الفيزيائية","state","الحالة"])||"solid").trim(),hazardClass:String(A(u,["فئة الخطورة","hazardClass","الخطورة"])||"safe").trim(),shelf:String(A(u,["الرف","shelf","مكان التخزين"])||"").trim(),expiryDate:ft(A(u,["تاريخ انتهاء الصلاحية","expiryDate","تاريخ الانتهاء"])),notes:String(A(u,["ملاحظات","notes"])||"").trim()})),{createChemicalsBulk:gt}=await K(async()=>{const{createChemicalsBulk:u}=await import("./chemicals-BJh5_adp.js");return{createChemicalsBulk:u}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await gt(at),alert(`تم استيراد ${at.length} مادة بنجاح!`)}catch(k){console.error("Error importing XLS:",k),alert("حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.")}finally{oe(!1),B.current&&(B.current.value="")}},t.readAsBinaryString(s)},l=a=>{const s=new Date,t=a.map((o,c)=>{var X,Ie;const k=o.state==="solid"?"صلب":o.state==="liquid"?"سائل":"غاز",M=o.hazardClass==="danger"?(X=o.ghs)!=null&&X[0]?ye[o.ghs[0]]:"خطر":"آمن",T=(Ie=o.ghs)!=null&&Ie[0]?"☠️":"—";return`
        <div class="pcard">
          <div class="ph-container">
            <div class="ph">
              <div class="ph-r">مديرية التربية لولاية: ${m}<br>${st(p,$)}</div>
              <div class="ph-c">الجمهورية الجزائرية الديمقراطية الشعبية<br>وزارة التربية الوطنية</div>
              <div class="ph-l">
                <div>السنة الدراسية: ${h}</div>
                <div class="header-stamp">ختم المؤسسة</div>
              </div>
            </div>
          </div>

          <div class="pcard-badge">رقم البطاقة: ${c+1}</div>
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
                <span class="v">${k}</span>
             </div>
             <div class="ic-info-box">
                <span class="l">الرف</span>
                <span class="v">${o.shelf||"—"}</span>
             </div>
             <div class="ic-info-box danger">
                <span class="l">GHS</span>
                <span class="v emoji">${T}</span>
             </div>
          </div>

          <div class="ic-safety-strip">
             <b>طبيعة الخطورة:</b> ${M} 
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
             <span class="ref">REF: ${c+1}</span>
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
      `}).join(""),i=`
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
              background: transparent; 
              color: #1a1c1e;
              padding: 0;
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
                margin: 0 !important; border: 1px solid rgba(0,0,0,0.15) !important;
                border-radius: 24px !important; box-shadow: none !important;
                page-break-after: always !important; padding: 6mm !important;
                -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
              }
              .pcard:last-child { page-break-after: avoid !important; }
              .ph-container { margin: -6mm -6mm 4mm -6mm !important; padding: 5mm 6mm !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .ic-meta-expressive .ic-field, .ic-info-box, .ic-safety-strip, .pcard-badge, .rules-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .ic-tbl th { background: #e8ecef !important; border: 0.5pt solid var(--surface-variant) !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .ic-tbl td { border: 0.5pt solid var(--surface-variant) !important; }
            }
          </style>
        </head>
        <body>
          <div id="toolbar">
              <h3>🎨 جرد كيميائي — ${a.length} عنصر</h3>
              <button class="tb-btn tb-print" onclick="window.print()">🖨️ بدء الطباعة</button>
              <button class="tb-btn tb-close" onclick="window.close()">✕ إغلاق المعاينة</button>
          </div>
          <div id="body">
            ${t}
          </div>
        </body>
      </html>
    `;L({title:`بطاقات جرد كيميائي (${a.length} عنصر)`,type:"custom",customHtml:i,suggestedPaperSize:"a5",suggestedOrientation:"portrait"})},w=a=>{const s=`
      <html dir="rtl">
        <head>
          <title>بطاقة مادة - ${a.nameEn}</title>
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
            <div class="item"><span class="label">PRODUIT CHIMIQUE:</span> ${a.nameEn}</div>
            <div class="item"><span class="label">الاسم العربي:</span> ${a.nameAr}</div>
            <div class="item"><span class="label">الصيغة الكيميائية:</span> ${a.formula}</div>
            <div class="item"><span class="label">رقم CAS:</span> ${a.casNumber||"غير متوفر"}</div>
            <div class="item"><span class="label">درجة التخزين:</span> ${a.storageTemp||"غير متوفر"}</div>
            <div class="item"><span class="label">الحالة:</span> ${a.state}</div>
            <div class="item"><span class="label">الكمية الحالية:</span> ${a.quantity} ${a.unit}</div>
            <div class="item"><span class="label">الرف:</span> ${a.shelf}</div>
            <div class="item"><span class="label">الصلاحية:</span> ${a.expiryDate||"غير محدد"}</div>
            <div class="item" style="grid-column: span 2;">
              <span class="label">رموز السلامة GHS:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                ${(a.ghs||[]).map(t=>`
                  <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #ccc; padding: 5px; border-radius: 8px; width: 70px; background: #fff;">
                    <img src="${re[t]}" style="width: 40px; height: 40px;" />
                    <span style="font-size: 9px; margin-top: 4px; text-align: center; font-weight: bold;">${ye[t]||t}</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="item"><span class="label">تصنيف الخطورة:</span> <span class="${a.hazardClass==="danger"?"hazard":""}">${a.hazardClass==="danger"?"خطر":"آمن"}</span></div>
            <div class="item" style="grid-column: span 2;"><span class="label">ملاحظات:</span> ${a.notes||"لا توجد"}</div>
          </div>
          <div class="footer">طبع بتاريخ: ${new Date().toLocaleString("ar-DZ")}</div>
        </body>
      </html>
    `;L({title:`بطاقة تعريف مادة — ${a.nameAr||a.nameEn}`,type:"custom",customHtml:s,suggestedOrientation:"portrait"})},g=a=>{let s="asc";v&&v.key===a&&v.direction==="asc"&&(s="desc"),ze({key:a,direction:s})},We=a=>{O(s=>s.includes(a)?s.filter(t=>t!==a):[...s,a])},mt=()=>{const a=N.map(i=>i.id),s=new Set(a),t=a.length>0&&a.every(i=>pe.includes(i));O(t?i=>i.filter(o=>!s.has(o)):i=>Array.from(new Set([...i,...a])))},xt=async()=>{const a=pe.filter(s=>n.some(t=>t.id===s));if(a.length===0){Y(!1);return}Se(!0);try{const{deleteChemicalsBulk:s}=await K(async()=>{const{deleteChemicalsBulk:o}=await import("./chemicals-BJh5_adp.js");return{deleteChemicalsBulk:o}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await s(a);const t=new Set(a),i=n.filter(o=>!t.has(o.id));q(i),O([]),f&&t.has(f.id)&&z(i[0]||null),await ae();try{await Le(r,qe.DELETE,Oe.CHEMICALS,`حذف جماعي لـ ${a.length} مادة`)}catch{}_("success",`تم حذف ${a.length} مادة من المخزن الكيميائي بنجاح.`)}catch(s){console.error("Error bulk deleting chemicals:",s),_("error","تعذر حذف المواد المحددة. حاول مرة أخرى.")}finally{Se(!1),Y(!1)}},N=n.filter(a=>{var i,o,c;const s=((i=a.nameEn)==null?void 0:i.toLowerCase().includes(J.toLowerCase()))||((o=a.nameAr)==null?void 0:o.toLowerCase().includes(J.toLowerCase()))||((c=a.formula)==null?void 0:c.toLowerCase().includes(J.toLowerCase())),t=!ie||a.quantity<10;return s&&t}),W=x.useMemo(()=>{const a=[...N];return v!==null&&a.sort((s,t)=>{const i=s[v.key],o=t[v.key];return i===void 0||o===void 0?0:i<o?v.direction==="asc"?-1:1:i>o?v.direction==="asc"?1:-1:0}),a},[N,v]),ht=a=>(v==null?void 0:v.key)===a?v.direction==="asc"?e.jsx(Dt,{size:14,className:"mr-1"}):e.jsx(At,{size:14,className:"mr-1"}):e.jsx("div",{className:"w-[14px] mr-1"}),ut=n.filter(a=>a.quantity<10).length,tt=x.useRef(null),bt=Ht({count:W.length,getScrollElement:()=>tt.current,estimateSize:()=>72,overscan:10});return{searchParams:P,chemicals:n,setChemicals:q,loading:Ge,setLoading:V,searchTerm:J,setSearchTerm:se,filterLowStock:ie,setFilterLowStock:we,selectedChemical:f,setSelectedChemical:z,isAddModalOpen:Re,setIsAddModalOpen:ne,editingChemical:ee,setEditingChemical:le,fileInputRef:B,isImporting:U,setIsImporting:oe,isGenerating:je,setIsGenerating:I,isBulkUpdating:Fe,setIsBulkUpdating:ce,isBulkConfirmOpen:Be,setIsBulkConfirmOpen:Ne,isBulkDeleteConfirmOpen:Me,setIsBulkDeleteConfirmOpen:Y,isDeletingBulk:ke,toast:Ce,setToast:de,bulkProgress:Ve,setBulkProgress:te,selectedIds:pe,setSelectedIds:O,suggestedUpdate:S,setSuggestedUpdate:me,isReviewModalOpen:Ue,setIsReviewModalOpen:xe,sortConfig:v,setSortConfig:ze,isQRScannerOpen:he,setIsQRScannerOpen:Ye,formatDisplayDate:ue,newChemical:H,setNewChemical:be,handleAddChemical:Qe,handleSmartFill:D,handleRequestSmartUpdate:R,handleApproveUpdate:fe,handleBulkSmartUpdate:_e,handleDeleteChemical:De,handlePrintList:Ae,handleExportPDF:Ee,handleExportWord:$e,handleExportXLS:d,handleImportXLS:b,handlePrintInventoryCards:l,handlePrint:w,handleSort:g,handleToggleSelect:We,handleSelectAll:mt,handleBulkDelete:xt,filteredChemicals:N,sortedChemicals:W,getSortIcon:ht,lowStockCount:ut,parentRef:tt,rowVirtualizer:bt,chemicalsList:C,chemicalsLoading:Q,error:G,schoolId:r,schoolName:p,stateName:m}}function ra({isNested:E=!1}){var De,Ae,Ee,$e;const{t:r,i18n:p}=Nt(),{chemicals:m,loading:$,searchTerm:y,setSearchTerm:L,filterLowStock:h,setFilterLowStock:P,selectedChemical:n,setSelectedChemical:q,isAddModalOpen:Ge,setIsAddModalOpen:V,editingChemical:J,setEditingChemical:se,fileInputRef:ie,isImporting:we,isGenerating:f,isBulkUpdating:z,isBulkConfirmOpen:Re,setIsBulkConfirmOpen:ne,isBulkDeleteConfirmOpen:ee,setIsBulkDeleteConfirmOpen:le,isDeletingBulk:B,toast:U,setToast:oe,bulkProgress:je,selectedIds:I,setSelectedIds:Fe,suggestedUpdate:ce,isReviewModalOpen:Be,setIsReviewModalOpen:Ne,isQRScannerOpen:Me,setIsQRScannerOpen:Y,formatDisplayDate:ke,newChemical:Se,setNewChemical:Ce,handleAddChemical:de,handleSmartFill:Ve,handleRequestSmartUpdate:te,handleApproveUpdate:pe,handleBulkSmartUpdate:O,handleDeleteChemical:S,handlePrintList:me,handleExportPDF:Ue,handleExportWord:xe,handleExportXLS:v,handleImportXLS:ze,handlePrintInventoryCards:he,handlePrint:Ye,handleSort:_,handleToggleSelect:ue,handleSelectAll:H,handleBulkDelete:be,filteredChemicals:C,sortedChemicals:Q,getSortIcon:G,lowStockCount:ae,parentRef:Qe,rowVirtualizer:D}=Vt(E),R=I.filter(d=>m.some(b=>b.id===d)),fe=m.filter(d=>R.includes(d.id)),_e=C.length>0&&C.every(d=>R.includes(d.id));return e.jsxs("div",{className:j("space-y-10 max-w-7xl mx-auto pb-20",!E&&"px-4"),dir:p.language==="ar"?"rtl":"ltr",children:[U&&e.jsxs("div",{className:j("fixed bottom-6 start-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-bold max-w-md transition-all",U.type==="success"&&"bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800",U.type==="error"&&"bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800",U.type==="info"&&"bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800"),children:[e.jsx("span",{className:"flex-1",children:U.message}),e.jsx("button",{onClick:()=>oe(null),className:"opacity-60 hover:opacity-100",children:e.jsx(He,{size:16})})]}),!E&&e.jsxs("header",{className:"flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("h1",{className:"text-4xl font-black text-primary tracking-tighter",children:r("chemicals.title","المخزن الكيميائي")}),e.jsx("p",{className:"text-secondary/80 text-base font-medium",children:r("chemicals.subtitle","إدارة وتتبع المحاليل والكواشف الكيميائية")})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx("input",{type:"file",ref:ie,onChange:ze,className:"hidden",accept:".xls,.xlsx"}),e.jsxs("button",{onClick:()=>Y(!0),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(ot,{size:20}),r("common.scan_qr","مسح QR")]}),e.jsxs("button",{onClick:me,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(Pe,{size:20}),r("equipment.btn_print_list","طباعة القائمة")]}),e.jsxs("button",{onClick:()=>he(Q),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(Pe,{size:20,className:"text-primary"}),r("chemicals.btn_print_stock_cards","طباعة بطاقات المخزون")]}),e.jsxs("button",{onClick:xe,className:"bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-sm",title:"تصدير كملف Word (.doc) رسمي بنفس تفاصيل الـ PDF",children:[e.jsx(Et,{size:20}),r("common.export_word","تصدير Word")]}),e.jsxs("button",{onClick:Ue,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(ct,{size:20}),r("common.export_pdf","تصدير PDF")]}),e.jsxs("button",{onClick:()=>{var d;return(d=ie.current)==null?void 0:d.click()},disabled:we,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm disabled:opacity-50",children:[we?e.jsx("div",{className:"w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"}):e.jsx($t,{size:20}),r("common.import_xls","استيراد XLS")]}),e.jsxs("button",{onClick:v,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(dt,{size:20}),r("common.export_xls","تصدير الجرد")]}),e.jsxs("button",{onClick:()=>ne(!0),disabled:z||m.length===0,className:"bg-primary text-on-primary px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50",title:"تحديث ذكي لجميع المواد في القائمة",children:[z?e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsxs("span",{className:"text-xs",children:[je.current,"/",je.total]})]}):e.jsx(ge,{size:20}),r("equipment.btn_smart_update","تحديث ذكي للكل")]}),e.jsxs("button",{onClick:()=>V(!0),className:"bg-primary text-on-primary px-8 py-3.5 rounded-full flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95",children:[e.jsx(It,{size:20}),r("chemicals.btn_add","إضافة مادة")]})]})]}),!E&&e.jsxs("section",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"bg-surface-container-low p-7 rounded-[32px] border border-outline/5 hover:border-outline/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-secondary/60 font-black uppercase tracking-widest mb-3",children:r("chemicals.stat_total_chemicals","إجمالي المواد")}),e.jsx("h3",{className:"text-4xl font-black text-primary group-hover:scale-110 transition-transform origin-right",children:m.length})]}),e.jsxs("div",{className:"bg-error-container/40 p-7 rounded-[32px] border border-error/10 hover:border-error/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-error-container/60 font-black uppercase tracking-widest mb-3",children:r("chemicals.col_hazard","مواد خطرة")}),e.jsx("h3",{className:"text-4xl font-black text-error group-hover:scale-110 transition-transform origin-right",children:m.filter(d=>d.ghs&&d.ghs.length>0||d.hazardClass==="danger").length})]}),e.jsxs("div",{className:"bg-tertiary-fixed/40 p-7 rounded-[32px] border border-tertiary/10 hover:border-tertiary/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-tertiary-fixed/60 font-black uppercase tracking-widest mb-3",children:r("chemicals.stat_expired","تنتهي قريباً")}),e.jsx("h3",{className:"text-4xl font-black text-tertiary group-hover:scale-110 transition-transform origin-right",children:m.filter(d=>{if(!d.expiryDate)return!1;const b=new Date(d.expiryDate),l=new Date;return l.setMonth(l.getMonth()+3),b<l&&b>new Date}).length.toString().padStart(2,"0")})]}),e.jsxs("div",{className:"bg-primary p-7 rounded-[32px] text-on-primary shadow-xl shadow-primary/20 hover:shadow-2xl transition-all group relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-surface/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10",children:[e.jsx("p",{className:"text-white/60 text-xs font-black uppercase tracking-widest mb-3",children:r("equipment.field_quantity","سعة التخزين")}),e.jsx("h3",{className:"text-4xl font-black",children:"68%"})]})]})]}),ae>0&&e.jsxs(F.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},className:"bg-error-container/30 backdrop-blur-sm text-on-error-container p-5 rounded-[32px] flex items-center justify-between border border-error/10 shadow-lg shadow-error/5",children:[e.jsxs("div",{className:"flex items-center gap-4 text-error",children:[e.jsx("div",{className:"bg-error p-3 rounded-2xl text-white shadow-lg shadow-error/20",children:e.jsx(Tt,{size:20})}),e.jsxs("span",{className:"font-black text-base",children:[r("chemicals.low_stock_badge","تنبيه: يوجد مواد منخفضة المخزون!")," (",ae,")"]})]}),e.jsx("button",{onClick:()=>P(!h),className:"text-sm font-black underline underline-offset-4 text-error px-6 py-2.5 hover:bg-error/10 rounded-full transition-all active:scale-95",children:h?r("common.all","عرض الكل"):r("chemicals.filter_low_stock","عرض المواد المنخفضة")})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-10",children:[e.jsx("div",{className:"lg:col-span-8 space-y-8",children:e.jsxs("div",{className:"bg-surface-container-lowest rounded-[32px] overflow-hidden border border-outline/10 shadow-sm",children:[e.jsxs("div",{className:"p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low/30 border-b border-outline/5",children:[e.jsxs("div",{className:"relative w-full md:w-80",children:[e.jsx(Pt,{className:"absolute start-4 top-1/2 -translate-y-1/2 text-outline/60",size:20}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-full ps-12 pe-6 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all text-start",placeholder:r("chemicals.search_placeholder","بحث عن مادة (اسم أو صيغة)..."),value:y,onChange:d=>L(d.target.value)})]}),e.jsx("div",{className:"flex gap-3",children:e.jsx("button",{onClick:()=>P(!h),className:j("p-3 border rounded-full transition-all active:scale-90",h?"bg-primary text-on-primary border-primary shadow-lg shadow-primary/20":"bg-surface-container-low hover:bg-surface-container-high border-outline/10 text-secondary"),title:h?r("common.all","عرض الكل"):r("chemicals.filter_low_stock","تصفية المواد المنخفضة"),children:e.jsx(Lt,{size:22})})})]}),e.jsx("div",{ref:Qe,className:"overflow-auto scrollbar-hide relative max-h-[700px] w-full",children:e.jsxs("table",{className:"w-full text-start border-collapse table-auto relative",children:[e.jsx("thead",{className:"sticky top-0 z-20 bg-surface-container-lowest",children:e.jsxs("tr",{className:"bg-surface-container-low/50 text-secondary/60 text-[11px] font-black uppercase tracking-widest",children:[e.jsx("th",{className:"px-3 py-5 text-start w-12",children:e.jsx("div",{onClick:H,className:j("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",_e?"bg-primary border-primary text-white":"border-outline/30 hover:border-primary/50"),children:_e&&e.jsx(et,{size:12})})}),e.jsx("th",{className:"px-3 py-5 text-start w-10",children:"#"}),e.jsx("th",{className:"px-3 py-5 text-start min-w-[140px] cursor-pointer hover:text-primary transition-colors",onClick:()=>_("nameEn"),children:e.jsxs("div",{className:"flex items-center",children:[G("nameEn"),r("chemicals.col_name_en","المادة (EN/AR)")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-16 hidden sm:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>_("formula"),children:e.jsxs("div",{className:"flex items-center",children:[G("formula"),r("chemicals.col_formula","الصيغة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 cursor-pointer hover:text-primary transition-colors",onClick:()=>_("quantity"),children:e.jsxs("div",{className:"flex items-center",children:[G("quantity"),r("chemicals.col_quantity","الكمية")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden lg:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>_("state"),children:e.jsxs("div",{className:"flex items-center",children:[G("state"),r("common.status","الحالة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-18 cursor-pointer hover:text-primary transition-colors",onClick:()=>_("hazardClass"),children:e.jsxs("div",{className:"flex items-center",children:[G("hazardClass"),r("chemicals.col_hazard","الخطورة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 hidden xl:table-cell",children:"GHS"}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden md:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>_("shelf"),children:e.jsxs("div",{className:"flex items-center",children:[G("shelf"),r("chemicals.col_location","الرف")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-24 cursor-pointer hover:text-primary transition-colors",onClick:()=>_("expiryDate"),children:e.jsxs("div",{className:"flex items-center",children:[G("expiryDate"),r("chemicals.col_expiry","الصلاحية")]})}),e.jsx("th",{className:"px-3 py-5 text-right hidden 2xl:table-cell",children:r("common.notes","ملاحظات")}),e.jsx("th",{className:"px-3 py-5 text-center w-24",children:r("common.actions","إجراءات")})]})}),e.jsx("tbody",{className:"divide-y divide-outline/5 relative w-full",children:$?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:r("common.loading","جاري التحميل...")})}):Q.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:r("common.empty","لا توجد مواد مطابقة للبحث")})}):e.jsxs(e.Fragment,{children:[D.getVirtualItems().length>0&&D.getVirtualItems()[0].start>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${D.getVirtualItems()[0].start}px`},colSpan:12})}),D.getVirtualItems().map(d=>{var w;const b=d.index,l=Q[b];return e.jsxs("tr",{onClick:()=>q(l),ref:D.measureElement,"data-index":b,className:j("hover:bg-surface-container-low/40 transition-all group cursor-pointer text-base",(n==null?void 0:n.id)===l.id&&"bg-surface-container-low/60 border-r-4 border-primary"),children:[e.jsx("td",{className:"px-3 py-4",children:e.jsx("div",{onClick:g=>{g.stopPropagation(),ue(l.id)},className:j("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",I.includes(l.id)?"bg-primary border-primary text-white scale-110":"border-outline/30 group-hover:border-primary/50"),children:I.includes(l.id)&&e.jsx(et,{size:12})})}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/60",children:b+1}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"font-black text-primary break-words leading-tight",children:l.nameEn}),e.jsx("span",{className:"text-xs text-secondary/60 break-words mt-0.5",children:l.nameAr})]})}),e.jsx("td",{className:"px-3 py-4 font-mono font-bold text-secondary/80 hidden sm:table-cell text-xs",children:l.formula}),e.jsxs("td",{className:"px-3 py-4 font-black text-primary whitespace-nowrap",children:[l.quantity," ",e.jsx("span",{className:"text-[10px] text-secondary/60",children:l.unit})]}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/80 hidden lg:table-cell text-xs",children:l.state==="solid"?"صلب":l.state==="liquid"?"سائل":"غاز"}),e.jsx("td",{className:"px-3 py-4",children:e.jsx("span",{className:j("px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm",l.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-primary-fixed/40 text-primary"),children:l.hazardClass==="danger"?"خطر":"آمن"})}),e.jsx("td",{className:"px-3 py-4 hidden xl:table-cell",children:e.jsxs("div",{className:"flex gap-1.5",children:[(w=l.ghs)==null?void 0:w.slice(0,3).map((g,We)=>e.jsxs("div",{className:"w-9 h-9 bg-surface rounded-lg flex items-center justify-center border border-outline/20 p-1 shadow-sm hover:scale-125 transition-transform z-10 relative group/ghs",title:ye[g]||g,children:[re[g]?e.jsx("img",{src:re[g],alt:g,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("span",{className:"text-[8px] font-black",children:g}),e.jsx("div",{className:"absolute bottom-full mb-2 hidden group-hover/ghs:block bg-secondary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none shadow-xl",children:ye[g]||g})]},We)),l.ghs&&l.ghs.length>3&&e.jsxs("span",{className:"text-[10px] text-secondary/40 self-center font-bold",children:["+",l.ghs.length-3]})]})}),e.jsx("td",{className:"px-3 py-4 font-bold text-primary hidden md:table-cell text-xs",children:l.shelf}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("span",{className:j("font-bold whitespace-nowrap text-xs",l.expiryDate&&new Date(l.expiryDate)<new Date?"text-error flex items-center gap-1":"text-secondary/80"),children:[ke(l.expiryDate),l.expiryDate&&new Date(l.expiryDate)<new Date&&e.jsx(Ke,{size:14})]})}),e.jsx("td",{className:"px-3 py-4 text-xs text-secondary/60 hidden 2xl:table-cell min-w-[200px] leading-relaxed break-words",children:l.notes}),e.jsx("td",{className:"px-3 py-4 text-center",children:e.jsxs("div",{className:"flex gap-1 justify-center",children:[e.jsx("button",{onClick:g=>{g.stopPropagation(),te(l)},disabled:f,className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تحديث ذكي",children:e.jsx(ge,{size:16})}),e.jsx("button",{onClick:g=>{g.stopPropagation(),se(l),Ce({nameEn:l.nameEn,nameAr:l.nameAr,formula:l.formula,casNumber:l.casNumber||"",storageTemp:l.storageTemp||"",unit:l.unit,quantity:l.quantity,state:l.state,hazardClass:l.hazardClass,ghs:l.ghs,shelf:l.shelf,expiryDate:l.expiryDate,notes:l.notes}),V(!0)},className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تعديل",children:e.jsx(qt,{size:16})}),e.jsx("button",{onClick:g=>{g.stopPropagation(),S(l.id,l.nameAr)},className:"p-1.5 text-outline/40 hover:text-error hover:bg-error/10 transition-all rounded-full active:scale-90",title:"حذف",children:e.jsx(Ze,{size:16})})]})})]},l.id)}),D.getVirtualItems().length>0&&D.getTotalSize()-(((Ae=(De=D.getVirtualItems())==null?void 0:De.at(-1))==null?void 0:Ae.end)||0)>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${D.getTotalSize()-((($e=(Ee=D.getVirtualItems())==null?void 0:Ee.at(-1))==null?void 0:$e.end)||0)}px`},colSpan:12})})]})})]})})]})}),e.jsxs("div",{className:"lg:col-span-4 space-y-8",children:[n?e.jsxs(F.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},className:"bg-surface-container-lowest rounded-[32px] p-10 relative overflow-hidden border border-outline/10 shadow-sm",children:[e.jsx("div",{className:"absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[120px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10 space-y-8",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("span",{className:j("text-[11px] px-4 py-1.5 rounded-[28px_28px_4px_28px] font-black uppercase tracking-widest shadow-sm",n.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-tertiary-fixed/60 text-tertiary"),children:n.hazardClass==="danger"?r("chemicals.hazard_danger","مادة خطرة"):r("chemicals.hazard_safe","مادة آمنة")}),n.hazardClass==="danger"&&e.jsx("div",{className:"flex gap-2 text-error animate-pulse",children:e.jsx(Ke,{size:28})})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-3xl font-black text-primary mb-1 tracking-tight",children:n.nameEn}),e.jsx("h3",{className:"text-xl font-bold text-secondary mb-2 tracking-tight",children:n.nameAr}),e.jsx("p",{className:"text-lg font-mono font-bold text-secondary/60",children:n.formula})]}),e.jsxs("div",{className:"space-y-5 pt-8 border-t border-outline/5",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("chemicals.field_cas","رقم CAS")}),e.jsx("span",{className:"font-black text-primary text-lg",children:n.casNumber||r("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("chemicals.field_storage_temp","درجة التخزين")}),e.jsx("span",{className:"font-black text-primary text-lg",children:n.storageTemp||r("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("common.status","الحالة")}),e.jsx("span",{className:"font-black text-primary text-lg",children:n.state==="solid"?r("chemicals.state_solid","صلب"):n.state==="liquid"?r("chemicals.state_liquid","سائل"):r("chemicals.state_gas","غاز")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("chemicals.col_location","الرف")}),e.jsx("span",{className:"font-black text-primary text-lg",children:n.shelf})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("chemicals.col_expiry","الصلاحية")}),e.jsx("span",{className:j("font-black text-lg",n.expiryDate&&new Date(n.expiryDate)<new Date?"text-error":"text-primary"),children:ke(n.expiryDate)})]}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:r("common.notes","ملاحظات")}),e.jsx("span",{className:"font-black text-primary text-sm text-left flex-1 mr-4 leading-relaxed break-words",children:n.notes||r("common.none","لا توجد")})]}),n.ghs&&n.ghs.length>0&&e.jsxs("div",{className:"pt-6 border-t border-outline/5",children:[e.jsx("span",{className:"text-[11px] font-black text-secondary/40 uppercase tracking-[0.2em] block mb-4",children:r("chemicals.ghs_symbols","رموز السلامة GHS")}),e.jsx("div",{className:"grid grid-cols-3 gap-4",children:n.ghs.map((d,b)=>e.jsxs("div",{className:"bg-surface p-3 rounded-2xl border border-outline/10 shadow-md hover:shadow-lg hover:border-primary/30 transition-all flex flex-col items-center gap-2 group/card",children:[e.jsx("div",{className:"w-16 h-16 flex items-center justify-center group-hover/card:scale-110 transition-transform",children:re[d]?e.jsx("img",{src:re[d],alt:d,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("div",{className:"w-full h-full flex items-center justify-center text-xs font-black bg-surface-container-high rounded-xl",children:d})}),e.jsx("span",{className:"text-[10px] font-black text-secondary text-center leading-tight",children:ye[d]||d})]},b))})]}),e.jsxs("div",{className:"space-y-3 pt-2",children:[e.jsxs("div",{className:"flex justify-between items-end",children:[e.jsx("span",{className:"text-sm font-black text-primary uppercase tracking-widest",children:r("chemicals.col_quantity","مستوى المخزون")}),e.jsxs("span",{className:"text-2xl font-black text-primary",children:[n.quantity," ",e.jsx("span",{className:"text-sm text-secondary/60",children:n.unit})]})]}),e.jsx("div",{className:"h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline/5 shadow-inner",children:e.jsx("div",{className:"h-full bg-primary rounded-full shadow-sm",style:{width:"70%"}})})]})]}),e.jsxs("div",{className:"flex gap-3 pt-4",children:[e.jsx("button",{onClick:()=>Ye(n),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:r("common.print","طباعة تعريفية"),children:e.jsx(Pe,{size:22})}),e.jsx("button",{onClick:()=>he([n]),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:r("chemicals.btn_print_stock_cards","طباعة بطاقة المخزون"),children:e.jsx(ct,{size:22})}),e.jsx("button",{onClick:()=>te(),disabled:f,className:"p-3 bg-primary-container hover:bg-primary/20 border border-primary/10 rounded-full text-primary transition-all active:scale-90 disabled:opacity-50",title:r("equipment.btn_smart_update","تحديث ذكي للمعلومات"),children:f?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(ge,{size:22})}),e.jsx("button",{className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:r("common.scan_qr","توليد رمز QR"),children:e.jsx(ot,{size:22})})]})]})]},n.id):e.jsx("div",{className:"bg-surface-container-lowest rounded-[32px] p-12 text-center text-outline/60 font-bold border border-outline/10 border-dashed",children:r("chemicals.select_prompt","اختر مادة من القائمة لعرض تفاصيلها المخبرية")}),e.jsxs("div",{className:"bg-primary-container/30 backdrop-blur-sm p-8 rounded-[32px] text-on-primary-container border border-primary/10 relative overflow-hidden group shadow-sm",children:[e.jsxs("div",{className:"relative z-10",children:[e.jsxs("h4",{className:"font-black text-lg mb-3 flex items-center gap-2 text-primary",children:[e.jsx(Ot,{size:20}),r("chemicals.safety_instructions","تعليمات السلامة")]}),e.jsx("p",{className:"text-sm font-medium text-primary/80 leading-relaxed",children:(n==null?void 0:n.hazardClass)==="danger"?"يجب ارتداء القفازات والنظارات الواقية عند التعامل مع هذه المادة. يحفظ في مكان بارد وجيد التهوية بعيداً عن مصادر الحرارة.":"يرجى اتباع بروتوكولات المختبر القياسية عند التعامل مع هذه المادة لضمان سلامتك وسلامة الزملاء."})]}),e.jsx(Ke,{className:"absolute -bottom-6 -left-6 text-primary/5 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700"})]})]})]}),e.jsx(ve,{children:R.length>0&&e.jsxs(F.div,{initial:{y:100,opacity:0},animate:{y:0,opacity:1},exit:{y:100,opacity:0},className:"fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-4 rounded-[28px] shadow-2xl flex flex-wrap items-center justify-between gap-4 w-[calc(100vw-2rem)] max-w-2xl border border-white/10",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsxs("span",{className:"text-sm font-black",children:[R.length," ",r("common.selected","مادة مختارة")]}),e.jsx("span",{className:"text-[10px] text-white/60 font-bold",children:r("chemicals.bulk_operations_hint","يمكنك إجراء عمليات جماعية على هذه المواد")})]}),e.jsx("div",{className:"h-8 w-px bg-surface/10 hidden sm:block"}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{type:"button",onClick:()=>le(!0),disabled:B,className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-error/20 text-error-container hover:bg-error hover:text-white transition-all font-black text-xs disabled:opacity-50",children:[e.jsx(Ze,{size:16}),r("common.delete_selected","حذف المختار")]}),e.jsxs("button",{className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface/10 hover:bg-surface/20 transition-all font-black text-xs",onClick:()=>{const d=m.filter(w=>I.includes(w.id)),b=Z.json_to_sheet(d.map(w=>({Chemical:w.nameEn,Arabic:w.nameAr,Formula:w.formula,Qty:w.quantity,Unit:w.unit}))),l=Z.book_new();Z.book_append_sheet(l,b,"SelectedItems"),pt(l,`selected_chemicals_${new Date().getTime()}.xlsx`)},children:[e.jsx(dt,{size:16}),r("common.export_selected","تصدير المختار")]}),e.jsxs("button",{onClick:()=>{const d=m.filter(b=>I.includes(b.id));he(d)},className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/20 text-primary-container hover:bg-primary hover:text-white transition-all font-black text-xs",children:[e.jsx(Pe,{size:16}),r("chemicals.btn_print_stock_cards","بطاقات المختار")]}),e.jsx("button",{onClick:()=>Fe([]),className:"p-1.5 hover:bg-surface/10 rounded-full transition-all ms-2","aria-label":"إلغاء التحديد",children:e.jsx(He,{size:18})})]})]})}),e.jsx(Ft,{isOpen:Ge,onClose:()=>V(!1),onSubmit:de,onSmartFill:Ve,isGenerating:f,newChemical:Se,editingChemical:J,onChange:(d,b)=>Ce(l=>({...l,[d]:b}))}),e.jsx(Bt,{isOpen:Re,chemicalsLength:m.length,onClose:()=>ne(!1),onConfirm:O}),e.jsx(Mt,{isOpen:Be,suggestedUpdate:ce,selectedChemical:n,onClose:()=>Ne(!1),onApprove:pe}),ee&&R.length>0&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs",children:e.jsxs("div",{className:"bg-surface border border-outline/15 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl",children:[e.jsxs("div",{className:"flex items-center gap-3 text-rose-600",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0",children:e.jsx(Ze,{size:20})}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-lg font-black text-primary",children:"تأكيد الحذف الجماعي"}),e.jsxs("p",{className:"text-xs font-bold text-secondary/70 tabular-nums",children:["سيتم حذف ",R.length," مادة كيميائية نهائياً من المخزن"]})]})]}),e.jsxs("div",{className:"rounded-xl bg-surface-container-low border border-outline/10 p-3 max-h-40 overflow-y-auto space-y-1 text-xs font-bold text-secondary",children:[fe.slice(0,6).map(d=>e.jsxs("div",{className:"truncate",children:["• ",d.nameAr||d.nameEn," ",d.formula?`(${d.formula})`:""]},d.id)),fe.length>6&&e.jsxs("div",{className:"text-primary/70 pt-1 tabular-nums",children:["و ",fe.length-6," مواد أخرى..."]})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-1",children:[e.jsx("button",{type:"button",onClick:()=>le(!1),disabled:B,className:"px-4 py-2 rounded-xl border border-outline/15 text-xs font-bold text-secondary disabled:opacity-50",children:"إلغاء"}),e.jsx("button",{type:"button",onClick:be,disabled:B,className:"px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50",children:B?"جاري الحذف...":`حذف (${R.length}) نهائياً`})]})]})}),e.jsx(ve,{children:Me&&e.jsx(zt,{onClose:()=>Y(!1),onScan:d=>{Y(!1);let b=d;d.startsWith("APP_ID_")&&(b=d.split("_").slice(2,-1).join("_")),L(b);const l=m.find(w=>w.id===b||w.id===d);l?(q(l),se(l),V(!0)):alert("عذراً، لم يتم العثور على المادة بهذه الشيفرة.")}})})]})}export{ra as default};
