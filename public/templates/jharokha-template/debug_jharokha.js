const fs = require('fs');

const origHtml = fs.readFileSync('page.html', 'utf8');
const ourHtml = fs.readFileSync('index.html', 'utf8');

// Check the root wrapper element inside <body> in original page.html
const origBodyMatch = origHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (origBodyMatch) {
  console.log('Original body start:');
  console.log(origBodyMatch[1].slice(0, 1000));
}

// Check style variables in original wrapper
const origWrapperMatch = origHtml.match(/<div class="[^"]*jhr[^"]*"[^>]*style="([^"]*)"/i);
if (origWrapperMatch) {
  console.log('Found JHR wrapper with style:');
  console.log(origWrapperMatch[0].slice(0, 300));
} else {
  console.log('No direct jhr class, checking any top div in body');
  const topDiv = origHtml.match(/<body[^>]*>\s*(<div[^>]+>)/i);
  console.log('Top div in body:', topDiv ? topDiv[1] : 'none');
}

// Check CSS rules loaded
const cssFiles = fs.readdirSync('css');
console.log('CSS files downloaded in css/:', cssFiles);
