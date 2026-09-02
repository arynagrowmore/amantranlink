const fs = require('fs');
const path = require('path');

const templates = [
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\rajmahal-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\jharokha-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\mayura-template',
  'C:\\Users\\Avira\\Web Devlopment Project\\Wedding Invitation Design\\jodi-template'
];

templates.forEach(tDir => {
  const htmlPath = path.join(tDir, 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');

  html = html.replace(/Aarav/g, 'Rudra');
  html = html.replace(/Meera/g, 'Ishani');
  html = html.replace(/आरव/g, 'रुद्र');
  html = html.replace(/मीरा/g, 'ईशानी');
  html = html.replace(/जय\s*महल\s*पैलेस/g, 'द माइलस्टोन');
  html = html.replace(/द\s*लीला\s*पैलेस/g, 'द माइलस्टोन');

  fs.writeFileSync(htmlPath, html);
  console.log(`Cleaned FAQ / Text in ${path.basename(tDir)}!`);
});

