import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { registerSchema, verifyOtpSchema, loginSchema } from '@stammkhatm/shared';
import { prisma } from '../db.js';
import { signToken, authMiddleware } from '../auth.js';
import { sendEmail } from '../email.js';
import { sendWhatsappMessage } from '../whatsapp.js';

const router: Router = Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many OTP attempts, please try again later' },
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };
}

// POST /auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }

    const { name, email, phoneNumber, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      if (existing.emailVerifiedAt) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }
      // User exists but unverified – update and resend OTP
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, phoneNumber, passwordHash },
      });

      // Generate and send OTP
      const code = generateOtp();
      const codeHash = await bcrypt.hash(code, 10);
      await prisma.emailOtp.create({
        data: {
          email: normalizedEmail,
          userId: existing.id,
          codeHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await sendEmail(
        normalizedEmail,
        'Stammkhatm – Verify Your Email',
        `<h2>Welcome to Stammkhatm!</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code expires in 10 minutes.</p>`,
      );

      await sendWhatsappMessage(
        phoneNumber,
        `Stammkhatm verification code: ${code} (valid 10 minutes)`,
      );

      res.json({ message: 'OTP sent', email: normalizedEmail });
      return;
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, phoneNumber, passwordHash },
    });

    // Generate OTP
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.emailOtp.create({
      data: {
        email: normalizedEmail,
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail(
      normalizedEmail,
      'Stammkhatm – Verify Your Email',
      `<h2>Welcome to Stammkhatm!</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code expires in 10 minutes.</p>`,
    );

    await sendWhatsappMessage(
      phoneNumber,
      `Stammkhatm verification code: ${code} (valid 10 minutes)`,
    );

    res.status(201).json({ message: 'OTP sent', email: normalizedEmail });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', otpLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }

    const { email, code } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Get latest unused OTP
    const otp = await prisma.emailOtp.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      res.status(400).json({ error: 'No valid OTP found. Please request a new one.' });
      return;
    }

    if (otp.attempts >= 5) {
      await prisma.emailOtp.update({ where: { id: otp.id }, data: { used: true } });
      res.status(400).json({ error: 'Max attempts reached. Please request a new OTP.' });
      return;
    }

    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      await prisma.emailOtp.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });
      res.status(400).json({ error: 'Invalid code' });
      return;
    }

    // Mark OTP used
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { used: true } });

    // Verify user email
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });

    // Issue session token
    const token = signToken(user.id);
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, cookieOptions(isProd));
    res.json({
      message: 'Email verified successfully',
      user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({ error: 'Please verify your email first' });
      return;
    }

    const validPw = await bcrypt.compare(password, user.passwordHash);
    if (!validPw) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(user.id);
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, cookieOptions(isProd));

    // Check if admin
    const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber },
      isAdmin: !!admin,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

// GET /me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phoneNumber: true, emailVerifiedAt: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const admin = await prisma.admin.findUnique({ where: { email: user.email } });
    res.json({ user, isAdmin: !!admin });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
