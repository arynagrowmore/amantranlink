const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const heroMatch = html.match(/<section[^>]*class="[^"]*jdi-hero[^"]*"[^>]*>[\s\S]*?<\/section>/i);
if (heroMatch) {
  console.log('--- JODI HERO SECTION ---');
  console.log(heroMatch[0].slice(0, 1500));
} else {
  console.log('Searching for hero section:');
  const sec = html.match(/<section[^>]*id="top"[^>]*>[\s\S]*?<\/section>/i);
  console.log(sec ? sec[0].slice(0, 1500) : 'none');
}
