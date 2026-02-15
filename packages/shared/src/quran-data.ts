/**
 * Static Quran dataset: page → surah and juz mappings
 * Based on the standard Madinah Mushaf (604 pages)
 */

export interface SurahInfo {
  number: number;
  name: string; // Arabic name
  nameEn: string; // English name
  nameDe: string; // German name
  startPage: number;
}

export interface JuzInfo {
  number: number;
  startPage: number;
}

/** All 114 surahs with their starting pages in the Madinah Mushaf */
export const SURAHS: SurahInfo[] = [
  { number: 1, name: 'الفاتحة', nameEn: 'Al-Fatihah', nameDe: 'Die Eröffnung', startPage: 1 },
  { number: 2, name: 'البقرة', nameEn: 'Al-Baqarah', nameDe: 'Die Kuh', startPage: 2 },
  { number: 3, name: 'آل عمران', nameEn: 'Aal-Imran', nameDe: 'Die Sippe Imrans', startPage: 50 },
  { number: 4, name: 'النساء', nameEn: 'An-Nisa', nameDe: 'Die Frauen', startPage: 77 },
  { number: 5, name: 'المائدة', nameEn: "Al-Ma'idah", nameDe: 'Der Tisch', startPage: 106 },
  { number: 6, name: 'الأنعام', nameEn: "Al-An'am", nameDe: 'Das Vieh', startPage: 128 },
  { number: 7, name: 'الأعراف', nameEn: "Al-A'raf", nameDe: 'Die Höhen', startPage: 151 },
  { number: 8, name: 'الأنفال', nameEn: 'Al-Anfal', nameDe: 'Die Beute', startPage: 177 },
  { number: 9, name: 'التوبة', nameEn: 'At-Tawbah', nameDe: 'Die Reue', startPage: 187 },
  { number: 10, name: 'يونس', nameEn: 'Yunus', nameDe: 'Jonas', startPage: 208 },
  { number: 11, name: 'هود', nameEn: 'Hud', nameDe: 'Hud', startPage: 221 },
  { number: 12, name: 'يوسف', nameEn: 'Yusuf', nameDe: 'Josef', startPage: 235 },
  { number: 13, name: 'الرعد', nameEn: "Ar-Ra'd", nameDe: 'Der Donner', startPage: 249 },
  { number: 14, name: 'إبراهيم', nameEn: 'Ibrahim', nameDe: 'Abraham', startPage: 255 },
  { number: 15, name: 'الحجر', nameEn: 'Al-Hijr', nameDe: 'Das Steinland', startPage: 262 },
  { number: 16, name: 'النحل', nameEn: 'An-Nahl', nameDe: 'Die Biene', startPage: 267 },
  { number: 17, name: 'الإسراء', nameEn: 'Al-Isra', nameDe: 'Die Nachtreise', startPage: 282 },
  { number: 18, name: 'الكهف', nameEn: 'Al-Kahf', nameDe: 'Die Höhle', startPage: 293 },
  { number: 19, name: 'مريم', nameEn: 'Maryam', nameDe: 'Maria', startPage: 305 },
  { number: 20, name: 'طه', nameEn: 'Ta-Ha', nameDe: 'Ta-Ha', startPage: 312 },
  { number: 21, name: 'الأنبياء', nameEn: 'Al-Anbiya', nameDe: 'Die Propheten', startPage: 322 },
  { number: 22, name: 'الحج', nameEn: 'Al-Hajj', nameDe: 'Die Pilgerfahrt', startPage: 332 },
  { number: 23, name: 'المؤمنون', nameEn: "Al-Mu'minun", nameDe: 'Die Gläubigen', startPage: 342 },
  { number: 24, name: 'النور', nameEn: 'An-Nur', nameDe: 'Das Licht', startPage: 350 },
  { number: 25, name: 'الفرقان', nameEn: 'Al-Furqan', nameDe: 'Die Unterscheidung', startPage: 359 },
  { number: 26, name: 'الشعراء', nameEn: "Ash-Shu'ara", nameDe: 'Die Dichter', startPage: 367 },
  { number: 27, name: 'النمل', nameEn: 'An-Naml', nameDe: 'Die Ameise', startPage: 377 },
  { number: 28, name: 'القصص', nameEn: 'Al-Qasas', nameDe: 'Die Geschichten', startPage: 385 },
  { number: 29, name: 'العنكبوت', nameEn: 'Al-Ankabut', nameDe: 'Die Spinne', startPage: 396 },
  { number: 30, name: 'الروم', nameEn: 'Ar-Rum', nameDe: 'Die Byzantiner', startPage: 404 },
  { number: 31, name: 'لقمان', nameEn: 'Luqman', nameDe: 'Luqman', startPage: 411 },
  { number: 32, name: 'السجدة', nameEn: 'As-Sajdah', nameDe: 'Die Niederwerfung', startPage: 415 },
  { number: 33, name: 'الأحزاب', nameEn: 'Al-Ahzab', nameDe: 'Die Verbündeten', startPage: 418 },
  { number: 34, name: 'سبأ', nameEn: 'Saba', nameDe: 'Saba', startPage: 428 },
  { number: 35, name: 'فاطر', nameEn: 'Fatir', nameDe: 'Der Schöpfer', startPage: 434 },
  { number: 36, name: 'يس', nameEn: 'Ya-Sin', nameDe: 'Ya-Sin', startPage: 440 },
  { number: 37, name: 'الصافات', nameEn: 'As-Saffat', nameDe: 'Die Reihen', startPage: 446 },
  { number: 38, name: 'ص', nameEn: 'Sad', nameDe: 'Sad', startPage: 453 },
  { number: 39, name: 'الزمر', nameEn: 'Az-Zumar', nameDe: 'Die Scharen', startPage: 458 },
  { number: 40, name: 'غافر', nameEn: 'Ghafir', nameDe: 'Der Vergebende', startPage: 467 },
  { number: 41, name: 'فصلت', nameEn: 'Fussilat', nameDe: 'Ausführlich dargelegt', startPage: 477 },
  { number: 42, name: 'الشورى', nameEn: 'Ash-Shura', nameDe: 'Die Beratung', startPage: 483 },
  { number: 43, name: 'الزخرف', nameEn: 'Az-Zukhruf', nameDe: 'Der Goldschmuck', startPage: 489 },
  { number: 44, name: 'الدخان', nameEn: 'Ad-Dukhan', nameDe: 'Der Rauch', startPage: 496 },
  { number: 45, name: 'الجاثية', nameEn: 'Al-Jathiyah', nameDe: 'Die Kniende', startPage: 499 },
  { number: 46, name: 'الأحقاف', nameEn: 'Al-Ahqaf', nameDe: 'Die Dünen', startPage: 502 },
  { number: 47, name: 'محمد', nameEn: 'Muhammad', nameDe: 'Muhammad', startPage: 507 },
  { number: 48, name: 'الفتح', nameEn: 'Al-Fath', nameDe: 'Der Sieg', startPage: 511 },
  { number: 49, name: 'الحجرات', nameEn: 'Al-Hujurat', nameDe: 'Die Gemächer', startPage: 515 },
  { number: 50, name: 'ق', nameEn: 'Qaf', nameDe: 'Qaf', startPage: 518 },
  { number: 51, name: 'الذاريات', nameEn: 'Adh-Dhariyat', nameDe: 'Die Aufwirbelnden', startPage: 520 },
  { number: 52, name: 'الطور', nameEn: 'At-Tur', nameDe: 'Der Berg', startPage: 523 },
  { number: 53, name: 'النجم', nameEn: 'An-Najm', nameDe: 'Der Stern', startPage: 526 },
  { number: 54, name: 'القمر', nameEn: 'Al-Qamar', nameDe: 'Der Mond', startPage: 528 },
  { number: 55, name: 'الرحمن', nameEn: 'Ar-Rahman', nameDe: 'Der Barmherzige', startPage: 531 },
  { number: 56, name: 'الواقعة', nameEn: "Al-Waqi'ah", nameDe: 'Das Ereignis', startPage: 534 },
  { number: 57, name: 'الحديد', nameEn: 'Al-Hadid', nameDe: 'Das Eisen', startPage: 537 },
  { number: 58, name: 'المجادلة', nameEn: 'Al-Mujadilah', nameDe: 'Die Streitende', startPage: 542 },
  { number: 59, name: 'الحشر', nameEn: 'Al-Hashr', nameDe: 'Die Versammlung', startPage: 545 },
  { number: 60, name: 'الممتحنة', nameEn: 'Al-Mumtahanah', nameDe: 'Die Geprüfte', startPage: 549 },
  { number: 61, name: 'الصف', nameEn: 'As-Saff', nameDe: 'Die Reihe', startPage: 551 },
  { number: 62, name: 'الجمعة', nameEn: "Al-Jumu'ah", nameDe: 'Der Freitag', startPage: 553 },
  { number: 63, name: 'المنافقون', nameEn: 'Al-Munafiqun', nameDe: 'Die Heuchler', startPage: 554 },
  { number: 64, name: 'التغابن', nameEn: 'At-Taghabun', nameDe: 'Die Übervorteilung', startPage: 556 },
  { number: 65, name: 'الطلاق', nameEn: 'At-Talaq', nameDe: 'Die Scheidung', startPage: 558 },
  { number: 66, name: 'التحريم', nameEn: 'At-Tahrim', nameDe: 'Das Verbot', startPage: 560 },
  { number: 67, name: 'الملك', nameEn: 'Al-Mulk', nameDe: 'Die Herrschaft', startPage: 562 },
  { number: 68, name: 'القلم', nameEn: 'Al-Qalam', nameDe: 'Das Schreibrohr', startPage: 564 },
  { number: 69, name: 'الحاقة', nameEn: 'Al-Haqqah', nameDe: 'Die Wahrhaftige', startPage: 566 },
  { number: 70, name: 'المعارج', nameEn: "Al-Ma'arij", nameDe: 'Die Aufstiegswege', startPage: 568 },
  { number: 71, name: 'نوح', nameEn: 'Nuh', nameDe: 'Noah', startPage: 570 },
  { number: 72, name: 'الجن', nameEn: 'Al-Jinn', nameDe: 'Die Dschinn', startPage: 572 },
  { number: 73, name: 'المزمل', nameEn: 'Al-Muzzammil', nameDe: 'Der Eingehüllte', startPage: 574 },
  { number: 74, name: 'المدثر', nameEn: 'Al-Muddaththir', nameDe: 'Der Zugedeckte', startPage: 575 },
  { number: 75, name: 'القيامة', nameEn: 'Al-Qiyamah', nameDe: 'Die Auferstehung', startPage: 577 },
  { number: 76, name: 'الإنسان', nameEn: 'Al-Insan', nameDe: 'Der Mensch', startPage: 578 },
  { number: 77, name: 'المرسلات', nameEn: 'Al-Mursalat', nameDe: 'Die Gesandten', startPage: 580 },
  { number: 78, name: 'النبأ', nameEn: 'An-Naba', nameDe: 'Die Kunde', startPage: 582 },
  { number: 79, name: 'النازعات', nameEn: "An-Nazi'at", nameDe: 'Die Entreißenden', startPage: 583 },
  { number: 80, name: 'عبس', nameEn: 'Abasa', nameDe: 'Er runzelte die Stirn', startPage: 585 },
  { number: 81, name: 'التكوير', nameEn: 'At-Takwir', nameDe: 'Das Einhüllen', startPage: 586 },
  { number: 82, name: 'الانفطار', nameEn: 'Al-Infitar', nameDe: 'Das Zerbrechen', startPage: 587 },
  { number: 83, name: 'المطففين', nameEn: 'Al-Mutaffifin', nameDe: 'Die Betrüger', startPage: 587 },
  { number: 84, name: 'الانشقاق', nameEn: 'Al-Inshiqaq', nameDe: 'Das Zerreißen', startPage: 589 },
  { number: 85, name: 'البروج', nameEn: 'Al-Buruj', nameDe: 'Die Türme', startPage: 590 },
  { number: 86, name: 'الطارق', nameEn: 'At-Tariq', nameDe: 'Der Nachtstern', startPage: 591 },
  { number: 87, name: 'الأعلى', nameEn: "Al-A'la", nameDe: 'Der Höchste', startPage: 591 },
  { number: 88, name: 'الغاشية', nameEn: 'Al-Ghashiyah', nameDe: 'Die Überwältigende', startPage: 592 },
  { number: 89, name: 'الفجر', nameEn: 'Al-Fajr', nameDe: 'Die Morgendämmerung', startPage: 593 },
  { number: 90, name: 'البلد', nameEn: 'Al-Balad', nameDe: 'Die Stadt', startPage: 594 },
  { number: 91, name: 'الشمس', nameEn: 'Ash-Shams', nameDe: 'Die Sonne', startPage: 595 },
  { number: 92, name: 'الليل', nameEn: 'Al-Layl', nameDe: 'Die Nacht', startPage: 595 },
  { number: 93, name: 'الضحى', nameEn: 'Ad-Duha', nameDe: 'Der Vormittag', startPage: 596 },
  { number: 94, name: 'الشرح', nameEn: 'Ash-Sharh', nameDe: 'Das Auftun', startPage: 596 },
  { number: 95, name: 'التين', nameEn: 'At-Tin', nameDe: 'Die Feige', startPage: 597 },
  { number: 96, name: 'العلق', nameEn: 'Al-Alaq', nameDe: 'Das Anhängsel', startPage: 597 },
  { number: 97, name: 'القدر', nameEn: 'Al-Qadr', nameDe: 'Die Bestimmung', startPage: 598 },
  { number: 98, name: 'البينة', nameEn: 'Al-Bayyinah', nameDe: 'Der Beweis', startPage: 598 },
  { number: 99, name: 'الزلزلة', nameEn: 'Az-Zalzalah', nameDe: 'Das Erdbeben', startPage: 599 },
  { number: 100, name: 'العاديات', nameEn: 'Al-Adiyat', nameDe: 'Die Rennenden', startPage: 599 },
  { number: 101, name: 'القارعة', nameEn: "Al-Qari'ah", nameDe: 'Das Verhängnis', startPage: 600 },
  { number: 102, name: 'التكاثر', nameEn: 'At-Takathur', nameDe: 'Die Vermehrung', startPage: 600 },
  { number: 103, name: 'العصر', nameEn: 'Al-Asr', nameDe: 'Die Zeit', startPage: 601 },
  { number: 104, name: 'الهمزة', nameEn: 'Al-Humazah', nameDe: 'Der Stichler', startPage: 601 },
  { number: 105, name: 'الفيل', nameEn: 'Al-Fil', nameDe: 'Der Elefant', startPage: 601 },
  { number: 106, name: 'قريش', nameEn: 'Quraysh', nameDe: 'Die Quraisch', startPage: 602 },
  { number: 107, name: 'الماعون', nameEn: "Al-Ma'un", nameDe: 'Die Hilfeleistung', startPage: 602 },
  { number: 108, name: 'الكوثر', nameEn: 'Al-Kawthar', nameDe: 'Die Fülle', startPage: 602 },
  { number: 109, name: 'الكافرون', nameEn: 'Al-Kafirun', nameDe: 'Die Ungläubigen', startPage: 603 },
  { number: 110, name: 'النصر', nameEn: 'An-Nasr', nameDe: 'Die Hilfe', startPage: 603 },
  { number: 111, name: 'المسد', nameEn: 'Al-Masad', nameDe: 'Die Palmfasern', startPage: 603 },
  { number: 112, name: 'الإخلاص', nameEn: 'Al-Ikhlas', nameDe: 'Die Aufrichtigkeit', startPage: 604 },
  { number: 113, name: 'الفلق', nameEn: 'Al-Falaq', nameDe: 'Das Frühlicht', startPage: 604 },
  { number: 114, name: 'الناس', nameEn: 'An-Nas', nameDe: 'Die Menschen', startPage: 604 },
];

/** All 30 juz (ajza) with their starting pages */
export const JUZS: JuzInfo[] = [
  { number: 1, startPage: 1 },
  { number: 2, startPage: 22 },
  { number: 3, startPage: 42 },
  { number: 4, startPage: 62 },
  { number: 5, startPage: 82 },
  { number: 6, startPage: 102 },
  { number: 7, startPage: 121 },
  { number: 8, startPage: 142 },
  { number: 9, startPage: 162 },
  { number: 10, startPage: 182 },
  { number: 11, startPage: 201 },
  { number: 12, startPage: 222 },
  { number: 13, startPage: 242 },
  { number: 14, startPage: 262 },
  { number: 15, startPage: 282 },
  { number: 16, startPage: 302 },
  { number: 17, startPage: 322 },
  { number: 18, startPage: 342 },
  { number: 19, startPage: 362 },
  { number: 20, startPage: 382 },
  { number: 21, startPage: 402 },
  { number: 22, startPage: 422 },
  { number: 23, startPage: 442 },
  { number: 24, startPage: 462 },
  { number: 25, startPage: 482 },
  { number: 26, startPage: 502 },
  { number: 27, startPage: 522 },
  { number: 28, startPage: 542 },
  { number: 29, startPage: 562 },
  { number: 30, startPage: 582 },
];

/**
 * Get which surahs a page range spans.
 * Returns array of { number, name, nameEn, nameDe }.
 */
export function getSurahsForPageRange(startPage: number, endPage: number): SurahInfo[] {
  const result: SurahInfo[] = [];
  for (let i = 0; i < SURAHS.length; i++) {
    const surah = SURAHS[i];
    const nextSurahStart = i + 1 < SURAHS.length ? SURAHS[i + 1].startPage : 605;
    // surah occupies pages [surah.startPage, nextSurahStart - 1]
    const surahEnd = nextSurahStart - 1;
    if (surah.startPage <= endPage && surahEnd >= startPage) {
      result.push(surah);
    }
  }
  return result;
}

/**
 * Get which juz a page range spans.
 * Returns array of { number }.
 */
export function getJuzsForPageRange(startPage: number, endPage: number): JuzInfo[] {
  const result: JuzInfo[] = [];
  for (let i = 0; i < JUZS.length; i++) {
    const juz = JUZS[i];
    const nextJuzStart = i + 1 < JUZS.length ? JUZS[i + 1].startPage : 605;
    const juzEnd = nextJuzStart - 1;
    if (juz.startPage <= endPage && juzEnd >= startPage) {
      result.push(juz);
    }
  }
  return result;
}
