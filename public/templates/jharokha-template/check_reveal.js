const fs = require('fs');

const origCss = fs.readFileSync('css/style_1.css', 'utf8');

// Find original data-tw-reveal rule in style_1.css
const revealMatch = origCss.match(/\[data-tw-reveal\]\{[^}]+\}/gi);
console.log('Original data-tw-reveal rule:', revealMatch);

// Find @keyframes tw-reveal
const keyframeMatch = origCss.match(/@keyframes\s+tw-reveal\s*\{[^}]+\}/gi);
console.log('tw-reveal keyframe:', keyframeMatch);
