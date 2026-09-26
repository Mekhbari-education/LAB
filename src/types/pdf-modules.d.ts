declare module 'arabic-persian-reshaper' {
  export const ArabicShaper: {
    convertArabic(text: string): string;
  };
  export const PersianShaper: {
    convertArabic(text: string): string;
  };
}

declare module 'bidi-js' {
  export default function bidiFactory(): {
    getEmbeddingLevels(text: string, direction?: 'ltr' | 'rtl' | 'auto'): Uint8Array | number[];
    getReorderedString(text: string, embeddingLevels: any): string;
    getReorderedIndices(text: string, embeddingLevels: any): number[];
  };
}
