const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const luxuryEnhancementsCss = `
/* ===================================================
   ROYAL GOLD TEXT SHIMMER & LUXURY TOUCHES
   =================================================== */

.jhr-hero-names, .jhr-names {
  background: linear-gradient(135deg, #7a1f38 0%, #a67c2e 45%, #c9a24a 60%, #7a1f38 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(201, 162, 74, 0.25));
}

.jhr-dresscode h3 {
  color: #7a1f38;
}

/* Enhanced 3D Petal Shower */
.jhr-petal {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  animation: jhr-petal 12s linear infinite;
}

.jhr-petal:nth-child(2) { animation-delay: 2.5s; animation-duration: 14s; left: 25% !important; }
.jhr-petal:nth-child(3) { animation-delay: 5s; animation-duration: 10s; left: 65% !important; }
.jhr-petal:nth-child(4) { animation-delay: 7.5s; animation-duration: 16s; left: 85% !important; }
`;

css = luxuryEnhancementsCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully injected luxury styling into style.css!');
