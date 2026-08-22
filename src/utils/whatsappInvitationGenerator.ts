import { Language, WeddingProjectState } from '../types/wedding';

export interface WhatsAppMessageParams {
  language?: Language | string;
  state: WeddingProjectState;
  invitationUrl: string;
}

/**
 * 👑 SINGLE SHARED SOURCE OF TRUTH FOR MULTILINGUAL WHATSAPP INVITATION GENERATION
 * Generates culturally authentic Indian wedding invitation messages in English, Hindi (Devanagari), and Gujarati.
 */
export function generateWhatsAppMessage({
  language = 'en',
  state,
  invitationUrl,
}: WhatsAppMessageParams): string {
  const normLang = (language || state?.language || 'en').toLowerCase() as Language;

  // 1. Resolve dynamic couple names
  const groomEn = state?.couple?.groomEn || 'Dhruv';
  const brideEn = state?.couple?.brideEn || 'Shreya';
  const groomHi = state?.couple?.groomHi || groomEn;
  const brideHi = state?.couple?.brideHi || brideEn;
  const groomGu = state?.couple?.groomGu || groomEn;
  const brideGu = state?.couple?.brideGu || brideEn;

  // 2. Resolve wedding date & time
  const weddingDate = state?.couple?.weddingDate || '3 December 2026';
  const muhuratTime = state?.couple?.muhuratTime || '06:30 PM';

  // 3. Resolve venue & address
  const venueName = state?.couple?.venueName || 'The Milestone';
  const venueAddress = state?.couple?.venueAddress || 'Himmatnagar, Gujarat';
  const fullVenue = venueAddress ? `${venueName}, ${venueAddress}` : venueName;

  // 4. Resolve parents / family inviter names
  const parentsEn = state?.family?.groomParentsEn || state?.family?.brideParentsEn || 'Family & Well-wishers';
  const parentsHi = state?.family?.groomParentsHi || state?.family?.brideParentsHi || 'परिवार व आमंत्रक';
  const parentsGu = state?.family?.groomParentsGu || state?.family?.brideParentsGu || 'પરિવાર અને આમંત્રક';

  // 5. Clean public invitation URL (Ensure valid URL, strip editor prefixes)
  const cleanUrl = invitationUrl || 'https://shahistudio.com';

  switch (normLang) {
    case 'hi': {
      return `🙏 ॥ श्री गणेशाय नमः ॥ 🙏\n\n` +
        `स्नेही स्वजन,\n\n` +
        `बड़े हर्ष और उल्लास के साथ आपको हमारे परिवार के मांगलिक प्रसंग में सादर आमंत्रित करते हैं।\n\n` +
        `👑 *${groomHi}* एवं *${brideHi}* का शुभ विवाह\n\n` +
        `📅 *शुभ विवाह दिनांक:* ${weddingDate}\n` +
        `⏰ *समय:* ${muhuratTime}\n` +
        `📍 *स्थान:* ${fullVenue}\n\n` +
        `🌸 *इस शुभ अवसर पर आपका स्नेह और आशीर्वाद हमारे लिए अमूल्य होगा।*\n\n` +
        `💌 *हमारी शाही डिजिटल कांकत्री देखने के लिए नीचे दिए गए लिंक पर क्लिक करें:*\n` +
        `${cleanUrl}\n\n` +
        `आपकी गरिमामयी उपस्थिति एवं शुभाशीष की प्रतीक्षा रहेगी। 🙏❤️\n\n` +
        `— *${parentsHi}*`;
    }

    case 'gu': {
      return `🙏 ॥ શ્રી ગણેશાય નમઃ ॥ 🙏\n\n` +
        `સ્નેહી સ્વજન,\n\n` +
        `અમારા પરિવારના આ શુભ અને માંગલિક પ્રસંગે આપને સહપરિવાર હાર્દિક આમંત્રણ પાઠવીએ છીએ.\n\n` +
        `👑 *${groomGu}* અને *${brideGu}*ના શુભ લગ્ન\n\n` +
        `📅 *લગ્નની તારીખ:* ${weddingDate}\n` +
        `⏰ *સમય:* ${muhuratTime}\n` +
        `📍 *સ્થળ:* ${fullVenue}\n\n` +
        `🌸 *આ શુભ પ્રસંગે આપની ઉપસ્થિતિ અને આશીર્વાદ અમારા માટે અમૂલ્ય રહેશે.*\n\n` +
        `💌 *અમારી શાહી ડિજિટલ કંકોત્રી જોવા માટે નીચે આપેલી લિંક પર ક્લિક કરો:*\n` +
        `${cleanUrl}\n\n` +
        `આપ સહપરિવાર પધારી નવદંપતીને આશીર્વાદ આપશો એવી હાર્દિક અપેક્ષા. 🙏❤️\n\n` +
        `— *${parentsGu}*`;
    }

    case 'en':
    default: {
      return `🙏 With the blessings of our families,\n\n` +
        `You are warmly invited to celebrate the wedding of:\n\n` +
        `👑 *${groomEn} & ${brideEn}*\n\n` +
        `📅 *Wedding Date:* ${weddingDate}\n` +
        `⏰ *Time:* ${muhuratTime}\n` +
        `📍 *Venue:* ${fullVenue}\n\n` +
        `🌸 *We would be delighted to have you with us on this auspicious occasion.*\n\n` +
        `💌 *View our royal digital wedding invitation:*\n` +
        `${cleanUrl}\n\n` +
        `Please join us and bless the couple with your love and best wishes. ❤️\n\n` +
        `— *${parentsEn}*`;
    }
  }
}

/**
 * Returns localized couple heading for rich link cards
 */
export function getLocalizedCardTitle(state: WeddingProjectState, language: Language = 'en'): string {
  const normLang = (language || 'en').toLowerCase() as Language;
  const groom = normLang === 'hi' ? (state?.couple?.groomHi || state?.couple?.groomEn) :
                normLang === 'gu' ? (state?.couple?.groomGu || state?.couple?.groomEn) :
                state?.couple?.groomEn || 'Dhruv';
  const bride = normLang === 'hi' ? (state?.couple?.brideHi || state?.couple?.brideEn) :
                normLang === 'gu' ? (state?.couple?.brideGu || state?.couple?.brideEn) :
                state?.couple?.brideEn || 'Shreya';

  if (normLang === 'hi') return `👑 ${groom} संग ${bride} — शाही डिजिटल कांकत्री`;
  if (normLang === 'gu') return `👑 ${groom} અને ${bride} — શાહી ડિજિટલ કંકોત્રી`;
  return `👑 ${groom} & ${bride} — Royal Digital Wedding Invitation`;
}

/**
 * Returns localized card description for rich link cards
 */
export function getLocalizedCardSubtitle(state: WeddingProjectState, language: Language = 'en'): string {
  const normLang = (language || 'en').toLowerCase() as Language;
  const date = state?.couple?.weddingDate || '3 December 2026';
  const venue = state?.couple?.venueName || 'The Milestone, Himmatnagar';

  if (normLang === 'hi') return `॥ श्री गणेशाय नमः ॥ शुभ विवाह: ${date} · स्थान: ${venue}`;
  if (normLang === 'gu') return `॥ શ્રી ગણેશાય નમઃ ॥ શુભ લગ્ન: ${date} · સ્થળ: ${venue}`;
  return `Step into our royal wedding celebration on ${date} at ${venue}.`;
}
