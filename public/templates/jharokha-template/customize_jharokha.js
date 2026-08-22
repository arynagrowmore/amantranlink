const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Update Title and Meta
html = html.replace(/<title>[^<]*<\/title>/i, '<title>Dhruv &amp; Shreya — The Jharokha Royal Wedding</title>');
html = html.replace(/<meta name="description" content="[^"]*"/i, '<meta name="description" content="You are cordially invited to celebrate the royal wedding of Dhruv &amp; Shreya in Himmatnagar."');

// Update couple names in all occurrences
html = html.replace(/Karan/g, 'Dhruv');
html = html.replace(/Anjali/g, 'Shreya');
html = html.replace(/करण/g, 'ध्रुव');
html = html.replace(/अंजलि/g, 'श्रेया');

// Update mark initials
html = html.replace(/>K\s*·\s*A</g, '>D · S<');
html = html.replace(/>K\s*&amp;\s*A</g, '>D &amp; S<');

// Update date
html = html.replace(/12 December 2026/g, '3 December 2024');
html = html.replace(/10 December 2026/g, '1 December 2024');
html = html.replace(/11 December 2026/g, '2 December 2024');
html = html.replace(/13 December 2026/g, '4 December 2024');

// Update cities & venues
html = html.replace(/Jaipur/g, 'Himmatnagar');
html = html.replace(/जयपुर/g, 'हिम्मतनगर');

html = html.replace(/Jai Mahal Palace/g, 'The Milestone');
html = html.replace(/The Leela Palace/g, 'The Milestone');
html = html.replace(/Amber Fort Road/g, 'The Milestone Highway');
html = html.replace(/MI Road/g, 'The Milestone');

// Update parents in Family section
html = html.replace(/Mr\.\s*Sanjay\s*Mehta/gi, 'Mr. Nalinkumar');
html = html.replace(/श्री\s*संजय\s*मेहता/gi, 'श्री नलिनकुमार');
html = html.replace(/Mrs\.\s*Rekha\s*Mehta/gi, 'Mrs. Kalpuben');
html = html.replace(/श्रीमती\s*रेखा\s*मेहता/gi, 'श्रीमती कल्पूबेन');

// Update contacts
html = html.replace(/Rohan/g, 'Nalinkumar');
html = html.replace(/\+91 98100 12345/g, '+91 98251 45678');
html = html.replace(/Riya/g, 'Family Helpdesk');
html = html.replace(/\+91 97110 67890/g, '+91 98982 34567');

// Update hashtag
html = html.replace(/#AaravKiMeera/gi, '#DhruvKiShreya');
html = html.replace(/AaravKiMeera/gi, '#DhruvKiShreya');

fs.writeFileSync('index.html', html);
console.log('Successfully customized Jharokha theme with Dhruv & Shreya details!');
