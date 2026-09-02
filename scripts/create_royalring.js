import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `<!DOCTYPE html>
<html lang="en" data-lang="en" class="h-full scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>The Royal Ring — Luxury Engagement Invitation</title>
  <meta name="description" content="A cinematic royal engagement invitation. Join us for our auspicious ring ceremony and celebrations." />
  
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            display: ['"Cormorant Garamond"', 'serif'],
            body: ['"Jost"', 'sans-serif'],
            deva: ['"Tiro Devanagari Hindi"', 'serif'],
          },
          colors: {
            maroon: {
              DEFAULT: '#4A0E17',
              deep: '#2D080E',
              ink: '#1A0407',
            },
            gold: {
              DEFAULT: '#C49A35',
              light: '#E8D5AD',
              deep: '#9C772F',
            },
            ivory: {
              DEFAULT: '#FAF5EB',
              warm: '#F3ECDF',
              sheet: '#FDFBF7',
            }
          }
        }
      }
    };
  </script>

  <link rel="stylesheet" href="./style.css" />
</head>
<body class="bg-ivory text-neutral-900 font-body relative min-h-screen overflow-x-hidden selection:bg-maroon selection:text-ivory">

  <!-- 🪔 1. CINEMATIC OPENING CEREMONY OVERLAY -->
  <div id="royal-opening" class="fixed inset-0 z-50 flex items-center justify-center bg-maroon-ink text-ivory transition-all duration-1000 overflow-hidden cursor-pointer">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,154,53,0.25)_0%,transparent_70%)] pointer-events-none"></div>

    <div class="opening-inner relative z-10 max-w-lg w-full mx-4 p-8 sm:p-12 text-center space-y-6 rounded-3xl border border-gold/40 bg-maroon-deep/90 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
      
      <p class="font-deva text-gold-light tracking-widest text-lg sm:text-xl font-light">
        ॥ श्री गणेशाय नमः ॥
      </p>

      <div class="relative w-32 h-32 mx-auto flex items-center justify-center my-4">
        <div class="absolute inset-0 rounded-full border border-gold/40 animate-spin" style="animation-duration: 20s;"></div>
        <div class="absolute inset-3 rounded-full border-2 border-dashed border-gold-light/60 animate-spin" style="animation-duration: 12s; animation-direction: reverse;"></div>
        <div class="couple-monogram font-display text-3xl font-bold gold-text tracking-widest">
          A & R
        </div>
      </div>

      <div class="space-y-2">
        <span class="text-[10px] font-bold tracking-[0.4em] uppercase text-gold-light/80 block">
          THE ROYAL RING
        </span>
        <h2 class="couple-full-title-en font-display text-2xl sm:text-4xl font-bold text-ivory tracking-wide">
          Aarav & Riya
        </h2>
        <p class="text-xs sm:text-sm text-gold-light/90 font-light italic">
          Request the honour of your presence at their Engagement Ceremony
        </p>
      </div>

      <div class="pt-4">
        <button id="enter-invitation-btn" type="button" class="px-8 py-3 rounded-full gold-foil-bg text-maroon-ink font-bold text-xs uppercase tracking-[0.25em] shadow-lg hover:scale-105 transition-transform duration-300">
          Enter Royal Invitation ➜
        </button>
      </div>

      <p class="text-[10px] tracking-widest uppercase text-gold-light/50">
        Tap anywhere to open
      </p>
    </div>
  </div>

  <!-- 👑 2. TOP FLOATING NAVIGATION BAR -->
  <header class="fixed top-4 inset-x-0 z-40 px-4 pointer-events-none">
    <div class="max-w-4xl mx-auto flex items-center justify-between bg-ivory-sheet/90 backdrop-blur-md border border-gold/40 rounded-full px-5 py-2.5 shadow-md pointer-events-auto">
      
      <a href="#hero" class="flex items-center gap-2 text-maroon hover:text-gold transition-colors">
        <span class="text-xl">💍</span>
        <span class="couple-monogram font-display font-bold text-lg tracking-wider text-maroon">A & R</span>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-neutral-700">
        <a href="#ceremony" class="hover:text-maroon transition-colors">Ring Ceremony</a>
        <a href="#story" class="hover:text-maroon transition-colors">Our Story</a>
        <a href="#events" class="hover:text-maroon transition-colors">Timeline</a>
        <a href="#gallery" class="hover:text-maroon transition-colors">Gallery</a>
        <a href="#venue" class="hover:text-maroon transition-colors">Venue</a>
        <a href="#rsvp" class="hover:text-maroon transition-colors">RSVP</a>
      </nav>

      <div class="flex items-center gap-2">
        <button id="floating-audio-btn" type="button" class="w-8 h-8 rounded-full bg-maroon text-gold-light border border-gold/50 flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer" title="Toggle Music">
          <span class="text-xs">🎵</span>
        </button>

        <div class="flex items-center bg-ivory-warm rounded-full p-0.5 border border-gold/30 text-[10px] font-bold">
          <button type="button" onclick="setLanguage('en')" class="px-2 py-0.5 rounded-full hover:bg-maroon hover:text-white transition-colors">EN</button>
          <button type="button" onclick="setLanguage('hi')" class="px-2 py-0.5 rounded-full hover:bg-maroon hover:text-white transition-colors">हिं</button>
          <button type="button" onclick="setLanguage('gu')" class="px-2 py-0.5 rounded-full hover:bg-maroon hover:text-white transition-colors">ગુ</button>
        </div>
      </div>
    </div>
  </header>

  <!-- Audio Element -->
  <audio id="bg-music-audio" loop preload="none">
    <source src="/templates/rajmahal-template/assets/shehnai.mp3" type="audio/mp3" />
  </audio>

  <!-- 🏰 3. HERO SECTION -->
  <section id="hero" class="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 max-w-5xl mx-auto text-center space-y-8">
    
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ivory-warm border border-gold/50 text-maroon text-xs font-deva tracking-widest shadow-xs">
      <span>✨</span>
      <span>॥ श्री गणेशाय नमः ॥</span>
      <span>✨</span>
    </div>

    <p class="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-gold-deep">
      <span class="l-en">WE ARE GETTING ENGAGED</span>
      <span class="l-hi">हमारा सगाई व मुद्रिका समारोह</span>
      <span class="l-gu">અમારો સગાઈ / મુદ્રિકા મહોત્સવ</span>
    </p>

    <div class="space-y-3">
      <h1 class="font-display font-bold text-4xl sm:text-7xl lg:text-8xl text-maroon tracking-tight leading-none">
        <span class="groom-name-en">Aarav</span>
        <span class="groom-name-hi l-hi">आरव</span>
        <span class="groom-name-gu l-gu">આરવ</span>
        <span class="italic font-normal text-gold-deep mx-2 sm:mx-4 font-display">&</span>
        <span class="bride-name-en">Riya</span>
        <span class="bride-name-hi l-hi">रिया</span>
        <span class="bride-name-gu l-gu">રિયા</span>
      </h1>
      <p class="text-sm sm:text-base text-neutral-600 font-light italic max-w-lg mx-auto">
        Together with our families, we joyfully invite you to celebrate the beginning of our forever.
      </p>
    </div>

    <!-- Portrait Frame -->
    <div class="relative max-w-md mx-auto my-8">
      <div class="p-3 rounded-2xl bg-gradient-to-b from-gold-light via-gold to-gold-deep shadow-2xl">
        <div class="relative rounded-xl overflow-hidden aspect-[4/5] bg-neutral-900">
          <img src="./assets/couple-hero.jpg" alt="Aarav & Riya" class="couple-hero-img w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-transparent to-transparent"></div>
          
          <div class="absolute bottom-4 inset-x-4 text-center text-ivory">
            <p class="engagement-date-text font-display text-xl font-bold tracking-wider">
              18 January 2027
            </p>
            <p class="venue-name-text text-xs text-gold-light font-light">
              The Grand Palace, Udaipur, Rajasthan
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Countdown Timer -->
    <div class="max-w-2xl mx-auto space-y-4">
      <p class="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
        <span class="l-en">COUNTDOWN TO RING CEREMONY</span>
        <span class="l-hi">सगाई समारोह का शुभ समय</span>
        <span class="l-gu">સગાઈનો શુભ સમય</span>
      </p>

      <div class="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
        <div class="p-3.5 sm:p-4 rounded-2xl bg-maroon text-ivory text-center shadow-lg border border-gold/40">
          <span id="count-days" class="countdown-num font-display text-2xl sm:text-4xl font-bold block tabular-nums text-gold-light">00</span>
          <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold-light/80 block mt-1">Days</span>
        </div>
        <div class="p-3.5 sm:p-4 rounded-2xl bg-maroon text-ivory text-center shadow-lg border border-gold/40">
          <span id="count-hours" class="countdown-num font-display text-2xl sm:text-4xl font-bold block tabular-nums text-gold-light">00</span>
          <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold-light/80 block mt-1">Hours</span>
        </div>
        <div class="p-3.5 sm:p-4 rounded-2xl bg-maroon text-ivory text-center shadow-lg border border-gold/40">
          <span id="count-mins" class="countdown-num font-display text-2xl sm:text-4xl font-bold block tabular-nums text-gold-light">00</span>
          <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold-light/80 block mt-1">Mins</span>
        </div>
        <div class="p-3.5 sm:p-4 rounded-2xl bg-maroon text-ivory text-center shadow-lg border border-gold/40">
          <span id="count-secs" class="countdown-num font-display text-2xl sm:text-4xl font-bold block tabular-nums text-gold-light">00</span>
          <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gold-light/80 block mt-1">Secs</span>
        </div>
      </div>
    </div>

    <!-- Quick CTAs -->
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="#ceremony" class="px-7 py-3 rounded-full bg-maroon hover:bg-maroon-deep text-ivory font-bold text-xs uppercase tracking-widest shadow-md transition-all">
        Ceremony Details ➜
      </a>
      <a href="#rsvp" class="px-7 py-3 rounded-full bg-ivory-warm hover:bg-white text-maroon border border-gold font-bold text-xs uppercase tracking-widest shadow-md transition-all">
        RSVP Now
      </a>
    </div>
  </section>

  <!-- 💍 4. 3D RING CEREMONY SECTION -->
  <section id="ceremony" class="relative py-20 bg-maroon-deep text-ivory overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,154,53,0.2)_0%,transparent_70%)] pointer-events-none"></div>

    <div class="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
      <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-light">
        ॥ मुद्रिका संस्कार व सगाई ॥
      </span>

      <h2 class="font-display font-bold text-3xl sm:text-5xl text-gold-light">
        The Ring Ceremony
      </h2>

      <p class="text-sm sm:text-base text-ivory/80 font-light max-w-lg mx-auto leading-relaxed">
        Two rings, a sacred vow, and a lifetime of happiness woven under the stars.
      </p>

      <div class="relative max-w-xs mx-auto my-8">
        <img src="./assets/rings.png" alt="Royal Engagement Rings" class="ring-hero-img w-full drop-shadow-[0_20px_40px_rgba(196,154,53,0.5)] animate-pulse" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-2xl mx-auto pt-4">
        <div class="p-5 rounded-2xl bg-maroon/60 border border-gold/30 space-y-1">
          <span class="text-2xl">💍</span>
          <h4 class="font-display font-bold text-lg text-gold-light">Ring Exchange</h4>
          <p class="text-xs text-ivory/70">8:00 PM · Sheesh Mahal</p>
        </div>
        <div class="p-5 rounded-2xl bg-maroon/60 border border-gold/30 space-y-1">
          <span class="text-2xl">✨</span>
          <h4 class="font-display font-bold text-lg text-gold-light">Auspicious Muhurat</h4>
          <p class="muhurat-time-text text-xs text-ivory/70">6:30 PM Onwards</p>
        </div>
        <div class="p-5 rounded-2xl bg-maroon/60 border border-gold/30 space-y-1">
          <span class="text-2xl">🥂</span>
          <h4 class="font-display font-bold text-lg text-gold-light">Celebration Feast</h4>
          <p class="text-xs text-ivory/70">9:30 PM · Lakeside Lawn</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 📖 5. OUR STORY / JOURNEY TIMELINE -->
  <section id="story" class="py-20 px-4 max-w-4xl mx-auto text-center space-y-12">
    <div class="space-y-2">
      <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-deep">HOW IT BEGAN</span>
      <h2 class="font-display font-bold text-3xl sm:text-5xl text-maroon">Our Journey</h2>
      <p class="text-xs sm:text-sm text-neutral-600 font-light italic">Every love story is beautiful, but ours is our favourite.</p>
    </div>

    <div class="space-y-8 text-left max-w-2xl mx-auto">
      <div class="flex gap-4 p-5 rounded-2xl bg-ivory-warm/80 border border-gold/40 card-lift">
        <span class="px-3 py-1 rounded-full bg-maroon text-gold-light font-bold text-xs h-fit">2019</span>
        <div class="space-y-1">
          <h4 class="font-display font-bold text-lg text-maroon">A Monsoon Meeting</h4>
          <p class="text-xs text-neutral-700 leading-relaxed">A crowded bookstore, one shared umbrella in the first monsoon rain, and a conversation that refused to end.</p>
        </div>
      </div>

      <div class="flex gap-4 p-5 rounded-2xl bg-ivory-warm/80 border border-gold/40 card-lift">
        <span class="px-3 py-1 rounded-full bg-maroon text-gold-light font-bold text-xs h-fit">2021</span>
        <div class="space-y-1">
          <h4 class="font-display font-bold text-lg text-maroon">The First Journey</h4>
          <p class="text-xs text-neutral-700 leading-relaxed">Two train tickets to Udaipur, and a promise made quietly beside Lake Pichola.</p>
        </div>
      </div>

      <div class="flex gap-4 p-5 rounded-2xl bg-ivory-warm/80 border border-gold/40 card-lift">
        <span class="px-3 py-1 rounded-full bg-maroon text-gold-light font-bold text-xs h-fit">2024</span>
        <div class="space-y-1">
          <h4 class="font-display font-bold text-lg text-maroon">Home, Together</h4>
          <p class="text-xs text-neutral-700 leading-relaxed">A little apartment, too many plants, and mornings that finally felt complete.</p>
        </div>
      </div>

      <div class="flex gap-4 p-5 rounded-2xl bg-ivory-warm/80 border border-gold/40 card-lift">
        <span class="px-3 py-1 rounded-full bg-maroon text-gold-light font-bold text-xs h-fit">2026</span>
        <div class="space-y-1">
          <h4 class="font-display font-bold text-lg text-maroon">The Question</h4>
          <p class="text-xs text-neutral-700 leading-relaxed">A palace terrace at dusk, a velvet box, and the easiest yes ever spoken.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 👨‍👩‍👧‍👦 6. FAMILY BLESSINGS -->
  <section id="family" class="py-20 bg-ivory-warm/60 px-4">
    <div class="max-w-4xl mx-auto text-center space-y-10">
      <div class="space-y-2">
        <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-deep">WITH LOVE FROM</span>
        <h2 class="font-display font-bold text-3xl sm:text-5xl text-maroon">Our Families</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-left">
        <div class="p-6 rounded-2xl bg-white border border-gold/40 shadow-sm space-y-3 card-lift">
          <span class="px-3 py-1 rounded-full bg-maroon text-ivory text-[10px] font-bold uppercase tracking-wider">
            Groom's Family
          </span>
          <h3 class="groom-parents-en font-display font-bold text-xl text-neutral-900">
            Shri Rajendra & Smt. Meera Singhania
          </h3>
          <p class="text-xs text-neutral-500 italic">Parents of the Groom</p>
        </div>

        <div class="p-6 rounded-2xl bg-white border border-gold/40 shadow-sm space-y-3 card-lift">
          <span class="px-3 py-1 rounded-full bg-maroon text-ivory text-[10px] font-bold uppercase tracking-wider">
            Bride's Family
          </span>
          <h3 class="bride-parents-en font-display font-bold text-xl text-neutral-900">
            Shri Vikram & Smt. Anita Rathore
          </h3>
          <p class="text-xs text-neutral-500 italic">Parents of the Bride</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 📅 7. CELEBRATION TIMELINE & EVENTS -->
  <section id="events" class="py-20 px-4 max-w-5xl mx-auto text-center space-y-12">
    <div class="space-y-2">
      <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-deep">THE CEREMONIAL ORDER</span>
      <h2 class="font-display font-bold text-3xl sm:text-5xl text-maroon">Celebration Timeline</h2>
      <p class="text-xs sm:text-sm text-neutral-600 font-light italic">Please join us for each auspicious moment.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <div class="p-6 rounded-2xl bg-white border border-gold/40 shadow-sm space-y-4 card-lift">
        <div class="flex items-center justify-between">
          <span class="text-2xl">🪔</span>
          <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gold-light/40 text-maroon">06:30 PM</span>
        </div>
        <h3 class="font-display font-bold text-xl text-maroon">Engagement Ceremony</h3>
        <p class="text-xs text-neutral-600">Traditional Royal Welcome & Tilak Rasam with shehnai blessings.</p>
        <p class="text-[11px] font-semibold text-neutral-500">📍 Durbar Hall, The Grand Palace</p>
        <p class="text-[10px] text-gold-deep font-bold">Dress Code: Royal Traditional Maroon & Gold</p>
      </div>

      <div class="p-6 rounded-2xl bg-white border-2 border-gold shadow-md space-y-4 card-lift">
        <div class="flex items-center justify-between">
          <span class="text-2xl">💍</span>
          <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-maroon text-ivory">08:00 PM</span>
        </div>
        <h3 class="font-display font-bold text-xl text-maroon">Ring Exchange</h3>
        <p class="text-xs text-neutral-600">The sacred exchange of rings under the illuminated courtyard canopy.</p>
        <p class="text-[11px] font-semibold text-neutral-500">📍 Sheesh Mahal Courtyard</p>
        <p class="text-[10px] text-gold-deep font-bold">Dress Code: Formal Ivory & Champagne</p>
      </div>

      <div class="p-6 rounded-2xl bg-white border border-gold/40 shadow-sm space-y-4 card-lift">
        <div class="flex items-center justify-between">
          <span class="text-2xl">🥂</span>
          <span class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-gold-light/40 text-maroon">09:30 PM</span>
        </div>
        <h3 class="font-display font-bold text-xl text-maroon">Dinner & Celebration</h3>
        <p class="text-xs text-neutral-600">Royal Rajasthani banquet feast, music, and toasts to the couple.</p>
        <p class="text-[11px] font-semibold text-neutral-500">📍 Lakeside Lawn, Pichola Wing</p>
        <p class="text-[10px] text-gold-deep font-bold">Dress Code: Elegant Festive</p>
      </div>
    </div>
  </section>

  <!-- 📸 8. PHOTO GALLERY -->
  <section id="gallery" class="py-20 bg-ivory-warm/40 px-4">
    <div class="max-w-5xl mx-auto text-center space-y-10">
      <div class="space-y-2">
        <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-deep">MEMORIES & MOMENTS</span>
        <h2 class="font-display font-bold text-3xl sm:text-5xl text-maroon">Couple Gallery</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-1.jpg" alt="Gallery 1" class="gallery-thumb gallery-img-1 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-2.jpg" alt="Gallery 2" class="gallery-thumb gallery-img-2 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-3.jpg" alt="Gallery 3" class="gallery-thumb gallery-img-3 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-4.jpg" alt="Gallery 4" class="gallery-thumb gallery-img-4 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-5.jpg" alt="Gallery 5" class="gallery-thumb gallery-img-5 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div class="overflow-hidden rounded-2xl aspect-[3/4] border border-gold/30 shadow-xs cursor-pointer group">
          <img src="./assets/gal-6.jpg" alt="Gallery 6" class="gallery-thumb gallery-img-6 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    </div>
  </section>

  <!-- Lightbox Modal -->
  <div id="gallery-lightbox" class="fixed inset-0 z-50 bg-black/90 hidden items-center justify-center p-4">
    <button id="close-lightbox-btn" type="button" class="absolute top-6 right-6 text-white text-3xl font-bold cursor-pointer">×</button>
    <img id="lightbox-img" src="" alt="Enlarged photo" class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
  </div>

  <!-- 📍 9. VENUE & GOOGLE MAPS ROUTE -->
  <section id="venue" class="py-20 px-4 max-w-4xl mx-auto text-center space-y-8">
    <div class="space-y-2">
      <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-deep">CELEBRATION VENUE</span>
      <h2 class="font-display font-bold text-3xl sm:text-5xl text-maroon">The Grand Palace</h2>
    </div>

    <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-gold/40 max-w-2xl mx-auto">
      <img src="./assets/venue.jpg" alt="Venue" class="w-full aspect-[16/9] object-cover" />
      <div class="p-6 bg-white text-left space-y-4">
        <div>
          <h4 class="venue-name-text font-display font-bold text-2xl text-maroon">The Grand Palace, Udaipur</h4>
          <p class="venue-address-text text-xs text-neutral-600 mt-1">Lake Pichola Road, Udaipur, Rajasthan 313001</p>
        </div>

        <a href="https://maps.google.com/?q=The+Grand+Palace+Udaipur" target="_blank" rel="noopener noreferrer" class="maps-cta-link inline-flex items-center gap-2 px-6 py-3 rounded-full bg-maroon hover:bg-maroon-deep text-ivory font-bold text-xs uppercase tracking-wider shadow-md transition-all">
          <span>📍</span>
          <span>Open Google Maps Directions ➜</span>
        </a>
      </div>
    </div>
  </section>

  <!-- 💌 10. LIVE GUEST RSVP FORM -->
  <section id="rsvp" class="py-20 bg-maroon-deep text-ivory px-4">
    <div class="max-w-xl mx-auto text-center space-y-8">
      <div class="space-y-2">
        <span class="text-xs font-bold tracking-[0.3em] uppercase text-gold-light">PLEASE RESPOND</span>
        <h2 class="font-display font-bold text-3xl sm:text-5xl text-gold-light">RSVP & Wishes</h2>
        <p class="text-xs sm:text-sm text-ivory/80 font-light italic">Kindly confirm your presence by 10 January 2027.</p>
      </div>

      <form id="shahi-rsvp-form" class="p-6 sm:p-8 rounded-3xl bg-maroon/80 border border-gold/40 text-left space-y-5 shadow-2xl backdrop-blur-md">
        
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Your Full Name *</label>
          <input type="text" name="guest_name" required placeholder="e.g. Ramesh Sharma" class="w-full px-4 py-2.5 rounded-xl bg-maroon-ink/70 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Mobile Number (WhatsApp) *</label>
          <input type="tel" name="guest_phone" required placeholder="e.g. +91 9876543210" class="w-full px-4 py-2.5 rounded-xl bg-maroon-ink/70 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-2">Will you be attending? *</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 p-3 rounded-xl bg-maroon-ink/50 border border-gold/30 cursor-pointer hover:border-gold">
              <input type="radio" name="attending" value="yes" checked class="text-gold" />
              <span class="text-xs font-bold">Joyfully Accept 🎉</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-xl bg-maroon-ink/50 border border-gold/30 cursor-pointer hover:border-gold">
              <input type="radio" name="attending" value="no" class="text-gold" />
              <span class="text-xs font-bold">Regretfully Decline</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Number of Guests</label>
          <select name="attendees_count" class="w-full px-4 py-2.5 rounded-xl bg-maroon-ink/70 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Persons</option>
            <option value="3">3 Persons</option>
            <option value="4">4 Persons</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gold-light mb-1">Warm Wishes & Blessings</label>
          <textarea name="wishes" rows="3" placeholder="Write your heartfelt blessings for Aarav & Riya..." class="w-full px-4 py-2.5 rounded-xl bg-maroon-ink/70 border border-gold/40 text-ivory text-sm focus:outline-none focus:border-gold"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl gold-foil-bg text-maroon-ink font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-102 transition-transform cursor-pointer">
          Send RSVP & Blessings ➜
        </button>

        <p id="rsvp-status-msg" class="text-center text-xs font-bold text-gold-light hidden"></p>
      </form>
    </div>
  </section>

  <!-- 🌟 11. FINALE & AUSPICIOUS BLESSING -->
  <footer class="py-16 text-center space-y-4 px-4 bg-maroon-ink text-ivory border-t border-gold/20">
    <p class="font-deva text-gold-light text-xl tracking-widest">॥ शुभारंभ ॥</p>
    <p class="font-display text-2xl font-bold text-gold-light">Two hearts. One beautiful beginning.</p>
    <p class="couple-full-title-en font-display text-lg text-ivory/80">Aarav & Riya</p>
    <p class="text-[10px] text-neutral-500 tracking-widest uppercase pt-4">
      Shahi Studio™ Royal Engagement Invitation
    </p>
  </footer>

  <script src="./app.js"></script>
  <script src="/templates/shared-rsvp.js"></script>
</body>
</html>`;

const targetPath = path.join(__dirname, '..', 'public', 'templates', 'royalring-template', 'index.html');
fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('Generated index.html successfully at', targetPath);

