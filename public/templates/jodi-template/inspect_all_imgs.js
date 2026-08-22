const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
console.log(`Total <img> tags: ${imgMatches.length}`);

imgMatches.forEach((img, i) => {
  const src = img[1];
  if (src.startsWith('data:')) {
    console.log(`Img ${i + 1}: Data URL SVG (Length: ${src.length})`);
  } else {
    const exists = fs.existsSync(src.replace(/^\.\//, ''));
    console.log(`Img ${i + 1}: File URL "${src}" (Exists locally: ${exists})`);
  }
});
