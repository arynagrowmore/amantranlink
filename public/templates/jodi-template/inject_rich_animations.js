const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const richAnimationsCss = `
/* ===================================================
   🌟 COMPLETE SECTION-BY-SECTION ROYAL ANIMATIONS
   =================================================== */

/* 1. Hero Shimmer & Floating Plate */
.jdi-hero-names, .jdi-names {
  background: linear-gradient(135deg, #7A1B22 0%, #C29B4E 25%, #E3C880 50%, #C29B4E 75%, #7A1B22 100%) !important;
  background-size: 200% auto !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  animation: jdi-text-sheen 6s linear infinite !important;
  filter: drop-shadow(0 2px 10px rgba(194, 155, 78, 0.4)) !important;
}

@keyframes jdi-text-sheen {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 2. Rotating Gold Shubh Plate */
.jdi-turn, img[src*="plate"] {
  animation: jdi-turn 35s linear infinite !important;
  filter: drop-shadow(0 10px 30px rgba(194, 155, 78, 0.45));
}

/* 3. Floating Flower Blossoms Rain */
@keyframes jdi-drift-smooth {
  0% {
    opacity: 0;
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  15% {
    opacity: 0.9;
  }
  50% {
    transform: translate3d(30px, 50vh, 0) rotate(180deg);
  }
  85% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate3d(-20px, 105vh, 0) rotate(360deg);
  }
}

.jdi-drift {
  animation: jdi-drift-smooth 15s linear infinite !important;
  pointer-events: none;
  will-change: transform, opacity;
}

/* 4. Story Timeline Cards Hover & Glow */
.jdi-card, .jdi-event, .myr-card {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease !important;
  will-change: transform;
}

.jdi-card:hover, .jdi-event:hover {
  transform: translateY(-6px) scale(1.015) !important;
  box-shadow: 0 16px 36px -8px rgba(122, 27, 34, 0.2), 0 0 20px rgba(227, 200, 128, 0.4) !important;
  border-color: var(--jdi-gold, #C29B4E) !important;
}

/* 5. Countdown Golden Boxes Pulse */
.jdi-count, .rjm-count {
  position: relative;
  overflow: hidden;
}

.jdi-count::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(60deg, transparent, rgba(227, 200, 128, 0.25), transparent);
  transform: rotate(30deg);
  animation: jdi-sheen-sweep 5s infinite;
  pointer-events: none;
}

@keyframes jdi-sheen-sweep {
  0% { transform: translateY(-100%) rotate(30deg); }
  30%, 100% { transform: translateY(100%) rotate(30deg); }
}

/* 6. Moments Gallery Hover Zoom */
.jdi-frame img {
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: transform;
}

.jdi-frame:hover img {
  transform: scale(1.08) !important;
}

/* 7. Timeline Center Glowing Line */
.jdi-timeline-fill {
  background: linear-gradient(180deg, var(--jdi-gold-lite) 0%, var(--jdi-gold) 50%, var(--jdi-maroon) 100%) !important;
  box-shadow: 0 0 16px rgba(194, 155, 78, 0.8), 0 0 30px rgba(122, 27, 34, 0.5) !important;
}
`;

css = richAnimationsCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully injected rich section-by-section CSS animations into style.css!');
