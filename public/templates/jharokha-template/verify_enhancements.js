const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
console.log('Dress Code section exists:', html.includes('id="dress-code"'));
console.log('Live Stream section exists:', html.includes('id="live-stream"'));
console.log('Couple Names gradient applied:', fs.readFileSync('style.css', 'utf8').includes('webkit-background-clip: text'));
