const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// Replace ScrollTrigger section in app.js with high-precision smoothed physics
const smoothGsapLogic = `
  // 3. Ultra-Smooth GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    // A. Smooth Hero Parallax with Lerp / Scrub: 1
    const heroScene = document.querySelector('.myr-scene, .myr-hero');
    if (heroScene) {
      const palaceFar = heroScene.querySelector('.myr-palace-far');
      const palace = heroScene.querySelector('.myr-palace');
      const peacockPlume = heroScene.querySelector('.myr-plume');

      if (palaceFar) {
        gsap.to(palaceFar, {
          yPercent: isMobile ? 10 : 18,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      if (palace) {
        gsap.to(palace, {
          yPercent: isMobile ? 16 : 28,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }

      if (peacockPlume) {
        gsap.to(peacockPlume, {
          scale: 1.08,
          opacity: 0.7,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: heroScene,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }
    }

    // B. Smooth Story Timeline Golden Line Draw
    const timelineEl = document.querySelector('.myr-timeline, .rjm-timeline');
    const timelineFill = document.querySelector('.myr-timeline-fill, .rjm-timeline-fill');
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

    // C. Smooth Card Entrances
    gsap.utils.toArray('.myr-card, .myr-event').forEach(card => {
      gsap.from(card, {
        y: 35,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
`;

const sIdx = appJs.indexOf('// 3. GSAP & ScrollTrigger Animations');
const eIdx = appJs.indexOf('// 4. Scroll Reveal Intersection Observer');

if (sIdx !== -1 && eIdx !== -1) {
  appJs = appJs.substring(0, sIdx) + smoothGsapLogic + '\n  ' + appJs.substring(eIdx);
  fs.writeFileSync('app.js', appJs);
  console.log('Successfully updated app.js with ultra-smooth GSAP ScrollTrigger physics!');
}
