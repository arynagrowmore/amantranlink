const fs = require('fs');

const css0 = fs.readFileSync('css/style_0.css', 'utf8');
const css1 = fs.readFileSync('css/style_1.css', 'utf8');

const ivoryStylePrepend = `
/* ===================================================
   THE IVORY — ROYAL EDITORIAL & GUL LUXURY STYLING
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
  --w-hero-ink: #24151D;
  --w-hero-bg: radial-gradient(90% 70% at 50% 0%, rgba(244, 162, 24, 0.25), transparent 60%), linear-gradient(180deg, #FAF5EB 0%, #F5ECDB 100%);
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
  background: var(--g-cream, #FAF5EB);
  color: var(--g-ink, #24151D);
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
html[data-lang="hi"] .g-title,
html[data-lang="hi"] .g-names {
  font-family: var(--w-deva) !important;
}

/* Base Typography */
.g-serif {
  font-family: var(--font-playfair), Georgia, serif;
}

.g-names, .g-script {
  font-family: var(--font-great-vibes), cursive;
}

.g-sans {
  font-family: var(--font-raleway), sans-serif;
}

/* Couple Typography Gradient */
h1 {
  background: linear-gradient(135deg, #5B1B3A 0%, #E31364 40%, #F4A218 70%, #5B1B3A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(227, 19, 100, 0.25));
}

/* Animations */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
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
  background: linear-gradient(135deg, #5B1B3A, #24151D);
  border: 1.5px solid #F4A218;
  box-shadow: 0 8px 24px -4px rgba(36, 21, 29, 0.6), 0 0 16px -2px rgba(227, 19, 100, 0.4);
  color: #F4A218;
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
  animation: g-spin 5s linear infinite;
}

@keyframes g-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  background: #E31364;
  border: 1px solid #F4A218;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #FAF5EB;
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

const fullCss = ivoryStylePrepend + '\n\n' + css0 + '\n\n' + css1;
fs.writeFileSync('style.css', fullCss);
console.log('Successfully written style.css for Ivory theme!');
