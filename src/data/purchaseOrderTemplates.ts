export interface OrderTemplateItem {
  name: string;
  category?: string;
  defaultQuantity: number;
  unit: string;
  estimatedPrice: number;
  referenceCode?: string;
  description?: string;
}

export interface PurchaseOrderTemplate {
  id: string;
  code: string;
  title: string;
  category: 'registers' | 'chemicals' | 'glassware' | 'equipment' | 'biology' | 'safety' | 'annual';
  categoryLabel: string;
  iconName: string;
  description: string;
  targetSubject?: 'الفيزياء والكيمياء' | 'علوم الطبيعة والحياة' | 'مشترك' | 'إداري';
  suggestedSupplierType: string;
  items: OrderTemplateItem[];
}

export const PURCHASE_ORDER_TEMPLATES: PurchaseOrderTemplate[] = [
  {
    id: 'tpl-registers-official',
    code: 'REG-34.3-36.3',
    title: 'طلب السجلات والدفاتر الإدارية الرسمية للمخبر',
    category: 'registers',
    categoryLabel: 'السجلات والدفاتر الإدارية',
    iconName: 'BookOpen',
    description: 'الوثائق والسجلات الإدارية والتنظيمية الرسمية المنصوص عليها في التشريع المدرسي الجزائري لمتابعة الجرد واستغلال المخبر.',
    targetSubject: 'إداري',
    suggestedSupplierType: 'مؤسسة الدواوين والمطبوعات المدرسية / المقتصدية / مطابع معتمدة',
    items: [
      {
        name: 'سجل جرد المخبر العام (نموذج 34.3)',
        referenceCode: 'Modèle 34.3',
        defaultQuantity: 2,
        unit: 'سجل',
        estimatedPrice: 1800,
        description: 'سجل مقوى كبير مرقم ومؤشر لجرد وتسجيل جميع التجهيزات والأدوات الدائمة المنقولة للمخبر.'
      },
      {
        name: 'سجل استعمال واستغلال الوسائل المخبرية (نموذج 36.3)',
        referenceCode: 'Modèle 36.3',
        defaultQuantity: 4,
        unit: 'سجل',
        estimatedPrice: 1200,
        description: 'سجل متابعة الحصص المخبرية، تسليم الأجهزة للأساتذة وإرجاعها وتوثيق التجارب المنفذة.'
      },
      {
        name: 'بطاقات الجرد الفردية للوسائل والتجهيزات (نموذج 2.6.2)',
        referenceCode: 'Modèle 2.6.2',
        defaultQuantity: 150,
        unit: 'بطاقة كرتونية',
        estimatedPrice: 35,
        description: 'بطاقة فردية لمتابعة كل جهاز أو أداة من تاريخ الاستلام، المكان، الصيانة، وحالة الاستغلال.'
      },
      {
        name: 'سجل حركة واستهلاك المواد الكيميائية والمحاليل',
        referenceCode: 'REG-CHEM-MOV',
        defaultQuantity: 2,
        unit: 'سجل',
        estimatedPrice: 1400,
        description: 'دفتر ضبط حركات الدخول والخروج ورصيد الكواشف والأحماض والأسس تفادياً لنفاد المخزون.'
      },
      {
        name: 'دفتر متابعة كسر وضياع الأدوات الزجاجية والمخبرية',
        referenceCode: 'REG-BRK-01',
        defaultQuantity: 2,
        unit: 'دفتر',
        estimatedPrice: 1100,
        description: 'دفتر توثيق حوادث الكسر أثناء الأعمال التطبيقية، تحديد المسؤولية والإحصاء الدوري.'
      },
      {
        name: 'سجل إعارة وتبادل الأجهزة بين الأساتذة والمخابر',
        referenceCode: 'REG-LOAN-02',
        defaultQuantity: 2,
        unit: 'دفتر',
        estimatedPrice: 950,
        description: 'دفتر تسليم واسترجاع العتاد المستعار بين مخابر المؤسسة أو المدارس المجاورة.'
      },
      {
        name: 'دفتر التقرير اليومي للمخبر وحالة القاعات',
        referenceCode: 'REG-REP-DAILY',
        defaultQuantity: 3,
        unit: 'دفتر',
        estimatedPrice: 850,
        description: 'متابعة نظافة وجاهزية المخبر، شبكات الغاز والكهرباء والماء، وسير الحصص اليومية.'
      },
      {
        name: 'دفتر بطاقات طلب الأنشطة المخبرية للأساتذة',
        referenceCode: 'CARNET-ACT-REQ',
        defaultQuantity: 5,
        unit: 'دفتر كربون (Souche)',
        estimatedPrice: 650,
        description: 'دفاتر كربونية ذات نسختين يملؤها الأستاذ 48 ساعة قبل الحصة التطبيقية.'
      }
    ]
  },
  {
    id: 'tpl-chemicals-reagents',
    code: 'CHEM-REAG-2026',
    title: 'طلب المواد الكيميائية والكواشف المخبرية الأساسية',
    category: 'chemicals',
    categoryLabel: 'المواد الكيميائية والكواشف',
    iconName: 'FlaskConical',
    description: 'المحاليل الأساسية، الكواشف اللونية، المؤشرات والأحماض والأسس الأكثر استهلاكاً في منهاجي الفيزياء والعلوم.',
    targetSubject: 'الفيزياء والكيمياء',
    suggestedSupplierType: 'شركات التوريد الكيميائي والمخبري المعتمدة',
    items: [
      {
        name: 'محلول كاشف فهلنك A + B (Fehling A & B)',
        referenceCode: 'CHEM-FEH-500',
        defaultQuantity: 4,
        unit: 'قارورة (500 مل)',
        estimatedPrice: 2200,
        description: 'للكشف عن السكريات المرجعة في تجارب العلوم الطبيعية والكيمياء العضوية.'
      },
      {
        name: 'ماء اليود المركّز (Solution d\'Iode / Lugol)',
        referenceCode: 'CHEM-LUG-500',
        defaultQuantity: 4,
        unit: 'قارورة (500 مل)',
        estimatedPrice: 1900,
        description: 'للكشف عن النشاء في التجارب الحيوية ومعايرات الأكسدة الإرجاعية.'
      },
      {
        name: 'كاشف أزرق البروموتيمول (BBT) جاهز للاستعمال',
        referenceCode: 'CHEM-BBT-250',
        defaultQuantity: 5,
        unit: 'قارورة (250 مل)',
        estimatedPrice: 1500,
        description: 'مشعر ملون للمعايرة حمض-أساس والكشف عن غاز ثنائي أكسيد الكربون التنفسي.'
      },
      {
        name: 'كاشف الفينول فتالين (Phénolphtaléine 1%)',
        referenceCode: 'CHEM-PHT-250',
        defaultQuantity: 3,
        unit: 'قارورة (250 مل)',
        estimatedPrice: 1600,
        description: 'مشعر ملون ذو مجال تغيّر لوني واضح في الوسط الأساسي.'
      },
      {
        name: 'كاشف الهليانثين / الميثيل البرتقالي (Méthylorange)',
        referenceCode: 'CHEM-MTH-250',
        defaultQuantity: 3,
        unit: 'قارورة (250 مل)',
        estimatedPrice: 1450,
        description: 'مشعر حمضي-أساسي للمعايرات الملونة.'
      },
      {
        name: 'حمض كلور الماء النقي (Acide Chlorhydrique HCl 37%)',
        referenceCode: 'CHEM-HCL-1L',
        defaultQuantity: 6,
        unit: 'قارورة زجاجية (1 لتر)',
        estimatedPrice: 1300,
        description: 'درجة نقاوة عالية لتحضير المحاليل الممددة وتفاعلات الترسيب والتآكل.'
      },
      {
        name: 'حمض الكبريت المركز (Acide Sulfurique H2SO4 98%)',
        referenceCode: 'CHEM-H2SO4-1L',
        defaultQuantity: 4,
        unit: 'قارورة زجاجية (1 لتر)',
        estimatedPrice: 1800,
        description: 'وسط حمضي لتفاعلات الأكسدة الإرجاعية والتحليل الكهربائي.'
      },
      {
        name: 'حمض الآزوت النقي (Acide Nitrique HNO3 65%)',
        referenceCode: 'CHEM-HNO3-1L',
        defaultQuantity: 3,
        unit: 'قارورة زجاجية (1 لتر)',
        estimatedPrice: 2100,
        description: 'للتفاعلات الزانثوبروتيكية وتجارب المعادن.'
      },
      {
        name: 'هيدروكسيد الصوديوم النقي (NaOH Pastilles Pure)',
        referenceCode: 'CHEM-NAOH-1KG',
        defaultQuantity: 5,
        unit: 'علبة حبيبات (1 كغ)',
        estimatedPrice: 1750,
        description: 'تحضير محاليل الصود الكاوية للمعايرات وترسيب الشوارد المعدنية.'
      },
      {
        name: 'كبريتات النحاس المائية الزرقاء (CuSO4 . 5H2O)',
        referenceCode: 'CHEM-CUSO4-500G',
        defaultQuantity: 4,
        unit: 'علبة (500 غرام)',
        estimatedPrice: 2300,
        description: 'للكشف عن الماء (بعد التجفيف)، تجارب التحليل الكهربائي وتحضير كاشف بيوري.'
      },
      {
        name: 'نترات الفضة النقي (Nitrate d\'Argent AgNO3 Cristaux)',
        referenceCode: 'CHEM-AGNO3-25G',
        defaultQuantity: 2,
        unit: 'قارورة معتمة (25 غرام)',
        estimatedPrice: 7800,
        description: 'للكشف النوعي عن شوارد الكلور وتفاعلات الترسيب والمعايرات الترسيبية.'
      },
      {
        name: 'برمنغنات البوتاسيوم النقي (KMnO4)',
        referenceCode: 'CHEM-KMNO4-250G',
        defaultQuantity: 2,
        unit: 'علبة (250 غرام)',
        estimatedPrice: 2900,
        description: 'مؤكسد قوي للمعايرات الحجمية وتجارب الأكسدة الإرجاعية.'
      },
      {
        name: 'مساحيق المعادن (زنك Zn، حديد Fe، نحاس Cu، مغنيزيوم شريط)',
        referenceCode: 'CHEM-METALS-SET',
        defaultQuantity: 2,
        unit: 'طقم متكامل',
        estimatedPrice: 4500,
        description: 'أطقم مساحيق نقية لتفاعلات الأحماض مع المعادن وتجارب الأكسدة.'
      },
      {
        name: 'ماء مقطر نقي عالي النقاوة منزوع الشوارد',
        referenceCode: 'CHEM-H2O-DIST',
        defaultQuantity: 8,
        unit: 'عبوة (5 لتر)',
        estimatedPrice: 650,
        description: 'لتحضير المحاليل الكيميائية وتمديدها وغسيل الأدوات الزجاجية الدقيقة.'
      }
    ]
  },
  {
    id: 'tpl-glassware-utensils',
    code: 'GLAS-LAB-2026',
    title: 'طلب الزجاجيات والأواني المخبرية المقاومة للحرارة',
    category: 'glassware',
    categoryLabel: 'الزجاجيات المخبرية',
    iconName: 'Beaker',
    description: 'تشكيلة متكاملة من الزجاجيات المعايرة وأنابيب الاختبار المصنوعة من زجاج البوروسيليكات المقاوم للحرارة 3.3.',
    targetSubject: 'مشترك',
    suggestedSupplierType: 'مؤسسات توريد الزجاجيات والوسائل التعليمية',
    items: [
      {
        name: 'أنابيب اختبار زجاجية بوروسيليكات (16×150 مم)',
        referenceCode: 'GL-TUBE-16150',
        defaultQuantity: 5,
        unit: 'علبة (100 أنبوب)',
        estimatedPrice: 3200,
        description: 'زجاج متين مقاوم للحرارة والتسخين المباشر.'
      },
      {
        name: 'كؤوس بيشر مدرجة بوروسيليكات سعة 250 مل',
        referenceCode: 'GL-BEAK-250',
        defaultQuantity: 20,
        unit: 'كأس',
        estimatedPrice: 380,
        description: 'مدرجة مع فوهة صب، تتحمل التسخين والصدمات الحرارية.'
      },
      {
        name: 'كؤوس بيشر مدرجة سعة 100 مل و 500 مل و 1000 مل',
        referenceCode: 'GL-BEAK-SET',
        defaultQuantity: 15,
        unit: 'كأس متنوع',
        estimatedPrice: 650,
        description: 'أحجام متعددة للاستعمال في التحضير والمعايرات وحمامات التسخين.'
      },
      {
        name: 'حوجلات عيارية مع سدادات بلاستيكية (100 مل و 250 مل و 500 مل)',
        referenceCode: 'GL-FIOLE-JAUG',
        defaultQuantity: 12,
        unit: 'حوجلة عيارية',
        estimatedPrice: 850,
        description: 'دقة عالية فئة A لتحضير المحاليل العيارية القياسية بدقة متناهية.'
      },
      {
        name: 'دوارق مخروطية إرلنماير سعة 250 مل (Fioles Erlenmeyer)',
        referenceCode: 'GL-ERLEN-250',
        defaultQuantity: 16,
        unit: 'دورق مخروطي',
        estimatedPrice: 420,
        description: 'مثالية للمعايرات اللونية والخلط السريع دون تناثر.'
      },
      {
        name: 'مخابير مدرجة زجاجية بقاعدة بلاستيكية (25 مل و 50 مل و 100 مل)',
        referenceCode: 'GL-EPROUV-SET',
        defaultQuantity: 12,
        unit: 'مخبار مدرج',
        estimatedPrice: 720,
        description: 'لقياس الحجوم السائلة بدقة وقاعدة مانعة للانقلاب والكسر.'
      },
      {
        name: 'سحاحات مخبرية مدرجة مع صنبور تفلون PTFE سعة 25 مل و 50 مل',
        referenceCode: 'GL-BURET-TEFLON',
        defaultQuantity: 8,
        unit: 'سحاحة',
        estimatedPrice: 2400,
        description: 'سحاحات دقيقة للمعايرات الحجمية مع محبس تفلون لا يحتاج إلى تشحيم.'
      },
      {
        name: 'ماصات عيارية وماصات مدرجة (5 مل و 10 مل) مع إجاصات سحب مطاطية',
        referenceCode: 'GL-PIP-SET',
        defaultQuantity: 10,
        unit: 'طقم ماصة + إجاصة',
        estimatedPrice: 1250,
        description: 'ماصات زجاجية دقيقة فئة A مع إجاصة مطاطية ثلاثية الصمامات لسحب المحاليل بأمان.'
      },
      {
        name: 'قوارير زجاجية بنية معتمة لحفظ الكواشف الحساسة للضوء (250 و 500 مل)',
        referenceCode: 'GL-BOTTLE-AMBER',
        defaultQuantity: 15,
        unit: 'قارورة بسدادة',
        estimatedPrice: 550,
        description: 'معتمة لحفظ نترات الفضة وبرمنغنات البوتاسيوم وماء اليود.'
      },
      {
        name: 'زجاجيات ساعة + علب بتري زجاجية قطر 90 مم',
        referenceCode: 'GL-PETRI-WATCH',
        defaultQuantity: 20,
        unit: 'قطعة',
        estimatedPrice: 280,
        description: 'لوزن المواد الجافة وفحص العينات البيولوجية وتجارب التبخير.'
      },
      {
        name: 'أقماع ترشيح زجاجية ومكثفات زجاجية مستقيمة (Réfrigérant de Liebig)',
        referenceCode: 'GL-FUNNEL-COND',
        defaultQuantity: 6,
        unit: 'قطعة',
        estimatedPrice: 1900,
        description: 'لعمليات الترشيح وعمليات التقطير واستخلاص الزيوت العطرية.'
      },
      {
        name: 'حوامل خشبية لأنابيب الاختبار وفرش تنظيف متينة متنوعة القياسات',
        referenceCode: 'GL-RACK-BRUSH',
        defaultQuantity: 8,
        unit: 'طقم حامل + فرش',
        estimatedPrice: 1100,
        description: 'حوامل متينة لتثبيت الأنابيب أثناء العمل والتجفيف.'
      }
    ]
  },
  {
    id: 'tpl-equipment-instruments',
    code: 'EQP-INST-2026',
    title: 'طلب الأجهزة والتجهيزات المخبرية الأساسية',
    category: 'equipment',
    categoryLabel: 'الأجهزة والتجهيزات المخبرية',
    iconName: 'Cpu',
    description: 'أجهزة القياس الدقيقة، المجاهر الضوئية، السخانات المغناطيسية، والتجهيزات الكهربائية الضرورية للأعمال المخبرية.',
    targetSubject: 'مشترك',
    suggestedSupplierType: 'شركات توريد التجهيزات العلمية والأجهزة الدقيقة',
    items: [
      {
        name: 'مقياس الأس الهيدروجيني الرقمي المكتبي (pH-mètre numérique)',
        referenceCode: 'EQ-PH-DIG',
        defaultQuantity: 2,
        unit: 'جهاز متكامل',
        estimatedPrice: 28000,
        description: 'شاشة رقمية واضحة، مع مسرى مدمج ومحاليل معايرة pH 4.01 و 7.00.'
      },
      {
        name: 'مقياس الناقلية الكهربائية الرقمي (Conductimètre de laboratoire)',
        referenceCode: 'EQ-COND-DIG',
        defaultQuantity: 2,
        unit: 'جهاز متكامل',
        estimatedPrice: 32000,
        description: 'لقياس الناقلية النوعية والناقلية المولية للمحاليل الشاردية.'
      },
      {
        name: 'ميزان إلكتروني رقمي عالي الدقة (حساسية 0.01 غرام / سعة 500 غرام)',
        referenceCode: 'EQ-BAL-001',
        defaultQuantity: 3,
        unit: 'ميزان',
        estimatedPrice: 16500,
        description: 'مزود بحاجز هوائي، وظيفة التصفير السريع (Tare)، وكتلة عيارية للفحص.'
      },
      {
        name: 'سخان كهربائي بمحرك تحريك مغناطيسي (Agitateur magnétique chauffant)',
        referenceCode: 'EQ-AGIT-HEAT',
        defaultQuantity: 4,
        unit: 'جهاز',
        estimatedPrice: 24000,
        description: 'تحكم في درجة الحرارة حتى 350°C وسرعة الدوران مع قضبان تحريك تفلون مغناطيسية.'
      },
      {
        name: 'مجهر ضوئي تعليمي ثنائي العينية مع إضاءة LED (Microscope binoculaire)',
        referenceCode: 'EQ-MIC-BINO',
        defaultQuantity: 3,
        unit: 'مجهر كامل',
        estimatedPrice: 48000,
        description: 'عدسات شيئية أكروماتية (4X, 10X, 40X, 100X immersion)، مكثف آبي مع حامل متحرك.'
      },
      {
        name: 'مكبرة استريومجهرية ثنائية (Loupe binoculaire 20X-40X)',
        referenceCode: 'EQ-LOUPE-BINO',
        defaultQuantity: 2,
        unit: 'مكبرة',
        estimatedPrice: 35000,
        description: 'لفحص الحشرات والأزهار وعينات الصخور والتراكيب الدقيقة ثلاثية الأبعاد.'
      },
      {
        name: 'مولد كهربائي مخبري للتيار المستمر والمتناوب (0-12 فولت / 3 أمبير)',
        referenceCode: 'EQ-ALIM-012',
        defaultQuantity: 6,
        unit: 'مولد تيار',
        estimatedPrice: 18500,
        description: 'مزود بحماية آلية ضد قصر الدارة، ومخارج آمنة لتجارب الكهرباء والتحليل.'
      },
      {
        name: 'أجهزة قياس متعددة رقمية (Multimètres numériques) وأسلاك توصيل موزية',
        referenceCode: 'EQ-MULTI-SET',
        defaultQuantity: 8,
        unit: 'جهاز + طقم أسلاك',
        estimatedPrice: 4500,
        description: 'لقياس شدة التيار والتوتر والمقاومة، شاشة مضيئة وأسلاك آمنة مرنة.'
      },
      {
        name: 'حمام مائي كهربائي منظم الحرارة (Bain-marie thermo-régulé)',
        referenceCode: 'EQ-BAIN-MARIE',
        defaultQuantity: 1,
        unit: 'جهاز',
        estimatedPrice: 38000,
        description: 'للإماهة الإنزيمية وتجارب الكيمياء الحيوية بدرجة حرارة ثابتة 37°C و 100°C.'
      }
    ]
  },
  {
    id: 'tpl-biology-svt',
    code: 'BIO-SVT-2026',
    title: 'طلب مستلزمات البيولوجيا والتشريح والجيولوجيا',
    category: 'biology',
    categoryLabel: 'علوم الطبيعة والحياة والتشريح',
    iconName: 'Dna',
    description: 'مستلزمات الحصص التطبيقية للعلوم الطبيعية: أدوات التشريح، الشرائح والمجهريات، النماذج المجسمة وعينات الجيولوجيا.',
    targetSubject: 'علوم الطبيعة والحياة',
    suggestedSupplierType: 'مؤسسات الوسائل التعليمية والبيولوجية',
    items: [
      {
        name: 'علب أدوات تشريح متكاملة من الفولاذ المقاوم للصدأ (8 قطع)',
        referenceCode: 'BIO-DISS-BOX',
        defaultQuantity: 10,
        unit: 'علبة تشريح',
        estimatedPrice: 3800,
        description: 'تتضمن مشارط مع شفرات قابلة للتبديل، مقصات دقيقة ومستقيمة، ملاقط، وإبر تشريح.'
      },
      {
        name: 'أحواض تشريح مع أرضية شمعية ودبابيس تثبيت (Cuvettes à dissection)',
        referenceCode: 'BIO-CUV-WAX',
        defaultQuantity: 8,
        unit: 'حوض تشريح',
        estimatedPrice: 2200,
        description: 'لتشريح الأعضاء الطازجة (القلب، الكلية، الدماغ، الحوت، الضفدع).'
      },
      {
        name: 'شرائح زجاجية مجهرية نظيفة (Lames porte-objets 76×26 مم)',
        referenceCode: 'BIO-LAME-BOX',
        defaultQuantity: 10,
        unit: 'علبة (50 شريحة)',
        estimatedPrice: 450,
        description: 'زجاج صاف بحواف مصقولة لتحضير المجهريات الطازجة.'
      },
      {
        name: 'سواتر مجهرية رقيقة زجاجية مربعة (Lamelles couvre-objets 22×22 مم)',
        referenceCode: 'BIO-LAMELLE-BOX',
        defaultQuantity: 15,
        unit: 'علبة (100 ساترة)',
        estimatedPrice: 380,
        description: 'سماكة قياسية لتغطية العينات دون تشويه المسار الضوئي.'
      },
      {
        name: 'طقم ملونات حيوية مجهرية (أزرق الميثيلين، أخضر الميثيل، الإيوسين)',
        referenceCode: 'BIO-STAINS-SET',
        defaultQuantity: 3,
        unit: 'طقم صبغات',
        estimatedPrice: 4200,
        description: 'لتلوين الأنوية والخلايا النباتية (بصل، إيلوديا) والخلايا الطلائية للفم.'
      },
      {
        name: 'مجسم تشريحي ثلاثي الأبعاد لجسم الإنسان والأعضاء المفككة',
        referenceCode: 'BIO-MOD-TORSO',
        defaultQuantity: 1,
        unit: 'مجسم كامل',
        estimatedPrice: 34000,
        description: 'جذع بشري بارتفاع 85 سم يوضح الجهاز الهضمي، الدوراني، التنفسي والبولي.'
      },
      {
        name: 'مجسمات تعليمية مكبرة (القلب البشري، الكلية، الخلية الحيوانية والنباتية)',
        referenceCode: 'BIO-MOD-ORGANS',
        defaultQuantity: 3,
        unit: 'مجسم',
        estimatedPrice: 12500,
        description: 'مجسمات دقيقة قابلة للفك والشرح في الحصص النظرية والتطبيقية.'
      },
      {
        name: 'مجموعة عينات الصخور والمعادن الجيولوجية التربوية المصنفة',
        referenceCode: 'BIO-GEO-ROCKS',
        defaultQuantity: 2,
        unit: 'حقيبة تعليمية',
        estimatedPrice: 15000,
        description: 'صخور نارية، رسوبية ومتحولة مع دليل تعريفي لاختبار الصلابة والتفاعل مع حمض HCl.'
      }
    ]
  },
  {
    id: 'tpl-safety-protection',
    code: 'SEC-PROT-2026',
    title: 'طلب مستلزمات الأمن والسلامة والوقاية المخبرية',
    category: 'safety',
    categoryLabel: 'الأمن والسلامة والوقاية',
    iconName: 'ShieldAlert',
    description: 'معدات الحماية الشخصية (EPI)، حقائب الإسعاف الأولي، مستوعبات النفايات الكيميائية ومحاليل غسيل العيون.',
    targetSubject: 'مشترك',
    suggestedSupplierType: 'شركات تجهيزات الوقاية المهنية والمعدات الطبية',
    items: [
      {
        name: 'نظارات وقاية شفافة مضادة لتناثر السوائل الكيميائية (Lunettes de protection)',
        referenceCode: 'SEC-GLASS-PROT',
        defaultQuantity: 30,
        unit: 'نظارة',
        estimatedPrice: 450,
        description: 'مطابقة لمعايير السلامة، مريحة وتسمح بالارتداء فوق النظارات الطبية.'
      },
      {
        name: 'قفازات نيتريل كيميائية خالية من البودرة (مقاسات M و L)',
        referenceCode: 'SEC-GLOV-NITRILE',
        defaultQuantity: 12,
        unit: 'علبة (100 قفاز)',
        estimatedPrice: 1100,
        description: 'مقاومة للأحماض والأسس والمذيبات وتمنع التحسس الجلدي.'
      },
      {
        name: 'مآزر مخبرية بيضاء من القطن 100% بأزرار ضغط سريعة',
        referenceCode: 'SEC-COAT-COTTON',
        defaultQuantity: 10,
        unit: 'مئزر',
        estimatedPrice: 2800,
        description: 'قطن خالص مقاوم للحرائق، أكمام مرنة وطول مناسب لحماية الجسم.'
      },
      {
        name: 'حقيبة إسعافات أولية مخبرية نموذجية متكاملة للحروق والجروح',
        referenceCode: 'SEC-FIRSTAID-LAB',
        defaultQuantity: 2,
        unit: 'حقيبة جدارية',
        estimatedPrice: 14500,
        description: 'ضمادات معقمة، مراهم حروق، بوفيدون يودي، شاش، مقص، وأشرطة لاصقة طبية.'
      },
      {
        name: 'محاليل ومحطة غسيل العيون المعقمة الجدارية (Lave-yeux de sécurité)',
        referenceCode: 'SEC-EYEWASH-WALL',
        defaultQuantity: 2,
        unit: 'محطة غسيل كاملة',
        estimatedPrice: 18000,
        description: 'عبوات محلول كلور الصوديوم 0.9% وحامل جداري للاستعمال الفوري عند تناثر المواد.'
      },
      {
        name: 'حاويات خاصة بجمع النفايات الكيميائية والمخلفات الحادة والمكسورة',
        referenceCode: 'SEC-WASTE-BINS',
        defaultQuantity: 4,
        unit: 'حاوية متخصصة',
        estimatedPrice: 3200,
        description: 'حاويات بلاستيكية مقاومة وموسومة بعلامات الخطر للزجاج المكسور والنفايات الخطرة.'
      }
    ]
  },
  {
    id: 'tpl-annual-replenishment',
    code: 'ANN-PACK-2026',
    title: 'الطلبية السنوية الشاملة لتجديد مستهلكات المخبر (Pack Annuel)',
    category: 'annual',
    categoryLabel: 'الطلبية السنوية الشاملة',
    iconName: 'PackageCheck',
    description: 'باقة نموذجية شاملة تجمع أهم السجلات (34.3 و 36.3 و 2.6.2)، الكواشف الكيميائية الأكثر طلباً، أنابيب الاختبار والبيشرات، ومستلزمات السلامة السنوية.',
    targetSubject: 'مشترك',
    suggestedSupplierType: 'المؤسسة الوطنية للتجهيزات والوسائل التعليمية / ممون شامل',
    items: [
      {
        name: 'سجل جرد المخبر العام (نموذج 34.3) + سجل الاستعمال (36.3)',
        referenceCode: 'REG-BUNDLE-01',
        defaultQuantity: 3,
        unit: 'سجل رسمي',
        estimatedPrice: 1600,
        description: 'سجلات رسمية لتنظيم المحاسبة المادية ومتابعة حصص الأساتذة.'
      },
      {
        name: 'بطاقات الجرد الفردية الكرتونية (نموذج 2.6.2)',
        referenceCode: 'Modèle 2.6.2',
        defaultQuantity: 100,
        unit: 'بطاقة',
        estimatedPrice: 35,
        description: 'لمتابعة وصيانة عتاد المخبر الجديد والموجود.'
      },
      {
        name: 'باقة كواشف الكيمياء والعلوم (فهلنك، ماء اليود، BBT، فينول فتالين)',
        referenceCode: 'CHEM-CORE-PACK',
        defaultQuantity: 1,
        unit: 'طقم متكامل',
        estimatedPrice: 12000,
        description: 'كواشف حيوية تغطي كافة تجارب منهاج السنة كاملة.'
      },
      {
        name: 'أحماض وأسس أساسية (HCl + H2SO4 + NaOH)',
        referenceCode: 'CHEM-ACID-BASE',
        defaultQuantity: 1,
        unit: 'طقم محاليل',
        estimatedPrice: 9500,
        description: 'عبوات مخبرية نقية للمعايرات وتحضير المحاليل المائية.'
      },
      {
        name: 'أنابيب اختبار زجاجية بوروسيليكات (علبتين 100 أنبوب)',
        referenceCode: 'GL-TUBE-PACK2',
        defaultQuantity: 2,
        unit: 'علبة (100 أنبوب)',
        estimatedPrice: 3200,
        description: 'لتعويض الاستهلاك والكسر السنوي خلال التجارب.'
      },
      {
        name: 'تشكيلة بيشرات مدرجة زجاجية (100، 250، 500 مل)',
        referenceCode: 'GL-BEAK-ASSORT',
        defaultQuantity: 15,
        unit: 'كأس بيشر',
        estimatedPrice: 450,
        description: 'تجديد مخزون الأواني الزجاجية الأساسية للعمل المخبري.'
      },
      {
        name: 'علب شرائح وسواتر مجهرية + أدوات تشريح جديدة',
        referenceCode: 'BIO-ANNUAL-SET',
        defaultQuantity: 4,
        unit: 'أطقم',
        estimatedPrice: 3800,
        description: 'مستلزمات حصص العلوم التجريبية والمجهرية للطورين.'
      },
      {
        name: 'علب قفازات نيتريل ونظارات واقية للطلبة',
        referenceCode: 'SEC-PACK-ANN',
        defaultQuantity: 6,
        unit: 'علب/نظارات',
        estimatedPrice: 1800,
        description: 'ضمان شروط الحماية الفردية داخل المخبر طوال الموسم الدراسي.'
      }
    ]
  }
];

export function getTemplateById(id: string): PurchaseOrderTemplate | undefined {
  return PURCHASE_ORDER_TEMPLATES.find(t => t.id === id);
}

export function calculateTemplateTotal(template: PurchaseOrderTemplate): number {
  return template.items.reduce((sum, item) => sum + (item.defaultQuantity * item.estimatedPrice), 0);
}
