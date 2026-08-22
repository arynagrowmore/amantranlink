const fs = require('fs');

const css1 = fs.readFileSync('css/style_0.css', 'utf8');
const css2 = fs.readFileSync('css/style_1.css', 'utf8');

const customGlobalVars = `
:root {
  --font-poppins: 'Poppins', sans-serif;
  --font-raleway: 'Raleway', sans-serif;
  --font-cormorant: 'Cormorant Garamond', Georgia, serif;
  --font-marcellus: 'Marcellus', serif;
  --font-noto-deva: 'Noto Sans Devanagari', sans-serif;
  --font-tiro-deva: 'Tiro Devanagari Hindi', serif;
  --font-playfair: 'Playfair Display', Georgia, serif;
  --font-great-vibes: 'Great Vibes', cursive;
  --font-dm-serif: 'DM Serif Display', Georgia, serif;

  --w-serif: var(--font-cormorant), Georgia, 'Times New Roman', serif;
  --w-display: var(--font-playfair), Georgia, 'Times New Roman', serif;
  --w-sans: var(--font-raleway), 'Segoe UI', system-ui, sans-serif;
  --w-deva: var(--font-noto-deva), var(--font-raleway), system-ui, serif;
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
  font-family: var(--w-sans);
  -webkit-font-smoothing: antialiased;
}

/* Language Visibility Rules */
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

/* Reveal Animations */
[data-tw-reveal="true"] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

[data-tw-reveal="true"].is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Keyframe Animations for Jharokha elements */
@keyframes jhr-fade {
  0% { opacity: 0; transform: translateY(22px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes jhr-sway {
  0%, 100% { transform: rotate(-1.4deg); }
  50% { transform: rotate(1.4deg); }
}

@keyframes jhr-bell {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}

@keyframes jhr-lantern {
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2.5deg); }
}

@keyframes jhr-flame {
  0%, 100% { opacity: 0.9; transform: scaleY(1) scaleX(1); }
  50% { opacity: 1; transform: scaleY(1.15) scaleX(0.95); }
}

@keyframes jhr-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.65; }
}

@keyframes jhr-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes jhr-birds {
  0% { opacity: 0; transform: translate(0, 0); }
  20% { opacity: 0.9; }
  80% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(120px, -40px); }
}

@keyframes jhr-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes jhr-petal {
  0% { opacity: 0; transform: translateY(-10vh) rotate(0deg); }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(105vh) rotate(360deg); }
}

/* Music Player Floating Widget */
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
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.rjm-music-btn:hover {
  transform: scale(1.08);
  border-color: #E7CD8E;
}

.rjm-music-disc {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
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
  background: #7C2230;
  border: 1px solid #C08F3F;
  border-radius: 999px;
  padding: 2px 4px;
}

.wave-bar {
  width: 2.5px;
  background: #E7CD8E;
  border-radius: 1px;
  height: 4px;
}

.rjm-music-btn.is-playing .wave-bar.bar-1 { animation: rjm-wave-1 0.7s ease-in-out infinite alternate; }
.rjm-music-btn.is-playing .wave-bar.bar-2 { animation: rjm-wave-2 0.5s ease-in-out infinite alternate; }
.rjm-music-btn.is-playing .wave-bar.bar-3 { animation: rjm-wave-3 0.8s ease-in-out infinite alternate; }

@keyframes rjm-wave-1 { 0% { height: 3px; } 100% { height: 10px; } }
@keyframes rjm-wave-2 { 0% { height: 8px; } 100% { height: 3px; } }
@keyframes rjm-wave-3 { 0% { height: 4px; } 100% { height: 11px; } }

/* Toast */
.rjm-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #25160A;
  color: #E7CD8E;
  border: 1px solid #C08F3F;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s ease;
}

.rjm-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
`;

const combinedCss = customGlobalVars + '\n\n' + css1 + '\n\n' + css2;
fs.writeFileSync('style.css', combinedCss);
console.log('Successfully generated style.css for Jharokha theme!');
