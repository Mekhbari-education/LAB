import singleBeakerImg from '../assets/images/single_beaker_1795512915437.jpg';
import singleErlenmeyerImg from '../assets/images/single_erlenmeyer_1795512914663.jpg';
import singleGraduatedCylinderImg from '../assets/images/single_graduated_cylinder_1795512916535.jpg';
import singleVolumetricFlaskImg from '../assets/images/single_volumetric_flask_1795512915628.jpg';
import singleMohrBuretteImg from '../assets/images/single_mohr_burette_1795512918162.jpg';
import singleVolumetricPipetteImg from '../assets/images/single_volumetric_pipette_1795512917186.jpg';
import singleGraduatedPipetteImg from '../assets/images/single_graduated_pipette_1795512917639.jpg';
import singleTestTubeImg from '../assets/images/single_test_tube_1795512917508.jpg';
import singleRoundFlaskImg from '../assets/images/single_round_flask_1795512918226.jpg';
import singleStirringRodImg from '../assets/images/single_stirring_rod_1795512918612.jpg';
import singleSeparatoryFunnelImg from '../assets/images/single_separatory_funnel_1795512918672.jpg';
import singleLiebigCondenserImg from '../assets/images/single_liebig_condenser_1795512919260.jpg';
import singleFilterFunnelImg from '../assets/images/single_filter_funnel_1795512920099.jpg';
import singleWoulfeBottleImg from '../assets/images/single_woulfe_bottle_1795513043152.jpg';
import singlePetriDishImg from '../assets/images/single_petri_dish_1795513042757.jpg';
import singleWatchGlassImg from '../assets/images/single_watch_glass_1795513026995.jpg';
import singleDropperBottleImg from '../assets/images/single_dropper_bottle_1795512967907.jpg';
import singlePorcelainCrucibleImg from '../assets/images/single_porcelain_crucible_1795513043279.jpg';
import singleDesiccatorImg from '../assets/images/single_desiccator_1795514960766.jpg';
import singleAlcoholLampImg from '../assets/images/single_alcohol_lamp_1795514961855.jpg';
import singleMortarPestleImg from '../assets/images/single_mortar_pestle_1795514961194.jpg';
import singleCrystallizerImg from '../assets/images/single_crystallizer_1795514963145.jpg';
import singleBuchnerFunnelImg from '../assets/images/single_buchner_funnel_1795514963001.jpg';
import singleReagentBottleImg from '../assets/images/single_reagent_bottle_1795514964089.jpg';
import singleLabThermometerImg from '../assets/images/single_lab_thermometer_1795514962857.jpg';
import singleKippApparatusImg from '../assets/images/single_kipp_apparatus_1795514964548.jpg';
import singleMicroscopeSlidesImg from '../assets/images/single_microscope_slides_1795514964018.jpg';
import singleEvaporatingDishImg from '../assets/images/single_evaporating_dish_1795514964378.jpg';

export type GlasswareCategoryId =
  | 'heating_mixing'
  | 'volumetric_measuring'
  | 'titration_pipetting'
  | 'tubes_rods'
  | 'distillation_separation'
  | 'biology_containers';

export interface GlasswareCatalogTemplate {
  id: string;
  nameAr: string;
  designationFr: string;
  type: string;
  category: GlasswareCategoryId;
  categoryAr: string;
  image: string;
  material: string;
  capacities: string[];
  defaultCapacity: string;
  precisionClass: string;
  thermalResistance: string;
  primaryUses: string;
  careAndSafety: string;
  defaultUnit: string;
  defaultLocation: string;
  suggestedQuantity: number;
  keywords: string[];
}

export const GLASSWARE_CATEGORIES: Array<{ id: GlasswareCategoryId | 'all'; label: string }> = [
  { id: 'all', label: 'كل النماذج' },
  { id: 'heating_mixing', label: 'التسخين والخلط' },
  { id: 'volumetric_measuring', label: 'القياس والحجوم' },
  { id: 'titration_pipetting', label: 'المعايرة والسحب' },
  { id: 'tubes_rods', label: 'الأنابيب والقضبان' },
  { id: 'distillation_separation', label: 'التقطير والفصل' },
  { id: 'biology_containers', label: 'البيولوجيا والقطارات' },
];

export const GLASSWARE_CATALOG: GlasswareCatalogTemplate[] = [
  {
    id: 'beaker_pyrex',
    nameAr: 'بيشر مدرج بيريكس',
    designationFr: 'Bécher gradué en verre borosilicaté (Forme basse)',
    type: 'بيشر',
    category: 'heating_mixing',
    categoryAr: 'أواني التسخين والخلط',
    image: singleBeakerImg,
    material: 'زجاج البوروسيليكات 3.3 (Pyrex)',
    capacities: ['25 ml', '50 ml', '100 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '250 ml',
    precisionClass: 'تقريبي (±5% للتحضير والخلط)',
    thermalResistance: 'مقاوم للتسخين المباشر والصدمات الحرارية حتى 500°C',
    primaryUses: 'تحضير المحاليل، إذابة المواد الصلبة، التسخين على موقد أو صفيحة تسخين، وإجراء التفاعلات الكيميائية العامة.',
    careAndSafety: 'يُمنع تسخين البيشر وهو فارغ أو ملامسة قاعه الساخن لسطح مبلل بارد؛ يُغسل بفرشاة ناعمة ويُشطف بالماء المقطر.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الزجاجيات — الرف A1',
    suggestedQuantity: 10,
    keywords: ['بيشر', 'becher', 'bécher', 'beaker', 'كأس زجاجي'],
  },
  {
    id: 'erlenmeyer_flask',
    nameAr: 'حوجلة مخروطية (إرلنماير)',
    designationFr: 'Fiole d’Erlenmeyer graduée col étroit',
    type: 'حوجلة مخروطية',
    category: 'heating_mixing',
    categoryAr: 'أواني التسخين والخلط',
    image: singleErlenmeyerImg,
    material: 'زجاج البوروسيليكات 3.3 (Pyrex)',
    capacities: ['50 ml', '100 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '250 ml',
    precisionClass: 'تقريبي (±5% مع تدريجات بيضاء)',
    thermalResistance: 'مناسب للتسخين والارتداد البخاري حتى 500°C',
    primaryUses: 'المعايرة الحمضية القاعدية (يمنع تناثر القطرات أثناء الرج الدائري)، تسخين المحاليل المتطايرة، وحفظ الأوساط الزرعية.',
    careAndSafety: 'يُرج دائرياً برفق أثناء المعايرة؛ تُغلق بسدادة مطاطية أو بارافيلم عند الحفظ المؤقت فقط بدون تسخين.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الزجاجيات — الرف A2',
    suggestedQuantity: 8,
    keywords: ['إرلنماير', 'ارلنماير', 'مخروطية', 'erlenmeyer', 'fiole conique'],
  },
  {
    id: 'graduated_cylinder',
    nameAr: 'مخبار مدرج بقاعدة سداسية',
    designationFr: 'Éprouvette graduée sur pied hexagonal',
    type: 'مخبار مدرج',
    category: 'volumetric_measuring',
    categoryAr: 'أدوات القياس والحجوم',
    image: singleGraduatedCylinderImg,
    material: 'زجاج البوروسيليكات 3.3 بدرجات زرقاء',
    capacities: ['10 ml', '25 ml', '50 ml', '100 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '100 ml',
    precisionClass: 'Class A / B (دقة قراءة متوسطة وعالية)',
    thermalResistance: 'غير مخصص للتسخين المباشر (الحد الأقصى للغسيل 60°C للحفاظ على المعايرة)',
    primaryUses: 'قياس حجوم السوائل بدقة أكبر من البيشر، تعيين حجم الأجسام الصلبة غير المنتظمة بطريقة الغمر.',
    careAndSafety: 'تُقرأ القيمة عند أسفل الهلال السطحي (Ménisque) على مستوى العين أفقياً؛ يُحفظ واقفاً بقاعدته داخل رف محمي.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة القياسات — الرف B1',
    suggestedQuantity: 8,
    keywords: ['مخبار', 'مدرج', 'eprouvette', 'éprouvette', 'cylinder'],
  },
  {
    id: 'volumetric_flask',
    nameAr: 'حوجلة عيارية بسدادة (ذات معيار)',
    designationFr: 'Fiole jaugée Classe A avec bouchon rodé',
    type: 'دورق عياري',
    category: 'volumetric_measuring',
    categoryAr: 'أدوات القياس والحجوم',
    image: singleVolumetricFlaskImg,
    material: 'زجاج البوروسيليكات المصنفر مع سدادة PE/زجاجية',
    capacities: ['25 ml', '50 ml', '100 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '100 ml',
    precisionClass: 'Class A (±0.10 ml عند 20°C)',
    thermalResistance: 'يُمنع تسخينها تماماً لأن التمدد الحراري يفسد عيار الحجم الدقيق',
    primaryUses: 'تحضير المحاليل القياسية ذات التركيز المولي الدقيق، وعمليات التمديد الكيميائي المعاير.',
    careAndSafety: 'لا تُسخّن ولا تُجفف في الفرن الحراري؛ تُقلب عدة مرات مع الإمساك بالسدادة لمجانسة التركيز.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة القياسات — الرف B2',
    suggestedQuantity: 6,
    keywords: ['عيارية', 'بمعيار', 'fiole jaugée', 'fiole jaugee', 'volumetric'],
  },
  {
    id: 'burette_mohr',
    nameAr: 'سحاحة مدرجة بحنفية للمعايرة',
    designationFr: 'Burette graduée de Mohr avec robinet PTFE',
    type: 'سحاحة',
    category: 'titration_pipetting',
    categoryAr: 'أدوات المعايرة والسحب',
    image: singleMohrBuretteImg,
    material: 'زجاج بوروسيليكات + حنفية PTFE مقاومة للأحماض والأسس',
    capacities: ['10 ml', '25 ml', '50 ml'],
    defaultCapacity: '25 ml',
    precisionClass: 'Class A (±0.05 ml)',
    thermalResistance: 'تُستخدم في درجة حرارة المخبر الاعتيادية (20°C)',
    primaryUses: 'المعايرة اللونية والناقلة والـ pH-مترية، إضافة الحجوم قطرة بقطرة حتى نقطة التكافؤ.',
    careAndSafety: 'تُغسل بالمحلول المعاير قبل التعبئة، يُفرغ الصنبور من فقاعات الهواء، وتُشطف بالماء المقطر فوراً بعد القلويات لتجنب انسداد الصنبور.',
    defaultUnit: 'قطعة',
    defaultLocation: 'حامل السحاحات الرأسي — الرف C1',
    suggestedQuantity: 6,
    keywords: ['سحاحة', 'موهر', 'burette', 'mohr', 'حنفية'],
  },
  {
    id: 'volumetric_pipette',
    nameAr: 'ماصة عيارية (بخط أو خطي عيار)',
    designationFr: 'Pipette jaugée à 1 ou 2 traits (Classe A)',
    type: 'ماصة عيارية',
    category: 'titration_pipetting',
    categoryAr: 'أدوات المعايرة والسحب',
    image: singleVolumetricPipetteImg,
    material: 'زجاج البوروسيليكات المقوى عند الفوهة',
    capacities: ['1 ml', '2 ml', '5 ml', '10 ml', '20 ml', '25 ml'],
    defaultCapacity: '10 ml',
    precisionClass: 'Class A (±0.02 ml)',
    thermalResistance: 'تُستخدم في درجة حرارة المخبر (20°C) ولا تُسخّن',
    primaryUses: 'أخذ حجم ثابت ومضبوط بدقة متناهية من المحلول الأم لتحضير التمديدات أو المعايرة.',
    careAndSafety: 'يُمنع السحب بالفم منعاً باتاً؛ يجب استعمال إجاصة السحب (Propippette) دائماً.',
    defaultUnit: 'قطعة',
    defaultLocation: 'درج الماصات الأفقي — الرف C2',
    suggestedQuantity: 10,
    keywords: ['ماصة', 'عيارية', 'pipette', 'jaugée', 'jaugee', 'بخطين'],
  },
  {
    id: 'graduated_pipette',
    nameAr: 'ماصة مدرجة دقيقة',
    designationFr: 'Pipette graduée en verre (0.1 ml div.)',
    type: 'ماصة مدرجة',
    category: 'titration_pipetting',
    categoryAr: 'أدوات المعايرة والسحب',
    image: singleGraduatedPipetteImg,
    material: 'زجاج البوروسيليكات الشفاف',
    capacities: ['1 ml', '2 ml', '5 ml', '10 ml', '20 ml', '25 ml'],
    defaultCapacity: '10 ml',
    precisionClass: 'Class A (±0.05 ml)',
    thermalResistance: 'درجة حرارة الغرفة (20°C)',
    primaryUses: 'قياس ونقل حجوم متغيرة وصغيرة من السوائل والكواشف في التجارب الكيميائية والبيولوجية.',
    careAndSafety: 'تُستخدم مع إجاصة السحب فقط؛ تُحفظ في وضع أفقي مبطن لحماية الطرف المدبب من الكسر.',
    defaultUnit: 'قطعة',
    defaultLocation: 'درج الماصات الأفقي — الرف C2',
    suggestedQuantity: 12,
    keywords: ['ماصة مدرجة', 'pipette graduée', 'pipettes'],
  },
  {
    id: 'test_tubes_pyrex',
    nameAr: 'أنابيب اختبار بيريكس',
    designationFr: 'Tubes à essais en verre Pyrex 18×180 mm',
    type: 'أنبوب اختبار',
    category: 'tubes_rods',
    categoryAr: 'الأنابيب والقضبان',
    image: singleTestTubeImg,
    material: 'زجاج البوروسيليكات الحراري 3.3',
    capacities: ['12×100 mm', '16×160 mm', '18×180 mm (30 ml)', '20×200 mm'],
    defaultCapacity: '18×180 mm',
    precisionClass: 'أنابيب تفاعل قياسية بحافة مدورة',
    thermalResistance: 'مقاومة ممتازة للهب المباشر حتى 500°C عند الإمساك بملقط خشبي',
    primaryUses: 'إجراء اختبارات الكشف عن الشوارد، تسخين كميات صغيرة من المحاليل، ومراقبة التفاعلات السريعة والترسبات.',
    careAndSafety: 'عند التسخين، تُوجّه فوهة الأنبوب بعيداً عن الوجوه بزاوية 45°، وتُوضع في حامل أنابيب بعد التبريد.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الأنابيب — الرف D1',
    suggestedQuantity: 50,
    keywords: ['أنبوب', 'انابيب', 'اختبار', 'tubes à essais', 'tube', 'pyrex'],
  },
  {
    id: 'round_bottom_flask',
    nameAr: 'حوجلة كروية القاع للتسخين والتقطير',
    designationFr: 'Ballon à fond rond col court (Verre Pyrex)',
    type: 'حوجلة كروية',
    category: 'heating_mixing',
    categoryAr: 'أواني التسخين والخلط',
    image: singleRoundFlaskImg,
    material: 'زجاج البوروسيليكات المقوى ذو سمك منتظم',
    capacities: ['100 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '250 ml',
    precisionClass: 'تصميم كروي لتوزيع الحرارة بالتساوي',
    thermalResistance: 'مثالي للتسخين في حاضنة التسخين (Chauffe-ballon) أو التقطير تحت الارتداد',
    primaryUses: 'تركيبات التصنيع العضوي (الأسترة، التصبن)، عمليات التقطير البسيط والجزئي، والغليان المنتظم.',
    careAndSafety: 'تُثبّت دائماً بماسك ومقبض معدني على الحامل، وتُضاف حبات الخفان لتنظيم الغليان.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الزجاجيات — الرف A3',
    suggestedQuantity: 4,
    keywords: ['كروية', 'حوجلة كروية', 'ballon', 'fond rond'],
  },
  {
    id: 'glass_stirring_rod',
    nameAr: 'قضبان زجاجية للتحريك',
    designationFr: 'Agitateur / Baguette en verre plein Ø 6 mm',
    type: 'قضيب زجاجي',
    category: 'tubes_rods',
    categoryAr: 'الأنابيب والقضبان',
    image: singleStirringRodImg,
    material: 'زجاج صلب مصقول الأطراف بالنار',
    capacities: ['200×6 mm', '250×6 mm', '300×8 mm'],
    defaultCapacity: '250×6 mm',
    precisionClass: 'أطراف ملساء غير حادة',
    thermalResistance: 'مقاوم للحرارة والأحماض المركزة',
    primaryUses: 'تحريك ومجانسة المحاليل، وتوجيه السائل أثناء الصب لمنع تناثره عند الترشيح.',
    careAndSafety: 'يُمنع استعمال مقياس الحرارة بديلاً لقضيب التحريك؛ يُخزن في علبة أفقية مبطنة.',
    defaultUnit: 'قطعة',
    defaultLocation: 'درج الأدوات المساعدة — D2',
    suggestedQuantity: 15,
    keywords: ['قضيب', 'قضبان', 'تحريك', 'baguette', 'agitateur'],
  },
  {
    id: 'separatory_funnel',
    nameAr: 'حباب الإبانة (قمع الفصل)',
    designationFr: 'Ampoule à décanter piriforme avec robinet',
    type: 'قمع فصل',
    category: 'distillation_separation',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleSeparatoryFunnelImg,
    material: 'زجاج البوروسيليكات + صنبور PTFE وسدادة مصنفرة',
    capacities: ['125 ml', '250 ml', '500 ml', '1000 ml'],
    defaultCapacity: '250 ml',
    precisionClass: 'مدرج لتقدير حجم الأطوار السائلة',
    thermalResistance: 'درجة حرارة الغرفة (بدون تسخين)',
    primaryUses: 'فصل السوائل غير الممتزجة (ماء/زيت أو الاستخلاص بالمذيبات العضوية) في دروس الكيمياء العضوية والفيزياء.',
    careAndSafety: 'أثناء الرج يجب تنفيس الضغط بفتح الصنبور للأعلى دورياً؛ تُرفع السدادة العلوية عند التفريغ.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الفصل والتقطير — الرف E1',
    suggestedQuantity: 4,
    keywords: ['إبانة', 'ابانه', 'فصل', 'ampoule', 'décanter', 'decanter'],
  },
  {
    id: 'liebig_condenser',
    nameAr: 'مكثف ليبيق للتقطير (مبرد)',
    designationFr: 'Réfrigérant droit de Liebig à rodage normalisé',
    type: 'مكثف تقطير',
    category: 'distillation_separation',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleLiebigCondenserImg,
    material: 'زجاج البوروسيليكات مزدوج الغلاف',
    capacities: ['250 mm', '300 mm', '400 mm'],
    defaultCapacity: '250 mm',
    precisionClass: 'وصلات مصنفرة قياسية (19/26 أو 29/32)',
    thermalResistance: 'مقاوم لتدفق الأبخرة الساخنة والماء البارد',
    primaryUses: 'تكثيف الأبخرة أثناء التقطير البسيط والتقطير المائي للزيوت العطرية وتجارب الارتداد.',
    careAndSafety: 'يدخل ماء التبريد دائماً من الفوهة السفلى ويخرج من العليا لضمان امتلاء الغلاف؛ تُشحّم الوصلات المصنفرة بانتظام.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الفصل والتقطير — الرف E2',
    suggestedQuantity: 3,
    keywords: ['مكثف', 'مبرد', 'ليبيق', 'تبريد', 'réfrigérant', 'refrigerant', 'liebig'],
  },
  {
    id: 'filter_funnel',
    nameAr: 'قمع ترشيح زجاجي',
    designationFr: 'Entonnoir analytique en verre tige courte/longue',
    type: 'قمع',
    category: 'distillation_separation',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleFilterFunnelImg,
    material: 'زجاج البوروسيليكات زاوية 60°',
    capacities: ['Ø 60 mm', 'Ø 75 mm', 'Ø 100 mm'],
    defaultCapacity: 'Ø 75 mm',
    precisionClass: 'زاوية مخروطية قياسية 60° لورق الترشيح',
    thermalResistance: 'يتحمل المحاليل الدافئة والأحماض',
    primaryUses: 'فصل الرواسب الصلبة عن المحاليل باستخدام ورق الترشيح، ونقل السوائل والمساحيق إلى الدورق العياري.',
    careAndSafety: 'يُغسل مباشرة بعد ترشيح الرواسب ويوضع على حامل الأقماع عند التشغيل.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الفصل والتقطير — الرف E1',
    suggestedQuantity: 8,
    keywords: ['قمع', 'ترشيح', 'entonnoir', 'funnel'],
  },
  {
    id: 'woulfe_bottle',
    nameAr: 'قارورة وولف بفتحتين (توليد الغازات)',
    designationFr: 'Flacon de Woulfe à 2 ou 3 tubulures en verre',
    type: 'قارورة وولف',
    category: 'distillation_separation',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleWoulfeBottleImg,
    material: 'زجاج سميك مقاوم للضغط المنخفض',
    capacities: ['250 ml', '500 ml'],
    defaultCapacity: '500 ml',
    precisionClass: 'فتحات قياسية للسدادات المثقوبة',
    thermalResistance: 'استخدام في درجة حرارة الغرفة أو تسخين لطيف',
    primaryUses: 'توليد وغسل الغازات المخبرية (ثنائي أكسيد الكربون، ثنائي الهيدروجين) وتجارب الفصل.',
    careAndSafety: 'فحص الشقوق الدقيقة قبل كل تجربة توليد غاز والتأكد من إحكام السدادات والأنابيب الموصولة.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة الفصل والتقطير — الرف E3',
    suggestedQuantity: 3,
    keywords: ['وولف', 'woulfe', 'wolf', 'tubulures'],
  },
  {
    id: 'petri_dish',
    nameAr: 'علب بيتري زجاجية',
    designationFr: 'Boîte de Petri en verre borosilicaté Ø 90 mm',
    type: 'علب بيتري',
    category: 'biology_containers',
    categoryAr: 'البيولوجيا والقطارات',
    image: singlePetriDishImg,
    material: 'زجاج البوروسيليكات القابل للتعقيم بالفرن/الأوتوكلاف',
    capacities: ['Ø 80×15 mm', 'Ø 90×15 mm', 'Ø 100×20 mm'],
    defaultCapacity: 'Ø 90 mm',
    precisionClass: 'سطح مستوٍ شفاف للملاحظة المجهرية',
    thermalResistance: 'تتحمل التعقيم الحراري الجاف حتى 180°C والبخاري 121°C',
    primaryUses: 'زرع المستعمرات البكتيرية والفطرية، إنبات البذور، وعرض العينات البيولوجية والمعدنية.',
    careAndSafety: 'تُعقم قبل وبعد التجارب الميكروبيولوجية؛ تُحفظ أزواج القاعدة والغطاء معاً لتفادي الخدوش.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة علوم الطبيعة والحياة — الرف F1',
    suggestedQuantity: 12,
    keywords: ['بيتري', 'بيتر', 'petri', 'علب'],
  },
  {
    id: 'watch_glass',
    nameAr: 'زجاجة ساعة',
    designationFr: 'Verre de montre concave Ø 80 mm',
    type: 'زجاجة ساعة',
    category: 'biology_containers',
    categoryAr: 'البيولوجيا والقطارات',
    image: singleWatchGlassImg,
    material: 'زجاج مصقول الحواف عالي النقاء',
    capacities: ['Ø 60 mm', 'Ø 80 mm', 'Ø 100 mm'],
    defaultCapacity: 'Ø 80 mm',
    precisionClass: 'تقعّر منتظم لوزن وتبخير العينات',
    thermalResistance: 'مقاومة للتسخين غير المباشر على حمام مائي',
    primaryUses: 'وزن المواد الكيميائية الصلبة على الميزان الإلكتروني، تغطية البيشر، وتبخير قطرات المحاليل لملاحظة البلورات.',
    careAndSafety: 'لا توضع مباشرة فوق اللهب المكشوف؛ تُمسح بورق ناعم خالٍ من الوبر قبل الوزن.',
    defaultUnit: 'قطعة',
    defaultLocation: 'درج أدوات الوزن والملاحظة — F2',
    suggestedQuantity: 10,
    keywords: ['ساعة', 'زجاجة ساعة', 'verre de montre', 'watch glass'],
  },
  {
    id: 'dropper_bottle',
    nameAr: 'قارورة تقطير كاشف (عادي / عسلي)',
    designationFr: 'Flacon compte-gouttes en verre avec pipette intégrée',
    type: 'قارورة تقطير',
    category: 'biology_containers',
    categoryAr: 'البيولوجيا والقطارات',
    image: singleDropperBottleImg,
    material: 'زجاج شفاف أو زجاج عسلي واقٍ من الأشعة فوق البنفسجية',
    capacities: ['30 ml', '60 ml', '125 ml'],
    defaultCapacity: '125 ml',
    precisionClass: 'رأس قطارة قياسي معاير',
    thermalResistance: 'حفظ في درجة حرارة الغرفة بعيداً عن أشعة الشمس',
    primaryUses: 'تخزين وصرف الكواشف الملونة والمشعرات (أزرق البروموثيمول، الفينولفتالين، ماء اليود، نترات الفضة بالزجاج العسلي).',
    careAndSafety: 'يُلصق اسم الكاشف ورمز الخطر GHS على القارورة؛ تُغسل القطارة المطاطية وتُبدل عند تلفها.',
    defaultUnit: 'قطعة',
    defaultLocation: 'رفوف الكواشف الجاهزة — الرف F3',
    suggestedQuantity: 12,
    keywords: ['قطارة', 'تقطير', 'قارورة', 'compte gouttes', 'compte-gouttes', 'flacon', 'dropper'],
  },
  {
    id: 'porcelain_crucible',
    nameAr: 'جفنة خزفية بغطاء للتسخين الشديد',
    designationFr: 'Creuset en porcelaine réfractaire avec couvercle',
    type: 'جفنة خزفية',
    category: 'biology_containers',
    categoryAr: 'البيولوجيا والقطارات',
    image: singlePorcelainCrucibleImg,
    material: 'خزف مخبري مزجج مقاوم للحرارة العالية',
    capacities: ['25 ml', '30 ml', '50 ml'],
    defaultCapacity: '30 ml',
    precisionClass: 'خزف حراري قياسي',
    thermalResistance: 'يتحمل درجات حرارة قصوى حتى 1100°C في موقد بنزن أو فرن الترميد',
    primaryUses: 'حرق وترميـد العينات الصلبة، تسخين الأملاح المائية لنزع ماء التبلور، وصهر بعض المواد.',
    careAndSafety: 'تُمسك بملقط معدني خاص وتُبرّد داخل مجفف (Dessiccateur) قبل وزنها؛ يُمنع غسلها وهي ساخنة.',
    defaultUnit: 'قطعة',
    defaultLocation: 'خزانة التسخين — الرف A4',
    suggestedQuantity: 6,
    keywords: ['جفنة', 'بوتقة', 'خزف', 'creuset', 'porcelaine', 'crucible'],
  },
];

export function findGlasswareCatalogMatch(
  nameAr?: string,
  designationFr?: string,
  type?: string
): GlasswareCatalogTemplate {
  const haystack = `${nameAr || ''} ${designationFr || ''} ${type || ''}`.toLowerCase();

  for (const item of GLASSWARE_CATALOG) {
    if (
      item.keywords.some(k => haystack.includes(k.toLowerCase())) ||
      haystack.includes(item.nameAr.toLowerCase()) ||
      haystack.includes(item.type.toLowerCase())
    ) {
      return item;
    }
  }

  // Fallback by rough French/Arabic words
  if (haystack.includes('verre') || haystack.includes('كأس')) {
    return GLASSWARE_CATALOG[0];
  }
  return GLASSWARE_CATALOG[0];
}

export interface GlasswareQuickFillModel {
  id: string;
  nameAr: string;
  designationFr: string;
  capacity: string;
  type: string;
  categoryAr: string;
  image: string;
  unit: string;
  location: string;
  suggestedQuantity: number;
  notes: string;
}

interface ExtraGlasswareSpec {
  id: string;
  nameAr: string;
  designationFr: string;
  type: string;
  categoryAr: string;
  image: string;
  capacities: string[];
  unit: string;
  location: string;
  suggestedQuantity: number;
  notes: string;
  keywords: string[];
}

const EXTRA_GLASSWARE_SPECS: ExtraGlasswareSpec[] = [
  {
    id: 'flat_bottom_flask',
    nameAr: 'حوجلة مسطحة القاع',
    designationFr: 'Ballon à fond plat en verre borosilicaté',
    type: 'حوجلة مسطحة القاع',
    categoryAr: 'أواني التسخين والخلط',
    image: singleRoundFlaskImg,
    capacities: ['100 ml', '250 ml', '500 ml', '1000 ml'],
    unit: 'قطعة',
    location: 'خزانة الزجاجيات — الرف A3',
    suggestedQuantity: 6,
    notes: 'زجاج البوروسيليكات 3.3؛ تُستعمل لحفظ وغلي المحاليل مع إمكانية وضعها مباشرة على الطاولة.',
    keywords: ['مسطحة القاع', 'fond plat'],
  },
  {
    id: 'distillation_flask_side_arm',
    nameAr: 'حوجلة تقطير بذراع جانبي',
    designationFr: 'Ballon à distiller à tubulure latérale (Pyrex)',
    type: 'حوجلة تقطير',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleRoundFlaskImg,
    capacities: ['250 ml', '500 ml'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E2',
    suggestedQuantity: 3,
    notes: 'تُثبّت بماسك على الحامل وتوصل بالمكثف عبر الذراع الجانبي مع استعمال حبات الخفان.',
    keywords: ['حوجلة تقطير', 'ذراع جانبي', 'ballon à distiller'],
  },
  {
    id: 'buchner_vacuum_flask',
    nameAr: 'حوجلة الترشيح بالشفط (تحت الفراغ)',
    designationFr: 'Fiole à vide / Erlenmeyer à tubulure latérale',
    type: 'حوجلة ترشيح بالشفط',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleErlenmeyerImg,
    capacities: ['250 ml', '500 ml', '1000 ml'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E1',
    suggestedQuantity: 4,
    notes: 'زجاج سميك مقاوم للضغط المنخفض؛ تُستعمل مع قمع بوخنر ومضخة الشفط المائية.',
    keywords: ['ترشيح بالشفط', 'تحت الفراغ', 'fiole à vide', 'fiole a vide'],
  },
  {
    id: 'buchner_funnel_porcelain',
    nameAr: 'قمع بوخنر خزفي للترشيح بالشفط',
    designationFr: 'Entonnoir Büchner en porcelaine perforée',
    type: 'قمع بوخنر',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleBuchnerFunnelImg,
    capacities: ['Ø 70 mm', 'Ø 90 mm', 'Ø 110 mm'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E1',
    suggestedQuantity: 4,
    notes: 'يوضع قرص ورق الترشيح مطابقاً لقطر القمع مع حلقة مطاطية محكمة فوق حوجلة الفراغ.',
    keywords: ['بوخنر', 'büchner', 'buchner'],
  },
  {
    id: 'allihn_condenser',
    nameAr: 'مكثف كروي للارتداد (أليهن)',
    designationFr: 'Réfrigérant à boules d’Allihn à rodage normalisé',
    type: 'مكثف كروي',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleLiebigCondenserImg,
    capacities: ['300 mm', '400 mm'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E2',
    suggestedQuantity: 3,
    notes: 'مخصص للتسخين بالارتداد (Reflux) في الكيمياء العضوية؛ يدخل ماء التبريد من الأسفل ويخرج من الأعلى.',
    keywords: ['مكثف كروي', 'أليهن', 'allihn', 'à boules'],
  },
  {
    id: 'drechsel_gas_wash_bottle',
    nameAr: 'قارورة غسل الغازات (دريشل)',
    designationFr: 'Flacon laveur de gaz de Drechsel en verre',
    type: 'قارورة غسل غازات',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleWoulfeBottleImg,
    capacities: ['250 ml', '500 ml'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E3',
    suggestedQuantity: 3,
    notes: 'لتنقية الغازات أو الكشف عنها عبر تمريرها داخل محلول كاشف؛ يُراعى اتجاه الدخول والخروج.',
    keywords: ['دريشل', 'غسل الغازات', 'drechsel', 'laveur de gaz'],
  },
  {
    id: 'kipp_gas_generator',
    nameAr: 'جهاز كيب لتوليد الغازات',
    designationFr: 'Appareil de Kipp en verre borosilicaté',
    type: 'جهاز كيب',
    categoryAr: 'أدوات التقطير والفصل',
    image: singleKippApparatusImg,
    capacities: ['500 ml', '1000 ml'],
    unit: 'قطعة',
    location: 'خزانة الفصل والتقطير — الرف E3',
    suggestedQuantity: 2,
    notes: 'تُشحّم الوصلات المصنفرة جيداً وتُفحص السدادات قبل تحضير غازات H2 أو CO2.',
    keywords: ['كيب', 'kipp'],
  },
  {
    id: 'crystallizer_dish',
    nameAr: 'حوض التبلور الزجاجي',
    designationFr: 'Cristallisoir en verre borosilicaté sans/avec bec',
    type: 'حوض تبلور',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleCrystallizerImg,
    capacities: ['250 ml (Ø 95 mm)', '500 ml (Ø 115 mm)', '1000 ml (Ø 140 mm)'],
    unit: 'قطعة',
    location: 'خزانة الزجاجيات — الرف B3',
    suggestedQuantity: 6,
    notes: 'يُستعمل لتبلور الأملاح وتحضير الحمامات المائية والتجارب الكهربائية والكيميائية.',
    keywords: ['تبلور', 'cristallisoir'],
  },
  {
    id: 'glass_desiccator',
    nameAr: 'مجفف زجاجي بغطاء وصفيحة خزفية',
    designationFr: 'Dessiccateur en verre avec plaque en porcelaine',
    type: 'مجفف زجاجي',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleDesiccatorImg,
    capacities: ['Ø 150 mm', 'Ø 200 mm', 'Ø 250 mm'],
    unit: 'قطعة',
    location: 'خزانة الحفظ الجاف — الرف B4',
    suggestedQuantity: 2,
    notes: 'تُشحّم حافة الغطاء بالفازلين السيليكوني ويُفتح الغطاء بالانزلاق الأفقي لا بالرفع العمودي.',
    keywords: ['مجفف', 'dessiccateur', 'desiccator'],
  },
  {
    id: 'glass_water_trough',
    nameAr: 'حوض زجاجي للتجارب (تجميع الغازات / البصريات)',
    designationFr: 'Cuve en verre à parois parallèles',
    type: 'حوض زجاجي',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleCrystallizerImg,
    capacities: ['سعة 2 L', 'سعة 4 L'],
    unit: 'قطعة',
    location: 'خزانة الزجاجيات — الرف B4',
    suggestedQuantity: 4,
    notes: 'يُحمل من القاعدة بكلتا اليدين ويُفرغ ويجفف بعد تجارب جمع الغازات بالإزاحة المائية.',
    keywords: ['حوض زجاجي', 'cuve en verre'],
  },
  {
    id: 'reagent_bottle_clear',
    nameAr: 'قارورة حفظ الكواشف بسدادة مصنفرة (شفافة)',
    designationFr: 'Flacon de réactif en verre clair à bouchon rodé',
    type: 'قارورة كواشف',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleReagentBottleImg,
    capacities: ['125 ml', '250 ml', '500 ml', '1000 ml'],
    unit: 'قطعة',
    location: 'رفوف الكواشف الجاهزة — الرف F3',
    suggestedQuantity: 10,
    notes: 'يُلصق ملصق اسم المحلول وتركيزه وتاريخ التحضير ورمز الخطر GHS بشكل واضح.',
    keywords: ['قارورة حفظ', 'قارورة كواشف', 'flacon de réactif', 'bouchon rodé'],
  },
  {
    id: 'reagent_bottle_amber',
    nameAr: 'قارورة حفظ الكواشف بسدادة مصنفرة (عسلية معتمة)',
    designationFr: 'Flacon de réactif en verre ambré à bouchon rodé',
    type: 'قارورة كواشف عسلية',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleReagentBottleImg,
    capacities: ['125 ml', '250 ml', '500 ml', '1000 ml'],
    unit: 'قطعة',
    location: 'رفوف الكواشف الحساسة للضوء — الرف F3',
    suggestedQuantity: 10,
    notes: 'مخصصة لحفظ المحاليل الحساسة للضوء مثل نترات الفضة وماء اليود وبرمنغنات البوتاسيوم.',
    keywords: ['عسلية', 'معتمة', 'ambré', 'ambre'],
  },
  {
    id: 'pycnometer_glass',
    nameAr: 'بكنومتر زجاجي لقياس الكتلة الحجمية',
    designationFr: 'Pycnomètre en verre calibré avec bouchon capillaire',
    type: 'بكنومتر',
    categoryAr: 'أدوات القياس والحجوم',
    image: singleVolumetricFlaskImg,
    capacities: ['25 ml', '50 ml'],
    unit: 'قطعة',
    location: 'خزانة القياسات — الرف B2',
    suggestedQuantity: 4,
    notes: 'أداة دقيقة لتعيين الكتلة الحجمية والكثافة للسوائل؛ يُجفف خارجياً بمنديل قبل الوزن.',
    keywords: ['بكنومتر', 'pycnomètre', 'pycnometer'],
  },
  {
    id: 'weighing_bottle_glass',
    nameAr: 'قنينة وزن زجاجية بسدادة مصنفرة',
    designationFr: 'Flacon à peser (Pèse-filtre) à bouchon rodé',
    type: 'قنينة وزن',
    categoryAr: 'أدوات القياس والحجوم',
    image: singleReagentBottleImg,
    capacities: ['30 ml', '50 ml'],
    unit: 'قطعة',
    location: 'درج أدوات الوزن والملاحظة — F2',
    suggestedQuantity: 6,
    notes: 'لوزن المواد الماصة للرطوبة أو المتطايرة بدقة على الميزان التحليلي.',
    keywords: ['قنينة وزن', 'flacon à peser', 'pèse-filtre'],
  },
  {
    id: 'lab_glass_thermometer',
    nameAr: 'مقياس حرارة مخبري زجاجي',
    designationFr: 'Thermomètre de laboratoire en verre gradué',
    type: 'مقياس حرارة زجاجي',
    categoryAr: 'أدوات القياس والحجوم',
    image: singleLabThermometerImg,
    capacities: ['-10°C إلى +110°C', '-10°C إلى +250°C'],
    unit: 'قطعة',
    location: 'درج أدوات القياس — B3',
    suggestedQuantity: 10,
    notes: 'يُمنع استعماله للتحريك؛ يُحفظ في غلافه الواقي أفقياً بعيداً عن الصدمات.',
    keywords: ['مقياس حرارة', 'محرار', 'thermomètre', 'thermometer'],
  },
  {
    id: 'side_arm_test_tube',
    nameAr: 'أنبوب اختبار بذراع جانبي لتوليد الغازات',
    designationFr: 'Tube à essais à dégagement latéral (Pyrex)',
    type: 'أنبوب اختبار جانبي',
    categoryAr: 'الأنابيب والقضبان',
    image: singleTestTubeImg,
    capacities: ['18×180 mm', '20×200 mm'],
    unit: 'قطعة',
    location: 'خزانة الأنابيب — الرف D1',
    suggestedQuantity: 12,
    notes: 'لتوليد وتمرير الغازات عبر أنبوب توصيل مطاطي؛ يُثبت بملقط خشبي أو حامل معدني.',
    keywords: ['أنبوب اختبار جانبي', 'dégagement latéral'],
  },
  {
    id: 'pasteur_pipette_glass',
    nameAr: 'ماصة باستور زجاجية (قطارة دقيقة)',
    designationFr: 'Pipette Pasteur en verre étiré',
    type: 'ماصة باستور',
    categoryAr: 'أدوات المعايرة والسحب',
    image: singleGraduatedPipetteImg,
    capacities: ['150 mm', '230 mm'],
    unit: 'قطعة',
    location: 'درج الماصات الأفقي — الرف C2',
    suggestedQuantity: 25,
    notes: 'تُستعمل لنقل القطرات الدقيقة وتغذية المزارع البيولوجية؛ تُركب عليها حلمة مطاطية.',
    keywords: ['باستور', 'pasteur'],
  },
  {
    id: 'thistle_safety_funnel',
    nameAr: 'أنبوب أمان بقمع طويل (لتوليد الغازات)',
    designationFr: 'Tube à entonnoir / Tube de sûreté en verre',
    type: 'أنبوب أمان',
    categoryAr: 'الأنابيب والقضبان',
    image: singleFilterFunnelImg,
    capacities: ['300 mm'],
    unit: 'قطعة',
    location: 'درج الأدوات المساعدة — D2',
    suggestedQuantity: 6,
    notes: 'يُغمر طرفه السفلي في السائل داخل القارورة لمنع تسرب الغاز وضبط الضغط.',
    keywords: ['أنبوب أمان', 'tube à entonnoir', 'sûreté'],
  },
  {
    id: 'bent_glass_delivery_tubes',
    nameAr: 'أنابيب توصيل زجاجية مثنية بزاوية',
    designationFr: 'Tubes de dégagement coudés en verre (Ø 6-8 mm)',
    type: 'أنبوب توصيل زجاجي',
    categoryAr: 'الأنابيب والقضبان',
    image: singleStirringRodImg,
    capacities: ['زاوية 90°', 'حرف U'],
    unit: 'قطعة',
    location: 'درج الأدوات المساعدة — D2',
    suggestedQuantity: 15,
    notes: 'تُرطب أو تُدهن بالجليسرول عند إدخالها في السدادات المطاطية المثقوبة لتفادي الكسر.',
    keywords: ['أنبوب توصيل', 'أنابيب توصيل', 'coudés', 'dégagement'],
  },
  {
    id: 'glass_alcohol_lamp',
    nameAr: 'مصباح كحولي زجاجي بفتيل وغطاء',
    designationFr: 'Lampe à alcool en verre avec mèche et capuchon',
    type: 'مصباح كحولي',
    categoryAr: 'أواني التسخين والخلط',
    image: singleAlcoholLampImg,
    capacities: ['100 ml', '150 ml', '250 ml'],
    unit: 'قطعة',
    location: 'خزانة التسخين — الرف A4',
    suggestedQuantity: 8,
    notes: 'يُملأ بالكحول الإيثيلي حتى ثلثيه فقط ويُطفأ بالغطاء المخصص دون نفخ.',
    keywords: ['مصباح كحولي', 'lampe à alcool', 'alcohol lamp'],
  },
  {
    id: 'porcelain_evaporating_dish',
    nameAr: 'جفنة تبخير خزفية بفوهة صب',
    designationFr: 'Capsule d’évaporation en porcelaine à fond plat/rond',
    type: 'جفنة تبخير',
    categoryAr: 'أواني التسخين والخلط',
    image: singleEvaporatingDishImg,
    capacities: ['50 ml', '100 ml', '150 ml'],
    unit: 'قطعة',
    location: 'خزانة التسخين — الرف A4',
    suggestedQuantity: 8,
    notes: 'لتبخير المحاليل والحصول على البلورات الجافة؛ تُمسك بملقط وتُترك لتبرد قبل الغسل.',
    keywords: ['جفنة تبخير', 'تبخير', 'capsule', 'évaporation', 'evaporating'],
  },
  {
    id: 'porcelain_mortar_pestle',
    nameAr: 'هاون ومدقة خزفية للسحق',
    designationFr: 'Mortier et pilon en porcelaine non vernissée intérieurement',
    type: 'هاون ومدقة',
    categoryAr: 'زجاجيات عامة وحفظ الكواشف',
    image: singleMortarPestleImg,
    capacities: ['Ø 90 mm', 'Ø 120 mm', 'Ø 150 mm'],
    unit: 'قطعة',
    location: 'خزانة التحضير — الرف A4',
    suggestedQuantity: 6,
    notes: 'لسحق الأملاح والعينات الصلبة؛ يُمنع سحق المواد المؤكسدة مع المختزلة معاً.',
    keywords: ['هاون', 'مدقة', 'mortier', 'pilon', 'mortar'],
  },
  {
    id: 'microscope_slides_covers',
    nameAr: 'شرائح مجهرية وغطاء شرائح زجاجية',
    designationFr: 'Lames porte-objet et lamelles couvre-objet en verre',
    type: 'شرائح مجهرية',
    categoryAr: 'البيولوجيا والقطارات',
    image: singleMicroscopeSlidesImg,
    capacities: ['علبة 50 قطعة', 'علبة 100 قطعة'],
    unit: 'علبة',
    location: 'خزانة علوم الطبيعة والحياة — الرف F1',
    suggestedQuantity: 10,
    notes: 'شرائح رقيقة هشة للفحص المجهري؛ تُمسك من الحواف وتُنظف بورق ناعم.',
    keywords: ['شرائح', 'شريحة', 'لآمل', 'lames', 'lamelles', 'slides'],
  },
];

export const GLASSWARE_QUICK_FILL_LIST: GlasswareQuickFillModel[] = [
  ...GLASSWARE_CATALOG.flatMap(tpl =>
    tpl.capacities.map(cap => ({
      id: `${tpl.id}__${cap}`,
      nameAr: `${tpl.nameAr} ${cap}`,
      designationFr: `${tpl.designationFr} (${cap})`,
      capacity: cap,
      type: tpl.type,
      categoryAr: tpl.categoryAr,
      image: tpl.image,
      unit: tpl.defaultUnit,
      location: tpl.defaultLocation,
      suggestedQuantity: tpl.suggestedQuantity,
      notes: tpl.careAndSafety,
    }))
  ),
  ...EXTRA_GLASSWARE_SPECS.flatMap(spec =>
    spec.capacities.map(cap => ({
      id: `${spec.id}__${cap}`,
      nameAr: `${spec.nameAr} ${cap}`,
      designationFr: `${spec.designationFr} (${cap})`,
      capacity: cap,
      type: spec.type,
      categoryAr: spec.categoryAr,
      image: spec.image,
      unit: spec.unit,
      location: spec.location,
      suggestedQuantity: spec.suggestedQuantity,
      notes: spec.notes,
    }))
  ),
];

export function resolveGlasswareImage(
  nameAr?: string,
  designationFr?: string,
  type?: string,
  quickModelId?: string
): string {
  if (quickModelId) {
    const quickHit = GLASSWARE_QUICK_FILL_LIST.find(m => m.id === quickModelId);
    if (quickHit) return quickHit.image;
  }

  const haystack = `${nameAr || ''} ${designationFr || ''} ${type || ''}`.toLowerCase().trim();
  if (!haystack) {
    return GLASSWARE_CATALOG[0].image;
  }

  for (const extra of EXTRA_GLASSWARE_SPECS) {
    if (
      extra.keywords.some(k => haystack.includes(k.toLowerCase())) ||
      haystack.includes(extra.nameAr.toLowerCase()) ||
      haystack.includes(extra.type.toLowerCase())
    ) {
      return extra.image;
    }
  }

  return findGlasswareCatalogMatch(nameAr, designationFr, type).image;
}


