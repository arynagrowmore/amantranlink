const fs = require('fs');

// 1. Add floating flower petals & sparkle elements to index.html
let html = fs.readFileSync('index.html', 'utf8');

const floatingBlossomsHtml = `
  <!-- Floating Gulal & Flower Petals Ambient Animation -->
  <div class="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
    <div class="g-petal petal-1">🌸</div>
    <div class="g-petal petal-2">🌼</div>
    <div class="g-petal petal-3">✨</div>
    <div class="g-petal petal-4">🌸</div>
    <div class="g-petal petal-5">🌼</div>
    <div class="g-petal petal-6">✨</div>
    <div class="g-petal petal-7">🌸</div>
    <div class="g-petal petal-8">🌼</div>
  </div>
`;

if (!html.includes('g-petal')) {
  html = html.replace('<body class="min-h-full flex flex-col">', `<body class="min-h-full flex flex-col">\n${floatingBlossomsHtml}`);
  fs.writeFileSync('index.html', html);
  console.log('Added floating petals to index.html!');
}

// 2. Supercharge style.css with packed animations
let css = fs.readFileSync('style.css', 'utf8');

const superchargedCss = `
/* ===================================================
   🌟 BHAR BHAR KE DYNAMIC ROYAL ANIMATIONS (THE IVORY)
   =================================================== */

/* 1. Floating Falling Petals & Gold Sparkles */
.g-petal {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0;
  will-change: transform, opacity;
  animation: g-petal-fall linear infinite;
  filter: drop-shadow(0 2px 6px rgba(227, 19, 100, 0.3));
}

.petal-1 { left: 8%; animation-duration: 12s; animation-delay: 0s; }
.petal-2 { left: 22%; animation-duration: 15s; animation-delay: 2.5s; font-size: 1.2rem; }
.petal-3 { left: 38%; animation-duration: 10s; animation-delay: 5s; font-size: 1rem; }
.petal-4 { left: 54%; animation-duration: 14s; animation-delay: 1.5s; }
.petal-5 { left: 68%; animation-duration: 16s; animation-delay: 4s; font-size: 1.3rem; }
.petal-6 { left: 82%; animation-duration: 11s; animation-delay: 6.5s; font-size: 1rem; }
.petal-7 { left: 92%; animation-duration: 13s; animation-delay: 3s; }
.petal-8 { left: 45%; animation-duration: 18s; animation-delay: 8s; font-size: 1.4rem; }

@keyframes g-petal-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -10vh, 0) rotate(0deg) scale(0.8);
  }
  15% {
    opacity: 0.9;
  }
  50% {
    transform: translate3d(35px, 50vh, 0) rotate(180deg) scale(1.1);
  }
  85% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translate3d(-25px, 105vh, 0) rotate(360deg) scale(0.8);
  }
}

/* 2. Metallic Shimmer Calligraphy Title */
h1 {
  background: linear-gradient(135deg, #5B1B3A 0%, #E31364 25%, #F4A218 50%, #E31364 75%, #5B1B3A 100%) !important;
  background-size: 200% auto !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  animation: g-text-shimmer 6s linear infinite !important;
  filter: drop-shadow(0 2px 12px rgba(227, 19, 100, 0.35)) !important;
}

@keyframes g-text-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 3. Cards 3D Interactive Hover & Illumination */
.rounded-2xl, .border, .shadow-sm {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease !important;
}

.rounded-2xl:hover {
  transform: translateY(-8px) scale(1.015) !important;
  box-shadow: 0 20px 40px -10px rgba(91, 27, 58, 0.25), 0 0 25px rgba(244, 162, 24, 0.4) !important;
  border-color: #F4A218 !important;
}

/* 4. Countdown Boxes Golden Light Sweep */
[class*="count"] > div {
  position: relative;
  overflow: hidden;
}

[class*="count"] > div::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(60deg, transparent, rgba(244, 162, 24, 0.3), transparent);
  transform: rotate(30deg);
  animation: g-sweep 4.5s infinite;
  pointer-events: none;
}

@keyframes g-sweep {
  0% { transform: translateY(-100%) rotate(30deg); }
  35%, 100% { transform: translateY(100%) rotate(30deg); }
}

/* 5. Photos Hover Zoom */
img {
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

img:hover {
  transform: scale(1.06) !important;
}
`;

css = superchargedCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Injected supercharged animation CSS into style.css!');

// 3. Update app.js with GSAP ScrollTrigger reveals on every element
let appJs = fs.readFileSync('app.js', 'utf8');

const richGsapLogic = `
  // 3. COMPLETE SECTION-BY-SECTION GSAP SCROLL ANIMATIONS
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Hero Elements Entrance
    gsap.from('h1', {
      scale: 0.88,
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });

    // B. Section Headers Stagger
    gsap.utils.toArray('h2, h3, .g-serif').forEach(heading => {
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // C. Cards Staggered Pop (Schedule, Venue, Story, FAQ)
    const cards = gsap.utils.toArray('.rounded-2xl, .border, .shadow-sm');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // D. Countdown Boxes Stagger
    const countBoxes = document.querySelectorAll('[class*="count"] > div');
    if (countBoxes.length > 0) {
      gsap.fromTo(countBoxes,
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: countBoxes[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
`;

const sIdx = appJs.indexOf('// 3. GSAP & ScrollTrigger Animations');
const eIdx = appJs.indexOf('// 4. Scroll Reveal Intersection Observer');

if (sIdx !== -1 && eIdx !== -1) {
  appJs = appJs.substring(0, sIdx) + richGsapLogic + '\n  ' + appJs.substring(eIdx);
  fs.writeFileSync('app.js', appJs);
  console.log('Successfully updated app.js with rich GSAP animations!');
}
