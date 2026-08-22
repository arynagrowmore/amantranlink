const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('id="top"');
const eIdx = html.indexOf('</section>', sIdx);
console.log('--- CURRENT HERO SECTION ---');
console.log(html.substring(sIdx, eIdx + 10));
