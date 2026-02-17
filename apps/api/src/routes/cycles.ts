import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authMiddleware } from '../auth.js';
import { getSurahsForPageRange, getJuzsForPageRange } from '@stammkhatm/shared';
import { sendEmail } from '../email.js';
import { Prisma } from '@prisma/client';

const router: Router = Router();

async function ensureSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.settings.create({ data: { id: 1 } });
}

function buildSegmentLabel(startPage: number, endPage: number) {
  return `Pages ${startPage}–${endPage}`;
}

async function generateCycle(monthKey: string) {
  const settings = await ensureSettings();
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

  return cycle;
}

async function notifyAvailableUsers(segmentId: string) {
  const segment = await prisma.segment.findUnique({
    where: { id: segmentId },
    include: { cycle: true },
  });
  if (!segment) return 0;

  const cycleId = segment.cycleId;
  const claims = await prisma.claim.findMany({
    where: { segment: { cycleId } },
    select: { userId: true },
  });
  const claimedUserIds = new Set(claims.map((c) => c.userId));

  const allUsers = await prisma.user.findMany({
    where: { emailVerifiedAt: { not: null } },
    select: { id: true, name: true, email: true },
  });

  const unclaimedUsers = allUsers.filter((u) => !claimedUserIds.has(u.id));
  const recipients = unclaimedUsers.length > 0 ? unclaimedUsers : allUsers;

  const settings = await ensureSettings();
  const template = settings.reminderTemplate;

  let sent = 0;
  for (const user of recipients) {
    const message = template
      .replace(/\[username\]/gi, user.name)
      .replace(/\[segment_name\]/gi, buildSegmentLabel(segment.startPage, segment.endPage));

    await sendEmail(user.email, 'Stammkhatm – Segment Available 📖', `<p>${message}</p>`);
    sent++;
  }

  return sent;
}

// GET /cycles/current
router.get('/current', authMiddleware, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const settings = await ensureSettings();

    let cycle = await prisma.cycle.findUnique({
      where: { monthKey },
      include: {
        segments: {
          include: {
            claims: { select: { id: true, userId: true, claimedAt: true, completedAt: true } },
          },
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!cycle && settings.splitEnabled) {
      await prisma.cycle.deleteMany({ where: { monthKey } });
      await generateCycle(monthKey);
      cycle = await prisma.cycle.findUnique({
        where: { monthKey },
        include: {
          segments: {
            include: {
              claims: { select: { id: true, userId: true, claimedAt: true, completedAt: true } },
            },
            orderBy: { index: 'asc' },
          },
        },
      });
    }

    if (!cycle) {
      res.status(404).json({ error: 'No cycle found for this month' });
      return;
    }

    const claimUserIds = new Set<string>();
    for (const segment of cycle.segments) {
      for (const claim of segment.claims) {
        claimUserIds.add(claim.userId);
      }
    }

    const unclaimedUsers = await prisma.user.findMany({
      where: {
        emailVerifiedAt: { not: null },
        id: { notIn: Array.from(claimUserIds) },
      },
      select: { id: true, name: true },
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
        claim: claim
          ? {
              id: claim.id,
              claimedAt: claim.claimedAt,
              completedAt: claim.completedAt,
              isMine: claim.userId === req.userId,
            }
          : null,
      };
    });

    res.json({
      cycle: {
        id: cycle.id,
        monthKey: cycle.monthKey,
        segments,
      },
      settings: {
        splitEnabled: settings.splitEnabled,
        segmentsPerMonth: settings.segmentsPerMonth,
        totalPages: settings.totalPages,
        timezone: settings.timezone,
      },
      unclaimedUsers,
    });
  } catch (err) {
    console.error('Get current cycle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /claims/mine
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const claims = await prisma.claim.findMany({
      where: { userId },
      include: {
        segment: true,
      },
      orderBy: { claimedAt: 'asc' },
    });

    res.json({
      claims: claims.map((claim) => ({
        id: claim.id,
        claimedAt: claim.claimedAt,
        completedAt: claim.completedAt,
        segment: {
          id: claim.segment.id,
          index: claim.segment.index,
          startPage: claim.segment.startPage,
          endPage: claim.segment.endPage,
          surahSpanJson: claim.segment.surahSpanJson,
          juzSpanJson: claim.segment.juzSpanJson,
        },
      })),
    });
  } catch (err) {
    console.error('Get my claims error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /segments/:id/claim
router.post('/:id/claim', authMiddleware, async (req: Request, res: Response) => {
  try {
    const segmentId = req.params.id as string;
    const userId = req.userId as string;

    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }

    const existingSegmentClaim = await prisma.claim.findUnique({
      where: { segmentId },
    });
    if (existingSegmentClaim) {
      res.status(409).json({ error: 'Segment already claimed' });
      return;
    }

    const claim = await prisma.claim.create({
      data: { userId, segmentId },
    });

    res.status(201).json({ claim });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'Segment already claimed' });
      return;
    }
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /claims/:id/complete
router.post('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const claimId = req.params.id as string;
    const userId = req.userId as string;

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      res.status(404).json({ error: 'Claim not found' });
      return;
    }
    if (claim.userId !== userId) {
      res.status(403).json({ error: 'Not your claim' });
      return;
    }
    if (claim.completedAt) {
      res.status(409).json({ error: 'Already completed' });
      return;
    }

    const updated = await prisma.claim.update({
      where: { id: claimId },
      data: { completedAt: new Date() },
    });

    res.json({ claim: updated });
  } catch (err) {
    console.error('Complete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /claims/:id/release
router.post('/:id/release', authMiddleware, async (req: Request, res: Response) => {
  try {
    const claimId = req.params.id as string;
    const userId = req.userId as string;

    const claim = await prisma.claim.findUnique({ where: { id: claimId } });
    if (!claim) {
      res.status(404).json({ error: 'Claim not found' });
      return;
    }
    if (claim.userId !== userId) {
      res.status(403).json({ error: 'Not your claim' });
      return;
    }
    if (claim.completedAt) {
      res.status(409).json({ error: 'Completed claims cannot be released' });
      return;
    }

    await prisma.claim.delete({ where: { id: claimId } });

    const notifiedCount = await notifyAvailableUsers(claim.segmentId);

    res.json({ message: 'Segment released', notifiedCount });
  } catch (err) {
    console.error('Release error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
