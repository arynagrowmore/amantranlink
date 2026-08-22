const fs = require('fs');

const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const customPrepend = `
/* ===================================================
   GOOGLE FONTS & CORE CSS TOKENS
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

  --jhr-ivory: #fdf6ec;
  --jhr-ivory-2: #f8ecdb;
  --jhr-blush: #f8dbe0;
  --jhr-blush-2: #f3c7d0;
  --jhr-champagne: #f3e2c8;
  --jhr-rose: #df93a6;
  --jhr-rose-deep: #c56f88;
  --jhr-saffron: #e2a24a;
  --jhr-gold: #c9a24a;
  --jhr-gold-lite: #e8cd7e;
  --jhr-gold-deep: #a67c2e;
  --jhr-maroon: #7a1f38;
  --jhr-maroon-2: #5e1329;
  --jhr-maroon-3: #3f0c1e;
  --jhr-ink: #4a2230;
  --jhr-ink-soft: #8a5a68;
  --jhr-leaf: #8fa87a;
  --jhr-skin: #e9c3ad;
  --jhr-hair: #3c2230;
  --jhr-palace: #c98aa0;
  --jhr-palace-far: #d9a9ba;
  --jhr-lantern-glass: rgba(232, 205, 126, 0.22);
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
  background: var(--jhr-ivory, #fdf6ec);
  color: var(--jhr-ink, #4a2230);
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
html[data-lang="hi"] .jhr-title,
html[data-lang="hi"] .jhr-names,
html[data-lang="hi"] .jhr-hero-names {
  font-family: var(--w-deva) !important;
}

/* Jharokha Base Classes */
.jhr {
  background: var(--jhr-ivory, #fdf6ec);
  color: var(--jhr-ink, #4a2230);
  font-family: var(--font-cormorant), Georgia, serif;
  line-height: 1.6;
  overflow-x: clip;
}

.jhr-serif {
  font-family: var(--font-playfair), Georgia, serif;
}

.jhr-names, .jhr-script {
  font-family: var(--font-great-vibes), cursive;
}

.jhr-sans {
  font-family: var(--font-raleway), sans-serif;
}

/* Reveal Entrance Animations */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
}

@keyframes jhr-fade {
  0% { opacity: 0; transform: translateY(22px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes jhr-sway {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(1.5deg); }
}

@keyframes jhr-bell {
  0%, 100% { transform: rotate(-4.5deg); }
  50% { transform: rotate(4.5deg); }
}

@keyframes jhr-lantern {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes jhr-flame {
  0%, 100% { opacity: 0.88; transform: scale(1); }
  50% { opacity: 1; transform: scaleY(1.18) scaleX(0.92); }
}

@keyframes jhr-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.7; }
}

@keyframes jhr-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes jhr-birds {
  0% { opacity: 0; transform: translate(0, 0); }
  25% { opacity: 0.9; }
  75% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(140px, -45px); }
}

@keyframes jhr-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.jhr-sway {
  animation: jhr-sway 4s ease-in-out infinite alternate;
  transform-origin: top center;
}

.jhr-sway-alt {
  animation: jhr-sway 4.6s ease-in-out infinite alternate-reverse;
  transform-origin: top center;
}

.jhr-bell {
  animation: jhr-bell 3.2s ease-in-out infinite alternate;
  transform-origin: top center;
}

.jhr-lantern {
  animation: jhr-lantern 3.8s ease-in-out infinite alternate;
  transform-origin: top center;
}

.jhr-flame {
  animation: jhr-flame 1.4s ease-in-out infinite alternate;
  transform-origin: bottom center;
}

.jhr-glow {
  animation: jhr-glow 2.8s ease-in-out infinite alternate;
}

.jhr-twinkle {
  animation: jhr-twinkle 2.2s ease-in-out infinite alternate;
}

.jhr-birds {
  animation: jhr-birds 14s linear infinite;
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
  background: linear-gradient(135deg, #25160A, #3E2612);
  border: 1.5px solid #C08F3F;
  box-shadow: 0 8px 24px -4px rgba(62, 38, 18, 0.6), 0 0 16px -2px rgba(231, 205, 142, 0.4);
  color: #E7CD8E;
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
  animation: jhr-spin 5s linear infinite;
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
  background: #7A1F38;
  border: 1px solid #C9A24A;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #E8CD7E;
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

const fullCss = customPrepend + '\n\n' + css0 + '\n\n' + css1;
fs.writeFileSync('style.css', fullCss);
console.log('Successfully written pristine style.css for Jharokha!');
