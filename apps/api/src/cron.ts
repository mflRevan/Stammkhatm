import cron from 'node-cron';
import { prisma } from './db.js';
import { sendEmail } from './email.js';

// Hadith and motivational quotes to include in reminder emails
const REMINDER_QUOTES = [
  {
    text: 'The best of you are those who learn the Quran and teach it.',
    source: 'Sahih al-Bukhari 5027',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
  },
  {
    text: 'Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.',
    source: 'Sahih Muslim 804',
    arabic: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
  },
  {
    text: 'Indeed, this Quran guides to that which is most suitable.',
    source: 'Surah Al-Isra 17:9',
    arabic: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
  },
  {
    text: 'The one who is proficient in the recitation of the Quran will be with the honourable and obedient scribes (angels).',
    source: 'Sahih al-Bukhari 4937',
    arabic: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ',
  },
  {
    text: 'Whoever reads a letter from the Book of Allah, he will have a reward, and that reward will be multiplied by ten.',
    source: 'Jami at-Tirmidhi 2910',
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
  },
  {
    text: 'The Quran is a proof for you or against you.',
    source: 'Sahih Muslim 223',
    arabic: 'وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ',
  },
  {
    text: 'Verily, We have made this Quran easy to understand and remember.',
    source: 'Surah Al-Qamar 54:17',
    arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ',
  },
  {
    text: 'And We send down of the Quran that which is healing and mercy for the believers.',
    source: 'Surah Al-Isra 17:82',
    arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ',
  },
];

function getRandomQuote() {
  return REMINDER_QUOTES[Math.floor(Math.random() * REMINDER_QUOTES.length)];
}

function buildEmailHtml(
  userName: string,
  segmentList: string,
  appUrl: string,
  quote: (typeof REMINDER_QUOTES)[0],
): string {
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:28px 24px;background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:16px 16px 0 0;">
      <div style="width:48px;height:48px;margin:0 auto 12px;background:rgba(255,255,255,0.2);border-radius:12px;line-height:48px;text-align:center;">
        <span style="font-size:24px;color:#ffffff;font-family:serif;">ق</span>
      </div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Stammkhatm</h1>
      <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Haus Des Islam – Stammtisch</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px 24px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
      <h2 style="margin:0 0 6px;font-size:18px;color:#18181b;">Assalamu Alaikum ${userName} 👋</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#71717a;line-height:1.5;">
        This is a friendly reminder from <strong style="color:#18181b;">Stammtisch Khatm</strong>. You have the following incomplete segments for this month:
      </p>

      <!-- Segments -->
      <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:20px;">
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${segmentList}
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${appUrl}/my-segments" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
          View Your Segments →
        </a>
      </div>

      <!-- Quote -->
      <div style="border-left:3px solid #14b8a6;padding:12px 16px;background:#f0fdfa;border-radius:0 8px 8px 0;margin-bottom:4px;">
        <p style="margin:0 0 4px;font-size:16px;color:#0d9488;font-family:serif;line-height:1.4;text-align:right;direction:rtl;">
          ${quote.arabic}
        </p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;line-height:1.5;font-style:italic;">
          "${quote.text}"
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">— ${quote.source}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px 24px;background:#f9fafb;border-radius:0 0 16px 16px;border:1px solid #e4e4e7;border-top:0;">
      <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">May Allah make it easy for you! 🤲</p>
      <p style="margin:0;font-size:11px;color:#d4d4d8;">Stammkhatm – Haus Des Islam</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendReminderEmails(): Promise<number> {
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const appUrl = settings?.appUrl || 'http://localhost:5173';

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
  const byUser = new Map<string, { user: (typeof claims)[0]['user']; segments: (typeof claims)[0]['segment'][] }>();
  for (const claim of claims) {
    if (!byUser.has(claim.userId)) {
      byUser.set(claim.userId, { user: claim.user, segments: [] });
    }
    byUser.get(claim.userId)!.segments.push(claim.segment);
  }

  let sentCount = 0;
  for (const [, { user, segments }] of byUser) {
    const quote = getRandomQuote();

    const segmentRows = segments
      .map((s) => {
        const surahs = JSON.parse(s.surahSpanJson);
        const juzs = JSON.parse(s.juzSpanJson);
        const surahNames = surahs.map((su: { nameEn: string }) => su.nameEn).join(', ');
        const juzNumbers = juzs.map((j: { number: number }) => `Juz ${j.number}`).join(', ');
        return `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;">
              <div style="font-size:13px;font-weight:600;color:#18181b;">Pages ${s.startPage}–${s.endPage}</div>
              <div style="font-size:12px;color:#71717a;margin-top:2px;">${surahNames}</div>
              <div style="font-size:11px;color:#a1a1aa;margin-top:1px;">${juzNumbers}</div>
            </td>
          </tr>`;
      })
      .join('\n');

    const html = buildEmailHtml(user.name, segmentRows, appUrl, quote);

    await sendEmail(user.email, 'Stammkhatm – Reminder: Incomplete Segments 📖', html);
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

  scheduledTask = cron.schedule('0 9 * * *', async () => {
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
      console.error('Cron reminder error:', err);
    }
  });

  console.log('⏰ Cron scheduler started (daily at 09:00)');
}
