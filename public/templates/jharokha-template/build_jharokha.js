const fs = require('fs');
const path = require('path');

let body = fs.readFileSync('body_extracted.html', 'utf8');

// Remove _next scripts and preloads
body = body.replace(/<script[^>]*src="\/_next\/[^>]*><\/script>/gi, '');
body = body.replace(/<link[^>]*href="\/_next\/[^>]*>/gi, '');
body = body.replace(/<script[^>]*src="https:\/\/www\.googletagmanager\.com[^>]*><\/script>/gi, '');
body = body.replace(/<link[^>]*href="https:\/\/www\.googletagmanager\.com[^>]*>/gi, '');
body = body.replace(/<script>\(self\.__next_f[\s\S]*?<\/script>/gi, '');
body = body.replace(/<script>self\.__next_f[\s\S]*?<\/script>/gi, '');
body = body.replace(/<!--\$-->|<!--\/\$-->/g, '');

// Remove bottom demo switcher bar
const targetStr = '<div class="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)';
const startIdx = body.indexOf(targetStr);
if (startIdx !== -1) {
  const endTheme = 'The Shubh Aarambh</a></div></div></div>';
  const endIdx = body.indexOf(endTheme) + endTheme.length;
  body = body.substring(0, startIdx) + body.substring(endIdx);
}

// Replace footer brand link with elegant couple tagline
body = body.replace(/<a[^>]*href="https:\/\/www\.jointhejashn\.com"[^>]*>www\.jointhejashn\.com<\/a>/gi, 
  '<p class="jhr-foot-credit" style="font-size:0.7rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.75; margin-top:0.5rem;">With Blessings of Family & Friends · Forever & Always</p>'
);

const indexHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased" data-lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The Jharokha — Royal Wedding Invitation</title>
  <meta name="description" content="You are cordially invited to celebrate the royal wedding in The Jharokha luxury theme." />
  <link rel="icon" href="./public/favicon.ico" sizes="256x256" type="image/x-icon" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=DM+Serif+Display:ital@0;1&family=Great+Vibes&family=Marcellus&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap" rel="stylesheet">

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
console.log('Successfully generated index.html for Jharokha theme!');
