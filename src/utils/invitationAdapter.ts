/**
 * 👑 AMANTRANLINK UNIVERSAL INVITATION DATA ADAPTER & DOM SYNCHRONIZER
 * Single pipeline transforming raw database/state records into dynamic templates.
 */

import { WeddingProjectState, ThemeId, WeddingTypography, FontPresetId, DigitalShagun, AuspiciousBlessing, PhotoFilterType } from '../types/wedding';
import { NormalizedInvitationData } from '../types/invitation';

export const getFilterStyle = (filter?: PhotoFilterType): string => {
  if (!filter || filter === 'none') return 'none';
  if (filter === 'gold-glow') return 'sepia(35%) saturate(140%) brightness(105%) contrast(105%)';
  if (filter === 'vintage') return 'sepia(60%) contrast(110%) brightness(95%) saturate(90%)';
  if (filter === 'rose-blush') return 'saturate(120%) brightness(105%) hue-rotate(-10deg) contrast(102%)';
  if (filter === 'monochrome') return 'grayscale(100%) contrast(120%) brightness(100%)';
  return 'none';
};

export const DEFAULT_TYPOGRAPHY: WeddingTypography = {
  preset: 'raj-darbar',
  coupleFont: 'Cinzel Decorative',
  headingsFont: 'Cinzel',
  bodyFont: 'Cormorant Garamond',
  auspiciousFont: 'Rozha One',
};

export const FONT_PRESETS: Record<FontPresetId, { name: string; coupleFont: string; headingsFont: string; bodyFont: string; auspiciousFont: string; description: string }> = {
  'raj-darbar': {
    name: '👑 The Raj Darbar',
    coupleFont: 'Cinzel Decorative',
    headingsFont: 'Cinzel',
    bodyFont: 'Cormorant Garamond',
    auspiciousFont: 'Rozha One',
    description: 'Grand imperial palatial serif with carved royal symmetry',
  },
  'vintage-romance': {
    name: '✒️ Vintage Romance',
    coupleFont: 'Great Vibes',
    headingsFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    auspiciousFont: 'Tiro Devanagari Hindi',
    description: 'Romantic flowing calligraphy script with timeless elegance',
  },
  'royal-calligraphy': {
    name: '📜 Shahi Signature',
    coupleFont: 'Alex Brush',
    headingsFont: 'Marcellus',
    bodyFont: 'Plus Jakarta Sans',
    auspiciousFont: 'Gotu',
    description: 'Delicate signature script paired with crisp stone inscription',
  },
  'vedic-heritage': {
    name: '🪔 Vedic Heritage',
    coupleFont: 'Rozha One',
    headingsFont: 'Yatra One',
    bodyFont: 'Tiro Devanagari Hindi',
    auspiciousFont: 'Rozha One',
    description: 'Authentic Indian royal temple Devanagari aesthetics',
  },
  'modern-luxury': {
    name: '✨ Modern Vogue',
    coupleFont: 'Bodoni Moda',
    headingsFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    auspiciousFont: 'Gotu',
    description: 'High-fashion editorial aesthetic inspired by luxury fashion journals',
  },
  'custom': {
    name: '🎨 Custom Blend',
    coupleFont: 'Cinzel Decorative',
    headingsFont: 'Cinzel',
    bodyFont: 'Cormorant Garamond',
    auspiciousFont: 'Rozha One',
    description: 'Your bespoke combination of royal fonts',
  },
};

export const AUSPICIOUS_SHLOKAS: Record<string, { label: string; text: string; meaning: string }> = {
  ganesh: {
    label: '॥ श्री गणेशाय नमः ॥',
    text: '॥ ॐ श्री गणेशाय नमः ॥\nवक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    meaning: 'O Lord Ganesha, of curved trunk and immense aura, bless this holy matrimony free of all obstacles.',
  },
  vakratunda: {
    label: '॥ मंगलम् भगवान विष्णुः ॥',
    text: 'मंगलम् भगवान विष्णुः मंगलम् गरुडध्वजः।\nमंगलम् पुण्डरीकाक्षः मंगलाय तनो हरिः॥',
    meaning: 'All auspiciousness to Lord Vishnu, auspiciousness to Him whose flag bears Garuda, auspiciousness for eternal grace.',
  },
  mangalyam: {
    label: '॥ मांगल्यं तन्तुनानेन ॥',
    text: 'मांगल्यं तन्तुनानेन मम जीवनहेतुना।\nकंठे बध्नामि शुभगे त्वं जीव शरदः शतम्॥',
    meaning: 'This sacred thread is the symbol of my life; I tie it around your neck, O fortunate one, may you live a hundred years with me.',
  },
  radhakrishna: {
    label: '॥ राधे कृष्ण ॥',
    text: 'प्रेम स्वरूप श्री राधा कृष्ण कृपा कटाक्ष।\nअखण्ड सौभाग्य एवं सुख समृद्धि भवतु॥',
    meaning: 'With divine blessings of eternal divine love, grace and joyful companionship.',
  },
};

/**
 * 1. Parse target wedding date string into Unix millisecond timestamp
 */
export const parseWeddingDateToTimestamp = (rawDateStr?: string): number => {
  if (!rawDateStr || !rawDateStr.trim()) {
    const nextYear = new Date().getFullYear() + 1;
    return new Date(nextYear, 11, 10, 18, 30, 0).getTime();
  }

  const monthsMap: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
    apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
    aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
    nov: 10, november: 10, dec: 11, december: 11
  };

  // e.g. "10 December 2026" or "10 Dec 2026"
  const textMatch = rawDateStr.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3], 10);
    const month = monthsMap[monthKey] ?? 11;
    
    let hours = 18;
    let mins = 30;
    const timeMatch = rawDateStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hours = h;
      mins = m;
    }
    return new Date(year, month, day, hours, mins, 0).getTime();
  }

  // e.g. "2026-12-10"
  const isoMatch = rawDateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day, 18, 30, 0).getTime();
  }

  const clean = rawDateStr.split('·')[0].split('(')[0].trim();
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) return parsed;

  const now = new Date();
  return new Date(now.getFullYear() + 1, 11, 10, 18, 30, 0).getTime();
};

/**
 * 2. Normalize raw project state or database record into common data contract
 */
export const normalizeInvitationData = (
  raw: any,
  overrideSlug?: string,
  siteId?: string,
  studioBadge?: string
): NormalizedInvitationData => {
  const content = raw?.content || raw || {};
  const couple = content.couple || {};
  const family = content.family || {};
  const events = content.events || [];
  const media = content.media || {};
  const rsvpConfig = content.rsvpConfig || {};

  const groomName = (couple.groomEn || couple.groom || 'Groom').trim();
  const brideName = (couple.brideEn || couple.bride || 'Bride').trim();

  const groomInitial = (groomName.charAt(0) || 'G').toUpperCase();
  const brideInitial = (brideName.charAt(0) || 'B').toUpperCase();

  const lang = (content.language || 'en') as 'en' | 'hi' | 'gu';
  let coupleDisplayName = `${groomName} & ${brideName}`;
  if (lang === 'hi') {
    coupleDisplayName = `${couple.groomHi || groomName} एवं ${couple.brideHi || brideName}`;
  } else if (lang === 'gu') {
    coupleDisplayName = `${couple.groomGu || groomName} અને ${couple.brideGu || brideName}`;
  }

  const rawDate = couple.weddingDate || '10 December 2026 · 06:30 PM';
  const targetMs = parseWeddingDateToTimestamp(rawDate);
  const venue = (couple.venueName || 'Royal Palace Banquet').trim();

  const derivedSlug = overrideSlug || raw?.slug || raw?.published_url || 
    `${groomName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  return {
    invitationId: siteId || raw?.id || raw?.siteId || `inv_${Date.now()}`,
    slug: derivedSlug,
    themeId: (raw?.templates?.slug || content.theme || raw?.template_id || 'rajmahal') as ThemeId,
    language: lang,
    bride: {
      name: brideName,
      nameHi: couple.brideHi,
      nameGu: couple.brideGu,
      fullName: couple.brideFullName || brideName,
      parentsEn: family.brideParentsEn || 'Royal Family',
      parentsHi: family.brideParentsHi,
      parentsGu: family.brideParentsGu,
      photoUrl: media.photoSlots?.bride?.url || media.photoSlots?.bride_portrait?.url,
    },
    groom: {
      name: groomName,
      nameHi: couple.groomHi,
      nameGu: couple.groomGu,
      fullName: couple.groomFullName || groomName,
      parentsEn: family.groomParentsEn || 'Royal Family',
      parentsHi: family.groomParentsHi,
      parentsGu: family.groomParentsGu,
      photoUrl: media.photoSlots?.groom?.url || media.photoSlots?.groom_portrait?.url,
    },
    coupleDisplayName,
    monogramDot: couple.mark || `${groomInitial} · ${brideInitial}`,
    monogramAmp: `${groomInitial} & ${brideInitial}`,
    monogramPlus: `${groomInitial} + ${brideInitial}`,
    hashtag: couple.hashtag || `#${groomName}Weds${brideName}`,
    wedding: {
      rawDate,
      formattedDate: rawDate,
      muhuratTime: couple.muhuratTime || '06:30 PM',
      venueName: venue,
      venueAddress: couple.venueAddress || venue,
      city: couple.venueAddress || venue,
      mapUrl: couple.mapUrl || 'https://maps.google.com',
      targetTimestampMs: targetMs,
      customNote: couple.customNote,
    },
    events: Array.isArray(events) && events.length > 0 ? events : [
      { id: '1', name: '💛 Grand Sangeet', date: '9 December 2026', time: '07:00 PM', venue, color: 'purple' },
      { id: '2', name: '💍 Shubh Vivah', date: '10 December 2026', time: '06:30 PM', venue, color: 'gold' },
      { id: '3', name: '🥂 Royal Reception', date: '11 December 2026', time: '08:00 PM', venue, color: 'red' },
    ],
    family: {
      groomParents: family.groomParentsEn || 'Royal Family',
      brideParents: family.brideParentsEn || 'Royal Family',
      rsvp1Name: family.rsvp1Name || groomName,
      rsvp1Phone: family.rsvp1Phone || '+91 9409360336',
      rsvp2Name: family.rsvp2Name || 'Event Helpdesk',
      rsvp2Phone: family.rsvp2Phone || '+91 9409360336',
    },
    rsvpConfig: {
      enabled: rsvpConfig.enabled !== false,
      collectPhone: rsvpConfig.collectPhone !== false,
      collectGuestsCount: rsvpConfig.collectGuestsCount !== false,
      collectWishes: rsvpConfig.collectWishes !== false,
    },
    media: {
      audioUrl: media.audioUrl,
      audioName: media.audioName || 'FinalSong.mp3',
      bgMusicPreset: media.bgMusicPreset || 'royal_shehnai',
      isMusicEnabled: media.isMusicEnabled !== false,
      photoSlots: media.photoSlots || {},
    },
    studioBadge: studioBadge || raw?.studio_badge || content.studio_badge,
    isLocked: Boolean(raw?.is_locked),
    status: (raw?.status || 'draft') as 'draft' | 'published',
    typography: content.typography || DEFAULT_TYPOGRAPHY,
    shagun: content.shagun,
    guestName: content.guestName || raw?.guestName,
    auspiciousBlessing: content.auspiciousBlessing || {
      shlokaKey: 'ganesh',
      shlokaText: AUSPICIOUS_SHLOKAS.ganesh.text,
      shlokaMeaning: AUSPICIOUS_SHLOKAS.ganesh.meaning,
    },
  };
};

/**
 * 3. Sweep and replace all residual static placeholder text in template DOM
 */
export const sweepStaticTemplateTextNodes = (
  root: Node,
  normalized: NormalizedInvitationData
) => {
  try {
    const nodes: Node[] = [];
    const collectTextNodes = (n: Node) => {
      if (!n) return;
      if (n.nodeType === 3) { // TEXT_NODE
        nodes.push(n);
      } else if (n.childNodes && n.childNodes.length > 0) {
        n.childNodes.forEach(collectTextNodes);
      }
    };
    collectTextNodes(root);

    const { bride, groom, wedding } = normalized;
    const groomName = groom.name;
    const brideName = bride.name;
    const date = wedding.rawDate;
    const venue = wedding.venueName;

    // Comprehensive placeholder patterns to wipe out across all 8 themes
    const replacements: [RegExp, string][] = [
      // Known demo couple combinations
      [/Rudra\s*(?:&|&amp;|and|एवं|અને)\s*Ishani/gi, `${groomName} & ${brideName}`],
      [/Rudra\s*(?:&|&amp;|and|एवं|અને)\s*Shalini/gi, `${groomName} & ${brideName}`],
      [/Aryan\s*(?:&|&amp;|and|एवं|અને)\s*Aanya/gi, `${groomName} & ${brideName}`],
      [/Dhruv\s*(?:&|&amp;|and|एवं|અને)\s*Shreya/gi, `${groomName} & ${brideName}`],
      
      // Individual Names
      [/Rudra/gi, groomName],
      [/Ishani/gi, brideName],
      [/Shalini/gi, brideName],
      [/Aryan/gi, groomName],
      [/Aanya/gi, brideName],
      [/Dhruv/gi, groomName],
      [/Shreya/gi, brideName],
      [/रुद्र/gi, groom.nameHi || groomName],
      [/ईशानी/gi, bride.nameHi || brideName],
      [/ध्रुव/gi, groom.nameHi || groomName],
      [/श्रेया/gi, bride.nameHi || brideName],
      [/રુદ્ર/gi, groom.nameGu || groomName],
      [/ઈશાની/gi, bride.nameGu || brideName],
      [/ધ્રુવ/gi, groom.nameGu || groomName],
      [/શ્રેયા/gi, bride.nameGu || brideName],

      // Demo Parents & Family
      [/Mr\.\s*Nalinkumar\s*&\s*Mrs\.\s*Kalpuben/gi, normalized.family.groomParents || ''],
      [/श्री\s*नलिनकुमार\s*एवं\s*श्रीमती\s*कल्पूबेन/gi, normalized.family.groomParents || ''],
      [/શ્રી\s*નલિનકુમાર\s*અને\s*શ્રીમતી\s*કલ્પૂબેન/gi, normalized.family.groomParents || ''],
      [/Mr\.\s*&\s*Mrs\.\s*Sharma/gi, normalized.family.brideParents || ''],
      [/Nalinkumar/gi, normalized.family.rsvp1Name || ''],
      [/Kalpuben/gi, ''],

      // Demo Phone Numbers
      [/\+?91[\s-]*98251[\s-]*45678/gi, normalized.family.rsvp1Phone || ''],
      [/\+?91[\s-]*98982[\s-]*34567/gi, normalized.family.rsvp2Phone || ''],
      [/\+?91[\s-]*94093[\s-]*60336/gi, normalized.family.rsvp1Phone || ''],
      [/98251\s*45678/gi, normalized.family.rsvp1Phone || ''],
      [/98982\s*34567/gi, normalized.family.rsvp2Phone || ''],

      // Demo Hashtags
      [/#RudraKiIshani/gi, normalized.hashtag || `#${groomName}Weds${brideName}`],
      [/#DhruvKiShreya/gi, normalized.hashtag || `#${groomName}Weds${brideName}`],
      [/#AryanKiAanya/gi, normalized.hashtag || `#${groomName}Weds${brideName}`],
      [/#RudraWedsIshani/gi, normalized.hashtag || `#${groomName}Weds${brideName}`],

      // Demo Venues
      [/The Grand Haveli/gi, venue],
      [/The Milestone Palace Ground/gi, venue],
      [/The Milestone Garden/gi, venue],
      [/The Milestone Courtyard/gi, venue],
      [/Royal Darbar Banquet/gi, venue],
      [/The Milestone Grand Ballroom/gi, venue],
      [/The Milestone[\s\w,]*/gi, venue],
      [/Himmatnagar[\s\w,]*/gi, venue],
      [/Modasa[\s\w,]*/gi, venue],
      [/Jagmandir Island Palace/gi, venue],

      // Demo Dates
      [/1\s+December\s+2024/gi, date],
      [/2\s+December\s+2024/gi, date],
      [/3\s+December\s+2024/gi, date],
      [/4\s+December\s+2024/gi, date],
      [/December\s+12,\s+2025/gi, date],
      [/3\s+December\s+2026/gi, date],
      [/2024-12-03/gi, date],
      [/2024/gi, new Date(wedding.targetTimestampMs).getFullYear().toString()],
    ];

    nodes.forEach((node) => {
      let text = node.nodeValue;
      if (!text || !text.trim()) return;

      let modified = false;
      replacements.forEach(([pattern, replacement]) => {
        if (pattern.test(text!)) {
          text = text!.replace(pattern, replacement);
          modified = true;
        }
      });

      if (modified) {
        node.nodeValue = text;
      }
    });
  } catch (e) {}
};

/**
 * 4. Apply normalized invitation data to template DOM and Window context
 */
export const applyInvitationDataToTemplateDOM = (
  doc: Document,
  win: any,
  normalized: NormalizedInvitationData
) => {
  if (!doc || !win) return;

  try {
    const { bride, groom, wedding, family, events, media, rsvpConfig, language } = normalized;
    const groomName = groom.name;
    const brideName = bride.name;
    const coupleTitle = normalized.coupleDisplayName;
    const date = wedding.rawDate;
    const venue = wedding.venueName;

    // 1. Assign Window Configuration
    win.WEDDING_CONFIG = {
      ...normalized,
      groomName,
      brideName,
      weddingDate: date,
      city: venue,
      venue,
      mark: normalized.monogramDot,
      hashtag: normalized.hashtag,
      contacts: [
        { name: family.rsvp1Name, phone: family.rsvp1Phone },
        { name: family.rsvp2Name, phone: family.rsvp2Phone },
      ],
      groomParents: { father: family.groomParents },
      brideParents: { father: family.brideParents },
    };

    win.LIVE_TARGET_DATE_MS = wedding.targetTimestampMs;
    win.LIVE_WEDDING_SLUG = normalized.slug;
    win.LIVE_WEDDING_SITE_ID = normalized.invitationId;

    if (typeof win.initShahiRsvp === 'function') {
      try { win.initShahiRsvp(); } catch (e) {}
    }

    // 2. Multi-Pass Static Text Sweeper
    sweepStaticTemplateTextNodes(doc.body, normalized);

    // 3. Bind Couple Names Everywhere
    doc.querySelectorAll('.groom-name, #groom-name, [data-bind="groom"], [data-field="groom-name"], .rjm-groom-name').forEach((el) => {
      el.textContent = groomName;
    });

    doc.querySelectorAll('.bride-name, #bride-name, [data-bind="bride"], [data-field="bride-name"], .rjm-bride-name').forEach((el) => {
      el.textContent = brideName;
    });

    const nameSelectors = [
      '.rjm-hero-names', '.rjm-couple-names', '.rjm-foot-names',
      '.jhr-hero-names', '.jhr-couple-names', '.jhr-foot-names',
      '.myr-hero-names', '.myr-couple-names', '.myr-foot-names',
      '.jdi-hero-names', '.jdi-couple-names', '.jdi-foot-names', '.jdi-couple-name',
      '.dak-hero-names', '.dak-couple-names', '.dak-foot-names',
      'h1.couple-names', 'h2.couple-names', '.hero-names', '.couple-title',
      '[data-field="couple-names"]', '.rjm-names', '.jhr-names', '.myr-names', '.jdi-names', '.dak-names'
    ];
    doc.querySelectorAll(nameSelectors.join(', ')).forEach((el) => {
      el.textContent = coupleTitle;
    });

    // 4. Bind Monograms & Hashtags
    doc.querySelectorAll('.rjm-nav-mark, .nav-mark, .monogram, .couple-mark, #couple-mark, .mark-tag, .logo-monogram, .dak-navname, .myr-monogram, .jdi-monogram, .rd-monogram, [data-bind="mark"]').forEach((el) => {
      el.textContent = normalized.monogramDot;
    });
    doc.querySelectorAll('header a.jhr-script, a.jhr-script, .jhr-monogram').forEach((el) => {
      el.textContent = normalized.monogramAmp;
    });
    doc.querySelectorAll('.rjm-foot-tag, .hashtag, #wedding-hashtag, .wedding-tag, .foot-hashtag, [data-bind="hashtag"]').forEach((el) => {
      el.textContent = normalized.hashtag;
    });

    // 5. Bind Dates & Venues
    const dateSelectors = [
      '.rjm-hero-date', '.rjm-couple-date', '.rjm-foot-date', '.rjm-date',
      '.jhr-hero-date', '.jhr-date', '.jhr-foot-date',
      '.myr-hero-date', '.myr-date', '.myr-foot-date',
      '.jdi-hero-date', '.jdi-date', '.jdi-foot-date',
      '.dak-postmark-date', '.dak-date', '.dak-foot-date',
      '.ivory-date', '.wedding-date', '#wedding-date', '.date-label',
      '[data-field="wedding-date"]', '[data-field="date"]', '[data-bind="date"]'
    ];
    doc.querySelectorAll(dateSelectors.join(', ')).forEach((el) => {
      el.textContent = date;
    });

    const venueSelectors = [
      '.rjm-venue', '.jhr-venue', '.myr-venue', '.jdi-venue', '.dak-venue', '.ivory-venue',
      '.venue-text', '#venue-address', '[data-field="venue"]', '[data-bind="venue"]'
    ];
    doc.querySelectorAll(venueSelectors.join(', ')).forEach((el) => {
      el.textContent = venue;
    });

    // 6. Bind Family Parents
    doc.querySelectorAll('.rjm-parents, .parents-name, #groom-parents, [data-field="parents"]').forEach((el) => {
      el.textContent = family.groomParents;
    });

    // 7. Bind Dynamic Events & Venue Cards
    const eventCards = doc.querySelectorAll('.rjm-event, .event-card, .timeline-item, .rasam-card, .jhr-event-card, .myr-event-card, .dak-event-card, article');
    events.forEach((evt, idx) => {
      if (eventCards[idx]) {
        const card = eventCards[idx];
        const nameEl = card.querySelector('.rjm-event-name, .event-title, h3, h4');
        const dateEl = card.querySelector('.rjm-event-date, .event-date, .date-badge');
        const timeEl = card.querySelector('.rjm-event-time, .event-time, .time-badge, dd');
        const venueEl = card.querySelector('.rjm-event-venue, .event-venue, .venue-badge');
        const addrEl = card.querySelector('.rjm-event-addr, .event-addr, .address');
        const mapLink = card.querySelector('a[href*="maps"], a.rjm-link, a[href*="google.com/maps"], a.btn-map');

        if (nameEl) nameEl.textContent = evt.name;
        if (dateEl) dateEl.textContent = evt.date;
        if (timeEl) timeEl.textContent = evt.time;
        if (venueEl && evt.venue) venueEl.textContent = evt.venue;
        if (addrEl && venue) addrEl.textContent = venue;
        if (mapLink && evt.mapUrl) mapLink.setAttribute('href', evt.mapUrl);
      }
    });

    // Venue Cards Grid
    const venueCards = doc.querySelectorAll('.rjm-venue-card, .venue-card, .location-card');
    events.forEach((evt, idx) => {
      if (venueCards[idx]) {
        const vcard = venueCards[idx];
        const titleEl = vcard.querySelector('h3, h4, .v-title');
        const nameEl = vcard.querySelector('.rjm-venue-name, .venue-name');
        const addrEl = vcard.querySelector('.rjm-venue-addr, .venue-addr');
        const mapLink = vcard.querySelector('a[href*="maps"], a.rjm-link, a');

        if (titleEl) titleEl.textContent = evt.name;
        if (nameEl && evt.venue) nameEl.textContent = evt.venue;
        if (addrEl && venue) addrEl.textContent = venue;
        if (mapLink && evt.mapUrl) mapLink.setAttribute('href', evt.mapUrl);
      }
    });

    // 8. Bind RSVP Helpline Contacts & RSVP Form
    doc.querySelectorAll('.data-rsvp1-name').forEach((el) => { el.textContent = family.rsvp1Name; });
    doc.querySelectorAll('.data-rsvp1-phone').forEach((el) => { el.textContent = family.rsvp1Phone; });
    doc.querySelectorAll('.data-rsvp1-link').forEach((el) => { el.setAttribute('href', `tel:${family.rsvp1Phone.replace(/\s+/g, '')}`); });
    doc.querySelectorAll('.data-rsvp2-name').forEach((el) => { el.textContent = family.rsvp2Name; });
    doc.querySelectorAll('.data-rsvp2-phone').forEach((el) => { el.textContent = family.rsvp2Phone; });
    doc.querySelectorAll('.data-rsvp2-link').forEach((el) => { el.setAttribute('href', `tel:${family.rsvp2Phone.replace(/\s+/g, '')}`); });

    const contactLinks = doc.querySelectorAll('.rjm-foot-contacts a, .foot-contacts a, .contact-links a');
    if (contactLinks.length >= 2) {
      contactLinks[0].textContent = `${family.rsvp1Name} · ${family.rsvp1Phone}`;
      contactLinks[0].setAttribute('href', `tel:${family.rsvp1Phone.replace(/\s+/g, '')}`);
      contactLinks[1].textContent = `${family.rsvp2Name} · ${family.rsvp2Phone}`;
      contactLinks[1].setAttribute('href', `tel:${family.rsvp2Phone.replace(/\s+/g, '')}`);
    }

    // RSVP Section Visibility & Dynamic Config
    const rsvpSection = doc.querySelector('#rsvp, .rjm-rsvp, .rsvp-section');
    if (rsvpSection) {
      (rsvpSection as HTMLElement).style.display = rsvpConfig.enabled !== false ? '' : 'none';
    }
    doc.querySelectorAll('a[href*="#rsvp"]').forEach((el) => {
      (el as HTMLElement).style.display = rsvpConfig.enabled !== false ? '' : 'none';
    });

    doc.querySelectorAll('input[name="guest_phone"]').forEach((input) => {
      const inputEl = input as HTMLInputElement;
      const parent = inputEl.closest('div');
      if (parent) {
        parent.style.display = rsvpConfig.collectPhone !== false ? '' : 'none';
      }
      if (rsvpConfig.collectPhone === false) {
        inputEl.removeAttribute('required');
      } else {
        inputEl.setAttribute('required', 'required');
      }
    });

    doc.querySelectorAll('.rsvp-attendees-group, select[name="attendees_count"]').forEach((el) => {
      const target = (el.classList.contains('rsvp-attendees-group') ? el : el.closest('div')) as HTMLElement;
      if (target) {
        target.style.display = rsvpConfig.collectGuestsCount !== false ? '' : 'none';
      }
    });

    doc.querySelectorAll('textarea[name="wishes"]').forEach((el) => {
      const parent = (el.closest('div') || el) as HTMLElement;
      if (parent) {
        parent.style.display = rsvpConfig.collectWishes !== false ? '' : 'none';
      }
      (el as HTMLTextAreaElement).placeholder = `Write a heartfelt blessing for ${groomName} & ${brideName}...`;
    });

    // 📸 8.5 Bind All Photos & Filters (Hero, Groom, Bride, 6-Photo Moments Gallery)
    try {
      doc.querySelectorAll('img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        if (!imgEl.getAttribute('data-default-src')) {
          imgEl.setAttribute('data-default-src', imgEl.src);
        }
      });

      const slots = media.photoSlots || {};
      const getSlotData = (key: string, ...aliases: string[]): { url: string; filter?: PhotoFilterType } | null => {
        if (slots[key]?.url) return slots[key];
        for (const alias of aliases) {
          if (slots[alias]?.url) return slots[alias];
        }
        return null;
      };

      const heroSlot = getSlotData('hero', 'couple_main', 'couple', 'main');
      const groomSlot = getSlotData('groom', 'groom_portrait', 'dulha');
      const brideSlot = getSlotData('bride', 'bride_portrait', 'dulhan');
      const g1Slot = getSlotData('gallery1', 'gallery_1');
      const g2Slot = getSlotData('gallery2', 'gallery_2');
      const g3Slot = getSlotData('gallery3', 'gallery_3');
      const g4Slot = getSlotData('gallery4', 'gallery_4', 'family_photo', 'family');
      const g5Slot = getSlotData('gallery5', 'gallery_5');
      const g6Slot = getSlotData('gallery6', 'gallery_6');

      // Hero Couple Photo
      doc.querySelectorAll('.rjm-couple-img, .jdi-plate-slot img, .jhr-couple-img, .myr-couple-img, .dak-stamp-img, .ivory-hero img, #storyImg3, img[src*="couple.webp"], img[src*="couple.jpg"], img[src*="plate.webp"], .hero-cover img, .data-hero-img, .data-couple-img, img[alt*="Couple"], img[alt*="The Wedding"]').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (heroSlot && heroSlot.url) {
          imgEl.src = heroSlot.url;
          imgEl.style.filter = getFilterStyle(heroSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Groom Solo Photo
      doc.querySelectorAll('.groom-photo img, .groom-card img, .rjm-groom-img, .jhr-groom-img, .myr-groom-img, .dak-groom-img, .ivory-groom img, #storyImg1, img[alt*="Groom"], img[alt*="Dhruv"], img[alt*="Aarav"], img[src*="groom"], .data-groom-img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (groomSlot && groomSlot.url) {
          imgEl.src = groomSlot.url;
          imgEl.style.filter = getFilterStyle(groomSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Bride Solo Photo
      doc.querySelectorAll('.bride-photo img, .bride-card img, .rjm-bride-img, .jhr-bride-img, .myr-bride-img, .dak-bride-img, .ivory-bride img, #storyImg2, img[alt*="Bride"], img[alt*="Shreya"], img[alt*="Anaya"], img[src*="bride"], .data-bride-img').forEach((img) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        if (brideSlot && brideSlot.url) {
          imgEl.src = brideSlot.url;
          imgEl.style.filter = getFilterStyle(brideSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });

      // Dynamic 6-Photo Royal Moments Gallery
      const gallerySlots = [g1Slot, g2Slot, g3Slot, g4Slot, g5Slot, g6Slot];
      const galleryImgs = doc.querySelectorAll('#gallery figure img, .rjm-gallery-grid figure img, .jhr-gallery-grid figure img, .myr-gallery-grid figure img, .jdi-gallery-grid figure img, #album figure img, .dak-gallery-grid figure img, #looks figure img, .ivory-gallery-grid figure img, #storyImg1, #storyImg2, #storyImg3, .rjm-photo-zoom img, .moments-grid img, .gallery-item img, #gallery img, .gallery-grid img, #galleryGrid img, .gallery-slot img');

      galleryImgs.forEach((img, idx) => {
        const imgEl = img as HTMLImageElement;
        const defaultSrc = imgEl.getAttribute('data-default-src');
        const assignedSlot = gallerySlots[idx];

        if (assignedSlot && assignedSlot.url) {
          imgEl.src = assignedSlot.url;
          imgEl.style.filter = getFilterStyle(assignedSlot.filter);
        } else if (defaultSrc) {
          imgEl.src = defaultSrc;
          imgEl.style.filter = 'none';
        }
      });
    } catch (photoErr) {}

    // 🎵 8.6 Audio Music Sync
    if (media.audioUrl) {
      doc.querySelectorAll('audio, #wedding-audio').forEach((aud) => {
        (aud as HTMLAudioElement).src = media.audioUrl!;
      });
    }

    // 👑 9. Dynamic Typography & Font Injection
    try {
      let fontLink = doc.getElementById('amantran-google-fonts') as HTMLLinkElement;
      if (!fontLink && doc.head) {
        fontLink = doc.createElement('link');
        fontLink.id = 'amantran-google-fonts';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@600;700;800;900&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Gotu&family=Great+Vibes&family=Kalam:wght@400;700&family=Marcellus&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Rozha+One&family=Tiro+Devanagari+Hindi:ital@0;1&family=Yatra+One&display=swap';
        doc.head.appendChild(fontLink);
      }

      const typo = normalized.typography || DEFAULT_TYPOGRAPHY;
      let styleTag = doc.getElementById('amantran-dynamic-typography') as HTMLStyleElement;
      if (!styleTag && doc.head) {
        styleTag = doc.createElement('style');
        styleTag.id = 'amantran-dynamic-typography';
        doc.head.appendChild(styleTag);
      }
      if (styleTag) {
        styleTag.textContent = `
          :root {
            --couple-font: "${typo.coupleFont}", cursive, serif;
            --headings-font: "${typo.headingsFont}", serif;
            --body-font: "${typo.bodyFont}", sans-serif;
            --auspicious-font: "${typo.auspiciousFont}", serif;
          }
          .couple-names, .rjm-hero-names, .rjm-couple-names, .rjm-foot-names,
          .jhr-hero-names, .jhr-couple-names, .jhr-foot-names,
          .myr-hero-names, .myr-couple-names, .myr-foot-names,
          .jdi-hero-names, .jdi-couple-names, .jdi-foot-names, .jdi-couple-name,
          .dak-hero-names, .dak-couple-names, .dak-foot-names,
          h1.couple-names, h2.couple-names, .hero-names, .couple-title,
          [data-field="couple-names"], .rjm-names, .jhr-names, .myr-names, .jdi-names, .dak-names {
            font-family: "${typo.coupleFont}", cursive, serif !important;
          }
          .heading-font, .rjm-title, .jhr-title, .myr-title, .dak-title, h1:not(.couple-names), h2:not(.couple-names) {
            font-family: "${typo.headingsFont}", serif !important;
          }
          .rjm-shloka, .shloka, .auspicious-shloka, .vedic-header {
            font-family: "${typo.auspiciousFont}", serif !important;
          }
        `;
      }
    } catch (fontErr) {}

    // 🌸 10. Auspicious Blessing & Shloka Binding
    if (normalized.auspiciousBlessing?.shlokaText) {
      doc.querySelectorAll('.rjm-shloka, .shloka, .auspicious-shloka, [data-bind="shloka"]').forEach((el) => {
        el.textContent = normalized.auspiciousBlessing?.shlokaText || '';
      });
    }

    // 💌 11. Personalized Guest Invite Handling (?guest=...)
    try {
      let activeGuestName = normalized.guestName || '';
      if (!activeGuestName && win.location) {
        const urlParams = new URLSearchParams(win.location.search);
        activeGuestName = urlParams.get('guest') || urlParams.get('to') || urlParams.get('invitee') || '';
      }

      if (activeGuestName) {
        let guestBadge = doc.getElementById('amantran-guest-badge');
        if (!guestBadge) {
          const insertTarget = doc.querySelector('.hero-section, .rjm-hero, header, #hero, main, body');
          if (insertTarget) {
            guestBadge = doc.createElement('div');
            guestBadge.id = 'amantran-guest-badge';
            guestBadge.className = 'amantran-guest-invitation-badge';
            insertTarget.insertBefore(guestBadge, insertTarget.firstChild);
          }
        }
        if (guestBadge) {
          guestBadge.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(110,16,32,0.7), rgba(196,154,53,0.35)); border: 1.5px solid rgba(196,154,53,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 12px 24px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; margin: 20px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.35); text-align: center;">
              <span style="font-size: 18px;">👑</span>
              <span style="color: #FFFDF8; font-family: 'Cinzel', serif; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase;">सस्नेह निमंत्रण — <strong style="color: #E8D5AD; font-weight: 800; border-bottom: 1.5px solid #C49A35; padding-bottom: 2px;">${activeGuestName}</strong></span>
              <span style="font-size: 18px;">💌</span>
            </div>
          `;
          guestBadge.style.textAlign = 'center';
        }

        doc.querySelectorAll('.guest-name, [data-bind="guest-name"]').forEach((el) => {
          el.textContent = activeGuestName;
        });
      }
    } catch (guestErr) {}

    // 🪙 12. Digital Shagun & UPI QR Section (Always Placed at the Bottom / Sabse Niche)
    try {
      const isHindi = normalized.language === 'hi';
      const isGujarati = normalized.language === 'gu';
      const existingShagun = doc.getElementById('amantran-digital-shagun');
      if (normalized.shagun?.enabled && (normalized.shagun?.upiId || normalized.shagun?.qrImageUrl)) {
        let shagunCard = existingShagun;
        if (!shagunCard) {
          shagunCard = doc.createElement('section');
          shagunCard.id = 'amantran-digital-shagun';
          shagunCard.className = 'amantran-shagun-section';
          
          // Always place it at the very bottom, right before the footer!
          const footer = doc.querySelector('footer, .rjm-foot, .jhr-foot, .myr-foot, .dak-desk, .foot');
          if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(shagunCard, footer);
          } else {
            const main = doc.querySelector('main, #root, #app, .app-wrap') || doc.body;
            main.appendChild(shagunCard);
          }
        } else {
          // If it already exists, ensure it is anchored at the bottom right before the footer!
          const footer = doc.querySelector('footer, .rjm-foot, .jhr-foot, .myr-foot, .dak-desk, .foot');
          if (footer && footer.parentNode && shagunCard.nextSibling !== footer) {
            footer.parentNode.insertBefore(shagunCard, footer);
          }
        }

        if (shagunCard) {
          const cleanUpi = (normalized.shagun.upiId || '').trim();
          const recipient = normalized.shagun.recipientName || groomName;
          const qrUrl = normalized.shagun.qrImageUrl || (cleanUpi
            ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(cleanUpi)}%26pn=${encodeURIComponent(recipient)}%26cu=INR`
            : '');

          const titleText = isHindi 
            ? '॥ डिजिटल शगुन एवं शुभाशीर्वाद ॥' 
            : isGujarati 
            ? '॥ ડિજિટલ શગુન અને આશીર્વાદ ॥' 
            : '॥ Digital Shagun & Blessings ॥';

          const subtitleText = isHindi
            ? 'आपकी मंगलमयी उपस्थिति और आशीर्वाद ही हमारी सबसे बड़ी धरोहर है। डिजिटल शगुन एवं नेग हेतु:'
            : isGujarati
            ? 'આપની મંગલમય ઉપસ્થિતિ અને આશીર્વાદ જ અમારો સૌથી મોટો વૈભવ છે. ડિજિટલ શગુન માટે:'
            : (normalized.shagun.customMessage || 'Your gracious presence and heartfelt blessings are our greatest treasure. For digital shagun & tokens of love:');

          shagunCard.innerHTML = `
            <div style="max-width: 520px; width: calc(100% - 32px); margin: 60px auto 40px auto; padding: 36px 24px; background: linear-gradient(135deg, rgba(37,9,16,0.96), rgba(67,9,20,0.97)); border: 1.5px solid #C49A35; border-radius: 28px; text-align: center; color: #FFFDF8; box-shadow: 0 20px 50px rgba(0,0,0,0.35); font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; position: relative; overflow: hidden;">
              <div style="font-size: 26px; margin-bottom: 8px;">🌸 🪙 🌸</div>
              <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 23px; font-weight: 700; color: #E8CD7E; letter-spacing: 0.05em; margin: 0 0 8px 0;">${titleText}</h3>
              <p style="font-size: 13.5px; color: #E8D5AD; margin: 0 auto 22px auto; max-width: 440px; font-family: 'Playfair Display', Georgia, serif; font-style: italic; line-height: 1.6; opacity: 0.95;">
                ${subtitleText}
              </p>
              
              ${qrUrl ? `
                <div style="background: #FFFFFF; padding: 14px; border-radius: 20px; display: inline-block; box-shadow: 0 8px 24px rgba(0,0,0,0.25); margin-bottom: 20px; border: 2px solid #C49A35;">
                  <img src="${qrUrl}" alt="Digital Shagun UPI QR" style="width: 180px; height: 180px; display: block; border-radius: 10px; margin: 0 auto; object-fit: contain;" />
                </div>
              ` : ''}

              ${cleanUpi ? `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(196,154,53,0.18); border: 1px dashed rgba(196,154,53,0.6); border-radius: 14px; padding: 10px 18px; width: fit-content; margin: 0 auto; max-width: 100%;">
                  <span style="font-family: monospace; font-size: 13.5px; color: #FFFDF8; font-weight: 700; word-break: break-all;">${cleanUpi}</span>
                  <button type="button" onclick="navigator.clipboard.writeText('${cleanUpi}'); this.textContent='COPIED ✓'; setTimeout(() => this.textContent='COPY', 2000);" style="background: #C49A35; color: #241A17; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.06em; transition: background 0.2s; shrink: 0;">Copy</button>
                </div>
              ` : ''}

              ${recipient ? `<p style="font-size: 12px; color: #E8CD7E; margin-top: 14px; opacity: 0.9;">Payable to: <strong style="color: #FFFDF8;">${recipient}</strong></p>` : ''}
              
              <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(232,213,173,0.15); font-size: 11px; color: #E8D5AD; opacity: 0.8; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>🔒 100% Direct Account Settlement via UPI · GooglePay · PhonePe · Paytm</span>
              </div>
            </div>
          `;
        }
      } else if (existingShagun) {
        existingShagun.remove();
      }
    } catch (shagunErr) {}

    // 13. Broadcast window postMessage
    if (typeof win.postMessage === 'function') {
      win.postMessage({ type: 'UPDATE_STATE', state: normalized }, '*');
      win.postMessage({ type: 'WEDDING_DATA', data: normalized }, '*');
      if (typeof win.applyWeddingData === 'function') {
        win.applyWeddingData(normalized);
      }
    }
  } catch (err) {
    console.warn('[InvitationAdapter] DOM sync error:', err);
  }
};
