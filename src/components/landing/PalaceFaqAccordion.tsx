import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, HelpCircle, Sparkles, Search, MessageCircle, 
  Phone, CheckCircle2, ArrowRight, Layers, Music, Users, 
  MapPin, Share2, ShieldCheck, RefreshCw, ThumbsUp 
} from 'lucide-react';
import { RoyalCrestIcon } from '../ShahiIcons';

interface FaqItem {
  id: string;
  category: 'general' | 'themes' | 'media' | 'rsvp' | 'sharing';
  icon: React.ReactNode;
  q: string;
  qHi: string;
  a: string;
  highlights: string[];
  badge?: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    icon: <Layers className="w-4 h-4 text-[#C49A35]" />,
    badge: 'Guest Experience',
    q: 'How do guests open and experience the royal invitation?',
    qHi: '॥ मेहमान आमंत्रण कैसे देख पाएंगे? ॥',
    a: 'Guests simply click your personalized wedding link on WhatsApp or scan your golden invitation QR code. The invitation loads instantaneously in any mobile browser (iPhone & Android) with cinematic 3D opening palace gates, gold foil shimmer, and immersive shehnai music — without requiring any app download or login.',
    highlights: [
      'Zero app downloads required — opens in any mobile browser',
      'Instant loading with smooth 3D palace gate entrance',
      'Works seamlessly on 4G, 5G, and Wi-Fi networks worldwide',
    ],
  },
  {
    id: 'faq-2',
    category: 'general',
    icon: <RefreshCw className="w-4 h-4 text-[#C49A35]" />,
    badge: 'Unlimited Re-edits',
    q: 'Can I edit wedding dates, venue, or photos after publishing?',
    qHi: '॥ क्या पब्लिश करने के बाद भी तारीख या फोटो बदल सकते हैं? ॥',
    a: 'Yes, absolutely! You have unlimited free re-edits at any time. Simply log in to your couple account, update your muhurat, events, venue GPS coordinates, or photo gallery, and click Save. All existing guest links and WhatsApp shared cards update in real time instantly without changing your invitation URL.',
    highlights: [
      'Lifetime unlimited re-edits included at no extra cost',
      'Instant real-time update across all shared links',
      'Same unique URL remains active — no need to re-share',
    ],
  },
  {
    id: 'faq-3',
    category: 'themes',
    icon: <Sparkles className="w-4 h-4 text-[#C49A35]" />,
    badge: 'Heirloom Design',
    q: 'What is included in the 7 Royal Wedding Themes?',
    qHi: '॥ सातों शाही थीम्स में क्या-क्या विशेषताएं हैं? ॥',
    a: 'Each of our 7 templates is an architectural heirloom inspired by royal Indian palaces — featuring 3D animated gates, trilingual Vedic scriptures (English, हिन्दी, ગુજરાતી), custom monograms, auspicious countdown timers, interactive mangal rasam events, and high-fashion editorial photo layouts.',
    highlights: [
      '3D Interactive Palace Gates & Parallax Architecture',
      'Trilingual Vivah Engine (EN, HI, GU) with Sanskrit Shlokas',
      'Gold Scratch-Heart Blessing Cards & Auspicious Muhurat Clock',
    ],
  },
  {
    id: 'faq-4',
    category: 'media',
    icon: <Music className="w-4 h-4 text-[#C49A35]" />,
    badge: 'Music & Audio',
    q: 'Can I add our own family song or background shehnai music?',
    qHi: '॥ क्या हम अपना खुद का गाना या शुभ शहनाई संगीत जोड़ सकते हैं? ॥',
    a: 'Yes! Every theme includes curated studio-mastered Vedic Shehnai, Flute, and Sitar ragas by default. You can also upload your own favorite MP3 audio song or pre-wedding track with automatic gentle audio autoplay and mute controls.',
    highlights: [
      'Pre-loaded with authentic studio-mastered royal shehnai ragas',
      '1-Click MP3 upload for personal family/couple songs',
      'Discreet floating audio controller for guest volume comfort',
    ],
  },
  {
    id: 'faq-5',
    category: 'rsvp',
    icon: <Users className="w-4 h-4 text-[#C49A35]" />,
    badge: 'RSVP Intelligence',
    q: 'How does the Live RSVP & Guest Headcount tracking work?',
    qHi: '॥ लाइव RSVP व मेहमानों की गिनती कैसे होती है? ॥',
    a: 'Your invitation includes a dedicated royal RSVP section. When guests submit their attendance, family member headcount, phone number, and warm blessings, your Couple Dashboard updates in real time. You can view attending counts and export an organized Excel/CSV spreadsheet for your caterer and venue planners with 1 click.',
    highlights: [
      'Real-time headcount calculations (Attending vs Regrets)',
      '1-Click CSV/Excel spreadsheet export for catering planning',
      'Direct WhatsApp thank-you dispatch to confirmed guests',
    ],
  },
  {
    id: 'faq-6',
    category: 'sharing',
    icon: <MapPin className="w-4 h-4 text-[#C49A35]" />,
    badge: 'GPS Navigation',
    q: 'How do guests navigate to our wedding venue?',
    qHi: '॥ क्या मेहमानों को गूगल मैप्स नेविगेशन मिलेगा? ॥',
    a: 'Every event ceremony (Haldi, Mehendi, Sangeet, Vivah, Reception) features a built-in 1-Tap Google Maps GPS button. When guests tap it on their mobile phone, Google Maps or Apple Maps opens directly with turn-by-turn driving directions right to your venue entrance gate.',
    highlights: [
      '1-Tap GPS route directly to venue gates',
      'Separate Google Maps pins for different event venues',
      'Venue address and landmark directions clearly displayed',
    ],
  },
  {
    id: 'faq-7',
    category: 'sharing',
    icon: <Share2 className="w-4 h-4 text-[#C49A35]" />,
    badge: 'WhatsApp Dispatch',
    q: 'How does WhatsApp invitation sharing work?',
    qHi: '॥ व्हाट्सएप आमंत्रण शेयरिंग कैसे काम करती है? ॥',
    a: 'Your studio generates high-definition preview cards with couple names and wedding dates that you can dispatch directly to WhatsApp contacts, family groups, and broadcast lists with a single click. A high-resolution golden QR code is also provided for physical print cards.',
    highlights: [
      'Rich WhatsApp thumbnail card preview with custom text',
      'One-click instant dispatch to family & WhatsApp groups',
      'Vector golden QR code included for physical printing',
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: '✦ All Questions', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'general', label: '🏰 Experience & Edits', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'media', label: '🎵 Music & Photos', icon: <Music className="w-3.5 h-3.5" /> },
  { id: 'rsvp', label: '💌 Live RSVP & Headcounts', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'sharing', label: '📱 WhatsApp & GPS', icon: <Share2 className="w-3.5 h-3.5" /> },
];

export const PalaceFaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>('faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const handleFeedback = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHelpfulFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
      const qLower = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !qLower ||
        faq.q.toLowerCase().includes(qLower) ||
        faq.qHi.toLowerCase().includes(qLower) ||
        faq.a.toLowerCase().includes(qLower) ||
        (faq.badge && faq.badge.toLowerCase().includes(qLower));

      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-8 max-w-5xl mx-auto w-full font-manrope">
      
      {/* 👑 Section Top Brand Tag & Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5AD]/60 border border-[#C49A35]/50 text-[#6E1020] text-xs font-manrope font-semibold tracking-wider uppercase shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>ROYAL KNOWLEDGE BASE &amp; FAQ</span>
        </div>

        <h2 className="font-cormorant font-bold text-3xl sm:text-5xl text-[#6E1020] tracking-tight">
          EVERYTHING YOU NEED TO KNOW
        </h2>

        <p className="text-sm sm:text-base text-[#75675C] font-normal max-w-xl mx-auto leading-relaxed">
          Clear, transparent answers about our royal themes, custom links, guest RSVPs, and live hosting.
        </p>

        {/* 🔍 Interactive Instant Search Bar */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#A67C3D] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers (e.g. music, rsvp, map directions, edits)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] hover:border-[#C49A35] focus:border-[#6E1020] text-xs sm:text-sm font-medium text-[#241A17] outline-none shadow-xs focus:ring-2 focus:ring-[#C49A35]/20 transition-all placeholder:text-[#75675C]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-xs text-[#75675C] hover:text-[#6E1020] bg-[#F8F3E8] w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 🏷️ Interactive Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery('');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-manrope font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id && !searchQuery
                  ? 'bg-[#6E1020] text-[#FFFDF8] shadow-sm border border-[#C49A35]'
                  : 'bg-[#F8F3E8] text-[#241A17] border border-[#E8D5AD] hover:bg-[#FFFDF8] hover:border-[#C49A35]/60'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🏰 Luxury Palace Accordion Cards List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === faq.id;
            const isHelpful = helpfulFeedback[faq.id];

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FFFDF8] border-[#C49A35] shadow-md ring-1 ring-[#C49A35]/30'
                    : 'bg-[#FFFDF8]/80 hover:bg-[#FFFDF8] border-[#E8D5AD] hover:border-[#C49A35]/60 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Left Icon Pill */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-200 ${
                      isOpen
                        ? 'bg-[#6E1020] text-[#C49A35] border-[#C49A35]'
                        : 'bg-[#F8F3E8] text-[#6E1020] border-[#E8D5AD] group-hover:border-[#C49A35]'
                    }`}>
                      {faq.icon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#C49A35] font-serif font-bold tracking-wide">
                          {faq.qHi}
                        </span>
                        {faq.badge && (
                          <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#F8F3E8] border border-[#E8D5AD] text-[#75675C]">
                            {faq.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="font-cormorant font-bold text-lg sm:text-xl text-[#430914] group-hover:text-[#6E1020] transition-colors leading-snug">
                        {faq.q}
                      </h3>
                    </div>
                  </div>

                  {/* Expand Chevron Pill */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 border ${
                    isOpen
                      ? 'bg-[#6E1020] text-[#FFFDF8] border-[#C49A35] rotate-180'
                      : 'bg-[#F8F3E8] text-[#430914] border-[#E8D5AD] group-hover:border-[#C49A35]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Smooth Expand Body with Highlights */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-[#241A17]/90 font-normal leading-relaxed border-t border-[#E8D5AD]/50 animate-in fade-in duration-200 space-y-4">
                    <p className="leading-relaxed text-[#241A17]/85">
                      {faq.a}
                    </p>

                    {/* 3 Key Takeaways Highlights */}
                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F8F3E8] border border-[#E8D5AD]/70 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#6E1020] block">
                          ✦ Royal Guarantee &amp; Highlights:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#241A17]">
                          {faq.highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#167A5A] shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Micro Action: Helpful Feedback */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#75675C] border-t border-[#E8D5AD]/40">
                      <span>Was this answer helpful?</span>
                      {isHelpful ? (
                        <span className="text-[#167A5A] font-semibold flex items-center gap-1">
                          ✓ Thank you for your feedback!
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleFeedback(e, faq.id)}
                          className="inline-flex items-center gap-1 text-[#6E1020] hover:text-[#430914] font-semibold px-2 py-1 rounded bg-[#F8F3E8] border border-[#E8D5AD] hover:border-[#C49A35] transition-colors cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3 text-[#C49A35]" />
                          <span>Yes, Helpful</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-[#FFFDF8] rounded-2xl border border-[#E8D5AD] space-y-3">
            <HelpCircle className="w-8 h-8 text-[#C49A35] mx-auto opacity-70" />
            <p className="text-sm font-medium text-[#430914]">
              No questions found matching "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs font-semibold text-[#6E1020] underline hover:text-[#430914]"
            >
              Clear search and view all FAQs
            </button>
          </div>
        )}
      </div>

      {/* 👑 Royal Concierge VIP Support Card */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFFDF8] to-[#F8F3E8] border-2 border-[#E8D5AD] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <RoyalCrestIcon className="w-4 h-4 text-[#C49A35]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C49A35] font-bold">
              SHAHI CONCIERGE DESK
            </span>
          </div>
          <h4 className="font-cormorant font-bold text-xl sm:text-2xl text-[#430914]">
            Have a custom theme or wedding requirement?
          </h4>
          <p className="text-xs text-[#75675C]">
            Our bespoke royal invitation designers are available on WhatsApp to assist you immediately.
          </p>
          <div className="text-[11px] font-mono text-[#167A5A] font-semibold flex items-center justify-center sm:justify-start gap-1 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#167A5A] animate-pulse" />
            <span>Dedicated Royal Concierge Online · Replies within 15 mins</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="https://wa.me/919409360336?text=Namaste%20Shahi%20Studio,%20I%20have%20a%20question%20about%20Royal%20Kankotri%20digital%20invitations."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-manrope font-semibold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href="tel:+919409360336"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F8F3E8] hover:bg-[#FFFDF8] text-[#430914] border border-[#E8D5AD] hover:border-[#C49A35] font-manrope font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>+91 9409360336</span>
          </a>
        </div>
      </div>

    </section>
  );
};

export default PalaceFaqAccordion;
