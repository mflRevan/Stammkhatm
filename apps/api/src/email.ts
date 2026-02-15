import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log("📧 SMTP not configured – emails will be logged to console");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const from = process.env.SMTP_FROM || "noreply@stammkhatm.de";
  const t = getTransporter();

  if (!t) {
    console.log("═══════════════════════════════════════");
    console.log(`📧 EMAIL TO: ${to}`);
    console.log(`📧 SUBJECT: ${subject}`);
    console.log(`📧 BODY:\n${html}`);
    console.log("═══════════════════════════════════════");
    return;
  }

  await t.sendMail({ from, to, subject, html });
}
