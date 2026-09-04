import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, json, varchar, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chemicals = pgTable('chemicals', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  formula: text('formula'),
  casNumber: text('cas_number'),
  storageTemp: text('storage_temp'),
  unit: text('unit').notNull(),
  quantity: integer('quantity').notNull().default(0),
  state: text('state'),
  hazardClass: text('hazard_class'),
  ghs: json('ghs').default([]),
  shelf: text('shelf'),
  expiryDate: text('expiry_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('chemicals_school_id_idx').on(table.schoolId),
]);

export const equipment = pgTable('equipment', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'glassware' | 'tech' | 'other'
  serialNumber: text('serial_number'),
  status: text('status').notNull(), // 'functional' | 'maintenance' | 'broken'
  totalQuantity: integer('total_quantity').notNull().default(0),
  availableQuantity: integer('available_quantity').notNull().default(0),
  brokenQuantity: integer('broken_quantity').notNull().default(0),
  lastCalibration: text('last_calibration'),
  nextCalibration: text('next_calibration'),
  supplier: text('supplier'),
  location: text('location'),
  notes: text('notes'),
  foundationalInventory: text('foundational_inventory'),
  decennialReview: text('decennial_review'),
  smartNameAr: text('smart_name_ar'),
  smartDescriptionAr: text('smart_description_ar'),
  imageKeyword: text('image_keyword'),
  lastSmartUpdate: timestamp('last_smart_update'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('equipment_school_id_idx').on(table.schoolId),
]);

export const teachers = pgTable('teachers', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  functionalCode: text('functional_code'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  name: text('name').notNull(), // Combined
  birthDate: text('birth_date'),
  rank: text('rank'),
  subject: text('subject'),
  grade: text('grade'),
  effectiveDate: text('effective_date'),
  email: text('email'),
  levels: json('levels').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('teachers_school_id_idx').on(table.schoolId),
]);

export const studentClasses = pgTable('student_classes', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  name: text('name').notNull(),
  level: text('level').notNull(),
  academicYear: text('academic_year'),
  groups: json('groups').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('student_classes_school_id_idx').on(table.schoolId),
]);

export const labSessions = pgTable('lab_sessions', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  classId: text('class_id'),
  className: text('class_name').notNull(),
  groupName: text('group_name').notNull(),
  teacherName: text('teacher_name').notNull(),
  roomName: text('room_name').notNull(),
  benches: integer('benches').default(12),
  status: text('status').notNull().default('active'),
  date: text('date'),
  incidents: json('incidents').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('lab_sessions_school_id_idx').on(table.schoolId),
]);

export const labSchedule = pgTable('lab_schedule', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  labName: text('lab_name').notNull(),
  day: text('day').notNull(),
  time: text('time').notNull(),
  teacher: text('teacher').notNull(),
  subject: text('subject').notNull(),
  group: text('group').notNull(),
  status: text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('lab_schedule_school_id_idx').on(table.schoolId),
]);

export const glasswareInventory = pgTable('glassware_inventory', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  designationFr: text('designation_fr'),
  nameAr: text('name_ar').notNull(),
  type: text('type').notNull(),
  unit: text('unit').notNull().default('قطعة'),
  quantity: integer('quantity').notNull().default(0),
  status: text('status').notNull().default('جيدة'),
  location: text('location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('glassware_inventory_school_id_idx').on(table.schoolId),
]);

export const equipmentScrapping = pgTable('equipment_scrapping', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  pvNumber: text('pv_number'),
  date: text('date'),
  location: text('location'),
  committeeMembers: json('committee_members').default([]),
  scrapItems: json('scrap_items').default([]),
  proposalData: json('proposal_data'),
  status: text('status').default('submitted'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('equipment_scrapping_school_id_idx').on(table.schoolId),
]);

export const maintenanceLogs = pgTable('maintenance_logs', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  equipmentId: text('equipment_id'),
  equipmentName: text('equipment_name').notNull(),
  issue: text('issue').notNull(),
  technician: text('technician'),
  status: text('status').notNull().default('pending'),
  priority: text('priority').notNull().default('medium'),
  cost: text('cost'),
  startDate: text('start_date'),
  completionDate: text('completion_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('maintenance_logs_school_id_idx').on(table.schoolId),
]);

export const labUsageLogs = pgTable('lab_usage_logs', {
  id: varchar('id', { length: 128 }).primaryKey(),
  schoolId: text('school_id').notNull(),
  date: text('date').notNull(),
  teacherName: text('teacher_name').notNull(),
  className: text('class_name').notNull(),
  groupName: text('group_name'),
  experimentTitle: text('experiment_title').notNull(),
  consumedItems: json('consumed_items').default([]),
  notes: text('notes'),
  signed: text('signed').default('نعم'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('lab_usage_logs_school_id_idx').on(table.schoolId),
]);


