import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Cloud,
  FileCheck,
  Calendar,
  Layers,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  FileSearch,
  RefreshCw
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { usePdfPreview } from '../context/PdfPreviewContext';
import { resolveFileToBlobUrl } from '../lib/fileStorage';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    pdfWorkerUrl || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export default function PdfReviewModal() {
  const { isPdfPreviewOpen, previewTarget, closePdfPreview } = usePdfPreview();

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [resolvedType, setResolvedType] = useState<string>('application/pdf');
  const [resolvedName, setResolvedName] = useState<string>('document.pdf');
  const [resolvedSize, setResolvedSize] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // PDF.js document state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);

  // Viewer controls
  const [zoom, setZoom] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Reset and load document when modal opens or target changes
  useEffect(() => {
    if (!isPdfPreviewOpen || !previewTarget) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      setBlobUrl(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setLoading(false);
      setLoadError(null);
      setZoom(1.2);
      setRotation(0);
      setIsFullscreen(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);
    setLoadError(null);
    setCurrentPage(1);
    setZoom(1.2);
    setRotation(0);

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
          previewTarget.fileName || previewTarget.title || 'document.pdf'
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

        // If it's an image, skip PDF.js parsing
        if (result.type.startsWith('image/')) {
          setLoading(false);
          return;
        }

        // For PDF documents, fetch the raw buffer to avoid iframe/blob security blocks in Chrome
        let uint8Data: Uint8Array;
        if (typeof source !== 'string' && source) {
          const buffer = await source.arrayBuffer();
          uint8Data = new Uint8Array(buffer);
        } else {
          const res = await fetch(result.url);
          const buffer = await res.arrayBuffer();
          uint8Data = new Uint8Array(buffer);
        }

        if (!isSubscribed) return;

        // Load PDF with PDF.js into memory
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
        console.error('[PdfReviewModal] Error loading PDF into Canvas engine:', err);
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
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [isPdfPreviewOpen, previewTarget]);

  // Render current page to Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || resolvedType.startsWith('image/')) {
      return;
    }

    try {
      setRenderingPage(true);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Quality factor for sharp high-DPI rendering
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const effectiveScale = zoom * dpr;

      // Base viewport from PDF with rotation applied
      const totalRotation = (page.rotate + rotation) % 360;
      const viewport = page.getViewport({ scale: effectiveScale, rotation: totalRotation });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Display size on screen
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
      setRenderingPage(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn('[PdfReviewModal] Page rendering warning:', err);
      }
      setRenderingPage(false);
    }
  }, [pdfDoc, currentPage, zoom, rotation, resolvedType]);

  // Trigger render whenever page, zoom, or rotation changes
  useEffect(() => {
    if (pdfDoc && !loading) {
      renderCurrentPage();
    }
  }, [pdfDoc, currentPage, zoom, rotation, loading, renderCurrentPage]);

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
        setZoom((z) => Math.min(Number((z + 0.2).toFixed(2)), 3.0));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.5));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setRotation((r) => (r + 90) % 360);
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        // In Arabic RTL, Right arrow goes to previous page
        setCurrentPage((p) => Math.max(p - 1, 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        // In Arabic RTL, Left arrow goes to next page
        setCurrentPage((p) => Math.min(p + 1, numPages || 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPdfPreviewOpen, isFullscreen, numPages, closePdfPreview]);

  // Controls
  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.2).toFixed(2)), 3.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoom(1.2);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
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

  const handlePrint = async () => {
    if (!blobUrl && !pdfDoc) return;
    setIsPrinting(true);

    try {
      // Use clean hidden iframe with blob URL for native browser print
      if (blobUrl) {
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
            console.warn('[PdfReviewModal] Direct print fallback:', e);
            window.print();
          }
          setTimeout(() => {
            document.body.removeChild(printIframe);
            setIsPrinting(false);
          }, 1500);
        };
      }
    } catch (e) {
      console.error('[PdfReviewModal] Print error:', e);
      setIsPrinting(false);
    }
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
        className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md rtl overflow-hidden select-none"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`bg-surface flex flex-col rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none border-0' : 'w-full max-w-7xl h-[94vh]'
          }`}
        >
          {/* HEADER / TOOLBAR */}
          <header className="px-5 py-3.5 bg-surface-container-high border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Title & Metadata */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0 shadow-inner">
                {isImage ? <Layers size={20} /> : <FileText size={20} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-primary truncate max-w-xs sm:max-w-md">
                    {previewTarget.title || resolvedName}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                    {isImage ? 'صورة' : 'PDF عالي الدقة'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary/70 truncate">
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
                      <span className="text-tertiary font-bold">{previewTarget.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Page Navigation (for PDFs) */}
            {!isImage && numPages > 0 && (
              <div className="flex items-center gap-1.5 bg-surface rounded-2xl px-3 py-1 border border-outline-variant/40 shadow-xs">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || renderingPage}
                  className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-xl transition-all disabled:opacity-30"
                  title="الصفحة السابقة"
                  aria-label="السابق"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="flex items-center gap-1 text-xs font-bold text-primary font-mono px-1">
                  <span className="px-2 py-0.5 rounded-lg bg-surface-container-high">{currentPage}</span>
                  <span className="text-secondary/60">/</span>
                  <span className="text-secondary/80">{numPages}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages || renderingPage}
                  className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-xl transition-all disabled:opacity-30"
                  title="الصفحة التالية"
                  aria-label="التالي"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            )}

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-1 bg-surface rounded-2xl p-1 border border-outline-variant/40 shadow-xs">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-xl transition-all disabled:opacity-30"
                title="تصغير (-)"
                aria-label="تصغير"
              >
                <ZoomOut size={16} />
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2.5 py-1 text-xs font-mono font-black text-primary hover:bg-surface-container rounded-lg transition-all"
                title="إعادة ضبط الحجم"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3.0}
                className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-xl transition-all disabled:opacity-30"
                title="تكبير (+)"
                aria-label="تكبير"
              >
                <ZoomIn size={16} />
              </button>

              <div className="w-[1px] h-5 bg-outline-variant/40 mx-0.5" />

              <button
                onClick={handleRotate}
                className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                title="تدوير 90 درجة (R)"
                aria-label="تدوير"
              >
                <RotateCw size={16} />
                {rotation > 0 && <span className="text-[10px] text-tertiary font-mono">{rotation}°</span>}
              </button>

              {rotation !== 0 && (
                <button
                  onClick={() => setRotation(0)}
                  className="p-2 text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all"
                  title="إلغاء التدوير"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className={`p-2 rounded-xl transition-all ${
                  showInfoDrawer ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:bg-surface hover:text-primary'
                }`}
                title="معلومات الوثيقة"
              >
                <Info size={18} />
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting || (!blobUrl && !pdfDoc)}
                className="p-2 text-secondary hover:text-primary hover:bg-surface rounded-xl transition-all disabled:opacity-40"
                title="طباعة الوثيقة"
                aria-label="طباعة"
              >
                <Printer size={18} />
              </button>

              <button
                onClick={handleDownload}
                disabled={!blobUrl}
                className="px-3.5 py-2 bg-primary text-on-primary hover:opacity-95 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-40"
                title="تحميل الملف"
              >
                <Download size={15} />
                <span className="hidden sm:inline">تحميل</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-secondary hover:text-primary hover:bg-surface rounded-xl transition-all"
                title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                aria-label="ملء الشاشة"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              <div className="w-[1px] h-6 bg-outline-variant/40 mx-1" />

              <button
                onClick={closePdfPreview}
                className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-xl transition-all"
                title="إغلاق المعاينة (Esc)"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* MAIN CANVAS VIEWER AREA */}
          <div className="relative flex-1 bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
            {/* Loading state */}
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 text-white gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black">جاري قراءة ومعالجة ملف PDF...</h3>
                  <p className="text-xs text-slate-400">نظام المعاينة التفاعلي المباشر (Canvas Engine)</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {loadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-slate-900/95 text-white gap-4">
                <div className="w-16 h-16 rounded-3xl bg-error/20 text-error flex items-center justify-center shadow-lg">
                  <AlertTriangle size={32} />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-error">تعذر عرض الملف في المتصفح</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{loadError}</p>
                </div>
                <div className="flex gap-3 mt-2">
                  {blobUrl && (
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      <Download size={18} />
                      تحميل الملف مباشرة
                    </button>
                  )}
                  <button
                    onClick={closePdfPreview}
                    className="px-6 py-3 bg-slate-800 text-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* Page Rendering Spinner */}
            {renderingPage && !loading && (
              <div className="absolute top-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-200 border border-slate-700 shadow-md">
                <RefreshCw size={13} className="animate-spin text-tertiary" />
                <span>جاري تحديث العرض...</span>
              </div>
            )}

            {/* Content Canvas / Image Viewport */}
            {!loading && !loadError && (
              <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-4 sm:p-6">
                {isImage && blobUrl ? (
                  <div
                    className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  >
                    <img
                      src={blobUrl}
                      alt={previewTarget.title}
                      className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 min-w-full">
                    <canvas
                      ref={canvasRef}
                      className="rounded-lg shadow-2xl bg-white max-w-none transition-all duration-150"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Details Slide-in Drawer */}
            <AnimatePresence>
              {showInfoDrawer && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute top-0 bottom-0 start-0 w-80 bg-surface/95 backdrop-blur-xl border-e border-outline-variant/30 shadow-2xl p-6 overflow-y-auto z-30 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                      <h3 className="font-black text-primary flex items-center gap-2">
                        <FileCheck size={18} className="text-tertiary" />
                        بطاقة الوثيقة
                      </h3>
                      <button
                        onClick={() => setShowInfoDrawer(false)}
                        className="p-1 text-secondary hover:text-primary rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs font-bold text-secondary">
                      <div>
                        <span className="block text-outline font-medium mb-1">العنوان الكامل</span>
                        <p className="text-primary text-sm font-black leading-snug">{previewTarget.title}</p>
                      </div>

                      {previewTarget.description && (
                        <div>
                          <span className="block text-outline font-medium mb-1">الوصف أو الملخص</span>
                          <p className="text-secondary/80 font-normal leading-relaxed">{previewTarget.description}</p>
                        </div>
                      )}

                      <div>
                        <span className="block text-outline font-medium mb-1">اسم الملف</span>
                        <p className="font-mono text-primary text-xs break-all" dir="ltr">{resolvedName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-surface-container p-3 rounded-2xl border border-outline-variant/20">
                          <span className="text-[10px] text-outline block">نوع العارض</span>
                          <span className="font-black text-primary text-xs uppercase">{isImage ? 'صورة' : 'HTML5 Canvas'}</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-2xl border border-outline-variant/20">
                          <span className="text-[10px] text-outline block">عدد الصفحات</span>
                          <span className="font-black text-primary text-xs">{numPages || 1}</span>
                        </div>
                      </div>

                      {previewTarget.date && (
                        <div>
                          <span className="block text-outline font-medium mb-1">التاريخ</span>
                          <p className="text-primary font-bold flex items-center gap-1.5">
                            <Calendar size={13} className="text-tertiary" />
                            {previewTarget.date}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="block text-outline font-medium mb-1">طريقة الحفظ</span>
                        <div className="flex items-center gap-2 mt-1">
                          {previewTarget.storageType === 'local' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-[11px]">
                              <HardDrive size={12} />
                              محلياً (IndexedDB)
                            </span>
                          ) : previewTarget.storageType === 'cloud' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px]">
                              <Cloud size={12} />
                              سحابي (Firebase Storage)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-secondary text-[11px]">
                              <ExternalLink size={12} />
                              رابط خارجي
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline-variant/20 space-y-2">
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-primary text-on-primary rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-sm"
                    >
                      <Download size={14} />
                      تنزيل الوثيقة الآن
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full py-2.5 bg-surface-container text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
                    >
                      <Printer size={14} />
                      طباعة الوثيقة
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER BAR */}
          <footer className="px-5 py-2.5 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between text-xs text-secondary/70 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 size={13} />
                معاينة مباشرة آمنة (بدون حظر المتصفح)
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-[11px]">
                اختصارات: (← →) تقليب الصفحات ، (+) تكبير ، (-) تصغير ، (R) تدوير 90° ، (Esc) خروج
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              {!isImage && numPages > 0 && (
                <span className="bg-surface-container-high px-2.5 py-0.5 rounded-md font-bold">
                  صفحة {currentPage} من {numPages}
                </span>
              )}
              <span className="bg-surface-container-high px-2 py-0.5 rounded-md font-mono">
                {Math.round(zoom * 100)}%
              </span>
              {rotation !== 0 && (
                <span className="bg-surface-container-high px-2 py-0.5 rounded-md font-mono text-tertiary">
                  {rotation}°
                </span>
              )}
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
