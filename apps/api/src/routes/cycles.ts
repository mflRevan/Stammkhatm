import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authMiddleware } from '../auth.js';

const router: Router = Router();

// GET /cycles/current
router.get('/current', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    const cycle = await prisma.cycle.findUnique({
      where: { monthKey },
      include: {
        segments: {
          include: {
            claims: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!cycle) {
      res.status(404).json({ error: 'No cycle found for this month' });
      return;
    }

    res.json({ cycle });
  } catch (err) {
    console.error('Get current cycle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /segments/:id/claim
router.post('/:id/claim', authMiddleware, async (req: Request, res: Response) => {
  try {
    const segmentId = req.params.id as string;
    const userId = req.userId as string;

    // Check segment exists
    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }

    // Check if already claimed by this user
    const existing = await prisma.claim.findUnique({
      where: { userId_segmentId: { userId, segmentId } },
    });
    if (existing) {
      res.status(409).json({ error: 'You already claimed this segment' });
      return;
    }

    const claim = await prisma.claim.create({
      data: { userId, segmentId },
    });

    res.status(201).json({ claim });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /claims/:id/complete
router.post('/claims/:id/complete', authMiddleware, async (req: Request, res: Response) => {
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

export default router;
