const fs = require('fs');

// 1. Update index.html to ensure 2024 date on the last milestone and add specific animation classes
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<p class="text-\[10px\] font-semibold uppercase tracking-\[0.4em\] text-\[color:var\(--myr-pink\)\]">2026<\/p>/g,
  '<p class="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--myr-pink)] font-bold">2024</p>'
);

// Add class to story cards for targeted GSAP timeline scroll animations
const sIdx = html.indexOf('id="story"');
if (sIdx !== -1) {
  const eIdx = html.indexOf('</section>', sIdx);
  let storyPart = html.substring(sIdx, eIdx);
  
  storyPart = storyPart.replace(/class="relative lg:w-\[46%\] lg:text-right"/g, 'class="relative lg:w-[46%] lg:text-right myr-story-card myr-story-left"');
  storyPart = storyPart.replace(/class="relative lg:w-\[46%\] lg:ml-auto lg:text-left"/g, 'class="relative lg:w-[46%] lg:ml-auto lg:text-left myr-story-card myr-story-right"');
  
  html = html.substring(0, sIdx) + storyPart + html.substring(eIdx);
}
fs.writeFileSync('index.html', html);
console.log('Updated story section in index.html!');

// 2. Update style.css with glowing timeline line and pulsing milestone feather nodes
let css = fs.readFileSync('style.css', 'utf8');

const storyAnimationCss = `
/* ===================================================
   💖 OUR LOVE STORY — CINEMATIC TIMELINE ANIMATIONS
   =================================================== */

.myr-story-card {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
  will-change: transform, opacity;
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: rgba(255, 253, 248, 0.85);
  border: 1px solid rgba(201, 162, 63, 0.25);
  box-shadow: 0 10px 30px -8px rgba(14, 110, 110, 0.08);
  backdrop-filter: blur(6px);
  margin-bottom: 2rem;
}

.myr-story-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: var(--myr-gold, #c9a23f);
  box-shadow: 0 16px 40px -10px rgba(14, 110, 110, 0.18), 0 0 20px rgba(236, 208, 122, 0.35);
}

/* Floating Milestone Feather Icon Pulsing Glow */
.myr-story-card svg {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.5s ease;
}

.myr-story-card:hover svg {
  transform: scale(1.18) rotate(6deg);
  filter: drop-shadow(0 4px 12px rgba(216, 27, 96, 0.45)) drop-shadow(0 0 8px rgba(201, 162, 63, 0.6));
}

/* Shimmering Year Badge */
.myr-story-card p:first-of-type {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(216, 27, 96, 0.12), rgba(201, 162, 63, 0.2));
  border: 1px solid rgba(201, 162, 63, 0.4);
  color: var(--myr-pink-deep, #a01048);
  letter-spacing: 0.35em;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(201, 162, 63, 0.15);
}

/* Timeline Central Glowing Line */
.myr-timeline-fill {
  background: linear-gradient(180deg, var(--myr-pink) 0%, var(--myr-gold) 50%, var(--myr-teal) 100%) !important;
  box-shadow: 0 0 16px rgba(201, 162, 63, 0.8), 0 0 30px rgba(216, 27, 96, 0.5) !important;
}
`;

css = storyAnimationCss + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Injected Love Story styling into style.css!');

// 3. Update app.js with scroll-triggered staggered slide animations for Love Story
let appJs = fs.readFileSync('app.js', 'utf8');

const storyGsapCode = `
    // D. Cinematic "Our Love Story" Scroll Stagger & Glow Animation
    const storyLeftCards = gsap.utils.toArray('.myr-story-left');
    storyLeftCards.forEach(card => {
      gsap.fromTo(card,
        { x: isMobile ? -30 : -70, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    const storyRightCards = gsap.utils.toArray('.myr-story-right');
    storyRightCards.forEach(card => {
      gsap.fromTo(card,
        { x: isMobile ? 30 : 70, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
`;

if (!appJs.includes('Cinematic "Our Love Story"')) {
  appJs = appJs.replace('// 4. Scroll Reveal Intersection Observer', `${storyGsapCode}\n\n  // 4. Scroll Reveal Intersection Observer`);
  fs.writeFileSync('app.js', appJs);
  console.log('Added Love Story scroll animation logic to app.js!');
}
