const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

console.log('=== DÂK TEMPLATE AUDIT ===');

// Check for unwanted names
const namesToCheck = ['Karan', 'Anjali', 'करण', 'अंजलि', 'Aarav', 'Meera', 'Jaipur', 'जयपुर', 'Sanjay Mehta', 'Rekha Mehta', '98100 12345', '97110 67890'];
namesToCheck.forEach(name => {
  const count = (html.match(new RegExp(name, 'g')) || []).length;
  console.log(`- Mention of "${name}": ${count}`);
});

// Check current couple details
console.log('\n--- Active Details ---');
console.log('Title:', (html.match(/<title>([^<]+)<\/title>/) || [])[1]);
console.log('Couple names in H1:', (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim());

// Events
const events = [...html.matchAll(/<h3[^>]*class="[^"]*serif[^"]*"[^>]*>([^<]+)<\/h3>/gi)].map(m => m[1]);
console.log('\nEvent headings found:', events);

