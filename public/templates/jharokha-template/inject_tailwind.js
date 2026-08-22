const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Check if Tailwind CDN is present
console.log('Has Tailwind script:', html.includes('cdn.tailwindcss.com'));

// Let's add Tailwind CSS CDN script into <head> of index.html so ALL utility classes (flex, items-center, text-center, justify-center, grid, absolute, relative, max-w, px, py, etc.) work with 100% precision!
if (!html.includes('https://cdn.tailwindcss.com')) {
  html = html.replace('</head>', '  <script src="https://cdn.tailwindcss.com"></script>\n</head>');
  fs.writeFileSync('index.html', html);
  console.log('Added Tailwind CSS CDN to index.html!');
}

