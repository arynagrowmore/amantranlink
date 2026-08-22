const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log('H1 content:');
console.log(h1Match ? h1Match[0] : 'none');

// Find any bride / groom specific titles or cards
const bgMatches = [...html.matchAll(/(?:groom|bride|dulha|dulhan|dhruv|shreya)[^<]*/gi)];
console.log('\nMatches for groom/bride/names:');
bgMatches.slice(0, 10).forEach(m => console.log(m[0]));
