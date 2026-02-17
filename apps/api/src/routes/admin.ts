import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authMiddleware, adminMiddleware } from '../auth.js';
import { settingsSchema } from '@stammkhatm/shared';
import { getSurahsForPageRange, getJuzsForPageRange } from '@stammkhatm/shared';
import { sendReminderEmails } from '../cron.js';
import { sendEmail } from '../email.js';

const router: Router = Router();

function monthKeyFor(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function buildSegmentLabel(startPage: number, endPage: number) {
  return `Pages ${startPage}–${endPage}`;
}

async function ensureSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// GET /admin/settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await ensureSettings();
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

// GET /admin/overview
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthKey = monthKeyFor(now);

    const cycle = await prisma.cycle.findUnique({
      where: { monthKey },
      include: {
        segments: {
          include: {
            claims: { select: { id: true, completedAt: true } },
          },
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!cycle) {
      res.status(404).json({ error: 'No cycle found for this month' });
      return;
    }

    const claims = await prisma.claim.findMany({
      where: { segment: { cycleId: cycle.id } },
      select: { userId: true },
    });
    const claimedUserIds = new Set(claims.map((c) => c.userId));

    const unclaimedUsers = await prisma.user.findMany({
      where: { emailVerifiedAt: { not: null }, id: { notIn: Array.from(claimedUserIds) } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    const segments = cycle.segments.map((segment) => {
      const claim = segment.claims[0] || null;
      return {
        id: segment.id,
        index: segment.index,
        startPage: segment.startPage,
        endPage: segment.endPage,
        surahSpanJson: segment.surahSpanJson,
        juzSpanJson: segment.juzSpanJson,
        status: claim ? (claim.completedAt ? 'completed' : 'claimed') : 'unclaimed',
      };
    });

    res.json({
      cycle: {
        id: cycle.id,
        monthKey: cycle.monthKey,
        segments,
      },
      unclaimedUsers,
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/cycle/regenerate
router.post('/cycle/regenerate', async (_req: Request, res: Response) => {
  try {
    const settings = await ensureSettings();

    const now = new Date();
    const monthKey = monthKeyFor(now);

    await prisma.cycle.deleteMany({ where: { monthKey } });

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

// POST /admin/reminders/segment
router.post('/reminders/segment', async (req: Request, res: Response) => {
  try {
    const { segmentId, message, channel } = req.body as {
      segmentId?: string;
      message?: string;
      channel?: string;
    };

    if (!segmentId || !message || !channel) {
      res.status(400).json({ error: 'segmentId, message and channel are required' });
      return;
    }

    if (channel !== 'email') {
      res.status(400).json({ error: 'Channel not supported yet' });
      return;
    }

    const claim = await prisma.claim.findUnique({
      where: { segmentId },
      include: { user: true, segment: true },
    });

    if (!claim) {
      res.status(404).json({ error: 'No claim found for this segment' });
      return;
    }

    const rendered = message
      .replace(/\[username\]/gi, claim.user.name)
      .replace(/\[segment_name\]/gi, buildSegmentLabel(claim.segment.startPage, claim.segment.endPage));

    await sendEmail(claim.user.email, 'Stammkhatm – Reminder 📖', `<p>${rendered}</p>`);

    res.json({ message: 'Reminder sent' });
  } catch (err) {
    console.error('Segment reminder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/reminders/unclaimed
router.post('/reminders/unclaimed', async (req: Request, res: Response) => {
  try {
    const { message, channel, userIds } = req.body as {
      message?: string;
      channel?: string;
      userIds?: string[];
    };

    if (!message || !channel) {
      res.status(400).json({ error: 'message and channel are required' });
      return;
    }

    if (channel !== 'email') {
      res.status(400).json({ error: 'Channel not supported yet' });
      return;
    }

    const now = new Date();
    const monthKey = monthKeyFor(now);
    const cycle = await prisma.cycle.findUnique({ where: { monthKey } });

    let unclaimedIds: string[] = [];
    if (cycle) {
      const claims = await prisma.claim.findMany({
        where: { segment: { cycleId: cycle.id } },
        select: { userId: true },
      });
      const claimedIds = new Set(claims.map((c) => c.userId));
      const allUsers = await prisma.user.findMany({
        where: { emailVerifiedAt: { not: null } },
        select: { id: true },
      });
      unclaimedIds = allUsers.filter((u) => !claimedIds.has(u.id)).map((u) => u.id);
    }

    const users = await prisma.user.findMany({
      where: {
        id:
          userIds && userIds.length > 0
            ? { in: userIds }
            : unclaimedIds.length > 0
              ? { in: unclaimedIds }
              : undefined,
        emailVerifiedAt: { not: null },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    let sent = 0;
    for (const user of users) {
      const rendered = message
        .replace(/\[username\]/gi, user.name)
        .replace(/\[segment_name\]/gi, 'an available segment');

      await sendEmail(user.email, 'Stammkhatm – Reminder 📖', `<p>${rendered}</p>`);
      sent++;
    }

    res.json({ message: `Sent ${sent} reminder(s)` });
  } catch (err) {
    console.error('Unclaimed reminder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
