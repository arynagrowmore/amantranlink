const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/i) || html.match(/<header[^>]*>[\s\S]*?<\/header>/i);
if (navMatch) {
  console.log('Nav/Header match:');
  console.log(navMatch[0]);
}

const logoMatch = html.match(/<a[^>]*class="[^"]*g-serif[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
if (logoMatch) {
  console.log('Navbar logo text:', logoMatch[0]);
}
