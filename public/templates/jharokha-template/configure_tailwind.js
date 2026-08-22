const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const tailwindConfig = `
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
            jhr: {
              ivory: '#fdf6ec',
              'ivory-2': '#f8ecdb',
              blush: '#f8dbe0',
              'blush-2': '#f3c7d0',
              champagne: '#f3e2c8',
              rose: '#df93a6',
              'rose-deep': '#c56f88',
              saffron: '#e2a24a',
              gold: '#c9a24a',
              'gold-lite': '#e8cd7e',
              'gold-deep': '#a67c2e',
              maroon: '#7a1f38',
              'maroon-2': '#5e1329',
              'maroon-3': '#3f0c1e',
              ink: '#4a2230',
              'ink-soft': '#8a5a68',
              leaf: '#8fa87a'
            }
          }
        }
      }
    }
  </script>
`;

// Replace existing tailwind script with full configured script
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/gi, '');
html = html.replace('</head>', `${tailwindConfig}\n</head>`);

fs.writeFileSync('index.html', html);
console.log('Successfully injected configured Tailwind CSS into index.html!');
