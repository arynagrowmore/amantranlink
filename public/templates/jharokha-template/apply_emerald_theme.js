const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Update CSS Variables to Imperial Emerald & Antique Gold as the default royal theme
const emeraldThemeTokens = `
/* ===================================================
   IMPERIAL EMERALD & ANTIQUE GOLD ROYAL THEME
   =================================================== */
:root {
  --jhr-emerald-deep: #0B2317;
  --jhr-emerald: #143D28;
  --jhr-emerald-lite: #1E5638;
  --jhr-gold: #D4AF37;
  --jhr-gold-lite: #F4E29C;
  --jhr-gold-deep: #997A15;
  --jhr-ivory: #FAF6ED;
  --jhr-ivory-2: #F3EBD8;
  --jhr-pearl: #FFFDF9;
  --jhr-ink: #14281D;
  --jhr-ink-soft: #4A6354;
  --jhr-maroon: #143D28;
  --jhr-maroon-2: #0B2317;
  --jhr-maroon-3: #06150D;
  --jhr-blush: #E2ECE5;
  --jhr-blush-2: #C8DCD0;
  --jhr-rose: #D4AF37;
  --jhr-rose-deep: #997A15;
  --jhr-saffron: #D4AF37;
  --jhr-palace: #225C3C;
  --jhr-palace-far: #3A7854;
  --jhr-lantern-glass: rgba(244, 226, 156, 0.35);

  --w-navy: #143D28;
  --w-bg: #FAF6ED;
  --w-surface: #FFFDF9;
  --w-ink: #14281D;
  --w-ink-soft: #4A6354;
  --w-accent: #D4AF37;
  --w-gold: #D4AF37;
  --w-gold-lite: #F4E29C;
  --w-line: rgba(212, 175, 55, 0.35);
  --w-hero-ink: #FAF6ED;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(212, 175, 55, 0.45), transparent 60%), linear-gradient(180deg, #143D28 0%, #06150D 100%);
}

/* Midnight Sapphire Theme Preset */
html[data-theme="sapphire"] {
  --jhr-emerald-deep: #081226;
  --jhr-emerald: #0F2347;
  --jhr-emerald-lite: #1A396E;
  --jhr-gold: #D4AF37;
  --jhr-gold-lite: #F4E29C;
  --jhr-gold-deep: #A67C1E;
  --jhr-ivory: #F4F7FB;
  --jhr-ivory-2: #E5ECF6;
  --jhr-pearl: #FFFFFF;
  --jhr-ink: #0F1C33;
  --jhr-ink-soft: #465B7E;
  --jhr-maroon: #0F2347;
  --jhr-maroon-2: #081226;
  --jhr-maroon-3: #040914;
  --jhr-palace: #1A396E;
  --jhr-palace-far: #2C5396;
}

/* Royal Velvet Wine Theme Preset */
html[data-theme="wine"] {
  --jhr-emerald-deep: #2A0812;
  --jhr-emerald: #4A1020;
  --jhr-emerald-lite: #6E1A32;
  --jhr-gold: #D4AF37;
  --jhr-gold-lite: #F4E29C;
  --jhr-gold-deep: #A67C1E;
  --jhr-ivory: #FAF4F6;
  --jhr-ivory-2: #F2E4E8;
  --jhr-pearl: #FFFDFE;
  --jhr-ink: #330F1A;
  --jhr-ink-soft: #7E4656;
  --jhr-maroon: #4A1020;
  --jhr-maroon-2: #2A0812;
  --jhr-maroon-3: #140408;
  --jhr-palace: #6E1A32;
  --jhr-palace-far: #962C4B;
}

/* Base Body Styles with Emerald Theme */
body {
  background: var(--jhr-ivory) !important;
  color: var(--jhr-ink) !important;
}

.jhr {
  background: var(--jhr-ivory) !important;
  color: var(--jhr-ink) !important;
}

.jhr-hero-names, .jhr-names {
  background: linear-gradient(135deg, #143D28 0%, #997A15 40%, #D4AF37 55%, #143D28 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0 2px 8px rgba(212, 175, 55, 0.35)) !important;
}

/* Floating Theme Switcher Badge */
.rjm-theme-switcher {
  position: fixed;
  bottom: 5.6rem;
  right: 1.8rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: rgba(11, 35, 23, 0.9);
  border: 1.5px solid #D4AF37;
  padding: 0.4rem;
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
}

.theme-dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1.5px solid #FFF;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.theme-dot:hover {
  transform: scale(1.2);
}

.theme-dot.emerald { background: linear-gradient(135deg, #143D28, #D4AF37); }
.theme-dot.sapphire { background: linear-gradient(135deg, #0F2347, #D4AF37); }
.theme-dot.wine { background: linear-gradient(135deg, #4A1020, #D4AF37); }
`;

css = emeraldThemeTokens + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully updated style.css with Imperial Emerald Theme & Presets!');
