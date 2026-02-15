import cron from "node-cron";
import { prisma } from "./db.js";
import { sendEmail } from "./email.js";

export async function sendReminderEmails(): Promise<number> {
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const appUrl = settings?.appUrl || "http://localhost:5173";

  // Get all users who have incomplete claims in the current cycle
  const claims = await prisma.claim.findMany({
    where: {
      completedAt: null,
      segment: {
        cycle: { monthKey },
      },
    },
    include: {
      user: true,
      segment: true,
    },
  });

  // Group by user
  const byUser = new Map<string, { user: typeof claims[0]["user"]; segments: typeof claims[0]["segment"][] }>();
  for (const claim of claims) {
    if (!byUser.has(claim.userId)) {
      byUser.set(claim.userId, { user: claim.user, segments: [] });
    }
    byUser.get(claim.userId)!.segments.push(claim.segment);
  }

  let sentCount = 0;
  for (const [, { user, segments }] of byUser) {
    const segmentList = segments
      .map((s) => {
        const surahs = JSON.parse(s.surahSpanJson);
        const juzs = JSON.parse(s.juzSpanJson);
        const surahNames = surahs.map((su: { nameEn: string }) => su.nameEn).join(", ");
        const juzNumbers = juzs.map((j: { number: number }) => `Juz ${j.number}`).join(", ");
        return `<li>Pages ${s.startPage}–${s.endPage} (${surahNames} | ${juzNumbers})</li>`;
      })
      .join("\n");

    const html = `
      <h2>Assalamu Alaikum ${user.name},</h2>
      <p>This is a friendly reminder from <strong>Stammtisch Khatm</strong> (Haus Des Islam).</p>
      <p>You have the following incomplete segments for this month:</p>
      <ul>${segmentList}</ul>
      <p><a href="${appUrl}/my-segments">View your segments →</a></p>
      <p>May Allah make it easy for you! 🤲</p>
      <hr>
      <small>Stammkhatm – Haus Des Islam</small>
    `;

    await sendEmail(user.email, "Stammkhatm – Reminder: Incomplete Segments", html);
    sentCount++;
  }

  console.log(`📧 Sent ${sentCount} reminder email(s)`);
  return sentCount;
}

let scheduledTask: cron.ScheduledTask | null = null;

export function startCron() {
  // Run daily at 9:00 AM. The actual send logic checks reminderIntervalDays.
  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule("0 9 * * *", async () => {
    try {
      const settings = await prisma.settings.findUnique({ where: { id: 1 } });
      if (!settings) return;

      const today = new Date();
      const dayOfMonth = today.getDate();

      // Send on every reminderIntervalDays
      if (dayOfMonth % settings.reminderIntervalDays === 0 || dayOfMonth === 1) {
        await sendReminderEmails();
      }
    } catch (err) {
      console.error("Cron reminder error:", err);
    }
  });

  console.log("⏰ Cron scheduler started (daily at 09:00)");
}
