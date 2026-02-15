import { PrismaClient } from "@prisma/client";
import { getSurahsForPageRange, getJuzsForPageRange } from "@stammkhatm/shared";

const prisma = new PrismaClient();

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function generateSegments(totalPages: number, segmentsPerMonth: number) {
  const base = Math.floor(totalPages / segmentsPerMonth);
  const remainder = totalPages % segmentsPerMonth;
  const segments: { index: number; startPage: number; endPage: number }[] = [];
  let currentPage = 1;
  for (let i = 0; i < segmentsPerMonth; i++) {
    const size = base + (i < remainder ? 1 : 0);
    segments.push({
      index: i,
      startPage: currentPage,
      endPage: currentPage + size - 1,
    });
    currentPage += size;
  }
  return segments;
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Upsert Settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      totalPages: 604,
      segmentsPerMonth: 30,
      reminderIntervalDays: 7,
      timezone: "Europe/Berlin",
      appUrl: process.env.APP_URL || "http://localhost:5173",
    },
  });
  console.log("✅ Settings created");

  // 2. Insert admin emails
  const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  for (const email of adminEmails) {
    await prisma.admin.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
  console.log(`✅ ${adminEmails.length} admin(s) seeded`);

  // 3. Generate current month cycle if missing
  const monthKey = getCurrentMonthKey();
  const existing = await prisma.cycle.findUnique({ where: { monthKey } });
  if (!existing) {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const totalPages = settings?.totalPages ?? 604;
    const segmentsPerMonth = settings?.segmentsPerMonth ?? 30;

    const segs = generateSegments(totalPages, segmentsPerMonth);
    const cycle = await prisma.cycle.create({ data: { monthKey } });

    for (const seg of segs) {
      const surahs = getSurahsForPageRange(seg.startPage, seg.endPage);
      const juzs = getJuzsForPageRange(seg.startPage, seg.endPage);
      await prisma.segment.create({
        data: {
          cycleId: cycle.id,
          index: seg.index,
          startPage: seg.startPage,
          endPage: seg.endPage,
          surahSpanJson: JSON.stringify(
            surahs.map((s) => ({
              number: s.number,
              name: s.name,
              nameEn: s.nameEn,
              nameDe: s.nameDe,
            }))
          ),
          juzSpanJson: JSON.stringify(juzs.map((j) => ({ number: j.number }))),
        },
      });
    }
    console.log(`✅ Cycle ${monthKey} generated with ${segs.length} segments`);
  } else {
    console.log(`ℹ️  Cycle ${monthKey} already exists, skipping`);
  }

  console.log("🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
