const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const themePickerHtml = `
  <!-- Floating Royal Theme Color Selector -->
  <div class="rjm-theme-switcher" title="Change Theme Color">
    <button type="button" class="theme-dot emerald" data-theme-name="emerald" title="Imperial Emerald & Gold"></button>
    <button type="button" class="theme-dot sapphire" data-theme-name="sapphire" title="Midnight Sapphire & Gold"></button>
    <button type="button" class="theme-dot wine" data-theme-name="wine" title="Royal Velvet Wine & Gold"></button>
  </div>
`;

if (!html.includes('rjm-theme-switcher')) {
  html = html.replace('<div id="rjm-audio-wrap"', `${themePickerHtml}\n  <div id="rjm-audio-wrap"`);
  fs.writeFileSync('index.html', html);
  console.log('Added theme switcher to index.html!');
}

// Add JS handler to app.js
let appJs = fs.readFileSync('app.js', 'utf8');
const themeSwitcherJs = `
  // Royal Theme Switcher (Emerald, Sapphire, Wine)
  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.getAttribute('data-theme-name');
      if (theme === 'emerald') {
        htmlEl.removeAttribute('data-theme');
      } else {
        htmlEl.setAttribute('data-theme', theme);
      }
    });
  });
`;

if (!appJs.includes('Royal Theme Switcher')) {
  appJs = appJs.replace('window.rjmForcePlayAudio();', `${themeSwitcherJs}\n  window.rjmForcePlayAudio();`);
  fs.writeFileSync('app.js', appJs);
  console.log('Added theme switcher logic to app.js!');
}
