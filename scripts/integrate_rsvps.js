import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, '../public/templates');

// Helper to generate the theme-specific RSVP section HTML
function getTemplateRsvpHtml(theme) {
  switch (theme) {
    case 'rajmahal':
      return `
<!-- 👑 THE RAJMAHAL PALACE ROYAL RSVP SECTION -->
<section id="rsvp" class="rjm-rsvp relative py-20 px-4 sm:px-8 bg-[#FDF6EB] text-[#3E2612]" style="border-top:2px solid var(--rjm-gold,#C08F3F); border-bottom:2px solid var(--rjm-gold,#C08F3F);">
  <div class="max-w-2xl mx-auto text-center">
    <!-- Royal Crest -->
    <div class="mb-4 flex justify-center">
      <svg viewBox="0 0 64 28" class="h-7 text-[#C08F3F]" fill="currentColor">
        <path d="M32 3c3 6 7 8 7 13a7 7 0 0 1-14 0c0-5 4-7 7-13z" opacity=".92"/>
        <path d="M24 22c-6 0-9-3-11-7 5-1 9 1 11 7zM40 22c6 0 9-3 11-7-5-1-9 1-11 7z" opacity=".6"/>
        <path d="M4 24h16M44 24h16" stroke="currentColor" stroke-width="1" opacity=".45"/>
      </svg>
    </div>

    <p class="text-xs uppercase tracking-[0.2em] font-bold text-[#8A6526] mb-1 font-mono">
      <span class="l-en">Kindly Respond</span>
      <span class="l-hi">उत्तर की प्रतीक्षा में</span>
    </p>
    <h2 class="font-serif text-3xl sm:text-4xl text-[#7C2230] mb-2" style="font-family: var(--font-playfair, Georgia, serif);">
      <span class="l-en">Celebrate With Us</span>
      <span class="l-hi">हमारे उत्सव में शामिल हों</span>
    </h2>
    <p class="text-xs text-[#8B7358] max-w-md mx-auto mb-8">
      <span class="l-en">Please confirm your esteemed presence to help us prepare the royal hospitality.</span>
      <span class="l-hi">शाही मेहमाननवाज़ी की तैयारी के लिए कृपया अपनी उपस्थिति की पुष्टि करें।</span>
    </p>

    <!-- RSVP Card Container -->
    <div class="bg-[#FFFCF5] p-6 sm:p-10 rounded-3xl border-2 border-[#E7CD8E] shadow-xl text-left relative overflow-hidden">
      <!-- Decorative Corners -->
      <div class="absolute top-2 left-2 text-[#C08F3F] opacity-40 text-xs">❖</div>
      <div class="absolute top-2 right-2 text-[#C08F3F] opacity-40 text-xs">❖</div>
      <div class="absolute bottom-2 left-2 text-[#C08F3F] opacity-40 text-xs">❖</div>
      <div class="absolute bottom-2 right-2 text-[#C08F3F] opacity-40 text-xs">❖</div>

      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <!-- Attending Decision -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#7C2230] mb-2 font-mono">
            Will you grace the celebration? / क्या आप उपस्थित होंगे?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#C08F3F] bg-[#FDF6EB] hover:bg-[#F6E9D3] cursor-pointer text-xs font-bold text-[#3E2612] transition-all has-[:checked]:bg-[#7C2230] has-[:checked]:text-[#FFFCF5] has-[:checked]:border-[#7C2230]">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>🌸 Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#E7CD8E] bg-[#FFFCF5] hover:bg-[#FDF6EB] cursor-pointer text-xs font-bold text-[#8B7358] transition-all has-[:checked]:bg-[#3E2612] has-[:checked]:text-[#FFFCF5] has-[:checked]:border-[#3E2612]">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <!-- Guest Name & Mobile in Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-[#3E2612] mb-1">
              Your Full Name <span class="text-rose-600">*</span>
            </label>
            <input 
              type="text" 
              name="guest_name" 
              required 
              placeholder="e.g. Rajesh & Sunita Sharma"
              class="w-full px-4 py-3 rounded-xl border border-[#D8B683] bg-[#FDF6EB] text-[#3E2612] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-2 focus:ring-[#C08F3F] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#3E2612] mb-1">
              Mobile Number (WhatsApp) <span class="text-rose-600">*</span>
            </label>
            <input 
              type="tel" 
              name="guest_phone" 
              required 
              placeholder="+91 98250 12345"
              class="w-full px-4 py-3 rounded-xl border border-[#D8B683] bg-[#FDF6EB] text-[#3E2612] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-2 focus:ring-[#C08F3F] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Attendees Count Group -->
        <div class="rsvp-attendees-group">
          <label class="block text-xs font-semibold text-[#3E2612] mb-1">
            Total Family Members Attending (Headcount)
          </label>
          <div class="flex items-center gap-2">
            <select 
              name="attendees_count" 
              class="w-full px-4 py-3 rounded-xl border border-[#D8B683] bg-[#FDF6EB] text-[#3E2612] text-xs focus:outline-none focus:ring-2 focus:ring-[#C08F3F]"
            >
              <option value="1">1 Person (Just Me)</option>
              <option value="2" selected>2 Persons (Couple)</option>
              <option value="3">3 Persons (Family)</option>
              <option value="4">4 Persons (Family)</option>
              <option value="5">5+ Persons (Family Group)</option>
            </select>
          </div>
        </div>

        <!-- Wishes & Blessings -->
        <div>
          <label class="block text-xs font-semibold text-[#3E2612] mb-1">
            Warm Wishes &amp; Blessings for the Couple
          </label>
          <textarea 
            name="wishes" 
            rows="3" 
            placeholder="Write a heartfelt blessing for Dhruv & Shreya..."
            class="w-full px-4 py-2.5 rounded-xl border border-[#D8B683] bg-[#FDF6EB] text-[#3E2612] text-xs placeholder-[#B99A6E] focus:outline-none focus:ring-2 focus:ring-[#C08F3F] transition-all resize-none"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C2230] to-[#5A1520] hover:from-[#5A1520] hover:to-[#7C2230] text-[#FFFCF5] font-bold text-xs uppercase tracking-widest border border-[#E7CD8E] shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          style="background: linear-gradient(135deg, #7C2230 0%, #5A1520 100%); color: #FFFDF5; border: 1px solid #C08F3F;"
        >
          <span>💌 Submit Royal RSVP</span>
        </button>
      </form>

      <!-- Success Confirmation Card -->
      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#7C2230; color:#E7CD8E; border:2px solid #C08F3F; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px;">
          ✓
        </div>
        <h3 class="font-serif text-2xl text-[#7C2230] mb-2" style="font-family: var(--font-playfair, Georgia, serif);">
          Dhanyavaad! / धन्यवाद!
        </h3>
        <p class="text-xs text-[#3E2612] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
        <div style="display:inline-block; padding:4px 16px; background:#FDF6EB; border:1px solid #C08F3F; border-radius:999px; font-size:11px; font-weight:700; color:#8A6526; font-family:monospace;">
          ॥ सादर आभार ॥
        </div>
      </div>
    </div>
  </div>
</section>
`;

    case 'royaldawn':
      return `
<!-- 🌅 THE ROYAL DAWN UDAIPUR LAKEFRONT RSVP SECTION -->
<section id="rsvp" class="py-20 px-4 sm:px-8 border-t border-[#C59B4B]/30" style="background:#FAF7F2;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div class="space-y-1">
      <span class="text-xs font-mono text-[#A67C3D] uppercase tracking-widest font-bold">॥ मंगल निमंत्रण एवं उत्तर ॥</span>
      <h2 class="text-3xl sm:text-4xl text-[#6B1420] font-bold" style="font-family: 'Playfair Display', Georgia, serif;">
        Join Us In Celebration
      </h2>
      <p class="text-xs text-[#6B5A4A]">
        Your gracious presence &amp; blessings are our greatest wedding treasure.
      </p>
    </div>

    <!-- RSVP Card -->
    <div class="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border border-[#C59B4B]/40 shadow-xl text-left">
      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <!-- Attendance Option -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6B1420] mb-2 font-mono">
            Will you attend? / क्या आप उपस्थित होंगे?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#C59B4B] bg-[#FAF7F2] cursor-pointer text-xs font-bold text-[#6B1420] transition-all has-[:checked]:bg-[#6B1420] has-[:checked]:text-[#FFFDF9] has-[:checked]:border-[#6B1420]">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>✨ Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#D8C7AA] bg-[#FFFDF9] cursor-pointer text-xs font-bold text-[#6B5A4A] transition-all has-[:checked]:bg-[#2B1810] has-[:checked]:text-[#FFFDF9]">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-[#2B1810] mb-1">Your Full Name <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="e.g. Amit & Priya Patel" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs text-[#2B1810] focus:outline-none focus:border-[#C59B4B]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#2B1810] mb-1">WhatsApp Number <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 94093 60336" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs text-[#2B1810] focus:outline-none focus:border-[#C59B4B]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-xs font-semibold text-[#2B1810] mb-1">Total Attendees Count</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs text-[#2B1810] focus:outline-none focus:border-[#C59B4B]">
            <option value="1">1 Guest (Solo)</option>
            <option value="2" selected>2 Guests (Couple)</option>
            <option value="3">3 Guests (Family)</option>
            <option value="4">4 Guests (Family)</option>
            <option value="5">5+ Guests</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#2B1810] mb-1">Personal Message &amp; Wishes</label>
          <textarea name="wishes" rows="3" placeholder="Share your warm blessings for Dhruv & Shreya..." class="w-full px-4 py-2.5 rounded-xl border border-[#D8C7AA] bg-[#FAF7F2] text-xs text-[#2B1810] focus:outline-none focus:border-[#C59B4B] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer" style="background: linear-gradient(135deg, #C59B4B 0%, #9C772F 100%); color: #140508; border: 1px solid #E2B968;">
          Confirm RSVP &amp; Send Wishes ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#C59B4B; color:#140508; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px; font-weight:bold;">
          ✓
        </div>
        <h3 class="text-2xl text-[#6B1420] font-bold mb-2" style="font-family: 'Playfair Display', Georgia, serif;">
          RSVP Confirmed!
        </h3>
        <p class="text-xs text-[#2B1810] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
        <span style="font-size:11px; font-weight:700; color:#A67C3D; font-family:monospace;">
          ॥ श्री गणेशाय नमः ॥
        </span>
      </div>
    </div>
  </div>
</section>
`;

    case 'jharokha':
      return `
<!-- 🪟 THE JHAROKHA RAJASTHANI MARBLE ARCH RSVP SECTION -->
<section id="rsvp" class="jhr-rsvp relative scroll-mt-16 overflow-hidden px-6 py-20 bg-[#F4EDE0] text-[#1B3B2B]" style="border-top: 2px solid #A67C3D;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div>
      <span class="text-xs uppercase tracking-[0.2em] font-mono text-[#A67C3D] font-bold">॥ राजस्थानी झरोखा निमंत्रण ॥</span>
      <h2 class="text-3xl sm:text-4xl text-[#1B3B2B] font-bold mt-1 font-serif" style="font-family: 'Playfair Display', serif;">
        RSVP &amp; Blessings
      </h2>
      <p class="text-xs text-[#5C6E58]">
        Kindly let us know if you will join our auspicious moments under the Mandap.
      </p>
    </div>

    <div class="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border-2 border-[#A67C3D]/40 shadow-xl text-left relative">
      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-2 font-mono">
            Attendance Confirmation
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#1B3B2B] bg-[#E8F0E6] cursor-pointer text-xs font-bold text-[#1B3B2B] transition-all has-[:checked]:bg-[#1B3B2B] has-[:checked]:text-white">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>🌿 Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#D8C7AA] bg-[#FFFDF9] cursor-pointer text-xs font-bold text-[#5C6E58] transition-all has-[:checked]:bg-[#3A2A1A] has-[:checked]:text-white">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-[#1B3B2B] mb-1">Guest / Family Name <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="e.g. Vikramaditya Rathore" class="w-full px-4 py-3 rounded-xl border border-[#A67C3D]/50 bg-[#F4EDE0] text-xs text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#1B3B2B] mb-1">Mobile / WhatsApp <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 98765 43210" class="w-full px-4 py-3 rounded-xl border border-[#A67C3D]/50 bg-[#F4EDE0] text-xs text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-xs font-semibold text-[#1B3B2B] mb-1">Number of Family Members Attending</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#A67C3D]/50 bg-[#F4EDE0] text-xs text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Persons</option>
            <option value="3">3 Persons</option>
            <option value="4">4 Persons</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#1B3B2B] mb-1">Blessing Message (शुभकामना संदेश)</label>
          <textarea name="wishes" rows="3" placeholder="Sada Saubhagyavati Bhav..." class="w-full px-4 py-2.5 rounded-xl border border-[#A67C3D]/50 bg-[#F4EDE0] text-xs text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#F7F0DD] shadow-lg transition-all cursor-pointer" style="background: linear-gradient(135deg, #1B3B2B 0%, #0D2118 100%); border: 1px solid #A67C3D;">
          Submit Jharokha RSVP ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#1B3B2B; color:#A67C3D; border:2px solid #A67C3D; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px; font-weight:bold;">
          ✓
        </div>
        <h3 class="text-2xl text-[#1B3B2B] font-bold mb-2 font-serif">
          कृतज्ञता / RSVP Received
        </h3>
        <p class="text-xs text-[#1B3B2B] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
      </div>
    </div>
  </div>
</section>
`;

    case 'mayura':
      return `
<!-- 🦚 THE MAYURA PEACOCK TEAL RSVP SECTION -->
<section id="rsvp" class="myr-rsvp relative scroll-mt-16 overflow-hidden px-6 py-20 text-[#0F2B48]" style="background: #EAF2F7; border-top: 2px solid #D4AF37;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div>
      <span class="text-xs uppercase tracking-[0.2em] font-mono text-[#2C3E5C] font-bold">॥ मयूर स्वागतम् ॥</span>
      <h2 class="text-3xl sm:text-4xl text-[#0F2B48] font-bold mt-1 font-serif" style="font-family: 'Playfair Display', serif;">
        Reserve Your Presence
      </h2>
      <p class="text-xs text-[#4A6785]">
        Please confirm your attendance for the royal peacock celebration.
      </p>
    </div>

    <div class="bg-[#FAFDFE] p-6 sm:p-10 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl text-left">
      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#0F2B48] mb-2 font-mono">
            Will you be joining us?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#0F2B48] bg-[#E1EEF6] cursor-pointer text-xs font-bold text-[#0F2B48] transition-all has-[:checked]:bg-[#0F2B48] has-[:checked]:text-white">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>🦚 Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#B0C8D9] bg-white cursor-pointer text-xs font-bold text-[#6B7D8C] transition-all has-[:checked]:bg-[#2C3E5C] has-[:checked]:text-white">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-[#0F2B48] mb-1">Your Full Name <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="e.g. Manish & Neha Mehta" class="w-full px-4 py-3 rounded-xl border border-[#B0C8D9] bg-[#EAF2F7] text-xs text-[#0F2B48] focus:outline-none focus:ring-2 focus:ring-[#0F2B48]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#0F2B48] mb-1">Mobile Number <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 94093 60336" class="w-full px-4 py-3 rounded-xl border border-[#B0C8D9] bg-[#EAF2F7] text-xs text-[#0F2B48] focus:outline-none focus:ring-2 focus:ring-[#0F2B48]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-xs font-semibold text-[#0F2B48] mb-1">Attendees Count</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#B0C8D9] bg-[#EAF2F7] text-xs text-[#0F2B48] focus:outline-none focus:ring-2 focus:ring-[#0F2B48]">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Persons</option>
            <option value="3">3 Persons</option>
            <option value="4">4 Persons</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#0F2B48] mb-1">Wishes for Couple</label>
          <textarea name="wishes" rows="3" placeholder="Send your congratulations & love..." class="w-full px-4 py-2.5 rounded-xl border border-[#B0C8D9] bg-[#EAF2F7] text-xs text-[#0F2B48] focus:outline-none focus:ring-2 focus:ring-[#0F2B48] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#FFFDF5] shadow-lg transition-all cursor-pointer" style="background: linear-gradient(135deg, #0F2B48 0%, #051829 100%); border: 1px solid #D4AF37;">
          Submit Mayura RSVP ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#0F2B48; color:#D4AF37; border:2px solid #D4AF37; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px; font-weight:bold;">
          ✓
        </div>
        <h3 class="text-2xl text-[#0F2B48] font-bold mb-2 font-serif">
          Mayura RSVP Received
        </h3>
        <p class="text-xs text-[#0F2B48] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
      </div>
    </div>
  </div>
</section>
`;

    case 'jodi':
      return `
<!-- 💑 THE SHUBH JODI FESTIVE THAALI RSVP SECTION -->
<section id="rsvp" class="jdi-rsvp relative scroll-mt-16 overflow-hidden px-6 py-20 text-[#3D1E3A]" style="background: #FDF4EB; border-top: 2px solid #C59B4B;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div>
      <span class="text-xs uppercase tracking-[0.2em] font-mono text-[#A67C3D] font-bold">॥ शुभ विवाह उपस्थिति ॥</span>
      <h2 class="text-3xl sm:text-4xl text-[#6B1420] font-bold mt-1 font-serif" style="font-family: 'Playfair Display', serif;">
        R.S.V.P &amp; Shubhkaamnayein
      </h2>
      <p class="text-xs text-[#7A4B6E]">
        Please RSVP so we can set a celebratory thali for you and your family!
      </p>
    </div>

    <div class="bg-[#FFFDFC] p-6 sm:p-10 rounded-3xl border-2 border-[#C59B4B]/40 shadow-xl text-left">
      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#6B1420] mb-2 font-mono">
            Will you grace the festivities?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#6B1420] bg-[#F7E7C4] cursor-pointer text-xs font-bold text-[#6B1420] transition-all has-[:checked]:bg-[#6B1420] has-[:checked]:text-[#F7E7C4]">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>🎉 Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#D8C7AA] bg-white cursor-pointer text-xs font-bold text-[#7A4B6E] transition-all has-[:checked]:bg-[#3D1E3A] has-[:checked]:text-white">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-[#3D1E3A] mb-1">Full Name <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="e.g. Ramesh & Geeta Shah" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FDF4EB] text-xs text-[#3D1E3A] focus:outline-none focus:ring-2 focus:ring-[#6B1420]" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#3D1E3A] mb-1">Phone Number <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 98250 54321" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FDF4EB] text-xs text-[#3D1E3A] focus:outline-none focus:ring-2 focus:ring-[#6B1420]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-xs font-semibold text-[#3D1E3A] mb-1">Number of Attendees</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#D8C7AA] bg-[#FDF4EB] text-xs text-[#3D1E3A] focus:outline-none focus:ring-2 focus:ring-[#6B1420]">
            <option value="1">1 Person</option>
            <option value="2" selected>2 Persons</option>
            <option value="3">3 Persons</option>
            <option value="4">4 Persons</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#3D1E3A] mb-1">Wishes &amp; Congratulations</label>
          <textarea name="wishes" rows="3" placeholder="Wishing the golden couple eternal happiness..." class="w-full px-4 py-2.5 rounded-xl border border-[#D8C7AA] bg-[#FDF4EB] text-xs text-[#3D1E3A] focus:outline-none focus:ring-2 focus:ring-[#6B1420] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest text-[#F7E7C4] shadow-lg transition-all cursor-pointer" style="background: linear-gradient(135deg, #6B1420 0%, #4A0E17 100%); border: 1px solid #C59B4B;">
          Submit Festive RSVP ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#6B1420; color:#F7E7C4; border:2px solid #C59B4B; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px; font-weight:bold;">
          ✓
        </div>
        <h3 class="text-2xl text-[#6B1420] font-bold mb-2 font-serif">
          Shubh Vivah RSVP Confirmed
        </h3>
        <p class="text-xs text-[#3D1E3A] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
      </div>
    </div>
  </div>
</section>
`;

    case 'dak':
      return `
<!-- 💌 THE SHAHI DÂK VINTAGE POSTAL TELEGRAM RSVP SECTION -->
<section id="rsvp" class="dak-rsvp relative scroll-mt-16 overflow-hidden px-6 py-20 text-[#3A2A18]" style="background: #EFE3C8; border-top: 2px dashed #8B7358;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div>
      <span class="text-xs uppercase tracking-[0.25em] font-mono text-[#8A6526] font-bold">॥ शाही डाक तार प्रेषण ॥</span>
      <h2 class="text-3xl sm:text-4xl text-[#3E2612] font-bold mt-1 font-serif" style="font-family: 'Courier New', Georgia, serif;">
        TELEGRAM RSVP &amp; DISPATCH
      </h2>
      <p class="text-xs text-[#6B5A4A] font-mono">
        Return your telegram confirmation to the Royal Head Post Office.
      </p>
    </div>

    <div class="bg-[#F8EFE0] p-6 sm:p-10 rounded-3xl border-2 border-[#8A6526] shadow-xl text-left relative" style="background-image: radial-gradient(#8A6526 0.5px, transparent 0.5px); background-size: 16px 16px;">
      <!-- Postal Stamp Seal -->
      <div class="absolute top-4 right-4 border-2 border-dashed border-[#8A6526] px-2 py-1 text-[9px] font-mono text-[#8A6526] uppercase font-bold rotate-6">
        STAMP · ₹5.00
      </div>

      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#3E2612] mb-2 font-mono">
            DISPATCH INSTRUCTION:
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-[#8A6526] bg-[#EFE3C8] cursor-pointer text-xs font-bold font-mono text-[#3E2612] transition-all has-[:checked]:bg-[#3E2612] has-[:checked]:text-[#F8EFE0]">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>📮 YES, WILL ATTEND</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-[#8B7358] bg-[#F8EFE0] cursor-pointer text-xs font-bold font-mono text-[#6B5A4A] transition-all has-[:checked]:bg-[#7C2230] has-[:checked]:text-white">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>🕊️ CANNOT ATTEND</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-[#3E2612] mb-1">GUEST NAME <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="Mr. / Mrs. Family Name" class="w-full px-4 py-3 rounded-xl border border-[#8A6526] bg-[#EFE3C8] text-xs font-mono text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#3E2612]" />
          </div>
          <div>
            <label class="block text-xs font-mono font-bold text-[#3E2612] mb-1">CONTACT / TELEPHONE <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 94093 60336" class="w-full px-4 py-3 rounded-xl border border-[#8A6526] bg-[#EFE3C8] text-xs font-mono text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#3E2612]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-xs font-mono font-bold text-[#3E2612] mb-1">HEADCOUNT ENTOURAGE</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#8A6526] bg-[#EFE3C8] text-xs font-mono text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#3E2612]">
            <option value="1">1 Person (Solo)</option>
            <option value="2" selected>2 Persons (Duo)</option>
            <option value="3">3 Persons (Trio)</option>
            <option value="4">4 Persons (Family)</option>
            <option value="5">5+ Persons</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-mono font-bold text-[#3E2612] mb-1">TELEGRAPHIC WISHES &amp; GREETING</label>
          <textarea name="wishes" rows="3" placeholder="CONGRATULATIONS STOP WISHING JOY AND PROSPERITY STOP" class="w-full px-4 py-2.5 rounded-xl border border-[#8A6526] bg-[#EFE3C8] text-xs font-mono text-[#3E2612] focus:outline-none focus:ring-2 focus:ring-[#3E2612] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-2xl font-mono font-bold text-xs uppercase tracking-widest text-[#F8EFE0] shadow-lg transition-all cursor-pointer" style="background: #3E2612; border: 2px solid #8A6526;">
          DISPATCH TELEGRAM RSVP ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:52px; height:52px; background:#3E2612; color:#EFE3C8; border:2px solid #8A6526; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:24px; font-weight:bold;">
          ✓
        </div>
        <h3 class="text-2xl text-[#3E2612] font-bold mb-2 font-mono">
          TELEGRAM TRANSMITTED
        </h3>
        <p class="text-xs font-mono text-[#3E2612] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
      </div>
    </div>
  </div>
</section>
`;

    case 'ivory':
      return `
<!-- 🤍 THE IVORY MINIMALIST EDITORIAL RSVP SECTION -->
<section id="rsvp" class="ivory-rsvp relative scroll-mt-16 overflow-hidden px-6 py-20 text-[#111111]" style="background: #FAF9F6; border-top: 1px solid #E5E5E5;">
  <div class="max-w-2xl mx-auto text-center space-y-6">
    <div>
      <span class="text-[10px] uppercase tracking-[0.3em] font-mono text-[#999999] font-bold">R.S.V.P</span>
      <h2 class="text-3xl sm:text-4xl text-[#111111] font-light mt-1 tracking-tight" style="font-family: 'Playfair Display', Georgia, serif;">
        Will you be joining us?
      </h2>
      <p class="text-xs text-[#666666]">
        Please let us know by submitting your confirmation below.
      </p>
    </div>

    <div class="bg-[#FFFFFF] p-6 sm:p-10 rounded-2xl border border-[#E0E0E0] shadow-sm text-left">
      <form class="shahi-rsvp-form space-y-5" data-shahi-rsvp="true">
        <div>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#111111] bg-[#111111] cursor-pointer text-xs font-medium text-[#FFFFFF] transition-all has-[:checked]:bg-[#111111] has-[:checked]:text-[#FFFFFF]">
              <input type="radio" name="attending" value="true" checked class="hidden" />
              <span>Yes, I'll Attend</span>
            </label>
            <label class="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#E0E0E0] bg-[#FFFFFF] cursor-pointer text-xs font-medium text-[#777777] transition-all has-[:checked]:bg-[#F0F0F0] has-[:checked]:text-[#111111]">
              <input type="radio" name="attending" value="false" class="hidden" />
              <span>Sorry, Can't Attend</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[#444444] mb-1">Your Name <span class="text-rose-600">*</span></label>
            <input type="text" name="guest_name" required placeholder="Full Name" class="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]" />
          </div>
          <div>
            <label class="block text-[11px] font-medium uppercase tracking-wider text-[#444444] mb-1">Mobile / WhatsApp <span class="text-rose-600">*</span></label>
            <input type="tel" name="guest_phone" required placeholder="+91 94093 60336" class="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]" />
          </div>
        </div>

        <div class="rsvp-attendees-group">
          <label class="block text-[11px] font-medium uppercase tracking-wider text-[#444444] mb-1">Number of Guests</label>
          <select name="attendees_count" class="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]">
            <option value="1">1 Guest</option>
            <option value="2" selected>2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5+ Guests</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-medium uppercase tracking-wider text-[#444444] mb-1">Blessing or Note</label>
          <textarea name="wishes" rows="3" placeholder="Leave a message for the couple..." class="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111] resize-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-widest text-[#FFFFFF] bg-[#111111] hover:bg-[#333333] transition-all cursor-pointer">
          Submit Response ➜
        </button>
      </form>

      <div class="rsvp-success-card" style="display:none; text-align:center; padding: 24px 12px;">
        <div style="width:48px; height:48px; background:#111111; color:#FFFFFF; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:20px;">
          ✓
        </div>
        <h3 class="text-2xl text-[#111111] font-light mb-2 font-serif">
          Thank you.
        </h3>
        <p class="text-xs text-[#666666] max-w-md mx-auto leading-relaxed mb-4">
          Your RSVP has been received. We look forward to celebrating with you.
        </p>
      </div>
    </div>
  </div>
</section>
`;

    default:
      return '';
  }
}

// Process all 7 templates
const themeKeys = [
  { dir: 'rajmahal-template', key: 'rajmahal' },
  { dir: 'royaldawn-template', key: 'royaldawn' },
  { dir: 'jharokha-template', key: 'jharokha' },
  { dir: 'mayura-template', key: 'mayura' },
  { dir: 'jodi-template', key: 'jodi' },
  { dir: 'dak-template', key: 'dak' },
  { dir: 'ivory-template', key: 'ivory' },
];

let updatedCount = 0;

themeKeys.forEach(({ dir, key }) => {
  const filePath = path.join(templatesDir, dir, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error('Missing file:', filePath);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf-8');
  const newRsvpHtml = getTemplateRsvpHtml(key);

  // Replace existing <section id="rsvp">...</section>
  const rsvpRegex = /<section[^>]*id=["']rsvp["'][^>]*>[\s\S]*?<\/section>/i;

  if (rsvpRegex.test(html)) {
    html = html.replace(rsvpRegex, newRsvpHtml);
  } else {
    // If not found, insert before </body>
    html = html.replace('</body>', `${newRsvpHtml}\n</body>`);
  }

  // Ensure <script src="../shared-rsvp.js"></script> is included before </body>
  if (!html.includes('shared-rsvp.js')) {
    html = html.replace('</body>', `<script src="../shared-rsvp.js"></script>\n</body>`);
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ [${key}] Integrated interactive RSVP section in ${dir}/index.html`);
  updatedCount++;
});

console.log(`\n🎉 Successfully integrated RSVP into all ${updatedCount}/7 wedding templates!`);
