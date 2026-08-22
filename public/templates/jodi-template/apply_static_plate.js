const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const staticPlateStyling = `
/* ===================================================
   STATIC HIGH-DEFINITION ROYAL HERO PLATE (No Rotation)
   =================================================== */

.jdi-plate-slot {
  aspect-ratio: 1000 / 1034 !important;
  max-width: 100% !important;
  width: min(90vw, 480px) !important;
  height: auto !important;
  min-height: 380px !important;
  display: block !important;
  position: relative !important;
  margin-inline: auto !important;
  opacity: 1 !important;
}

@media (min-width: 1024px) {
  .jdi-plate-slot {
    width: min(46vw, 650px) !important;
    height: min(84svh, 800px) !important;
    margin: 0 !important;
  }
}

.jdi-plate-slot img, img[src*="plate"] {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: bottom center !important;
  display: block !important;
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
  filter: drop-shadow(0 14px 40px rgba(194, 155, 78, 0.45)) !important;
}
`;

css = staticPlateStyling + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully applied static prominent hero plate styling to style.css!');
