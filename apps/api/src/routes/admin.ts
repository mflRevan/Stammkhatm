import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authMiddleware, adminMiddleware } from '../auth.js';
import { settingsSchema } from '@stammkhatm/shared';
import { getSurahsForPageRange, getJuzsForPageRange } from '@stammkhatm/shared';
import { sendReminderEmails } from '../cron.js';

const router: Router = Router();

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// GET /admin/settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }

    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: parsed.data,
    });

    res.json({ settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/cycle/regenerate
router.post('/cycle/regenerate', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      res.status(500).json({ error: 'Settings not found' });
      return;
    }

    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    // Delete existing cycle (cascades to segments + claims)
    await prisma.cycle.deleteMany({ where: { monthKey } });

    // Generate new segments
    const { totalPages, segmentsPerMonth } = settings;
    const base = Math.floor(totalPages / segmentsPerMonth);
    const remainder = totalPages % segmentsPerMonth;

    const cycle = await prisma.cycle.create({ data: { monthKey } });

    let currentPage = 1;
    for (let i = 0; i < segmentsPerMonth; i++) {
      const size = base + (i < remainder ? 1 : 0);
      const startPage = currentPage;
      const endPage = currentPage + size - 1;

      const surahs = getSurahsForPageRange(startPage, endPage);
      const juzs = getJuzsForPageRange(startPage, endPage);

      await prisma.segment.create({
        data: {
          cycleId: cycle.id,
          index: i,
          startPage,
          endPage,
          surahSpanJson: JSON.stringify(
            surahs.map((s) => ({ number: s.number, name: s.name, nameEn: s.nameEn, nameDe: s.nameDe })),
          ),
          juzSpanJson: JSON.stringify(juzs.map((j) => ({ number: j.number }))),
        },
      });

      currentPage += size;
    }

    const result = await prisma.cycle.findUnique({
      where: { monthKey },
      include: { segments: { orderBy: { index: 'asc' } } },
    });

    res.json({ cycle: result });
  } catch (err) {
    console.error('Regenerate cycle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/reminders/send-now
router.post('/reminders/send-now', async (_req: Request, res: Response) => {
  try {
    const count = await sendReminderEmails();
    res.json({ message: `Sent ${count} reminder(s)` });
  } catch (err) {
    console.error('Send reminders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
