const fs = require('fs');
const path = require('path');

const templates = [
  { name: 'rajmahal', sec: 'id="gallery"' },
  { name: 'royaldawn', sec: 'id="storyImg' },
  { name: 'jharokha', sec: 'id="gallery"' },
  { name: 'mayura', sec: 'id="gallery"' },
  { name: 'jodi', sec: 'id="gallery"' },
  { name: 'dak', sec: 'id="album"' },
  { name: 'ivory', sec: 'id="looks"' }
];

templates.forEach(t => {
  const filePath = path.join(__dirname, '..', 'public', 'templates', t.name + '-template', 'index.html');
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    console.log('==================================================');
    console.log('TEMPLATE:', t.name);
    const idx = html.indexOf(t.sec);
    if (idx !== -1) {
      console.log(html.substring(idx - 50, idx + 800));
    } else {
      console.log('NOT FOUND', t.sec);
    }
  }
});
