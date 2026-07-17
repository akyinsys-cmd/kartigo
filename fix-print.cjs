const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const printExtensions = `
  /* Advanced Page Break Handling */
  .page-break {
    page-break-before: always;
  }
  .prose pre, .prose blockquote, .prose table, .prose img, .prose figure, .prose li {
    page-break-inside: avoid;
  }
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
    page-break-after: avoid;
    page-break-inside: avoid;
    color: #000000 !important;
  }
  /* Header styling for physical PDFs */
  .print-header {
    display: flex !important;
    justify-content: space-between;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 20px;
    font-size: 10pt;
    font-weight: bold;
    color: #000 !important;
  }
  .print-footer {
    display: block !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 8pt;
    text-align: center;
    border-top: 1px solid #ccc;
    padding-top: 5px;
  }
  .prose p {
    orphans: 4;
    widows: 4;
    line-height: 1.5;
  }
  /* Ensure links are printed but without underlines if not needed */
  .prose a {
    text-decoration: none !important;
    color: #000 !important;
  }
`;

c = c.replace(/  \.prose p \{\n    orphans: 3;\n    widows: 3;\n  \}/, printExtensions.trim());
fs.writeFileSync('src/index.css', c);
