const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const whiteGroomBrideCss = `
/* ===================================================
   🤍 GROOM & BRIDE (Rudra & Ishani) RADIANT PURE WHITE TYPOGRAPHY
   =================================================== */

h1, .g-serif h1, .g-names, .jdi-names, .myr-names, .rjm-names {
  color: #FFFFFF !important;
  -webkit-text-fill-color: #FFFFFF !important;
  background: none !important;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.45), 0 0 24px rgba(212, 175, 55, 0.5) !important;
  filter: drop-shadow(0 4px 12px rgba(13, 40, 24, 0.5)) !important;
}

/* Ensure the Hero Header Card has a Rich Deep Emerald Luxe Background so White Names Pop Out */
.gul > section:first-of-type > div:first-of-type,
section#top > div,
.bg-\\[color\\:var\\(--g-pink\\)\\] {
  background: linear-gradient(135deg, #0D2818 0%, #164E2E 50%, #06150D 100%) !important;
  color: #FFFFFF !important;
}

.gul p, .gul span {
  color: inherit;
}
`;

css = whiteGroomBrideCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully set Groom & Bride names to Pure Radiant White in Ivory style.css!');

