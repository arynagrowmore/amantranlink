const fs = require('fs');

const html = fs.readFileSync('page.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (bodyMatch) {
  fs.writeFileSync('body_extracted.html', bodyMatch[1]);
  console.log('Saved body_extracted.html, length:', bodyMatch[1].length);
}

// Find top wrapper element in body
const wrapperMatch = html.match(/<div class="([^"]*)"[^>]*style="([^"]*)"/);
if (wrapperMatch) {
  console.log('Top wrapper class:', wrapperMatch[1]);
  console.log('Top wrapper style variables:', wrapperMatch[2].slice(0, 300));
}

// Find all classes containing 'ivy-' or 'ivory-' or similar
const ivyClasses = [...new Set([...html.matchAll(/(?:ivy|ivory)-[a-zA-Z0-9_-]+/g)].map(m => m[0]))];
console.log('Ivory CSS classes found:', ivyClasses);

// Find all keyframes in CSS
const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');
const fullCss = css0 + '\n' + css1;

const keyframes = [...fullCss.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
console.log('All Keyframes in CSS:', [...new Set(keyframes)].filter(k => k.includes('ivy') || k.includes('ivory') || k.includes('tw-')));

