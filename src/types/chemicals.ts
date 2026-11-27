export interface Chemical {
  id: string;
  nameEn: string;
  nameAr: string;
  formula: string;
  casNumber?: string;
  storageTemp?: string;
  unit: string;
  quantity: number;
  state: string;
  hazardClass: string;
  ghs: string[];
  shelf: string;
  expiryDate: string;
  notes: string;
}

const makeGhsDataUri = (inner: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,6 94,50 50,94 6,50" fill="#ffffff" stroke="#dc2626" stroke-width="7" stroke-linejoin="miter"/>${inner}</svg>`
  )}`;

export const GHS_ICONS: Record<string, string> = {
  GHS01: makeGhsDataUri(
    '<circle cx="44" cy="54" r="9" fill="#111827"/><path d="M50,47 L56,41 M44,41 L44,29 M36,45 L26,37 M32,54 L20,54 M37,62 L27,70 M46,66 L47,77 M54,61 L65,69 M56,52 L72,50" stroke="#111827" stroke-width="3.2" stroke-linecap="round"/><polygon points="54,43 64,26 60,40 74,34 62,46 77,47 61,52 72,62 57,56" fill="#111827"/><circle cx="68" cy="27" r="2.2" fill="#111827"/><circle cx="76" cy="40" r="2" fill="#111827"/><circle cx="31" cy="34" r="2" fill="#111827"/>'
  ),
  GHS02: makeGhsDataUri(
    '<rect x="28" y="70" width="44" height="3.5" rx="1.5" fill="#111827"/><path d="M50,23 C53,32 61,36 60,47 C64,44 66,39 65,35 C71,43 72,56 64,65 C60,69 54,70 50,70 C45,70 39,68 35,63 C29,56 30,44 37,37 C37,42 39,46 42,48 C40,39 44,30 50,23 Z" fill="#111827"/><path d="M50,47 C54,53 56,59 53,65 C51,68 47,68 45,65 C43,60 45,53 50,47 Z" fill="#ffffff"/>'
  ),
  GHS03: makeGhsDataUri(
    '<circle cx="50" cy="61" r="11" fill="none" stroke="#111827" stroke-width="4"/><rect x="31" y="73" width="38" height="3.2" rx="1.5" fill="#111827"/><path d="M50,20 C53,27 59,30 58,39 C61,37 63,33 62,30 C67,36 67,46 61,51 C57,54 53,54 50,54 C46,54 42,53 39,49 C34,44 35,36 40,30 C40,34 42,37 44,38 C43,31 46,25 50,20 Z" fill="#111827"/>'
  ),
  GHS04: makeGhsDataUri(
    '<g transform="rotate(-45 50 50)"><rect x="41" y="25" width="18" height="47" rx="8" fill="#111827"/><rect x="46" y="19" width="8" height="8" rx="1.5" fill="#111827"/><rect x="43" y="17" width="14" height="3" rx="1" fill="#111827"/></g>'
  ),
  GHS05: makeGhsDataUri(
    '<g transform="rotate(-35 37 32)"><rect x="33" y="21" width="7" height="17" rx="2" fill="#111827"/></g><g transform="rotate(35 63 32)"><rect x="60" y="21" width="7" height="17" rx="2" fill="#111827"/></g><circle cx="35" cy="46" r="2.2" fill="#111827"/><circle cx="64" cy="46" r="2.2" fill="#111827"/><path d="M27,54 L43,54 L43,60 L38,60 L35,57 L32,60 L27,60 Z" fill="#111827"/><path d="M53,59 L66,59 L69,56 L72,56 L72,62 L69,62 L66,65 L53,65 C51,65 50,62 53,59 Z" fill="#111827"/><rect x="54" y="65" width="18" height="4" rx="1.5" fill="#111827"/>'
  ),
  GHS06: makeGhsDataUri(
    '<circle cx="50" cy="40" r="13" fill="#111827"/><rect x="44" y="49" width="12" height="7" rx="2" fill="#111827"/><circle cx="45" cy="40" r="3" fill="#ffffff"/><circle cx="55" cy="40" r="3" fill="#ffffff"/><polygon points="50,43 48,47 52,47" fill="#ffffff"/><path d="M46,52 L46,56 M50,52 L50,56 M54,52 L54,56" stroke="#ffffff" stroke-width="1.3"/><path d="M31,59 L69,73 M69,59 L31,73" stroke="#111827" stroke-width="4.5" stroke-linecap="round"/><circle cx="30" cy="58" r="3" fill="#111827"/><circle cx="70" cy="58" r="3" fill="#111827"/><circle cx="30" cy="74" r="3" fill="#111827"/><circle cx="70" cy="74" r="3" fill="#111827"/>'
  ),
  GHS07: makeGhsDataUri(
    '<path d="M45.5,26 C45.5,23.5 47.5,22 50,22 C52.5,22 54.5,23.5 54.5,26 L52.8,57 C52.6,59 51.4,60 50,60 C48.6,60 47.4,59 47.2,57 Z" fill="#111827"/><circle cx="50" cy="71" r="5" fill="#111827"/>'
  ),
  GHS08: makeGhsDataUri(
    '<circle cx="50" cy="30" r="7.5" fill="#111827"/><path d="M35,72 L37,48 C37,42 42,39 50,39 C58,39 63,42 63,48 L65,72 Z" fill="#111827"/><polygon points="50,43 52.5,50 60,47 54.5,53 61,59 52.5,57 50,65 47.5,57 39,59 45.5,53 40,47 47.5,50" fill="#ffffff"/>'
  ),
  GHS09: makeGhsDataUri(
    '<path d="M24,62 Q38,57 52,61 T77,61 L77,65 L24,65 Z" fill="#111827"/><path d="M36,60 L36,34 M36,46 L29,38 M36,42 L43,35 M36,37 L32,29" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M49,54 C55,48 64,49 69,54 C64,59 55,60 49,54 Z" fill="#111827"/><polygon points="68,54 74,49 74,59" fill="#111827"/><circle cx="54" cy="53.5" r="1.2" fill="#ffffff"/>'
  ),
};

export const GHS_LABELS: Record<string, string> = {
  GHS01: 'متفجرات',
  GHS02: 'قابل للاشتعال',
  GHS03: 'مؤكسد',
  GHS04: 'غاز تحت الضغط',
  GHS05: 'أكال / مسبب للتآكل',
  GHS06: 'سمية حادة (قاتل)',
  GHS07: 'تهيج / تحسس / خطر',
  GHS08: 'خطر صحي جسيم',
  GHS09: 'خطر بيئي',
};

export function normalizeGhsCode(raw: string): string {
  if (!raw) return '';
  const match = raw.toUpperCase().match(/GHS\s*0?([1-9])/);
  if (match) return `GHS0${match[1]}`;
  return raw.trim().toUpperCase();
}

export function getGhsIcon(code: string): string | undefined {
  return GHS_ICONS[normalizeGhsCode(code)];
}

export function getGhsLabel(code: string): string {
  const norm = normalizeGhsCode(code);
  return GHS_LABELS[norm] || code;
}
