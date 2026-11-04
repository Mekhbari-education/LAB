import { PrintSettings, PrintPreviewData, DEFAULT_PRINT_SETTINGS } from '../types/printSettings';
import { formatSchoolWithCommune } from '../lib/utils';
import logo from '/ministry-logo.png';
import DOMPurify from 'dompurify';

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  return DOMPurify.sanitize(rawHtml, {
    FORCE_BODY: false,
    ADD_TAGS: ['style', 'head', 'body', 'html', 'title', 'link'],
    ADD_ATTR: [
      'target', 'style', 'class', 'align', 'valign', 'border', 
      'cellpadding', 'cellspacing', 'dir', 'href', 'rel', 'width', 'height',
      'colspan', 'rowspan', 'scope', 'id', 'name', 'nowrap'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'formaction']
  });
}

/**
 * Robust Printing Service for Lab Education DZ
 * Handles direct browser printing via hidden iframes without popups or blocked windows,
 * and formats official documents following Algerian Ministry of National Education standards.
 */
export class PrintService {
  private static iframeInstance: HTMLIFrameElement | null = null;

  /**
   * Prints arbitrary HTML content using an offscreen sandboxed iframe.
   * This prevents popup blockers, avoids window.open, and doesn't interfere with the main app view.
   */
  static async printHtml(htmlContent: string, options?: { title?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clean up any existing print iframe
        if (this.iframeInstance && document.body.contains(this.iframeInstance)) {
          document.body.removeChild(this.iframeInstance);
          this.iframeInstance = null;
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-10000px';
        iframe.style.top = '-10000px';
        iframe.style.width = '1200px';
        iframe.style.height = '800px';
        iframe.style.border = '0';
        iframe.style.opacity = '0.01';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '-9999';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.title = options?.title || 'طباعة الوثيقة';

        document.body.appendChild(iframe);
        this.iframeInstance = iframe;

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) {
          throw new Error('Unable to access iframe document for printing');
        }

        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Wait for styles, fonts, and images to settle before triggering print dialog
        const triggerPrint = () => {
          try {
            const win = iframe.contentWindow;
            if (!win) {
              resolve();
              return;
            }

            win.focus();
            
            // Listen for print completion or cancellation
            const handleAfterPrint = () => {
              win.removeEventListener('afterprint', handleAfterPrint);
              setTimeout(() => {
                if (iframe && document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 1000);
              resolve();
            };

            win.addEventListener('afterprint', handleAfterPrint);

            // Trigger print dialog
            setTimeout(() => {
              try {
                win.print();
                // Fallback resolver if afterprint doesn't fire in certain browsers
                setTimeout(() => resolve(), 3000);
              } catch (printErr) {
                console.warn('Direct iframe print encountered an issue, fallback:', printErr);
                resolve();
              }
            }, 300);
          } catch (err) {
            console.error('Error triggering print inside iframe:', err);
            reject(err);
          }
        };

        if (doc.readyState === 'complete') {
          triggerPrint();
        } else {
          iframe.onload = triggerPrint;
        }
      } catch (error) {
        console.error('Print service error:', error);
        reject(error);
      }
    });
  }

  /**
   * Opens HTML content in a new browser tab and triggers print dialog,
   * satisfying user requirements for direct print tabs with official preview.
   */
  static async printInNewTab(
    htmlContent: string,
    options?: {
      title?: string;
      existingWindow?: Window | null;
      autoPrint?: boolean;
    }
  ): Promise<void> {
    const title = options?.title || 'طباعة الوثيقة';
    let targetWin = options?.existingWindow;

    // If no window was provided or it was closed, open a new tab
    if (!targetWin || targetWin.closed) {
      try {
        targetWin = window.open('', '_blank');
      } catch (err) {
        console.warn('Could not open new window directly:', err);
      }
    }

    // Fallback to iframe if popups are completely blocked
    if (!targetWin) {
      console.warn('Window popup blocked, falling back to hidden iframe print');
      return this.printHtml(htmlContent, { title });
    }

    try {
      targetWin.document.open();
      targetWin.document.write(htmlContent);
      targetWin.document.close();
      try {
        targetWin.document.title = title;
      } catch (e) {
        // ignore
      }

      const autoPrint = options?.autoPrint !== false;
      if (autoPrint) {
        setTimeout(() => {
          try {
            targetWin?.focus();
            targetWin?.print();
          } catch (printErr) {
            console.warn('Failed to call print() on new tab:', printErr);
          }
        }, 450);
      }
    } catch (err) {
      console.error('Error populating new print tab:', err);
      return this.printHtml(htmlContent, { title });
    }
  }

  /**
   * Generates a complete, styled HTML document for reports, inventories, or tables
   * incorporating the active PrintSettings.
   */
  static generateReportHtml(data: PrintPreviewData, settings: PrintSettings = DEFAULT_PRINT_SETTINGS): string {
    const {
      title,
      subtitle,
      headers = [],
      rows = [],
      summaryCards = [],
      notes,
      suggestedOrientation,
      customHtml: rawCustomHtml
    } = data;

    let extractedCustomBody = '';
    let extractedCustomStyles = '';
    if (rawCustomHtml) {
      const styleMatches = rawCustomHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatches) {
        extractedCustomStyles = styleMatches
          .map(tag => tag.replace(/<\/?style[^>]*>/gi, ''))
          .join('\n');
      }
      const bodyMatch = rawCustomHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        extractedCustomBody = sanitizeHtml(bodyMatch[1]);
      } else {
        extractedCustomBody = sanitizeHtml(rawCustomHtml);
      }
    }

    const hasBuiltInHeader = Boolean(
      extractedCustomBody && (
        extractedCustomBody.includes('republic-header') ||
        extractedCustomBody.includes('official-header') ||
        extractedCustomBody.includes('institution-bar') ||
        extractedCustomBody.includes('title-banner') ||
        extractedCustomBody.includes('inst-info')
      )
    );

    const hasBuiltInSignatures = Boolean(
      extractedCustomBody && (
        extractedCustomBody.includes('signatures-grid') ||
        extractedCustomBody.includes('signatures-section') ||
        extractedCustomBody.includes('signatures-table') ||
        extractedCustomBody.includes('sig-box')
      )
    );

    const orientation = (settings.layout.orientation && settings.layout.orientation !== 'auto') 
      ? settings.layout.orientation 
      : (suggestedOrientation || 'portrait');
    const paperSize = settings.layout.paperSize || 'a4';

    // Sheet dimensions in mm
    const sheetWidth = paperSize === 'a3' 
      ? (orientation === 'landscape' ? '420mm' : '297mm')
      : paperSize === 'a5'
      ? (orientation === 'landscape' ? '210mm' : '148mm')
      : paperSize === 'letter'
      ? (orientation === 'landscape' ? '279.4mm' : '215.9mm')
      : (orientation === 'landscape' ? '297mm' : '210mm');

    const sheetMinHeight = paperSize === 'a3'
      ? (orientation === 'landscape' ? '297mm' : '420mm')
      : paperSize === 'a5'
      ? (orientation === 'landscape' ? '148mm' : '210mm')
      : paperSize === 'letter'
      ? (orientation === 'landscape' ? '215.9mm' : '279.4mm')
      : (orientation === 'landscape' ? '210mm' : '297mm');

    // Margins mapping in mm
    let marginMm = 14;
    if (settings.layout.margins === 'compact') marginMm = 8;
    if (settings.layout.margins === 'spacious') marginMm = 20;

    // Scale / Font sizes
    let scaleMultiplier = 1;
    if (settings.layout.fontSizeScale === 'small') scaleMultiplier = 0.88;
    if (settings.layout.fontSizeScale === 'large') scaleMultiplier = 1.15;
    if (settings.layout.customScalePercent && settings.layout.customScalePercent !== 100) {
      scaleMultiplier *= (settings.layout.customScalePercent / 100);
    }

    // Color mode rules
    const isGrayscale = settings.appearance.colorMode === 'grayscale';
    const isBw = settings.appearance.colorMode === 'blackAndWhite';

    const brandPrimary = isBw ? '#000000' : isGrayscale ? '#1a1a1a' : '#2b3d22';
    const brandAccent = isBw ? '#333333' : isGrayscale ? '#444444' : '#415437';
    const bgHeader = isBw ? '#000000' : isGrayscale ? '#e2e2e2' : '#2b3d22';
    const textHeader = isBw ? '#ffffff' : isGrayscale ? '#000000' : '#ffffff';
    const rowZebraBg = settings.appearance.tableStriped
      ? (isBw ? '#ffffff' : isGrayscale ? '#f5f5f5' : '#f9faf7')
      : '#ffffff';
    const borderColor = isBw ? '#000000' : '#d2d8ce';

    // Windows Print Settings additions
    const gutterMm = settings.layout?.gutterMm || 0;
    const lineHeightVal = settings.layout?.lineHeight === 'compact' ? '1.3' : settings.layout?.lineHeight === 'relaxed' ? '1.7' : '1.45';
    const borderStyleVal = settings.appearance?.borderStyle || 'standard';
    const tableBorderColor = (isBw || settings.appearance?.highContrastBorders || borderStyleVal === 'high_contrast') 
      ? '#000000' 
      : borderStyleVal === 'double_official' 
      ? '#2b3d22' 
      : borderColor;

    // Watermark text
    let watermarkText = '';
    const wm = settings.appearance?.watermark;
    if (wm === 'official') watermarkText = 'رسمي';
    else if (wm === 'draft') watermarkText = 'مسودة';
    else if (wm === 'confidential') watermarkText = 'سري للغاية';
    else if (wm === 'certified') watermarkText = 'نسخة مصادق عليها';
    else if (wm === 'lab_copy') watermarkText = 'خاص بالمخبر';
    else if (wm === 'custom') watermarkText = settings.appearance?.customWatermarkText || '';

    const currentDate = new Date().toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('ar-DZ', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const inst = settings.institution;
    const sig = settings.signatures;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title} — ${inst.school}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'ManaraDocs';
      src: url('/ManaraDocs_Amatti.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'ManaraDocsAmatti';
      src: url('/ManaraDocs_Amatti.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    @page {
      size: ${paperSize} ${orientation} !important;
      margin: ${marginMm}mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: ${settings.layout.fontFamily === 'ManaraDocs' ? "'ManaraDocs', 'ManaraDocsAmatti', 'Cairo', 'Amiri', sans-serif" : `'${settings.layout.fontFamily || 'Cairo'}', 'Cairo', 'Amiri', 'Segoe UI', Tahoma, sans-serif`};
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      background-color: #ffffff;
      font-size: ${11 * scaleMultiplier}pt;
      line-height: ${lineHeightVal};
      direction: rtl;
    }

    /* Page Container */
    .sheet {
      width: 100%;
      background: #ffffff;
      padding-right: ${gutterMm}mm;
      position: relative;
    }

    /* Official Ministry Header */
    .official-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: ${isBw ? '2px solid #000' : '1.5px solid ' + borderColor};
    }

    .republic-title {
      text-align: center;
      font-size: ${12 * scaleMultiplier}pt;
      font-weight: 800;
      color: ${brandPrimary};
      margin: 0 0 2px 0;
    }

    .ministry-title {
      text-align: center;
      font-size: ${10.5 * scaleMultiplier}pt;
      font-weight: 600;
      color: ${brandAccent};
      margin: 0 0 8px 0;
    }

    .header-details-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 6px;
      font-size: ${9.5 * scaleMultiplier}pt;
    }

    .header-col-right {
      text-align: right;
      line-height: 1.6;
    }

    .header-col-center {
      text-align: center;
    }

    .header-col-left {
      text-align: left;
      line-height: 1.6;
      direction: ltr;
    }

    .header-col-left div {
      direction: rtl;
      text-align: left;
    }

    .institution-logo {
      height: 48px;
      max-width: 60px;
      object-fit: contain;
    }

    /* Document Title Banner */
    .document-title-banner {
      background: ${bgHeader};
      color: ${textHeader};
      border: ${isBw ? '2px solid #000' : 'none'};
      padding: 8px 16px;
      border-radius: 4px;
      text-align: center;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .document-title-banner h1 {
      margin: 0;
      font-size: ${14 * scaleMultiplier}pt;
      font-weight: 800;
    }

    .document-title-banner .subtitle {
      margin: 3px 0 0 0;
      font-size: ${9.5 * scaleMultiplier}pt;
      font-weight: 500;
      opacity: 0.9;
    }

    /* Summary Cards */
    .summary-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
      page-break-inside: avoid;
    }

    .summary-card {
      flex: 1;
      min-width: 120px;
      border: 1px solid ${borderColor};
      background: ${isBw ? '#fff' : isGrayscale ? '#f0f0f0' : '#f6f8f4'};
      border-radius: 4px;
      padding: 6px 10px;
      text-align: center;
    }

    .summary-card-label {
      font-size: ${8.5 * scaleMultiplier}pt;
      color: #555;
      margin-bottom: 2px;
    }

    .summary-card-value {
      font-size: ${12 * scaleMultiplier}pt;
      font-weight: 700;
      color: ${brandPrimary};
    }

    /* Report Table */
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 12px;
      font-size: ${settings.appearance.compactRows ? 8.5 * scaleMultiplier : 9.5 * scaleMultiplier}pt;
    }

    table.report-table th,
    table.report-table td {
      border: 1px solid ${isBw || settings.appearance.highContrastBorders ? '#000000' : borderColor};
      padding: ${settings.appearance.compactRows ? '4px 6px' : '6px 8px'};
      text-align: right;
      vertical-align: middle;
    }

    table.report-table th {
      background-color: ${bgHeader};
      color: ${textHeader};
      font-weight: 700;
      font-size: ${10 * scaleMultiplier}pt;
      white-space: nowrap;
    }

    table.report-table tr:nth-child(even) td {
      background-color: ${rowZebraBg};
    }

    /* Notes Block */
    .notes-box {
      border-right: 3px solid ${brandPrimary};
      background: ${isBw ? '#ffffff' : isGrayscale ? '#f2f2f2' : '#f7f9f5'};
      padding: 8px 12px;
      margin: 12px 0;
      font-size: ${9 * scaleMultiplier}pt;
      page-break-inside: avoid;
    }

    .notes-box strong {
      display: block;
      color: ${brandPrimary};
      margin-bottom: 3px;
    }

    /* Signatures and Stamps Block */
    .signatures-section {
      margin-top: 20px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      gap: 15px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signature-card {
      flex: 1;
      border: 1px dashed ${isBw ? '#000' : '#a8b2a1'};
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fafbfa;
    }

    .signature-card-title {
      font-size: ${9.5 * scaleMultiplier}pt;
      font-weight: 700;
      color: ${brandPrimary};
      margin-bottom: 4px;
    }

    .signature-card-subtitle {
      font-size: ${8 * scaleMultiplier}pt;
      color: #777;
    }

    .stamp-circle-zone {
      margin: 8px auto 0;
      width: 55px;
      height: 55px;
      border: 1px dotted #ccc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      color: #aaa;
    }

    /* Algerian Laboratory & Custom Documents Formatting */
    .republic-header {
      text-align: center;
      font-size: ${14 * scaleMultiplier}pt;
      font-weight: 900;
      color: ${brandPrimary};
      margin-bottom: 2px;
      font-family: 'Amiri', serif;
      letter-spacing: 0.3px;
      ${!settings.institution.showRepublicHeader || settings.institution.headerStyle === 'minimal' ? 'display: none !important;' : ''}
    }
    .ministry-header {
      text-align: center;
      font-size: ${12 * scaleMultiplier}pt;
      font-weight: 700;
      color: ${brandAccent};
      margin-bottom: 5px;
      font-family: 'Amiri', serif;
      ${!settings.institution.showMinistry || settings.institution.headerStyle === 'minimal' ? 'display: none !important;' : ''}
    }
    .institution-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: ${10 * scaleMultiplier}pt;
      font-weight: bold;
      color: #32382c;
      border-bottom: ${isBw ? '2px solid #000' : '1.5px solid #c8d2c3'};
      padding-bottom: 6px;
      margin-bottom: 8px;
      line-height: 1.5;
      font-family: 'Amiri', serif;
    }
    .title-banner {
      background-color: ${bgHeader};
      color: ${textHeader};
      border: ${isBw ? '2px solid #000' : 'none'};
      border-radius: 4px;
      padding: 7px 14px;
      text-align: center;
      margin: 6px 0 8px;
    }
    .title-banner h1 {
      margin: 0;
      font-size: ${15 * scaleMultiplier}pt;
      font-weight: 800;
      color: ${textHeader};
      font-family: 'Cairo', sans-serif;
    }
    .title-banner .subtitle {
      margin: 2px 0 0;
      font-size: ${9.5 * scaleMultiplier}pt;
      color: ${isBw ? '#222222' : isGrayscale ? '#222222' : '#e6f0dc'};
      font-family: 'Amiri', serif;
    }
    .summary-cards {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .summary-card {
      flex: 1;
      background: ${isBw ? '#fff' : isGrayscale ? '#f2f2f2' : '#f5f8f2'};
      border: 1px solid ${tableBorderColor};
      border-radius: 4px;
      padding: 5px 8px;
      text-align: center;
    }
    .summary-card .label {
      font-size: ${8.5 * scaleMultiplier}pt;
      color: #64735f;
      font-family: 'Amiri', serif;
      margin-bottom: 1px;
    }
    .summary-card .value {
      font-size: ${11.5 * scaleMultiplier}pt;
      font-weight: bold;
      color: ${brandPrimary};
      font-family: 'Cairo', sans-serif;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: ${10 * scaleMultiplier}pt;
      ${borderStyleVal === 'double_official' ? 'border: 3px double #2b3d22 !important;' : ''}
    }
    table.data-table th {
      background-color: ${bgHeader};
      color: ${textHeader};
      font-weight: bold;
      border: 1px solid ${tableBorderColor};
      padding: 6px 7px;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      font-size: ${9.5 * scaleMultiplier}pt;
    }
    table.data-table td {
      border: 1px solid ${tableBorderColor};
      padding: 5px 7px;
      vertical-align: middle;
      background-color: #ffffff;
    }
    ${settings.appearance.tableStriped ? `
      table.data-table tbody tr:nth-child(even) td {
        background-color: ${rowZebraBg};
      }
    ` : `
      table.data-table tbody tr td {
        background-color: #ffffff !important;
      }
    `}
    table.observations-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 4px;
      font-size: ${9.5 * scaleMultiplier}pt;
    }
    table.observations-table th {
      background-color: ${isBw ? '#f0f0f0' : isGrayscale ? '#e8e8e8' : '#f5f8f2'};
      color: ${brandPrimary};
      font-weight: bold;
      border: 1px solid ${tableBorderColor};
      padding: 4px 6px;
      text-align: center;
      font-family: 'Cairo', sans-serif;
      font-size: ${9.5 * scaleMultiplier}pt;
    }
    table.observations-table td {
      border: 1px solid ${tableBorderColor};
      padding: 6px 8px;
      vertical-align: top;
      min-height: 48px;
      line-height: 1.4;
      background: #ffffff;
    }
    .release-line {
      text-align: left;
      margin: 6px 0 6px;
      font-weight: bold;
      font-size: ${10.5 * scaleMultiplier}pt;
      color: ${brandPrimary};
      font-family: 'Cairo', sans-serif;
    }
    .signatures-grid {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 6px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
      ${!settings.signatures.showSignatures ? 'display: none !important;' : ''}
    }
    .sig-box {
      flex: 1;
      border: 1px solid ${tableBorderColor};
      border-radius: 4px;
      padding: 6px 8px;
      background: #fefefd;
      min-height: ${settings.signatures.reserveStampSpace ? '75px' : '60px'};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ${!settings.signatures.showNazir ? `
      .signatures-grid .sig-box:nth-child(2),
      .signatures-grid .sig-box-nazir {
        display: none !important;
      }
    ` : ''}
    ${settings.signatures.signersCount === 1 ? `
      .signatures-grid .sig-box:nth-child(2),
      .signatures-grid .sig-box:nth-child(3),
      .signatures-grid .sig-box-nazir,
      .signatures-grid .sig-box-principal {
        display: none !important;
      }
    ` : ''}
    .sig-title {
      font-weight: bold;
      font-size: ${10.5 * scaleMultiplier}pt;
      color: ${brandPrimary};
      font-family: 'Cairo', sans-serif;
    }
    .sig-content {
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-placeholder {
      color: #828c7d;
      font-size: 8.5pt;
      font-family: 'Amiri', serif;
    }
    /* Universal styling for all custom tables and forms */
    .custom-report-content table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 6px 0 !important;
    }
    .custom-report-content table th,
    .custom-report-content th {
      background-color: ${bgHeader} !important;
      color: ${textHeader} !important;
      font-weight: bold !important;
      border: 1px solid ${tableBorderColor} !important;
      padding: 6px 8px !important;
      text-align: center !important;
      font-family: 'Cairo', sans-serif !important;
      font-size: ${9.5 * scaleMultiplier}pt !important;
    }
    .custom-report-content table td,
    .custom-report-content td {
      border: 1px solid ${tableBorderColor} !important;
      padding: 5px 8px !important;
      vertical-align: middle !important;
      background-color: #ffffff;
    }
    ${settings.appearance.tableStriped ? `
      .custom-report-content table tbody tr:nth-child(even) td,
      .custom-report-content table tr:nth-child(even) td {
        background-color: ${rowZebraBg};
      }
    ` : ''}
    .custom-report-content .paper-wrapper {
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
    }

    /* Color mode filters on entire sheet */
    ${isBw ? `
      .sheet, .custom-report-content {
        filter: grayscale(100%) contrast(150%) !important;
      }
    ` : isGrayscale ? `
      .sheet, .custom-report-content {
        filter: grayscale(100%) !important;
      }
    ` : ''}

    /* Extracted custom styles if any */
    ${extractedCustomStyles}

    /* Media queries specifically optimizing for screen view and paper/PDF print */
    @media screen {
      html, body {
        background-color: #f1f5f9 !important;
        margin: 0 !important;
        padding: 20px 12px !important;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .print-action-bar {
        width: 100%;
        max-width: ${sheetWidth};
        background: #ffffff;
        border: 1px solid #d2d8ce;
        border-radius: 12px;
        padding: 10px 18px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 10px;
        z-index: 1000;
        direction: rtl;
        font-family: 'Cairo', sans-serif;
      }

      .sheet {
        width: 100% !important;
        max-width: ${sheetWidth} !important;
        min-height: ${sheetMinHeight} !important;
        background: #ffffff !important;
        padding: ${marginMm}mm !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08) !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 4px;
        margin: 0 auto;
        box-sizing: border-box !important;
      }
    }

    @media print {
      @page {
        size: ${paperSize} ${orientation} !important;
        margin: ${marginMm}mm;
      }

      html, body {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .no-print, .print-action-bar {
        display: none !important;
      }

      .sheet {
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
      }

      .paper-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
      }

      table {
        page-break-inside: auto;
        border-collapse: collapse !important;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      .signatures-section,
      .signatures-grid,
      .signature-card,
      .sig-box,
      .observations-table,
      .notes-box,
      .approval-box,
      .closing-formula,
      .release-line {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      .official-header,
      .document-title-banner,
      .republic-header,
      .ministry-header,
      .institution-bar,
      .title-banner {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }

    /* Footer disclaimer */
    .document-footer {
      margin-top: 15px;
      padding-top: 6px;
      border-top: 1px solid ${borderColor};
      display: flex;
      justify-content: space-between;
      font-size: ${8 * scaleMultiplier}pt;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- Screen Floating Top Action Bar -->
  <div class="print-action-bar no-print">
    <div style="display: flex; align-items: center; gap: 10px;">
      <strong style="color: #2b3d22; font-size: 14px;">${title}</strong>
      <span style="font-size: 11px; background: #f0f3ed; color: #415437; padding: 2px 8px; border-radius: 6px; border: 1px solid #d2d8ce;">
        ${paperSize.toUpperCase()} · ${orientation === 'landscape' ? 'أفقي' : 'عمودي'}
      </span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #2b3d22; color: #ffffff; border: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 12px; display: flex; align-items: center; gap: 6px;">
        <span>🖨️ طباعة فورية</span>
      </button>
      <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 12px;">
        إغلاق
      </button>
    </div>
  </div>

  <div class="sheet">
    ${watermarkText ? `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 65pt; font-weight: 900; color: rgba(180, 190, 175, 0.16); border: 5px dashed rgba(180, 190, 175, 0.2); padding: 8px 36px; border-radius: 12px; pointer-events: none; z-index: 99; white-space: nowrap; letter-spacing: 4px; user-select: none;">
      ${watermarkText}
    </div>
    ` : ''}
    ${(!hasBuiltInHeader && settings.institution.headerStyle !== 'minimal') ? `
    <header class="official-header">
      ${inst.showRepublicHeader ? `<h2 class="republic-title">${inst.country}</h2>` : ''}
      ${inst.showMinistry ? `<h3 class="ministry-title">${inst.ministry}</h3>` : ''}
      
      <div class="header-details-grid">
        <div class="header-col-right">
          <div>${inst.directorate}</div>
          <div>${formatSchoolWithCommune(inst.school, inst.commune)}</div>
          <div><strong>المخبر:</strong> ${inst.laboratory}</div>
        </div>

        ${inst.showLogo ? `
        <div class="header-col-center">
          <img src="${inst.customLogoUrl || logo}" alt="شعار المؤسسة" class="institution-logo" />
        </div>
        ` : ''}

        <div class="header-col-left">
          <div><strong>السنة الدراسية:</strong> ${inst.academicYear}</div>
          ${inst.showDate ? `<div><strong>تاريخ الإصدار:</strong> ${currentDate}</div>` : ''}
          <div><strong>الصفة:</strong> ${sig.labManagerTitle}</div>
        </div>
      </div>
    </header>
    ` : ''}

    ${!hasBuiltInHeader ? `
    <div class="document-title-banner">
      <h1>${title}</h1>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
    </div>
    ` : ''}

    ${summaryCards.length > 0 && !hasBuiltInHeader ? `
    <div class="summary-grid">
      ${summaryCards.map(c => `
        <div class="summary-card">
          <div class="summary-card-label">${c.label}</div>
          <div class="summary-card-value">${c.value}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${(!extractedCustomBody && headers.length > 0 && rows.length > 0) ? `
    <table class="report-table">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '—'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${extractedCustomBody ? `
    <div class="custom-report-content" dir="rtl">
      ${extractedCustomBody}
    </div>
    ` : ''}

    ${notes && !hasBuiltInHeader ? `
    <div class="notes-box">
      <strong>ملاحظات وإرشادات إدارية:</strong>
      <div>${notes}</div>
    </div>
    ` : ''}

    ${(sig.showSignatures && !hasBuiltInSignatures) ? `
    <div class="signatures-section">
      ${sig.showLabManager ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.labManagerTitle}</div>
          <div class="signature-card-subtitle">(الاسم، التوقيع والختم)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showNazir ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.nazirTitle || 'الناظر'}</div>
          <div class="signature-card-subtitle">(التوقيع والختم)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showTeacher ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.teacherTitle}</div>
          <div class="signature-card-subtitle">(التوقيع والملاحظات)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showInspector ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.inspectorTitle}</div>
          <div class="signature-card-subtitle">(ختم المفتش وتاريخ الزيارة)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}

      ${sig.showPrincipal ? `
      <div class="signature-card">
        <div>
          <div class="signature-card-title">${sig.principalTitle}</div>
          <div class="signature-card-subtitle">(تأشيرة المصادقة والختم الرسمي)</div>
        </div>
        ${sig.reserveStampSpace ? `<div class="stamp-circle-zone">موضع الختم</div>` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${(Boolean(settings.appearance.showPrintDateTime) || Boolean(settings.appearance.showPageNumbers)) ? `
    <footer class="document-footer">
      <div>${sig.customDisclaimer || 'الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر'}</div>
      <div>${formatSchoolWithCommune(inst.school, inst.commune)} — ${inst.laboratory}</div>
      ${settings.appearance.showPrintDateTime ? `<div>طُبع في: ${currentDate} ${currentTime}</div>` : ''}
      ${settings.appearance.showPageNumbers ? `<div>صفحة 1 من 1</div>` : ''}
    </footer>
    ` : ''}
  </div>
</body>
</html>
    `;
  }

  /**
   * Generates printable sticker sheets with QR codes based on selected grid presets (e.g. 2x4, 3x7, 4x8)
   */
  static generateStickersHtml(
    stickers: Array<{ id: string; name: string; qrValue: string; category?: string; location?: string; code?: string }>,
    settings: PrintSettings = DEFAULT_PRINT_SETTINGS
  ): string {
    const qrConfig = settings.qrSticker;
    const cols = qrConfig.gridColumns || 3;
    const widthMm = qrConfig.stickerWidthMm || 63.5;
    const heightMm = qrConfig.stickerHeightMm || 38.1;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>ملصقات وقصاصات التجهيزات والمواد — ${settings.institution.school}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', sans-serif;
      margin: 0;
      padding: 0;
      background: white;
      direction: rtl;
    }
    .stickers-grid {
      display: grid;
      grid-template-columns: repeat(${cols}, 1fr);
      gap: 3mm;
      width: 100%;
    }
    .sticker-card {
      border: 1px solid #c9d2c2;
      border-radius: 6px;
      padding: 4px 6px;
      height: ${heightMm}mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      background: #ffffff;
      overflow: hidden;
    }
    .sticker-info {
      flex: 1;
      padding-left: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .sticker-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }
    .sticker-logo {
      height: 14px;
      width: auto;
    }
    .sticker-institution {
      font-size: 6.5pt;
      font-weight: 700;
      color: #3b4e33;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sticker-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #1a2216;
      line-height: 1.2;
      margin-bottom: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .sticker-meta {
      font-size: 6.5pt;
      color: #555;
      display: flex;
      gap: 6px;
    }
    .sticker-id {
      font-family: monospace;
      font-weight: bold;
      color: #2b3d22;
      direction: ltr;
      display: inline-block;
    }
    .qr-container {
      width: 32mm;
      height: 32mm;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-container img, .qr-container svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="stickers-grid">
    ${stickers.map(item => {
      // Use quickchart QR or inline SVG placeholder
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.qrValue || item.id)}`;
      return `
        <div class="sticker-card">
          <div class="sticker-info">
            <div class="sticker-header">
              ${qrConfig.showLogo ? `<img src="${settings.institution.customLogoUrl || logo}" alt="" class="sticker-logo" />` : ''}
              ${qrConfig.showSchoolName ? `<span class="sticker-institution">${formatSchoolWithCommune(settings.institution.school, settings.institution.commune)}</span>` : ''}
            </div>
            <div class="sticker-title">${item.name}</div>
            <div class="sticker-meta">
              ${qrConfig.showCategory && item.category ? `<span>${item.category}</span>` : ''}
              ${qrConfig.showStorageLocation && item.location ? `<span>${item.location}</span>` : ''}
            </div>
            ${qrConfig.showItemCode ? `<div class="sticker-id">ID: ${item.code || item.id}</div>` : ''}
          </div>
          <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
    `;
  }

  /**
   * Generates and prints a complete test page to verify printer alignment, margins, and Arabic font rendering.
   */
  static async printTestPage(settings: PrintSettings = DEFAULT_PRINT_SETTINGS): Promise<void> {
    const testData: PrintPreviewData = {
      title: 'صفحة اختبار إعدادات الطباعة والوثائق الرسمية',
      subtitle: 'نموذج تجريبي للتحقق من هوامش الصفحة، دقة الخط العربي، وتناسق الألوان',
      type: 'table',
      headers: ['#', 'الخاصية / الإعداد', 'القيمة الحالية', 'حالة الجودة في الطباعة'],
      rows: [
        ['1', 'حجم الورق المحدد', settings.layout.paperSize.toUpperCase(), 'سليم ومطابق للقياس العالمي'],
        ['2', 'اتجاه الورقة', settings.layout.orientation === 'portrait' ? 'عمودي (Portrait)' : 'أفقي (Landscape)', 'مضبوط تلقائياً'],
        ['3', 'حجم الهوامش', settings.layout.margins === 'compact' ? 'مضغوط (8mm)' : settings.layout.margins === 'spacious' ? 'واسع (20mm)' : 'قياسي (14mm)', 'ضمن حدود الطابعة الآمنة'],
        ['4', 'نمط الألوان المعتمد', settings.appearance.colorMode === 'color' ? 'ملون رسمي عالي الدقة' : settings.appearance.colorMode === 'grayscale' ? 'تدرج رمادي لتوفير الحبر (Eco)' : 'أبيض وأسود للنسخ', 'جاهز للمعاينة'],
        ['5', 'الخط العربي والاتجاه', `${settings.layout.fontFamily} - اتجاه من اليمين إلى اليسار (RTL)`, 'حروف متصلة وسليمة تماماً']
      ],
      summaryCards: [
        { label: 'حجم الورق', value: settings.layout.paperSize.toUpperCase() },
        { label: 'نمط الطباعة', value: settings.appearance.colorMode },
        { label: 'الهامش', value: `${settings.layout.margins}` },
        { label: 'تاريخ الفحص', value: new Date().toLocaleDateString('ar-DZ') }
      ],
      notes: 'تمت طباعة هذه الوثيقة التجريبية بنجاح عبر المحرك المدمج للنظام الرقمي لتسيير المخابر المدرسية. إذا كانت النصوص واضحة والحدود مستقيمة، فإن إعدادات الطابعة مضبوطة بالشكل المثالي.'
    };

    const html = this.generateReportHtml(testData, settings);
    return this.printHtml(html, { title: 'صفحة فحص الطابعة — مخبر العلوم' });
  }

  /**
   * Generates official Word Document (.doc) HTML for reports, inventories, or tables
   * matching the Algerian Ministry standard with 100% fidelity to the PDF.
   */
  static generateReportWordHtml(data: PrintPreviewData, settings: PrintSettings = DEFAULT_PRINT_SETTINGS): string {
    const {
      title,
      subtitle,
      headers = [],
      rows = [],
      summaryCards = [],
      notes,
      suggestedOrientation,
      customHtml
    } = data;

    let extractedCustomBody = '';
    let extractedCustomStyles = '';
    if (customHtml) {
      const styleMatches = customHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatches) {
        extractedCustomStyles = styleMatches
          .map(tag => tag.replace(/<\/?style[^>]*>/gi, ''))
          .join('\n');
      }
      const bodyMatch = customHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      extractedCustomBody = bodyMatch ? bodyMatch[1] : customHtml;
    }

    const hasBuiltInHeader = Boolean(
      customHtml && (
        customHtml.includes('republic-header') ||
        customHtml.includes('republic-title') ||
        customHtml.includes('official-header') ||
        customHtml.includes('institution-bar') ||
        customHtml.includes('title-banner') ||
        customHtml.includes('inst-info')
      )
    );

    const hasBuiltInSignatures = Boolean(
      customHtml && (
        customHtml.includes('signatures-grid') ||
        customHtml.includes('signatures-section') ||
        customHtml.includes('signatures-table') ||
        customHtml.includes('sig-box')
      )
    );

    const orientation = suggestedOrientation || (settings.layout.orientation === 'auto' ? 'portrait' : settings.layout.orientation);
    const isLandscape = orientation === 'landscape';
    const inst = settings.institution;
    const sig = settings.signatures;
    const formattedSchool = formatSchoolWithCommune(inst.school, inst.commune) || 'المؤسسة التعليمية';
    const directorate = inst.directorate || 'مديرية التربية لولاية';
    const labName = inst.laboratory || 'مخبر العلوم والتكنولوجيا';
    const academicYear = inst.academicYear || `${new Date().getFullYear() - 1} / ${new Date().getFullYear()}`;
    const dateStr = new Date().toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns:v='urn:schemas-microsoft-com:vml'
            xmlns='http://www.w3.org/TR/REC-html40'
            dir='rtl' lang='ar'>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${title} — ${formattedSchool}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
            <w:Compatibility>
              <w:UseWord2002TableStyleRules/>
            </w:Compatibility>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: ${isLandscape ? '841.95pt 595.35pt' : '595.35pt 841.95pt'};
            mso-page-orientation: ${isLandscape ? 'landscape' : 'portrait'};
            margin: 36.0pt 36.0pt 36.0pt 36.0pt;
            mso-header-margin: 25.0pt;
            mso-footer-margin: 25.0pt;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
            font-size: 11pt;
            color: #1a1a1a;
            line-height: 1.45;
            direction: rtl;
            text-align: right;
            background-color: #ffffff;
          }
          p { margin: 0 0 4pt 0; }
          .republic-title {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            color: #1a2e16;
            margin: 0 0 2pt 0;
          }
          .ministry-title {
            text-align: center;
            font-size: 11pt;
            font-weight: bold;
            color: #2b3d22;
            margin: 0 0 6pt 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            border-bottom: 2pt solid #2b3d22;
            margin-bottom: 10pt;
            padding-bottom: 5pt;
          }
          .header-table td {
            border: none;
            vertical-align: top;
            font-size: 9.5pt;
          }
          .banner-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8pt 0 10pt 0;
            background-color: #2b3d22;
            border: 1.5pt solid #2b3d22;
          }
          .banner-table td {
            padding: 8pt 12pt;
            text-align: center;
            border: none;
          }
          .banner-title {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            color: #ffffff;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .banner-sub {
            margin: 3pt 0 0 0;
            font-size: 9.5pt;
            color: #dce5d6;
          }
          .cards-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: none;
          }
          .cards-table td {
            border: 1pt solid #d2d8ce;
            background-color: #fafbf9;
            padding: 6pt;
            text-align: center;
          }
          .card-label { font-size: 8.5pt; color: #555555; }
          .card-value { font-size: 11pt; font-weight: bold; color: #2b3d22; margin-top: 2pt; }
          
          .data-table, .custom-content table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10pt;
            border: 1.5pt solid #2b3d22;
            direction: rtl;
          }
          .data-table th, .custom-content table th, .custom-content th {
            background-color: #2b3d22;
            color: #ffffff;
            border: 1pt solid #2b3d22;
            padding: 6pt 5pt;
            font-size: 9.5pt;
            font-weight: bold;
            text-align: center;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .data-table td, .custom-content table td, .custom-content td {
            border: 1pt solid #c2c9bc;
            padding: 5pt 6pt;
            font-size: 9pt;
            color: #1a1a1a;
            font-family: 'Traditional Arabic', 'Amiri', 'Arial', sans-serif;
          }
          .custom-content .paper-wrapper {
            width: 100%;
            border: none;
            padding: 0;
            margin: 0;
          }
          ${extractedCustomStyles}

          .notes-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            background-color: #ffffff;
            border: 1pt solid #d2d8ce;
          }
          .notes-table td {
            padding: 7pt 10pt;
            border: none;
            font-size: 9pt;
            color: #333333;
          }
          .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            border: none;
            direction: rtl;
          }
          .signatures-table td {
            width: 50%;
            border: 1pt dashed #889980;
            padding: 8pt;
            text-align: center;
            vertical-align: top;
            background-color: #fcfdfb;
          }
          .sig-title {
            font-weight: bold;
            font-size: 9.5pt;
            color: #2b3d22;
            border-bottom: 1pt solid #e0e5dc;
            padding-bottom: 3pt;
            margin-bottom: 8pt;
          }
          .sig-space {
            font-size: 8pt;
            color: #888888;
            height: 42pt;
            padding-top: 14pt;
          }
          .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            border: none;
            border-top: 1pt solid #d2d8ce;
          }
          .footer-table td {
            border: none;
            font-size: 8pt;
            color: #777777;
            padding-top: 5pt;
          }
        </style>
      </head>
      <body lang="AR-DZ" dir="rtl">
        <div class="Section1">
          ${!hasBuiltInHeader ? `
          <p class="republic-title">${inst.country || 'الجمهورية الجزائرية الديمقراطية الشعبية'}</p>
          <p class="ministry-title">${inst.ministry || 'وزارة التربية الوطنية'}</p>

          <table class="header-table" dir="rtl">
            <tr>
              <td style="text-align: right; width: 50%;">
                <div>${directorate}</div>
                <div>${formattedSchool}</div>
                <div><strong>المصلحة / المخبر:</strong> ${labName}</div>
              </td>
              <td style="text-align: left; width: 50%;" dir="rtl">
                <div><strong>السنة الدراسية:</strong> ${academicYear}</div>
                <div><strong>تاريخ الإصدار:</strong> ${dateStr}</div>
              </td>
            </tr>
          </table>

          <table class="banner-table" dir="rtl">
            <tr>
              <td>
                <h1 class="banner-title">${title}</h1>
                ${subtitle ? `<p class="banner-sub">${subtitle}</p>` : ''}
              </td>
            </tr>
          </table>

          ${summaryCards && summaryCards.length > 0 ? `
            <table class="cards-table" dir="rtl">
              <tr>
                ${summaryCards.map(c => `
                  <td>
                    <div class="card-label">${c.label}</div>
                    <div class="card-value">${c.value}</div>
                  </td>
                `).join('')}
              </tr>
            </table>
          ` : ''}
          ` : ''}

          ${extractedCustomBody ? `
            <div class="custom-content" dir="rtl">
              ${extractedCustomBody}
            </div>
          ` : `
          <table class="data-table" dir="rtl">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, rIdx) => `
                <tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f9faf7'};">
                  ${row.map(cell => `
                    <td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          `}

          ${notes && !hasBuiltInHeader ? `
            <table class="notes-table" dir="rtl">
              <tr>
                <td><strong>ملاحظات وتوجيهات:</strong> ${notes}</td>
              </tr>
            </table>
          ` : ''}

          ${(sig.showSignatures && !hasBuiltInSignatures) ? `
            <table class="signatures-table" dir="rtl">
              <tr>
                <td style="width: ${sig.showNazir ? '33.3%' : '50%'};">
                  <div class="sig-title">${sig.labManagerTitle || 'المسؤول عن المخبر'}</div>
                  <div class="sig-space">(الاسم، التوقيع والختم)</div>
                  <div style="font-size: 7.5pt; color: #777;">حرر بتاريخ: ....................</div>
                </td>
                ${sig.showNazir ? `
                <td style="width: 33.3%;">
                  <div class="sig-title">${sig.nazirTitle || 'الناظر'}</div>
                  <div class="sig-space">(التوقيع والختم)</div>
                  <div style="font-size: 7.5pt; color: #777;">الختم ومصادقة</div>
                </td>
                ` : ''}
                <td style="width: ${sig.showNazir ? '33.3%' : '50%'};">
                  <div class="sig-title">${sig.principalTitle || 'مدير(ة) المؤسسة'}</div>
                  <div class="sig-space">(التوقيع والختم)</div>
                  <div style="font-size: 7.5pt; color: #777;">في: .............................</div>
                </td>
              </tr>
            </table>
          ` : ''}

          <table class="footer-table" dir="rtl">
            <tr>
              <td style="text-align: right;">الجمهورية الجزائرية الديمقراطية الشعبية — الأرضية الرقمية لتسيير المخابر المدرسية</td>
              <td style="text-align: center;">${formattedSchool}</td>
              <td style="text-align: left;">صفحة 1 من 1</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Directly downloads any report or inventory preview data as Word (.doc)
   */
  static downloadReportWord(data: PrintPreviewData, settings: PrintSettings = DEFAULT_PRINT_SETTINGS): void {
    const html = this.generateReportWordHtml(data, settings);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = data.title.replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
