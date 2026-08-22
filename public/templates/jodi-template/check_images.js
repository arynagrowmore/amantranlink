const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');

// Find all image tags
const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
console.log('Total img tags found:', imgMatches.length);
imgMatches.forEach((img, i) => {
  console.log(`Image ${i + 1} src:`, img[1]);
});

// Check files in public directory recursively
function listFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const publicFiles = listFiles(path.join(__dirname, 'public'));
console.log('\nAll files present in public/:');
publicFiles.forEach(f => console.log('-', path.relative(__dirname, f)));

