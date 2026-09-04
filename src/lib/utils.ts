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
