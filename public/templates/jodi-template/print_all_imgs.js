const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
imgMatches.forEach((img, i) => {
  console.log(`Image ${i + 1}: ${img[1]}`);
});
