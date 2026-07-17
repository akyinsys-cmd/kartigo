const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

if (!c.includes('/* High Contrast Mode */')) {
  const highContrastCSS = `
/* High Contrast Mode */
body.high-contrast-mode {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}
body.high-contrast-mode * {
  border-color: #FFFF00 !important;
}
body.high-contrast-mode p, 
body.high-contrast-mode span, 
body.high-contrast-mode h1, 
body.high-contrast-mode h2, 
body.high-contrast-mode h3, 
body.high-contrast-mode h4, 
body.high-contrast-mode h5, 
body.high-contrast-mode h6,
body.high-contrast-mode div {
  color: #FFFFFF !important;
}
body.high-contrast-mode a,
body.high-contrast-mode button {
  color: #FFFF00 !important;
  background-color: #000000 !important;
  border: 2px solid #FFFF00 !important;
}
`;
  c += highContrastCSS;
  fs.writeFileSync('src/index.css', c);
}
