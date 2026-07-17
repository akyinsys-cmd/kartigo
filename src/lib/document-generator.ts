import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export interface DocumentMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

/**
 * Generates a PDF from markdown-like text content.
 * Note: Simple implementation, doesn't parse full MD, but handles headers and bullets.
 */
export async function generatePdf(content: string, metadata: DocumentMetadata): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(metadata.title, margin, cursorY);
  cursorY += 15;

  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("# ")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      cursorY += 5;
    } else if (line.startsWith("## ")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      cursorY += 3;
    } else if (line.startsWith("### ")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      cursorY += 2;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    }

    const cleanLine = line.replace(/^#+\s/, "").replace(/^\*\s/, "• ");
    const wrappedLines = doc.splitTextToSize(cleanLine, maxWidth);
    
    // Check page break
    if (cursorY + (wrappedLines.length * 7) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }

    doc.text(wrappedLines, margin, cursorY);
    cursorY += (wrappedLines.length * 7);
    
    if (line.trim() === "") cursorY += 3;
  }

  return doc.output("blob");
}

/**
 * Generates a DOCX from markdown-like text content.
 */
export async function generateDocx(content: string, metadata: DocumentMetadata): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      text: metadata.title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  const lines = content.split("\n");
  for (const line of lines) {
    let heading: any = undefined;
    let text = line;

    if (line.startsWith("# ")) {
      heading = HeadingLevel.HEADING_1;
      text = line.substring(2);
    } else if (line.startsWith("## ")) {
      heading = HeadingLevel.HEADING_2;
      text = line.substring(3);
    } else if (line.startsWith("### ")) {
      heading = HeadingLevel.HEADING_3;
      text = line.substring(4);
    }

    children.push(
      new Paragraph({
        children: [new TextRun(text)],
        heading,
        spacing: { before: 200, after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return await Packer.toBlob(doc);
}
