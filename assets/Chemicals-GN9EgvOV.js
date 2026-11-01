const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./chemicals-Bdrqt2LX.js","./index-B9ghwCbf.js","./vendor-react-DmbYBmZj.js","./vendor-pdf-xlsx-BMrgM8wc.js","./vendor-firebase-35I7n-h0.js","./vendor-charts-GhEvU5-v.js","./vendor-icons-Bv2K7oul.js","./index-Drx19ILa.css"])))=>i.map(i=>d[i]);
import{j as e,v as ht,r as u,h as ut}from"./vendor-react-DmbYBmZj.js";import{_ as Q,r as bt,u as W,w as rt}from"./vendor-pdf-xlsx-BMrgM8wc.js";import{A as ge,m as H,d as S,u as ft,j as gt,h as _e,O as ue,k as Xe,P as Ke}from"./index-B9ghwCbf.js";import{Q as yt}from"./QRScanner-Z6FsZ4Wk.js";import{aL as Ze,X as Ue,S as be,j as Ve,ar as vt,aM as wt,ag as jt,aj as Je,_ as De,ap as Nt,n as et,aG as kt,aq as tt,aI as St,r as Ct,g as zt,aN as _t,T as Me,aO as Dt,V as at,p as Et}from"./vendor-icons-Bv2K7oul.js";import{u as At}from"./index-CZNKOcSX.js";import{u as $t}from"./useSqlCollection-CJs31JdM.js";import{e as It,a as Be}from"./geminiService-DDmMIPuc.js";import{a as Ee,L as Ae,b as $e}from"./loggingService-Cz433EW_.js";import"./vendor-firebase-35I7n-h0.js";import"./vendor-charts-GhEvU5-v.js";function Tt({isOpen:D,onClose:a,onSubmit:p,onSmartFill:m,isGenerating:E,newChemical:g,editingChemical:L,onChange:x}){var I;return D?e.jsx(ge,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:a,className:"absolute inset-0 bg-primary/20 backdrop-blur-sm"}),e.jsxs(H.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5 relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 end-0 w-32 h-32 bg-primary/5 rounded-ee-[100px] -me-8 -mt-8"}),e.jsxs("div",{className:"relative z-10 flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(Ze,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:L?"تعديل بيانات المادة":"إضافة مادة كيميائية جديدة"})]}),e.jsx("button",{onClick:a,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(Ue,{size:24})})]}),e.jsxs("form",{onSubmit:p,className:"p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsxs("div",{className:"md:col-span-2 flex items-end gap-4",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"PRODUIT CHIMIQUE"}),e.jsx("input",{required:!0,className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:g.nameEn||"",onChange:i=>x("nameEn",i.target.value)})]}),e.jsxs("button",{type:"button",onClick:m,disabled:E,className:"bg-primary-container text-primary px-6 py-4 rounded-2xl flex items-center gap-2 font-black hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50 h-[58px]",title:"تعبئة ذكية للمعلومات",children:[E?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(Ze,{size:20}),e.jsx("span",{className:"hidden md:inline",children:"تعبئة ذكية"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الاسم العربي"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:g.nameAr||"",onChange:i=>x("nameAr",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الصيغة الكيميائية"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:g.formula||"",onChange:i=>x("formula",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"رقم CAS"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold",value:g.casNumber||"",onChange:i=>x("casNumber",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"درجة حرارة التخزين"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:g.storageTemp||"",onChange:i=>x("storageTemp",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الحالة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start",value:g.state||"solid",onChange:i=>x("state",i.target.value),children:[e.jsx("option",{value:"solid",children:"صلب (Solid)"}),e.jsx("option",{value:"liquid",children:"سائل (Liquid)"}),e.jsx("option",{value:"gas",children:"غاز (Gas)"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الكمية"}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("input",{type:"number",required:!0,className:"flex-1 bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:g.quantity||0,onChange:i=>x("quantity",Number(i.target.value))}),e.jsxs("select",{className:"bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer",value:g.unit||"g",onChange:i=>x("unit",i.target.value),children:[e.jsx("option",{value:"g",children:"g"}),e.jsx("option",{value:"kg",children:"kg"}),e.jsx("option",{value:"ml",children:"ml"}),e.jsx("option",{value:"L",children:"L"}),e.jsx("option",{value:"unit",children:"Unit"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"تصنيف الخطورة"}),e.jsxs("select",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold appearance-none cursor-pointer text-start",value:g.hazardClass||"safe",onChange:i=>x("hazardClass",i.target.value),children:[e.jsx("option",{value:"safe",children:"آمن"}),e.jsx("option",{value:"danger",children:"خطر"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"GHS (فواصل بين الرموز)"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",placeholder:"GHS01, GHS02...",value:((I=g.ghs)==null?void 0:I.join(", "))||"",onChange:i=>x("ghs",i.target.value.split(",").map(R=>R.trim()).filter(Boolean))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الرف"}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:g.shelf||"",onChange:i=>x("shelf",i.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"الصلاحية ⚠"}),e.jsx("input",{type:"date",className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold text-start",value:g.expiryDate||"",onChange:i=>x("expiryDate",i.target.value)})]}),e.jsxs("div",{className:"md:col-span-2 space-y-2",children:[e.jsx("label",{className:"text-xs font-black text-secondary/60 uppercase tracking-widest ms-1",children:"ملاحظات"}),e.jsx("textarea",{className:"w-full bg-surface-container-low border border-outline/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all font-bold min-h-[100px] text-start",value:g.notes||"",onChange:i=>x("notes",i.target.value)})]}),e.jsx("div",{className:"md:col-span-2 pt-6",children:e.jsx("button",{type:"submit",className:"w-full bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:L?"حفظ التعديلات":"تأكيد إضافة المادة للمخزن"})})]})]})]})}):null}function Lt({isOpen:D,chemicalsLength:a,onClose:p,onConfirm:m}){return D?e.jsx(ge,{children:e.jsxs("div",{className:"fixed inset-0 z-[100] flex items-center justify-center p-6",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:p,className:"absolute inset-0 bg-black/60 backdrop-blur-sm"}),e.jsxs(H.div,{initial:{opacity:0,scale:.9,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9,y:20},className:"relative bg-surface-container-lowest rounded-[32px] p-10 max-w-md w-full shadow-2xl border border-outline/10 text-right",children:[e.jsx("div",{className:"w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8",children:e.jsx(be,{size:40,className:"text-primary"})}),e.jsx("h3",{className:"text-3xl font-black text-primary mb-4 tracking-tight",children:"تحديث ذكي شامل"}),e.jsxs("p",{className:"text-secondary/80 text-lg leading-relaxed mb-10",children:["هل أنت متأكد من رغبتك في تحديث معلومات ",e.jsx("span",{className:"font-black text-primary",children:a})," مادة ذكياً؟",e.jsx("br",{}),e.jsx("br",{}),"قد تستغرق هذه العملية بعض الوقت. سيتم تحديث البيانات تلقائياً بناءً على اقتراحات الذكاء الاصطناعي."]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:m,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95",children:"بدء التحديث"}),e.jsx("button",{onClick:p,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95",children:"إلغاء"})]})]})]})}):null}function Pt({isOpen:D,suggestedUpdate:a,selectedChemical:p,onClose:m,onApprove:E}){return!D||!a||!p?null:e.jsx(ge,{children:e.jsxs("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4",children:[e.jsx(H.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:m,className:"absolute inset-0 bg-primary/20 backdrop-blur-xl"}),e.jsxs(H.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"relative bg-surface w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-outline/10",children:[e.jsxs("div",{className:"p-8 flex justify-between items-center bg-surface-container-low border-b border-outline/5",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(be,{size:24})}),e.jsx("h3",{className:"text-2xl font-black text-primary",children:"مراجعة التحديث الذكي"})]}),e.jsx("button",{onClick:m,className:"p-2.5 hover:bg-surface-container-high rounded-full transition-all active:scale-90",children:e.jsx(Ue,{size:24})})]}),e.jsxs("div",{className:"p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar",children:[e.jsx("p",{className:"text-secondary/80 font-bold text-center bg-surface-container-low p-4 rounded-2xl border border-outline/5",children:"تم العثور على معلومات أكثر دقة لهذه المادة. يرجى مراجعة التغييرات المقترحة أدناه قبل الموافقة."}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-secondary/40 uppercase tracking-widest border-b border-outline/5 pb-2",children:"المعلومات الحالية"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-secondary",children:[p.nameEn," / ",p.nameAr]})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-secondary",children:p.formula})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-secondary",children:p.casNumber||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-secondary",children:p.storageTemp||"غير متوفر"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-secondary",children:p.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:"bg-surface-container-low/50 p-4 rounded-2xl",children:[e.jsx("label",{className:"text-[10px] font-black text-secondary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-secondary/60",children:p.notes||"لا توجد"})]})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("h4",{className:"text-sm font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2",children:"المعلومات المقترحة ✨"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.nameEn!==p.nameEn||a.nameAr!==p.nameAr?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الاسم"}),e.jsxs("p",{className:"font-bold text-primary",children:[a.nameEn," / ",a.nameAr]})]}),e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.formula!==p.formula?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الصيغة"}),e.jsx("p",{className:"font-mono font-bold text-primary",children:a.formula})]}),e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.casNumber!==p.casNumber?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"رقم CAS"}),e.jsx("p",{className:"font-bold text-primary",children:a.casNumber})]}),e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.storageTemp!==p.storageTemp?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"درجة التخزين"}),e.jsx("p",{className:"font-bold text-primary",children:a.storageTemp})]}),e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.hazardClass!==p.hazardClass?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"الخطورة"}),e.jsx("p",{className:"font-bold text-primary",children:a.hazardClass==="danger"?"خطر":"آمن"})]}),e.jsxs("div",{className:S("p-4 rounded-2xl border transition-all",a.notes!==p.notes?"bg-primary/5 border-primary/20 shadow-sm":"bg-surface-container-low/50 border-transparent"),children:[e.jsx("label",{className:"text-[10px] font-black text-primary/40 uppercase block mb-1",children:"ملاحظات"}),e.jsx("p",{className:"text-xs text-primary/80",children:a.notes})]})]})]})]})]}),e.jsxs("div",{className:"p-10 bg-surface-container-low border-t border-outline/5 flex gap-4",children:[e.jsxs("button",{onClick:E,className:"flex-1 bg-primary text-on-primary py-5 rounded-full font-black shadow-xl shadow-primary/20 hover:bg-primary-container hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(Ve,{size:24}),"موافقة وتحديث البيانات"]}),e.jsxs("button",{onClick:m,className:"flex-1 bg-surface border border-outline/20 text-secondary py-5 rounded-full font-black hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-3",children:[e.jsx(vt,{size:24}),"إلغاء التغييرات"]})]})]})]})})}const J={GHS01:"/ghs/GHS01.png",GHS02:"/ghs/GHS02.png",GHS03:"/ghs/GHS03.png",GHS04:"/ghs/GHS04.png",GHS05:"/ghs/GHS05.png",GHS06:"/ghs/GHS06.png",GHS07:"/ghs/GHS07.png",GHS08:"/ghs/GHS08.png",GHS09:"/ghs/GHS09.png"},fe={GHS01:"متفجرات",GHS02:"قابل للاشتعال",GHS03:"مؤكسد",GHS04:"غاز تحت الضغط",GHS05:"أكال / مسبب للتآكل",GHS06:"سمية حادة (قاتل)",GHS07:"تهيج / تحسس / خطر",GHS08:"خطر صحي جسيم",GHS09:"خطر بيئي"};function qt(D=!1){const{schoolId:a,schoolName:p,directorate:m,commune:E,academicYear:g}=ft(),{openPrintPreview:L}=gt(),x=g||(typeof window<"u"?localStorage.getItem("algeria_lab_academic_year"):null)||"2025/2026",[I]=ht(),[i,R]=u.useState([]),[Ie,F]=u.useState(!0),[X,ee]=u.useState(""),[te,ye]=u.useState(I.get("filter")==="low"),[y,P]=u.useState(null),[Te,ae]=u.useState(!1),[M,A]=u.useState(null),re=u.useRef(null),[Le,se]=u.useState(!1),[Pe,B]=u.useState(!1),[ie,K]=u.useState(!1),[qe,ne]=u.useState(!1),[He,le]=u.useState({current:0,total:0}),[O,V]=u.useState([]),[C,oe]=u.useState(null),[Oe,ce]=u.useState(!1),[v,ve]=u.useState(null),[Ge,de]=u.useState(!1),pe=t=>{if(!t)return"غير محدد";if(!t.includes("-"))return t;const[s,r,o]=t.split("-");return!s||!r||!o?t:`${o}/${r}/${s}`},[N,me]=u.useState({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""}),{data:T,loading:xe,error:Z}=$t("chemicals","/api/db/chemicals");u.useEffect(()=>{if(!xe){R(T),F(!1);const t=I.get("id");if(t){let s=t;t.startsWith("APP_ID_")&&(s=t.split("_").slice(2,-1).join("_")),ee(s);const r=T.find(o=>o.id===t||o.id===s);r?P(r):T.length>0&&!y&&P(T[0])}else T.length>0&&!y&&P(T[0])}},[T,xe,I]);const he=async t=>{t.preventDefault();try{if(M){const{id:s}=M,{updateChemical:r}=await Q(async()=>{const{updateChemical:o}=await import("./chemicals-Bdrqt2LX.js");return{updateChemical:o}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await r(s,N),await Ee(a,Ae.UPDATE,$e.CHEMICALS,`تعديل بيانات المادة: ${N.nameAr}`,s)}else{const{createChemical:s}=await Q(async()=>{const{createChemical:o}=await import("./chemicals-Bdrqt2LX.js");return{createChemical:o}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url),r=await s(N);await Ee(a,Ae.CREATE,$e.CHEMICALS,`إضافة مادة جديدة: ${N.nameAr}`,r.id)}ae(!1),A(null),me({nameEn:"",nameAr:"",formula:"",casNumber:"",storageTemp:"",unit:"g",quantity:0,state:"solid",hazardClass:"safe",ghs:[],shelf:"",expiryDate:"",notes:""})}catch(s){_e(s,M?ue.UPDATE:ue.CREATE,"chemicals")}},q=async()=>{const t=N.nameEn||N.nameAr;if(!t){alert("يرجى إدخال اسم المادة أولاً (بالعربية أو الإنجليزية)");return}B(!0);try{const s=await Be(t);if(s){let r="";if(s.expiryYears>0){const o=new Date;o.setFullYear(o.getFullYear()+s.expiryYears),r=o.toISOString().split("T")[0]}me(o=>({...o,nameEn:s.nameEn||o.nameEn,nameAr:s.nameAr||o.nameAr,formula:s.formula||o.formula,casNumber:s.casNumber||o.casNumber,storageTemp:s.storageTemp||o.storageTemp,hazardClass:s.hazardClass||o.hazardClass,ghs:s.ghs||o.ghs,expiryDate:r||o.expiryDate,notes:s.notes||o.notes}))}else alert("لم نتمكن من الحصول على معلومات دقيقة لهذه المادة. يرجى إدخالها يدوياً.")}catch(s){console.error("Smart fill error:",s),alert("حدث خطأ أثناء محاولة الحصول على المعلومات الذكية.")}finally{B(!1)}},we=async t=>{const s=t||y;if(s){B(!0);try{const r=await Be(s.nameEn||s.nameAr);r?(oe(r),t&&P(t),ce(!0)):alert("لم نتمكن من الحصول على اقتراحات تحديث لهذه المادة.")}catch(r){console.error("Smart update request error:",r),alert("حدث خطأ أثناء طلب التحديث الذكي.")}finally{B(!1)}}},Re=async()=>{if(!(!y||!C))try{let t=y.expiryDate;if(C.expiryYears>0){const r=new Date;r.setFullYear(r.getFullYear()+C.expiryYears),t=r.toISOString().split("T")[0]}const{updateChemical:s}=await Q(async()=>{const{updateChemical:r}=await import("./chemicals-Bdrqt2LX.js");return{updateChemical:r}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await s(y.id,{nameEn:C.nameEn,nameAr:C.nameAr,formula:C.formula,casNumber:C.casNumber,storageTemp:C.storageTemp,hazardClass:C.hazardClass,ghs:C.ghs,expiryDate:t,notes:C.notes}),ce(!1),oe(null),alert("تم تحديث معلومات المادة بنجاح!")}catch(t){_e(t,ue.UPDATE,`chemicals/${y.id}`)}},z=async()=>{if(ne(!1),!await It()){alert("يرجى اختيار مفتاح API الخاص بك لاستخدام ميزة التحديث الذكي.");return}K(!0),le({current:0,total:i.length});let s=0,r=0;for(let o=0;o<i.length;o++){const c=i[o];le({current:o+1,total:i.length});try{const l=await Be(c.nameEn||c.nameAr);if(l){let k=c.expiryDate;if(l.expiryYears>0){const $=new Date;$.setFullYear($.getFullYear()+l.expiryYears),k=$.toISOString().split("T")[0]}const{updateChemical:G}=await Q(async()=>{const{updateChemical:$}=await import("./chemicals-Bdrqt2LX.js");return{updateChemical:$}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await G(c.id,{nameEn:l.nameEn||c.nameEn,nameAr:l.nameAr||c.nameAr,formula:l.formula||c.formula,casNumber:l.casNumber||c.casNumber,storageTemp:l.storageTemp||c.storageTemp,hazardClass:l.hazardClass||c.hazardClass,ghs:l.ghs||c.ghs,expiryDate:k||c.expiryDate,notes:l.notes||c.notes}),s++}else r++}catch(l){console.error(`Error updating chemical ${c.nameEn}:`,l),r++;const k=(l==null?void 0:l.message)||String(l);if(k.includes("quota")||k.includes("RESOURCE_EXHAUSTED")){alert("تم إيقاف التحديث التلقائي بسبب تجاوز حصة الاستخدام المسموح بها (Quota Exceeded). يرجى المحاولة لاحقاً أو التحقق من حساب Gemini API الخاص بك.");break}}await new Promise(l=>setTimeout(l,5e3))}K(!1),alert(`اكتمل التحديث الذكي!
تم تحديث: ${s} مادة بنجاح
فشل: ${r} مادة`)},je=async(t,s)=>{try{const{deleteChemical:r}=await Q(async()=>{const{deleteChemical:o}=await import("./chemicals-Bdrqt2LX.js");return{deleteChemical:o}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await r(t),await Ee(a,Ae.DELETE,$e.CHEMICALS,`حذف المادة: ${s}`,t),(y==null?void 0:y.id)===t&&P(i.find(o=>o.id!==t)||null)}catch(r){_e(r,ue.DELETE,`chemicals/${t}`)}},Ne=()=>{const t=U.filter(l=>l.ghs&&l.ghs.length>0||l.hazardClass==="danger").length,r=new Date().toLocaleDateString("ar-DZ",{day:"2-digit",month:"2-digit",year:"numeric"}),o=U.map((l,k)=>{const G=l.ghs&&l.ghs.length>0||l.hazardClass==="danger",$=(l.ghs||[]).map(Y=>`<div class="ghs-pic"><img src="${J[Y]}" alt="${Y}" /></div>`).join("");return`
        <tr class="${G?"hazardous-row":""}">
          <td class="text-center">${k+1}</td>
          <td class="font-bold text-lg">${l.nameAr}</td>
          <td class="text-sm en-font">${l.nameEn}</td>
          <td class="mono-font">${l.formula||"—"}</td>
          <td class="text-center">${l.unit}</td>
          <td class="text-center font-bold">${l.quantity}</td>
          <td class="text-center">${l.state==="solid"?"صلب":l.state==="liquid"?"سائل":"غاز"}</td>
          <td class="text-center">${l.shelf||"—"}</td>
          <td><div class="ghs-container">${$}</div></td>
          <td class="notes-cell">${l.notes||"—"}</td>
        </tr>
      `}).join(""),c=`
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
                <div>${Xe(p,E)}</div>
              </div>
              <div class="oh-center">
                <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <div class="main-title">سجل جرد المواد الكيميائية للمخبر</div>
              </div>
              <div class="oh-left">
                <div>السنة الدراسية: ${x}</div>
                <div>تاريخ الطباعة: ${r}</div>
                <div class="inst-stamp">ختم المؤسسة</div>
              </div>
            </header>

            <div class="registry-meta">
              <span>إجمالي المواد: ${U.length}</span>
              <span style="border-right: 2px solid rgba(0,0,0,0.1); padding-right: 20px;">المواد الخطرة: ${t}</span>
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
    `;L({title:`سجل المواد الكيميائية — ${p}`,subtitle:`مديرية التربية: ${m||"—"} · السنة الدراسية: ${x}`,type:"custom",customHtml:c,headers:["#","الاسم العربي","Désignation (En)","الصيغة","الوحدة","الكمية","الحالة","الرف"],rows:U.map((l,k)=>[k+1,l.nameAr,l.nameEn,l.formula||"—",l.unit,l.quantity,l.state==="solid"?"صلب":l.state==="liquid"?"سائل":"غاز",l.shelf||"—"]),summaryCards:[{label:"إجمالي المواد",value:U.length},{label:"المواد الخطرة",value:t}],suggestedOrientation:"landscape"})},ke=async()=>{const t=["#","الاسم العلمي","الاسم العربي","الصيغة","الكمية","الرف","تاريخ الصلاحية"],s=j.map((r,o)=>[o+1,r.nameEn||"",r.nameAr||"",r.formula||"",`${r.quantity} ${r.unit}`,r.shelf||"",pe(r.expiryDate)]);await Ke.generateTablePDF("تقرير جرد المواد الكيميائية المخبرية",t,s,`chemicals_inventory_${new Date().toISOString().split("T")[0]}.pdf`,{subtitle:`سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${j.length}`,schoolInfo:{school:p,commune:E,directorate:m,laboratory:"مخبر الكيمياء والعلوم الفيزيائية"},summaryCards:[{label:"إجمالي المواد الكيميائية",value:j.length},{label:"المواد السائلة",value:j.filter(r=>r.state==="liquid").length},{label:"المواد الصلبة",value:j.filter(r=>r.state==="solid").length},{label:"تاريخ إعداد التقرير",value:new Date().toLocaleDateString("ar-DZ")}]})},Se=()=>{const t=["#","الاسم العلمي","الاسم العربي","الصيغة","الكمية","الرف","تاريخ الصلاحية"],s=j.map((r,o)=>[o+1,r.nameEn||"",r.nameAr||"",r.formula||"",`${r.quantity} ${r.unit}`,r.shelf||"",pe(r.expiryDate)]);Ke.downloadTableWord("تقرير جرد المواد الكيميائية المخبرية",t,s,`chemicals_inventory_${new Date().toISOString().split("T")[0]}.doc`,{subtitle:`سجل المواد والمحاليل المتوفرة في المخبر - إجمالي المواد: ${j.length}`,schoolInfo:{school:p,commune:E,directorate:m,laboratory:"مخبر الكيمياء والعلوم الفيزيائية"},summaryCards:[{label:"إجمالي المواد الكيميائية",value:j.length},{label:"المواد السائلة",value:j.filter(r=>r.state==="liquid").length},{label:"المواد الصلبة",value:j.filter(r=>r.state==="solid").length},{label:"تاريخ إعداد التقرير",value:new Date().toLocaleDateString("ar-DZ")}]})},d=()=>{const t=W.json_to_sheet(j.map(r=>({"الاسم (EN)":r.nameEn,"الاسم (AR)":r.nameAr,الصيغة:r.formula,"رقم CAS":r.casNumber,الكمية:r.quantity,الوحدة:r.unit,الحالة:r.state,الخطورة:r.hazardClass,الرف:r.shelf,"تاريخ الصلاحية":r.expiryDate,ملاحظات:r.notes}))),s=W.book_new();W.book_append_sheet(s,t,"Inventory"),rt(s,`chemical_inventory_${new Date().toISOString().split("T")[0]}.xlsx`)},b=async t=>{var o;const s=(o=t.target.files)==null?void 0:o[0];if(!s)return;se(!0);const r=new FileReader;r.onload=async c=>{var l;try{const k=(l=c.target)==null?void 0:l.result,G=bt(k,{type:"binary",cellDates:!0}),$=G.SheetNames[0],Y=G.Sheets[$],Ce=W.sheet_to_json(Y),ct=h=>{if(!h)return"";if(h instanceof Date)return h.toISOString().split("T")[0];const ze=new Date(h);return isNaN(ze.getTime())?String(h).trim():ze.toISOString().split("T")[0]},_=(h,ze)=>{const pt=Object.keys(h);for(const mt of ze){const We=pt.find(xt=>xt.toLowerCase().trim()===mt.toLowerCase().trim());if(We)return h[We]}},Qe=Ce.map(h=>({nameAr:String(_(h,["الاسم بالعربية","nameAr","arabic name","الاسم","اسم المادة"])||"مادة كيميائية").trim(),nameEn:String(_(h,["الاسم بالإنجليزية","nameEn","english name","name"])||"").trim(),formula:String(_(h,["الصيغة الكيميائية","formula","الصيغة"])||"").trim(),casNumber:String(_(h,["رقم CAS","cas","casNumber","cas_number"])||"").trim(),unit:String(_(h,["الوحدة","unit"])||"g").trim(),quantity:Number(_(h,["الكمية","quantity"])||0),storageTemp:String(_(h,["درجة حرارة التخزين","storageTemp","درجة التخزين"])||"").trim(),state:String(_(h,["الحالة الفيزيائية","state","الحالة"])||"solid").trim(),hazardClass:String(_(h,["فئة الخطورة","hazardClass","الخطورة"])||"safe").trim(),shelf:String(_(h,["الرف","shelf","مكان التخزين"])||"").trim(),expiryDate:ct(_(h,["تاريخ انتهاء الصلاحية","expiryDate","تاريخ الانتهاء"])),notes:String(_(h,["ملاحظات","notes"])||"").trim()})),{createChemicalsBulk:dt}=await Q(async()=>{const{createChemicalsBulk:h}=await import("./chemicals-Bdrqt2LX.js");return{createChemicalsBulk:h}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await dt(Qe),alert(`تم استيراد ${Qe.length} مادة بنجاح!`)}catch(k){console.error("Error importing XLS:",k),alert("حدث خطأ أثناء استيراد الملف. يرجى التأكد من صيغة الملف.")}finally{se(!1),re.current&&(re.current.value="")}},r.readAsBinaryString(s)},n=t=>{const s=new Date,r=t.map((c,l)=>{var Y,Ce;const k=c.state==="solid"?"صلب":c.state==="liquid"?"سائل":"غاز",G=c.hazardClass==="danger"?(Y=c.ghs)!=null&&Y[0]?fe[c.ghs[0]]:"خطر":"آمن",$=(Ce=c.ghs)!=null&&Ce[0]?"☠️":"—";return`
        <div class="pcard">
          <div class="ph-container">
            <div class="ph">
              <div class="ph-r">مديرية التربية لولاية: ${m}<br>${Xe(p,E)}</div>
              <div class="ph-c">الجمهورية الجزائرية الديمقراطية الشعبية<br>وزارة التربية الوطنية</div>
              <div class="ph-l">
                <div>السنة الدراسية: ${x}</div>
                <div class="header-stamp">ختم المؤسسة</div>
              </div>
            </div>
          </div>

          <div class="pcard-badge">رقم البطاقة: ${l+1}</div>
          <h1 class="pcard-title">بطاقة مخزون مادة كيميائية</h1>
          
          <div class="ic-meta-expressive">
             <div class="ic-field main">
                <span class="l">اسم المادة (AR)</span>
                <span class="v">${c.nameAr}</span>
             </div>
             <div class="ic-field sub">
                <span class="l">NOM DU PRODUIT</span>
                <span class="v en">${c.nameEn}</span>
             </div>
          </div>

          <div class="ic-grid-info">
             <div class="ic-info-box">
                <span class="l">الصيغة</span>
                <span class="v en-bold">${c.formula||"—"}</span>
             </div>
             <div class="ic-info-box">
                <span class="l">الحالة</span>
                <span class="v">${k}</span>
             </div>
             <div class="ic-info-box">
                <span class="l">الرف</span>
                <span class="v">${c.shelf||"—"}</span>
             </div>
             <div class="ic-info-box danger">
                <span class="l">GHS</span>
                <span class="v emoji">${$}</span>
             </div>
          </div>

          <div class="ic-safety-strip">
             <b>طبيعة الخطورة:</b> ${G} 
             <span style="margin-right: 15px">|</span> 
             <b>وحدة القياس:</b> ${c.unit}
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
                  <td>-</td><td>${c.quantity}</td><td>${c.quantity}</td>
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
             <span>تتمة حركة المخزون — ${c.nameAr}</span>
             <span class="ref">REF: ${l+1}</span>
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
                ${c.notes||"يجب حفظ هذه المادة في ظروف ملائمة بعيداً عن الرطوبة والحرارة ووفق معايير السلامة المنصوص عليها في دليل المختبرات."}
             </div>
          </div>
        </div>
      `}).join(""),o=`
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
            ${r}
          </div>
        </body>
      </html>
    `;L({title:`بطاقات جرد كيميائي (${t.length} عنصر)`,type:"custom",customHtml:o,suggestedOrientation:"portrait"})},w=t=>{const s=`
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
                ${(t.ghs||[]).map(r=>`
                  <div style="display: flex; flex-direction: column; align-items: center; border: 1px solid #ccc; padding: 5px; border-radius: 8px; width: 70px; background: #fff;">
                    <img src="${J[r]}" style="width: 40px; height: 40px;" />
                    <span style="font-size: 9px; margin-top: 4px; text-align: center; font-weight: bold;">${fe[r]||r}</span>
                  </div>
                `).join("")}
              </div>
            </div>
            <div class="item"><span class="label">تصنيف الخطورة:</span> <span class="${t.hazardClass==="danger"?"hazard":""}">${t.hazardClass==="danger"?"خطر":"آمن"}</span></div>
            <div class="item" style="grid-column: span 2;"><span class="label">ملاحظات:</span> ${t.notes||"لا توجد"}</div>
          </div>
          <div class="footer">طبع بتاريخ: ${new Date().toLocaleString("ar-DZ")}</div>
        </body>
      </html>
    `;L({title:`بطاقة تعريف مادة — ${t.nameAr||t.nameEn}`,type:"custom",customHtml:s,suggestedOrientation:"portrait"})},f=t=>{let s="asc";v&&v.key===t&&v.direction==="asc"&&(s="desc"),ve({key:t,direction:s})},Fe=t=>{V(s=>s.includes(t)?s.filter(r=>r!==t):[...s,t])},st=()=>{O.length===j.length?V([]):V(j.map(t=>t.id))},it=async()=>{if(window.confirm(`هل أنت متأكد من حذف ${O.length} مادة؟`))try{const{deleteChemical:t}=await Q(async()=>{const{deleteChemical:s}=await import("./chemicals-Bdrqt2LX.js");return{deleteChemical:s}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url);await Promise.all(O.map(s=>t(s))),await Ee(a,Ae.DELETE,$e.CHEMICALS,`حذف جماعي لـ ${O.length} مادة`),V([]),alert("تم الحذف بنجاح!")}catch(t){_e(t,ue.DELETE,"chemicals/bulk")}},j=i.filter(t=>{var o,c,l;const s=((o=t.nameEn)==null?void 0:o.toLowerCase().includes(X.toLowerCase()))||((c=t.nameAr)==null?void 0:c.toLowerCase().includes(X.toLowerCase()))||((l=t.formula)==null?void 0:l.toLowerCase().includes(X.toLowerCase())),r=!te||t.quantity<10;return s&&r}),U=u.useMemo(()=>{const t=[...j];return v!==null&&t.sort((s,r)=>{const o=s[v.key],c=r[v.key];return o===void 0||c===void 0?0:o<c?v.direction==="asc"?-1:1:o>c?v.direction==="asc"?1:-1:0}),t},[j,v]),nt=t=>(v==null?void 0:v.key)===t?v.direction==="asc"?e.jsx(wt,{size:14,className:"mr-1"}):e.jsx(jt,{size:14,className:"mr-1"}):e.jsx("div",{className:"w-[14px] mr-1"}),lt=i.filter(t=>t.quantity<10).length,Ye=u.useRef(null),ot=At({count:U.length,getScrollElement:()=>Ye.current,estimateSize:()=>72,overscan:10});return{searchParams:I,chemicals:i,setChemicals:R,loading:Ie,setLoading:F,searchTerm:X,setSearchTerm:ee,filterLowStock:te,setFilterLowStock:ye,selectedChemical:y,setSelectedChemical:P,isAddModalOpen:Te,setIsAddModalOpen:ae,editingChemical:M,setEditingChemical:A,fileInputRef:re,isImporting:Le,setIsImporting:se,isGenerating:Pe,setIsGenerating:B,isBulkUpdating:ie,setIsBulkUpdating:K,isBulkConfirmOpen:qe,setIsBulkConfirmOpen:ne,bulkProgress:He,setBulkProgress:le,selectedIds:O,setSelectedIds:V,suggestedUpdate:C,setSuggestedUpdate:oe,isReviewModalOpen:Oe,setIsReviewModalOpen:ce,sortConfig:v,setSortConfig:ve,isQRScannerOpen:Ge,setIsQRScannerOpen:de,formatDisplayDate:pe,newChemical:N,setNewChemical:me,handleAddChemical:he,handleSmartFill:q,handleRequestSmartUpdate:we,handleApproveUpdate:Re,handleBulkSmartUpdate:z,handleDeleteChemical:je,handlePrintList:Ne,handleExportPDF:ke,handleExportWord:Se,handleExportXLS:d,handleImportXLS:b,handlePrintInventoryCards:n,handlePrint:w,handleSort:f,handleToggleSelect:Fe,handleSelectAll:st,handleBulkDelete:it,filteredChemicals:j,sortedChemicals:U,getSortIcon:nt,lowStockCount:lt,parentRef:Ye,rowVirtualizer:ot,chemicalsList:T,chemicalsLoading:xe,error:Z,schoolId:a,schoolName:p,stateName:m}}function Wt({isNested:D=!1}){var je,Ne,ke,Se;const{t:a,i18n:p}=ut(),{chemicals:m,loading:E,searchTerm:g,setSearchTerm:L,filterLowStock:x,setFilterLowStock:I,selectedChemical:i,setSelectedChemical:R,isAddModalOpen:Ie,setIsAddModalOpen:F,editingChemical:X,setEditingChemical:ee,fileInputRef:te,isImporting:ye,isGenerating:y,isBulkUpdating:P,isBulkConfirmOpen:Te,setIsBulkConfirmOpen:ae,bulkProgress:M,selectedIds:A,setSelectedIds:re,suggestedUpdate:Le,isReviewModalOpen:se,setIsReviewModalOpen:Pe,isQRScannerOpen:B,setIsQRScannerOpen:ie,formatDisplayDate:K,newChemical:qe,setNewChemical:ne,handleAddChemical:He,handleSmartFill:le,handleRequestSmartUpdate:O,handleApproveUpdate:V,handleBulkSmartUpdate:C,handleDeleteChemical:oe,handlePrintList:Oe,handleExportPDF:ce,handleExportWord:v,handleExportXLS:ve,handleImportXLS:Ge,handlePrintInventoryCards:de,handlePrint:pe,handleSort:N,handleToggleSelect:me,handleSelectAll:T,handleBulkDelete:xe,filteredChemicals:Z,sortedChemicals:he,getSortIcon:q,lowStockCount:we,parentRef:Re,rowVirtualizer:z}=qt(D);return e.jsxs("div",{className:S("space-y-10 max-w-7xl mx-auto pb-20",!D&&"px-4"),dir:p.language==="ar"?"rtl":"ltr",children:[!D&&e.jsxs("header",{className:"flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("h1",{className:"text-4xl font-black text-primary tracking-tighter",children:a("chemicals.title","المخزن الكيميائي")}),e.jsx("p",{className:"text-secondary/80 text-base font-medium",children:a("chemicals.subtitle","إدارة وتتبع المحاليل والكواشف الكيميائية")})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx("input",{type:"file",ref:te,onChange:Ge,className:"hidden",accept:".xls,.xlsx"}),e.jsxs("button",{onClick:()=>ie(!0),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(Je,{size:20}),a("common.scan_qr","مسح QR")]}),e.jsxs("button",{onClick:Oe,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(De,{size:20}),a("equipment.btn_print_list","طباعة القائمة")]}),e.jsxs("button",{onClick:()=>de(he),className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(De,{size:20,className:"text-primary"}),a("chemicals.btn_print_stock_cards","طباعة بطاقات المخزون")]}),e.jsxs("button",{onClick:v,className:"bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-sm",title:"تصدير كملف Word (.doc) رسمي بنفس تفاصيل الـ PDF",children:[e.jsx(Nt,{size:20}),a("common.export_word","تصدير Word")]}),e.jsxs("button",{onClick:ce,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(et,{size:20}),a("common.export_pdf","تصدير PDF")]}),e.jsxs("button",{onClick:()=>{var d;return(d=te.current)==null?void 0:d.click()},disabled:ye,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm disabled:opacity-50",children:[ye?e.jsx("div",{className:"w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"}):e.jsx(kt,{size:20}),a("common.import_xls","استيراد XLS")]}),e.jsxs("button",{onClick:ve,className:"bg-surface text-secondary border border-outline/10 px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-surface-container-high transition-all active:scale-95 shadow-sm",children:[e.jsx(tt,{size:20}),a("common.export_xls","تصدير الجرد")]}),e.jsxs("button",{onClick:()=>ae(!0),disabled:P||m.length===0,className:"bg-primary text-on-primary px-6 py-3.5 rounded-full flex items-center gap-2 font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50",title:"تحديث ذكي لجميع المواد في القائمة",children:[P?e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),e.jsxs("span",{className:"text-xs",children:[M.current,"/",M.total]})]}):e.jsx(be,{size:20}),a("equipment.btn_smart_update","تحديث ذكي للكل")]}),e.jsxs("button",{onClick:()=>F(!0),className:"bg-primary text-on-primary px-8 py-3.5 rounded-full flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95",children:[e.jsx(St,{size:20}),a("chemicals.btn_add","إضافة مادة")]})]})]}),!D&&e.jsxs("section",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"bg-surface-container-low p-7 rounded-[32px] border border-outline/5 hover:border-outline/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-secondary/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.stat_total_chemicals","إجمالي المواد")}),e.jsx("h3",{className:"text-4xl font-black text-primary group-hover:scale-110 transition-transform origin-right",children:m.length})]}),e.jsxs("div",{className:"bg-error-container/40 p-7 rounded-[32px] border border-error/10 hover:border-error/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-error-container/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.col_hazard","مواد خطرة")}),e.jsx("h3",{className:"text-4xl font-black text-error group-hover:scale-110 transition-transform origin-right",children:m.filter(d=>d.ghs&&d.ghs.length>0||d.hazardClass==="danger").length})]}),e.jsxs("div",{className:"bg-tertiary-fixed/40 p-7 rounded-[32px] border border-tertiary/10 hover:border-tertiary/20 transition-all group",children:[e.jsx("p",{className:"text-xs text-on-tertiary-fixed/60 font-black uppercase tracking-widest mb-3",children:a("chemicals.stat_expired","تنتهي قريباً")}),e.jsx("h3",{className:"text-4xl font-black text-tertiary group-hover:scale-110 transition-transform origin-right",children:m.filter(d=>{if(!d.expiryDate)return!1;const b=new Date(d.expiryDate),n=new Date;return n.setMonth(n.getMonth()+3),b<n&&b>new Date}).length.toString().padStart(2,"0")})]}),e.jsxs("div",{className:"bg-primary p-7 rounded-[32px] text-on-primary shadow-xl shadow-primary/20 hover:shadow-2xl transition-all group relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-surface/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10",children:[e.jsx("p",{className:"text-white/60 text-xs font-black uppercase tracking-widest mb-3",children:a("equipment.field_quantity","سعة التخزين")}),e.jsx("h3",{className:"text-4xl font-black",children:"68%"})]})]})]}),we>0&&e.jsxs(H.div,{initial:{opacity:0,y:-20},animate:{opacity:1,y:0},className:"bg-error-container/30 backdrop-blur-sm text-on-error-container p-5 rounded-[32px] flex items-center justify-between border border-error/10 shadow-lg shadow-error/5",children:[e.jsxs("div",{className:"flex items-center gap-4 text-error",children:[e.jsx("div",{className:"bg-error p-3 rounded-2xl text-white shadow-lg shadow-error/20",children:e.jsx(Ct,{size:20})}),e.jsxs("span",{className:"font-black text-base",children:[a("chemicals.low_stock_badge","تنبيه: يوجد مواد منخفضة المخزون!")," (",we,")"]})]}),e.jsx("button",{onClick:()=>I(!x),className:"text-sm font-black underline underline-offset-4 text-error px-6 py-2.5 hover:bg-error/10 rounded-full transition-all active:scale-95",children:x?a("common.all","عرض الكل"):a("chemicals.filter_low_stock","عرض المواد المنخفضة")})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-10",children:[e.jsx("div",{className:"lg:col-span-8 space-y-8",children:e.jsxs("div",{className:"bg-surface-container-lowest rounded-[32px] overflow-hidden border border-outline/10 shadow-sm",children:[e.jsxs("div",{className:"p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-container-low/30 border-b border-outline/5",children:[e.jsxs("div",{className:"relative w-full md:w-80",children:[e.jsx(zt,{className:"absolute start-4 top-1/2 -translate-y-1/2 text-outline/60",size:20}),e.jsx("input",{className:"w-full bg-surface-container-low border border-outline/10 rounded-full ps-12 pe-6 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all text-start",placeholder:a("chemicals.search_placeholder","بحث عن مادة (اسم أو صيغة)..."),value:g,onChange:d=>L(d.target.value)})]}),e.jsx("div",{className:"flex gap-3",children:e.jsx("button",{onClick:()=>I(!x),className:S("p-3 border rounded-full transition-all active:scale-90",x?"bg-primary text-on-primary border-primary shadow-lg shadow-primary/20":"bg-surface-container-low hover:bg-surface-container-high border-outline/10 text-secondary"),title:x?a("common.all","عرض الكل"):a("chemicals.filter_low_stock","تصفية المواد المنخفضة"),children:e.jsx(_t,{size:22})})})]}),e.jsx("div",{ref:Re,className:"overflow-auto scrollbar-hide relative max-h-[700px] w-full",children:e.jsxs("table",{className:"w-full text-start border-collapse table-auto relative",children:[e.jsx("thead",{className:"sticky top-0 z-20 bg-surface-container-lowest",children:e.jsxs("tr",{className:"bg-surface-container-low/50 text-secondary/60 text-[11px] font-black uppercase tracking-widest",children:[e.jsx("th",{className:"px-3 py-5 text-start w-12",children:e.jsx("div",{onClick:T,className:S("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",A.length===Z.length&&Z.length>0?"bg-primary border-primary text-white":"border-outline/30 hover:border-primary/50"),children:A.length===Z.length&&Z.length>0&&e.jsx(Ve,{size:12})})}),e.jsx("th",{className:"px-3 py-5 text-start w-10",children:"#"}),e.jsx("th",{className:"px-3 py-5 text-start min-w-[140px] cursor-pointer hover:text-primary transition-colors",onClick:()=>N("nameEn"),children:e.jsxs("div",{className:"flex items-center",children:[q("nameEn"),a("chemicals.col_name_en","المادة (EN/AR)")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-16 hidden sm:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>N("formula"),children:e.jsxs("div",{className:"flex items-center",children:[q("formula"),a("chemicals.col_formula","الصيغة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 cursor-pointer hover:text-primary transition-colors",onClick:()=>N("quantity"),children:e.jsxs("div",{className:"flex items-center",children:[q("quantity"),a("chemicals.col_quantity","الكمية")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden lg:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>N("state"),children:e.jsxs("div",{className:"flex items-center",children:[q("state"),a("common.status","الحالة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-18 cursor-pointer hover:text-primary transition-colors",onClick:()=>N("hazardClass"),children:e.jsxs("div",{className:"flex items-center",children:[q("hazardClass"),a("chemicals.col_hazard","الخطورة")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-20 hidden xl:table-cell",children:"GHS"}),e.jsx("th",{className:"px-3 py-5 text-right w-14 hidden md:table-cell cursor-pointer hover:text-primary transition-colors",onClick:()=>N("shelf"),children:e.jsxs("div",{className:"flex items-center",children:[q("shelf"),a("chemicals.col_location","الرف")]})}),e.jsx("th",{className:"px-3 py-5 text-right w-24 cursor-pointer hover:text-primary transition-colors",onClick:()=>N("expiryDate"),children:e.jsxs("div",{className:"flex items-center",children:[q("expiryDate"),a("chemicals.col_expiry","الصلاحية")]})}),e.jsx("th",{className:"px-3 py-5 text-right hidden 2xl:table-cell",children:a("common.notes","ملاحظات")}),e.jsx("th",{className:"px-3 py-5 text-center w-24",children:a("common.actions","إجراءات")})]})}),e.jsx("tbody",{className:"divide-y divide-outline/5 relative w-full",children:E?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:a("common.loading","جاري التحميل...")})}):he.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:12,className:"px-8 py-20 text-center text-outline/60 font-bold",children:a("common.empty","لا توجد مواد مطابقة للبحث")})}):e.jsxs(e.Fragment,{children:[z.getVirtualItems().length>0&&z.getVirtualItems()[0].start>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${z.getVirtualItems()[0].start}px`},colSpan:12})}),z.getVirtualItems().map(d=>{var w;const b=d.index,n=he[b];return e.jsxs("tr",{onClick:()=>R(n),ref:z.measureElement,"data-index":b,className:S("hover:bg-surface-container-low/40 transition-all group cursor-pointer text-base",(i==null?void 0:i.id)===n.id&&"bg-surface-container-low/60 border-r-4 border-primary"),children:[e.jsx("td",{className:"px-3 py-4",children:e.jsx("div",{onClick:f=>{f.stopPropagation(),me(n.id)},className:S("w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all",A.includes(n.id)?"bg-primary border-primary text-white scale-110":"border-outline/30 group-hover:border-primary/50"),children:A.includes(n.id)&&e.jsx(Ve,{size:12})})}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/60",children:b+1}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"font-black text-primary break-words leading-tight",children:n.nameEn}),e.jsx("span",{className:"text-xs text-secondary/60 break-words mt-0.5",children:n.nameAr})]})}),e.jsx("td",{className:"px-3 py-4 font-mono font-bold text-secondary/80 hidden sm:table-cell text-xs",children:n.formula}),e.jsxs("td",{className:"px-3 py-4 font-black text-primary whitespace-nowrap",children:[n.quantity," ",e.jsx("span",{className:"text-[10px] text-secondary/60",children:n.unit})]}),e.jsx("td",{className:"px-3 py-4 font-bold text-secondary/80 hidden lg:table-cell text-xs",children:n.state==="solid"?"صلب":n.state==="liquid"?"سائل":"غاز"}),e.jsx("td",{className:"px-3 py-4",children:e.jsx("span",{className:S("px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm",n.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-primary-fixed/40 text-primary"),children:n.hazardClass==="danger"?"خطر":"آمن"})}),e.jsx("td",{className:"px-3 py-4 hidden xl:table-cell",children:e.jsxs("div",{className:"flex gap-1.5",children:[(w=n.ghs)==null?void 0:w.slice(0,3).map((f,Fe)=>e.jsxs("div",{className:"w-9 h-9 bg-surface rounded-lg flex items-center justify-center border border-outline/20 p-1 shadow-sm hover:scale-125 transition-transform z-10 relative group/ghs",title:fe[f]||f,children:[J[f]?e.jsx("img",{src:J[f],alt:f,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("span",{className:"text-[8px] font-black",children:f}),e.jsx("div",{className:"absolute bottom-full mb-2 hidden group-hover/ghs:block bg-secondary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none shadow-xl",children:fe[f]||f})]},Fe)),n.ghs&&n.ghs.length>3&&e.jsxs("span",{className:"text-[10px] text-secondary/40 self-center font-bold",children:["+",n.ghs.length-3]})]})}),e.jsx("td",{className:"px-3 py-4 font-bold text-primary hidden md:table-cell text-xs",children:n.shelf}),e.jsx("td",{className:"px-3 py-4",children:e.jsxs("span",{className:S("font-bold whitespace-nowrap text-xs",n.expiryDate&&new Date(n.expiryDate)<new Date?"text-error flex items-center gap-1":"text-secondary/80"),children:[K(n.expiryDate),n.expiryDate&&new Date(n.expiryDate)<new Date&&e.jsx(Me,{size:14})]})}),e.jsx("td",{className:"px-3 py-4 text-xs text-secondary/60 hidden 2xl:table-cell min-w-[200px] leading-relaxed break-words",children:n.notes}),e.jsx("td",{className:"px-3 py-4 text-center",children:e.jsxs("div",{className:"flex gap-1 justify-center",children:[e.jsx("button",{onClick:f=>{f.stopPropagation(),O(n)},disabled:y,className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تحديث ذكي",children:e.jsx(be,{size:16})}),e.jsx("button",{onClick:f=>{f.stopPropagation(),ee(n),ne({nameEn:n.nameEn,nameAr:n.nameAr,formula:n.formula,casNumber:n.casNumber||"",storageTemp:n.storageTemp||"",unit:n.unit,quantity:n.quantity,state:n.state,hazardClass:n.hazardClass,ghs:n.ghs,shelf:n.shelf,expiryDate:n.expiryDate,notes:n.notes}),F(!0)},className:"p-1.5 text-outline/40 hover:text-primary hover:bg-primary/10 transition-all rounded-full active:scale-90",title:"تعديل",children:e.jsx(Dt,{size:16})}),e.jsx("button",{onClick:f=>{f.stopPropagation(),oe(n.id,n.nameAr)},className:"p-1.5 text-outline/40 hover:text-error hover:bg-error/10 transition-all rounded-full active:scale-90",title:"حذف",children:e.jsx(at,{size:16})})]})})]},n.id)}),z.getVirtualItems().length>0&&z.getTotalSize()-(((Ne=(je=z.getVirtualItems())==null?void 0:je.at(-1))==null?void 0:Ne.end)||0)>0&&e.jsx("tr",{children:e.jsx("td",{style:{padding:0,height:`${z.getTotalSize()-(((Se=(ke=z.getVirtualItems())==null?void 0:ke.at(-1))==null?void 0:Se.end)||0)}px`},colSpan:12})})]})})]})})]})}),e.jsxs("div",{className:"lg:col-span-4 space-y-8",children:[i?e.jsxs(H.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},className:"bg-surface-container-lowest rounded-[32px] p-10 relative overflow-hidden border border-outline/10 shadow-sm",children:[e.jsx("div",{className:"absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[120px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"}),e.jsxs("div",{className:"relative z-10 space-y-8",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("span",{className:S("text-[11px] px-4 py-1.5 rounded-[28px_28px_4px_28px] font-black uppercase tracking-widest shadow-sm",i.hazardClass==="danger"?"bg-error-container text-on-error-container":"bg-tertiary-fixed/60 text-tertiary"),children:i.hazardClass==="danger"?a("chemicals.hazard_danger","مادة خطرة"):a("chemicals.hazard_safe","مادة آمنة")}),i.hazardClass==="danger"&&e.jsx("div",{className:"flex gap-2 text-error animate-pulse",children:e.jsx(Me,{size:28})})]}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-3xl font-black text-primary mb-1 tracking-tight",children:i.nameEn}),e.jsx("h3",{className:"text-xl font-bold text-secondary mb-2 tracking-tight",children:i.nameAr}),e.jsx("p",{className:"text-lg font-mono font-bold text-secondary/60",children:i.formula})]}),e.jsxs("div",{className:"space-y-5 pt-8 border-t border-outline/5",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.field_cas","رقم CAS")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.casNumber||a("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.field_storage_temp","درجة التخزين")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.storageTemp||a("common.none","غير متوفر")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("common.status","الحالة")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.state==="solid"?a("chemicals.state_solid","صلب"):i.state==="liquid"?a("chemicals.state_liquid","سائل"):a("chemicals.state_gas","غاز")})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.col_location","الرف")}),e.jsx("span",{className:"font-black text-primary text-lg",children:i.shelf})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("chemicals.col_expiry","الصلاحية")}),e.jsx("span",{className:S("font-black text-lg",i.expiryDate&&new Date(i.expiryDate)<new Date?"text-error":"text-primary"),children:K(i.expiryDate)})]}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx("span",{className:"text-base font-bold text-secondary/60 uppercase tracking-widest",children:a("common.notes","ملاحظات")}),e.jsx("span",{className:"font-black text-primary text-sm text-left flex-1 mr-4 leading-relaxed break-words",children:i.notes||a("common.none","لا توجد")})]}),i.ghs&&i.ghs.length>0&&e.jsxs("div",{className:"pt-6 border-t border-outline/5",children:[e.jsx("span",{className:"text-[11px] font-black text-secondary/40 uppercase tracking-[0.2em] block mb-4",children:a("chemicals.ghs_symbols","رموز السلامة GHS")}),e.jsx("div",{className:"grid grid-cols-3 gap-4",children:i.ghs.map((d,b)=>e.jsxs("div",{className:"bg-surface p-3 rounded-2xl border border-outline/10 shadow-md hover:shadow-lg hover:border-primary/30 transition-all flex flex-col items-center gap-2 group/card",children:[e.jsx("div",{className:"w-16 h-16 flex items-center justify-center group-hover/card:scale-110 transition-transform",children:J[d]?e.jsx("img",{src:J[d],alt:d,className:"w-full h-full object-contain",referrerPolicy:"no-referrer"}):e.jsx("div",{className:"w-full h-full flex items-center justify-center text-xs font-black bg-surface-container-high rounded-xl",children:d})}),e.jsx("span",{className:"text-[10px] font-black text-secondary text-center leading-tight",children:fe[d]||d})]},b))})]}),e.jsxs("div",{className:"space-y-3 pt-2",children:[e.jsxs("div",{className:"flex justify-between items-end",children:[e.jsx("span",{className:"text-sm font-black text-primary uppercase tracking-widest",children:a("chemicals.col_quantity","مستوى المخزون")}),e.jsxs("span",{className:"text-2xl font-black text-primary",children:[i.quantity," ",e.jsx("span",{className:"text-sm text-secondary/60",children:i.unit})]})]}),e.jsx("div",{className:"h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline/5 shadow-inner",children:e.jsx("div",{className:"h-full bg-primary rounded-full shadow-sm",style:{width:"70%"}})})]})]}),e.jsxs("div",{className:"flex gap-3 pt-4",children:[e.jsx("button",{onClick:()=>pe(i),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("common.print","طباعة تعريفية"),children:e.jsx(De,{size:22})}),e.jsx("button",{onClick:()=>de([i]),className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("chemicals.btn_print_stock_cards","طباعة بطاقة المخزون"),children:e.jsx(et,{size:22})}),e.jsx("button",{onClick:()=>O(),disabled:y,className:"p-3 bg-primary-container hover:bg-primary/20 border border-primary/10 rounded-full text-primary transition-all active:scale-90 disabled:opacity-50",title:a("equipment.btn_smart_update","تحديث ذكي للمعلومات"),children:y?e.jsx("div",{className:"w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"}):e.jsx(be,{size:22})}),e.jsx("button",{className:"p-3 bg-surface-container-low hover:bg-surface-container-high border border-outline/10 rounded-full text-primary transition-all active:scale-90",title:a("common.scan_qr","توليد رمز QR"),children:e.jsx(Je,{size:22})})]})]})]},i.id):e.jsx("div",{className:"bg-surface-container-lowest rounded-[32px] p-12 text-center text-outline/60 font-bold border border-outline/10 border-dashed",children:a("chemicals.select_prompt","اختر مادة من القائمة لعرض تفاصيلها المخبرية")}),e.jsxs("div",{className:"bg-primary-container/30 backdrop-blur-sm p-8 rounded-[32px] text-on-primary-container border border-primary/10 relative overflow-hidden group shadow-sm",children:[e.jsxs("div",{className:"relative z-10",children:[e.jsxs("h4",{className:"font-black text-lg mb-3 flex items-center gap-2 text-primary",children:[e.jsx(Et,{size:20}),a("chemicals.safety_instructions","تعليمات السلامة")]}),e.jsx("p",{className:"text-sm font-medium text-primary/80 leading-relaxed",children:(i==null?void 0:i.hazardClass)==="danger"?"يجب ارتداء القفازات والنظارات الواقية عند التعامل مع هذه المادة. يحفظ في مكان بارد وجيد التهوية بعيداً عن مصادر الحرارة.":"يرجى اتباع بروتوكولات المختبر القياسية عند التعامل مع هذه المادة لضمان سلامتك وسلامة الزملاء."})]}),e.jsx(Me,{className:"absolute -bottom-6 -left-6 text-primary/5 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700"})]})]})]}),e.jsx(ge,{children:A.length>0&&e.jsxs(H.div,{initial:{y:100,opacity:0},animate:{y:0,opacity:1},exit:{y:100,opacity:0},className:"fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-secondary text-white px-6 py-4 rounded-[28px] shadow-2xl flex flex-wrap items-center justify-between gap-4 w-[calc(100vw-2rem)] max-w-2xl border border-white/10",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsxs("span",{className:"text-sm font-black",children:[A.length," ",a("common.selected","مادة مختارة")]}),e.jsx("span",{className:"text-[10px] text-white/60 font-bold",children:a("chemicals.bulk_operations_hint","يمكنك إجراء عمليات جماعية على هذه المواد")})]}),e.jsx("div",{className:"h-8 w-px bg-surface/10 hidden sm:block"}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{onClick:xe,className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-error/20 text-error-container hover:bg-error hover:text-white transition-all font-black text-xs",children:[e.jsx(at,{size:16}),a("common.delete_selected","حذف المختار")]}),e.jsxs("button",{className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface/10 hover:bg-surface/20 transition-all font-black text-xs",onClick:()=>{const d=m.filter(w=>A.includes(w.id)),b=W.json_to_sheet(d.map(w=>({Chemical:w.nameEn,Arabic:w.nameAr,Formula:w.formula,Qty:w.quantity,Unit:w.unit}))),n=W.book_new();W.book_append_sheet(n,b,"SelectedItems"),rt(n,`selected_chemicals_${new Date().getTime()}.xlsx`)},children:[e.jsx(tt,{size:16}),a("common.export_selected","تصدير المختار")]}),e.jsxs("button",{onClick:()=>{const d=m.filter(b=>A.includes(b.id));de(d)},className:"flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/20 text-primary-container hover:bg-primary hover:text-white transition-all font-black text-xs",children:[e.jsx(De,{size:16}),a("chemicals.btn_print_stock_cards","بطاقات المختار")]}),e.jsx("button",{onClick:()=>re([]),className:"p-1.5 hover:bg-surface/10 rounded-full transition-all ms-2","aria-label":"إلغاء التحديد",children:e.jsx(Ue,{size:18})})]})]})}),e.jsx(Tt,{isOpen:Ie,onClose:()=>F(!1),onSubmit:He,onSmartFill:le,isGenerating:y,newChemical:qe,editingChemical:X,onChange:(d,b)=>ne(n=>({...n,[d]:b}))}),e.jsx(Lt,{isOpen:Te,chemicalsLength:m.length,onClose:()=>ae(!1),onConfirm:C}),e.jsx(Pt,{isOpen:se,suggestedUpdate:Le,selectedChemical:i,onClose:()=>Pe(!1),onApprove:V}),e.jsx(ge,{children:B&&e.jsx(yt,{onClose:()=>ie(!1),onScan:d=>{ie(!1);let b=d;d.startsWith("APP_ID_")&&(b=d.split("_").slice(2,-1).join("_")),L(b);const n=m.find(w=>w.id===b||w.id===d);n?(R(n),ee(n),F(!0)):alert("عذراً، لم يتم العثور على المادة بهذه الشيفرة.")}})})]})}export{Wt as default};
