const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const emeraldGoldPalette = `
/* ===================================================
   🌿 ROYAL EMERALD GREEN & ANTIQUE GOLD LUXURY PALETTE
   =================================================== */
:root {
  --g-cream: #FAF7F0;
  --g-pink: #164E2E;
  --g-marigold: #D4AF37;
  --g-plum: #0D2818;
  --g-ink: #112419;
  --g-gold: #D4AF37;
  --g-gold-lite: #F3E5AB;

  --w-navy: #164E2E;
  --w-bg: #FAF7F0;
  --w-surface: #FFFDF9;
  --w-ink: #112419;
  --w-ink-soft: #3D5A47;
  --w-accent: #164E2E;
  --w-gold: #D4AF37;
  --w-gold-lite: #F3E5AB;
  --w-line: rgba(212, 175, 55, 0.35);
  --w-hero-ink: #112419;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(212, 175, 55, 0.3), transparent 60%), linear-gradient(180deg, #FAF7F0 0%, #F3ECDC 100%);
}

body {
  background: var(--g-cream, #FAF7F0) !important;
  color: var(--g-ink, #112419) !important;
}

/* Couple Typography Gradient */
h1 {
  background: linear-gradient(135deg, #0D2818 0%, #164E2E 35%, #D4AF37 60%, #0D2818 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0 2px 10px rgba(212, 175, 55, 0.35)) !important;
}

/* Cards & Borders */
.rounded-2xl {
  background: #FFFDF9 !important;
  border-color: rgba(212, 175, 55, 0.35) !important;
}

.rounded-2xl:hover {
  border-color: #D4AF37 !important;
  box-shadow: 0 20px 40px -10px rgba(13, 40, 24, 0.2), 0 0 25px rgba(212, 175, 55, 0.35) !important;
}

/* Floating Audio Button */
.rjm-music-btn {
  background: linear-gradient(135deg, #0D2818, #164E2E) !important;
  border-color: #F3E5AB !important;
  color: #F3E5AB !important;
  box-shadow: 0 8px 24px -4px rgba(13, 40, 24, 0.6), 0 0 16px -2px rgba(212, 175, 55, 0.4) !important;
}
`;

css = emeraldGoldPalette + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully applied Royal Emerald Green & Antique Gold palette to Ivory style.css!');
