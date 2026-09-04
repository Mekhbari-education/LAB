import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Reusable Arabic PDF Service
export class PDFService {
  private static fontBase64: string | null = null;

  static async init(doc: jsPDF) {
    if (!this.fontBase64) {
      try {
        const response = await fetch('/ManaraDocs_Amatti.ttf');
        const buffer = await response.arrayBuffer();
        this.fontBase64 = this.arrayBufferToBase64(buffer);
      } catch (error) {
        console.error('Error loading Arabic font:', error);
      }
    }

    if (this.fontBase64) {
      doc.addFileToVFS('ManaraDocs.ttf', this.fontBase64);
      doc.addFont('ManaraDocs.ttf', 'ManaraDocs', 'normal');
      doc.setFont('ManaraDocs');
    }
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  static async generateTablePDF(title: string, headers: string[], rows: any[][], fileName: string) {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });

    await this.init(doc);

    // RTL title
    doc.setFontSize(22);
    // Note: jsPDF doesn't natively reshape Arabic. 
    // We assume the font handles some of this or the user handles it.
    // For basic support, we reverse the text for RTL simulation if needed, 
    // but modern browsers often handle it better with specific plugins.
    
    // In jsPDF, right alignment with x=200 creates right-aligned text
    // Need to set isRTL or reshape but standard addFont with Arabic TTF sometimes works with basic rendering
    doc.text(title, 200, 20, { align: 'right' });

    // Reverse headers and rows for RTL table layout (columns from right to left)
    const rtlHeaders = [...headers].reverse();
    const rtlRows = rows.map(row => [...row].reverse());

    autoTable(doc, {
      head: [rtlHeaders],
      body: rtlRows,
      startY: 30,
      styles: {
        font: 'ManaraDocs',
        halign: 'right', // Text aligns to the right inside cells
        fontSize: 10
      },
      headStyles: {
        fillColor: [43, 61, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'right'
      }
    });

    doc.save(`${fileName}.pdf`);
  }
}
