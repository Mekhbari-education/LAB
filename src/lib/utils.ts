import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanSchoolName(name?: string): string {
  if (!name) return '';
  return name
    .replace(
      /^(الطور\s+(المتوسط|الثانوي|الابتدائي)|الطور|التعليم\s+(المتوسط|الثانوي|الابتدائي)|متوسط|ثانوي|ابتدائي)(?![ـ\u0600-\u06FF])\s*[-:]?\s*/i,
      ''
    )
    .trim();
}

/**
 * Formats institution name with its municipality (commune).
 * E.g.: "متوسطة قطاف الطاهر - عين كرشة"
 * Removes any leading "المؤسسة:" prefix and attaches commune cleanly.
 */
export function formatSchoolWithCommune(school?: string, commune?: string): string {
  if (!school && !commune) return '';
  
  // Clean off any leading labels like "المؤسسة:", "المؤسسة التعليمية:", "المؤسسة التربوية:"
  let cleaned = (school || '')
    .replace(/^(المؤسسة\s*التعليمية|المؤسسة\s*التربوية|المؤسسة)\s*[:：\-]?\s*/i, '')
    .trim();

  const trimmedCommune = (commune || '').trim();
  if (!trimmedCommune) {
    return cleaned;
  }

  if (!cleaned) {
    return trimmedCommune;
  }

  // If already contains the commune, don't duplicate
  if (cleaned.includes(trimmedCommune)) {
    return cleaned;
  }

  return `${cleaned} - ${trimmedCommune}`;
}

/**
 * Formats official Algerian laboratory corps rank title to include the definite article "ال",
 * e.g., "ملحق رئيس بالمخابر" -> "الملحق الرئيس بالمخابر",
 * as mandated in official administrative correspondence and signature blocks.
 */
export function formatOfficialRankTitle(rank?: string): string {
  if (!rank) return 'الملحق الرئيس بالمخابر';
  const clean = rank.trim();
  if (!clean) return 'الملحق الرئيس بالمخابر';

  // Normalize specific ranks in Algerian education lab corps
  if (
    clean === 'ملحق رئيس بالمخابر' || 
    clean === 'ملحق رئيسي بالمخابر' || 
    clean === 'الملحق رئيسي بالمخابر' ||
    clean === 'الملحق رئيس بالمخابر'
  ) {
    return 'الملحق الرئيس بالمخابر';
  }
  if (clean === 'ملحق بالمخابر' || clean === 'الملحق بالمخابر') {
    return 'الملحق بالمخابر';
  }
  if (
    clean === 'ملحق مشرف بالمخابر' || 
    clean === 'الملحق مشرف بالمخابر' || 
    clean === 'الملحق المشرف بالمخابر'
  ) {
    return 'الملحق المشرف بالمخابر';
  }
  if (clean === 'عون تقني للمخابر' || clean === 'العون التقني للمخابر') {
    return 'العون التقني للمخابر';
  }
  if (clean === 'عون تقني بالمخابر' || clean === 'العون التقني بالمخابر') {
    return 'العون التقني بالمخابر';
  }
  if (clean === 'معاون تقني للمخابر' || clean === 'المعاون التقني للمخابر') {
    return 'المعاون التقني للمخابر';
  }
  if (clean === 'معاون تقني بالمخابر' || clean === 'المعاون التقني بالمخابر') {
    return 'المعاون التقني بالمخابر';
  }

  // Handle compound prefixes
  if (clean.startsWith('ملحق رئيس')) {
    return clean.replace(/^ملحق رئيس(ي)?/, 'الملحق الرئيس');
  }
  if (clean.startsWith('الملحق رئيس')) {
    return clean.replace(/^الملحق رئيس(ي)?/, 'الملحق الرئيس');
  }
  if (clean.startsWith('ملحق مشرف')) {
    return clean.replace(/^ملحق مشرف/, 'الملحق المشرف');
  }
  if (clean.startsWith('ملحق')) {
    return clean.replace(/^ملحق/, 'الملحق');
  }
  if (clean.startsWith('عون تقني')) {
    return clean.replace(/^عون تقني/, 'العون التقني');
  }
  if (clean.startsWith('معاون تقني')) {
    return clean.replace(/^معاون تقني/, 'المعاون التقني');
  }
  if (clean.startsWith('عون')) {
    return clean.replace(/^عون/, 'العون');
  }
  if (clean.startsWith('معاون')) {
    return clean.replace(/^معاون/, 'المعاون');
  }

  if (clean.startsWith('ال')) {
    return clean;
  }

  return 'ال' + clean;
}

/**
 * Computes the next official working day for Algerian educational institutions
 * (working days are Sunday through Thursday, weekend is Friday and Saturday).
 * - Sunday through Wednesday reports -> released on next calendar day (+1 day)
 * - Thursday reports -> released on Sunday (+3 days, skipping Fri & Sat)
 * - Friday/Saturday fallback -> released on Sunday
 * Output format: YYYY-MM-DD
 */
export function getNextWorkingDay(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  let year: number;
  let month: number; // 0-indexed
  let day: number;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  } else {
    const str = String(dateInput).trim();
    const match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10) - 1;
      day = parseInt(match[3], 10);
    } else {
      const parsed = new Date(str);
      if (isNaN(parsed.getTime())) return str;
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  }

  // Construct local date without timezone interference
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

  let daysToAdd = 1;
  if (dayOfWeek === 4) {
    // Thursday -> next working day is Sunday (+3 days)
    daysToAdd = 3;
  } else if (dayOfWeek === 5) {
    // Friday -> next working day is Sunday (+2 days)
    daysToAdd = 2;
  } else if (dayOfWeek === 6) {
    // Saturday -> next working day is Sunday (+1 day)
    daysToAdd = 1;
  } else {
    // Sunday (0), Monday (1), Tuesday (2), Wednesday (3) -> next day (+1)
    daysToAdd = 1;
  }

  d.setDate(d.getDate() + daysToAdd);

  const nextYear = d.getFullYear();
  const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
  const nextDay = String(d.getDate()).padStart(2, '0');

  return `${nextYear}-${nextMonth}-${nextDay}`;
}
