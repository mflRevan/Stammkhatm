export const en = {
  // General
  appName: 'Stammkhatm',
  orgName: 'Haus Des Islam',
  groupName: 'Stammtisch',
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',
  back: 'Back',
  error: 'Error',
  success: 'Success',

  // Landing
  landingTitle: 'Stammtisch Khatm',
  landingSubtitle: 'Complete the Quran together, every month.',
  landingDescription:
    'A private Khatm management app for the Stammtisch group of Haus Des Islam. Claim your segments, track your progress, and complete the Quran as a community.',
  getStarted: 'Get Started',
  alreadyHaveAccount: 'Already have an account?',

  // Auth
  login: 'Log In',
  register: 'Register',
  logout: 'Log Out',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  namePlaceholder: 'Your full name',
  emailPlaceholder: 'your@email.com',
  passwordPlaceholder: 'Min. 8 characters',
  registerButton: 'Create Account',
  loginButton: 'Log In',
  noAccount: "Don't have an account?",
  registerHere: 'Register here',
  loginHere: 'Log in here',

  // OTP
  verifyEmail: 'Verify Your Email',
  otpSent: "We've sent a 6-digit code to",
  enterOtp: 'Enter Verification Code',
  otpPlaceholder: '000000',
  verifyButton: 'Verify',
  resendOtp: 'Resend Code',

  // Dashboard
  dashboard: 'Dashboard',
  currentMonth: 'Current Month',
  segment: 'Segment',
  pages: 'Pages',
  surahs: 'Surahs',
  juz: 'Juz',
  claimants: 'Claimants',
  completed: 'Completed',
  notCompleted: 'Not Completed',
  claimSegment: 'Claim This Segment',
  alreadyClaimed: 'Already Claimed',
  noSegments: 'No segments available for this month.',

  // Claim Modal
  claimTitle: 'Take Responsibility',
  claimWarning:
    'By claiming this segment, you take responsibility to read pages {start}–{end} of the Quran this month. This action cannot be undone.',
  claimConfirm: 'I Take Responsibility',

  // My Segments
  mySegments: 'My Segments',
  noClaimedSegments: "You haven't claimed any segments yet.",
  markComplete: 'Mark as Complete',
  completedAt: 'Completed',
  completeTitle: 'Confirm Completion',
  completeWarning: 'Are you sure you have completed reading pages {start}–{end}? This action cannot be undone.',
  completeConfirm: "Yes, I've Completed It",
  goToDashboard: 'Go to Dashboard',

  // Admin
  adminPanel: 'Admin Panel',
  settings: 'Settings',
  totalPages: 'Total Pages',
  segmentsPerMonth: 'Segments Per Month',
  reminderIntervalDays: 'Reminder Interval (days)',
  timezone: 'Timezone',
  appUrl: 'App URL',
  saveSettings: 'Save Settings',
  settingsSaved: 'Settings saved successfully',
  regenerateSegments: 'Regenerate Segments',
  regenerateWarning:
    'This will delete all current segments and claims for this month and create new ones. This cannot be undone!',
  regenerateConfirm: 'Regenerate',
  regenerated: 'Segments regenerated',
  sendReminders: 'Send Reminders Now',
  remindersSent: 'Reminders sent',

  // Settings Page
  settingsPage: 'Settings',
  language: 'Language',
  theme: 'Theme',
  lightMode: 'Light',
  darkMode: 'Dark',
  english: 'English',
  german: 'Deutsch',

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    mySegments: 'My Segments',
    admin: 'Admin',
    settings: 'Settings',
  },

  // Misc
  globallyComplete: '✓ Completed',
  claimed: 'claimed',
};

export type Translations = typeof en;
