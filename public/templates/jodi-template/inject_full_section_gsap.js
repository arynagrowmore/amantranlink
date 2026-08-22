const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

const fullGsapAnimations = `
  // 3. COMPLETE SECTION-BY-SECTION GSAP SCROLL ANIMATIONS
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Hero Parallax & Floating Plate
    const heroScene = document.querySelector('.jdi-hero, #top');
    if (heroScene) {
      const plate = heroScene.querySelector('img[src*="plate"], .jdi-plate-slot');
      const coupleArt = heroScene.querySelector('svg, .jdi-names');

      if (plate) {
        gsap.to(plate, {
          rotation: 360,
          ease: 'none',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 2
          }
        });
      }

      if (coupleArt) {
        gsap.to(coupleArt, {
          yPercent: isMobile ? 8 : 15,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });
      }
    }

    // B. Story Timeline Smooth Draw & Card Slide-In
    const timelineEl = document.querySelector('.jdi-timeline, .rjm-timeline');
    const timelineFill = document.querySelector('.jdi-timeline-fill, .rjm-timeline-fill');
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

    // Staggered Timeline Cards
    const timelineCards = gsap.utils.toArray('.jdi-timeline .relative, [id="story"] .relative');
    timelineCards.forEach((card, idx) => {
      const isLeft = idx % 2 === 0;
      gsap.fromTo(card,
        { x: isLeft ? (isMobile ? -25 : -50) : (isMobile ? 25 : 50), opacity: 0, scale: 0.96 },
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

    // C. Celebration Event Cards Staggered 3D Entrance
    const eventCards = gsap.utils.toArray('.jdi-event, .jdi-card, [id="schedule"] .jdi-card');
    if (eventCards.length > 0) {
      gsap.fromTo(eventCards,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: eventCards[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // D. Moments Gallery Photos Staggered Zoom & Fade
    const galleryItems = gsap.utils.toArray('.jdi-frame, [id="gallery"] img');
    if (galleryItems.length > 0) {
      gsap.fromTo(galleryItems,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: galleryItems[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // E. Venue & Map Cards Slide-Up
    const venueCards = gsap.utils.toArray('[id="venue"] .jdi-card, [id="venue"] div[data-tw-reveal]');
    venueCards.forEach(card => {
      gsap.fromTo(card,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // F. FAQ Accordion Interaction
    const faqItems = document.querySelectorAll('details');
    faqItems.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          gsap.from(item.querySelector('p, div'), {
            y: -10,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      });
    });
  }
`;

const sIdx = appJs.indexOf('// 3. GSAP & ScrollTrigger Animations');
const eIdx = appJs.indexOf('// 4. Scroll Reveal Intersection Observer');

if (sIdx !== -1 && eIdx !== -1) {
  appJs = appJs.substring(0, sIdx) + fullGsapAnimations + '\n  ' + appJs.substring(eIdx);
  fs.writeFileSync('app.js', appJs);
  console.log('Successfully updated app.js with complete section-by-section GSAP animations!');
}
