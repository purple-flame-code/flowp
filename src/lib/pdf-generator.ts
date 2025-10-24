import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface PDFOptions {
  title: string;
  content: string;
  branding?: {
    nombreEstudio?: string;
    color?: string;
    logoUrl?: string;
  };
  qrData?: string;
}

export async function generatePDF(options: PDFOptions): Promise<Blob> {
  const { title, content, branding, qrData } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  let yPosition = margin;

  // Header con branding
  if (branding?.logoUrl) {
    try {
      doc.addImage(branding.logoUrl, 'PNG', margin, yPosition, 30, 10);
      yPosition += 15;
    } catch (e) {
      // Si falla el logo, continuar
    }
  }

  if (branding?.nombreEstudio) {
    doc.setFontSize(14);
    doc.setTextColor(branding.color || '#F5C542');
    doc.text(branding.nombreEstudio, margin, yPosition);
    yPosition += 10;
  }

  doc.setFontSize(10);
  doc.setTextColor('#666666');
  doc.text(new Date().toLocaleDateString('es-PA'), margin, yPosition);
  yPosition += 15;

  // Título
  doc.setFontSize(18);
  doc.setTextColor('#000000');
  doc.text(title, margin, yPosition);
  yPosition += 10;

  // Contenido
  doc.setFontSize(11);
  doc.setTextColor('#333333');

  const lines = doc.splitTextToSize(content, pageWidth - (margin * 2));

  for (let i = 0; i < lines.length; i++) {
    if (yPosition > pageHeight - margin - 20) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(lines[i], margin, yPosition);
    yPosition += 6;
  }

  // QR Code si existe
  if (qrData) {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, { width: 200 });
      const qrSize = 30;
      doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - qrSize, pageHeight - margin - qrSize - 10, qrSize, qrSize);
    } catch (e) {
      console.error('Error generating QR:', e);
    }
  }

  // Footer
  const footerY = pageHeight - margin;
  doc.setFontSize(8);
  doc.setTextColor('#999999');
  doc.text('Generado con FlowPenal by Lex Vence', margin, footerY);

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
