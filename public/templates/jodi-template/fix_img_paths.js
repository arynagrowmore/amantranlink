const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Fix all /themes/ to ./public/themes/
html = html.replace(/src="\/themes\//g, 'src="./public/themes/');
html = html.replace(/src="themes\//g, 'src="./public/themes/');
html = html.replace(/href="\/themes\//g, 'href="./public/themes/');

// Also ensure couple caricature & plate.webp are properly sized and visible
html = html.replace(/loading="lazy"/g, 'loading="eager"');
html = html.replace(/decoding="async"/g, 'decoding="sync"');

fs.writeFileSync('index.html', html);
console.log('Fixed all image paths in jodi-template/index.html!');
