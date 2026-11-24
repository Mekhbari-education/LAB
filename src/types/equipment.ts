export type EquipmentStatus =
  | 'functional'
  | 'maintenance'
  | 'broken'
  | 'needs_inspection'
  | 'reserved'
  | 'in_storage'
  | 'missing'
  | 'written_off';

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  functional: 'سليم',
  maintenance: 'صيانة',
  needs_inspection: 'يحتاج فحص',
  reserved: 'محجوز / قيد الاستخدام',
  in_storage: 'في المخزن',
  broken: 'تالف / مقترح للإسقاط',
  missing: 'مفقود',
  written_off: 'إسقاط',
};

export const EQUIPMENT_STATUS_OPTIONS: Array<{ value: EquipmentStatus; label: string }> = [
  { value: 'functional', label: 'سليم' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'needs_inspection', label: 'يحتاج فحص' },
  { value: 'reserved', label: 'محجوز / قيد الاستخدام' },
  { value: 'in_storage', label: 'في المخزن' },
  { value: 'broken', label: 'تالف / مقترح للإسقاط' },
  { value: 'missing', label: 'مفقود' },
  { value: 'written_off', label: 'إسقاط' },
];

export function getEquipmentStatusLabel(status?: string): string {
  if (!status) return EQUIPMENT_STATUS_LABELS.functional;
  return EQUIPMENT_STATUS_LABELS[status as EquipmentStatus] || status;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'glassware' | 'tech' | 'other';
  serialNumber: string;
  status: EquipmentStatus;
  totalQuantity: number;
  availableQuantity: number;
  brokenQuantity: number;
  lastCalibration?: string;
  nextCalibration?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  source?: string;
  price?: string;
  registrationDate?: string;
  exitDate?: string;
  foundationalInventory?: string;
  decennialReview?: string;
  smartNameAr?: string;
  smartDescriptionAr?: string;
  imageKeyword?: string;
  lastSmartUpdate?: any;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  previousStatus: string;
  newStatus: string;
  date: any;
  note: string;
}
