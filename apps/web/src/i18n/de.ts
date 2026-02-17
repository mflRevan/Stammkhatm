import type { Translations } from './en';

export const de: Translations = {
  // General
  appName: 'Stammkhatm',
  orgName: 'Haus Des Islam',
  groupName: 'Stammtisch',
  loading: 'Laden...',
  save: 'Speichern',
  cancel: 'Abbrechen',
  confirm: 'Bestätigen',
  close: 'Schließen',
  back: 'Zurück',
  error: 'Fehler',
  success: 'Erfolg',

  // Landing
  landingTitle: 'Stammtisch Khatm',
  landingSubtitle: 'Gemeinsam den Quran vollenden, jeden Monat.',
  landingDescription:
    'Eine private Khatm-Verwaltungs-App für die Stammtisch-Gruppe von Haus Des Islam. Wähle deine Abschnitte, verfolge deinen Fortschritt und vollende den Quran als Gemeinschaft.',
  getStarted: 'Loslegen',
  alreadyHaveAccount: 'Bereits ein Konto?',

  // Auth
  login: 'Anmelden',
  register: 'Registrieren',
  logout: 'Abmelden',
  email: 'E-Mail',
  password: 'Passwort',
  name: 'Name',
  phoneNumber: 'Telefonnummer',
  namePlaceholder: 'Dein vollständiger Name',
  emailPlaceholder: 'deine@email.de',
  phoneNumberPlaceholder: '+49 123 456789',
  passwordPlaceholder: 'Min. 8 Zeichen',
  registerButton: 'Konto erstellen',
  loginButton: 'Anmelden',
  noAccount: 'Noch kein Konto?',
  registerHere: 'Hier registrieren',
  loginHere: 'Hier anmelden',

  // OTP
  verifyEmail: 'E-Mail bestätigen',
  otpSent: 'Wir haben einen 6-stelligen Code gesendet an',
  enterOtp: 'Bestätigungscode eingeben',
  otpPlaceholder: '000000',
  verifyButton: 'Bestätigen',
  resendOtp: 'Code erneut senden',

  // Dashboard
  dashboard: 'Übersicht',
  currentMonth: 'Aktueller Monat',
  segment: 'Abschnitt',
  pages: 'Seiten',
  surahs: 'Suren',
  juz: 'Juz',
  claimants: 'Teilnehmer',
  completed: 'Abgeschlossen',
  notCompleted: 'Nicht abgeschlossen',
  claimSegment: 'Abschnitt übernehmen',
  alreadyClaimed: 'Bereits übernommen',
  segmentTaken: 'Bereits vergeben',
  daysLeft: 'Tage übrig',
  splitStatus: 'Quran-Aufteilung',
  splitActive: 'Aktiv',
  splitDisabled: 'Deaktiviert',
  unclaimedUsers: 'Nicht zugewiesene Nutzer',
  everyoneClaimed: 'Alle haben einen Abschnitt übernommen.',
  noSegments: 'Keine Abschnitte für diesen Monat verfügbar.',

  // Claim Modal
  claimTitle: 'Verantwortung übernehmen',
  claimWarning:
    'Indem du diesen Abschnitt übernimmst, verpflichtest du dich, die Seiten {start}–{end} des Qurans diesen Monat zu lesen. Diese Aktion kann nicht rückgängig gemacht werden.',
  claimConfirm: 'Ich übernehme die Verantwortung',

  // My Segments
  mySegments: 'Meine Abschnitte',
  noClaimedSegments: 'Du hast noch keine Abschnitte übernommen.',
  markComplete: 'Als abgeschlossen markieren',
  releaseSegment: 'Freigeben',
  releaseTitle: 'Abschnitt freigeben',
  releaseWarning:
    'Wenn du die Seiten {start}–{end} freigibst, wird der Abschnitt wieder verfügbar. Fortfahren?',
  releaseConfirm: 'Ja, freigeben',
  completedAt: 'Abgeschlossen',
  completeTitle: 'Abschluss bestätigen',
  completeWarning:
    'Bist du sicher, dass du die Seiten {start}–{end} gelesen hast? Diese Aktion kann nicht rückgängig gemacht werden.',
  completeConfirm: 'Ja, ich habe es abgeschlossen',
  goToDashboard: 'Zur Übersicht',

  // Admin
  adminPanel: 'Admin-Bereich',
  settings: 'Einstellungen',
  totalPages: 'Gesamtseiten',
  segmentsPerMonth: 'Abschnitte pro Monat',
  splitEnabled: 'Aufteilung',
  reminderIntervalDays: 'Erinnerungsintervall (Tage)',
  reminderTarget: 'Erinnerungsziel',
  reminderTargetClaims: 'Nutzer mit offenen Abschnitten',
  reminderTargetUnclaimed: 'Nutzer ohne Abschnitt',
  reminderTemplate: 'Erinnerungsvorlage',
  reminderTemplateHint: 'Verwende [username] und [segment_name].',
  reminderMessagePlaceholder: 'Eigener Erinnerungstext (Platzhalter möglich)…',
  reminderDefault: 'Assalamu Alaikum [username], bitte schließe [segment_name] ab.',
  reminderModalDesc: 'Erinnerung senden, ohne Identitäten offenzulegen.',
  reminderSent: 'Erinnerung gesendet',
  remindUnclaimed: 'Nicht-zugewiesene erinnern',
  segmentStatus: 'Abschnittsstatus',
  segmentStatusDesc: 'Überblick über vergeben, abgeschlossen und fehlend.',
  unclaimedUsersDesc: 'Diese Nutzer haben noch keinen Abschnitt übernommen.',
  sendReminder: 'Erinnerung senden',
  unclaimed: 'Nicht vergeben',
  timezone: 'Zeitzone',
  appUrl: 'App-URL',
  saveSettings: 'Einstellungen speichern',
  settingsSaved: 'Einstellungen erfolgreich gespeichert',
  regenerateSegments: 'Abschnitte neu generieren',
  regenerateWarning:
    'Dies löscht alle aktuellen Abschnitte und Ansprüche für diesen Monat und erstellt neue. Dies kann nicht rückgängig gemacht werden!',
  regenerateConfirm: 'Neu generieren',
  regenerated: 'Abschnitte neu generiert',
  sendReminders: 'Erinnerungen jetzt senden',
  remindersSent: 'Erinnerungen gesendet',

  // Settings Page
  settingsPage: 'Einstellungen',
  language: 'Sprache',
  theme: 'Design',
  lightMode: 'Hell',
  darkMode: 'Dunkel',
  english: 'English',
  german: 'Deutsch',

  // Navigation
  nav: {
    dashboard: 'Übersicht',
    mySegments: 'Meine Abschnitte',
    admin: 'Admin',
    settings: 'Einstellungen',
  },

  // Misc
  globallyComplete: '✓ Abgeschlossen',
  claimed: 'übernommen',
};
