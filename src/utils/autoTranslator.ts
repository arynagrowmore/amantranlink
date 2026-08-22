// 🛡️ SHAHI STUDIO — Strict Anti-Theft, Anti-Extension, Anti-F12 & Anti-Scraper Shield
export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Completely Disable Global Right Click (No "Inspect" / "View Page Source")
  const blockContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  window.addEventListener('contextmenu', blockContextMenu, { capture: true });
  document.addEventListener('contextmenu', blockContextMenu, { capture: true });

  // 2. 🚫 Defeat Copy-Enabler & Scraper Extensions (Intercept Clipboard & Selection)
  const blockCopy = (e: ClipboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    if (!isInput) {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '👑 Shahi Studio™ — Protected Intellectual Property.');
      }
      return false;
    }
  };
  window.addEventListener('copy', blockCopy, { capture: true });
  window.addEventListener('cut', blockCopy, { capture: true });

  // 3. 🚫 Block Text Selection Highlighting across the page (except inside inputs)
  const blockSelection = (e: Event) => {
    const target = e.target as HTMLElement;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    if (!isInput) {
      e.preventDefault();
      return false;
    }
  };
  window.addEventListener('selectstart', blockSelection, { capture: true });

  // 4. 🚫 Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+P
  window.addEventListener('keydown', (e) => {
    // Block F12 Key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl+Shift+I, J, C (Inspect Element & Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      const key = e.key.toUpperCase();
      if (key === 'I' || key === 'J' || key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Block Ctrl+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl+S (Save Webpage to Disk)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl+P (Print Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 5. 🚫 Disable Drag & Drop of Images / Assets
  window.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 6. 🛡️ Anti-Tamper Protection
  try {
    console.log(
      '%c👑 SHAHI STUDIO™ %c— Royal Digital Wedding Invitations',
      'color: #6B1420; font-size: 16px; font-weight: bold; background: #EDE0C8; padding: 4px 8px; border-radius: 4px;',
      'color: #A67C3D; font-size: 12px; font-weight: bold;'
    );
  } catch (err) {}
}

const DICTIONARY: Record<string, { hi: string; gu: string }> = {
  dhruv: { hi: 'ध्रुव', gu: 'ધ્રુવ' },
  shreya: { hi: 'श्रेया', gu: 'શ્રેયા' },
  rahul: { hi: 'राहुल', gu: 'રાહુલ' },
  priya: { hi: 'प्रिया', gu: 'પ્રિયા' },
  nalin: { hi: 'नलिन', gu: 'નલિન' },
  nalinkumar: { hi: 'नलिनकुमार', gu: 'નલિનકુમાર' },
  kalpu: { hi: 'कल्पू', gu: 'કલ્પૂ' },
  kalpuben: { hi: 'कल्पूबेन', gu: 'કલ્પૂબેન' },
  sharma: { hi: 'शर्मा', gu: 'શર્મા' },
  patel: { hi: 'पटेल', gu: 'પટેલ' },
  shah: { hi: 'शाह', gu: 'શાહ' },
  desai: { hi: 'देसाई', gu: 'દેસાઈ' },
  joshi: { hi: 'जोशी', gu: 'જોશી' },
  mehta: { hi: 'मेहता', gu: 'મહેતા' },
  himmatnagar: { hi: 'हिम्मतनगर', gu: 'હિંમતનગર' },
  gujarat: { hi: 'गुजरात', gu: 'ગુજરાત' },
  ahmedabad: { hi: 'अहमदाबाद', gu: 'અમદાવાદ' },
  mumbai: { hi: 'मुंबई', gu: 'મુંબઈ' },
  delhi: { hi: 'दिल्ली', gu: 'દિલ્હી' },
  mr: { hi: 'श्री', gu: 'શ્રી' },
  mrs: { hi: 'श्रीमती', gu: 'શ્રીમતી' },
  shree: { hi: 'श्री', gu: 'શ્રી' },
  shri: { hi: 'श्री', gu: 'શ્રી' },
  shrimati: { hi: 'श्रीमती', gu: 'શ્રીમતી' },
  and: { hi: 'एवं', gu: 'અને' },
  with: { hi: 'संग', gu: 'સાથે' },
  haldi: { hi: 'हल्दी', gu: 'પીઠી / હળદર' },
  mehendi: { hi: 'मेहंदी', gu: 'મહેંદી' },
  sangeet: { hi: 'संगीत', gu: 'સંગીત સંધ્યા' },
  wedding: { hi: 'शुभ विवाह', gu: 'શુભ લગ્ન' },
  reception: { hi: 'रिसेप्शन / आशीर्वाद', gu: 'સ્નેહમિલન / રિસેપ્શન' },
  december: { hi: 'दिसंबर', gu: 'ડિસેમ્બર' },
  january: { hi: 'जनवरी', gu: 'જાન્યુઆરી' },
  february: { hi: 'फरवरी', gu: 'ફેબ્રુઆરી' },
  march: { hi: 'मार्च', gu: 'માર્ચ' },
  april: { hi: 'अप्रैल', gu: 'એપ્રિલ' },
  may: { hi: 'मई', gu: 'મે' },
  june: { hi: 'जून', gu: 'જૂન' },
  july: { hi: 'जुलाई', gu: 'જુલાઈ' },
  august: { hi: 'अगस्त', gu: 'ઓગસ્ટ' },
  september: { hi: 'सितंबर', gu: 'સપ્ટેમ્બર' },
  october: { hi: 'अक्टूबर', gu: 'ઓક્ટોબર' },
  november: { hi: 'नवंबर', gu: 'નવેમ્બર' },
};

// Character replacement table
const MULTI_CHARS: [string, string][] = [
  ['shri', 'श्री'],
  ['shree', 'श्री'],
  ['shrimati', 'श्रीमती'],
  ['dhruv', 'ध्रुव'],
  ['shreya', 'श्रेया'],
  ['nalin', 'नलिन'],
  ['kalpu', 'कल्पू'],
  ['kumar', 'कुमार'],
  ['ben', 'बेन'],
  ['bhai', 'भाई'],
  ['dhr', 'ध्र'],
  ['shr', 'श्र'],
  ['khr', 'ख्र'],
  ['ghr', 'घ्र'],
  ['chr', 'च्र'],
  ['jhr', 'झ्र'],
  ['thr', 'थ्र'],
  ['dhr', 'ध्र'],
  ['phr', 'फ्र'],
  ['bhr', 'भ्र'],
  ['kh', 'ख'],
  ['gh', 'घ'],
  ['ch', 'च'],
  ['jh', 'झ'],
  ['th', 'थ'],
  ['dh', 'ध'],
  ['ph', 'फ'],
  ['bh', 'भ'],
  ['sh', 'श'],
  ['ksh', 'क्ष'],
  ['gya', 'ज्ञ'],
  ['tra', 'त्र'],
  ['aa', 'ा'],
  ['ee', 'ी'],
  ['oo', 'ू'],
  ['ai', 'ै'],
  ['au', 'ौ'],
];

const SINGLE_CHARS: Record<string, string> = {
  k: 'क', g: 'ग', j: 'ज', t: 'त', d: 'द', n: 'न', p: 'प', b: 'ब',
  m: 'म', y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह',
  a: 'ा', i: 'ि', u: 'ु', e: 'े', o: 'ो'
};

const HI_TO_GU_OFFSET = 0x0A80 - 0x0900;

export function autoTranslateText(input: string): { hi: string; gu: string } {
  if (!input || input.trim() === '') return { hi: '', gu: '' };

  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct whole-string match
  if (DICTIONARY[lower]) {
    return DICTIONARY[lower];
  }

  // 2. Word-by-word tokenization
  const tokens = input.split(/(\s+|&|,|\.|\+|-)/);
  const hiTokens: string[] = [];
  const guTokens: string[] = [];

  tokens.forEach((token) => {
    const clean = token.toLowerCase().trim();
    if (!clean || /^(\s+|&|,|\.|\+|-)$/.test(token)) {
      hiTokens.push(token);
      guTokens.push(token);
      return;
    }

    // Check Dictionary
    if (DICTIONARY[clean]) {
      hiTokens.push(DICTIONARY[clean].hi);
      guTokens.push(DICTIONARY[clean].gu);
      return;
    }

    // Phonetic Conversion
    let processed = clean;
    MULTI_CHARS.forEach(([en, hi]) => {
      processed = processed.split(en).join(hi);
    });

    let hiWord = '';
    for (let i = 0; i < processed.length; i++) {
      const char = processed[i];
      if (SINGLE_CHARS[char]) {
        hiWord += SINGLE_CHARS[char];
      } else {
        hiWord += char;
      }
    }

    // Fix leading vowel matras (e.g. 'ा' -> 'आ')
    if (hiWord.startsWith('ा')) hiWord = 'आ' + hiWord.slice(1);
    if (hiWord.startsWith('ि')) hiWord = 'इ' + hiWord.slice(1);
    if (hiWord.startsWith('ी')) hiWord = 'ई' + hiWord.slice(1);
    if (hiWord.startsWith('ु')) hiWord = 'उ' + hiWord.slice(1);
    if (hiWord.startsWith('ू')) hiWord = 'ऊ' + hiWord.slice(1);
    if (hiWord.startsWith('े')) hiWord = 'ए' + hiWord.slice(1);
    if (hiWord.startsWith('ो')) hiWord = 'ओ' + hiWord.slice(1);

    // Convert Hindi Devanagari to Gujarati Unicode
    let guWord = '';
    for (let i = 0; i < hiWord.length; i++) {
      const code = hiWord.charCodeAt(i);
      if (code >= 0x0900 && code <= 0x097F) {
        guWord += String.fromCharCode(code + HI_TO_GU_OFFSET);
      } else {
        guWord += hiWord[i];
      }
    }

    hiTokens.push(hiWord);
    guTokens.push(guWord);
  });

  return {
    hi: hiTokens.join(''),
    gu: guTokens.join(''),
  };
}

// Online Google Input Tools API integration with automatic fallback
export async function fetchOnlineTransliteration(text: string): Promise<{ hi: string; gu: string }> {
  if (!text || text.trim() === '') return { hi: '', gu: '' };

  try {
    const [hiRes, guRes] = await Promise.all([
      fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=gu-t-i0-und&num=1`)
        .then((r) => r.json())
        .catch(() => null),
    ]);

    const hiText = hiRes && hiRes[1]?.[0]?.[1]?.[0] ? hiRes[1][0][1][0] : autoTranslateText(text).hi;
    const guText = guRes && guRes[1]?.[0]?.[1]?.[0] ? guRes[1][0][1][0] : autoTranslateText(text).gu;

    return { hi: hiText, gu: guText };
  } catch (err) {
    return autoTranslateText(text);
  }
}
