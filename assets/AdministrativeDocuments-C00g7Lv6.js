import{h as Le,r as n,j as e}from"./vendor-react-V-qA7iMV.js";import{u as Ue,e as Ve,f as Je,d as oe,A as ye,m as ie,P as Ze,i as je}from"./index-DS0vroEa.js";import{A as Ke,k as ve,K as Ye,z as Qe,M as Xe,h as Ge,P as Ie,N as et}from"./vendor-firebase-DVX7uQCg.js";import{aw as tt,A as st,bz as rt,bA as lt,aA as we,bB as Ne,g as nt,bC as ot,at as it,b as ae,ae as V,af as J,t as ke,d as at,e as ct,i as De,v as ce,aO as dt,X as xt,bD as ft}from"./vendor-icons-bvNvyNGO.js";import"./vendor-pdf-xlsx-DFxlBnSh.js";import"./vendor-charts-Cu9m5RRG.js";const p=[{id:"req-equipment-purchase",category:"requests",title:"طلب اقتناء عتاد ومواد مخبرية جديدة",subTitle:"نموذج موجه للمدير والمقتصد لطلب وسائل تعليمية ومحاليل كيميائية",tag:"طلب اقتناء",recipientDefault:"السيد: مدير المؤسسة التربوية (عن طريق السيد المقتصد)",senderDefault:"الأستاذ المسؤول عن مادة العلوم الفيزيائية / مسير المخبر",subjectDefault:"طلب تزويد المخبر بالعتاد والمواد الكيميائية الضرورية للموسم الدراسي",contentDefault:"يشرفني أن أتقدم إلى سيادتكم المحترمة بهذا الطلب قصد التكرم بالموافقة على تزويد المخبر بالعتاد والوسائل التعليمية والمواد الكيميائية المبينة في الجدول أسفله، وذلك قصد تمكين الأساتذة والتلاميذ من إنجاز الأعمال التطبيقية والتجارب المقررة في المناهج الرسمية في أحسن الظروف ووفق المعايير البيداغوجية المعتمدة.",notesDefault:"ملاحظة: تم ترتيب المواد حسب درجة الأولوية والاستعجال لإنجاز البرامج البيداغوجية المقررة.",hasTable:!0,tableHeaders:["الرقم","اسم الوسيلة أو المحلول","الكمية المطلوبة","المواصفات / الملاحظات"],defaultRows:[{col1:"01",col2:"مخبار مدرج سعة 100 مل زجاجي",col3:"10 قطع",col4:"فئة A مقاوم للحرارة"},{col1:"02",col2:"محلول حمض كلور الماء 1M",col3:"02 لتر",col4:"نقي للاستعمال المخبري"},{col1:"03",col2:"أنابيب اختبار زجاجية قياس 16*160",col3:"50 أنبوب",col4:"مع حوامل خشبية"},{col1:"04",col2:"ميزان إلكتروني حساس دقة 0.01g",col3:"02 جهاز",col4:"مع محول كهربائي"}],signers:["الأستاذ / مسير المخبر","المصالح المالية والمادية (المقتصد)","تأشيرة وموافقة السيد المدير"]},{id:"req-maintenance-repair",category:"requests",title:"طلب صيانة وإصلاح أجهزة علمية مخبرية",subTitle:"طلب تدخل فني لإصلاح الميكروسكوبات والموازين والمولدات",tag:"صيانة وإصلاح",recipientDefault:"السيد: مدير المؤسسة التربوية (مصلحة الصيانة والوسائل)",senderDefault:"المسؤول عن تسيير مخابر العلوم الطبيعية والفيزيائية",subjectDefault:"طلب صيانة وإصلاح عتاد مخبري متعطل",contentDefault:"نحيط سيادتكم علماً بتسجيل بعض الأعطاب التقنية في التجهيزات المخبرية الموضحة أدناه، والتي توقفت عن العمل نتيجة الاستعمال الدوري أو أعطاب كهربائية وميكانيكية، مما يعيق السير الحسن للأعمال المخبرية، وعليه نلتمس منكم التنسيق لإجراء الصيانة اللازمة أو الاتصال بمصالح الصيانة المختصة لإعادة تشغيلها.",notesDefault:"الأجهزة حالياً موضوعة في جناح العزل تفادياً لأي تفاقم للأعطاب أو أخطار كهربائية.",hasTable:!0,tableHeaders:["الرقم","اسم الجهاز ورقمه التسلسلي","طبيعة العطب الملاحظ","القرار المقترح"],defaultRows:[{col1:"01",col2:"مجهر ضوئي ثنائي العدسة N°04",col3:"عطل في نظام الإضاءة والمكثف",col4:"استبدال مصباح LED وفحص الدارة"},{col1:"02",col2:"مولد تيار مستمر ومتناوب 0-12V",col3:"انقطاع المنصهرة وحرق بالمقاومة",col4:"صيانة كهربائية داخلية"},{col1:"03",col2:"ميزان رقمي دقيق N°02",col3:"عدم استقرار القراءة والصفير",col4:"معايرة الحساس الداخلي"}],signers:["مسير المخبر","المقتصد","السيد المدير"]},{id:"req-safety-equipment",category:"requests",title:"طلب تزويد المخبر بوسائل الوقاية ومكافحة الحرائق",subTitle:"تأمين مطافئ الحريق، حقائب الإسعافات، النظارات الواقية والقفازات",tag:"أمن وسلامة",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"مسؤول الأمن المخبري وأساتذة المواد التجريبية",subjectDefault:"طلب توفير وتجديد وسائل السلامة والوقاية المخبرية",contentDefault:"حرصاً على سلامة أبنائنا التلاميذ والطاقم التربوي والتقني العامل بالمخابر، وامتثالاً للتعليمات الوزارية المنظمة للأمن المخبري، نلتمس من سيادتكم التكرم بتزويد المخبر بوسائل الوقاية الفردية والجماعية وتجديد منتهية الصلاحية منها وفق ما هو مبين أدناه.",notesDefault:"تعتبر هذه الوسائل إلزامية قانوناً قبل الشروع في أي تجارب كيميائية محفوفة بالمخاطر.",hasTable:!0,tableHeaders:["الرقم","وسيلة السلامة المطلوبة","الكمية","الملاحظات ومكان التثبيت"],defaultRows:[{col1:"01",col2:"مطافئ حريق غاز CO2 سعة 5 كغ",col3:"02 مطفأة",col4:"لحرائق المواد الكيميائية والأجهزة"},{col1:"02",col2:"حقيبة إسعافات أولية مع محاليل غسيل العيون",col3:"01 حقيبة",col4:"تثبيت جداري بجانب الباب"},{col1:"03",col2:"نظارات واقية مقاومة للرذاذ",col3:"20 نظارة",col4:"لحماية أعين التلاميذ"},{col1:"04",col2:"قفازات نيتريل مقاس M و L",col3:"04 علب",col4:"للتعامل مع الأحماض والمذيبات"}],signers:["مسؤول السلامة المخبرية","المقتصد","مدير المؤسسة"]},{id:"req-excursion-approval",category:"requests",title:"طلب ترخيص بتنظيم خرجة علمية استكشافية ميدانية",subTitle:"طلب موافقة على نشاط بيئي أو زيارة مركز علمي / محطة مياه",tag:"أنشطة علمية",recipientDefault:"السيد: مدير المؤسسة التربوية (لإحالتها لمديرية التربية)",senderDefault:"أستاذ مادة علوم الطبيعة والحياة / العلوم الفيزيائية",subjectDefault:"طلب ترخيص لتنظيم خرجة علمية ميدانية لفائدة تلاميذ القسم",contentDefault:"في إطار إثراء المعارف البيداغوجية وربط المفاهيم النظرية بالتطبيقات الميدانية والبيئية وفق المنهاج الوزاري، يشرفني أن أطلب من سيادتكم التكرم بالترخيص لنا بتنظيم خرجة علمية لفائدة تلاميذ الأقسام المذكورة، مع التعهد التام بتأطيرهم والالتزام الصارم بشروط السلامة والانضباط.",notesDefault:"مرفق: قائمة التلاميذ المشاركين، ترخيصات الأولياء الموقعة، وبرنامج الزيارة الزمني.",hasTable:!0,tableHeaders:["الوجهة المقصودة","تاريخ وتوقيت الزيارة","المستوى الدراسي المعني","الأساتذة والمؤطرون المرافقون"],defaultRows:[{col1:"محطة معالجة المياه / الحديقة النباتية",col2:"يوم الخميس من 08:30 إلى 12:00",col3:"السنة الثانية ثانوي علوم تجريبية",col4:"أستاذ العلوم الطبيعية + ملحق المخبر"}],signers:["الأستاذ المنظم","مستشار التربية","موافقة وختم مدير المؤسسة"]},{id:"req-afterhours-lab",category:"requests",title:"طلب ترخيص باستغلال المخبر خارج الساعات النظامية",subTitle:"أنشطة النوادي العلمية، التحضير للمسابقات، أو التجارب الاستدراكية",tag:"أنشطة لاصفية",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"منشط النادي العلمي / أستاذ المادة",subjectDefault:"طلب استغلال فضاء المخبر خارج الساعات الرسمية",contentDefault:"قصد تمكين أعضاء النادي العلمي والتلاميذ المهتمين بالابتكارات العلمية من استكمال مشاريعهم وتجاربهم في أحسن الظروف، نلتمس من سيادتكم الموافقة على فتح المخبر العلمي واستغلال تجهيزاته في الفترات المحددة، مع التزامنا الكامل بالحفاظ على العتاد وتأمين النظافة والسلامة بعد انتهاء النشاط.",hasTable:!0,tableHeaders:["اليوم","الفترة الزمنية","طبيعة النشاط أو التجربة","عدد التلاميذ المشرف عليهم"],defaultRows:[{col1:"مساء الثلاثاء",col2:"من 14:30 إلى 16:30",col3:"تجارب تحضير الروبوت ومعايرة المحاليل",col4:"12 تلميذاً مع أستاذ مؤطر"}],signers:["الأستاذ المؤطر","مسير المخبر","مدير المؤسسة"]},{id:"req-leave-absence",category:"requests",title:"طلب عطلة استثنائية أو غياب مبرر لموظف المخبر",subTitle:"طلب غياب رسمي للملحق بالمخبر أو التقني وفق التشريع المدرسي",tag:"شؤون الموظفين",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"الاسم واللقب: ..................... / الرتبة: ملحق بالمخبر",subjectDefault:"طلب الاستفادة من عطلة استثنائية / غياب مرخص",contentDefault:"بمقتضى الأمر 06-03 المتضمن القانون الأساسي العام للوظيفة العمومية، وبناءً على المبررات القانونية المرفقة، يشرفني أن ألتمس من سيادتكم منحي رخصة غياب / عطلة استثنائية مدفوعة الأجر للأسباب والأيام الموضحة في هذا الطلب، مع تأكيد تسليم مفاتيح ومهام تسيير المخبر للزميل المناوب لضمان استمرارية المرفق العام.",notesDefault:"مرفق: الوثائق والشهادات المبررة للغياب.",hasTable:!1,signers:["الموظف المعني","المقتصد (للتأشير)","قرار مدير المؤسسة (مقبول / مرفوض)"]},{id:"rep-lab-accident",category:"reports",title:"تقرير عن حادث مخبري أو تلوث كيميائي أو كسر خطير",subTitle:"توثيق رسمي مفصل لحوادث الانسكاب، التفاعلات العنيفة، أو إصابات التلاميذ",tag:"تقرير حادث",recipientDefault:"السيد: مدير المؤسسة التربوية (نسخة لمفتش المادة وطبيب الصحة المدرسية)",senderDefault:"أستاذ المادة المؤطر / المشرف على الحصة المخبرية",subjectDefault:"تقرير إخباري مفصل بخصوص حادث عرضي وقع بالمخبر",contentDefault:"نعلم سيادتكم أنه بتاريخ اليوم المذكور أدناه، وخلال إجراء الحصة التطبيقية المقررة لمستوى القسم المعني، وقع حادث عرضي في فضاء المخبر. تم على الفور تطبيق بروتوكول الطوارئ وعزل المنطقة وتقديم الإسعافات الأولية ونقل المصاب إن وُجد إلى قاعة التمريض، ونوافيكم بحيثيات الحادث والأسباب المباشرة والتدابير المتخذة.",notesDefault:"تم تأمين موقع الحادث وإيقاف كافة التفاعلات ومراجعة إجراءات السلامة.",hasTable:!0,tableHeaders:["تاريخ وتوقيت الحادث","مكان الحادث بالمخبر","الأضرار المادية أو الجسدية","الإجراءات الاستعجالية المتخذة"],defaultRows:[{col1:"2026/10/04 - 10:15 صباحاً",col2:"طاولة التجريب رقم 03",col3:"انكسار أنبوب وتسرب طفيف لمحلول حمضي مخفف دون إصابات بشرية",col4:"معادلة الحمض ببيكربونات الصوديوم وتهوية القاعة فوراً"}],signers:["أستاذ الحصة الشاهد","مسير المخبر","طبيب / ممرض الصحة المدرسية","مدير المؤسسة"]},{id:"rep-trimester-status",category:"reports",title:"تقرير دوري ثلاثي عن الوضعية العامة للمخبر",subTitle:"حصيلة شاملة عن جاهزية الأجهزة، الاستهلاك، ونسبة إنجاز التجارب",tag:"تقرير دوري",recipientDefault:"السيد: مدير المؤسسة التربوية والمفتش البيداغوجي للمادة",senderDefault:"مسؤول التنسيق المخبري وأساتذة المواد العلمية",subjectDefault:"التقرير الدوري لتقييم نشاط المخابر خلال الثلاثي الدراسي",contentDefault:"يسرنا أن نرفع إلى كريم علمكم التقرير الدوري المفصل حول الوضعية العامة للمخابر العلمية خلال هذا الثلاثي، والذي يبرز نسبة إنجاز التجارب البيداغوجية، حجم استهلاك المواد الكيميائية والزجاجيات، حالة الأجهزة العلمية ونقائص الصيانة المسجلة، بهدف اتخاذ التدابير التصحيحية اللازمة.",notesDefault:"بلغت النسبة الإجمالية لإنجاز الأعمال المخبرية المقررة في المنهاج 92% بفضل تضافر جهود الطاقم.",hasTable:!0,tableHeaders:["المؤشر البيداغوجي","العدد / النسبة","الملاحظات والتقييم","الاحتياج المسجل"],defaultRows:[{col1:"عدد الحصص المخبرية المنجزة",col2:"48 حصة مخبرية",col3:"تغطية منتظمة لكافة الأفواج",col4:"لا يوجد"},{col1:"نسبة توفر المواد الكيميائية",col2:"85%",col3:"نقص في كواشف الكيمياء الحيوية",col4:"طلب شراء تكميلي"},{col1:"حالة الأجهزة والميكروسكوبات",col2:"24 جهاز صالح / 3 أعطاب",col3:"تم عزل الأجهزة المعطلة",col4:"طلب صيانة دورية"}],signers:["منسق المادة والمخبر","المقتصد","مدير المؤسسة"]},{id:"rep-defective-equipment",category:"reports",title:"تقرير فني عن أجهزة وتجهيزات غير قابلة للإصلاح",subTitle:"معاينة هندسية وتقنية للأجهزة المستهلكة تمهيداً لإسقاطها من السجل",tag:"تقرير معاينة فنية",recipientDefault:"السيد: مدير المؤسسة التربوية (لجنة الجرد والإسقاط)",senderDefault:"لجنة المعاينة التقنية للمخابر والتجهيزات العلمية",subjectDefault:"تقرير فني ومعاينة عتاد علمي غير قابل للإصلاح (عتاد هالك)",contentDefault:"بناءً على المعاينة الميدانية الدقيقة التي قامت بها اللجنة التقنية المختصة بالمؤسسة للأجهزة والوسائل المدرجة في الجدول، وبعد فحصها ومحاولة صيانتها محلياً، تبين أنها أصيبت بأعطاب جسيمة وتآكل متقدم يستحيل معه إصلاحها اقتصادياً أو تقنياً، وعليه نقترح إخراجها من الخدمة تمهيداً لإسقاطها وتبرئة ذمة المخبر.",hasTable:!0,tableHeaders:["اسم العتاد والماركة","الرقم التسلسلي / الجرد","تاريخ الشراء / الدخول","السبب الفني لعدم الصلاحية"],defaultRows:[{col1:"مجهر بصري روسي الصنع",col2:"جرد: 142/08",col3:"2008",col4:"كسر داخلي بالمنشور البصري وتلف ميكانيكي بحامل العدسات"},{col1:"جهاز راسم الاهتزاز المهبطي أنالوج",col2:"جرد: 88/11",col3:"2011",col4:"حرق بالمحول عالي التوتر وانعدام قطع الغيار الأصلية"},{col1:"مضخة تفريغ الهواء يدوية",col2:"جرد: 205/14",col3:"2014",col4:"تلف الأسطوانة والمانومتر وتسرب مستمر"}],signers:["تقني / مسير المخبر","أستاذ المادة ذو الخبرة","المقتصد","مدير المؤسسة"]},{id:"rep-expired-chemicals",category:"reports",title:"تقرير عن الكواشف والمواد الكيميائية منتهية الصلاحية",subTitle:"حصر المواد المتدهورة أو الخطرة تمهيداً لمعالجتها وتحييدها بأمان",tag:"مواد منتهية",recipientDefault:"السيد: مدير المؤسسة ومصلحة الوقاية والأمن بمديرية التربية",senderDefault:"المسؤول عن تسيير مخزن المواد الكيميائية والمخبر",subjectDefault:"تقرير حصر المواد الكيميائية منتهية الصلاحية وخطورة التخزين",contentDefault:"نعلمكم بأن عملية المراقبة الدورية لتواريخ نهاية صلاحية الكواشف المخبرية أسفرت عن حصر مجموعة من المواد الكيميائية التي فقدت فعاليتها أو طرأ عليها تغير في خواصها الفيزيائية، وتعتبر استمراريتها في المخزن مصدراً محتملاً للخطر، ولذا نقترح اتخاذ الإجراءات البيئية السليمة لتحييدها وإتلافها بالتنسيق مع الجهات الوصية.",hasTable:!0,tableHeaders:["اسم المادة الكيميائية والصيغة","الحالة والتركيز","الكمية المحصورة","طبيعة الخطر وتاريخ الانتهاء"],defaultRows:[{col1:"نترات الفضة AgNO3",col2:"بلورات متكتلة متأكسدة",col3:"100 غرام",col4:"مؤكسد قوي - منتهية منذ 2021"},{col1:"برمنغنات البوتاسيوم KMnO4",col2:"محلول مائي 0.1M",col3:"500 مل",col4:"تفكك وتحول للون البني - منتهية 2022"},{col1:"حمض النيتريك HNO3",col2:"سائل مركز 65%",col3:"01 لتر",col4:"تآكل الغطاء وتصاعد أبخرة - غير آمن"}],signers:["مسير مخزن الكيماويات","أستاذ الفيزياء والكيمياء","المقتصد","مدير المؤسسة"]},{id:"min-equipment-reception",category:"minutes",title:"محضر استلام ومطابقة تجهيزات ومواد مخبرية جديدة",subTitle:"محضر استلام قانوني لمطابقة طلبيات التموين والمناقصات وسندات التسليم",tag:"محضر استلام",recipientDefault:"ملف المقتصدية والمخزن المركزي للمؤسسة التربوية",senderDefault:"لجنة استلام وتفتيش المواد والتجهيزات البيداغوجية بالمؤسسة",subjectDefault:"محضر استلام ومطابقة العتاد المخبري موضوع سند التسليم",contentDefault:"في يومه وتاريخه، اجتمعت اللجنة المكلفة باستلام التجهيزات والمواد المخبرية بمقر المخبر، بحضور أعضائها المذكورين، وقامت بفحص وتجريب ومعاينة الوسائل المسلمة من طرف المورد المعتمد، ومطابقتها مع المواصفات التقنية الواردة في سند الطلب، وقد خلصت اللجنة إلى النتائج الموضحة في هذا المحضر.",notesDefault:"قرار اللجنة: تم قبول الاستلام المؤقت بعد التحقق من سلامة الأجهزة والمطابقة الكاملة للشروط.",hasTable:!0,tableHeaders:["الرقم","تعيين المادة أو العتاد","الكمية المسلمة","المطابقة التقنية والقرار"],defaultRows:[{col1:"01",col2:"حقائب تجارب الكهرباء والمغناطيسية",col3:"04 حقائب",col4:"مطابقة وسليمة بنسبة 100%"},{col1:"02",col2:"ميكروسكوبات بصرية مع عدسات زيتية",col3:"06 أجهزة",col4:"مطابقة وتم تجريب الإضاءة وتكبيرها"},{col1:"03",col2:"كواشف كيميائية نقية للتحليل",col3:"12 عبوة زجاجية",col4:"مطابقة للمواصفات وبطاقات السلامة"}],signers:["المورد / مندوب التسليم","أستاذ المادة الخبير","المقتصد (مسؤول المالية والمادية)","رئيس اللجنة / مدير المؤسسة"]},{id:"min-equipment-scrapping",category:"minutes",title:"محضر إسقاط وتخريد عتاد مخبري هالك أو متلاشٍ",subTitle:"محضر الشطب النهائي من سجل الجرد بعد موافقة مجلس التوجيه والتسيير",tag:"محضر إسقاط",recipientDefault:"مديرية التربية (مصلحة المالية والوسائل) وأرشيف المؤسسة",senderDefault:"لجنة الجرد والإسقاط بالمؤسسة التربوية",subjectDefault:"محضر اجتماع لجنة إسقاط العتاد والوسائل المخبرية غير الصالحة",contentDefault:"تنفيذاً للتعليمات الوزارية الخاصة بتسيير سجلات الجرد وإسقاط العتاد المستهلك، اجتمعت اللجنة المشكلة بالقرار الداخلي، وقامت بالمعاينة النهائية للأصناف المقترحة للإسقاط والتي استوفت الإجراءات التقنية والمالية، وقررت شطبها نهائياً من سجلات الجرد العام للمؤسسة لعدم جدواها وتآكلها التام.",hasTable:!0,tableHeaders:["رقم الجرد","بيان الصنف والعتاد","سنة التخصيص","القيمة المقدرة","القرار النهائي"],defaultRows:[{col1:"042/PHY",col2:"راسم اهتزاز مهبطي قديم",col3:"2005",col4:"00.00 دج (هالك)",col5:"شطب وتحويل لمستودع الخردة"},{col1:"115/BIO",col2:"مجموعة زجاجيات متصدعة ومشروخة",col3:"2012",col4:"00.00 دج (متلاشٍ)",col5:"إتلاف تام"}],signers:["مسير المخبر","المقتصد","أستاذ ممثل عن المادة","رئيس المؤسسة"]},{id:"min-breakage-loss",category:"minutes",title:"محضر ضياع أو إتلاف عتاد مخبري من طرف التلاميذ",subTitle:"تسجيل التلفيات والحوادث أثناء الحصص العملية وتحديد المسؤوليات والتعويض",tag:"محضر كسر",recipientDefault:"السيد: مدير المؤسسة والسيد المقتصد",senderDefault:"أستاذ المادة المشرف على الفوج المخبري",subjectDefault:"محضر إثبات كسر أو ضياع أدوات مخبرية أثناء حصة تطبيقية",contentDefault:"نحيطكم علماً بأنه في التاريخ والساعة المبينة، وأثناء إنجاز حصة الأعمال التطبيقية المقررة للفوج المعني، وقع كسر / ضياع للأدوات المخبرية الموضحة في هذا المحضر نتيجة خطأ في المناولة أو سقوط غير مقصود، وقد تم اتخاذ الإجراءات التأمينية وإلزام المتسبب بالإجراءات المنصوص عليها في النظام الداخلي للمخبر.",hasTable:!0,tableHeaders:["اسم التلميذ(ة) المعني","القسم والفوج","الأداة المكسورة / الضائعة","طبيعة الحادث وحكم التعويض"],defaultRows:[{col1:"اسم التلميذ هنا",col2:"2 ع ت 1 - فوج أ",col3:"مخبار مدرج زجاجي 250 مل",col4:"سقوط عرضي - تعويض عيني بالمطابقة"}],signers:["التلميذ(ة) المعني","أستاذ الحصة","مسير المخبر","المقتصد"]},{id:"min-coordination-meeting",category:"minutes",title:"محضر جلسة تنسيقية لأساتذة المادة ومسؤول المخبر",subTitle:"تنسيق رزنامة التجارب، توزيع القاعات، ومتابعة الاحتياجات الدورية",tag:"جلسة تنسيقية",recipientDefault:"السيد: مدير المؤسسة ومفتش المادة البيداغوجي",senderDefault:"منسق المادة وأساتذة العلوم بالمؤسسة",subjectDefault:"محضر اجتماع التنسيق البيداغوجي والتسيير المخبري",contentDefault:"في إطار التنسيق البيداغوجي الدوري، انعقدت بمقر المخبر الجلسة التنسيقية المشتركة برئاسة منسق المادة وبحضور السادة الأساتذة ومسؤولي المخابر، حيث تم تداول جدول الأعمال المتعلق برزنامة التجارب للفصل، ضبط جداول استعمال المخابر، مراجعة اشتراطات الأمان، وتحديد الاحتياجات الضرورية.",notesDefault:"خرج المجتمعون بالتوصيات التالية: الالتزام الصارم بارتداء المئزر والنظارات، وتأكيد حجز الحصص قبل 48 ساعة.",hasTable:!0,tableHeaders:["نقطة جدول الأعمال","المناقشات والآراء المطروحة","القرار والاتفاق المتخذ","المسؤول عن التنفيذ"],defaultRows:[{col1:"رزنامة الأعمال التطبيقية",col2:"تنسيق التوقيت وتفادي التداخل بين الأساتذة",col3:"اعتماد الرزنامة الأسبوعية الموحدة",col4:"مسير المخبر والأساتذة"},{col1:"تدابير السلامة والنفايات",col2:"عزل المحاليل الخطرة وعدم سكبها في المجاري",col3:"توفير عبوات خاصة لجمع النفايات",col4:"الجميع"}],signers:["أساتذة المادة الحاضرون","مسير المخبر","منسق المادة","تأشيرة مدير المؤسسة"]},{id:"form-equipment-loan",category:"forms",title:"استمارة إعارة واسترجاع عتاد مخبري لأستاذ المادة",subTitle:"سند إعارة رسمي لضبط خروج واسترجاع التجهيزات والمجسمات البيداغوجية",tag:"استمارة إعارة",recipientDefault:"أرشيف تسيير المخبر وسجل الإعارات",senderDefault:"الأستاذ المستعير: ...................... / مادة التدريس: ......................",subjectDefault:"استمارة تسليم واسترجاع وسائل تعليمية مخبرية",contentDefault:"أقر أنا الموقع أدناه، الأستاذ(ة) المذكور، بأنني استلمت من مسير المخبر التجهيزات والوسائل التعليمية المبينة بالجدول في حالة جيدة وسليمة وصالحة للاستعمال، وأتعهد باستغلالها في الإطار البيداغوجي المخصص لها، وإعادتها فور انتهاء الحصة المقررة بحالتها الأصلية.",hasTable:!0,tableHeaders:["اسم العتاد والوسيلة","الرقم التسلسلي / الكود","تاريخ الاستلام وساعة الخروج","تاريخ وساعة الإرجاع وحالة العتاد"],defaultRows:[{col1:"مجسم الجهاز الهضمي للإنسان",col2:"BIO-MOD-08",col3:"2026/10/04 - 08:30",col4:"2026/10/04 - 10:30 (سليم)"},{col1:"صندوق عدسات ومرايا بصرية",col2:"OPT-BOX-02",col3:"2026/10/04 - 10:30",col4:"قيد الاستعمال"}],signers:["الأستاذ المستعير","مسير المخبر (عند التسليم)","مسير المخبر (عند الاسترجاع)"]},{id:"form-tech-equipment-sheet",category:"forms",title:"بطاقة فنية وتعريفية لجهاز مخبري نوعي",subTitle:"بطاقة هوية شاملة للجهاز: بلد الصنع، الخصائص الكهربائية، ومحاذير الاستعمال",tag:"بطاقة فنية للجهاز",recipientDefault:"تثبت على غلاف الجهاز أو تحفظ في ملف الأجهزة النوعية",senderDefault:"المسؤول عن التوثيق التقني للمخابر",subjectDefault:"بطاقة الهوية الفنية والمواصفات لجهاز مخبري",contentDefault:"تعتبر هذه البطاقة وثيقة تعريفية مرجعية للجهاز العلمي، تتضمن معلومات الصنع، الخصائص التشغيلية الكهربائية والميكانيكية، إجراءات الصيانة الوقائية، وقواعد السلامة الإلزامية قبل وأثناء التشغيل لضمان استدامته وحمايته من التلف.",hasTable:!0,tableHeaders:["البيان الفني","المعلومة المرجعية","حدود التشغيل الآمن","إجراء الصيانة الدوري"],defaultRows:[{col1:"اسم الجهاز التجاري والماركة",col2:"مسبار قياس الأس الهيدروجيني pH-mètre",col3:"درجة حرارة 10-40°C",col4:"حفظ الإلكترود في محلول KCl 3M"},{col1:"التغذية الكهربائية",col2:"بطارية 9V أو محول 220V/50Hz",col3:"استقرار التوتر",col4:"فصل المحول بعد انتهاء العمل"},{col1:"نطاق القياس والدقة",col2:"0.00 إلى 14.00 pH بمعدل خطأ ±0.01",col3:"معايرة بمحلولين عياريين pH 4 و pH 7",col4:"غسيل بالماء المقطر بعد كل قياس"}],signers:["معد البطاقة (تقني المخبر)","أستاذ المادة","المقتصد"]},{id:"form-sensitive-chemicals-log",category:"forms",title:"سجل تتبع استهلاك المواد الكيميائية الحساسة والخاضعة للرقابة",subTitle:"متابعة دقيقة بالمليغرام للمواد السامة أو المؤكسدة الشديدة أو القابلة للاشتعال",tag:"متابعة الكيماويات",recipientDefault:"سجل الرقابة المخبرية الدائم بالمؤسسة",senderDefault:"المسؤول الحصري عن خزينة المواد الكيميائية",subjectDefault:"استمارة ضبط واستهلاك مادة كيميائية خاضعة للتتبع الدقيق",contentDefault:"تطبيقاً للبروتوكول الوزاري الخاص بتداول وحفظ المواد الكيميائية الخطرة أو الحساسة، تُسجل في هذه الاستمارة كل حركة خروج واستعمال للمادة المحددة، متضمنة هوية الأستاذ المستلم، الغرض البيداغوجي، الكمية المستهلكة بالتدقيق، والرصيد المتبقي في الخزانة المؤمنة.",hasTable:!0,tableHeaders:["تاريخ السحب","اسم الأستاذ المستلم","التجربة المستهدفة","الكمية المسحوبة","الرصيد المتبقي بالخزانة"],defaultRows:[{col1:"2026/10/02",col2:"أ. فلان (فيزياء)",col3:"معايرة حمض وأساس (2 ثانوي)",col4:"50 مل محلول هيدروكسيد الصوديوم 1M",col5:"950 مل"},{col1:"2026/10/04",col2:"أ. علان (علوم)",col3:"الكشف عن السكريات المرجعة",col4:"20 مل كاشف فهلنج A+B",col5:"480 مل"}],signers:["الأستاذ المستلم","المسؤول عن خزانة المواد الكيميائية","تأشيرة مدير المؤسسة"]}];function jt(){const Te=Le(),{schoolName:Z,directorate:j,commune:K}=Ue(),O="الجمهورية الجزائرية الديمقراطية الشعبية",q="وزارة التربية الوطنية",{openPdfPreview:$e}=Ve(),[d,v]=n.useState("all"),[w,Se]=n.useState(""),[o,de]=n.useState(null),[ze,M]=n.useState(!1),[Ae,xe]=n.useState(null),[W,fe]=n.useState(null),[N,Y]=n.useState([]),[pt,pe]=n.useState(!1),[k,Q]=n.useState(new Date().toISOString().split("T")[0]),[h,X]=n.useState(""),[D,G]=n.useState(""),[T,I]=n.useState(""),[$,ee]=n.useState(""),[S,te]=n.useState(""),[b,se]=n.useState(""),[c,_]=n.useState([]),[m,re]=n.useState([]),[Ce,be]=n.useState(!1),z=Je(Z,K)||"المؤسسة التربوية";n.useEffect(()=>{Pe()},[]);const Pe=async()=>{pe(!0);try{const t=localStorage.getItem("local_admin_documents");let s=t?JSON.parse(t):[];try{const r=Ke(ve(oe,"user_admin_documents"),Ye("createdAt","desc")),x=(await Qe(r)).docs.map(i=>({id:i.id,...i.data()})),y=new Set(s.map(i=>i.id));x.forEach(i=>{y.has(i.id)||s.push(i)})}catch{}Y(s)}catch(t){console.warn("Error loading saved documents:",t)}finally{pe(!1)}},u=(t,s="success")=>{fe({message:t,type:s}),setTimeout(()=>fe(null),4e3)},le=t=>{de(t),Q(new Date().toISOString().split("T")[0]),X(`مخ/${new Date().getFullYear()}/${Math.floor(100+Math.random()*900)}`),G(t.senderDefault),I(t.recipientDefault),ee(t.subjectDefault),te(t.contentDefault),se(t.notesDefault||""),_(t.defaultRows?JSON.parse(JSON.stringify(t.defaultRows)):[]),re([...t.signers]),M(!0)},ue=t=>{const s=p.find(r=>r.id===t.templateId)||{id:t.templateId||"custom",category:"requests",title:t.title,subTitle:"وثيقة إدارية محفوظة",tag:"وثيقة مخصصة",recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,notesDefault:t.notes,hasTable:!!(t.rows&&t.rows.length>0),tableHeaders:["الرقم","البيان والتعيين","الكمية / المواصفة","الملاحظات"],defaultRows:t.rows,signers:t.signers};de(s),Q(t.date||new Date().toISOString().split("T")[0]),X(t.reference||""),G(t.sender||""),I(t.recipient||""),ee(t.subject||""),te(t.content||""),se(t.notes||""),_(t.rows||[]),re(t.signers||["مسير المخبر","مدير المؤسسة"]),M(!0)},Re=async(t,s)=>{if(s.stopPropagation(),!!window.confirm("هل أنت متأكد من حذف هذه الوثيقة المحفوظة؟"))try{const r=N.filter(l=>l.id!==t);Y(r),localStorage.setItem("local_admin_documents",JSON.stringify(r));try{await Xe(Ge(oe,"user_admin_documents",t))}catch{}u("تم حذف الوثيقة بنجاح من الأرشيف","info")}catch(r){console.error("Error deleting doc:",r)}},He=()=>{const t=(c.length+1).toString().padStart(2,"0");_([...c,{col1:t,col2:"",col3:"",col4:""}])},Fe=t=>{_(c.filter((s,r)=>r!==t))},B=(t,s,r)=>{const l=[...c];l[t][s]=r,_(l)},Oe=async()=>{if(o){be(!0);try{const t={id:`doc_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,templateId:o.id,title:o.title,category:o.category,date:k,reference:h,sender:D,recipient:T,subject:$,content:S,notes:b,rows:c,signers:m,createdAt:new Date().toISOString()},s=[t,...N];Y(s),localStorage.setItem("local_admin_documents",JSON.stringify(s));try{await Ie(ve(oe,"user_admin_documents"),{...t,createdAt:et()})}catch{}u("تم حفظ الوثيقة بنجاح في أرشيفك الشخصي!","success")}catch(t){console.error("Error saving document:",t),u("تعذر الحفظ في السحابة، تم الحفظ محلياً.","info")}finally{be(!1)}}},qe=()=>{if(!o)return"";const t=o.tableHeaders||["الرقم","البيان","الكمية","الملاحظات"];let s="";o.hasTable&&c.length>0&&(s=`
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
            ${c.map((l,x)=>`
              <tr style="background-color: ${x%2===0?"#ffffff":"#fafaf9"};">
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: bold;">${l.col1||x+1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: right;">${l.col2||"-"}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${l.col3||"-"}</td>
                <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${l.col4||"-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `);const r=`
      <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 10px; text-align: center;">
        ${m.map(l=>`
          <div style="flex: 1; margin: 0 10px; border-top: 1px dashed #94a3b8; padding-top: 8px;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${l}</div>
            <div style="height: 55px; margin-top: 8px; color: #94a3b8; font-size: 11px;">(التوقيع والختم)</div>
          </div>
        `).join("")}
      </div>
    `;return`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${o.title} - ${z}</title>
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
        <div class="header-center">${O}</div>
        <div class="header-center" style="font-size: 13px; color: #475569;">${q}</div>

        <div class="inst-info">
          <div>
            <div>${j||"مديرية التربية الوطنية"}</div>
            <div>${z}</div>
          </div>
          <div style="text-align: left;" dir="ltr">
            <div>التاريخ: ${k}</div>
            ${h?`<div>المرجع: ${h}</div>`:""}
          </div>
        </div>

        <div class="title-box">
          <h1>${o.title}</h1>
        </div>

        <div class="correspondence-meta">
          <div><strong>من:</strong> ${D}</div>
          <div style="margin-top: 4px;"><strong>إلى:</strong> ${T}</div>
          <div style="margin-top: 4px; color: #0f766e;"><strong>الموضوع:</strong> ${$}</div>
        </div>

        <div class="body-content">${S}</div>

        ${s}

        ${b?`<div class="notes-box"><strong>ملاحظة هامة:</strong> ${b}</div>`:""}

        ${r}
      </body>
      </html>
    `},ne=async()=>{const t=qe();if(t)try{await Ze.printHtml(t,{title:o==null?void 0:o.title})}catch(s){console.error("Print error:",s)}},ge=async(t,s)=>{const r=t||o;if(!r)return;const l=(t?t.senderDefault:D)||r.senderDefault,x=(t?t.recipientDefault:T)||r.recipientDefault,y=(t?t.subjectDefault:$)||r.subjectDefault,i=(t?t.contentDefault:S)||r.contentDefault,A=t?t.notesDefault:b,C=t?new Date().toISOString().split("T")[0]:k,P=t?"":h,f=(t?t.defaultRows:c)||[],R=(t?t.signers:m)||r.signers,g=r.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];try{const a=await je.generateAdministrativeDocumentPDF({title:r.title,reference:P,category:r.tag,date:C,sender:l,recipient:x,subject:y,content:i,notes:A,hasTable:!!(r.hasTable&&f.length>0),tableHeaders:g,tableRows:f.map(H=>[H.col1,H.col2,H.col3,H.col4]),signers:R,schoolInfo:{country:O,ministry:q,directorate:j,school:Z,commune:K},fileName:`${r.title}.pdf`});$e({file:new File([a],`${r.title}.pdf`,{type:"application/pdf"}),title:r.title,fileName:`${r.title}.pdf`,category:r.tag})}catch(a){console.error("PDF Preview error:",a),u("حدث خطأ أثناء إعداد معاينة PDF","error")}},L=async(t,s)=>{const r=t||o;if(!r)return;const l=(s==null?void 0:s.sender)||(t?t.senderDefault:D)||r.senderDefault,x=(s==null?void 0:s.recipient)||(t?t.recipientDefault:T)||r.recipientDefault,y=(s==null?void 0:s.subject)||(t?t.subjectDefault:$)||r.subjectDefault,i=(s==null?void 0:s.content)||(t?t.contentDefault:S)||r.contentDefault,A=(s==null?void 0:s.notes)!==void 0?s.notes:t?t.notesDefault:b,C=(s==null?void 0:s.date)||(t?new Date().toISOString().split("T")[0]:k),P=(s==null?void 0:s.reference)||(t?"":h),f=(s==null?void 0:s.rows)||(t?t.defaultRows:c)||[],R=(s==null?void 0:s.signers)||(t?t.signers:m)||r.signers,g=r.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];try{await je.generateAdministrativeDocumentPDF({title:r.title,reference:P,category:r.tag,date:C,sender:l,recipient:x,subject:y,content:i,notes:A,hasTable:!!(r.hasTable&&f.length>0),tableHeaders:g,tableRows:f.map(a=>[a.col1,a.col2,a.col3,a.col4]),signers:R,schoolInfo:{country:O,ministry:q,directorate:j,school:Z,commune:K},fileName:`${r.title}.pdf`,save:!0}),u(`تم تنزيل وثيقة "${r.title}" بصيغة PDF بنجاح!`,"success")}catch(a){console.error("PDF Download error:",a),u("حدث خطأ أثناء تنزيل ملف PDF","error")}},U=(t,s)=>{const r=t||o;if(!r)return;const l=(s==null?void 0:s.sender)||D||r.senderDefault,x=(s==null?void 0:s.recipient)||T||r.recipientDefault,y=(s==null?void 0:s.subject)||$||r.subjectDefault,i=(s==null?void 0:s.content)||S||r.contentDefault,A=(s==null?void 0:s.notes)!==void 0?s.notes:b!==void 0?b:r.notesDefault,C=(s==null?void 0:s.date)||k,P=(s==null?void 0:s.reference)||h,f=(s==null?void 0:s.rows)||c,R=(s==null?void 0:s.signers)||m||r.signers,g=r.tableHeaders||["الرقم","البيان والتسمية","الكمية","الملاحظات"];let a="";r.hasTable&&f&&f.length>0&&(a=`
        <table class="items-table" style="width: 100%; border-collapse: collapse; margin-top: 16pt; margin-bottom: 16pt; border: 1.5pt solid #0f766e;" dir="rtl">
          <thead>
            <tr style="background-color: #0f766e; color: #ffffff;">
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 45pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${g[0]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${g[1]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; width: 90pt; text-align: center; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${g[2]}</th>
              <th style="border: 1pt solid #0d9488; padding: 8pt 10pt; text-align: right; font-weight: bold; font-size: 11pt; color: #ffffff; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${g[3]}</th>
            </tr>
          </thead>
          <tbody>
            ${f.map((F,me)=>`
              <tr style="background-color: ${me%2===0?"#ffffff":"#f8fafc"};">
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-weight: bold; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${F.col1||me+1}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${F.col2||"-"}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: center; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${F.col3||"-"}</td>
                <td style="border: 1pt solid #cbd5e1; padding: 7pt 10pt; text-align: right; font-size: 10.5pt; color: #0f172a; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">${F.col4||"-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `);const H=`
      <table class="signatures-table" style="width: 100%; border-collapse: collapse; margin-top: 36pt; border: none;" dir="rtl">
        <tr>
          ${R.map(F=>`
            <td style="width: ${Math.floor(100/Math.max(R.length,1))}%; text-align: center; vertical-align: top; padding: 0 10pt; border: none;">
              <div style="border-top: 1.5pt dashed #64748b; padding-top: 8pt; font-weight: bold; font-size: 11.5pt; color: #1e293b; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                ${F}
              </div>
              <div style="height: 55pt; padding-top: 18pt; color: #94a3b8; font-size: 9.5pt; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                (الاسم، التوقيع والختم الرسمي)
              </div>
            </td>
          `).join("")}
        </tr>
      </table>
    `,Me=`
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${r.title} - ${z}</title>
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
          <p class="header-main">${O}</p>
          <p class="header-sub">${q}</p>

          <table class="meta-table" dir="rtl">
            <tr>
              <td style="text-align: right; vertical-align: top; font-weight: bold; font-size: 11.5pt; color: #1e293b;">
                <div>${j||"مديرية التربية الوطنية"}</div>
                <div>${z}</div>
              </td>
              <td style="text-align: left; vertical-align: top; font-weight: bold; font-size: 11pt; color: #334155;" dir="ltr">
                <div>التاريخ: ${C}</div>
                ${P?`<div>المرجع: ${P}</div>`:""}
              </td>
            </tr>
          </table>

          <table class="title-table" dir="rtl">
            <tr>
              <td>
                <h1>${r.title}</h1>
              </td>
            </tr>
          </table>

          <table class="correspondence-table" dir="rtl">
            <tr>
              <td>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>من:</strong> ${l}</p>
                <p style="margin: 0 0 5pt 0; color: #1e293b;"><strong>إلى:</strong> ${x}</p>
                <p style="margin: 0; color: #0f766e; font-weight: bold;"><strong>الموضوع:</strong> ${y}</p>
              </td>
            </tr>
          </table>

          <div class="body-content">${i}</div>

          ${a}

          ${A?`
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>ملاحظة هامة:</strong> ${A}</td>
              </tr>
            </table>
          `:""}

          ${H}

          <table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 28pt; border: none; border-top: 1pt solid #e2e8f0;">
            <tr>
              <td style="text-align: right; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;">
                الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية والتعليمية
              </td>
              <td style="text-align: left; font-size: 9pt; color: #94a3b8; padding-top: 6pt; border: none; font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;" dir="ltr">
                ${C}
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `,We=new Blob(["\uFEFF",Me],{type:"application/msword;charset=utf-8"}),he=URL.createObjectURL(We),E=document.createElement("a");E.href=he;const Be=(r.title||"وثيقة_إدارية").replace(/[/\\?%*:|"<>]/g,"_");E.download=`${Be}.doc`,document.body.appendChild(E),E.click(),document.body.removeChild(E),setTimeout(()=>URL.revokeObjectURL(he),1e4),u(`تم تنزيل وثيقة "${r.title}" بصيغة Word (.doc) بنجاح بنفس تفاصيل وهيئة الـ PDF!`,"success")},_e=t=>{const s=`
الجمهورية الجزائرية الديمقراطية الشعبية
وزارة التربية الوطنية
${j||"مديرية التربية"} - ${z}
التاريخ: ${new Date().toLocaleDateString("ar-DZ")}

${t.title}
---------------------------------------------
من: ${t.senderDefault}
إلى: ${t.recipientDefault}
الموضوع: ${t.subjectDefault}

${t.contentDefault}

${t.notesDefault?`ملاحظة: ${t.notesDefault}`:""}
الموقعون: ${t.signers.join(" - ")}
    `.trim();navigator.clipboard.writeText(s),xe(t.id),setTimeout(()=>xe(null),2500),u("تم نسخ نص النموذج إلى الحافظة بنجاح!","success")},Ee=n.useMemo(()=>p.filter(t=>{const s=d==="all"||t.category===d,r=t.title.includes(w)||t.subTitle.includes(w)||t.subjectDefault.includes(w)||t.tag.includes(w);return s&&r}),[d,w]);return e.jsxs("div",{className:"space-y-8 max-w-7xl mx-auto px-4 md:px-6 pb-24 rtl font-sans",dir:"rtl",children:[e.jsx(ye,{children:W&&e.jsxs(ie.div,{initial:{opacity:0,y:-20,scale:.95},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:-20,scale:.95},className:`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold backdrop-blur-md ${W.type==="success"?"bg-emerald-500/95 text-white border-emerald-400":W.type==="error"?"bg-error/95 text-white border-error/50":"bg-primary/95 text-white border-primary/50"}`,children:[e.jsx(tt,{size:18}),e.jsx("span",{children:W.message})]})}),e.jsxs("header",{className:"flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6",children:[e.jsx("div",{className:"space-y-2",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>Te(-1),className:"p-2 hover:bg-surface-container rounded-full text-secondary transition-colors",title:"رجوع",children:e.jsx(st,{size:22})}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-inner",children:e.jsx(rt,{size:28})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h1",{className:"text-2xl md:text-3xl font-black text-primary",children:"نماذج وثائق ومراسلات إدارية"}),e.jsxs("span",{className:"px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-500/30 flex items-center gap-1",children:[e.jsx(lt,{size:13}),e.jsx("span",{children:"معايير وزارة التربية الوطنية"})]})]}),e.jsx("p",{className:"text-secondary text-sm mt-0.5",children:"مكتبة شاملة للوثائق المقننة: طلبات شراء وصيانة، تقارير حوادث، محاضر استلام وإتلاف، واستمارات تسيير المخابر."})]})]})}),e.jsx("div",{className:"flex items-center gap-3 shrink-0",children:e.jsxs("button",{onClick:()=>{le({id:`custom_${Date.now()}`,category:"requests",title:"وثيقة ومراسلة إدارية مخصصة",subTitle:"نموذج فارغ قابل للتعديل والطباعة المباشرة",tag:"وثيقة مخصصة",recipientDefault:"السيد: مدير المؤسسة التربوية",senderDefault:"مسؤول المخبر / أستاذ المادة",subjectDefault:"الموضوع: ............................................",contentDefault:"يشرفني أن أتقدم إلى سيادتكم المحترمة بهذه المراسلة قصد .................................................",hasTable:!0,tableHeaders:["الرقم","البيان","الكمية","ملاحظات"],defaultRows:[{col1:"01",col2:"",col3:"",col4:""}],signers:["المحرر / مسؤول المخبر","المقتصد","مدير المؤسسة"]})},className:"px-6 py-3.5 bg-primary text-on-primary rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2 text-sm shadow-xs",children:[e.jsx(we,{size:18}),e.jsx("span",{children:"إنشاء وثيقة فارغة"})]})})]}),e.jsxs("div",{className:"bg-surface rounded-3xl p-4 border border-outline-variant/40 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center",children:[e.jsxs("div",{className:"flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar",children:[e.jsxs("button",{onClick:()=>v("all"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="all"?"bg-primary text-on-primary shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"جميع النماذج"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:p.length})]}),e.jsxs("button",{onClick:()=>v("requests"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="requests"?"bg-emerald-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"الطلبات الإدارية"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:p.filter(t=>t.category==="requests").length})]}),e.jsxs("button",{onClick:()=>v("reports"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="reports"?"bg-amber-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"التقارير وحوادث المخبر"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:p.filter(t=>t.category==="reports").length})]}),e.jsxs("button",{onClick:()=>v("minutes"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="minutes"?"bg-indigo-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"المحاضر الرسمية"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:p.filter(t=>t.category==="minutes").length})]}),e.jsxs("button",{onClick:()=>v("forms"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="forms"?"bg-cyan-600 text-white shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx("span",{children:"الاستمارات وبطاقات التسيير"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:p.filter(t=>t.category==="forms").length})]}),e.jsxs("button",{onClick:()=>v("saved"),className:`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${d==="saved"?"bg-tertiary text-on-tertiary shadow-xs":"bg-surface-container hover:bg-surface-container-highest text-secondary"}`,children:[e.jsx(Ne,{size:14}),e.jsx("span",{children:"وثائقي المحفوظة"}),e.jsx("span",{className:"px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono",children:N.length})]})]}),e.jsxs("div",{className:"relative w-full md:w-72 shrink-0",children:[e.jsx(nt,{className:"absolute right-3.5 top-1/2 -translate-y-1/2 text-outline",size:17}),e.jsx("input",{type:"text",placeholder:"بحث في أسماء ومواضيع النماذج...",value:w,onChange:t=>Se(t.target.value),className:"w-full bg-surface-container-high px-10 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-xs font-bold"})]})]}),d==="saved"?e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-black text-primary flex items-center gap-2",children:[e.jsx(Ne,{className:"text-tertiary",size:20}),e.jsxs("span",{children:["الأرشيف الشخصي للوثائق المحررة (",N.length,")"]})]}),e.jsx("span",{className:"text-xs text-secondary",children:"تُحفظ الوثائق التي قمت بتعديلها محلياً وسحابياً لإعادة طباعتها أو مراجعتها أي وقت."})]}),N.length===0?e.jsxs("div",{className:"bg-surface-container-low rounded-3xl p-16 text-center border border-dashed border-outline-variant",children:[e.jsx(ot,{size:48,className:"mx-auto text-outline mb-3 opacity-40"}),e.jsx("h4",{className:"text-xl font-bold text-secondary mb-1",children:"لا توجد وثائق محفوظة بعد"}),e.jsx("p",{className:"text-xs text-secondary/80 max-w-sm mx-auto",children:'اختر أي نموذج من الأقسام أعلاه، عدّل بياناته، ثم اضغط على زر "حفظ الوثيقة في أرشيفي" ليظهر هنا.'})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",children:N.map(t=>e.jsxs("div",{onClick:()=>ue(t),className:"bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group",children:[e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold",children:t.reference||"وثيقة محررة"}),e.jsxs("span",{className:"text-[11px] text-outline flex items-center gap-1 font-mono",children:[e.jsx(it,{size:12}),t.date]})]}),e.jsx("h4",{className:"text-base font-black text-primary group-hover:text-primary transition-colors",children:t.title}),e.jsx("p",{className:"text-xs text-secondary font-medium line-clamp-2",children:t.subject||t.content}),e.jsx("div",{className:"text-[11px] text-secondary/70 pt-1 border-t border-outline-variant/30 flex items-center justify-between",children:e.jsxs("span",{className:"truncate max-w-[180px]",children:["إلى: ",t.recipient]})})]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 mt-3 border-t border-outline-variant/30",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{onClick:s=>{s.stopPropagation(),ue(t)},className:"text-xs font-bold text-primary flex items-center gap-1 hover:underline",children:[e.jsx(ae,{size:13}),"معاينة وتحرير"]}),e.jsxs("button",{onClick:s=>{s.stopPropagation();const r=p.find(l=>l.id===t.templateId)||{id:t.templateId,category:t.category,title:t.title,tag:t.category,recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,signers:t.signers||["مسير المخبر","المدير"],hasTable:!!(t.rows&&t.rows.length>0)};U(r,t)},className:"text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF",children:[e.jsx(V,{size:13}),e.jsx("span",{children:"Word"})]}),e.jsxs("button",{onClick:s=>{s.stopPropagation();const r=p.find(l=>l.id===t.templateId)||{id:t.templateId,category:t.category,title:t.title,subTitle:"",tag:t.category,recipientDefault:t.recipient,senderDefault:t.sender,subjectDefault:t.subject,contentDefault:t.content,signers:t.signers||["مسير المخبر","المدير"],hasTable:!!(t.rows&&t.rows.length>0)};L(r,t)},className:"text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline",title:"تحميل كملف PDF",children:[e.jsx(J,{size:13}),e.jsx("span",{children:"PDF"})]})]}),e.jsx("button",{onClick:s=>Re(t.id,s),className:"p-1.5 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors",title:"حذف من الأرشيف",children:e.jsx(ke,{size:15})})]})]},t.id))})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:Ee.map((t,s)=>{const r=Ae===t.id;return e.jsxs(ie.div,{initial:{opacity:0,y:15},animate:{opacity:1,y:0},transition:{delay:s*.03},className:"bg-surface rounded-3xl p-6 border border-outline-variant/60 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden",children:[e.jsxs("div",{className:"space-y-3 mb-5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${t.category==="requests"?"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300":t.category==="reports"?"bg-amber-500/15 text-amber-700 dark:text-amber-300":t.category==="minutes"?"bg-indigo-500/15 text-indigo-700 dark:text-indigo-300":"bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"}`,children:t.tag}),e.jsxs("button",{onClick:()=>_e(t),className:"p-1.5 hover:bg-surface-container rounded-xl text-secondary hover:text-primary transition-colors text-xs flex items-center gap-1 font-bold",title:"نسخ نص النموذج",children:[r?e.jsx(at,{size:14,className:"text-emerald-500"}):e.jsx(ct,{size:14}),e.jsx("span",{className:"text-[10px]",children:r?"تم النسخ":"نسخ"})]})]}),e.jsx("h3",{className:"text-lg font-black text-primary group-hover:text-primary transition-colors leading-tight",children:t.title}),e.jsx("p",{className:"text-xs text-secondary/80 leading-relaxed",children:t.subTitle}),e.jsxs("div",{className:"bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-[11px] text-secondary space-y-1",children:[e.jsxs("div",{className:"truncate",children:[e.jsx("strong",{children:"المرسل إليه:"})," ",t.recipientDefault]}),e.jsxs("div",{className:"truncate",children:[e.jsx("strong",{children:"الموضوع:"})," ",t.subjectDefault]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-outline-variant/40 flex items-center gap-1.5 flex-wrap",children:[e.jsxs("button",{onClick:()=>le(t),className:"flex-1 min-w-[110px] py-2 bg-primary text-on-primary hover:opacity-95 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all",children:[e.jsx(De,{size:14}),e.jsx("span",{children:"تعديل وطباعة"})]}),e.jsxs("button",{onClick:l=>{l.stopPropagation(),U(t)},className:"p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF (.doc)",children:[e.jsx(V,{size:14}),e.jsx("span",{children:"Word"})]}),e.jsxs("button",{onClick:l=>{l.stopPropagation(),L(t)},className:"p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold",title:"تحميل كملف PDF رسمي (.pdf)",children:[e.jsx(J,{size:14}),e.jsx("span",{children:"PDF"})]}),e.jsx("button",{onClick:l=>{l.stopPropagation(),ge(t)},className:"p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl transition-colors",title:"معاينة PDF في المتصفح",children:e.jsx(ae,{size:15})}),e.jsx("button",{onClick:()=>{le(t),setTimeout(ne,300)},className:"p-2 bg-surface-container hover:bg-surface-container-highest text-primary rounded-xl transition-colors",title:"طباعة سريعة",children:e.jsx(ce,{size:15})})]})]},t.id)})}),e.jsx(ye,{children:ze&&o&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-scrim/60 backdrop-blur-md overflow-y-auto",children:e.jsxs(ie.div,{initial:{opacity:0,scale:.95,y:15},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:15},className:"bg-surface w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant flex flex-col max-h-[94vh]",children:[e.jsxs("div",{className:"p-4 sm:p-5 bg-surface-container-low border-b border-outline-variant/50 flex items-center justify-between shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center",children:e.jsx(De,{size:22})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg sm:text-xl font-black text-primary leading-tight",children:o.title}),e.jsx("p",{className:"text-[11px] text-secondary",children:"قم بضبط الحقول، إضافة العناصر، ثم اضغط على طباعة رسمية أو معاينة PDF."})]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsxs("button",{onClick:Oe,disabled:Ce,className:"px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50",title:"حفظ في أرشيفي",children:[e.jsx(dt,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"حفظ بالأرشيف"})]}),e.jsxs("button",{onClick:()=>ge(),className:"px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"معاينة PDF داخلية",children:[e.jsx(ae,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"معاينة PDF"})]}),e.jsxs("button",{onClick:()=>L(),className:"px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف PDF",children:[e.jsx(J,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"تحميل PDF"})]}),e.jsxs("button",{onClick:()=>U(),className:"px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل مستند Word بنفس تفاصيل وهيئة الـ PDF (.doc)",children:[e.jsx(V,{size:14}),e.jsx("span",{className:"hidden sm:inline",children:"تحميل Word"})]}),e.jsxs("button",{onClick:ne,className:"px-4 py-2 bg-primary text-on-primary hover:opacity-90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",children:[e.jsx(ce,{size:15}),e.jsx("span",{children:"طباعة"})]}),e.jsx("button",{onClick:()=>M(!1),className:"p-2 hover:bg-surface-container rounded-full text-secondary transition-colors",children:e.jsx(xt,{size:20})})]})]}),e.jsxs("div",{className:"p-4 sm:p-6 overflow-y-auto space-y-6 flex-1",children:[e.jsxs("div",{className:"bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 text-center space-y-1",children:[e.jsx("div",{className:"text-xs font-black text-primary",children:O}),e.jsx("div",{className:"text-[11px] text-secondary font-bold",children:q}),e.jsxs("div",{className:"text-[11px] text-secondary font-medium",children:[j||"مديرية التربية الوطنية"," — ",z]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"تاريخ تحرير الوثيقة"}),e.jsx("input",{type:"date",value:k,onChange:t=>Q(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"الرقم المرجعي (اختياري)"}),e.jsx("input",{type:"text",placeholder:"مثال: مخ/2026/14",value:h,onChange:t=>X(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"المرسِل / المحرر"}),e.jsx("input",{type:"text",value:D,onChange:t=>G(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"المرسَل إليه (الجهة المعنية)"}),e.jsx("input",{type:"text",value:T,onChange:t=>I(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"موضوع المراسلة أو التقرير"}),e.jsx("input",{type:"text",value:$,onChange:t=>ee(t.target.value),className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"نص الوثيقة / العرض الإداري"}),e.jsx("textarea",{rows:5,value:S,onChange:t=>te(t.target.value),className:"w-full bg-surface p-3 rounded-xl border border-outline-variant text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none leading-relaxed"})]}),o.hasTable&&e.jsxs("div",{className:"space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"block text-xs font-black text-primary",children:["جدول التعيينات والوسائل المرفقة (",c.length," عناصر)"]}),e.jsxs("button",{type:"button",onClick:He,className:"px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold flex items-center gap-1 transition-colors",children:[e.jsx(we,{size:13}),e.jsx("span",{children:"إضافة سطر"})]})]}),e.jsx("div",{className:"border border-outline-variant rounded-2xl overflow-hidden shadow-xs",children:e.jsxs("table",{className:"w-full text-xs text-right border-collapse",children:[e.jsx("thead",{className:"bg-surface-container-high text-primary font-black",children:e.jsxs("tr",{children:[e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-16 text-center",children:"الرقم"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant",children:"البيان والتسمية"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-32",children:"الكمية"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant",children:"ملاحظات / مواصفة"}),e.jsx("th",{className:"p-2.5 border-b border-outline-variant w-12 text-center"})]})}),e.jsx("tbody",{className:"divide-y divide-outline-variant/40 bg-surface",children:c.map((t,s)=>e.jsxs("tr",{className:"hover:bg-surface-container-low/50",children:[e.jsx("td",{className:"p-2 text-center",children:e.jsx("input",{type:"text",value:t.col1,onChange:r=>B(s,"col1",r.target.value),className:"w-full text-center bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"اسم العتاد أو المادة...",value:t.col2,onChange:r=>B(s,"col2",r.target.value),className:"w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"مثال: 05 قطع",value:t.col3,onChange:r=>B(s,"col3",r.target.value),className:"w-full bg-transparent border-0 font-bold focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2",children:e.jsx("input",{type:"text",placeholder:"المواصفات...",value:t.col4,onChange:r=>B(s,"col4",r.target.value),className:"w-full bg-transparent border-0 focus:ring-0 outline-none"})}),e.jsx("td",{className:"p-2 text-center",children:e.jsx("button",{type:"button",onClick:()=>Fe(s),className:"p-1 text-error/60 hover:text-error rounded-lg",title:"حذف السطر",children:e.jsx(ke,{size:14})})})]},s))})]})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-1",children:"ملاحظات أو توصيات إضافية (اختياري)"}),e.jsx("input",{type:"text",value:b,onChange:t=>se(t.target.value),placeholder:"ملاحظات تظهر أسفل الوثيقة...",className:"w-full bg-surface px-3 py-2 rounded-xl border border-outline-variant text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-black text-primary mb-2",children:"الموقعون والمصادقون على الوثيقة"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:m.map((t,s)=>e.jsxs("div",{className:"bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40 flex items-center gap-2",children:[e.jsx(ft,{size:16,className:"text-primary shrink-0"}),e.jsx("input",{type:"text",value:t,onChange:r=>{const l=[...m];l[s]=r.target.value,re(l)},className:"bg-transparent border-0 text-xs font-bold focus:ring-0 outline-none w-full"})]},s))})]})]}),e.jsxs("div",{className:"p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant/50 flex items-center justify-between shrink-0",children:[e.jsx("span",{className:"text-xs text-secondary font-medium",children:"جاهزة للطباعة بحجم A4 قياسي وفق مواصفات مراسلات وزارة التربية الوطنية."}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("button",{onClick:()=>M(!1),className:"px-4 py-2.5 bg-surface hover:bg-surface-container text-secondary rounded-xl text-xs font-bold border border-outline-variant/60 transition-colors",children:"إغلاق"}),e.jsxs("button",{onClick:()=>L(),className:"px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف PDF",children:[e.jsx(J,{size:15}),e.jsx("span",{children:"تحميل PDF"})]}),e.jsxs("button",{onClick:()=>U(),className:"px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all",title:"تحميل كملف Word بنفس تفاصيل وهيئة الـ PDF",children:[e.jsx(V,{size:15}),e.jsx("span",{children:"تحميل ملف Word (.doc)"})]}),e.jsxs("button",{onClick:ne,className:"px-5 py-2.5 bg-primary text-on-primary hover:opacity-95 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all",children:[e.jsx(ce,{size:15}),e.jsx("span",{children:"طباعة الوثيقة الآن"})]})]})]})]})})})]})}export{jt as default};
