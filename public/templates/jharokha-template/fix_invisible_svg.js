const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const opMatches = [...html.matchAll(/opacity=["']0["']/gi)];
console.log('Total opacity="0" in index.html:', opMatches.length);

// Let's replace opacity="0" on SVG arch paths with opacity="0.9" and stroke-dasharray="1 0" or draw with GSAP
let fixedHtml = html.replace(/opacity="0"\s+pathLength="1"\s+stroke-dashoffset="0"\s+stroke-dasharray="0 1"/gi, 'opacity="0.95" pathLength="1" stroke-dashoffset="0" stroke-dasharray="1 0"');
fixedHtml = fixedHtml.replace(/opacity="0"/g, 'opacity="0.9"');

fs.writeFileSync('index.html', fixedHtml);
console.log('Fixed invisible SVG paths in index.html!');
