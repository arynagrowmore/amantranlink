const fs = require('fs');

const html = fs.readFileSync('page.html', 'utf8');

// Find all img tags
const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
console.log('Total images found in page.html:', imgs.length);
imgs.forEach(i => console.log('Image:', i[1].slice(0, 100)));

// Find all background-image or svg in HTML
const svgCount = (html.match(/<svg/g) || []).length;
console.log('Total SVG elements:', svgCount);

// Check if any themes/jharokha/ or similar path exists
const jharokhaPaths = [...html.matchAll(/["']([^"']*jharokha[^"']*)["']/gi)];
console.log('Jharokha paths in HTML:', jharokhaPaths.map(m => m[1]));

// Check CSS classes
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (bodyMatch) {
  console.log('Body length:', bodyMatch[1].length);
  fs.writeFileSync('body_extracted.html', bodyMatch[1]);
}

