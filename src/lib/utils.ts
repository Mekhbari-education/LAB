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
