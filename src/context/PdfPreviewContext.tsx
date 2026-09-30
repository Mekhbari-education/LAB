import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PdfPreviewTarget {
  /** Can be an HTTP/HTTPS URL, data URL, blob: URL, or idb:key */
  url?: string;
  /** Or a raw File or Blob object directly from an input or generator */
  file?: File | Blob;
  /** Document title for the reviewer header */
  title: string;
  /** Optional file name e.g. document.pdf */
  fileName?: string;
  /** MIME type e.g. application/pdf, image/png */
  fileType?: string;
  /** File size formatted or in bytes */
  fileSize?: number | string;
  /** Category or tags (e.g. المناشير والتعليمات, تقرير صيانة, إلخ) */
  category?: string;
  /** Date of the document */
  date?: string;
  /** Storage medium indicator */
  storageType?: 'cloud' | 'local' | 'external';
  /** Optional summary or description */
  description?: string;
}

interface PdfPreviewContextType {
  isPdfPreviewOpen: boolean;
  previewTarget: PdfPreviewTarget | null;
  openPdfPreview: (target: PdfPreviewTarget) => void;
  closePdfPreview: () => void;
}

const PdfPreviewContext = createContext<PdfPreviewContextType | undefined>(undefined);

export function PdfPreviewProvider({ children }: { children: ReactNode }) {
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<PdfPreviewTarget | null>(null);

  const openPdfPreview = useCallback((target: PdfPreviewTarget) => {
    setPreviewTarget(target);
    setIsPdfPreviewOpen(true);
  }, []);

  const closePdfPreview = useCallback(() => {
    setIsPdfPreviewOpen(false);
    setPreviewTarget(null);
  }, []);

  return (
    <PdfPreviewContext.Provider
      value={{
        isPdfPreviewOpen,
        previewTarget,
        openPdfPreview,
        closePdfPreview,
      }}
    >
      {children}
    </PdfPreviewContext.Provider>
  );
}

export function usePdfPreview() {
  const context = useContext(PdfPreviewContext);
  if (!context) {
    throw new Error('usePdfPreview must be used within a PdfPreviewProvider');
  }
  return context;
}
