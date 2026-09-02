const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace any residual palace names in Hindi / English
html = html.replace(/जय\s*महल\s*पैलेस/g, 'द माइलस्टोन');
html = html.replace(/द\s*लीला\s*पैलेस/g, 'द माइलस्टोन');
html = html.replace(/आमेर\s*किला/g, 'द माइलस्टोन हाईवे');
html = html.replace(/एमआई\s*रोड/g, 'द माइलस्टोन');

html = html.replace(/आरव\s*एवं\s*मीरा/g, 'रुद्र एवं ईशानी');
html = html.replace(/आरव/g, 'रुद्र');
html = html.replace(/मीरा/g, 'ईशानी');

fs.writeFileSync('index.html', html);
console.log('Successfully updated all Travel & FAQ details in index.html!');

