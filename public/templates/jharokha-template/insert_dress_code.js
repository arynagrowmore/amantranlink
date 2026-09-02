const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const dressCodeSection = `
  <!-- Dress Code & Royal Etiquette Section -->
  <section id="dress-code" class="jhr-dresscode py-16 px-4 relative overflow-hidden" style="background: radial-gradient(60% 80% at 50% 50%, #fffaf2 0%, var(--jhr-ivory, #fdf6ec) 100%);">
    <div class="jhr-head text-center max-w-2xl mx-auto mb-10" data-tw-reveal="true">
      <svg viewBox="0 0 64 28" class="mx-auto mb-3 h-7 w-16 text-[#c9a24a]" aria-hidden="true" fill="none">
        <path d="M32 3c3 6 7 8 7 13a7 7 0 0 1-14 0c0-5 4-7 7-13z" fill="currentColor" opacity=".92"></path>
        <path d="M24 22c-6 0-9-3-11-7 5-1 9 1 11 7zM40 22c6 0 9-3 11-7-5-1-9 1-11 7z" fill="currentColor" opacity=".6"></path>
        <path d="M4 24h16M44 24h16" stroke="currentColor" stroke-width="1" opacity=".45"></path>
      </svg>
      <p class="text-xs uppercase tracking-[0.3em] text-[#a67c2e] font-sans font-medium"><span class="l-en">What to wear</span><span class="l-hi">शाही पहनावा</span></p>
      <h2 class="text-3xl sm:text-4xl font-serif text-[#7a1f38] mt-2"><span class="l-en">Dress Code &amp; Colors</span><span class="l-hi">पहनावा एवं रंग</span></h2>
      <svg viewBox="0 0 240 12" class="mx-auto mt-4 w-48 text-[#c9a24a]" fill="none" aria-hidden="true">
        <path d="M4 6h84" stroke="currentColor" stroke-width="1" opacity=".55"></path>
        <path d="M152 6h84" stroke="currentColor" stroke-width="1" opacity=".55"></path>
        <path d="M120 1.5 126 6l-6 4.5L114 6z" fill="currentColor" opacity=".9"></path>
        <circle cx="100" cy="6" r="1.6" fill="currentColor" opacity=".7"></circle>
        <circle cx="140" cy="6" r="1.6" fill="currentColor" opacity=".7"></circle>
      </svg>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div class="p-5 rounded-2xl border border-[#c9a24a]/30 bg-[#fffdfa] shadow-sm text-center transform transition-transform hover:-translate-y-1" data-tw-reveal="true">
        <div class="w-10 h-10 mx-auto rounded-full bg-[#fef08a] border border-[#eab308] flex items-center justify-center text-xl mb-3">🌻</div>
        <h3 class="font-serif text-lg text-[#7a1f38] font-bold">Haldi</h3>
        <p class="text-xs text-[#a67c2e] font-sans uppercase tracking-wider mt-1"><span class="l-en">Yellow &amp; Bright</span><span class="l-hi">पीला एवं चमकीला</span></p>
      </div>

      <div class="p-5 rounded-2xl border border-[#c9a24a]/30 bg-[#fffdfa] shadow-sm text-center transform transition-transform hover:-translate-y-1" data-tw-reveal="true">
        <div class="w-10 h-10 mx-auto rounded-full bg-[#bbf7d0] border border-[#22c55e] flex items-center justify-center text-xl mb-3">🌿</div>
        <h3 class="font-serif text-lg text-[#7a1f38] font-bold">Mehendi</h3>
        <p class="text-xs text-[#a67c2e] font-sans uppercase tracking-wider mt-1"><span class="l-en">Green &amp; Floral</span><span class="l-hi">हरा एवं फ्लोरल</span></p>
      </div>

      <div class="p-5 rounded-2xl border border-[#c9a24a]/30 bg-[#fffdfa] shadow-sm text-center transform transition-transform hover:-translate-y-1" data-tw-reveal="true">
        <div class="w-10 h-10 mx-auto rounded-full bg-[#e9d5ff] border border-[#a855f7] flex items-center justify-center text-xl mb-3">✨</div>
        <h3 class="font-serif text-lg text-[#7a1f38] font-bold">Sangeet</h3>
        <p class="text-xs text-[#a67c2e] font-sans uppercase tracking-wider mt-1"><span class="l-en">Indo-Western Glam</span><span class="l-hi">इंडो-वेस्टर्न</span></p>
      </div>

      <div class="p-5 rounded-2xl border border-[#c9a24a]/30 bg-[#fffdfa] shadow-sm text-center transform transition-transform hover:-translate-y-1" data-tw-reveal="true">
        <div class="w-10 h-10 mx-auto rounded-full bg-[#fecdd3] border border-[#e11d48] flex items-center justify-center text-xl mb-3">👑</div>
        <h3 class="font-serif text-lg text-[#7a1f38] font-bold">The Wedding</h3>
        <p class="text-xs text-[#a67c2e] font-sans uppercase tracking-wider mt-1"><span class="l-en">Royal Ethnic</span><span class="l-hi">शाही पारंपरिक</span></p>
      </div>

      <div class="p-5 rounded-2xl border border-[#c9a24a]/30 bg-[#fffdfa] shadow-sm text-center transform transition-transform hover:-translate-y-1" data-tw-reveal="true">
        <div class="w-10 h-10 mx-auto rounded-full bg-[#fed7aa] border border-[#f97316] flex items-center justify-center text-xl mb-3">🎩</div>
        <h3 class="font-serif text-lg text-[#7a1f38] font-bold">Reception</h3>
        <p class="text-xs text-[#a67c2e] font-sans uppercase tracking-wider mt-1"><span class="l-en">Formal &amp; Western</span><span class="l-hi">शाही फॉर्मल्स</span></p>
      </div>
    </div>
  </section>

  <!-- Live Stream & Virtual Attendance Banner -->
  <section id="live-stream" class="py-12 px-4 text-center" style="background: linear-gradient(135deg, #7a1f38 0%, #3f0c1e 100%); color: #fdf6ec;">
    <div class="max-w-xl mx-auto" data-tw-reveal="true">
      <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-400/50 text-red-200 text-xs font-semibold uppercase tracking-wider mb-3">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span class="l-en">Live Broadcast</span><span class="l-hi">सीधा प्रसारण</span>
      </span>
      <h3 class="text-2xl sm:text-3xl font-serif text-[#e8cd7e] mb-2"><span class="l-en">Can't make it in person?</span><span class="l-hi">समारोह से वर्चुअली जुड़ें</span></h3>
      <p class="text-sm text-[#f8dbe0] opacity-85 mb-6 font-sans"><span class="l-en">Join us virtually and shower your blessings on Rudra &amp; Ishani from anywhere in the world.</span><span class="l-hi">विश्व के किसी भी कोने से रुद्र एवं ईशानी को अपना स्नेह और आशीर्वाद दें।</span></p>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c9a24a] to-[#e8cd7e] text-[#3f0c1e] font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
        <span>▶</span>
        <span class="l-en">Watch Live Stream</span><span class="l-hi">लाइव प्रसारण देखें</span>
      </a>
    </div>
  </section>
`;

// Find where venue section is located
const vIdx = html.indexOf('id="venue"') !== -1 ? html.indexOf('id="venue"') : html.indexOf('class="jhr-venue"');
if (vIdx !== -1) {
  // Find opening <section of venue
  const secStart = html.lastIndexOf('<section', vIdx);
  html = html.substring(0, secStart) + dressCodeSection + '\n' + html.substring(secStart);
  fs.writeFileSync('index.html', html);
  console.log('Successfully inserted Dress Code and Live Stream sections!');
} else {
  console.log('Venue section not found, appending before footer');
  const footIdx = html.indexOf('<footer');
  html = html.substring(0, footIdx) + dressCodeSection + '\n' + html.substring(footIdx);
  fs.writeFileSync('index.html', html);
  console.log('Appended before footer!');
}

