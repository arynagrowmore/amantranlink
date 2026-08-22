const fs = require('fs');

const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const gRules = [];
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let m;
while ((m = ruleRegex.exec(css1)) !== null) {
  const selector = m[1].trim();
  const body = m[2].trim();
  if (selector.includes('gul') || selector.includes('.gul') || selector.includes('--g-')) {
    gRules.push(`${selector} { ${body} }`);
  }
}
console.log('Total Gul / Ivory specific CSS rules:', gRules.length);
console.log('Sample Gul rules:', gRules.slice(0, 10));

