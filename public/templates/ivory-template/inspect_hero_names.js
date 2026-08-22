const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('<h1');
console.log('--- HERO NAMES MARKUP ---');
console.log(html.substring(sIdx - 200, sIdx + 600));
