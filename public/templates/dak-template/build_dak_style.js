const fs = require('fs');

const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const dakStylePrepend = `
/* ===================================================
   THE DÂK — VINTAGE ROYAL INDIAN POSTAL PALETTE & STYLING
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
  --font-space-grotesk: 'Space Grotesk', monospace;
  --font-fredoka: 'Fredoka', cursive;
  --font-nunito: 'Nunito', sans-serif;
  --font-dm-serif: 'DM Serif Display', Georgia, serif;

  --w-serif: var(--font-cormorant), Georgia, 'Times New Roman', serif;
  --w-display: var(--font-playfair), Georgia, 'Times New Roman', serif;
  --w-sans: var(--font-raleway), 'Segoe UI', system-ui, sans-serif;
  --w-mono: var(--font-space-grotesk), monospace;
  --w-deva: var(--font-noto-deva), var(--font-raleway), system-ui, serif;

  --dak-ink: #182233;
  --dak-ink-2: #25324A;
  --dak-ink-3: #0D131E;
  --dak-paper: #F5EDDC;
  --dak-paper-2: #ECE1C9;
  --dak-surface: #FBF6EA;
  --dak-gold: #B4894A;
  --dak-gold-lite: #E3C88A;
  --dak-gold-deep: #8A6526;
  --dak-red: #A8332B;
  --dak-red-deep: #7C231D;
  --dak-text: #23293A;
  --dak-text-soft: #6C7385;

  --w-navy: #182233;
  --w-bg: #F5EDDC;
  --w-surface: #FBF6EA;
  --w-ink: #182233;
  --w-ink-soft: #6C7385;
  --w-accent: #A8332B;
  --w-gold: #B4894A;
  --w-gold-lite: #E3C88A;
  --w-line: rgba(180, 137, 74, 0.35);
  --w-hero-ink: #182233;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(180, 137, 74, 0.3), transparent 60%), linear-gradient(180deg, #F5EDDC 0%, #ECE1C9 100%);
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
  background: var(--dak-paper, #F5EDDC);
  color: var(--dak-ink, #182233);
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
html[data-lang="hi"] .dak-title,
html[data-lang="hi"] .dak-names,
html[data-lang="hi"] .dak-hero-names {
  font-family: var(--w-deva) !important;
}

/* Base Classes */
.dak {
  background: var(--dak-paper, #F5EDDC);
  color: var(--dak-ink, #182233);
  font-family: var(--font-cormorant), Georgia, serif;
  line-height: 1.6;
  overflow-x: clip;
}

.dak-serif {
  font-family: var(--font-playfair), Georgia, serif;
}

.dak-names, .dak-script {
  font-family: var(--font-great-vibes), cursive;
}

.dak-sans {
  font-family: var(--font-raleway), sans-serif;
}

.dak-mono {
  font-family: var(--font-space-grotesk), monospace;
}

/* Couple Typography Gradient */
.dak-hero-names, .dak-names {
  background: linear-gradient(135deg, #182233 0%, #8A6526 40%, #B4894A 60%, #182233 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(180, 137, 74, 0.35));
}

/* Animations */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
}

@keyframes dak-arrive {
  0% { transform: translateY(40px) scale(0.92); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes dak-strike {
  0% { transform: scale(1.6) rotate(-18deg); opacity: 0; }
  70% { transform: scale(0.96) rotate(-8deg); opacity: 1; }
  100% { transform: scale(1) rotate(-10deg); opacity: 1; }
}

@keyframes dak-press {
  0% { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes dak-turn {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dak-fly {
  0% { transform: translate3d(-30px, 10px, 0) rotate(-4deg); }
  50% { transform: translate3d(30px, -15px, 0) rotate(4deg); }
  100% { transform: translate3d(-30px, 10px, 0) rotate(-4deg); }
}

.dak-strike {
  animation: dak-strike 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.dak-arrive {
  animation: dak-arrive 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dak-fly {
  animation: dak-fly 8s ease-in-out infinite;
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
  background: linear-gradient(135deg, #182233, #0D131E);
  border: 1.5px solid #E3C88A;
  box-shadow: 0 8px 24px -4px rgba(13, 19, 30, 0.6), 0 0 16px -2px rgba(180, 137, 74, 0.4);
  color: #E3C88A;
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
  animation: dak-turn 5s linear infinite;
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
  background: #A8332B;
  border: 1px solid #B4894A;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #E3C88A;
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

const fullCss = dakStylePrepend + '\n\n' + css0 + '\n\n' + css1;
fs.writeFileSync('style.css', fullCss);
console.log('Successfully written style.css for Dâk theme!');
