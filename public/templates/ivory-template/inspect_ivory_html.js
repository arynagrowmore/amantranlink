const fs = require('fs');

const html = fs.readFileSync('page.html', 'utf8');

// Find all CSS variable declarations in HTML
const styleMatches = [...html.matchAll(/style="([^"]*--[^"]*)"/g)];
console.log('Style variables in HTML:');
styleMatches.slice(0, 10).forEach(m => console.log(m[1]));

// Check all classes with prefix in HTML
const allClassMatches = [...new Set([...html.matchAll(/class="([^"]+)"/g)].map(m => m[1]))];
console.log('Total unique class strings:', allClassMatches.length);
console.log('Sample classes:');
allClassMatches.slice(0, 10).forEach(c => console.log('-', c));

