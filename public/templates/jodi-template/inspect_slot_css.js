const fs = require('fs');

const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const slotMatch = css1.match(/\.jdi-plate-slot[^{]*\{[^}]*\}/gi);
console.log('.jdi-plate-slot rules in original CSS:', slotMatch);
