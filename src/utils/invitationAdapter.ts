/**
 * 👑 AMANTRANLINK UNIVERSAL INVITATION DATA ADAPTER & DOM SYNCHRONIZER
 * Single pipeline transforming raw database/state records into dynamic templates.
 */

import { WeddingProjectState, ThemeId } from '../types/wedding';
import { NormalizedInvitationData } from '../types/invitation';

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
      [/ध्रुव/gi, groom.nameHi || groomName],
      [/श्रेया/gi, bride.nameHi || brideName],
      [/ધ્રુવ/gi, groom.nameGu || groomName],
      [/શ્રેયા/gi, bride.nameGu || brideName],

      // Demo Venues
      [/The Grand Haveli/gi, venue],
      [/The Milestone[\s\w,]*/gi, venue],
      [/Modasa[\s\w,]*/gi, venue],
      [/Jagmandir Island Palace/gi, venue],

      // Demo Dates
      [/3\s+December\s+2024/gi, date],
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

    // 7. Bind Dynamic Events
    const eventCards = doc.querySelectorAll('.rjm-event, .event-card, .timeline-item, .rasam-card, .jhr-event-card, .myr-event-card, .dak-event-card, article');
    events.forEach((evt, idx) => {
      if (eventCards[idx]) {
        const card = eventCards[idx];
        const nameEl = card.querySelector('.rjm-event-name, .event-title, h3, h4');
        const dateEl = card.querySelector('.rjm-event-date, .event-date, .date-badge');
        const timeEl = card.querySelector('.rjm-event-time, .event-time, .time-badge, dd');
        const venueEl = card.querySelector('.rjm-event-venue, .event-venue, .venue-badge');

        if (nameEl) nameEl.textContent = evt.name;
        if (dateEl) dateEl.textContent = evt.date;
        if (timeEl) timeEl.textContent = evt.time;
        if (venueEl && evt.venue) venueEl.textContent = evt.venue;
      }
    });

    // 8. Bind RSVP Helpline Contacts
    doc.querySelectorAll('.data-rsvp1-name').forEach((el) => { el.textContent = family.rsvp1Name; });
    doc.querySelectorAll('.data-rsvp1-phone').forEach((el) => { el.textContent = family.rsvp1Phone; });
    doc.querySelectorAll('.data-rsvp1-link').forEach((el) => { el.setAttribute('href', `tel:${family.rsvp1Phone.replace(/\s+/g, '')}`); });
    doc.querySelectorAll('.data-rsvp2-name').forEach((el) => { el.textContent = family.rsvp2Name; });
    doc.querySelectorAll('.data-rsvp2-phone').forEach((el) => { el.textContent = family.rsvp2Phone; });
    doc.querySelectorAll('.data-rsvp2-link').forEach((el) => { el.setAttribute('href', `tel:${family.rsvp2Phone.replace(/\s+/g, '')}`); });

    // 9. Broadcast window postMessage
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
