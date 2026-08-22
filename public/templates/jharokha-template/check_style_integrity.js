const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check if all SVGs are rendered and if there are any broken styles or missing tags
console.log('Has .jhr div:', html.includes('class="jhr"'));
console.log('Has <style> or link rel="stylesheet":', html.includes('rel="stylesheet"'));

// Let's check if the raw CSS from style_0.css and style_1.css was properly written to style.css
const styleCss = fs.readFileSync('style.css', 'utf8');
console.log('style.css size:', styleCss.length);

// Check if .jhr rules are in style.css
const jhrClassMatches = styleCss.match(/\.jhr[^{]*\{[^}]*\}/g);
console.log('.jhr class rules in style.css:', jhrClassMatches ? jhrClassMatches.length : 0);
if (jhrClassMatches) {
  console.log('First 5 .jhr rules:', jhrClassMatches.slice(0, 5));
}

