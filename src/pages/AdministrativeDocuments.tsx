import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  Building2, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  FileSpreadsheet, 
  Save, 
  FolderOpen,
  Share2,
  FileCheck2,
  ScrollText,
  BadgeCheck,
  Scale,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchool } from '../context/SchoolContext';
import { formatSchoolWithCommune } from '../lib/utils';
import { PrintService } from '../services/printService';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { PDFService } from '../services/pdfService';
import { db, getUserCollection } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export type DocCategory = 'all' | 'requests' | 'reports' | 'minutes' | 'forms' | 'saved';

export interface AdminTemplateItem {
  id: string;
  category: 'requests' | 'reports' | 'minutes' | 'forms';
  title: string;
  subTitle: string;
  tag: string;
  recipientDefault: string;
  senderDefault: string;
  subjectDefault: string;
  contentDefault: string;
  notesDefault?: string;
  hasTable?: boolean;
  tableHeaders?: string[];
  defaultRows?: { col1: string; col2: string; col3: string; col4: string }[];
  signers: string[];
}

export interface SavedAdminDoc {
  id: string;
  templateId: string;
  title: string;
  category: string;
  date: string;
  reference: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  notes?: string;
  rows?: { col1: string; col2: string; col3: string; col4: string }[];
  signers: string[];
  createdAt: any;
}

const TEMPLATES: AdminTemplateItem[] = [
  // --- 1. الطلبات الإدارية (Requests) ---
  {
    id: 'req-equipment-purchase',
    category: 'requests',
    title: 'طلب اقتناء عتاد ومواد مخبرية جديدة',
    subTitle: 'نموذج موجه للمدير والمقتصد لطلب وسائل تعليمية ومحاليل كيميائية',
    tag: 'طلب اقتناء',
    recipientDefault: 'السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)',
    senderDefault: 'الأستاذ المسؤول عن مادة العلوم الفيزيائية / مسير المخبر',
    subjectDefault: 'طلب تزويد المخبر بالعتاد والمواد الكيميائية الضرورية للموسم الدراسي',
    contentDefault: `يشرفني أن أتقدم إلى سيادتكم المحترمة بهذا الطلب قصد التكرم بالموافقة على تزويد المخبر بالعتاد والوسائل التعليمية والمواد الكيميائية المبينة في الجدول أسفله، وذلك قصد تمكين الأساتذة والتلاميذ من إنجاز الأعمال التطبيقية والتجارب المقررة في المناهج الرسمية في أحسن الظروف ووفق المعايير البيداغوجية المعتمدة.`,
    notesDefault: 'ملاحظة: تم ترتيب المواد حسب درجة الأولوية والاستعجال لإنجاز البرامج البيداغوجية المقررة.',
    hasTable: true,
    tableHeaders: ['الرقم', 'اسم الوسيلة أو المحلول', 'الكمية المطلوبة', 'المواصفات / الملاحظات'],
    defaultRows: [
      { col1: '01', col2: 'مخبار مدرج سعة 100 مل زجاجي', col3: '10 قطع', col4: 'فئة A مقاوم للحرارة' },
      { col1: '02', col2: 'محلول حمض كلور الماء 1M', col3: '02 لتر', col4: 'نقي للاستعمال المخبري' },
      { col1: '03', col2: 'أنابيب اختبار زجاجية قياس 16*160', col3: '50 أنبوب', col4: 'مع حوامل خشبية' },
      { col1: '04', col2: 'ميزان إلكتروني حساس دقة 0.01g', col3: '02 جهاز', col4: 'مع محول كهربائي' }
    ],
    signers: ['الأستاذ / مسير المخبر', 'المصالح المالية والمادية (المقتصد)', 'تأشيرة وموافقة السيد المدير']
  },
  {
    id: 'req-maintenance-repair',
    category: 'requests',
    title: 'طلب صيانة وإصلاح أجهزة علمية مخبرية',
    subTitle: 'طلب تدخل فني لإصلاح الميكروسكوبات والموازين والمولدات',
    tag: 'صيانة وإصلاح',
    recipientDefault: 'السيد: مدير المؤسسة التربوية (مصلحة الصيانة والوسائل)',
    senderDefault: 'المسؤول عن تسيير مخابر العلوم الطبيعية والفيزيائية',
    subjectDefault: 'طلب صيانة وإصلاح عتاد مخبري متعطل',
    contentDefault: `نحيط سيادتكم علماً بتسجيل بعض الأعطاب التقنية في التجهيزات المخبرية الموضحة أدناه، والتي توقفت عن العمل نتيجة الاستعمال الدوري أو أعطاب كهربائية وميكانيكية، مما يعيق السير الحسن للأعمال المخبرية، وعليه نلتمس منكم التنسيق لإجراء الصيانة اللازمة أو الاتصال بمصالح الصيانة المختصة لإعادة تشغيلها.`,
    notesDefault: 'الأجهزة حالياً موضوعة في جناح العزل تفادياً لأي تفاقم للأعطاب أو أخطار كهربائية.',
    hasTable: true,
    tableHeaders: ['الرقم', 'اسم الجهاز ورقمه التسلسلي', 'طبيعة العطب الملاحظ', 'القرار المقترح'],
    defaultRows: [
      { col1: '01', col2: 'مجهر ضوئي ثنائي العدسة N°04', col3: 'عطل في نظام الإضاءة والمكثف', col4: 'استبدال مصباح LED وفحص الدارة' },
      { col1: '02', col2: 'مولد تيار مستمر ومتناوب 0-12V', col3: 'انقطاع المنصهرة وحرق بالمقاومة', col4: 'صيانة كهربائية داخلية' },
      { col1: '03', col2: 'ميزان رقمي دقيق N°02', col3: 'عدم استقرار القراءة والصفير', col4: 'معايرة الحساس الداخلي' }
    ],
    signers: ['مسير المخبر', 'المقتصد', 'السيد المدير']
  },
  {
    id: 'req-safety-equipment',
    category: 'requests',
    title: 'طلب تزويد المخبر بوسائل الوقاية ومكافحة الحرائق',
    subTitle: 'تأمين مطافئ الحريق، حقائب الإسعافات، النظارات الواقية والقفازات',
    tag: 'أمن وسلامة',
    recipientDefault: 'السيد: مدير المؤسسة التربوية',
    senderDefault: 'مسؤول الأمن المخبري وأساتذة المواد التجريبية',
    subjectDefault: 'طلب توفير وتجديد وسائل السلامة والوقاية المخبرية',
    contentDefault: `حرصاً على سلامة أبنائنا التلاميذ والطاقم التربوي والتقني العامل بالمخابر، وامتثالاً للتعليمات الوزارية المنظمة للأمن المخبري، نلتمس من سيادتكم التكرم بتزويد المخبر بوسائل الوقاية الفردية والجماعية وتجديد منتهية الصلاحية منها وفق ما هو مبين أدناه.`,
    notesDefault: 'تعتبر هذه الوسائل إلزامية قانوناً قبل الشروع في أي تجارب كيميائية محفوفة بالمخاطر.',
    hasTable: true,
    tableHeaders: ['الرقم', 'وسيلة السلامة المطلوبة', 'الكمية', 'الملاحظات ومكان التثبيت'],
    defaultRows: [
      { col1: '01', col2: 'مطافئ حريق غاز CO2 سعة 5 كغ', col3: '02 مطفأة', col4: 'لحرائق المواد الكيميائية والأجهزة' },
      { col1: '02', col2: 'حقيبة إسعافات أولية مع محاليل غسيل العيون', col3: '01 حقيبة', col4: 'تثبيت جداري بجانب الباب' },
      { col1: '03', col2: 'نظارات واقية مقاومة للرذاذ', col3: '20 نظارة', col4: 'لحماية أعين التلاميذ' },
      { col1: '04', col2: 'قفازات نيتريل مقاس M و L', col3: '04 علب', col4: 'للتعامل مع الأحماض والمذيبات' }
    ],
    signers: ['مسؤول السلامة المخبرية', 'المقتصد', 'مدير المؤسسة']
  },
  {
    id: 'req-excursion-approval',
    category: 'requests',
    title: 'طلب ترخيص بتنظيم خرجة علمية استكشافية ميدانية',
    subTitle: 'طلب موافقة على نشاط بيئي أو زيارة مركز علمي / محطة مياه',
    tag: 'أنشطة علمية',
    recipientDefault: 'السيد: مدير المؤسسة التربوية (لإحالتها لمديرية التربية)',
    senderDefault: 'أستاذ مادة علوم الطبيعة والحياة / العلوم الفيزيائية',
    subjectDefault: 'طلب ترخيص لتنظيم خرجة علمية ميدانية لفائدة تلاميذ القسم',
    contentDefault: `في إطار إثراء المعارف البيداغوجية وربط المفاهيم النظرية بالتطبيقات الميدانية والبيئية وفق المنهاج الوزاري، يشرفني أن أطلب من سيادتكم التكرم بالترخيص لنا بتنظيم خرجة علمية لفائدة تلاميذ الأقسام المذكورة، مع التعهد التام بتأطيرهم والالتزام الصارم بشروط السلامة والانضباط.`,
    notesDefault: 'مرفق: قائمة التلاميذ المشاركين، ترخيصات الأولياء الموقعة، وبرنامج الزيارة الزمني.',
    hasTable: true,
    tableHeaders: ['الوجهة المقصودة', 'تاريخ وتوقيت الزيارة', 'المستوى الدراسي المعني', 'الأساتذة والمؤطرون المرافقون'],
    defaultRows: [
      { col1: 'محطة معالجة المياه / الحديقة النباتية', col2: 'يوم الخميس من 08:30 إلى 12:00', col3: 'السنة الثانية ثانوي علوم تجريبية', col4: 'أستاذ العلوم الطبيعية + ملحق المخبر' }
    ],
    signers: ['الأستاذ المنظم', 'مستشار التربية', 'موافقة وختم مدير المؤسسة']
  },
  {
    id: 'req-afterhours-lab',
    category: 'requests',
    title: 'طلب ترخيص باستغلال المخبر خارج الساعات النظامية',
    subTitle: 'أنشطة النوادي العلمية، التحضير للمسابقات، أو التجارب الاستدراكية',
    tag: 'أنشطة لاصفية',
    recipientDefault: 'السيد: مدير المؤسسة التربوية',
    senderDefault: 'منشط النادي العلمي / أستاذ المادة',
    subjectDefault: 'طلب استغلال فضاء المخبر خارج الساعات الرسمية',
    contentDefault: `قصد تمكين أعضاء النادي العلمي والتلاميذ المهتمين بالابتكارات العلمية من استكمال مشاريعهم وتجاربهم في أحسن الظروف، نلتمس من سيادتكم الموافقة على فتح المخبر العلمي واستغلال تجهيزاته في الفترات المحددة، مع التزامنا الكامل بالحفاظ على العتاد وتأمين النظافة والسلامة بعد انتهاء النشاط.`,
    hasTable: true,
    tableHeaders: ['اليوم', 'الفترة الزمنية', 'طبيعة النشاط أو التجربة', 'عدد التلاميذ المشرف عليهم'],
    defaultRows: [
      { col1: 'مساء الثلاثاء', col2: 'من 14:30 إلى 16:30', col3: 'تجارب تحضير الروبوت ومعايرة المحاليل', col4: '12 تلميذاً مع أستاذ مؤطر' }
    ],
    signers: ['الأستاذ المؤطر', 'مسير المخبر', 'مدير المؤسسة']
  },
  {
    id: 'req-leave-absence',
    category: 'requests',
    title: 'طلب عطلة استثنائية أو غياب مبرر لموظف المخبر',
    subTitle: 'طلب غياب رسمي للملحق بالمخبر أو التقني وفق التشريع المدرسي',
    tag: 'شؤون الموظفين',
    recipientDefault: 'السيد: مدير المؤسسة التربوية',
    senderDefault: 'الاسم واللقب: ..................... / الرتبة: ملحق بالمخبر',
    subjectDefault: 'طلب الاستفادة من عطلة استثنائية / غياب مرخص',
    contentDefault: `بمقتضى الأمر 06-03 المتضمن القانون الأساسي العام للوظيفة العمومية، وبناءً على المبررات القانونية المرفقة، يشرفني أن ألتمس من سيادتكم منحي رخصة غياب / عطلة استثنائية مدفوعة الأجر للأسباب والأيام الموضحة في هذا الطلب، مع تأكيد تسليم مفاتيح ومهام تسيير المخبر للزميل المناوب لضمان استمرارية المرفق العام.`,
    notesDefault: 'مرفق: الوثائق والشهادات المبررة للغياب.',
    hasTable: false,
    signers: ['الموظف المعني', 'المقتصد (للتأشير)', 'قرار مدير المؤسسة (مقبول / مرفوض)']
  },

  // --- 2. التقارير الإدارية والفنية (Reports) ---
  {
    id: 'rep-lab-accident',
    category: 'reports',
    title: 'تقرير عن حادث مخبري أو تلوث كيميائي أو كسر خطير',
    subTitle: 'توثيق رسمي مفصل لحوادث الانسكاب، التفاعلات العنيفة، أو إصابات التلاميذ',
    tag: 'تقرير حادث',
    recipientDefault: 'السيد: مدير المؤسسة التربوية (نسخة لمفتش المادة وطبيب الصحة المدرسية)',
    senderDefault: 'أستاذ المادة المؤطر / المشرف على الحصة المخبرية',
    subjectDefault: 'تقرير إخباري مفصل بخصوص حادث عرضي وقع بالمخبر',
    contentDefault: `نعلم سيادتكم أنه بتاريخ اليوم المذكور أدناه، وخلال إجراء الحصة التطبيقية المقررة لمستوى القسم المعني، وقع حادث عرضي في فضاء المخبر. تم على الفور تطبيق بروتوكول الطوارئ وعزل المنطقة وتقديم الإسعافات الأولية ونقل المصاب إن وُجد إلى قاعة التمريض، ونوافيكم بحيثيات الحادث والأسباب المباشرة والتدابير المتخذة.`,
    notesDefault: 'تم تأمين موقع الحادث وإيقاف كافة التفاعلات ومراجعة إجراءات السلامة.',
    hasTable: true,
    tableHeaders: ['تاريخ وتوقيت الحادث', 'مكان الحادث بالمخبر', 'الأضرار المادية أو الجسدية', 'الإجراءات الاستعجالية المتخذة'],
    defaultRows: [
      { col1: '2026/10/04 - 10:15 صباحاً', col2: 'طاولة التجريب رقم 03', col3: 'انكسار أنبوب وتسرب طفيف لمحلول حمضي مخفف دون إصابات بشرية', col4: 'معادلة الحمض ببيكربونات الصوديوم وتهوية القاعة فوراً' }
    ],
    signers: ['أستاذ الحصة الشاهد', 'مسير المخبر', 'طبيب / ممرض الصحة المدرسية', 'مدير المؤسسة']
  },
  {
    id: 'rep-trimester-status',
    category: 'reports',
    title: 'تقرير دوري ثلاثي عن الوضعية العامة للمخبر',
    subTitle: 'حصيلة شاملة عن جاهزية الأجهزة، الاستهلاك، ونسبة إنجاز التجارب',
    tag: 'تقرير دوري',
    recipientDefault: 'السيد: مدير المؤسسة التربوية والمفتش البيداغوجي للمادة',
    senderDefault: 'مسؤول التنسيق المخبري وأساتذة المواد العلمية',
    subjectDefault: 'التقرير الدوري لتقييم نشاط المخابر خلال الثلاثي الدراسي',
    contentDefault: `يسرنا أن نرفع إلى كريم علمكم التقرير الدوري المفصل حول الوضعية العامة للمخابر العلمية خلال هذا الثلاثي، والذي يبرز نسبة إنجاز التجارب البيداغوجية، حجم استهلاك المواد الكيميائية والزجاجيات، حالة الأجهزة العلمية ونقائص الصيانة المسجلة، بهدف اتخاذ التدابير التصحيحية اللازمة.`,
    notesDefault: 'بلغت النسبة الإجمالية لإنجاز الأعمال المخبرية المقررة في المنهاج 92% بفضل تضافر جهود الطاقم.',
    hasTable: true,
    tableHeaders: ['المؤشر البيداغوجي', 'العدد / النسبة', 'الملاحظات والتقييم', 'الاحتياج المسجل'],
    defaultRows: [
      { col1: 'عدد الحصص المخبرية المنجزة', col2: '48 حصة مخبرية', col3: 'تغطية منتظمة لكافة الأفواج', col4: 'لا يوجد' },
      { col1: 'نسبة توفر المواد الكيميائية', col2: '85%', col3: 'نقص في كواشف الكيمياء الحيوية', col4: 'طلب شراء تكميلي' },
      { col1: 'حالة الأجهزة والميكروسكوبات', col2: '24 جهاز صالح / 3 أعطاب', col3: 'تم عزل الأجهزة المعطلة', col4: 'طلب صيانة دورية' }
    ],
    signers: ['منسق المادة والمخبر', 'المقتصد', 'مدير المؤسسة']
  },
  {
    id: 'rep-defective-equipment',
    category: 'reports',
    title: 'تقرير فني عن أجهزة وتجهيزات غير قابلة للإصلاح',
    subTitle: 'معاينة هندسية وتقنية للأجهزة المستهلكة تمهيداً لإسقاطها من السجل',
    tag: 'تقرير معاينة فنية',
    recipientDefault: 'السيد: مدير المؤسسة التربوية (لجنة الجرد والإسقاط)',
    senderDefault: 'لجنة المعاينة التقنية للمخابر والتجهيزات العلمية',
    subjectDefault: 'تقرير فني ومعاينة عتاد علمي غير قابل للإصلاح (عتاد هالك)',
    contentDefault: `بناءً على المعاينة الميدانية الدقيقة التي قامت بها اللجنة التقنية المختصة بالمؤسسة للأجهزة والوسائل المدرجة في الجدول، وبعد فحصها ومحاولة صيانتها محلياً، تبين أنها أصيبت بأعطاب جسيمة وتآكل متقدم يستحيل معه إصلاحها اقتصادياً أو تقنياً، وعليه نقترح إخراجها من الخدمة تمهيداً لإسقاطها وتبرئة ذمة المخبر.`,
    hasTable: true,
    tableHeaders: ['اسم العتاد والماركة', 'الرقم التسلسلي / الجرد', 'تاريخ الشراء / الدخول', 'السبب الفني لعدم الصلاحية'],
    defaultRows: [
      { col1: 'مجهر بصري روسي الصنع', col2: 'جرد: 142/08', col3: '2008', col4: 'كسر داخلي بالمنشور البصري وتلف ميكانيكي بحامل العدسات' },
      { col1: 'جهاز راسم الاهتزاز المهبطي أنالوج', col2: 'جرد: 88/11', col3: '2011', col4: 'حرق بالمحول عالي التوتر وانعدام قطع الغيار الأصلية' },
      { col1: 'مضخة تفريغ الهواء يدوية', col2: 'جرد: 205/14', col3: '2014', col4: 'تلف الأسطوانة والمانومتر وتسرب مستمر' }
    ],
    signers: ['تقني / مسير المخبر', 'أستاذ المادة ذو الخبرة', 'المقتصد', 'مدير المؤسسة']
  },
  {
    id: 'rep-expired-chemicals',
    category: 'reports',
    title: 'تقرير عن الكواشف والمواد الكيميائية منتهية الصلاحية',
    subTitle: 'حصر المواد المتدهورة أو الخطرة تمهيداً لمعالجتها وتحييدها بأمان',
    tag: 'مواد منتهية',
    recipientDefault: 'السيد: مدير المؤسسة ومصلحة الوقاية والأمن بمديرية التربية',
    senderDefault: 'المسؤول عن تسيير مخزن المواد الكيميائية والمخبر',
    subjectDefault: 'تقرير حصر المواد الكيميائية منتهية الصلاحية وخطورة التخزين',
    contentDefault: `نعلمكم بأن عملية المراقبة الدورية لتواريخ نهاية صلاحية الكواشف المخبرية أسفرت عن حصر مجموعة من المواد الكيميائية التي فقدت فعاليتها أو طرأ عليها تغير في خواصها الفيزيائية، وتعتبر استمراريتها في المخزن مصدراً محتملاً للخطر، ولذا نقترح اتخاذ الإجراءات البيئية السليمة لتحييدها وإتلافها بالتنسيق مع الجهات الوصية.`,
    hasTable: true,
    tableHeaders: ['اسم المادة الكيميائية والصيغة', 'الحالة والتركيز', 'الكمية المحصورة', 'طبيعة الخطر وتاريخ الانتهاء'],
    defaultRows: [
      { col1: 'نترات الفضة AgNO3', col2: 'بلورات متكتلة متأكسدة', col3: '100 غرام', col4: 'مؤكسد قوي - منتهية منذ 2021' },
      { col1: 'برمنغنات البوتاسيوم KMnO4', col2: 'محلول مائي 0.1M', col3: '500 مل', col4: 'تفكك وتحول للون البني - منتهية 2022' },
      { col1: 'حمض النيتريك HNO3', col2: 'سائل مركز 65%', col3: '01 لتر', col4: 'تآكل الغطاء وتصاعد أبخرة - غير آمن' }
    ],
    signers: ['مسير مخزن الكيماويات', 'أستاذ الفيزياء والكيمياء', 'المقتصد', 'مدير المؤسسة']
  },

  // --- 3. المحاضر الإدارية (Official Minutes & Protocols) ---
  {
    id: 'min-equipment-reception',
    category: 'minutes',
    title: 'محضر استلام ومطابقة تجهيزات ومواد مخبرية جديدة',
    subTitle: 'محضر استلام قانوني لمطابقة طلبيات التموين والمناقصات وسندات التسليم',
    tag: 'محضر استلام',
    recipientDefault: 'ملف المقتصدية والمخزن المركزي للمؤسسة التربوية',
    senderDefault: 'لجنة استلام وتفتيش المواد والتجهيزات البيداغوجية بالمؤسسة',
    subjectDefault: 'محضر استلام ومطابقة العتاد المخبري موضوع سند التسليم',
    contentDefault: `في يومه وتاريخه، اجتمعت اللجنة المكلفة باستلام التجهيزات والمواد المخبرية بمقر المخبر، بحضور أعضائها المذكورين، وقامت بفحص وتجريب ومعاينة الوسائل المسلمة من طرف المورد المعتمد، ومطابقتها مع المواصفات التقنية الواردة في سند الطلب، وقد خلصت اللجنة إلى النتائج الموضحة في هذا المحضر.`,
    notesDefault: 'قرار اللجنة: تم قبول الاستلام المؤقت بعد التحقق من سلامة الأجهزة والمطابقة الكاملة للشروط.',
    hasTable: true,
    tableHeaders: ['الرقم', 'تعيين المادة أو العتاد', 'الكمية المسلمة', 'المطابقة التقنية والقرار'],
    defaultRows: [
      { col1: '01', col2: 'حقائب تجارب الكهرباء والمغناطيسية', col3: '04 حقائب', col4: 'مطابقة وسليمة بنسبة 100%' },
      { col1: '02', col2: 'ميكروسكوبات بصرية مع عدسات زيتية', col3: '06 أجهزة', col4: 'مطابقة وتم تجريب الإضاءة وتكبيرها' },
      { col1: '03', col2: 'كواشف كيميائية نقية للتحليل', col3: '12 عبوة زجاجية', col4: 'مطابقة للمواصفات وبطاقات السلامة' }
    ],
    signers: ['المورد / مندوب التسليم', 'أستاذ المادة الخبير', 'المقتصد (مسؤول المالية والمادية)', 'رئيس اللجنة / مدير المؤسسة']
  },
  {
    id: 'min-equipment-scrapping',
    category: 'minutes',
    title: 'محضر إسقاط وتخريد عتاد مخبري هالك أو متلاشٍ',
    subTitle: 'محضر الشطب النهائي من سجل الجرد بعد موافقة مجلس التوجيه والتسيير',
    tag: 'محضر إسقاط',
    recipientDefault: 'مديرية التربية (مصلحة المالية والوسائل) وأرشيف المؤسسة',
    senderDefault: 'لجنة الجرد والإسقاط بالمؤسسة التربوية',
    subjectDefault: 'محضر اجتماع لجنة إسقاط العتاد والوسائل المخبرية غير الصالحة',
    contentDefault: `تنفيذاً للتعليمات الوزارية الخاصة بتسيير سجلات الجرد وإسقاط العتاد المستهلك، اجتمعت اللجنة المشكلة بالقرار الداخلي، وقامت بالمعاينة النهائية للأصناف المقترحة للإسقاط والتي استوفت الإجراءات التقنية والمالية، وقررت شطبها نهائياً من سجلات الجرد العام للمؤسسة لعدم جدواها وتآكلها التام.`,
    hasTable: true,
    tableHeaders: ['رقم الجرد', 'بيان الصنف والعتاد', 'سنة التخصيص', 'القيمة المقدرة', 'القرار النهائي'],
    defaultRows: [
      { col1: '042/PHY', col2: 'راسم اهتزاز مهبطي قديم', col3: '2005', col4: '00.00 دج (هالك)', col5: 'شطب وتحويل لمستودع الخردة' } as any,
      { col1: '115/BIO', col2: 'مجموعة زجاجيات متصدعة ومشروخة', col3: '2012', col4: '00.00 دج (متلاشٍ)', col5: 'إتلاف تام' } as any
    ],
    signers: ['مسير المخبر', 'المقتصد', 'أستاذ ممثل عن المادة', 'رئيس المؤسسة']
  },
  {
    id: 'min-breakage-loss',
    category: 'minutes',
    title: 'محضر ضياع أو إتلاف عتاد مخبري من طرف التلاميذ',
    subTitle: 'تسجيل التلفيات والحوادث أثناء الحصص العملية وتحديد المسؤوليات والتعويض',
    tag: 'محضر كسر',
    recipientDefault: 'السيد: مدير المؤسسة والسيد المقتصد',
    senderDefault: 'أستاذ المادة المشرف على الفوج المخبري',
    subjectDefault: 'محضر إثبات كسر أو ضياع أدوات مخبرية أثناء حصة تطبيقية',
    contentDefault: `نحيطكم علماً بأنه في التاريخ والساعة المبينة، وأثناء إنجاز حصة الأعمال التطبيقية المقررة للفوج المعني، وقع كسر / ضياع للأدوات المخبرية الموضحة في هذا المحضر نتيجة خطأ في المناولة أو سقوط غير مقصود، وقد تم اتخاذ الإجراءات التأمينية وإلزام المتسبب بالإجراءات المنصوص عليها في النظام الداخلي للمخبر.`,
    hasTable: true,
    tableHeaders: ['اسم التلميذ(ة) المعني', 'القسم والفوج', 'الأداة المكسورة / الضائعة', 'طبيعة الحادث وحكم التعويض'],
    defaultRows: [
      { col1: 'اسم التلميذ هنا', col2: '2 ع ت 1 - فوج أ', col3: 'مخبار مدرج زجاجي 250 مل', col4: 'سقوط عرضي - تعويض عيني بالمطابقة' }
    ],
    signers: ['التلميذ(ة) المعني', 'أستاذ الحصة', 'مسير المخبر', 'المقتصد']
  },
  {
    id: 'min-coordination-meeting',
    category: 'minutes',
    title: 'محضر جلسة تنسيقية لأساتذة المادة ومسؤول المخبر',
    subTitle: 'تنسيق رزنامة التجارب، توزيع القاعات، ومتابعة الاحتياجات الدورية',
    tag: 'جلسة تنسيقية',
    recipientDefault: 'السيد: مدير المؤسسة ومفتش المادة البيداغوجي',
    senderDefault: 'منسق المادة وأساتذة العلوم بالمؤسسة',
    subjectDefault: 'محضر اجتماع التنسيق البيداغوجي والتسيير المخبري',
    contentDefault: `في إطار التنسيق البيداغوجي الدوري، انعقدت بمقر المخبر الجلسة التنسيقية المشتركة برئاسة منسق المادة وبحضور السادة الأساتذة ومسؤولي المخابر، حيث تم تداول جدول الأعمال المتعلق برزنامة التجارب للفصل، ضبط جداول استعمال المخابر، مراجعة اشتراطات الأمان، وتحديد الاحتياجات الضرورية.`,
    notesDefault: 'خرج المجتمعون بالتوصيات التالية: الالتزام الصارم بارتداء المئزر والنظارات، وتأكيد حجز الحصص قبل 48 ساعة.',
    hasTable: true,
    tableHeaders: ['نقطة جدول الأعمال', 'المناقشات والآراء المطروحة', 'القرار والاتفاق المتخذ', 'المسؤول عن التنفيذ'],
    defaultRows: [
      { col1: 'رزنامة الأعمال التطبيقية', col2: 'تنسيق التوقيت وتفادي التداخل بين الأساتذة', col3: 'اعتماد الرزنامة الأسبوعية الموحدة', col4: 'مسير المخبر والأساتذة' },
      { col1: 'تدابير السلامة والنفايات', col2: 'عزل المحاليل الخطرة وعدم سكبها في المجاري', col3: 'توفير عبوات خاصة لجمع النفايات', col4: 'الجميع' }
    ],
    signers: ['أساتذة المادة الحاضرون', 'مسير المخبر', 'منسق المادة', 'تأشيرة مدير المؤسسة']
  },

  // --- 4. الاستمارات وبطاقات التسيير (Forms & Management Cards) ---
  {
    id: 'form-equipment-loan',
    category: 'forms',
    title: 'استمارة إعارة واسترجاع عتاد مخبري لأستاذ المادة',
    subTitle: 'سند إعارة رسمي لضبط خروج واسترجاع التجهيزات والمجسمات البيداغوجية',
    tag: 'استمارة إعارة',
    recipientDefault: 'أرشيف تسيير المخبر وسجل الإعارات',
    senderDefault: 'الأستاذ المستعير: ...................... / مادة التدريس: ......................',
    subjectDefault: 'استمارة تسليم واسترجاع وسائل تعليمية مخبرية',
    contentDefault: `أقر أنا الموقع أدناه، الأستاذ(ة) المذكور، بأنني استلمت من مسير المخبر التجهيزات والوسائل التعليمية المبينة بالجدول في حالة جيدة وسليمة وصالحة للاستعمال، وأتعهد باستغلالها في الإطار البيداغوجي المخصص لها، وإعادتها فور انتهاء الحصة المقررة بحالتها الأصلية.`,
    hasTable: true,
    tableHeaders: ['اسم العتاد والوسيلة', 'الرقم التسلسلي / الكود', 'تاريخ الاستلام وساعة الخروج', 'تاريخ وساعة الإرجاع وحالة العتاد'],
    defaultRows: [
      { col1: 'مجسم الجهاز الهضمي للإنسان', col2: 'BIO-MOD-08', col3: '2026/10/04 - 08:30', col4: '2026/10/04 - 10:30 (سليم)' },
      { col1: 'صندوق عدسات ومرايا بصرية', col2: 'OPT-BOX-02', col3: '2026/10/04 - 10:30', col4: 'قيد الاستعمال' }
    ],
    signers: ['الأستاذ المستعير', 'مسير المخبر (عند التسليم)', 'مسير المخبر (عند الاسترجاع)']
  },
  {
    id: 'form-tech-equipment-sheet',
    category: 'forms',
    title: 'بطاقة فنية وتعريفية لجهاز مخبري نوعي',
    subTitle: 'بطاقة هوية شاملة للجهاز: بلد الصنع، الخصائص الكهربائية، ومحاذير الاستعمال',
    tag: 'بطاقة فنية للجهاز',
    recipientDefault: 'تثبت على غلاف الجهاز أو تحفظ في ملف الأجهزة النوعية',
    senderDefault: 'المسؤول عن التوثيق التقني للمخابر',
    subjectDefault: 'بطاقة الهوية الفنية والمواصفات لجهاز مخبري',
    contentDefault: `تعتبر هذه البطاقة وثيقة تعريفية مرجعية للجهاز العلمي، تتضمن معلومات الصنع، الخصائص التشغيلية الكهربائية والميكانيكية، إجراءات الصيانة الوقائية، وقواعد السلامة الإلزامية قبل وأثناء التشغيل لضمان استدامته وحمايته من التلف.`,
    hasTable: true,
    tableHeaders: ['البيان الفني', 'المعلومة المرجعية', 'حدود التشغيل الآمن', 'إجراء الصيانة الدوري'],
    defaultRows: [
      { col1: 'اسم الجهاز التجاري والماركة', col2: 'مسبار قياس الأس الهيدروجيني pH-mètre', col3: 'درجة حرارة 10-40°C', col4: 'حفظ الإلكترود في محلول KCl 3M' },
      { col1: 'التغذية الكهربائية', col2: 'بطارية 9V أو محول 220V/50Hz', col3: 'استقرار التوتر', col4: 'فصل المحول بعد انتهاء العمل' },
      { col1: 'نطاق القياس والدقة', col2: '0.00 إلى 14.00 pH بمعدل خطأ ±0.01', col3: 'معايرة بمحلولين عياريين pH 4 و pH 7', col4: 'غسيل بالماء المقطر بعد كل قياس' }
    ],
    signers: ['معد البطاقة (تقني المخبر)', 'أستاذ المادة', 'المقتصد']
  },
  {
    id: 'form-sensitive-chemicals-log',
    category: 'forms',
    title: 'سجل تتبع استهلاك المواد الكيميائية الحساسة والخاضعة للرقابة',
    subTitle: 'متابعة دقيقة بالمليغرام للمواد السامة أو المؤكسدة الشديدة أو القابلة للاشتعال',
    tag: 'متابعة الكيماويات',
    recipientDefault: 'سجل الرقابة المخبرية الدائم بالمؤسسة',
    senderDefault: 'المسؤول الحصري عن خزينة المواد الكيميائية',
    subjectDefault: 'استمارة ضبط واستهلاك مادة كيميائية خاضعة للتتبع الدقيق',
    contentDefault: `تطبيقاً للبروتوكول الوزاري الخاص بتداول وحفظ المواد الكيميائية الخطرة أو الحساسة، تُسجل في هذه الاستمارة كل حركة خروج واستعمال للمادة المحددة، متضمنة هوية الأستاذ المستلم، الغرض البيداغوجي، الكمية المستهلكة بالتدقيق، والرصيد المتبقي في الخزانة المؤمنة.`,
    hasTable: true,
    tableHeaders: ['تاريخ السحب', 'اسم الأستاذ المستلم', 'التجربة المستهدفة', 'الكمية المسحوبة', 'الرصيد المتبقي بالخزانة'],
    defaultRows: [
      { col1: '2026/10/02', col2: 'أ. فلان (فيزياء)', col3: 'معايرة حمض وأساس (2 ثانوي)', col4: '50 مل محلول هيدروكسيد الصوديوم 1M', col5: '950 مل' } as any,
      { col1: '2026/10/04', col2: 'أ. علان (علوم)', col3: 'الكشف عن السكريات المرجعة', col4: '20 مل كاشف فهلنج A+B', col5: '480 مل' } as any
    ],
    signers: ['الأستاذ المستلم', 'المسؤول عن خزانة المواد الكيميائية', 'تأشيرة مدير المؤسسة']
  }
];

export default function AdministrativeDocuments() {
  const navigate = useNavigate();
  const { schoolName, directorate, commune } = useSchool();
  const country = 'الجمهورية الجزائرية الديمقراطية الشعبية';
  const ministry = 'وزارة التربية الوطنية';
  const { openPdfPreview } = usePdfPreview();

  const [activeTab, setActiveTab] = useState<DocCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AdminTemplateItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Saved user documents
  const [savedDocs, setSavedDocs] = useState<SavedAdminDoc[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Form State for editing
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docRef, setDocRef] = useState('');
  const [docSender, setDocSender] = useState('');
  const [docRecipient, setDocRecipient] = useState('');
  const [docSubject, setDocSubject] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docRows, setDocRows] = useState<{ col1: string; col2: string; col3: string; col4: string }[]>([]);
  const [docSigners, setDocSigners] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const formattedSchool = formatSchoolWithCommune(schoolName, commune) || 'المؤسسة التربوية';

  // Load saved documents from localStorage & Firestore
  useEffect(() => {
    loadSavedDocuments();
  }, []);

  const loadSavedDocuments = async () => {
    setLoadingSaved(true);
    try {
      // 1. Load from LocalStorage
      const local = localStorage.getItem('local_admin_documents');
      let combined: SavedAdminDoc[] = local ? JSON.parse(local) : [];

      // 2. Try Firestore
      try {
        const q = query(collection(db, 'user_admin_documents'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedAdminDoc));
        // Merge without duplicates
        const ids = new Set(combined.map(d => d.id));
        remote.forEach(r => {
          if (!ids.has(r.id)) combined.push(r);
        });
      } catch (err) {
        // Firestore may be offline or rules-limited
      }

      setSavedDocs(combined);
    } catch (e) {
      console.warn('Error loading saved documents:', e);
    } finally {
      setLoadingSaved(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open editor with template
  const handleOpenTemplate = (template: AdminTemplateItem) => {
    setSelectedTemplate(template);
    setDocDate(new Date().toISOString().split('T')[0]);
    setDocRef(`مخ/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
    setDocSender(template.senderDefault);
    setDocRecipient(template.recipientDefault);
    setDocSubject(template.subjectDefault);
    setDocContent(template.contentDefault);
    setDocNotes(template.notesDefault || '');
    setDocRows(template.defaultRows ? JSON.parse(JSON.stringify(template.defaultRows)) : []);
    setDocSigners([...template.signers]);
    setIsEditorOpen(true);
  };

  // Open saved document
  const handleOpenSavedDoc = (savedDoc: SavedAdminDoc) => {
    const parentTpl = TEMPLATES.find(t => t.id === savedDoc.templateId) || {
      id: savedDoc.templateId || 'custom',
      category: 'requests' as const,
      title: savedDoc.title,
      subTitle: 'وثيقة إدارية محفوظة',
      tag: 'وثيقة مخصصة',
      recipientDefault: savedDoc.recipient,
      senderDefault: savedDoc.sender,
      subjectDefault: savedDoc.subject,
      contentDefault: savedDoc.content,
      notesDefault: savedDoc.notes,
      hasTable: Boolean(savedDoc.rows && savedDoc.rows.length > 0),
      tableHeaders: ['الرقم', 'البيان والتعيين', 'الكمية / المواصفة', 'الملاحظات'],
      defaultRows: savedDoc.rows,
      signers: savedDoc.signers
    };

    setSelectedTemplate(parentTpl);
    setDocDate(savedDoc.date || new Date().toISOString().split('T')[0]);
    setDocRef(savedDoc.reference || '');
    setDocSender(savedDoc.sender || '');
    setDocRecipient(savedDoc.recipient || '');
    setDocSubject(savedDoc.subject || '');
    setDocContent(savedDoc.content || '');
    setDocNotes(savedDoc.notes || '');
    setDocRows(savedDoc.rows || []);
    setDocSigners(savedDoc.signers || ['مسير المخبر', 'مدير المؤسسة']);
    setIsEditorOpen(true);
  };

  // Delete saved document
  const handleDeleteSavedDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الوثيقة المحفوظة؟')) return;

    try {
      const updated = savedDocs.filter(d => d.id !== id);
      setSavedDocs(updated);
      localStorage.setItem('local_admin_documents', JSON.stringify(updated));

      try {
        await deleteDoc(doc(db, 'user_admin_documents', id));
      } catch {}

      showNotification('تم حذف الوثيقة بنجاح من الأرشيف', 'info');
    } catch (err) {
      console.error('Error deleting doc:', err);
    }
  };

  // Add row to table
  const handleAddRow = () => {
    const nextNum = (docRows.length + 1).toString().padStart(2, '0');
    setDocRows([...docRows, { col1: nextNum, col2: '', col3: '', col4: '' }]);
  };

  // Remove row from table
  const handleRemoveRow = (index: number) => {
    setDocRows(docRows.filter((_, i) => i !== index));
  };

  // Update row
  const handleUpdateRow = (index: number, field: 'col1' | 'col2' | 'col3' | 'col4', val: string) => {
    const newRows = [...docRows];
    newRows[index][field] = val;
    setDocRows(newRows);
  };

  // Save document
  const handleSaveDocument = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const newDoc: SavedAdminDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        templateId: selectedTemplate.id,
        title: selectedTemplate.title,
        category: selectedTemplate.category,
        date: docDate,
        reference: docRef,
        sender: docSender,
        recipient: docRecipient,
        subject: docSubject,
        content: docContent,
        notes: docNotes,
        rows: docRows,
        signers: docSigners,
        createdAt: new Date().toISOString()
      };

      // 1. Save locally
      const updated = [newDoc, ...savedDocs];
      setSavedDocs(updated);
      localStorage.setItem('local_admin_documents', JSON.stringify(updated));

      // 2. Try Firestore
      try {
        await addDoc(collection(db, 'user_admin_documents'), {
          ...newDoc,
          createdAt: serverTimestamp()
        });
      } catch {}

      showNotification('تم حفظ الوثيقة بنجاح في أرشيفك الشخصي!', 'success');
    } catch (err) {
      console.error('Error saving document:', err);
      showNotification('تعذر الحفظ في السحابة، تم الحفظ محلياً.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate HTML for printing
  const generateOfficialHtml = () => {
    if (!selectedTemplate) return '';

    const tableHeaders = selectedTemplate.tableHeaders || ['الرقم', 'البيان', 'الكمية', 'الملاحظات'];

    let tableHtml = '';
    if (selectedTemplate.hasTable && docRows.length > 0) {
      tableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; text-align: center;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #1e293b;">
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 60px;">${tableHeaders[0]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right;">${tableHeaders[1]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px; width: 140px;">${tableHeaders[2]}</th>
              <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">${tableHeaders[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${docRows.map((r, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#fafaf9'};">
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: bold;">${r.col1 || (i + 1)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: right;">${r.col2 || '-'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${r.col3 || '-'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${r.col4 || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const signaturesHtml = `
      <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 10px; text-align: center;">
        ${docSigners.map(sig => `
          <div style="flex: 1; margin: 0 10px; border-top: 1px dashed #94a3b8; padding-top: 8px;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${sig}</div>
            <div style="height: 55px; margin-top: 8px; color: #94a3b8; font-size: 11px;">(التوقيع والختم)</div>
          </div>
        `).join('')}
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${selectedTemplate.title} - ${formattedSchool}</title>
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
        <div class="header-center">${country || 'الجمهورية الجزائرية الديمقراطية الشعبية'}</div>
        <div class="header-center" style="font-size: 13px; color: #475569;">${ministry || 'وزارة التربية الوطنية'}</div>

        <div class="inst-info">
          <div>
            <div>${directorate || 'مديرية التربية الوطنية'}</div>
            <div>${formattedSchool}</div>
          </div>
          <div style="text-align: left;" dir="ltr">
            <div>التاريخ: ${docDate}</div>
            ${docRef ? `<div>المرجع: ${docRef}</div>` : ''}
          </div>
        </div>

        <div class="title-box">
          <h1>${selectedTemplate.title}</h1>
        </div>

        <div class="correspondence-meta">
          <div><strong>من:</strong> ${docSender}</div>
          <div style="margin-top: 4px;"><strong>إلى:</strong> ${docRecipient}</div>
          <div style="margin-top: 4px; color: #0f766e;"><strong>الموضوع:</strong> ${docSubject}</div>
        </div>

        <div class="body-content">${docContent}</div>

        ${tableHtml}

        ${docNotes ? `<div class="notes-box"><strong>ملاحظة هامة:</strong> ${docNotes}</div>` : ''}

        ${signaturesHtml}
      </body>
      </html>
    `;
  };

  // Direct print
  const handlePrint = async () => {
    const html = generateOfficialHtml();
    if (!html) return;
    try {
      await PrintService.printHtml(html, { title: selectedTemplate?.title });
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  // Preview as PDF in PdfReviewModal
  const handlePreviewPdf = async (templateItem?: AdminTemplateItem, customData?: Partial<SavedAdminDoc>) => {
    const tpl = templateItem || selectedTemplate;
    if (!tpl) return;

    const sender = customData?.sender || (templateItem ? templateItem.senderDefault : docSender) || tpl.senderDefault;
    const recipient = customData?.recipient || (templateItem ? templateItem.recipientDefault : docRecipient) || tpl.recipientDefault;
    const subject = customData?.subject || (templateItem ? templateItem.subjectDefault : docSubject) || tpl.subjectDefault;
    const content = customData?.content || (templateItem ? templateItem.contentDefault : docContent) || tpl.contentDefault;
    const notes = customData?.notes !== undefined ? customData.notes : (templateItem ? templateItem.notesDefault : docNotes);
    const date = customData?.date || (templateItem ? new Date().toISOString().split('T')[0] : docDate);
    const ref = customData?.reference || (templateItem ? '' : docRef);
    const rows = customData?.rows || (templateItem ? templateItem.defaultRows : docRows) || [];
    const signers = customData?.signers || (templateItem ? templateItem.signers : docSigners) || tpl.signers;
    const tableHeaders = tpl.tableHeaders || ['الرقم', 'البيان والتسمية', 'الكمية', 'الملاحظات'];

    try {
      const pdfBlob = await PDFService.generateAdministrativeDocumentPDF({
        title: tpl.title,
        reference: ref,
        category: tpl.tag,
        date: date,
        sender: sender,
        recipient: recipient,
        subject: subject,
        content: content,
        notes: notes,
        hasTable: Boolean(tpl.hasTable && rows.length > 0),
        tableHeaders: tableHeaders,
        tableRows: rows.map(r => [r.col1, r.col2, r.col3, r.col4]),
        signers: signers,
        schoolInfo: {
          country,
          ministry,
          directorate,
          school: schoolName,
          commune
        },
        fileName: `${tpl.title}.pdf`
      });

      openPdfPreview({
        file: new File([pdfBlob], `${tpl.title}.pdf`, { type: 'application/pdf' }),
        title: tpl.title,
        fileName: `${tpl.title}.pdf`,
        category: tpl.tag
      });
    } catch (err) {
      console.error('PDF Preview error:', err);
      showNotification('حدث خطأ أثناء إعداد معاينة PDF', 'error');
    }
  };

  // Direct download as PDF matching the exact same form and details
  const handleDownloadPdf = async (templateItem?: AdminTemplateItem, customData?: Partial<SavedAdminDoc>) => {
    const tpl = templateItem || selectedTemplate;
    if (!tpl) return;

    const sender = customData?.sender || (templateItem ? templateItem.senderDefault : docSender) || tpl.senderDefault;
    const recipient = customData?.recipient || (templateItem ? templateItem.recipientDefault : docRecipient) || tpl.recipientDefault;
    const subject = customData?.subject || (templateItem ? templateItem.subjectDefault : docSubject) || tpl.subjectDefault;
    const content = customData?.content || (templateItem ? templateItem.contentDefault : docContent) || tpl.contentDefault;
    const notes = customData?.notes !== undefined ? customData.notes : (templateItem ? templateItem.notesDefault : docNotes);
    const date = customData?.date || (templateItem ? new Date().toISOString().split('T')[0] : docDate);
    const ref = customData?.reference || (templateItem ? '' : docRef);
    const rows = customData?.rows || (templateItem ? templateItem.defaultRows : docRows) || [];
    const signers = customData?.signers || (templateItem ? templateItem.signers : docSigners) || tpl.signers;
    const tableHeaders = tpl.tableHeaders || ['الرقم', 'البيان والتسمية', 'الكمية', 'الملاحظات'];

    try {
      await PDFService.generateAdministrativeDocumentPDF({
        title: tpl.title,
        reference: ref,
        category: tpl.tag,
        date: date,
        sender: sender,
        recipient: recipient,
        subject: subject,
        content: content,
        notes: notes,
        hasTable: Boolean(tpl.hasTable && rows.length > 0),
        tableHeaders: tableHeaders,
        tableRows: rows.map(r => [r.col1, r.col2, r.col3, r.col4]),
        signers: signers,
        schoolInfo: {
          country,
          ministry,
          directorate,
          school: schoolName,
          commune
        },
        fileName: `${tpl.title}.pdf`,
        save: true
      });
      showNotification(`تم تنزيل وثيقة "${tpl.title}" بصيغة PDF بنجاح!`, 'success');
    } catch (err) {
      console.error('PDF Download error:', err);
      showNotification('حدث خطأ أثناء تنزيل ملف PDF', 'error');
    }
  };

  // Download as Word Document (.doc) with the exact same form and details as PDF
  const handleDownloadWord = (templateItem?: AdminTemplateItem, customData?: Partial<SavedAdminDoc>) => {
    const tpl = templateItem || selectedTemplate;
    if (!tpl) return;

    const sender = customData?.sender || docSender || tpl.senderDefault;
    const recipient = customData?.recipient || docRecipient || tpl.recipientDefault;
    const subject = customData?.subject || docSubject || tpl.subjectDefault;
    const content = customData?.content || docContent || tpl.contentDefault;
    const notes = customData?.notes !== undefined ? customData.notes : (docNotes !== undefined ? docNotes : tpl.notesDefault);
    const date = customData?.date || docDate;
    const ref = customData?.reference || docRef;
    const rows = customData?.rows || docRows;
    const signers = customData?.signers || docSigners || tpl.signers;

    const tableHeaders = tpl.tableHeaders || ['الرقم', 'البيان والتسمية', 'الكمية', 'الملاحظات'];

    let tableHtml = '';
    if (tpl.hasTable && rows && rows.length > 0) {
      tableHtml = `
        <table class="items-table" style="width: 100%; border-collapse: collapse; margin-top: 16pt; margin-bottom: 16pt; border: 1.5pt solid #0f766e;" dir="rtl">
          <thead>
            <tr style="background-color: #0f766e; color: #ffffff;">
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 45pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${tableHeaders[0]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${tableHeaders[1]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 90pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${tableHeaders[2]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${tableHeaders[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-weight: bold; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${r.col1 || (i + 1)}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${r.col2 || '-'}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${r.col3 || '-'}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${r.col4 || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const signersHtml = `
      <table class="signatures-table" style="width: 100%; border-collapse: collapse; margin-top: 36pt; border: none;" dir="rtl">
        <tr>
          ${signers.map(sig => `
            <td style="width: ${Math.floor(100 / Math.max(signers.length, 1))}%; text-align: center; vertical-align: top; padding: 0 10pt; border: none;">
              <div style="border-top: 1.5pt dashed #64748b; padding-top: 8pt; font-weight: bold; font-size: 11.5pt; color: #1e293b; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                ${sig}
              </div>
              <div style="height: 55pt; padding-top: 18pt; color: #94a3b8; font-size: 9.5pt; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                (الاسم، التوقيع والختم الرسمي)
              </div>
            </td>
          `).join('')}
        </tr>
      </table>
    `;

    const wordDocumentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${tpl.title} - ${formattedSchool}</title>
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
          <p class="header-main">${country || 'الجمهورية الجزائرية الديمقراطية الشعبية'}</p>
          <p class="header-sub">${ministry || 'وزارة التربية الوطنية'}</p>

          <table class="meta-table" dir="rtl">
            <tr>
              <td style="text-align: right; vertical-align: top; font-weight: bold; font-size: 11.5pt; color: #1e293b;">
                <div>${directorate || 'مديرية التربية الوطنية'}</div>
                <div>${formattedSchool}</div>
              </td>
              <td style="text-align: left; vertical-align: top; font-weight: bold; font-size: 11pt; color: #334155;" dir="ltr">
                <div>التاريخ: ${date}</div>
                ${ref ? `<div>المرجع: ${ref}</div>` : ''}
              </td>
            </tr>
          </table>

          <table class="title-table" dir="rtl">
            <tr>
              <td>
                <h1>${tpl.title}</h1>
              </td>
            </tr>
          </table>

          <table class="correspondence-table" dir="rtl">
            <tr>
              <td>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>من:</strong> ${sender}</p>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>إلى:</strong> ${recipient}</p>
                <p style="margin: 0; color: #0f766e; font-weight: bold;"><strong>الموضوع:</strong> ${subject}</p>
              </td>
            </tr>
          </table>

          <div class="body-content">${content}</div>

          ${tableHtml}

          ${notes ? `
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>ملاحظة هامة:</strong> ${notes}</td>
              </tr>
            </table>
          ` : ''}

          ${signersHtml}

          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 28pt; border: none; border-top: 1pt solid #e2e8f0;">
            <tr>
              <td style="text-align: right; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية والتعليمية
              </td>
              <td style="text-align: left; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;" dir="ltr">
                ${date}
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordDocumentHtml], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFilename = (tpl.title || 'وثيقة_إدارية').replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeFilename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    showNotification(`تم تنزيل وثيقة "${tpl.title}" بصيغة Word (.doc) بنجاح بنفس تفاصيل وهيئة الـ PDF!`, 'success');
  };

  // Copy structured text to clipboard
  const handleCopyText = (template: AdminTemplateItem) => {
    const text = `
الجمهورية الجزائرية الديمقراطية الشعبية
وزارة التربية الوطنية
${directorate || 'مديرية التربية'} - ${formattedSchool}
التاريخ: ${new Date().toLocaleDateString('ar-DZ')}

${template.title}
---------------------------------------------
من: ${template.senderDefault}
إلى: ${template.recipientDefault}
الموضوع: ${template.subjectDefault}

${template.contentDefault}

${template.notesDefault ? `ملاحظة: ${template.notesDefault}` : ''}
الموقعون: ${template.signers.join(' - ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);
    showNotification('تم نسخ نص النموذج إلى الحافظة بنجاح!', 'success');
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesCategory = activeTab === 'all' || t.category === activeTab;
      const matchesSearch = 
        t.title.includes(searchQuery) || 
        t.subTitle.includes(searchQuery) || 
        t.subjectDefault.includes(searchQuery) ||
        t.tag.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6 pb-24 rtl font-sans" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold backdrop-blur-md ${
              notification.type === 'success' 
                ? 'bg-emerald-500/95 text-white border-emerald-400' 
                : notification.type === 'error'
                ? 'bg-error/95 text-white border-error/50'
                : 'bg-primary/95 text-white border-primary/50'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-container rounded-full text-secondary transition-colors"
              title="رجوع"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-inner">
              <ScrollText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-primary">
                  نماذج وثائق ومراسلات إدارية
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-500/30 flex items-center gap-1">
                  <BadgeCheck size={13} />
                  <span>معايير وزارة التربية الوطنية</span>
                </span>
              </div>
              <p className="text-secondary text-sm mt-0.5">
                مكتبة شاملة للوثائق المقننة: طلبات شراء وصيانة، تقارير حوادث، محاضر استلام وإتلاف، واستمارات تسيير المخابر.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Create Custom */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              handleOpenTemplate({
                id: `custom_${Date.now()}`,
                category: 'requests',
                title: 'وثيقة ومراسلة إدارية مخصصة',
                subTitle: 'نموذج فارغ قابل للتعديل والطباعة المباشرة',
                tag: 'وثيقة مخصصة',
                recipientDefault: 'السيد: مدير المؤسسة التربوية',
                senderDefault: 'مسؤول المخبر / أستاذ المادة',
                subjectDefault: 'الموضوع: ............................................',
                contentDefault: 'يشرفني أن أتقدم إلى سيادتكم المحترمة بهذه المراسلة قصد .................................................',
                hasTable: true,
                tableHeaders: ['الرقم', 'البيان', 'الكمية', 'ملاحظات'],
                defaultRows: [{ col1: '01', col2: '', col3: '', col4: '' }],
                signers: ['المحرر / مسؤول المخبر', 'المقتصد', 'مدير المؤسسة']
              });
            }}
            className="px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2 text-sm shadow-xs"
          >
            <Plus size={18} />
            <span>إنشاء وثيقة فارغة</span>
          </button>
        </div>
      </header>

      {/* Tabs and Search Bar */}
      <div className="bg-surface rounded-3xl p-4 border border-outline-variant/40 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <span>جميع النماذج</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">{TEMPLATES.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <span>الطلبات الإدارية</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {TEMPLATES.filter(t => t.category === 'requests').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <span>التقارير وحوادث المخبر</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {TEMPLATES.filter(t => t.category === 'reports').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('minutes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'minutes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <span>المحاضر الرسمية</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {TEMPLATES.filter(t => t.category === 'minutes').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'forms'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <span>الاستمارات وبطاقات التسيير</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {TEMPLATES.filter(t => t.category === 'forms').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-tertiary text-on-tertiary shadow-xs'
                : 'bg-surface-container hover:bg-surface-container-highest text-secondary'
            }`}
          >
            <FolderOpen size={14} />
            <span>وثائقي المحفوظة</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
              {savedDocs.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline" size={17} />
          <input
            type="text"
            placeholder="بحث في أسماء ومواضيع النماذج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high px-10 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-xs font-bold"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'saved' ? (
        // Saved Documents List
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-primary flex items-center gap-2">
              <FolderOpen className="text-tertiary" size={20} />
              <span>الأرشيف الشخصي للوثائق المحررة ({savedDocs.length})</span>
            </h3>
            <span className="text-xs text-secondary">
              تُحفظ الوثائق التي قمت بتعديلها محلياً وسحابياً لإعادة طباعتها أو مراجعتها أي وقت.
            </span>
          </div>

          {savedDocs.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-16 text-center border border-dashed border-outline-variant">
              <FileCheck2 size={48} className="mx-auto text-outline mb-3 opacity-40" />
              <h4 className="text-xl font-bold text-secondary mb-1">لا توجد وثائق محفوظة بعد</h4>
              <p className="text-xs text-secondary/80 max-w-sm mx-auto">
                اختر أي نموذج من الأقسام أعلاه، عدّل بياناته، ثم اضغط على زر "حفظ الوثيقة في أرشيفي" ليظهر هنا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenSavedDoc(doc)}
                  className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {doc.reference || 'وثيقة محررة'}
                      </span>
                      <span className="text-[11px] text-outline flex items-center gap-1 font-mono">
                        <Calendar size={12} />
                        {doc.date}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-primary group-hover:text-primary transition-colors">
                      {doc.title}
                    </h4>

                    <p className="text-xs text-secondary font-medium line-clamp-2">
                      {doc.subject || doc.content}
                    </p>

                    <div className="text-[11px] text-secondary/70 pt-1 border-t border-outline-variant/30 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">إلى: {doc.recipient}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSavedDoc(doc);
                        }}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Eye size={13} />
                        معاينة وتحرير
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const matchedTpl = TEMPLATES.find(t => t.id === doc.templateId) || {
                            id: doc.templateId,
                            category: doc.category as any,
                            title: doc.title,
                            subTitle: '',
                            tag: doc.category,
                            recipientDefault: doc.recipient,
                            senderDefault: doc.sender,
                            subjectDefault: doc.subject,
                            contentDefault: doc.content,
                            signers: doc.signers || ['مسير المخبر', 'المدير'],
                            hasTable: !!(doc.rows && doc.rows.length > 0)
                          };
                          handleDownloadWord(matchedTpl, doc);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        title="تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF"
                      >
                        <FileDown size={13} />
                        <span>Word</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const matchedTpl = TEMPLATES.find(t => t.id === doc.templateId) || {
                            id: doc.templateId,
                            category: doc.category as any,
                            title: doc.title,
                            subTitle: '',
                            tag: doc.category,
                            recipientDefault: doc.recipient,
                            senderDefault: doc.sender,
                            subjectDefault: doc.subject,
                            contentDefault: doc.content,
                            signers: doc.signers || ['مسير المخبر', 'المدير'],
                            hasTable: !!(doc.rows && doc.rows.length > 0)
                          };
                          handleDownloadPdf(matchedTpl, doc);
                        }}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline"
                        title="تحميل كملف PDF"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSavedDoc(doc.id, e)}
                      className="p-1.5 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="حذف من الأرشيف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Templates Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, idx) => {
            const isCopied = copiedId === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-surface rounded-3xl p-6 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                      template.category === 'requests'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : template.category === 'reports'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : template.category === 'minutes'
                        ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                        : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                    }`}>
                      {template.tag}
                    </span>

                    <button
                      onClick={() => handleCopyText(template)}
                      className="p-1.5 hover:bg-surface-container rounded-xl text-secondary hover:text-primary transition-colors text-xs flex items-center gap-1 font-bold"
                      title="نسخ نص النموذج"
                    >
                      {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="text-[10px]">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-primary group-hover:text-primary transition-colors leading-tight">
                    {template.title}
                  </h3>

                  <p className="text-xs text-secondary/80 leading-relaxed">
                    {template.subTitle}
                  </p>

                  <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-[11px] text-secondary space-y-1">
                    <div className="truncate">
                      <strong>المرسل إليه:</strong> {template.recipientDefault}
                    </div>
                    <div className="truncate">
                      <strong>الموضوع:</strong> {template.subjectDefault}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/40 flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleOpenTemplate(template)}
                    className="flex-1 min-w-[110px] py-2 bg-primary text-on-primary hover:opacity-95 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <FileText size={14} />
                    <span>تعديل وطباعة</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadWord(template);
                    }}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                    title="تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)"
                  >
                    <FileDown size={14} />
                    <span>Word</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPdf(template);
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                    title="تحميل كملف PDF رسمي (.pdf)"
                  >
                    <Download size={14} />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewPdf(template);
                    }}
                    className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl transition-colors"
                    title="معاينة PDF في المتصفح"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={() => {
                      handleOpenTemplate(template);
                      setTimeout(handlePrint, 300);
                    }}
                    className="p-2 bg-surface-container hover:bg-surface-container-highest text-primary rounded-xl transition-colors"
                    title="طباعة سريعة"
                  >
                    <Printer size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE DOCUMENT EDITOR & PREVIEW MODAL */}
      <AnimatePresence>
        {isEditorOpen && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-scrim/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant flex flex-col max-h-[94vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-surface-container-low border-b border-outline-variant/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-primary leading-tight">
                      {selectedTemplate.title}
                    </h3>
                    <p className="text-[11px] text-secondary">
                      قم بضبط الحقول، إضافة العناصر، ثم اضغط على طباعة رسمية أو معاينة PDF.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                    title="حفظ في أرشيفي"
                  >
                    <Save size={14} />
                    <span className="hidden sm:inline">حفظ بالأرشيف</span>
                  </button>

                  <button
                    onClick={() => handlePreviewPdf()}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    title="معاينة PDF داخلية"
                  >
                    <Eye size={14} />
                    <span className="hidden sm:inline">معاينة PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPdf()}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    title="تحميل كملف PDF"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">تحميل PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadWord()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    title="تحميل مستند Word بنفس تفاصيل وهيئة الـ PDF (.doc)"
                  >
                    <FileDown size={14} />
                    <span className="hidden sm:inline">تحميل Word</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-primary text-on-primary hover:opacity-90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Printer size={15} />
                    <span>طباعة</span>
                  </button>

                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 hover:bg-surface-container rounded-full text-secondary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body / Editor Fields */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* Official Letterhead Banner */}
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 text-center space-y-1">
                  <div className="text-xs font-black text-primary">
                    {country || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
                  </div>
                  <div className="text-[11px] text-secondary font-bold">
                    {ministry || 'وزارة التربية الوطنية'}
                  </div>
                  <div className="text-[11px] text-secondary font-medium">
                    {directorate || 'مديرية التربية الوطنية'} — {formattedSchool}
                  </div>
                </div>

                {/* Date & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-primary mb-1">
                      تاريخ تحرير الوثيقة
                    </label>
                    <input
                      type="date"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-primary mb-1">
                      الرقم المرجعي (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مخ/2026/14"
                      value={docRef}
                      onChange={(e) => setDocRef(e.target.value)}
                      className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Sender & Recipient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-primary mb-1">
                      المرسِل / المحرر
                    </label>
                    <input
                      type="text"
                      value={docSender}
                      onChange={(e) => setDocSender(e.target.value)}
                      className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-primary mb-1">
                      المرسَل إليه (الجهة المعنية)
                    </label>
                    <input
                      type="text"
                      value={docRecipient}
                      onChange={(e) => setDocRecipient(e.target.value)}
                      className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-black text-primary mb-1">
                    موضوع المراسلة أو التقرير
                  </label>
                  <input
                    type="text"
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
                    className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Main Content Body */}
                <div>
                  <label className="block text-xs font-black text-primary mb-1">
                    نص الوثيقة / العرض الإداري
                  </label>
                  <textarea
                    rows={5}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full bg-surface p-3 rounded-xl border border-outline-variant text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none leading-relaxed"
                  />
                </div>

                {/* Items Table if applicable */}
                {selectedTemplate.hasTable && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-primary">
                        جدول التعيينات والوسائل المرفقة ({docRows.length} عناصر)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus size={13} />
                        <span>إضافة سطر</span>
                      </button>
                    </div>

                    <div className="border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead className="bg-surface-container-high text-primary font-black">
                          <tr>
                            <th className="p-2.5 border-b border-outline-variant w-16 text-center">الرقم</th>
                            <th className="p-2.5 border-b border-outline-variant">البيان والتسمية</th>
                            <th className="p-2.5 border-b border-outline-variant w-32">الكمية</th>
                            <th className="p-2.5 border-b border-outline-variant">ملاحظات / مواصفة</th>
                            <th className="p-2.5 border-b border-outline-variant w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40 bg-surface">
                          {docRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-surface-container-low/50">
                              <td className="p-2 text-center">
                                <input
                                  type="text"
                                  value={row.col1}
                                  onChange={(e) => handleUpdateRow(rIdx, 'col1', e.target.value)}
                                  className="w-full text-center bg-transparent border-0 font-bold focus:ring-0 outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="اسم العتاد أو المادة..."
                                  value={row.col2}
                                  onChange={(e) => handleUpdateRow(rIdx, 'col2', e.target.value)}
                                  className="w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="مثال: 05 قطع"
                                  value={row.col3}
                                  onChange={(e) => handleUpdateRow(rIdx, 'col3', e.target.value)}
                                  className="w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="المواصفات..."
                                  value={row.col4}
                                  onChange={(e) => handleUpdateRow(rIdx, 'col4', e.target.value)}
                                  className="w-full bg-transparent border-0 focus:ring-0 outline-none"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(rIdx)}
                                  className="p-1 text-error/60 hover:text-error rounded-lg"
                                  title="حذف السطر"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Notes box */}
                <div>
                  <label className="block text-xs font-black text-primary mb-1">
                    ملاحظات أو توصيات إضافية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="ملاحظات تظهر أسفل الوثيقة..."
                    className="w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Signers list */}
                <div>
                  <label className="block text-xs font-black text-primary mb-2">
                    الموقعون والمصادقون على الوثيقة
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {docSigners.map((sig, sIdx) => (
                      <div key={sIdx} className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40 flex items-center gap-2">
                        <UserCheck size={16} className="text-primary shrink-0" />
                        <input
                          type="text"
                          value={sig}
                          onChange={(e) => {
                            const newSigs = [...docSigners];
                            newSigs[sIdx] = e.target.value;
                            setDocSigners(newSigs);
                          }}
                          className="bg-transparent border-0 text-xs font-bold focus:ring-0 outline-none w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant/50 flex items-center justify-between shrink-0">
                <span className="text-xs text-secondary font-medium">
                  جاهزة للطباعة بحجم A4 قياسي وفق مواصفات مراسلات وزارة التربية الوطنية.
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 bg-surface hover:bg-surface-container text-secondary rounded-xl text-xs font-bold border border-outline-variant/60 transition-colors"
                  >
                    إغلاق
                  </button>

                  <button
                    onClick={() => handleDownloadPdf()}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    title="تحميل كملف PDF"
                  >
                    <Download size={15} />
                    <span>تحميل PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadWord()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    title="تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF"
                  >
                    <FileDown size={15} />
                    <span>تحميل ملف Word (.doc)</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-primary text-on-primary hover:opacity-95 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Printer size={15} />
                    <span>طباعة الوثيقة الآن</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
