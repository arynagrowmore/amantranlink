const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const imgMatches = [...html.matchAll(/<img[^>]+src=["']data:image\/svg\+xml[^"']+["'][^>]*>/gi)];
console.log('Total Data URL images:', imgMatches.length);

imgMatches.forEach((img, i) => {
  console.log(`\n--- DATA IMG ${i + 1} ---`);
  console.log(img[0].slice(0, 250));
});
