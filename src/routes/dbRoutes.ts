import express from 'express';
import { db } from '../db/index.ts';
import { 
  chemicals, 
  equipment, 
  teachers, 
  studentClasses, 
  labSessions, 
  labSchedule, 
  glasswareInventory, 
  equipmentScrapping, 
  maintenanceLogs, 
  labUsageLogs 
} from '../db/schema.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();

router.use(requireAuth);

// --- Chemicals ---
router.get('/chemicals', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(chemicals).where(eq(chemicals.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chemicals' });
  }
});

router.put('/chemicals/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(chemicals)
      .set(req.body)
      .where(and(eq(chemicals.id, id), eq(chemicals.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chemical' });
  }
});

router.delete('/chemicals/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(chemicals).where(and(eq(chemicals.id, id), eq(chemicals.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chemical' });
  }
});

router.post('/chemicals', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const newChemical = { ...req.body, id, schoolId };
    const [inserted] = await db.insert(chemicals).values(newChemical).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert chemical' });
  }
});

router.post('/chemicals/bulk', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });
    const formatted = items.map(item => ({
      ...item,
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
      schoolId,
    }));
    const inserted = await db.insert(chemicals).values(formatted).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk insert chemicals' });
  }
});

// --- Equipment ---
router.get('/equipment', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(equipment).where(eq(equipment.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

router.put('/equipment/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(equipment)
      .set(req.body)
      .where(and(eq(equipment.id, id), eq(equipment.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

router.delete('/equipment/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(equipment).where(and(eq(equipment.id, id), eq(equipment.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

router.post('/equipment', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const newEquipment = { ...req.body, id, schoolId };
    const [inserted] = await db.insert(equipment).values(newEquipment).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert equipment' });
  }
});

router.post('/equipment/bulk', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });
    const formatted = items.map(item => ({
      ...item,
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
      schoolId,
    }));
    const inserted = await db.insert(equipment).values(formatted).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk insert equipment' });
  }
});

// --- Teachers ---
router.get('/teachers', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(teachers).where(eq(teachers.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.put('/teachers/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(teachers)
      .set(req.body)
      .where(and(eq(teachers.id, id), eq(teachers.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

router.delete('/teachers/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(teachers).where(and(eq(teachers.id, id), eq(teachers.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

router.post('/teachers', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const newTeacher = { ...req.body, id, schoolId };
    const [inserted] = await db.insert(teachers).values(newTeacher).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert teacher' });
  }
});

router.post('/teachers/bulk', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });
    const formatted = items.map(item => ({
      ...item,
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
      schoolId,
    }));
    const inserted = await db.insert(teachers).values(formatted).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk insert teachers' });
  }
});

// --- Student Classes ---
router.get('/student-classes', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(studentClasses).where(eq(studentClasses.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student classes' });
  }
});

router.post('/student-classes', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(studentClasses).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student class' });
  }
});

router.put('/student-classes/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(studentClasses)
      .set(req.body)
      .where(and(eq(studentClasses.id, id), eq(studentClasses.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student class' });
  }
});

router.delete('/student-classes/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(studentClasses).where(and(eq(studentClasses.id, id), eq(studentClasses.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student class' });
  }
});

// --- Lab Sessions ---
router.get('/lab-sessions', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(labSessions).where(eq(labSessions.schoolId, schoolId)).orderBy(desc(labSessions.createdAt));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab sessions' });
  }
});

router.post('/lab-sessions', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(labSessions).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab session' });
  }
});

router.put('/lab-sessions/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(labSessions)
      .set(req.body)
      .where(and(eq(labSessions.id, id), eq(labSessions.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lab session' });
  }
});

router.delete('/lab-sessions/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(labSessions).where(and(eq(labSessions.id, id), eq(labSessions.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab session' });
  }
});

// --- Lab Schedule ---
router.get('/lab-schedule', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(labSchedule).where(eq(labSchedule.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab schedule' });
  }
});

router.post('/lab-schedule', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(labSchedule).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab reservation' });
  }
});

router.put('/lab-schedule/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(labSchedule)
      .set(req.body)
      .where(and(eq(labSchedule.id, id), eq(labSchedule.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lab reservation' });
  }
});

router.delete('/lab-schedule/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(labSchedule).where(and(eq(labSchedule.id, id), eq(labSchedule.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab reservation' });
  }
});

// --- Glassware Inventory ---
router.get('/glassware', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(glasswareInventory).where(eq(glasswareInventory.schoolId, schoolId));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch glassware' });
  }
});

router.post('/glassware', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(glasswareInventory).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create glassware item' });
  }
});

router.post('/glassware/bulk', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });
    const formatted = items.map(item => ({
      ...item,
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
      schoolId,
    }));
    const inserted = await db.insert(glasswareInventory).values(formatted).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk insert glassware' });
  }
});

router.put('/glassware/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(glasswareInventory)
      .set(req.body)
      .where(and(eq(glasswareInventory.id, id), eq(glasswareInventory.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update glassware' });
  }
});

router.delete('/glassware/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(glasswareInventory).where(and(eq(glasswareInventory.id, id), eq(glasswareInventory.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete glassware' });
  }
});

// --- Equipment Scrapping ---
router.get('/equipment-scrapping', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(equipmentScrapping).where(eq(equipmentScrapping.schoolId, schoolId)).orderBy(desc(equipmentScrapping.createdAt));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment scrapping records' });
  }
});

router.post('/equipment-scrapping', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(equipmentScrapping).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scrapping record' });
  }
});

router.put('/equipment-scrapping/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(equipmentScrapping)
      .set(req.body)
      .where(and(eq(equipmentScrapping.id, id), eq(equipmentScrapping.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update scrapping record' });
  }
});

router.delete('/equipment-scrapping/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(equipmentScrapping).where(and(eq(equipmentScrapping.id, id), eq(equipmentScrapping.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scrapping record' });
  }
});

// --- Maintenance Logs ---
router.get('/maintenance', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(maintenanceLogs).where(eq(maintenanceLogs.schoolId, schoolId)).orderBy(desc(maintenanceLogs.createdAt));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
});

router.post('/maintenance', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(maintenanceLogs).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create maintenance log' });
  }
});

router.put('/maintenance/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const [updated] = await db.update(maintenanceLogs)
      .set(req.body)
      .where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.schoolId, schoolId)))
      .returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance log' });
  }
});

router.delete('/maintenance/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(maintenanceLogs).where(and(eq(maintenanceLogs.id, id), eq(maintenanceLogs.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete maintenance log' });
  }
});

// --- Lab Usage Logs (Ministry Consumption Book) ---
router.get('/lab-usage-logs', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await db.select().from(labUsageLogs).where(eq(labUsageLogs.schoolId, schoolId)).orderBy(desc(labUsageLogs.date));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab usage logs' });
  }
});

router.post('/lab-usage-logs', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11));
    const [inserted] = await db.insert(labUsageLogs).values({ ...req.body, id, schoolId }).returning();
    res.json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lab usage log' });
  }
});

router.delete('/lab-usage-logs/:id', async (req: AuthRequest, res) => {
  try {
    const schoolId = req.user?.uid;
    if (!schoolId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await db.delete(labUsageLogs).where(and(eq(labUsageLogs.id, id), eq(labUsageLogs.schoolId, schoolId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lab usage log' });
  }
});

export default router;
