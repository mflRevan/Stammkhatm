import { z } from 'zod';

// ── Auth Schemas ──
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phoneNumber: z.string().min(6).max(30),
  password: z.string().min(8).max(128),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Settings Schema ──
export const settingsSchema = z.object({
  totalPages: z.number().int().min(1).default(604),
  segmentsPerMonth: z.number().int().min(1).max(604).default(30),
  splitEnabled: z.boolean().default(true),
  reminderIntervalDays: z.number().int().min(1).default(7),
  reminderTarget: z.enum(['incomplete-claims', 'unclaimed-users']).default('incomplete-claims'),
  reminderTemplate: z
    .string()
    .min(5)
    .max(2000)
    .default("Assalamu Alaikum [username], please complete [segment_name] in this month's Khatm."),
  timezone: z.string().default('Europe/Berlin'),
  appUrl: z.string().url().default('http://localhost:5173'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
