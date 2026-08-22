const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Remove emerald green overrides
css = css.replace(/\/\* ===================================================\s*🌿 ROYAL EMERALD GREEN[\s\S]*?apply_emerald_ivory\.js/gi, '');
css = css.replace(/linear-gradient\(135deg,\s*#0D2818[^)]*\)/gi, 'linear-gradient(135deg, #E31364 0%, #C2185B 50%, #880E4F 100%)');
css = css.replace(/#0D2818/gi, '#5B1B3A');
css = css.replace(/#164E2E/gi, '#E31364');
css = css.replace(/#112419/gi, '#24151D');
css = css.replace(/#3D5A47/gi, '#6A5560');

const originalRestoredPalette = `
/* ===================================================
   🌸 RESTORED ORIGINAL ROYAL VIBRANT PALETTE (NO GREEN)
   =================================================== */
:root {
  --g-cream: #FAF5EB;
  --g-pink: #E31364;
  --g-marigold: #F4A218;
  --g-plum: #5B1B3A;
  --g-ink: #24151D;
  --g-gold: #C29B4E;
  --g-gold-lite: #E3C880;

  --w-navy: #5B1B3A;
  --w-bg: #FAF5EB;
  --w-surface: #FFFDF8;
  --w-ink: #24151D;
  --w-ink-soft: #6A5560;
  --w-accent: #E31364;
  --w-gold: #C29B4E;
  --w-gold-lite: #E3C880;
  --w-line: rgba(194, 155, 78, 0.35);
  --w-hero-ink: #FFFFFF;
  --w-hero-bg: linear-gradient(135deg, #E31364 0%, #AD1457 50%, #5B1B3A 100%);
}

body {
  background: var(--g-cream, #FAF5EB) !important;
  color: var(--g-ink, #24151D) !important;
}

/* Original Header Box with Pure White Names */
.gul > section:first-of-type > div:first-of-type,
section#top > div,
.bg-\\[color\\:var\\(--g-pink\\)\\] {
  background: linear-gradient(135deg, #E31364 0%, #C2185B 50%, #5B1B3A 100%) !important;
  color: #FFFFFF !important;
}

/* Floating Audio Button */
.rjm-music-btn {
  background: linear-gradient(135deg, #E31364, #5B1B3A) !important;
  border-color: #F4A218 !important;
  color: #FAF5EB !important;
  box-shadow: 0 8px 24px -4px rgba(91, 27, 58, 0.6), 0 0 16px -2px rgba(227, 19, 100, 0.4) !important;
}
`;

css = originalRestoredPalette + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully removed Green color and restored original vibrant palette with pure white Dhruv & Shreya!');
