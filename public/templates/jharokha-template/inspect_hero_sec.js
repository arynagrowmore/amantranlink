const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const heroMatch = html.match(/<section[^>]*class="[^"]*jhr-hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
if (heroMatch) {
  console.log('--- JHAROKHA HERO SECTION ---');
  console.log(heroMatch[0].slice(0, 1500));
} else {
  console.log('No jhr-hero found, searching for first section in body:');
  const sec = html.match(/<section[^>]*>([\s\S]*?)<\/section>/i);
  console.log(sec ? sec[0].slice(0, 1500) : 'none');
}

