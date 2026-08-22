const fs = require('fs');

const filePath = 'public/templates/rajmahal-template/index.html';
const content = fs.readFileSync(filePath, 'utf8');

const rsvpSectionNew = `<!-- 👑 THE RAJMAHAL PALACE ROYAL RSVP SECTION -->
<section id="rsvp" class="rjm-rsvp relative py-20 sm:py-28 px-4 sm:px-8 bg-[#F8F3E8] text-[#241A17] overflow-hidden" style="border-top:1px solid #C49A35; border-bottom:1px solid #C49A35; font-family: var(--w-sans, 'Manrope', system-ui, sans-serif);">
  
  <!-- Subtle Architectural Jaali Lattice Background Overlay -->
  <div class="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="rjm-rsvp-jaali" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M18 0 L36 18 L18 36 L0 18 Z" fill="none" stroke="#C49A35" stroke-width="1.2"/>
          <circle cx="18" cy="18" r="4" fill="none" stroke="#C49A35" stroke-width="1"/>
          <circle cx="0" cy="0" r="2" fill="#C49A35"/>
          <circle cx="36" cy="0" r="2" fill="#C49A35"/>
          <circle cx="0" cy="36" r="2" fill="#C49A35"/>
          <circle cx="36" cy="36" r="2" fill="#C49A35"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rjm-rsvp-jaali)"/>
    </svg>
  </div>

  <div class="max-w-2xl mx-auto text-center relative z-10">
    
    <!-- Top Royal Ornament -->
    <div class="text-center mb-3 text-[#C49A35]">
      <span class="text-base sm:text-lg tracking-[0.3em]">✦ ❖ ✦</span>
    </div>

    <!-- Small Eyebrow -->
    <p class="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-bold text-[#C49A35] mb-2 font-mono">
      <span class="l-en">KINDLY RESPOND</span>
      <span class="l-hi">उत्तर की प्रतीक्षा में</span>
    </p>

    <!-- Main Heading -->
    <h2 class="font-serif text-3xl sm:text-5xl text-[#6E1020] mb-3 leading-tight tracking-wide font-normal" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
      <span class="l-en">Celebrate With Us</span>
      <span class="l-hi">हमारे उत्सव में शामिल हों</span>
    </h2>

    <!-- Subtitle -->
    <p class="text-sm sm:text-base text-[#75675C] max-w-lg mx-auto font-light leading-relaxed mb-8 italic" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
      <span class="l-en">"Your presence would make our celebration even more special."</span>
      <span class="l-hi">"आपकी उपस्थिति हमारे इस पावन उत्सव को और भी अविस्मरणीय बनाएगी।"</span>
    </p>

    <!-- Royal Invitation Card Container -->
    <div class="bg-[#FFFDF8] p-6 sm:p-10 rounded-3xl border border-[#E8D5AD] shadow-[0_10px_40px_-10px_rgba(110,16,32,0.06)] text-left relative overflow-hidden">
      
      <!-- Subtle Decorative Corner Accents -->
      <div class="absolute top-3 left-3 text-[#C49A35] opacity-50 text-xs select-none">✦</div>
      <div class="absolute top-3 right-3 text-[#C49A35] opacity-50 text-xs select-none">✦</div>
      <div class="absolute bottom-3 left-3 text-[#C49A35] opacity-50 text-xs select-none">✦</div>
      <div class="absolute bottom-3 right-3 text-[#C49A35] opacity-50 text-xs select-none">✦</div>

      <form class="shahi-rsvp-form space-y-6" data-shahi-rsvp="true">
        
        <!-- 1. RSVP Response Choice (2 Luxury Interactive Cards) -->
        <div>
          <label class="block text-[11px] uppercase tracking-[0.18em] font-bold text-[#C49A35] mb-3 font-mono">
            <span class="l-en">WILL YOU GRACE THE CELEBRATION?</span>
            <span class="l-hi">क्या आप उपस्थित होंगे?</span>
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Card 1: Yes Attend -->
            <label class="rjm-choice-card group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left select-none bg-[#FFFDF8] border-[#6E1020] shadow-xs has-[:checked]:border-[#6E1020] has-[:checked]:bg-[#FFFDF8] has-[:checked]:ring-1 has-[:checked]:ring-[#6E1020]">
              <input type="radio" name="attending" value="true" checked class="sr-only" />
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs sm:text-[13px] font-bold tracking-wider text-[#6E1020] flex items-center gap-2 font-mono">
                  <span class="w-4 h-4 rounded-full border border-[#6E1020] bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-[10px] font-sans">✓</span>
                  <span class="l-en">YES, I'LL ATTEND</span>
                  <span class="l-hi">हाँ, अवश्य पधारेंगे</span>
                </span>
                <span class="text-[#C49A35] text-xs">✦</span>
              </div>
              <span class="text-[11px] sm:text-xs text-[#75675C] italic font-serif" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
                <span class="l-en">Aapka swagat hai</span>
                <span class="l-hi">आपका स्वागत है</span>
              </span>
            </label>

            <!-- Card 2: Decline -->
            <label class="rjm-choice-card group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between text-left select-none bg-[#FFFDF8] border-[#E8D5AD] hover:border-[#C49A35] has-[:checked]:border-[#6E1020] has-[:checked]:bg-[#FFFDF8] has-[:checked]:ring-1 has-[:checked]:ring-[#6E1020]">
              <input type="radio" name="attending" value="false" class="sr-only" />
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs sm:text-[13px] font-bold tracking-wider text-[#75675C] flex items-center gap-2 font-mono">
                  <span class="w-4 h-4 rounded-full border border-[#D8C7AA] bg-[#F8F3E8] text-[#75675C] flex items-center justify-center text-[10px] font-sans">✕</span>
                  <span class="l-en">SORRY, CAN'T ATTEND</span>
                  <span class="l-hi">असमर्थता के लिए क्षमा</span>
                </span>
                <span class="text-[#D8C7AA] text-xs">✦</span>
              </div>
              <span class="text-[11px] sm:text-xs text-[#75675C] italic font-serif" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
                <span class="l-en">Sending heartfelt blessings</span>
                <span class="l-hi">आपकी शुभकामनाएँ हमारे लिए अनमोल हैं</span>
              </span>
            </label>
          </div>
        </div>

        <!-- 2. Guest Name & Mobile Number (Side-by-side on desktop) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] uppercase tracking-[0.14em] font-bold text-[#241A17] mb-1.5 font-mono">
              <span class="l-en">YOUR FULL NAME</span>
              <span class="l-hi">पूरा नाम</span>
              <span class="text-[#6E1020]">*</span>
            </label>
            <input 
              type="text" 
              name="guest_name" 
              required 
              placeholder="e.g. Rajesh &amp; Sunita Sharma"
              class="w-full px-4 py-3 rounded-xl border border-[#E8D5AD] bg-[#FFFDF8] text-[#241A17] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-1 focus:ring-[#C49A35] focus:border-[#C49A35] transition-all"
            />
          </div>

          <div>
            <label class="block text-[11px] uppercase tracking-[0.14em] font-bold text-[#241A17] mb-1.5 font-mono">
              <span class="l-en">MOBILE NUMBER</span>
              <span class="l-hi">मोबाइल नंबर</span>
              <span class="text-[#6E1020]">*</span>
            </label>
            <input 
              type="tel" 
              name="guest_phone" 
              required 
              placeholder="+91 98250 12345"
              class="w-full px-4 py-3 rounded-xl border border-[#E8D5AD] bg-[#FFFDF8] text-[#241A17] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-1 focus:ring-[#C49A35] focus:border-[#C49A35] transition-all"
            />
          </div>
        </div>

        <!-- 3. Attendees Count Group -->
        <div class="rsvp-attendees-group">
          <label class="block text-[11px] uppercase tracking-[0.14em] font-bold text-[#241A17] mb-1.5 font-mono">
            <span class="l-en">TOTAL FAMILY MEMBERS ATTENDING</span>
            <span class="l-hi">उपस्थित सदस्यों की संख्या</span>
          </label>
          <div class="relative">
            <select 
              name="attendees_count" 
              class="w-full px-4 py-3 rounded-xl border border-[#E8D5AD] bg-[#FFFDF8] text-[#241A17] text-xs focus:outline-none focus:ring-1 focus:ring-[#C49A35] focus:border-[#C49A35] appearance-none cursor-pointer"
            >
              <option value="1">1 Person (Just Me)</option>
              <option value="2" selected>2 Persons (Couple)</option>
              <option value="3">3 Persons (Family)</option>
              <option value="4">4 Persons (Family)</option>
              <option value="5">5+ Persons (Family Group)</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#C49A35] text-xs">
              ▼
            </div>
          </div>
        </div>

        <!-- 4. Wishes & Blessings Note -->
        <div>
          <label class="block text-[11px] uppercase tracking-[0.14em] font-bold text-[#241A17] mb-1.5 font-mono">
            <span class="l-en">YOUR WISHES &amp; BLESSINGS</span>
            <span class="l-hi">शुभकामनाएँ एवं आशीर्वाद</span>
          </label>
          <textarea 
            name="wishes" 
            rows="3" 
            placeholder="Write a heartfelt blessing for Dhruv &amp; Shreya…"
            class="w-full px-4 py-3 rounded-xl border border-[#E8D5AD] bg-[#FFFDF8] text-[#241A17] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-1 focus:ring-[#C49A35] focus:border-[#C49A35] transition-all resize-none italic font-serif"
            style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);"
          ></textarea>
        </div>

        <!-- 5. Submit Button -->
        <button 
          type="submit" 
          class="w-full py-4 px-6 rounded-2xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] font-bold text-xs uppercase tracking-[0.2em] border border-[#C49A35] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <span class="text-[#C49A35]">✦</span>
          <span>CONFIRM MY RSVP</span>
          <span class="text-[#C49A35]">✦</span>
        </button>

      </form>

      <!-- 6. Confirmation Success Card -->
      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 28px 12px;">
        <div class="w-14 h-14 mx-auto rounded-full bg-[#6E1020] border-2 border-[#C49A35] text-[#C49A35] flex items-center justify-center text-xl shadow-md mb-4">
          ✦
        </div>
        
        <p class="text-[10px] uppercase tracking-[0.25em] font-mono font-bold text-[#C49A35] mb-1">
          <span class="l-en">RSVP CONFIRMED</span>
          <span class="l-hi">स्वीकृति प्राप्त हुई</span>
        </p>

        <h3 class="font-serif text-2xl sm:text-3xl text-[#6E1020] mb-2 font-normal" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
          <span class="l-en">Thank You, <span class="rsvp-confirmed-name font-bold">Respected Guest</span></span>
          <span class="l-hi">धन्यवाद, <span class="rsvp-confirmed-name font-bold">आदरणीय अतिथि</span></span>
        </h3>

        <p class="text-sm text-[#75675C] max-w-md mx-auto leading-relaxed mb-4 font-serif italic" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
          <span class="l-en">"We look forward to celebrating this auspicious occasion with you and your family."</span>
          <span class="l-hi">"हम आपके और आपके परिवार के साथ इस पावन अवसर को मनाने के लिए उत्सुक हैं।"</span>
        </p>

        <div class="text-center font-serif text-[#6E1020] font-bold text-base mb-5" style="font-family: var(--w-serif, 'Cormorant Garamond', Georgia, serif);">
          <span class="data-couple-groom">Dhruv</span> &amp; <span class="data-couple-bride">Shreya</span>
        </div>

        <div class="inline-block px-4 py-1.5 rounded-full bg-[#F8F3E8] border border-[#E8D5AD] text-[11px] text-[#C49A35] font-mono font-medium">
          ✓ Your response has been recorded successfully.
        </div>

        <!-- RSVP Helpline Contacts from Editor -->
        <div class="mt-8 pt-5 border-t border-[#E8D5AD] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-[#C49A35] font-bold">📞 RSVP Helpline:</span>
            <a href="tel:+91 9409360336" class="data-rsvp1-link text-[#6E1020] font-bold underline hover:text-[#430914]">
              <span class="data-rsvp1-name">Nalinkumar</span> (<span class="data-rsvp1-phone">+91 9409360336</span>)
            </a>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#C49A35] font-bold">💬 Assistance:</span>
            <a href="tel:+91 9409360336" class="data-rsvp2-link text-[#6E1020] font-bold underline hover:text-[#430914]">
              <span class="data-rsvp2-name">Family Helpdesk</span> (<span class="data-rsvp2-phone">+91 9409360336</span>)
            </a>
          </div>
        </div>

      </div>

    </div>
  </div>
</section>`;

const rsvpStart = content.indexOf('<!-- 👑 THE RAJMAHAL PALACE ROYAL RSVP SECTION -->');
const footStart = content.indexOf('<footer class="rjm-foot">');

if (rsvpStart !== -1 && footStart !== -1) {
  const updatedContent = content.substring(0, rsvpStart) + rsvpSectionNew + '\n' + content.substring(footStart);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log('Successfully replaced RSVP section in', filePath);
} else {
  console.error('Could not locate markers:', { rsvpStart, footStart });
  process.exit(1);
}
