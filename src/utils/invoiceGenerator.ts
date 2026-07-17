import { jsPDF } from "jspdf";
import { OrderRecord } from "../types";

/**
 * Utility class to generate pristine, professional GST-compliant PDF invoices
 * for Kartigo document unlock orders using jsPDF.
 */
export const invoiceGenerator = {
  /**
   * Generates a beautifully formatted PDF invoice and saves/downloads it on the client side.
   * @param order The completed order record with invoice metadata
   * @param billingProfile Additional customer details for billing (e.g. state, business profile, etc.)
   */
  generateAndDownload(order: OrderRecord, billingProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    gstId?: string;
    state?: string;
  }): void {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // ----------------------------------------------------
    // DIMENSIONS & STYLING CONSTANTS
    // ----------------------------------------------------
    const pageHeight = 297;
    const pageWidth = 210;
    const marginL = 15;
    const marginR = 195;
    let y = 18; // Vertical cursor tracker

    // Helper to print text on the right edge
    const printRight = (text: string, currY: number) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, marginR - textWidth, currY);
    };

    // Helper for table column bounds
    const colX = {
      sl: 15,
      desc: 28,
      base: 110,
      gst: 142,
      total: 168
    };

    // ----------------------------------------------------
    // HEADER: Brand & Visual Anchor
    // ----------------------------------------------------
    // Top border line in Kartigo brand colors (Dark Violet / Slate)
    doc.setDrawColor(109, 40, 217); // #6D28D9
    doc.setLineWidth(1.5);
    doc.line(marginL, y, marginR, y);
    y += 10;

    // Brand Title Left
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("KARTIGO DRAFT", marginL, y);

    // INVOICE text Right
    doc.setFontSize(16);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(71, 85, 105); // slate-600
    printRight("TAX INVOICE", y);
    y += 8;


    // Add Company Logo (Simulated using shapes)
    doc.setFillColor(109, 40, 217); // brand-primary purple
    doc.roundedRect(marginL, y - 5, 12, 12, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("K", marginL + 3.5, y + 3.5);
    
    doc.setFontSize(18);
    doc.setTextColor(109, 40, 217);
    doc.text("KARTIGO", marginL + 16, y + 2.5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("DRAFT & AUTOMATION", marginL + 16, y + 6);
    
    y += 12;
    // Company Credentials Left
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Kartigo Tech Solutions Private Limited", marginL, y);
    printRight("Original for Recipient", y);
    y += 4.5;
    doc.text("Sector 4, HSR Layout, Bengaluru, KA - 560102", marginL, y);
    y += 4.5;
    doc.text("GSTIN: 29AAECK3192F1Z3 | support@kartigo.com", marginL, y);
    
    y += 10;
    
    // Light divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginR, y);
    
    y += 8;

    // ----------------------------------------------------
    // INVOICE & CLIENT INFO GRID
    // ----------------------------------------------------
    // Section header Left: BILL TO
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("BILL TO:", marginL, y);
    
    // Section header Right: INVOICE DETAILS
    printRight("INVOICE DETAILS:", y);
    
    y += 6;

    // Customer metadata (Left)
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    
    const clientName = billingProfile?.name || order.userEmail?.split("@")[0] || "Valued Customer";
    doc.text(clientName, marginL, y);
    
    // Invoice details (Right)
    doc.setFont("Helvetica", "bold");
    printRight(`Invoice No:  ${order.invoiceNo || "KTG-PENDING"}`, y);
    
    y += 4.5;
    
    doc.setFont("Helvetica", "normal");
    if (billingProfile?.companyName) {
      doc.text(billingProfile.companyName, marginL, y);
    } else {
      doc.text(order.userEmail || "", marginL, y);
    }
    
    const rawDate = order.invoiceDate ? new Date(order.invoiceDate) : new Date();
    const formattedDate = rawDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    printRight(`Date:  ${formattedDate}`, y);
    
    y += 4.5;
    
    if (billingProfile?.address) {
      doc.text(billingProfile.address, marginL, y);
    } else if (billingProfile?.phone) {
      doc.text(`Phone: ${billingProfile.phone}`, marginL, y);
    } else {
      doc.text("Billing Address: Online Customer", marginL, y);
    }
    printRight(`Order ID:  ${order.id.substring(0, 12).toUpperCase()}`, y);
    
    y += 4.5;
    
    if (billingProfile?.gstId) {
      doc.text(`GSTIN: ${billingProfile.gstId}`, marginL, y);
    } else if (billingProfile?.state) {
      doc.text(`State: ${billingProfile.state}`, marginL, y);
    }
    printRight("Payment Mode:  Razorpay Secure Online", y);

    y += 12;

    // ----------------------------------------------------
    // TABLE: Itemized line details
    // ----------------------------------------------------
    // Draw table header background box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(marginL, y, marginR - marginL, 8.5, "F");
    
    // Draw table header text
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600
    
    doc.text("S.No", colX.sl, y + 5.5);
    doc.text("Item & Description", colX.desc, y + 5.5);
    printRight("Taxable Value", y + 5.5); // align with total headers
    
    // Position of custom columns
    const baseWidth = doc.getTextWidth("Taxable Value");
    doc.text("GST Rate", colX.gst, y + 5.5);
    doc.text("Total (INR)", colX.total, y + 5.5);
    
    y += 8.5; // push cursor past header

    // Draw Line Item Row
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const description = `Unlock License & High-Fidelity Export for Document: "${order.documentTitle}"`;
    const gstRateText = `${order.gstRate || 18}%`;
    const baseAmountText = `INR ${order.baseAmount?.toFixed(2) || (order.amount / 1.18).toFixed(2)}`;
    const totalAmountText = `INR ${order.amount.toFixed(2)}`;

    // Draw row content
    doc.text("1", colX.sl, y + 6);
    
    // Handle multi-line wrapping for long document titles
    const wrappedDescription = doc.splitTextToSize(description, 75);
    doc.text(wrappedDescription, colX.desc, y + 6);
    
    const descHeight = wrappedDescription.length * 4.5;
    const rowHeight = Math.max(8, descHeight + 2);

    doc.text(baseAmountText, colX.base, y + 6);
    doc.text(gstRateText, colX.gst, y + 6);
    doc.text(totalAmountText, colX.total, y + 6);

    y += rowHeight;

    // Draw horizontal table bottom line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginR, y);

    y += 8;

    // ----------------------------------------------------
    // TAX RECONCILIATION SUMMARY (CGST/SGST/IGST breakdown)
    // ----------------------------------------------------
    const gstAmountVal = order.gstAmount || (order.amount - (order.amount / 1.18));
    const isInterState = billingProfile?.state && billingProfile.state.toLowerCase() !== "karnataka";
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    
    // Summary Headers Box on Right
    const summaryLabelX = 135;
    const summaryValX = 172;
    
    doc.text("Subtotal:", summaryLabelX, y);
    doc.setFont("Helvetica", "normal");
    doc.text(`INR ${order.baseAmount?.toFixed(2) || (order.amount - gstAmountVal).toFixed(2)}`, summaryValX, y);
    
    y += 5.5;

    if (isInterState) {
      doc.setFont("Helvetica", "normal");
      doc.text(`IGST (${order.gstRate || 18}%):`, summaryLabelX, y);
      doc.text(`INR ${gstAmountVal.toFixed(2)}`, summaryValX, y);
    } else {
      doc.setFont("Helvetica", "normal");
      doc.text("CGST (9.0%):", summaryLabelX, y);
      doc.text(`INR ${(gstAmountVal / 2).toFixed(2)}`, summaryValX, y);
      
      y += 5.5;
      
      doc.text("SGST (9.0%):", summaryLabelX, y);
      doc.text(`INR ${(gstAmountVal / 2).toFixed(2)}`, summaryValX, y);
    }

    y += 7;

    // Grand Total Divider
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(summaryLabelX, y - 2, marginR, y - 2);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Grand Total:", summaryLabelX, y + 2);
    doc.text(`INR ${order.amount.toFixed(2)}`, summaryValX, y + 2);

    y += 18;

    // ----------------------------------------------------
    // LEGAL DISCLAIMERS & SIGN-OFF
    // ----------------------------------------------------
    // Check if we are running close to page bottom; if so, trigger new page
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 20;
    }

    // Terms & Notes Box
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.rect(marginL, y, 100, 26, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Terms & Conditions:", marginL + 3, y + 5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("1. All sales for digitally tailored documents are final.", marginL + 3, y + 9);
    doc.text("2. Document unlock licenses grant lifetime viewing & PDF editing.", marginL + 3, y + 13);
    doc.text("3. This is a computer generated invoice and requires no physical signature.", marginL + 3, y + 17);
    doc.text("4. Subject to Bengaluru Jurisdiction.", marginL + 3, y + 21);

    // Signature Area
    const sigY = y;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    printRight("For Kartigo Tech Solutions Pvt Ltd", sigY + 5);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(140, sigY + 18, marginR, sigY + 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    printRight("Authorized Signatory", sigY + 22);

    // ----------------------------------------------------
    // FOOTER
    // ----------------------------------------------------
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(109, 40, 217);
    doc.text("Thank you for using Kartigo!", pageWidth / 2, pageHeight - 12, { align: "center" });

    // Download PDF
    const filename = `invoice_${order.invoiceNo || order.id.substring(0, 8)}.pdf`;
    doc.save(filename);
  }
};
