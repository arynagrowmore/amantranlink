const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the Hero names markup in index.html with explicit inline white styles and glowing drop-shadow
html = html.replace(/<h1 class="g-serif text-\[clamp\(3\.5rem,15vw,11rem\)\] font-semibold leading-\[0\.86\]" data-tw-reveal="true">Dhruv<\/h1>/g,
  '<h1 class="g-serif text-[clamp(3.5rem,15vw,11rem)] font-semibold leading-[0.86]" data-tw-reveal="true" style="color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; text-shadow:0 4px 20px rgba(0,0,0,0.5), 0 0 25px rgba(255,255,255,0.6);">Dhruv</h1>'
);

html = html.replace(/<span class="g-serif text-\[clamp\(2rem,6vw,4rem\)\] italic text-\[color:var\(--g-marigold\)\]">&amp;<\/span>/g,
  '<span class="g-serif text-[clamp(2rem,6vw,4rem)] italic" style="color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; text-shadow:0 2px 14px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.6);">&amp;</span>'
);

html = html.replace(/<h1 class="g-serif text-right text-\[clamp\(3\.5rem,15vw,11rem\)\] font-semibold leading-\[0\.86\]" data-tw-reveal="true">Shreya<\/h1>/g,
  '<h1 class="g-serif text-right text-[clamp(3.5rem,15vw,11rem)] font-semibold leading-[0.86]" data-tw-reveal="true" style="color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; text-shadow:0 4px 20px rgba(0,0,0,0.5), 0 0 25px rgba(255,255,255,0.6);">Shreya</h1>'
);

html = html.replace(/<span class="h-2 flex-1 rounded-full bg-\[color:var\(--g-marigold\)\]" style="animation:gul-wipe 1s ease-out both"><\/span>/g,
  '<span class="h-2 flex-1 rounded-full" style="background:#FFFFFF !important; box-shadow: 0 0 16px rgba(255,255,255,0.8); animation:gul-wipe 1s ease-out both"></span>'
);

fs.writeFileSync('index.html', html);
console.log('Successfully updated Dhruv & Shreya to Pure White in index.html!');

// Also update style.css to enforce pure white on all hero titles
let css = fs.readFileSync('style.css', 'utf8');
const forceWhiteHero = `
h1, h1.g-serif, .g-serif h1, span.g-serif {
  color: #FFFFFF !important;
  -webkit-text-fill-color: #FFFFFF !important;
  background: none !important;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 30px rgba(255, 255, 255, 0.6) !important;
}
`;
css = forceWhiteHero + '\n\n' + css;
fs.writeFileSync('style.css', css);
console.log('Updated style.css with forced pure white typography!');
