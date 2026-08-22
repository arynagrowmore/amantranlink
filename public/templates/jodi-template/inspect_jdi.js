const fs = require('fs');

const html = fs.readFileSync('page.html', 'utf8');

const jdiClasses = [...new Set([...html.matchAll(/jdi-[a-zA-Z0-9_-]+/g)].map(m => m[0]))];
console.log('JDI classes found:', jdiClasses);

const css1 = fs.readFileSync('css/style_1.css', 'utf8');
const jdiKeyframes = [...css1.matchAll(/@keyframes\s+(jdi-[a-zA-Z0-9_-]+)/g)].map(m => m[1]);
console.log('JDI keyframes in CSS:', jdiKeyframes);

const jdiRules = [];
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let m;
while ((m = ruleRegex.exec(css1)) !== null) {
  const selector = m[1].trim();
  const body = m[2].trim();
  if (selector.includes('jdi') || selector.includes('.jdi')) {
    jdiRules.push(`${selector} { ${body} }`);
  }
}
console.log('Total JDI specific CSS rules:', jdiRules.length);
console.log('Sample JDI rules:', jdiRules.slice(0, 10));

