const fs = require('fs');

let body = fs.readFileSync('body_extracted.html', 'utf8');

// 1. Remove Next.js hydration / scripts
body = body.replace(/<script[^>]*src="\/_next\/[^>]*><\/script>/gi, '');
body = body.replace(/<link[^>]*href="\/_next\/[^>]*>/gi, '');
body = body.replace(/<script[^>]*src="https:\/\/www\.googletagmanager\.com[^>]*><\/script>/gi, '');
body = body.replace(/<link[^>]*href="https:\/\/www\.googletagmanager\.com[^>]*>/gi, '');
body = body.replace(/<script>\(self\.__next_f[\s\S]*?<\/script>/gi, '');
body = body.replace(/<script>self\.__next_f[\s\S]*?<\/script>/gi, '');
body = body.replace(/<!--\$-->|<!--\/\$-->/g, '');

// 2. Remove bottom demo switcher bar
const targetStr = '<div class="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)';
const startIdx = body.indexOf(targetStr);
if (startIdx !== -1) {
  const endTheme = 'The Shubh Aarambh</a></div></div></div>';
  const endIdx = body.indexOf(endTheme) + endTheme.length;
  body = body.substring(0, startIdx) + body.substring(endIdx);
}

// 3. De-brand footer
body = body.replace(/<a[^>]*href="https:\/\/www\.jointhejashn\.com"[^>]*>www\.jointhejashn\.com<\/a>/gi, 
  '<p class="g-foot-credit" style="font-size:0.7rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.75; margin-top:0.5rem;">With Blessings of Family & Friends · Forever & Always</p>'
);

// 4. Customize details
body = body.replace(/Karan/g, 'Dhruv');
body = body.replace(/Anjali/g, 'Shreya');
body = body.replace(/करण/g, 'ध्रुव');
body = body.replace(/अंजलि/g, 'श्रेया');

body = body.replace(/Aarav/g, 'Dhruv');
body = body.replace(/Meera/g, 'Shreya');
body = body.replace(/आरव/g, 'ध्रुव');
body = body.replace(/मीरा/g, 'श्रेया');

body = body.replace(/>K\s*·\s*A</g, '>D · S<');
body = body.replace(/>K\s*&amp;\s*A</g, '>D &amp; S<');

body = body.replace(/12 December 2026/g, '3 December 2024');
body = body.replace(/10 December 2026/g, '1 December 2024');
body = body.replace(/11 December 2026/g, '2 December 2024');
body = body.replace(/13 December 2026/g, '4 December 2024');

body = body.replace(/Jaipur/g, 'Himmatnagar');
body = body.replace(/जयपुर/g, 'हिम्मतनगर');
body = body.replace(/Jai Mahal Palace/g, 'The Milestone');
body = body.replace(/The Leela Palace/g, 'The Milestone');
body = body.replace(/Amber Fort Road/g, 'The Milestone Highway');
body = body.replace(/MI Road/g, 'The Milestone');

body = body.replace(/Mr\.\s*Sanjay\s*Mehta/gi, 'Mr. Nalinkumar');
body = body.replace(/श्री\s*संजय\s*मेहता/gi, 'श्री नलिनकुमार');
body = body.replace(/Mrs\.\s*Rekha\s*Mehta/gi, 'Mrs. Kalpuben');
body = body.replace(/श्रीमती\s*रेखा\s*मेहता/gi, 'श्रीमती कल्पूबेन');

body = body.replace(/Rohan/g, 'Nalinkumar');
body = body.replace(/\+91 98100 12345/g, '+91 98251 45678');
body = body.replace(/Riya/g, 'Family Helpdesk');
body = body.replace(/\+91 97110 67890/g, '+91 98982 34567');
body = body.replace(/#AaravKiMeera/gi, '#DhruvKiShreya');

// 5. Fix invisible SVG paths
body = body.replace(/opacity="0"/g, 'opacity="0.9"');

const indexHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased" data-lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The Ivory — Royal Minimalist &amp; Ivory Gold Wedding Invitation</title>
  <meta name="description" content="You are cordially invited to celebrate the royal wedding of Dhruv &amp; Shreya in The Ivory luxury theme." />
  <link rel="icon" href="./public/favicon.ico" sizes="256x256" type="image/x-icon" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=DM+Serif+Display:ital@0;1&family=Great+Vibes&family=Marcellus&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN with Full Ivory & Gul Theme Config -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
            display: ['var(--font-playfair)', 'Georgia', 'serif'],
            script: ['var(--font-great-vibes)', 'cursive'],
            sans: ['var(--font-raleway)', 'Segoe UI', 'sans-serif'],
            deva: ['var(--font-noto-deva)', 'sans-serif']
          },
          colors: {
            g: {
              cream: '#FAF5EB',
              pink: '#E31364',
              marigold: '#F4A218',
              plum: '#5B1B3A',
              ink: '#24151D'
            }
          }
        }
      }
    }
  </script>

  <!-- Core CSS -->
  <link rel="stylesheet" href="./style.css" />

  <!-- GSAP & ScrollTrigger -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
</head>
<body class="min-h-full flex flex-col">
${body}

  <!-- Royal HTML5 Background Audio Player -->
  <audio id="wedding-audio" src="./public/FinalSong.mp3" preload="auto" loop playsinline></audio>

  <!-- Royal Floating Music Player -->
  <div id="rjm-audio-wrap" class="rjm-audio-widget" aria-label="Royal Music Player">
    <button type="button" id="rjm-music-toggle" class="rjm-music-btn" aria-label="Toggle Wedding Music">
      <span class="rjm-music-disc">
        <svg viewBox="0 0 24 24" class="rjm-music-icon icon-note" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </span>
      <span class="rjm-sound-waves">
        <span class="wave-bar bar-1"></span>
        <span class="wave-bar bar-2"></span>
        <span class="wave-bar bar-3"></span>
      </span>
    </button>
  </div>

  <!-- Interactive JavaScript Application -->
  <script src="./wedding-config.js"></script>
  <script src="./app.js"></script>
</body>
</html>
`;

fs.writeFileSync('index.html', indexHtml);
console.log('Successfully generated index.html for Ivory theme!');
