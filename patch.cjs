const fs = require('fs');
let code = fs.readFileSync('src/utils/invoiceGenerator.ts', 'utf8');

const logoCode = `
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
`;

if(!code.includes("doc.roundedRect(marginL, y - 5")) {
    code = code.replace("    // Company Credentials Left", logoCode + "    // Company Credentials Left");
    fs.writeFileSync('src/utils/invoiceGenerator.ts', code);
}
