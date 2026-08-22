const fs = require('fs');
const path = require('path');

const templates = [
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\ivory-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\dak-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\jodi-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\mayura-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\rajmahal-template'
];

templates.forEach(tDir => {
  const htmlPath = path.join(tDir, 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace K + A, K+A, K · A, K & A, K&amp;A
  html = html.replace(/K\s*\+\s*A/g, 'D + S');
  html = html.replace(/K\s*·\s*A/g, 'D · S');
  html = html.replace(/K\s*&amp;\s*A/g, 'D &amp; S');
  html = html.replace(/K\s*&\s*A/g, 'D & S');
  html = html.replace(/>KA</g, '>DS<');
  html = html.replace(/>K \+ A</g, '>D + S<');

  fs.writeFileSync(htmlPath, html);
  console.log(`Replaced all K + A with D + S in ${path.basename(tDir)}!`);
});
