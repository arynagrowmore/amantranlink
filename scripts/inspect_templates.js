const fs = require('fs');
const path = require('path');

const templates = ['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory'];
templates.forEach(t => {
  const filePath = path.join(__dirname, '..', 'public', 'templates', t + '-template', 'index.html');
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    console.log('==================================================');
    console.log('TEMPLATE:', t);
    
    // Look for gallery / moments / looks / story sections
    const lines = html.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('gallery') || line.includes('looks') || line.includes('story') || line.includes('moments') || line.includes('couple') || line.includes('img') || line.includes('figure')) {
        if (line.includes('<img') || line.includes('<figure') || line.includes('id="') || line.includes('class="')) {
          console.log(`L${idx+1}: ${line.trim()}`);
        }
      }
    });
  }
});
