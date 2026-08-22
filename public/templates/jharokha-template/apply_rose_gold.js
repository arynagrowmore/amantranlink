const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const roseGoldPastelPalette = `
/* ===================================================
   🌸 OPTION 1: PASTEL ROSE GOLD & SOFT BLUSH LUXURY PALETTE
   =================================================== */
:root {
  /* Pastel Rose Gold & Blush Luxury Tokens */
  --jhr-blush: #fdf2f4;
  --jhr-blush-2: #f8dbe0;
  --jhr-blush-3: #f3c7d0;
  --jhr-rose: #df93a6;
  --jhr-rose-deep: #b75d74;
  --jhr-rose-gold: #c56f88;
  --jhr-champagne: #f7ede2;
  --jhr-gold: #d4af37;
  --jhr-gold-lite: #ebd79b;
  --jhr-gold-deep: #a67c2e;
  --jhr-ivory: #fffbf9;
  --jhr-ivory-2: #fcf4f0;
  --jhr-pearl: #ffffff;
  --jhr-ink: #4a2230;
  --jhr-ink-soft: #8a5a68;
  --jhr-maroon: #7a1f38;
  --jhr-maroon-2: #5e1329;
  --jhr-maroon-3: #3f0c1e;
  --jhr-leaf: #98b088;
  --jhr-palace: #e8b4c2;
  --jhr-palace-far: #f2cbd6;
  --jhr-lantern-glass: rgba(223, 147, 166, 0.35);

  --w-navy: #7a1f38;
  --w-bg: #fffbf9;
  --w-surface: #ffffff;
  --w-ink: #4a2230;
  --w-ink-soft: #8a5a68;
  --w-accent: #c56f88;
  --w-gold: #d4af37;
  --w-gold-lite: #ebd79b;
  --w-line: rgba(197, 111, 136, 0.35);
  --w-hero-ink: #4a2230;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(223, 147, 166, 0.35), transparent 60%), linear-gradient(180deg, #fffbf9 0%, #f8dbe0 100%);
}

body {
  background: var(--jhr-ivory) !important;
  color: var(--jhr-ink) !important;
}

.jhr {
  background: var(--jhr-ivory) !important;
  color: var(--jhr-ink) !important;
}

/* Couple Names Rose Gold Shimmer */
.jhr-hero-names, .jhr-names {
  background: linear-gradient(135deg, #7a1f38 0%, #c56f88 35%, #d4af37 60%, #b75d74 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0 2px 10px rgba(197, 111, 136, 0.3)) !important;
}

/* Rose Gold Borders and Cards */
.jhr-card, .jhr-event, .rjm-card {
  background: #ffffff !important;
  border-color: rgba(197, 111, 136, 0.35) !important;
  box-shadow: 0 8px 24px -4px rgba(197, 111, 136, 0.12) !important;
}

/* Rose Gold Floating Music Button */
.rjm-music-btn {
  background: linear-gradient(135deg, #7a1f38, #b75d74) !important;
  border-color: #ebd79b !important;
  color: #fffbf9 !important;
  box-shadow: 0 8px 24px -4px rgba(122, 31, 56, 0.5), 0 0 16px -2px rgba(223, 147, 166, 0.4) !important;
}
`;

// Prepend the new palette to style.css
css = roseGoldPastelPalette + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully applied Pastel Rose Gold & Soft Blush palette to style.css!');
