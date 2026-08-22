const fs = require('fs');
const path = require('path');

const templates = [
  { name: 'rajmahal', sec: '#gallery' },
  { name: 'royaldawn', sec: '#events' },
  { name: 'jharokha', sec: '#gallery' },
  { name: 'mayura', sec: '#gallery' },
  { name: 'jodi', sec: '#gallery' },
  { name: 'dak', sec: '#album' },
  { name: 'ivory', sec: '#looks' }
];

templates.forEach(t => {
  const filePath = path.join(__dirname, '..', 'public', 'templates', t.name + '-template', 'index.html');
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    console.log('==================================================');
    console.log('TEMPLATE:', t.name);
    
    // Find all <figure or <img within the section
    const secStart = html.indexOf(t.sec.replace('#', 'id="'));
    if (secStart !== -1) {
      const nextSec = html.indexOf('</section>', secStart);
      const secHtml = html.substring(secStart, nextSec !== -1 ? nextSec + 10 : secStart + 2000);
      const figures = secHtml.match(/<figure[^>]*>[\s\S]*?<\/figure>/g) || [];
      console.log('  Total <figure> blocks in section:', figures.length);
      figures.forEach((f, idx) => {
        const imgTag = f.match(/<img[^>]+>/);
        console.log(`    Fig ${idx+1}:`, imgTag ? imgTag[0].substring(0, 100) + '...' : 'NO IMG TAG (has inline svg?)');
      });
    } else {
      console.log('Section not found:', t.sec);
    }
  }
});
