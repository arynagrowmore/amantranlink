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
      groomParents: family.groomParentsEn || '',
      groomParentsHi: family.groomParentsHi || '',
      groomParentsGu: family.groomParentsGu || '',
      brideParents: family.brideParentsEn || '',
      brideParentsHi: family.brideParentsHi || '',
      brideParentsGu: family.brideParentsGu || '',
      rsvp1Name: family.rsvp1Name || groomName,
      rsvp1Phone: family.rsvp1Phone || '+91 9409360336',
      rsvp2Name: family.rsvp2Name || 'Event Helpdesk',
      rsvp2Phone: family.rsvp2Phone || '+91 9409360336',
      customNote: family.customNote || '',
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
 * Helper to update multilingual elements (<span class="l-en">, <span class="l-hi">, <span class="l-gu">)
 * or fallback to direct textContent based on active language.
 */
export const setMultilingualText = (
  container: Element | null,
  enVal: string,
  hiVal?: string,
  guVal?: string,
  currentLang: string = 'en'
) => {
  if (!container) return;
  const enNode = container.querySelector('.l-en');
  const hiNode = container.querySelector('.l-hi');
  const guNode = container.querySelector('.l-gu');

  const chosenVal = currentLang === 'hi' 
    ? (hiVal || enVal) 
    : currentLang === 'gu' 
    ? (guVal || hiVal || enVal) 
    : enVal;

  if (enNode || hiNode || guNode) {
    if (enNode) enNode.textContent = enVal;
    if (hiNode) hiNode.textContent = hiVal || enVal;
    if (guNode) guNode.textContent = guVal || hiVal || enVal;
  } else {
    container.textContent = chosenVal;
  }
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

    const { bride, groom, wedding, family } = normalized;
    const groomName = groom.name;
    const brideName = bride.name;
    const date = wedding.rawDate;
    const venue = wedding.venueName;
    const groomParents = family.groomParents || '';
    const brideParents = family.brideParents || '';
    const rsvp1Phone = family.rsvp1Phone || '';
    const rsvp2Phone = family.rsvp2Phone || '';
    const rsvp1Name = family.rsvp1Name || '';
    const rsvp2Name = family.rsvp2Name || '';
    const hashtag = normalized.hashtag || `#${groomName}Weds${brideName}`;

    // Comprehensive placeholder patterns to wipe out across all 8 themes
    const replacements: [RegExp, string][] = [
      // Known demo couple combinations
      [/Rudra\s*(?:&|&amp;|and|एवं|અને)\s*Ishani/gi, `${groomName} & ${brideName}`],
      [/Rudra\s*(?:&|&amp;|and|एवं|અને)\s*Shalini/gi, `${groomName} & ${brideName}`],
      [/Aryan\s*(?:&|&amp;|and|एवं|અને)\s*Aanya/gi, `${groomName} & ${brideName}`],
      [/Dhruv\s*(?:&|&amp;|and|एवं|અને)\s*Shreya/gi, `${groomName} & ${brideName}`],
      [/Aarav\s*(?:&|&amp;|and|एवं|અને)\s*Riya/gi, `${groomName} & ${brideName}`],
      [/Aarav\s*(?:&|&amp;|and|एवं|અને)\s*Anaya/gi, `${groomName} & ${brideName}`],
      [/Kabir\s*(?:&|&amp;|and|एवं|અને)\s*Meera/gi, `${groomName} & ${brideName}`],
      
      // Individual Groom Names
      [/Rudra/gi, groomName],
      [/Aryan/gi, groomName],
      [/Dhruv/gi, groomName],
      [/Aarav/gi, groomName],
      [/Kabir/gi, groomName],
      [/रुद्र/gi, groom.nameHi || groomName],
      [/ध्रुव/gi, groom.nameHi || groomName],
      [/आरव/gi, groom.nameHi || groomName],
      [/कबीर/gi, groom.nameHi || groomName],
      [/રુદ્ર/gi, groom.nameGu || groomName],
      [/ધ્રુવ/gi, groom.nameGu || groomName],
      [/આરવ/gi, groom.nameGu || groomName],
      [/કબીર/gi, groom.nameGu || groomName],

      // Individual Bride Names
      [/Ishani/gi, brideName],
      [/Shalini/gi, brideName],
      [/Aanya/gi, brideName],
      [/Shreya/gi, brideName],
      [/Riya/gi, brideName],
      [/Anaya/gi, brideName],
      [/Meera/gi, brideName],
      [/ईशानी/gi, bride.nameHi || brideName],
      [/श्रेया/gi, bride.nameHi || brideName],
      [/रिया/gi, bride.nameHi || brideName],
      [/अनन्या/gi, bride.nameHi || brideName],
      [/मीरा/gi, bride.nameHi || brideName],
      [/ઈશાની/gi, bride.nameGu || brideName],
      [/શ્રેયા/gi, bride.nameGu || brideName],
      [/રિયા/gi, bride.nameGu || brideName],
      [/અનન્યા/gi, bride.nameGu || brideName],
      [/મીરા/gi, bride.nameGu || brideName],

      // Demo Parents & Family
      [/Mr\.\s*Nalinkumar\s*&\s*Mrs\.\s*Kalpuben/gi, groomParents || (groomName + "'s Parents")],
      [/श्री\s*नलिनकुमार\s*एवं\s*श्रीमती\s*कल्पूबेन/gi, family.groomParentsHi || groomParents || ''],
      [/શ્રી\s*નલિનકુમાર\s*અને\s*શ્રીમતી\s*કલ્પૂબેન/gi, family.groomParentsGu || groomParents || ''],
      [/Shri\s*Rajendra\s*&\s*Smt\.\s*Meera\s*Singhania/gi, groomParents || (groomName + "'s Parents")],
      [/Shri\s*Vikram\s*&\s*Smt\.\s*Anita\s*Rathore/gi, brideParents || (brideName + "'s Parents")],
      [/Mr\.\s*&\s*Mrs\.\s*Sharma/gi, brideParents || (brideName + "'s Parents")],
      [/श्री\s*एवं\s*श्रीमती\s*शर्मा/gi, family.brideParentsHi || brideParents || ''],
      [/શ્રી\s*અને\s*શ્રીમતી\s*શર્મા/gi, family.brideParentsGu || brideParents || ''],
      [/Mr\.\s*Vikram\s*Kapoor/gi, brideParents || (brideName + "'s Father")],
      [/श्री\s*विक्रम\s*कपूर/gi, family.brideParentsHi || brideParents || ''],
      [/Mrs\.\s*(?:Ishani|Anjali)\s*Kapoor/gi, brideParents || (brideName + "'s Mother")],
      [/श्रीमती\s*(?:ईशानी|अंजलि)\s*कपूर/gi, family.brideParentsHi || brideParents || ''],
      [/Late\s*Shri\s*Mohanlal\s*Kapoor/gi, 'Elders & Family Blessings'],
      [/स्व\.\s*श्री\s*मोहनलाल\s*कपूर/gi, 'बुजुर्गों का आशीर्वाद'],
      [/Shri\s*Ramesh\s*Mehta/gi, 'Elders & Family Blessings'],
      [/श्री\s*रमेश\s*मेहता/gi, 'बुजुर्गों का आशीर्वाद'],
      [/Smt\.\s*Kamla\s*Devi\s*Singhania/gi, 'Elders & Family Blessings'],
      [/Ananya\s*Rathore/gi, 'Family Blessings'],
      [/Nalinkumar/gi, rsvp1Name || groomName],
      [/Kalpuben/gi, ''],

      // Demo Phone Numbers
      [/\+?91[\s-]*98251[\s-]*45678/gi, rsvp1Phone || '+91 9409360336'],
      [/\+?91[\s-]*98982[\s-]*34567/gi, rsvp2Phone || rsvp1Phone || '+91 9409360336'],
      [/\+?91[\s-]*94093[\s-]*60336/gi, rsvp1Phone || '+91 9409360336'],
      [/98251\s*45678/gi, rsvp1Phone || '9409360336'],
      [/98982\s*34567/gi, rsvp2Phone || rsvp1Phone || '9409360336'],

      // Demo Hashtags
      [/#RudraKiIshani/gi, hashtag],
      [/#DhruvKiShreya/gi, hashtag],
      [/#AryanKiAanya/gi, hashtag],
      [/#RudraWedsIshani/gi, hashtag],
      [/#AaravKiRiya/gi, hashtag],
      [/#AaravWedsRiya/gi, hashtag],

      // Demo Venues
      [/The Grand Haveli/gi, venue],
      [/The Milestone Palace Ground/gi, venue],
      [/The Milestone Garden/gi, venue],
      [/The Milestone Courtyard/gi, venue],
      [/Royal Darbar Banquet/gi, venue],
      [/The Milestone Grand Ballroom/gi, venue],
      [/The Milestone[\s\w,]*/gi, venue],
      [/The Leela Palace/gi, venue],
      [/The Grand Palace/gi, venue],
      [/Jagmandir Island Palace/gi, venue],
      [/Jai Mahal Palace/gi, venue],
      [/Taj Lake Palace/gi, venue],
      [/Himmatnagar[\s\w,]*/gi, venue],
      [/Modasa[\s\w,]*/gi, venue],
      [/Udaipur, Rajasthan/gi, venue],
      [/Jaipur, Rajasthan/gi, venue],

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
    const lang = language || 'en';
    const isHi = lang === 'hi';
    const isGu = lang === 'gu';

    const groomEn = groom.name;
    const brideEn = bride.name;
    const groomHi = groom.nameHi || groomEn;
    const brideHi = bride.nameHi || brideEn;
    const groomGu = groom.nameGu || groomEn;
    const brideGu = bride.nameGu || brideEn;

    const displayGroom = (isHi ? groomHi : isGu ? groomGu : groomEn) || 'Groom';
    const displayBride = (isHi ? brideHi : isGu ? brideGu : brideEn) || 'Bride';
    const amp = isHi ? 'एवं' : isGu ? 'અને' : '&';
    const coupleTitle = `${displayGroom} ${amp} ${displayBride}`;

    const date = wedding.rawDate;
    const venue = wedding.venueName;

    // 1. Assign Window Configuration
    win.WEDDING_CONFIG = {
      ...normalized,
      groomName: displayGroom,
      brideName: displayBride,
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

    // Update document language attributes
    doc.documentElement.setAttribute('data-lang', lang);
    doc.documentElement.lang = lang;
    if (typeof win.switchLanguage === 'function') {
      try { win.switchLanguage(lang); } catch (e) {}
    }

    // 3. Bind Couple Names Everywhere
    doc.querySelectorAll('.groom-name, #groom-name, [data-bind="groom"], [data-field="groom-name"], .rjm-groom-name, .data-groom-name').forEach((el) => {
      setMultilingualText(el, groomEn, groomHi, groomGu, lang);
    });

    doc.querySelectorAll('.bride-name, #bride-name, [data-bind="bride"], [data-field="bride-name"], .rjm-bride-name, .data-bride-name').forEach((el) => {
      setMultilingualText(el, brideEn, brideHi, brideGu, lang);
    });

    // Special Ivory template top heading
    const ivoryH1s = doc.querySelectorAll('section#top h1.g-serif, h1');
    if (ivoryH1s.length >= 2) {
      ivoryH1s[0].textContent = displayGroom;
      ivoryH1s[1].textContent = displayBride;
    } else if (ivoryH1s.length === 1 && !ivoryH1s[0].classList.contains('couple-names')) {
      ivoryH1s[0].innerHTML = `<span>${displayGroom}</span> <span class="italic font-serif">&amp;</span> <span>${displayBride}</span>`;
    }

    const nameSelectors = [
      '.rjm-hero-names', '.rjm-couple-names', '.rjm-foot-names',
      '.jhr-hero-names', '.jhr-couple-names', '.jhr-foot-names',
      '.myr-hero-names', '.myr-couple-names', '.myr-foot-names',
      '.jdi-hero-names', '.jdi-couple-names', '.jdi-foot-names', '.jdi-couple-name',
      '.dak-hero-names', '.dak-couple-names', '.dak-foot-names',
      'h1.couple-names', 'h2.couple-names', '.hero-names', '.couple-title',
      '[data-field="couple-names"]', '.rjm-names', '.jhr-names', '.myr-names', '.jdi-names', '.dak-names',
      '.data-couple-names'
    ];
    doc.querySelectorAll(nameSelectors.join(', ')).forEach((el) => {
      el.innerHTML = `<span>${displayGroom}</span> <span class="rjm-amp font-serif text-[#C59B4B]">${amp}</span> <span>${displayBride}</span>`;
    });

    // 4. Bind Monograms & Hashtags
    const gInit = (groomEn.charAt(0) || 'G').toUpperCase();
    const bInit = (brideEn.charAt(0) || 'B').toUpperCase();
    const markDot = normalized.monogramDot || `${gInit} · ${bInit}`;
    const markAmp = normalized.monogramAmp || `${gInit} & ${bInit}`;

    doc.querySelectorAll('.rjm-nav-mark, .nav-mark, .monogram, .couple-mark, #couple-mark, .mark-tag, .logo-monogram, .dak-navname, .myr-monogram, .jdi-monogram, .rd-monogram, [data-bind="mark"], a.g-serif, header a.g-serif, a.rjm-logo').forEach((el) => {
      el.textContent = markDot;
    });
    doc.querySelectorAll('header a.jhr-script, a.jhr-script, .jhr-monogram').forEach((el) => {
      el.textContent = markAmp;
    });
    doc.querySelectorAll('text.dak-mono, svg text, .dak-stamp-shadow text').forEach((tNode) => {
      if (/^[A-Z]\s*[·&+]\s*[A-Z]$/i.test(tNode.textContent?.trim() || '')) {
        tNode.textContent = markDot;
      }
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
      '[data-field="wedding-date"]', '[data-field="date"]', '[data-bind="date"]',
      'section#top p.g-serif.text-3xl.italic'
    ];
    doc.querySelectorAll(dateSelectors.join(', ')).forEach((el) => {
      el.textContent = date;
    });

    const venueSelectors = [
      '.rjm-venue', '.jhr-venue', '.myr-venue', '.jdi-venue', '.dak-venue', '.ivory-venue',
      '.venue-text', '#venue-address', '[data-field="venue"]', '[data-bind="venue"]',
      'section#top p.text-xs.font-bold.uppercase'
    ];
    doc.querySelectorAll(venueSelectors.join(', ')).forEach((el) => {
      el.textContent = venue;
    });

    // 6. Comprehensive Family Parents & Members Binding
    const parseParents = (enStr: string = '', hiStr: string = '', guStr: string = '') => {
      const splitPair = (s: string) => {
        if (!s) return { part1: '', part2: '' };
        const parts = s.split(/\s*(?:&|&amp;|and|एवं|અને|\+|\bwith\b)\s*/i);
        return {
          part1: parts[0]?.trim() || '',
          part2: parts[1]?.trim() || ''
        };
      };

      const en = splitPair(enStr);
      const hi = splitPair(hiStr || enStr);
      const gu = splitPair(guStr || hiStr || enStr);

      return {
        fullEn: enStr.trim(),
        fullHi: (hiStr || enStr).trim(),
        fullGu: (guStr || hiStr || enStr).trim(),
        fatherEn: en.part1 || enStr.trim(),
        fatherHi: hi.part1 || (hiStr ? hiStr.trim() : en.part1 || enStr.trim()),
        fatherGu: gu.part1 || (guStr ? guStr.trim() : en.part1 || enStr.trim()),
        motherEn: en.part2,
        motherHi: hi.part2 || (en.part2 ? hiStr.trim() : ''),
        motherGu: gu.part2 || (en.part2 ? guStr.trim() : ''),
      };
    };

    const gParents = parseParents(family.groomParents, family.groomParentsHi, family.groomParentsGu);
    const bParents = parseParents(family.brideParents, family.brideParentsHi, family.brideParentsGu);

    const activeGroomParents = isHi ? (gParents.fullHi || gParents.fullEn) : isGu ? (gParents.fullGu || gParents.fullEn) : gParents.fullEn;
    const activeBrideParents = isHi ? (bParents.fullHi || bParents.fullEn) : isGu ? (bParents.fullGu || bParents.fullEn) : bParents.fullEn;

    // A. Single-line parent selectors (e.g. royalring, royaldawn, common classes)
    doc.querySelectorAll('.groom-parents, #groom-parents, [data-field="groom-parents"], [data-bind="groom-parents"], .rjm-parents, .parents-name, [data-field="parents"]').forEach((el) => {
      setMultilingualText(el, gParents.fullEn, gParents.fullHi, gParents.fullGu, lang);
    });
    doc.querySelectorAll('.bride-parents, #bride-parents, [data-field="bride-parents"], [data-bind="bride-parents"]').forEach((el) => {
      setMultilingualText(el, bParents.fullEn, bParents.fullHi, bParents.fullGu, lang);
    });

    // In royaldawn
    doc.querySelectorAll('.data-groom-parents').forEach((el) => {
      el.textContent = `With Warm Blessings from ${activeGroomParents || (groomEn + "'s Parents")}`;
    });
    doc.querySelectorAll('.data-bride-parents').forEach((el) => {
      el.textContent = `With Warm Blessings from ${activeBrideParents || (brideEn + "'s Parents")}`;
    });

    // In rajmahal family grid
    const rjmSides = doc.querySelectorAll('.rjm-family-side');
    if (rjmSides.length >= 2) {
      const gMembers = rjmSides[0].querySelectorAll('.rjm-family-member');
      if (gMembers[0]) {
        setMultilingualText(gMembers[0].querySelector('.rjm-family-name'), gParents.fatherEn || (groomEn + '\'s Father'), gParents.fatherHi, gParents.fatherGu, lang);
      }
      if (gMembers[1]) {
        setMultilingualText(gMembers[1].querySelector('.rjm-family-name'), gParents.motherEn || (gParents.fatherEn ? 'Mrs. & Family' : groomEn + '\'s Mother'), gParents.motherHi, gParents.motherGu, lang);
      }
      if (gMembers[2]) {
        setMultilingualText(gMembers[2].querySelector('.rjm-family-name'), 'Elders & Grandparents', 'वर के दादा-दादी एवं बुजुर्ग', 'વડીલોના આશીર્વાદ', lang);
      }

      const bMembers = rjmSides[1].querySelectorAll('.rjm-family-member');
      if (bMembers[0]) {
        setMultilingualText(bMembers[0].querySelector('.rjm-family-name'), bParents.fatherEn || (brideEn + '\'s Father'), bParents.fatherHi, bParents.fatherGu, lang);
      }
      if (bMembers[1]) {
        setMultilingualText(bMembers[1].querySelector('.rjm-family-name'), bParents.motherEn || (bParents.fatherEn ? 'Mrs. & Family' : brideEn + '\'s Mother'), bParents.motherHi, bParents.motherGu, lang);
      }
      if (bMembers[2]) {
        setMultilingualText(bMembers[2].querySelector('.rjm-family-name'), 'Elders & Grandparents', 'वधू के दादा-दादी एवं बुजुर्ग', 'વડીલોના આશીર્વાદ', lang);
      }
    }

    // In multi-card templates (dak, ivory, jharokha, jodi, mayura)
    doc.querySelectorAll('h3, h4, p').forEach((el) => {
      const txt = el.textContent || '';
      if (/Nalinkumar|नलिनकुमार/i.test(txt)) {
        setMultilingualText(el, gParents.fatherEn || (groomEn + '\'s Father'), gParents.fatherHi, gParents.fatherGu, lang);
      } else if (/Kalpuben|कल्पूबेन/i.test(txt)) {
        setMultilingualText(el, gParents.motherEn || (gParents.fatherEn ? 'Mrs. & Family' : groomEn + '\'s Mother'), gParents.motherHi, gParents.motherGu, lang);
      } else if (/Vikram\s*Kapoor|विक्रम\s*कपूर/i.test(txt)) {
        setMultilingualText(el, bParents.fatherEn || (brideEn + '\'s Father'), bParents.fatherHi, bParents.fatherGu, lang);
      } else if (/(?:Ishani|Anjali)\s*Kapoor|(?:ईशानी|अंजलि)\s*कपूर/i.test(txt)) {
        setMultilingualText(el, bParents.motherEn || (bParents.fatherEn ? 'Mrs. & Family' : brideEn + '\'s Mother'), bParents.motherHi, bParents.motherGu, lang);
      } else if (/Ramesh\s*Mehta|रमेश\s*मेहता|Mohanlal\s*Kapoor|मोहनलाल\s*कपूर|Kamla\s*Devi/i.test(txt)) {
        setMultilingualText(el, 'Elders & Grandparents Blessings', 'बुजुर्गों का स्नेह एवं आशीर्वाद', 'વડીલોના આશીર્વાદ', lang);
      }
    });

    // 7. Bind Dynamic Events & Venue Cards
    const isHindiLang = lang === 'hi';
    const isGujaratiLang = lang === 'gu';
    const eventCards = doc.querySelectorAll('.rjm-event, .event-card, .timeline-item, .rasam-card, .jhr-event-card, .myr-event-card, .dak-event-card, .jdi-event-card, .ivory-event, #eventsContainer > div, section#events article, article');
    events.forEach((evt, idx) => {
      if (eventCards[idx]) {
        const card = eventCards[idx];
        const nameEl = card.querySelector('.rjm-event-name, .event-title, h3, h4, .dak-display, .jdi-display');
        const dateEl = card.querySelector('.rjm-event-date, .event-date, .date-badge, dd, time');
        const timeEl = card.querySelector('.rjm-event-time, .event-time, .time-badge, dd, span[class*="rounded-full"]');
        const venueEl = card.querySelector('.rjm-event-venue, .event-venue, .venue-badge');
        const addrEl = card.querySelector('.rjm-event-addr, .event-addr, .address');
        const mapLink = card.querySelector('a[href*="maps"], a.rjm-link, a[href*="google.com/maps"], a.btn-map');

        if (nameEl) {
          setMultilingualText(nameEl, evt.name, evt.nameHi, evt.nameGu, lang);
        }
        if (dateEl) dateEl.textContent = evt.date;
        if (timeEl) timeEl.textContent = evt.time;
        if (venueEl && evt.venue) venueEl.textContent = evt.venue;
        if (addrEl && venue) addrEl.textContent = venue;
        if (mapLink && evt.mapUrl) mapLink.setAttribute('href', evt.mapUrl);

        // Update any existing Google Calendar links inside template HTML
        const calLink = card.querySelector('a[href*="calendar.google.com"]');
        const calTitle = encodeURIComponent(`${evt.name} · ${coupleTitle}`);
        const calDetails = encodeURIComponent(`Auspicious Wedding Celebration of ${coupleTitle} at ${evt.venue || venue}. We cordially invite you with family!`);
        const calLoc = encodeURIComponent(`${evt.venue || venue}, ${wedding.venueAddress || ''}`);
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLoc}`;
        if (calLink) {
          calLink.setAttribute('href', calUrl);
        }

        // 🌟 Smart Action Bar (Add to Google Calendar + Google Maps Directions + Dress Code)
        let actionsBar = card.querySelector('.amantran-event-smart-actions') as HTMLElement | null;
        if (!actionsBar) {
          actionsBar = doc.createElement('div');
          actionsBar.className = 'amantran-event-smart-actions';
          card.appendChild(actionsBar);
        }

        const mapNavUrl = evt.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((evt.venue || venue) + ' ' + (wedding.venueAddress || ''))}`;

        actionsBar.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(196,154,53,0.3);';

        actionsBar.innerHTML = `
          ${evt.dressCode ? `
            <div style="width: 100%; display: flex; align-items: center; gap: 5px; font-size: 11px; color: #C49A35; font-weight: 700; margin-bottom: 2px;">
              <span>👗</span>
              <span>${isHindiLang ? 'परिधान' : isGujaratiLang ? 'વેશભૂષા' : 'Dress Code'}: <strong style="color: inherit; font-weight: 800;">${evt.dressCode}</strong></span>
            </div>
          ` : ''}
          <a href="${calUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(196,154,53,0.14); border: 1px solid rgba(196,154,53,0.5); padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #8A6526; text-decoration: none; transition: all 0.2s; cursor: pointer;">
            <span>📅</span>
            <span>${isHindiLang ? 'कैलेंडर में जोड़ें' : isGujaratiLang ? 'કેલેન્ડરમાં ઉમેરો' : 'Add to Calendar'}</span>
          </a>
          <a href="${mapNavUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 5px; background: rgba(110,16,32,0.08); border: 1px solid rgba(110,16,32,0.3); padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #6E1020; text-decoration: none; transition: all 0.2s; cursor: pointer;">
            <span>📍</span>
            <span>${isHindiLang ? 'रास्ता देखें (Maps)' : isGujaratiLang ? 'દિશાનિર્દેશ (Maps)' : 'Get Directions'}</span>
          </a>
        `;
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
      (el as HTMLTextAreaElement).placeholder = `Write a heartfelt blessing for ${displayGroom} & ${displayBride}...`;
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

    // 🌸 11.5 Live Family Blessings & Wishes Wall (Interactive Guestbook)
    try {
      const isHindi = normalized.language === 'hi';
      const isGujarati = normalized.language === 'gu';
      let blessingsWall = doc.getElementById('amantran-live-blessings-wall');
      if (!blessingsWall) {
        blessingsWall = doc.createElement('section');
        blessingsWall.id = 'amantran-live-blessings-wall';
        blessingsWall.className = 'amantran-blessings-section';
        const footer = doc.querySelector('footer, .rjm-foot, .jhr-foot, .myr-foot, .dak-desk, .foot');
        if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(blessingsWall, footer);
        } else {
          (doc.querySelector('main, #root, #app') || doc.body).appendChild(blessingsWall);
        }
      }

      if (blessingsWall) {
        const wallTitle = isHindi
          ? '॥ मंगल आशीर्वाद एवं शुभकामनाएं ॥'
          : isGujarati
          ? '॥ મંગલ આશીર્વાદ અને શુભેચ્છાઓ ॥'
          : '॥ Auspicious Blessings & Wishes Wall ॥';

        const wallSubtitle = isHindi
          ? 'वर-वधू के नव-दाम्पत्य जीवन हेतु अपने स्नेहमयी आशीर्वाद व मंगल संदेश यहां प्रेषित करें:'
          : isGujarati
          ? 'નવદંપતીના સુખી દાંપત્ય જીવન માટે આપના સ્નેહભર્યા આશીર્વાદ અહીં આપો:'
          : 'Share your heartfelt congratulations, love and auspicious blessings for the royal couple:';

        const namePlaceholder = isHindi ? 'आपका शुभ नाम (उदा. शर्मा परिवार)' : isGujarati ? 'આપનું નામ' : 'Your Full Name (e.g. Sharma Family)';
        const msgPlaceholder = isHindi ? 'आपकी मंगल कामनाएं... (उदा. सदा खुश रहो! 🌸)' : isGujarati ? 'આપના શુભ આશીર્વાદ...' : 'Your heartfelt blessing message...';
        const btnText = isHindi ? '🌸 आशीर्वाद भेजें' : isGujarati ? '🌸 આશીર્વાદ મોકલો' : '🌸 Send Shubh Aashirwad';

        blessingsWall.innerHTML = `
          <div style="max-width: 600px; width: calc(100% - 32px); margin: 60px auto 30px auto; padding: 36px 24px; background: linear-gradient(135deg, #FFFDF8 0%, #FAF6EE 100%); border: 1.5px solid #C49A35; border-radius: 28px; text-align: center; color: #241A17; box-shadow: 0 16px 45px rgba(0,0,0,0.08); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
            <div style="font-size: 24px; margin-bottom: 6px;">👑 🌸 👑</div>
            <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #6E1020; margin: 0 0 8px 0; letter-spacing: 0.04em;">${wallTitle}</h3>
            <p style="font-size: 13px; color: #75675C; margin: 0 auto 20px auto; max-width: 460px; line-height: 1.5;">${wallSubtitle}</p>

            <!-- Interactive Blessings Input Form -->
            <div style="background: #FFFFFF; border: 1px solid rgba(196,154,53,0.35); border-radius: 20px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 24px; text-align: left;">
              <input id="amantran-guest-name-input" type="text" placeholder="${namePlaceholder}" style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #E8D5AD; border-radius: 12px; font-size: 13px; margin-bottom: 10px; font-family: inherit; outline: none;" />
              <textarea id="amantran-guest-msg-input" rows="2" placeholder="${msgPlaceholder}" style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #E8D5AD; border-radius: 12px; font-size: 13px; margin-bottom: 12px; font-family: inherit; resize: none; outline: none;"></textarea>
              <button id="amantran-submit-blessing-btn" type="button" style="width: 100%; background: linear-gradient(135deg, #6E1020 0%, #8C1322 100%); color: #FFFDF8; border: 1px solid #C49A35; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 12.5px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s;">
                ${btnText}
              </button>
              <div id="amantran-blessing-success" style="display: none; color: #166534; background: #DCFCE7; border: 1px solid #86EFAC; border-radius: 8px; padding: 8px; margin-top: 10px; font-size: 12px; text-align: center; font-weight: 600;">
                ✓ आपका मंगल आशीर्वाद सादर प्राप्त हुआ! हार्दिक धन्यवाद। 🌸
              </div>
            </div>

            <!-- Live Blessings Stream Container -->
            <div id="amantran-blessings-stream" style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; text-align: left; padding-right: 4px;">
              <div style="background: rgba(196,154,53,0.08); border-left: 3.5px solid #C49A35; border-radius: 12px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #6E1020; font-size: 13px;">Sharma Parivar (जयपुर)</strong>
                  <span style="font-size: 10.5px; color: #75675C; font-family: monospace;">Auspicious Blessing</span>
                </div>
                <p style="font-size: 12.5px; color: #241A17; margin: 0; line-height: 1.45; font-style: italic;">
                  "सदा सुहागिन रहो और दोनों का साथ सदा बना रहे! ईश्वर का असीम आशीर्वाद आप दोनों के नव-जीवन पर बना रहे। 🌸✨"
                </p>
              </div>
              <div style="background: rgba(196,154,53,0.08); border-left: 3.5px solid #C49A35; border-radius: 12px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #6E1020; font-size: 13px;">Uncle, Aunt &amp; Family</strong>
                  <span style="font-size: 10.5px; color: #75675C; font-family: monospace;">Heartfelt Wishes</span>
                </div>
                <p style="font-size: 12.5px; color: #241A17; margin: 0; line-height: 1.45; font-style: italic;">
                  "Wishing the royal couple a lifetime of joy, harmony, and togetherness! Lots of love and blessings! 💖"
                </p>
              </div>
            </div>
          </div>
        `;

        // Attach client-side interaction script
        const btn = doc.getElementById('amantran-submit-blessing-btn');
        if (btn && !(btn as any).__hasListener) {
          (btn as any).__hasListener = true;
          btn.addEventListener('click', () => {
            const nameInput = doc.getElementById('amantran-guest-name-input') as HTMLInputElement;
            const msgInput = doc.getElementById('amantran-guest-msg-input') as HTMLTextAreaElement;
            const successDiv = doc.getElementById('amantran-blessing-success') as HTMLDivElement;
            const stream = doc.getElementById('amantran-blessings-stream') as HTMLDivElement;

            const name = (nameInput?.value || '').trim();
            const msg = (msgInput?.value || '').trim();

            if (!name || !msg) {
              alert('कृपया अपना नाम और आशीर्वाद संदेश दोनों लिखें। (Please enter both your name and blessing)');
              return;
            }

            const newCard = doc.createElement('div');
            newCard.style.cssText = 'background: rgba(196,154,53,0.12); border-left: 3.5px solid #6E1020; border-radius: 12px; padding: 12px 16px; animation: fadeIn 0.4s ease;';
            newCard.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #6E1020; font-size: 13px;">${name}</strong>
                <span style="font-size: 10.5px; color: #166534; font-weight: 700;">Just now ✨</span>
              </div>
              <p style="font-size: 12.5px; color: #241A17; margin: 0; line-height: 1.45; font-style: italic;">
                "${msg}"
              </p>
            `;

            if (stream) {
              stream.insertBefore(newCard, stream.firstChild);
            }

            if (nameInput) nameInput.value = '';
            if (msgInput) msgInput.value = '';
            if (successDiv) {
              successDiv.style.display = 'block';
              setTimeout(() => { successDiv.style.display = 'none'; }, 5000);
            }

            // Post message to parent frame so Supabase / LocalStorage can capture it
            if (win && win.parent) {
              win.parent.postMessage({
                type: 'SUBMIT_BLESSING',
                guestName: name,
                message: msg,
                slug: normalized.slug
              }, '*');
            }
          });
        }
      }
    } catch (blessingErr) {}

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
          const recipient = normalized.shagun.recipientName || displayGroom;
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

    // 👑 12.5. Official Amantranlink Footer Branding (Guaranteed in every template & kankotri)
    try {
      let brandingEl = doc.getElementById('amantran-crafted-branding');
      if (!brandingEl) {
        brandingEl = doc.createElement('div');
        brandingEl.id = 'amantran-crafted-branding';
        brandingEl.className = 'amantran-crafted-branding-container';
        doc.body.appendChild(brandingEl);
      } else {
        // Ensure it is always pinned to the very bottom of the document
        if (brandingEl.parentNode && brandingEl.nextSibling !== null) {
          brandingEl.parentNode.appendChild(brandingEl);
        }
      }

      brandingEl.innerHTML = `
        <div style="text-align: center; padding: 32px 16px 44px 16px; background: rgba(18, 6, 9, 0.96); border-top: 1.5px solid rgba(196, 154, 53, 0.4); font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; position: relative; z-index: 99; margin-top: 50px; width: 100%; box-sizing: border-box; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
          <div style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; max-width: 500px; margin: 0 auto;">
            <a href="https://amantranlink.in" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 9px; text-decoration: none; padding: 9px 22px; border-radius: 9999px; background: linear-gradient(135deg, rgba(110, 16, 32, 0.75) 0%, rgba(196, 154, 53, 0.3) 100%); border: 1.5px solid rgba(196, 154, 53, 0.75); transition: all 0.25s ease; box-shadow: 0 4px 16px rgba(0,0,0,0.35); cursor: pointer;">
              <span style="font-size: 15px; filter: drop-shadow(0 0 6px rgba(196,154,53,0.9));">👑</span>
              <span style="font-family: 'Cinzel', serif, Georgia; font-size: 13.5px; font-weight: 700; color: #FFFDF8; letter-spacing: 0.12em; text-transform: uppercase;">Crafted with Amantranlink.in</span>
              <span style="color: #E8CD7E; font-size: 12px;">✦</span>
            </a>
            <p style="margin: 0; font-size: 11.5px; color: rgba(232, 213, 173, 0.85); letter-spacing: 0.08em; font-family: 'Cinzel', serif, Georgia; text-transform: uppercase;">
              India's Royal Luxury Digital Invitations Platform
            </p>
          </div>
        </div>
      `;
    } catch (brandingErr) {}

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
