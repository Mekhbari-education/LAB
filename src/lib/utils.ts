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
