import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';

// Set up pdfjs worker using CDN or local worker if available
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  // Using unpkg or cdnjs for pdfjs worker to ensure it works across browser sandboxes
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

export interface ConversionProgress {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  percent: number;
}

/**
 * Converts a Word document (.docx) into clean HTML using mammoth.
 */
export async function convertDocxToHtml(file: File | Blob): Promise<{ html: string; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    html: result.value,
    messages: result.messages.map(m => m.message)
  };
}

/**
 * Takes a Word document (.docx), converts it to styled printable HTML and triggers a clean Print-to-PDF view.
 */
export async function convertDocxToPdfView(
  file: File | Blob,
  fileName: string = 'Document'
): Promise<void> {
  const { html } = await convertDocxToHtml(file);

  // Open a print window with styled paper dimensions and RTL support
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Pop-up window blocked. Please allow popups to view and save PDF.');
  }

  const cleanFileName = fileName.replace(/\.[^/.]+$/, '');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ku" dir="auto">
    <head>
      <meta charset="UTF-8">
      <title>${cleanFileName} - PDF Preview</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background: #ffffff;
          padding: 20px;
          margin: 0 auto;
          max-width: 820px;
        }
        h1, h2, h3, h4 {
          color: #0f172a;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1 { font-size: 24pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        h2 { font-size: 18pt; color: #1e3a8a; }
        h3 { font-size: 14pt; color: #2563eb; }
        p { margin: 0 0 1em; font-size: 11pt; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 10pt;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          text-align: inherit;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        ul, ol {
          margin-bottom: 1em;
          padding-inline-start: 24px;
        }
        li {
          margin-bottom: 0.4em;
        }
        .header-meta {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
          color: #64748b;
        }
        .no-print-bar {
          background: #1e293b;
          color: #fff;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .print-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }
        .print-btn:hover { background: #1d4ed8; }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span>📄 <strong>${cleanFileName}</strong> — ئامادەیە بۆ پرینت یان پاشەکەوتکردن وەک PDF</span>
        <button class="print-btn" onclick="window.print()">🖨️ پرینت / پاشەکەوتکردن بە PDF</button>
      </div>
      <div class="header-meta">
        <span>سیستەمی کارگێڕی SAS4ERP</span>
        <span>Converted from DOCX • ${new Date().toLocaleDateString()}</span>
      </div>
      <main class="content">
        ${html}
      </main>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Extracts text from a PDF file page by page using pdfjs-dist.
 */
export async function extractTextFromPdf(file: File | Blob): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Loading PDF document
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items
    let pageText = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if ('str' in item) {
        // If Y coordinate has changed significantly, insert a newline
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
    }
    pageTexts.push(pageText.trim());
  }

  return pageTexts;
}

/**
 * Converts a PDF file into an editable Microsoft Word (.docx) file.
 * Parses pages, paragraphs, detected headings and structured lines.
 */
export async function convertPdfToDocx(
  file: File | Blob,
  fileName: string = 'Document'
): Promise<Blob> {
  const pagesText = await extractTextFromPdf(file);
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '');

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: cleanTitle,
          bold: true,
          size: 32,
          color: '1E3A8A'
        })
      ],
      spacing: { after: 180, before: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF via SAS4ERP Document Studio on ${new Date().toLocaleString()}`,
          italics: true,
          size: 18,
          color: '64748B'
        })
      ],
      spacing: { after: 300 }
    })
  ];

  pagesText.forEach((pageContent, pageIndex) => {
    // Add page separator heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `--- Page ${pageIndex + 1} / پەڕەی ${pageIndex + 1} ---`,
            bold: true,
            size: 22,
            color: '2563EB'
          })
        ],
        spacing: { before: 240, after: 120 }
      })
    );

    // Split page text into lines or paragraphs
    const lines = pageContent.split('\n').filter(l => l.trim().length > 0);
    
    if (lines.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '[پەڕەی بەتاڵ یان بە وێنە]',
              italics: true,
              color: '94A3B8'
            })
          ],
          spacing: { after: 100 }
        })
      );
    } else {
      for (const line of lines) {
        const trimmed = line.trim();
        // Check if line looks like a title or section heading
        const isHeading = trimmed.length < 80 && (
          /^(بەشی|فصل|section|chapter|\d+\.|\b(title|subject|ڕاپۆرت)\b)/i.test(trimmed) ||
          trimmed === trimmed.toUpperCase() && trimmed.length > 3
        );

        children.push(
          new Paragraph({
            heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
            children: [
              new TextRun({
                text: trimmed,
                bold: isHeading,
                size: isHeading ? 22 : 20,
                color: isHeading ? '1E293B' : '334155'
              })
            ],
            spacing: { after: isHeading ? 120 : 80, line: 260 }
          })
        );
      }
    }
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 20,
            color: '1E293B'
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}
