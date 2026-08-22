const fs = require('fs');

// 1. Update style.css: Remove rotating animation from the round plate, and configure clean reveal styles
let css = fs.readFileSync('style.css', 'utf8');

// Remove plate rotation
css = css.replace(/\.jdi-turn,\s*img\[src\*="plate"\]\s*\{[^}]*\}/gi, 
  `img[src*="plate"], .jdi-plate-slot {
  transform: none !important;
  animation: none !important;
  filter: drop-shadow(0 10px 30px rgba(194, 155, 78, 0.35));
}`
);
css = css.replace(/\.jdi-turn\s*\{[^}]*\}/gi, '/* Plate rotation removed */');

// Add smooth scroll reveal CSS rules
const revealEnhancements = `
/* ===================================================
   SMOOTH SECTION-BY-SECTION SCROLL REVEAL STYLING
   =================================================== */

[data-tw-reveal="true"], .jdi-card, .jdi-event, .jdi-frame, .jdi-head, .jdi-story-card {
  will-change: opacity, transform;
}
`;

css = revealEnhancements + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Updated style.css: Removed round rotation and configured scroll reveal!');

// 2. Update app.js: Remove plate rotation and add comprehensive Section-by-Section & Staggered Scroll Reveal
let appJs = fs.readFileSync('app.js', 'utf8');

const scrollRevealLogic = `
  // 3. COMPREHENSIVE SECTION-BY-SECTION & ELEMENT SCROLL REVEAL (GSAP)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Section-by-Section Header Reveals
    gsap.utils.toArray('.jdi-head, [id] .text-center, .myr-head, .rjm-head').forEach(head => {
      gsap.fromTo(head,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: head,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // B. Story Timeline Reveal (Left cards from left, Right cards from right)
    const timelineCards = gsap.utils.toArray('.jdi-timeline .relative, [id="story"] .relative, .myr-story-card');
    timelineCards.forEach((card, idx) => {
      const isLeft = idx % 2 === 0;
      gsap.fromTo(card,
        { x: isLeft ? (isMobile ? -25 : -55) : (isMobile ? 25 : 55), opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Timeline Central Line Reveal
    const timelineEl = document.querySelector('.jdi-timeline, .rjm-timeline, .myr-timeline');
    const timelineFill = document.querySelector('.jdi-timeline-fill, .rjm-timeline-fill, .myr-timeline-fill');
    if (timelineEl && timelineFill) {
      gsap.fromTo(timelineFill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineEl,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.6
          }
        }
      );
    }

    // C. Countdown Boxes Reveal
    const countSection = document.querySelector('.jdi-count, [id="countdown"], .rjm-count');
    if (countSection) {
      gsap.fromTo(countSection.children,
        { y: 30, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: countSection,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // D. Celebration Event Cards Staggered Reveal
    const eventCards = gsap.utils.toArray('.jdi-event, .jdi-card, [id="schedule"] .jdi-card, .rjm-card');
    if (eventCards.length > 0) {
      gsap.fromTo(eventCards,
        { y: 45, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: eventCards[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // E. Moments Gallery Photo Frames Staggered Reveal
    const galleryItems = gsap.utils.toArray('.jdi-frame, [id="gallery"] img');
    if (galleryItems.length > 0) {
      gsap.fromTo(galleryItems,
        { y: 35, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryItems[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // F. Venue, Family & FAQ Section Reveals
    gsap.utils.toArray('[id="venue"] .jdi-card, [id="family"] .jdi-card, [id="faq"] details, [id="rsvp"] form, .jdi-rsvp-body').forEach(el => {
      gsap.fromTo(el,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }
`;

const sIdx = appJs.indexOf('// 3.');
const eIdx = appJs.indexOf('// 4. Scroll Reveal Intersection Observer');

if (sIdx !== -1 && eIdx !== -1) {
  appJs = appJs.substring(0, sIdx) + scrollRevealLogic + '\n  ' + appJs.substring(eIdx);
  fs.writeFileSync('app.js', appJs);
  console.log('Successfully updated app.js with clean scroll reveal & removed round rotation!');
} else {
  // Fallback
  const sIdx2 = appJs.indexOf('// 3');
  if (sIdx2 !== -1) {
    const eIdx2 = appJs.indexOf('// 5. Live Muhurat Countdown');
    appJs = appJs.substring(0, sIdx2) + scrollRevealLogic + '\n  ' + appJs.substring(eIdx2);
    fs.writeFileSync('app.js', appJs);
    console.log('Updated app.js via fallback index!');
  }
}
