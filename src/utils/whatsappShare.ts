/**
 * 👑 AMANTRANLINK — UNIVERSAL WHATSAPP & SOCIAL SHARING ENGINE
 * Generates natural, human, ceremonial wedding invitation messages in English, Hindi, and Gujarati.
 * Supports Web Share API, direct WhatsApp Web / mobile URL dispatch, and safe clipboard fallbacks.
 */

import { WeddingProjectState, Language } from '../types/wedding';
import { GuestRecord } from '../types/guest';

export interface ShareMessageParams {
  state: WeddingProjectState;
  language?: Language;
  guest?: GuestRecord | null;
  invitationUrl: string;
}

/**
 * 🌸 Generates warm, editorial, human wedding invitation copy for WhatsApp & messaging
 */
export const formatWhatsAppWeddingMessage = ({
  state,
  language = 'en',
  guest,
  invitationUrl,
}: ShareMessageParams): string => {
  const effectiveLang: Language = language || state.language || 'en';

  // Dynamic Couple Names based on language selection
  const groom = (effectiveLang === 'hi' ? state.couple.groomHi : effectiveLang === 'gu' ? state.couple.groomGu : state.couple.groomEn) || state.couple.groomEn || 'Groom';
  const bride = (effectiveLang === 'hi' ? state.couple.brideHi : effectiveLang === 'gu' ? state.couple.brideGu : state.couple.brideEn) || state.couple.brideEn || 'Bride';
  
  const weddingDate = state.couple.weddingDate || 'Auspicious Wedding Day';
  const venue = state.couple.venueName || 'Royal Wedding Venue';

  // Respectful, natural guest salutation
  const guestSalutation = guest 
    ? (guest.family_name ? guest.family_name : guest.full_name)
    : null;

  if (effectiveLang === 'hi') {
    const greetingHeader = guestSalutation 
      ? `🙏 *सादर निमंत्रण | ${guestSalutation}*\n\n`
      : `🙏 *सादर निमंत्रण | शुभ विवाह*\n\n`;

    return `${greetingHeader}परमपिता परमात्मा एवं कुलदेवता के शुभाशीर्वाद से हमारे मांगलिक परिणय संस्कार में आपकी गरिमामयी उपस्थिति सादर प्रार्थनीय है।\n\n` +
      `👑 *${groom} संग ${bride}*\n` +
      `📅 *शुभ लग्न दिनांक:* ${weddingDate}\n` +
      `📍 *स्थान:* ${venue}\n\n` +
      `💌 *डिजिटल शाही निमंत्रण पत्रिका व RSVP:* \n${invitationUrl}\n\n` +
      `_कृपया पधारकर नवदंपति को अपना स्नेह, शुभाशीर्वाद व मंगलकामनाएं प्रदान करें।_\n` +
      `— सस्नेह निमंत्रक: ${state.family.groomParentsHi || state.family.groomParentsEn || 'समस्त परिवार'}`;
  }

  if (effectiveLang === 'gu') {
    const greetingHeader = guestSalutation 
      ? `🙏 *સ્નેહભર્યું નિમંત્રણ | ${guestSalutation}*\n\n`
      : `🙏 *સ્નેહભર્યું નિમંત્રણ | શુભ લગ્નોત્સવ*\n\n`;

    return `${greetingHeader}શ્રી ગણેશજી ની અસીમ કૃપા થી અમારા આંગણે રૂડા લગ્ન પ્રસંગે આપનું સહકુટુંબ સ્નેહભર્યું સ્વાગત છે.\n\n` +
      `👑 *${groom} અને ${bride}*\n` +
      `📅 *શુભ લગ્ન તિથિ:* ${weddingDate}\n` +
      `📍 *સ્થળ:* ${venue}\n\n` +
      `💌 *ડિજિટલ શાહી કંકોત્રી દર્શન:* \n${invitationUrl}\n\n` +
      `_આપની પાવન ઉપસ્થિતિ પ્રાર્થનીય છે._\n` +
      `— સ્નેહાધીન: ${state.family.groomParentsGu || state.family.groomParentsEn || 'સમસ્ત પરિવાર'}`;
  }

  // Default: Elegant Editorial English
  const greetingHeader = guestSalutation 
    ? `🙏 *Royal Wedding Invitation for ${guestSalutation}*\n\n`
    : `🙏 *Royal Wedding Invitation*\n\n`;

  return `${greetingHeader}With the blessings of our families and ancestors, we cordially invite you and your family to celebrate the auspicious wedding ceremony of\n\n` +
    `👑 *${groom} & ${bride}*\n` +
    `📅 *Date:* ${weddingDate}\n` +
    `📍 *Venue:* ${venue}\n\n` +
    `💌 *View Your Personal Invitation & RSVP:* \n${invitationUrl}\n\n` +
    `_We look forward to celebrating this joyful union with you!_\n` +
    `— With Warm Regards, Families of ${groom} & ${bride}`;
};

/**
 * 📲 Dispatches WhatsApp message directly or opens web client
 */
export const openWhatsAppShare = (
  message: string,
  phoneNumber?: string
) => {
  const encodedText = encodeURIComponent(message);
  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
  
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * 🌐 Native Web Share API with safe fallback
 */
export const executeNativeOrWhatsAppShare = async ({
  title,
  message,
  url,
  phoneNumber,
  onFallbackCopied,
}: {
  title: string;
  message: string;
  url: string;
  phoneNumber?: string;
  onFallbackCopied?: () => void;
}): Promise<'shared' | 'whatsapp' | 'copied' | 'error'> => {
  // 1. Try Native Mobile Web Share if supported and on mobile device
  if (typeof navigator !== 'undefined' && navigator.share && !phoneNumber) {
    try {
      await navigator.share({
        title,
        text: message,
        url,
      });
      return 'shared';
    } catch (err: any) {
      // User cancelled share dialog -> return cleanly
      if (err.name === 'AbortError') return 'shared';
    }
  }

  // 2. Open WhatsApp Web / App
  try {
    openWhatsAppShare(message, phoneNumber);
    return 'whatsapp';
  } catch (err) {
    // 3. Clipboard fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(message);
        if (onFallbackCopied) onFallbackCopied();
        return 'copied';
      } catch (clipErr) {
        return 'error';
      }
    }
    return 'error';
  }
};
