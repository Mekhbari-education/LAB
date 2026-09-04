import fs from 'fs';

const file = 'src/routes/dbRoutes.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(`
router.post('/chemicals', async (req: AuthRequest, res) => {`, `
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

router.post('/chemicals', async (req: AuthRequest, res) => {`);

fs.writeFileSync(file, code);
