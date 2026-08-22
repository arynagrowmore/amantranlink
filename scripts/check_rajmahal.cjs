const fs = require('fs');
const content = fs.readFileSync('public/templates/rajmahal-template/index.html', 'utf8');

console.log('Total Length:', content.length);
console.log('Contains rsvp id:', content.includes('id="rsvp"'));
console.log('Contains rjm-foot:', content.includes('rjm-foot'));
console.log('Contains shared-rsvp.js:', content.includes('shared-rsvp.js'));

const rsvpStart = content.indexOf('<!-- 👑 THE RAJMAHAL PALACE ROYAL RSVP SECTION -->');
const rsvpEnd = content.indexOf('</section>', rsvpStart) + 10;
console.log('\n--- RSVP SECTION ---\n');
console.log(content.substring(rsvpStart, rsvpEnd));
