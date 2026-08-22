const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const smoothAnimationCss = `
/* ===================================================
   ULTRA-SMOOTH 60FPS HARDWARE ACCELERATED ANIMATIONS
   =================================================== */

html {
  scroll-behavior: smooth;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

*, ::before, ::after {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Peacock Plume Gentle Breath */
@keyframes myr-plume {
  0% {
    transform: scale(1) rotate(-0.5deg) translateZ(0);
    opacity: 0.92;
  }
  50% {
    transform: scale(1.04) rotate(0.8deg) translateZ(0);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(-0.5deg) translateZ(0);
    opacity: 0.92;
  }
}

/* Floating Feathers Gentle Drift */
@keyframes myr-feather-smooth-1 {
  0% {
    opacity: 0;
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  15% {
    opacity: 0.9;
  }
  50% {
    transform: translate3d(25px, 45vh, 0) rotate(130deg);
  }
  85% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate3d(-15px, 105vh, 0) rotate(260deg);
  }
}

@keyframes myr-feather-smooth-2 {
  0% {
    opacity: 0;
    transform: translate3d(0, -10vh, 0) rotate(20deg);
  }
  20% {
    opacity: 0.85;
  }
  50% {
    transform: translate3d(-30px, 50vh, 0) rotate(-90deg);
  }
  80% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
    transform: translate3d(20px, 105vh, 0) rotate(180deg);
  }
}

.myr-plume {
  animation: myr-plume 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  transform-origin: center bottom;
  will-change: transform, opacity;
}

.myr-feather {
  animation: myr-feather-smooth-1 16s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  will-change: transform, opacity;
  pointer-events: none;
}

.myr-feather:nth-child(2) {
  animation: myr-feather-smooth-2 19s cubic-bezier(0.25, 0.1, 0.25, 1) 3s infinite;
}

.myr-feather:nth-child(3) {
  animation: myr-feather-smooth-1 14s cubic-bezier(0.25, 0.1, 0.25, 1) 7s infinite;
}

/* Swaying Toran Garlands */
@keyframes myr-sway-smooth {
  0%, 100% {
    transform: rotate3d(0, 0, 1, -1.8deg) translateZ(0);
  }
  50% {
    transform: rotate3d(0, 0, 1, 1.8deg) translateZ(0);
  }
}

.myr-sway {
  animation: myr-sway-smooth 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  transform-origin: top center;
  will-change: transform;
}

.myr-sway-alt {
  animation: myr-sway-smooth 5.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate-reverse;
  transform-origin: top center;
  will-change: transform;
}

/* Swaying Lanterns */
@keyframes myr-lantern-smooth {
  0%, 100% {
    transform: rotate3d(0, 0, 1, -2.5deg) translateZ(0);
  }
  50% {
    transform: rotate3d(0, 0, 1, 2.5deg) translateZ(0);
  }
}

.myr-lantern {
  animation: myr-lantern-smooth 4.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  transform-origin: top center;
  will-change: transform;
}

/* Flickering Flame */
@keyframes myr-flame-smooth {
  0%, 100% {
    opacity: 0.85;
    transform: scale3d(1, 1, 1);
  }
  50% {
    opacity: 1;
    transform: scale3d(0.94, 1.15, 1);
  }
}

.myr-flame {
  animation: myr-flame-smooth 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  transform-origin: bottom center;
  will-change: transform, opacity;
}

/* Lotus Bud Pulse */
@keyframes myr-bud-smooth {
  0%, 100% {
    transform: scale3d(0.97, 0.97, 1);
  }
  50% {
    transform: scale3d(1.03, 1.03, 1);
  }
}

.myr-bud {
  animation: myr-bud-smooth 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
  will-change: transform;
}

/* Doves / Birds flying across sky */
@keyframes myr-birds-smooth {
  0% {
    opacity: 0;
    transform: translate3d(-30px, 15px, 0) scale(0.9);
  }
  20% {
    opacity: 0.95;
  }
  80% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
    transform: translate3d(160px, -50px, 0) scale(1.05);
  }
}

.myr-birds {
  animation: myr-birds-smooth 16s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  will-change: transform, opacity;
}

/* Smooth Entrance Reveals */
[data-tw-reveal="true"], [data-tw-reveal] {
  opacity: 1;
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
`;

css = smoothAnimationCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Successfully injected ultra-smooth animations into style.css!');
