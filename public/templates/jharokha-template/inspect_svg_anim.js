const fs = require('fs');

const code = fs.readFileSync('jharokha_app_chunk.js', 'utf8');

// Find path draw animations
const drawIdx = code.indexOf('strokeDasharray') !== -1 ? code.indexOf('strokeDasharray') : code.indexOf('pathLength');
if (drawIdx !== -1) {
  console.log('Path draw snippet:');
  console.log(code.substring(drawIdx - 200, drawIdx + 400));
} else {
  console.log('Searching for SVG animations in Jharokha...');
  const svgMatches = code.match(/.{0,100}(?:jhr-hero|pathLength|jhr-sway).{0,100}/g);
  svgMatches?.slice(0, 10).forEach(s => console.log('Match:', s));
}
