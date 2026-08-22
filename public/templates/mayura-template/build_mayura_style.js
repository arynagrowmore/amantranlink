const fs = require('fs');

const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const mayuraStylePrepend = `
/* ===================================================
   THE MAYURA — ROYAL PEACOCK PALETTE & STYLING
   =================================================== */
:root {
  --font-poppins: 'Poppins', sans-serif;
  --font-raleway: 'Raleway', sans-serif;
  --font-cormorant: 'Cormorant Garamond', Georgia, serif;
  --font-marcellus: 'Marcellus', serif;
  --font-noto-deva: 'Noto Sans Devanagari', sans-serif;
  --font-tiro-deva: 'Tiro Devanagari Hindi', serif;
  --font-playfair: 'Playfair Display', Georgia, serif;
  --font-great-vibes: 'Great Vibes', cursive;
  --font-space-grotesk: 'Space Grotesk', sans-serif;
  --font-fredoka: 'Fredoka', cursive;
  --font-nunito: 'Nunito', sans-serif;
  --font-dm-serif: 'DM Serif Display', Georgia, serif;

  --w-serif: var(--font-cormorant), Georgia, 'Times New Roman', serif;
  --w-display: var(--font-playfair), Georgia, 'Times New Roman', serif;
  --w-sans: var(--font-raleway), 'Segoe UI', system-ui, sans-serif;
  --w-deva: var(--font-noto-deva), var(--font-raleway), system-ui, serif;

  --myr-ivory: #fdf4e3;
  --myr-ivory-2: #f7ead0;
  --myr-champagne: #f4e6c6;
  --myr-teal: #0e6e6e;
  --myr-teal-2: #0a4a4a;
  --myr-teal-3: #063231;
  --myr-blue: #12668f;
  --myr-leaf: #4f9d5d;
  --myr-pink: #d81b60;
  --myr-pink-deep: #a01048;
  --myr-saffron: #ef9a1e;
  --myr-marigold: #f4b400;
  --myr-gold: #c9a23f;
  --myr-gold-lite: #ecd07a;
  --myr-gold-deep: #a07a22;
  --myr-ink: #2d3e38;
  --myr-ink-soft: #5b736b;
  --myr-palace: #0e6e6e;
  --myr-palace-far: #12668f;
  --myr-lantern-glass: rgba(236, 208, 122, 0.28);

  --w-navy: #0e6e6e;
  --w-bg: #fdf4e3;
  --w-surface: #fffdf8;
  --w-ink: #2d3e38;
  --w-ink-soft: #5b736b;
  --w-accent: #d81b60;
  --w-gold: #c9a23f;
  --w-gold-lite: #ecd07a;
  --w-line: rgba(201, 162, 63, 0.35);
  --w-hero-ink: #fdf4e3;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(201, 162, 63, 0.4), transparent 60%), linear-gradient(180deg, #0e6e6e 0%, #063231 100%);
}

*, ::before, ::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  font-family: var(--font-cormorant), Georgia, serif;
  background: var(--myr-ivory, #fdf4e3);
  color: var(--myr-ink, #2d3e38);
  -webkit-font-smoothing: antialiased;
}

/* Language Visibility */
html[data-lang="en"] .l-hi {
  display: none !important;
}

html[data-lang="hi"] .l-en {
  display: none !important;
}

html[data-lang="hi"] h1,
html[data-lang="hi"] h2,
html[data-lang="hi"] h3,
html[data-lang="hi"] .myr-title,
html[data-lang="hi"] .myr-names,
html[data-lang="hi"] .myr-hero-names {
  font-family: var(--w-deva) !important;
}

/* Mayura Base Classes */
.myr {
  background: var(--myr-ivory, #fdf4e3);
  color: var(--myr-ink, #2d3e38);
  font-family: var(--font-cormorant), Georgia, serif;
  line-height: 1.6;
  overflow-x: clip;
}

.myr-serif {
  font-family: var(--font-playfair), Georgia, serif;
}

.myr-names, .myr-script {
  font-family: var(--font-great-vibes), cursive;
}

.myr-sans {
  font-family: var(--font-raleway), sans-serif;
}

/* Couple Typography Gradient */
.myr-hero-names, .myr-names {
  background: linear-gradient(135deg, #0e6e6e 0%, #a07a22 35%, #ecd07a 55%, #d81b60 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(201, 162, 63, 0.3));
}

/* Animations */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
}

@keyframes myr-plume {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.92; }
  50% { transform: scale(1.05) rotate(1deg); opacity: 1; }
}

@keyframes myr-feather {
  0% { opacity: 0; transform: translateY(-8vh) rotate(0deg); }
  15% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { opacity: 0; transform: translateY(105vh) rotate(260deg); }
}

@keyframes myr-sway {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(1.5deg); }
}

@keyframes myr-bud {
  0%, 100% { transform: scale(0.96); }
  50% { transform: scale(1.04); }
}

@keyframes myr-lantern {
  0%, 100% { transform: rotate(-2.8deg); }
  50% { transform: rotate(2.8deg); }
}

@keyframes myr-flame {
  0%, 100% { opacity: 0.88; transform: scale(1); }
  50% { opacity: 1; transform: scaleY(1.18) scaleX(0.92); }
}

@keyframes myr-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.7; }
}

@keyframes myr-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes myr-birds {
  0% { opacity: 0; transform: translate(0, 0); }
  25% { opacity: 0.9; }
  75% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(140px, -45px); }
}

@keyframes myr-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.myr-plume {
  animation: myr-plume 5s ease-in-out infinite alternate;
  transform-origin: center bottom;
}

.myr-feather {
  animation: myr-feather 14s linear infinite;
  pointer-events: none;
}

.myr-sway {
  animation: myr-sway 4s ease-in-out infinite alternate;
  transform-origin: top center;
}

.myr-bud {
  animation: myr-bud 3.6s ease-in-out infinite alternate;
}

.myr-lantern {
  animation: myr-lantern 3.8s ease-in-out infinite alternate;
  transform-origin: top center;
}

.myr-flame {
  animation: myr-flame 1.4s ease-in-out infinite alternate;
  transform-origin: bottom center;
}

.myr-glow {
  animation: myr-glow 2.8s ease-in-out infinite alternate;
}

.myr-twinkle {
  animation: myr-twinkle 2.2s ease-in-out infinite alternate;
}

.myr-birds {
  animation: myr-birds 14s linear infinite;
}

/* Floating Audio Disc */
.rjm-audio-widget {
  position: fixed;
  bottom: 1.8rem;
  right: 1.8rem;
  z-index: 999;
}

.rjm-music-btn {
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #0e6e6e, #063231);
  border: 1.5px solid #ecd07a;
  box-shadow: 0 8px 24px -4px rgba(6, 50, 49, 0.6), 0 0 16px -2px rgba(201, 162, 63, 0.4);
  color: #ecd07a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.35s ease;
  outline: none;
}

.rjm-music-btn:hover {
  transform: scale(1.08);
}

.rjm-music-disc {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.rjm-music-btn.is-playing .rjm-music-disc {
  animation: myr-spin 5s linear infinite;
}

.rjm-music-icon {
  width: 1.4rem;
  height: 1.4rem;
}

.rjm-sound-waves {
  position: absolute;
  top: -0.4rem;
  right: -0.2rem;
  display: flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 14px;
  background: #d81b60;
  border: 1px solid #ecd07a;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #ecd07a;
  border-radius: 1px;
  height: 4px;
}

.rjm-music-btn.is-playing .wave-bar.bar-1 { animation: rjm-wave-1 0.7s ease-in-out infinite alternate; }
.rjm-music-btn.is-playing .wave-bar.bar-2 { animation: rjm-wave-2 0.5s ease-in-out infinite alternate; }
.rjm-music-btn.is-playing .wave-bar.bar-3 { animation: rjm-wave-3 0.8s ease-in-out infinite alternate; }

@keyframes rjm-wave-1 { 0% { height: 3px; } 100% { height: 10px; } }
@keyframes rjm-wave-2 { 0% { height: 8px; } 100% { height: 3px; } }
@keyframes rjm-wave-3 { 0% { height: 4px; } 100% { height: 11px; } }
`;

const fullCss = mayuraStylePrepend + '\n\n' + css0 + '\n\n' + css1;
fs.writeFileSync('style.css', fullCss);
console.log('Successfully written style.css for Mayura theme!');
