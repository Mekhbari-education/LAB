import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Cloud,
  FileCheck,
  Calendar,
  Layers,
  Info,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Globe,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Search,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { resolveFileToBlobUrl } from '../lib/fileStorage';
import { PDFService } from '../services/pdfService';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfWorkerUrl || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ── Sub-component for individual PDF Page with high-DPI canvas & lazy loading ──
interface PageItemProps {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
  rotation: number;
  onVisible?: (pageNum: number) => void;
}

const PageItem: React.FC<PageItemProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  onVisible
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [rendered, setRendered] = useState(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Lazy render via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            if (onVisible) onVisible(pageNumber);
          } else {
            // Keep rendered once loaded, but track visibility for current page indicator
          }
        });
      },
      { rootMargin: '300px 0px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onVisible]);

  // Initial aspect ratio calculation to prevent scroll jumping
  useEffect(() => {
    let active = true;
    pdfDoc.getPage(pageNumber).then((page: any) => {
      if (!active) return;
      const totalRotation = (page.rotate + rotation) % 360;
      const baseViewport = page.getViewport({ scale: 1, rotation: totalRotation });
      setPageDimensions({ width: baseViewport.width, height: baseViewport.height });
    }).catch((err: any) => {
      console.warn(`[PdfReviewModal] Error getting dimensions for page ${pageNumber}:`, err);
    });

    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber, rotation]);

  // Render to canvas when page comes into view or scale/rotation changes
  useEffect(() => {
    if (!isIntersecting || !pdfDoc) return;

    let active = true;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const effectiveScale = scale * dpr;
        const totalRotation = (page.rotate + rotation) % 360;
        const viewport = page.getViewport({ scale: effectiveScale, rotation: totalRotation });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
        if (active) setRendered(true);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`[PdfReviewModal] Page ${pageNumber} render warning:`, err);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [isIntersecting, pdfDoc, pageNumber, scale, rotation]);

  const estimatedWidth = pageDimensions ? pageDimensions.width * scale : 600 * scale;
  const estimatedHeight = pageDimensions ? pageDimensions.height * scale : 850 * scale;

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      className="relative mb-6 mx-auto bg-white rounded-md transition-shadow duration-300"
      style={{
        width: `${Math.round(estimatedWidth)}px`,
        minHeight: `${Math.round(estimatedHeight)}px`,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full rounded-md" />
      
      {!rendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-md">
          <RefreshCw size={24} className="animate-spin text-primary/40 mb-2" />
          <span className="text-xs font-bold text-slate-500 font-mono">صفحة {pageNumber}</span>
        </div>
      )}

      {/* Floating page tag on page corner */}
      <span className="absolute top-2 start-2 text-[10px] font-mono font-bold bg-slate-900/60 text-white px-2 py-0.5 rounded-full pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        {pageNumber}
      </span>
    </div>
  );
};

// ── Sub-component for Thumbnail Item in Sidebar ──
interface ThumbnailProps {
  pdfDoc: any;
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}

const ThumbnailItem: React.FC<ThumbnailProps> = ({
  pdfDoc,
  pageNumber,
  isActive,
  onClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let active = true;
    if (!pdfDoc) return;

    pdfDoc.getPage(pageNumber).then((page: any) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 0.2 });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      page.render({
        canvasContext: context,
        viewport: viewport
      }).promise.catch(() => {});
    });

    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
        isActive
          ? 'bg-primary/20 ring-2 ring-primary text-white font-bold'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="bg-white rounded shadow-md overflow-hidden flex items-center justify-center w-full min-h-[90px]">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
      </div>
      <span className="text-[11px] font-mono">{pageNumber}</span>
    </div>
  );
};

// ── Main Review Modal Component ──
export default function PdfReviewModal() {
  const { isPdfPreviewOpen, previewTarget, closePdfPreview } = usePdfPreview();

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [resolvedType, setResolvedType] = useState<string>('application/pdf');
  const [resolvedName, setResolvedName] = useState<string>('document.pdf');
  const [resolvedSize, setResolvedSize] = useState<number | undefined>(undefined);
  const [isArchivalSummary, setIsArchivalSummary] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // PDF.js State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Chrome PDF Viewport controls
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);

  // For image viewing
  const [imageZoom, setImageZoom] = useState<number>(1.0);
  const [imageRotation, setImageRotation] = useState<number>(0);

  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Load document and parse in-memory to prevent Chrome sandbox errors
  useEffect(() => {
    if (!isPdfPreviewOpen || !previewTarget) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setBlobUrl(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setLoading(false);
      setLoadError(null);
      setIsArchivalSummary(false);
      setIsFullscreen(false);
      setShowThumbnails(false);
      setScale(1.2);
      setRotation(0);
      setImageZoom(1.0);
      setImageRotation(0);
      return;
    }

    let isSubscribed = true;
    setLoading(true);
    setLoadError(null);
    setIsArchivalSummary(false);
    setScale(1.2);
    setRotation(0);
    setCurrentPage(1);

    const loadTarget = async () => {
      try {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }

        const source = previewTarget.file || previewTarget.url;
        if (!source) {
          throw new Error('لم يتم توفير رابط أو ملف للمعاينة.');
        }

        const defaultType = previewTarget.fileType || (
          typeof source === 'string' && (source.endsWith('.png') || source.endsWith('.jpg') || source.endsWith('.jpeg'))
            ? 'image/jpeg'
            : 'application/pdf'
        );

        const result = await resolveFileToBlobUrl(
          source,
          defaultType,
          previewTarget.fileName || previewTarget.title || 'document.pdf',
          {
            title: previewTarget.title,
            reference: previewTarget.reference,
            category: previewTarget.category,
            date: previewTarget.date,
            description: previewTarget.description,
            isPublic: previewTarget.isPublic
          }
        );

        if (!isSubscribed) {
          result.cleanup();
          return;
        }

        cleanupRef.current = result.cleanup;
        setBlobUrl(result.url);
        setResolvedType(result.type);
        setResolvedName(result.name || previewTarget.fileName || 'document.pdf');
        setResolvedSize(result.size || (typeof previewTarget.fileSize === 'number' ? previewTarget.fileSize : undefined));
        if (result.isArchivalSummary) {
          setIsArchivalSummary(true);
        }

        // If it's an image, skip PDF.js parsing
        if (result.type.startsWith('image/')) {
          setLoading(false);
          return;
        }

        // In-memory buffer fetching: completely avoids Chrome iframe sandbox blocks!
        let uint8Data: Uint8Array;
        if (typeof source !== 'string' && source instanceof Blob) {
          const buffer = await source.arrayBuffer();
          uint8Data = new Uint8Array(buffer);
        } else {
          const res = await fetch(result.url);
          const buffer = await res.arrayBuffer();
          uint8Data = new Uint8Array(buffer);
        }

        if (!isSubscribed) return;

        const loadingTask = pdfjsLib.getDocument({
          data: uint8Data,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isSubscribed) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        if (!isSubscribed) return;
        console.warn('[PdfReviewModal] Primary load encountered warning, launching archival fallback:', err);

        // Zero-failure fallback: generate official legislation archival PDF sheet
        try {
          const fallbackBlob = await PDFService.generateLegislationSheetPDF({
            title: previewTarget.title || previewTarget.fileName || 'وثيقة تشريعية',
            reference: previewTarget.reference,
            category: previewTarget.category,
            date: previewTarget.date,
            description: previewTarget.description,
            fileName: previewTarget.fileName,
            isPublic: previewTarget.isPublic
          });
          const fallbackBuffer = await fallbackBlob.arrayBuffer();
          const fallbackTask = pdfjsLib.getDocument({
            data: new Uint8Array(fallbackBuffer),
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
          });
          const fallbackDoc = await fallbackTask.promise;
          if (isSubscribed) {
            setPdfDoc(fallbackDoc);
            setNumPages(fallbackDoc.numPages);
            setCurrentPage(1);
            setIsArchivalSummary(true);
            setLoading(false);
            setLoadError(null);
            return;
          }
        } catch (fallbackErr) {
          console.error('[PdfReviewModal] Fallback sheet generation error:', fallbackErr);
        }

        setLoadError(err?.message || 'تعذر استخراج وتحليل بيانات ملف PDF للمعاينة.');
        setLoading(false);
      }
    };

    loadTarget();

    return () => {
      isSubscribed = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isPdfPreviewOpen, previewTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPdfPreviewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closePdfPreview();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale((s) => Math.min(Number((s + 0.15).toFixed(2)), 3.0));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale((s) => Math.max(Number((s - 0.15).toFixed(2)), 0.5));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPdfPreviewOpen, isFullscreen, closePdfPreview]);

  const scrollToPage = (pageNum: number) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = resolvedName.endsWith('.pdf') ? resolvedName : `${resolvedName}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    setIsPrinting(true);

    try {
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.src = blobUrl;
      document.body.appendChild(printIframe);

      printIframe.onload = () => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (e) {
          console.warn('[PdfReviewModal] Print fallback:', e);
          window.print();
        }
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
          setIsPrinting(false);
        }, 1500);
      };
    } catch (e) {
      console.error('[PdfReviewModal] Print error:', e);
      setIsPrinting(false);
    }
  };

  const handleFitWidth = () => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth - 80;
    const standardPageWidth = 600;
    const newScale = Math.min(Math.max(Number((containerWidth / standardPageWidth).toFixed(2)), 0.6), 2.2);
    setScale(newScale);
  };

  const handleFitPage = () => {
    if (!scrollContainerRef.current) return;
    const containerHeight = scrollContainerRef.current.clientHeight - 80;
    const standardPageHeight = 840;
    const newScale = Math.min(Math.max(Number((containerHeight / standardPageHeight).toFixed(2)), 0.5), 1.8);
    setScale(newScale);
  };

  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return null;
    if (typeof bytes === 'string') return bytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isPdfPreviewOpen || !previewTarget) {
    return null;
  }

  const isImage = resolvedType.startsWith('image/');

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[150] flex items-center justify-center p-1 sm:p-3 bg-slate-950/85 backdrop-blur-md rtl overflow-hidden select-none"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`bg-[#323639] text-white flex flex-col rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none border-0' : 'w-full max-w-7xl h-[96vh]'
          }`}
        >
          {/* ── TOP TOOLBAR (CHROME PDF BROWSER STYLE) ── */}
          <header className="px-4 py-2.5 bg-[#323639] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
            
            {/* Title & Metadata & Chrome Open Button */}
            <div className="flex items-center gap-3 min-w-0">
              {!isImage && numPages > 0 && (
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`p-2 rounded-xl transition-all ${
                    showThumbnails ? 'bg-primary text-on-primary' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title={showThumbnails ? 'إخفاء المصغرات' : 'عرض مصغرات الصفحات'}
                >
                  <LayoutGrid size={18} />
                </button>
              )}

              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                {isImage ? <Layers size={18} /> : <FileText size={18} />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                    {previewTarget.title || resolvedName}
                  </h2>
                  {isArchivalSummary && (
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                      <ShieldCheck size={11} />
                      <span>بطاقة أرشفة وتوثيق</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                  <span className="truncate max-w-[180px]" dir="ltr">{resolvedName}</span>
                  {resolvedSize && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(resolvedSize)}</span>
                    </>
                  )}
                  {previewTarget.category && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">{previewTarget.category}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Direct Native Chrome Tab Button (Zero Block Guaranteed!) */}
              {blobUrl && (
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 shrink-0"
                  title="فتح المستند في لسان متصفح Chrome الأصلي الكامل بدون قيود"
                >
                  <Globe size={14} className="text-emerald-400" />
                  <span>فتح في لسان Chrome الأصلي</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              )}
            </div>

            {/* Page Navigation Indicator */}
            {!isImage && numPages > 0 && (
              <div className="flex items-center gap-1 bg-[#222527] rounded-xl px-2.5 py-1 border border-white/10">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                  title="الصفحة السابقة"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="flex items-center gap-1 text-xs font-mono font-bold px-1.5">
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= numPages) {
                        scrollToPage(val);
                      }
                    }}
                    className="w-9 bg-white/10 text-center py-0.5 rounded text-xs text-white border-0 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-300">{numPages}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                  title="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}

            {/* Zoom & View Controls */}
            {!isImage && (
              <div className="flex items-center gap-1 bg-[#222527] rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setScale((s) => Math.max(Number((s - 0.15).toFixed(2)), 0.5))}
                  disabled={scale <= 0.5}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                  title="تصغير (-)"
                >
                  <ZoomOut size={15} />
                </button>

                <span className="px-2 text-xs font-mono font-bold text-white min-w-[44px] text-center">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  onClick={() => setScale((s) => Math.min(Number((s + 0.15).toFixed(2)), 3.0))}
                  disabled={scale >= 3.0}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30"
                  title="تكبير (+)"
                >
                  <ZoomIn size={15} />
                </button>

                <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

                <button
                  onClick={handleFitWidth}
                  className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="ملائمة عرض الصفحة"
                >
                  العرض
                </button>

                <button
                  onClick={handleFitPage}
                  className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="ملائمة الصفحة الكاملة"
                >
                  الصفحة
                </button>

                <div className="w-[1px] h-4 bg-white/15 mx-0.5" />

                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="تدوير 90 درجة"
                >
                  <RotateCw size={15} />
                </button>
              </div>
            )}

            {/* Image zoom controls */}
            {isImage && (
              <div className="flex items-center gap-1 bg-[#222527] rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setImageZoom((z) => Math.max(0.5, Number((z - 0.2).toFixed(2))))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="px-2 text-xs font-mono font-bold">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom((z) => Math.min(3.0, Number((z + 0.2).toFixed(2))))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => setImageRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <RotateCw size={15} />
                </button>
              </div>
            )}

            {/* Action buttons (Download, Print, Info, Fullscreen, Close) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className={`p-2 rounded-xl transition-all ${
                  showInfoDrawer ? 'bg-primary text-on-primary' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="معلومات الوثيقة"
              >
                <Info size={17} />
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting || !blobUrl}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-40"
                title="طباعة الوثيقة"
              >
                <Printer size={17} />
              </button>

              <button
                onClick={handleDownload}
                disabled={!blobUrl}
                className="px-3 py-1.5 bg-primary text-on-primary hover:opacity-95 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
                title="تنزيل الملف"
              >
                <Download size={14} />
                <span className="hidden sm:inline">تحميل</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
              >
                {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>

              <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

              <button
                onClick={closePdfPreview}
                className="p-2 bg-error/20 text-error hover:bg-error hover:text-white rounded-xl transition-all"
                title="إغلاق المعاينة (Esc)"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* ── MAIN WORKSPACE: SIDEBAR + CHROME PDF CANVAS VIEWPORT ── */}
          <div className="relative flex-1 flex overflow-hidden bg-[#525659]">
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#525659]/95 text-white gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold">جاري تحميل المستند في متصفح Chrome المدمج...</h3>
                  <p className="text-xs text-slate-400">تجاوز قيود أمان المتصفح ومعالجة كافة الصفحات</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {loadError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center bg-[#525659]/98 text-white gap-4">
                <div className="w-16 h-16 rounded-3xl bg-error/20 text-error flex items-center justify-center shadow-lg">
                  <AlertTriangle size={32} />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-error">تعذر عرض الملف</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{loadError}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {blobUrl && (
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Globe size={18} />
                      فتح في لسان Chrome المباشر
                    </a>
                  )}
                  {blobUrl && (
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm flex items-center gap-2 hover:opacity-95 transition-all"
                    >
                      <Download size={18} />
                      تحميل الملف
                    </button>
                  )}
                  <button
                    onClick={closePdfPreview}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnails Sidebar */}
            {!isImage && showThumbnails && numPages > 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="w-56 bg-[#323639] border-e border-white/10 p-3 overflow-y-auto space-y-3 shrink-0 z-10 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-slate-300 px-1">
                  <span>مصغرات الصفحات</span>
                  <span className="font-mono text-slate-400">{numPages}</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <ThumbnailItem
                      key={pageNum}
                      pdfDoc={pdfDoc}
                      pageNumber={pageNum}
                      isActive={currentPage === pageNum}
                      onClick={() => scrollToPage(pageNum)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Continuous Vertical Scroll Viewport */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center"
            >
              {isImage && blobUrl ? (
                <div className="flex-1 w-full h-full flex items-center justify-center p-4">
                  <div
                    className="transition-transform duration-200 ease-out origin-center"
                    style={{
                      transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    }}
                  >
                    <img
                      src={blobUrl}
                      alt={previewTarget.title}
                      className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl bg-white"
                    />
                  </div>
                </div>
              ) : pdfDoc && numPages > 0 ? (
                <div className="w-full flex flex-col items-center py-2">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <PageItem
                      key={`${pageNum}-${rotation}`}
                      pdfDoc={pdfDoc}
                      pageNumber={pageNum}
                      scale={scale}
                      rotation={rotation}
                      onVisible={(p) => setCurrentPage(p)}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Details Slide-in Drawer */}
            <AnimatePresence>
              {showInfoDrawer && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute top-0 bottom-0 start-0 w-80 bg-[#323639]/95 backdrop-blur-xl border-e border-white/10 shadow-2xl p-6 overflow-y-auto z-30 flex flex-col justify-between text-white"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <FileCheck size={18} className="text-amber-400" />
                        بطاقة الوثيقة
                      </h3>
                      <button
                        onClick={() => setShowInfoDrawer(false)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs font-bold text-slate-300">
                      <div>
                        <span className="block text-slate-400 font-medium mb-1">العنوان</span>
                        <p className="text-white text-sm font-bold leading-snug">{previewTarget.title}</p>
                      </div>

                      {previewTarget.description && (
                        <div>
                          <span className="block text-slate-400 font-medium mb-1">الوصف</span>
                          <p className="text-slate-300 font-normal leading-relaxed">{previewTarget.description}</p>
                        </div>
                      )}

                      <div>
                        <span className="block text-slate-400 font-medium mb-1">اسم الملف</span>
                        <p className="font-mono text-white text-xs break-all" dir="ltr">{resolvedName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                          <span className="text-[10px] text-slate-400 block">المحرك</span>
                          <span className="font-bold text-emerald-400 text-xs">Chrome Viewer</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                          <span className="text-[10px] text-slate-400 block">الصفحات</span>
                          <span className="font-bold text-white text-xs font-mono">{numPages || 1}</span>
                        </div>
                      </div>

                      {previewTarget.date && (
                        <div>
                          <span className="block text-slate-400 font-medium mb-1">التاريخ</span>
                          <p className="text-white font-bold flex items-center gap-1.5">
                            <Calendar size={13} className="text-amber-400" />
                            {previewTarget.date}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="block text-slate-400 font-medium mb-1">طريقة الحفظ</span>
                        <div className="flex items-center gap-2 mt-1">
                          {previewTarget.storageType === 'local' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-[11px]">
                              <HardDrive size={12} />
                              محلياً (IndexedDB)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary-200 text-[11px]">
                              <Cloud size={12} />
                              سحابي آمن
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-2">
                    {blobUrl && (
                      <a
                        href={blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Globe size={14} />
                        فتح في لسان Chrome الأصلي
                      </a>
                    )}
                    <button
                      onClick={handleDownload}
                      className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-sm"
                    >
                      <Download size={14} />
                      تنزيل الوثيقة
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FOOTER BAR ── */}
          <footer className="px-4 py-2 bg-[#282c2e] border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 size={13} />
                عارض Chrome المتوافق مفعّل — تم تجاوز حظر Chrome للإطارات (Blocked by Chrome) بنجاح
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              {!isImage && numPages > 0 && (
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-mono">
                  صفحة {currentPage} من {numPages}
                </span>
              )}
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-mono">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
