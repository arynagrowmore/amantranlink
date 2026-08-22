const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const heroMatch = html.match(/<section id="top"[\s\S]*?<\/section>/i);
if (heroMatch) {
  const heroHtml = heroMatch[0];
  const imgMatches = [...heroHtml.matchAll(/<img[^>]+>/g)];
  console.log('Images inside hero:');
  imgMatches.forEach(img => console.log(img[0]));
}
