const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('id="story"');
if (sIdx !== -1) {
  const eIdx = html.indexOf('</section>', sIdx);
  console.log('--- STORY SECTION MARKUP ---');
  console.log(html.substring(sIdx, eIdx + 10));
} else {
  console.log('Searching for timeline or story in html:');
  const match = html.match(/<section[^>]*class="[^"]*timeline[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  console.log(match ? match[0].slice(0, 1000) : 'none');
}
