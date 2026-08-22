// Test the logic of generateWhatsAppMessage
function generateWhatsAppMessage({ language = 'en', state, invitationUrl }) {
  const normLang = (language || state?.language || 'en').toLowerCase();

  const groomEn = state?.couple?.groomEn || 'Dhruv';
  const brideEn = state?.couple?.brideEn || 'Shreya';
  const groomHi = state?.couple?.groomHi || groomEn;
  const brideHi = state?.couple?.brideHi || brideEn;
  const groomGu = state?.couple?.groomGu || groomEn;
  const brideGu = state?.couple?.brideGu || brideEn;

  const weddingDate = state?.couple?.weddingDate || '3 December 2026';
  const muhuratTime = state?.couple?.muhuratTime || '06:30 PM';

  const venueName = state?.couple?.venueName || 'The Milestone';
  const venueAddress = state?.couple?.venueAddress || 'Himmatnagar, Gujarat';
  const fullVenue = venueAddress ? `${venueName}, ${venueAddress}` : venueName;

  const parentsEn = state?.family?.groomParentsEn || state?.family?.brideParentsEn || 'Family & Well-wishers';
  const parentsHi = state?.family?.groomParentsHi || state?.family?.brideParentsHi || 'परिवार व आमंत्रक';
  const parentsGu = state?.family?.groomParentsGu || state?.family?.brideParentsGu || 'પરિવાર અને આમંત્રક';

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

async function runTests() {
  console.log('👑 ========================================================');
  console.log('👑 SHAHI STUDIO MULTILINGUAL WHATSAPP MESSAGE AUDIT SUITE');
  console.log('👑 ========================================================\n');

  const testState = {
    language: 'en',
    theme: 'rajmahal',
    couple: {
      groomEn: 'Dhruv',
      groomHi: 'ध्रुव',
      groomGu: 'ધ્રુવ',
      brideEn: 'Shreya',
      brideHi: 'श्रेया',
      brideGu: 'શ્રેયા',
      weddingDate: '3 December 2026',
      muhuratTime: '06:30 PM',
      venueName: 'The Milestone',
      venueAddress: 'Himmatnagar, Gujarat'
    },
    family: {
      groomParentsEn: 'Mr. & Mrs. Patel',
      groomParentsHi: 'श्री एवं श्रीमती पटेल',
      groomParentsGu: 'શ્રી અને શ્રીમતી પટેલ'
    }
  };

  const inviteUrl = 'https://shahistudio.com/i/dhruv-shreya';

  let passed = 0;
  let total = 0;

  // TEST 1: EN English Message
  total++;
  const msgEn = generateWhatsAppMessage({ language: 'en', state: testState, invitationUrl: inviteUrl });
  if (
    msgEn.includes('With the blessings of our families') &&
    msgEn.includes('Dhruv & Shreya') &&
    msgEn.includes('3 December 2026') &&
    msgEn.includes('06:30 PM') &&
    msgEn.includes('The Milestone, Himmatnagar, Gujarat') &&
    msgEn.includes(inviteUrl)
  ) {
    console.log('✅ [TEST 1: English WhatsApp Message] PASSED');
    passed++;
  } else {
    console.error('❌ [TEST 1: English WhatsApp Message] FAILED');
  }

  // TEST 2: HI Hindi Devanagari Message
  total++;
  const msgHi = generateWhatsAppMessage({ language: 'hi', state: testState, invitationUrl: inviteUrl });
  if (
    msgHi.includes('श्री गणेशाय नमः') &&
    msgHi.includes('ध्रुव') &&
    msgHi.includes('श्रेया') &&
    msgHi.includes('3 December 2026') &&
    msgHi.includes('The Milestone, Himmatnagar, Gujarat') &&
    msgHi.includes(inviteUrl)
  ) {
    console.log('✅ [TEST 2: Hindi Devanagari WhatsApp Message] PASSED');
    passed++;
  } else {
    console.error('❌ [TEST 2: Hindi Devanagari WhatsApp Message] FAILED');
  }

  // TEST 3: GU Gujarati Script Message
  total++;
  const msgGu = generateWhatsAppMessage({ language: 'gu', state: testState, invitationUrl: inviteUrl });
  if (
    msgGu.includes('શ્રી ગણેશાય નમઃ') &&
    msgGu.includes('ધ્રુવ') &&
    msgGu.includes('શ્રેયા') &&
    msgGu.includes('3 December 2026') &&
    msgGu.includes('The Milestone, Himmatnagar, Gujarat') &&
    msgGu.includes(inviteUrl)
  ) {
    console.log('✅ [TEST 3: Gujarati Script WhatsApp Message] PASSED');
    passed++;
  } else {
    console.error('❌ [TEST 3: Gujarati Script WhatsApp Message] FAILED');
  }

  // TEST 4: Fallback for invalid or missing language
  total++;
  const msgFallback = generateWhatsAppMessage({ language: 'invalid_lang', state: testState, invitationUrl: inviteUrl });
  if (msgFallback.includes('With the blessings of our families')) {
    console.log('✅ [TEST 4: Default Fallback to EN on Invalid Language] PASSED');
    passed++;
  } else {
    console.error('❌ [TEST 4: Default Fallback to EN on Invalid Language] FAILED');
  }

  console.log('\n👑 ========================================================');
  console.log(`👑 RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('👑 ========================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
