const fs = require('fs');

const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const jodiStylePrepend = `
/* ===================================================
   THE JODI — ROYAL SHUBH VIVAH PALETTE & STYLING
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

  --jdi-paper: #FEFAEF;
  --jdi-champ: #FBF2DF;
  --jdi-champ-2: #F2E3C6;
  --jdi-champ-3: #FDF7EA;
  --jdi-cream: #FDF8EE;
  --jdi-ivory: #F9F1E1;
  --jdi-ivory-2: #F3E8D2;
  --jdi-mandala: #C29B4E;
  --jdi-mandala-2: #9A7526;
  --jdi-maroon: #7A1B22;
  --jdi-maroon-2: #5A1218;
  --jdi-maroon-3: #3D0C11;
  --jdi-gold: #C29B4E;
  --jdi-gold-lite: #E3C880;
  --jdi-gold-deep: #9A7526;
  --jdi-sage: #7C8F79;
  --jdi-sage-deep: #556952;
  --jdi-haveli: #E7C89F;
  --jdi-haveli-2: #D7B486;
  --jdi-haveli-3: #C29C6A;
  --jdi-elephant: #827A73;
  --jdi-elephant-2: #615A54;
  --jdi-bloom: #D26466;
  --jdi-bloom-2: #B84547;
  --jdi-ink: #3D2521;
  --jdi-ink-soft: #6E554F;
  --jdi-lehenga: #C22B38;
  --jdi-lehenga-2: #9E1D28;
  --jdi-sherwani: #F5E6CC;
  --jdi-sherwani-2: #E3CEAA;
  --jdi-dupatta: #D26466;
  --jdi-hair: #2B1A17;
  --jdi-skin: #E8C5A8;
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
  background: var(--jdi-paper, #FEFAEF);
  color: var(--jdi-ink, #3D2521);
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
html[data-lang="hi"] .jdi-title,
html[data-lang="hi"] .jdi-names,
html[data-lang="hi"] .jdi-hero-names {
  font-family: var(--w-deva) !important;
}

/* Base Classes */
.jdi {
  background: var(--jdi-paper, #FEFAEF);
  color: var(--jdi-ink, #3D2521);
  font-family: var(--font-cormorant), Georgia, serif;
  line-height: 1.6;
  overflow-x: clip;
}

.jdi-serif {
  font-family: var(--font-playfair), Georgia, serif;
}

.jdi-names, .jdi-script {
  font-family: var(--font-great-vibes), cursive;
}

.jdi-sans {
  font-family: var(--font-raleway), sans-serif;
}

/* Couple Typography Gradient */
.jdi-hero-names, .jdi-names {
  background: linear-gradient(135deg, #7A1B22 0%, #C29B4E 40%, #E3C880 60%, #7A1B22 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(194, 155, 78, 0.35));
}

/* Animations */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
}

@keyframes jdi-drift {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 0.85; }
  80% { opacity: 0.85; }
  100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
}

@keyframes jdi-turn {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes jdi-fade {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.jdi-drift {
  animation: jdi-drift 14s linear infinite;
  pointer-events: none;
}

.jdi-turn {
  animation: jdi-turn 25s linear infinite;
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
  background: linear-gradient(135deg, #7A1B22, #3D0C11);
  border: 1.5px solid #E3C880;
  box-shadow: 0 8px 24px -4px rgba(122, 27, 34, 0.6), 0 0 16px -2px rgba(194, 155, 78, 0.4);
  color: #E3C880;
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
  animation: jdi-turn 5s linear infinite;
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
  background: #7A1B22;
  border: 1px solid #C29B4E;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #E3C880;
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

const fullCss = jodiStylePrepend + '\n\n' + css0 + '\n\n' + css1;
fs.writeFileSync('style.css', fullCss);
console.log('Successfully written style.css for Jodi theme!');
