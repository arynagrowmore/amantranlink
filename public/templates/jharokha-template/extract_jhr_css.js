const fs = require('fs');

const css1 = fs.readFileSync('css/style_0.css', 'utf8');
const css2 = fs.readFileSync('css/style_1.css', 'utf8');
const fullCss = css1 + '\n' + css2;

// Extract Jharokha specific rules
const jhrRules = [];
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let m;
while ((m = ruleRegex.exec(fullCss)) !== null) {
  const selector = m[1].trim();
  const body = m[2].trim();
  if (selector.includes('jhr-') || selector.includes('.jhr') || selector.includes('data-lang') || selector.includes('data-tw-reveal') || selector.includes('l-en') || selector.includes('l-hi')) {
    jhrRules.push(`${selector} { ${body} }`);
  }
}

console.log('Total Jharokha specific rules:', jhrRules.length);

// Extract Jharokha keyframes
const allKeyframes = fullCss.match(/@keyframes\s+jhr-[a-zA-Z0-9_-]+\s*\{[^}]+\}/gi) || [];
console.log('Jharokha keyframes:', allKeyframes);

fs.writeFileSync('css/jhr_extracted.css', jhrRules.join('\n\n') + '\n\n' + allKeyframes.join('\n\n'));
console.log('Saved css/jhr_extracted.css!');
