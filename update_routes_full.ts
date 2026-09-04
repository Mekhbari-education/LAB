import fs from 'fs';

const file = 'src/routes/dbRoutes.ts';
let code = fs.readFileSync(file, 'utf-8');

// Ensure equipment PUT/DELETE exist
if (!code.includes("router.put('/equipment/:id'")) {
  code = code.replace(
    `router.post('/equipment', async (req: AuthRequest, res) => {`,
    `router.put('/equipment/:id', async (req: AuthRequest, res) => {
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

router.post('/equipment', async (req: AuthRequest, res) => {`
  );
}

// Ensure teachers PUT/DELETE exist
if (!code.includes("router.put('/teachers/:id'")) {
  code = code.replace(
    `router.post('/teachers', async (req: AuthRequest, res) => {`,
    `router.put('/teachers/:id', async (req: AuthRequest, res) => {
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

router.post('/teachers', async (req: AuthRequest, res) => {`
  );
}

fs.writeFileSync(file, code);
