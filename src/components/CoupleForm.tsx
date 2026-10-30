import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle, Heart, MapPin, Calendar as CalendarIcon, Hash, Clock } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { fetchOnlineTransliteration } from '../utils/autoTranslator';

interface CoupleFormProps {
  couple: WeddingProjectState['couple'];
  family?: WeddingProjectState['family'];
  onChange: (updated: Partial<WeddingProjectState['couple']>) => void;
  onChangeFamily?: (updated: Partial<WeddingProjectState['family']>) => void;
  onSaveAndNext: () => void;
  theme?: WeddingProjectState['theme'];
  invitationType?: WeddingProjectState['invitation_type'];
}

export const CoupleForm: React.FC<CoupleFormProps> = ({ 
  couple, 
  family,
  onChange, 
  onChangeFamily,
  onSaveAndNext,
  theme,
  invitationType,
}) => {
  const isEngagement = invitationType === 'engagement';
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedDateIso, setSelectedDateIso] = useState<string>(isEngagement ? '2027-01-18' : '2026-12-03');
  const [selectedMuhurat, setSelectedMuhurat] = useState<string>('06:30 PM (Godhuli Bela / गोधूलि बेला)');

  const muhuratOptions = [
    '06:30 PM (Godhuli Bela / गोधूलि बेला)',
    '07:00 PM (Shubh Sandhya / शुभ संध्या)',
    '11:45 AM (Abhijit Muhurat / अभिजित मुहूर्त)',
    '04:30 AM (Brahma Muhurat / ब्रह्म मुहूर्त)',
    '11:30 PM (Nishita Muhurat / निशिता मुहूर्त)',
    '09:00 AM (Pratah Kaal / प्रातः काल)',
  ];

  const handleDatePick = (isoVal: string) => {
    setSelectedDateIso(isoVal);
    if (!isoVal) return;
    try {
      const parts = isoVal.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const formattedDate = `${day} ${month} ${year}`;
        const finalWeddingString = `${formattedDate} · ${selectedMuhurat.split(' (')[0]}`;
        
        onChange({
          weddingDate: finalWeddingString,
        });
      }
    } catch (e) {}
  };

  const handleMuhuratChange = (muhurat: string) => {
    setSelectedMuhurat(muhurat);
    if (selectedDateIso) {
      const parts = selectedDateIso.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const formattedDate = `${day} ${month} ${year}`;
        onChange({
          weddingDate: `${formattedDate} · ${muhurat.split(' (')[0]}`,
        });
      }
    }
  };

  const handleGroomEnChange = async (val: string) => {
    setErrorMessage('');
    const gInitial = val.trim().charAt(0).toUpperCase() || 'R';
    const bInitial = couple.brideEn.trim().charAt(0).toUpperCase() || 'I';
    const cleanGroom = val.trim() || 'Groom';
    const cleanBride = couple.brideEn.trim() || 'Bride';

    const autoMark = `${gInitial} · ${bInitial}`;
    const autoHashtag = `#${cleanGroom}Ki${cleanBride}`;

    onChange({
      groomEn: val,
      mark: autoMark,
      hashtag: autoHashtag,
    });

    if (val.trim()) {
      const { hi, gu } = await fetchOnlineTransliteration(val);
      onChange({
        groomEn: val,
        groomHi: hi,
        groomGu: gu,
        mark: autoMark,
        hashtag: autoHashtag,
      });
    }
  };

  const handleBrideEnChange = async (val: string) => {
    setErrorMessage('');
    const gInitial = couple.groomEn.trim().charAt(0).toUpperCase() || 'R';
    const bInitial = val.trim().charAt(0).toUpperCase() || 'I';
    const cleanGroom = couple.groomEn.trim() || 'Groom';
    const cleanBride = val.trim() || 'Bride';

    const autoMark = `${gInitial} · ${bInitial}`;
    const autoHashtag = `#${cleanGroom}Ki${cleanBride}`;

    onChange({
      brideEn: val,
      mark: autoMark,
      hashtag: autoHashtag,
    });

    if (val.trim()) {
      const { hi, gu } = await fetchOnlineTransliteration(val);
      onChange({
        brideEn: val,
        brideHi: hi,
        brideGu: gu,
        mark: autoMark,
        hashtag: autoHashtag,
      });
    }
  };

  const handleValidateAndSave = () => {
    if (!couple.groomEn.trim()) {
      setErrorMessage(isEngagement ? '⚠️ Please enter Person 1 Name in English.' : '⚠️ Please enter the Groom Name in English.');
      return;
    }
    if (!couple.brideEn.trim()) {
      setErrorMessage(isEngagement ? '⚠️ Please enter Person 2 Name in English.' : '⚠️ Please enter the Bride Name in English.');
      return;
    }
    if (!couple.weddingDate.trim()) {
      setErrorMessage(isEngagement ? '⚠️ Please enter or select the Engagement Date.' : '⚠️ Please enter or select the Auspicious Wedding Date.');
      return;
    }
    if (!couple.venueName.trim()) {
      setErrorMessage(isEngagement ? '⚠️ Please enter the Celebration Venue & City.' : '⚠️ Please enter the Wedding Venue & City.');
      return;
    }

    setErrorMessage('');
    onSaveAndNext();
  };

  return (
    <div className="flex flex-col h-full space-y-5 font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#6E1020] flex items-center gap-1.5">
            <span>{isEngagement ? 'Couple Details & Auspicious Date' : 'Bride & Groom Details'}</span>
            <span className="text-base" aria-hidden="true">{isEngagement ? '💍' : '💑'}</span>
          </h3>
          <span className="text-xs text-[#75675C]">
            {isEngagement ? 'Shahi Sagai · Auspicious Muhurat & Names' : 'Shubh Vivah · Auspicious Muhurat & Names'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#6E1020] bg-[#FAF6EE] border border-[#E8DCC8] px-2.5 py-0.5 rounded-full font-bold tabular-nums">
          Step 2 of 10
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div aria-live="polite" className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] flex items-center gap-2 text-xs text-[#8C4A4A]">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. GROOM / PERSON 1 SECTION */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-[0_4px_16px_-2px_rgba(67,9,20,0.04)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8DCC8]/60 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#FAF6EE] text-[#6E1020] border border-[#E8DCC8] flex items-center justify-center text-xs font-bold font-serif">
              1
            </div>
            <h4 className="font-serif font-bold text-lg text-[#6E1020]">
              {isEngagement ? 'Person 1 / Partner (Groom / वर)' : 'Dulha (Groom Details / વરરાજા) *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#167A5A]" aria-hidden="true" /> Trilingual Auto-Fill
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label htmlFor="groom-en-name" className="block text-xs font-semibold text-[#241A17] mb-1.5 cursor-pointer">
            {isEngagement ? 'Person 1 Name in English *' : 'Groom Name in English *'}
          </label>
          <input
            id="groom-en-name"
            name="groomEn"
            type="text"
            value={couple.groomEn}
            onChange={(e) => handleGroomEnChange(e.target.value)}
            placeholder={isEngagement ? 'e.g. Kabir' : 'Groom Name (e.g. Kabir)'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label htmlFor="groom-hi-name" className="block text-[11px] text-[#75675C] mb-1 font-medium cursor-pointer">
              नाम (हिन्दी में)
            </label>
            <input
              id="groom-hi-name"
              name="groomHi"
              type="text"
              value={couple.groomHi}
              onChange={(e) => onChange({ groomHi: e.target.value })}
              placeholder={isEngagement ? 'उदा. कबीर' : 'वर का नाम (उदा. कबीर)'}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
          <div>
            <label htmlFor="groom-gu-name" className="block text-[11px] text-[#75675C] mb-1 font-medium cursor-pointer">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              id="groom-gu-name"
              name="groomGu"
              type="text"
              value={couple.groomGu}
              onChange={(e) => onChange({ groomGu: e.target.value })}
              placeholder={isEngagement ? 'દા.ત. કબીર' : 'વરરાજાનું નામ (દા.ત. કબીર)'}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Groom's Parents Input */}
        {onChangeFamily && (
          <div className="pt-2.5 border-t border-[#E8DCC8]/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="groom-parents-input" className="block text-xs font-bold text-[#6E1020] cursor-pointer">
                Groom's Parents (वर के माता-पिता का नाम)
              </label>
              <span className="text-[10px] text-[#75675C]">उदा. श्री नलिनकुमार एवं श्रीमती कल्पूबेन</span>
            </div>
            <input
              id="groom-parents-input"
              type="text"
              value={family?.groomParentsEn || ''}
              onChange={async (e) => {
                const val = e.target.value;
                onChangeFamily({ groomParentsEn: val });
                if (val.trim()) {
                  const { hi, gu } = await fetchOnlineTransliteration(val);
                  onChangeFamily({ groomParentsEn: val, groomParentsHi: hi, groomParentsGu: gu });
                }
              }}
              placeholder="e.g. Mr. Nalinkumar & Mrs. Kalpuben"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* 2. BRIDE / PERSON 2 SECTION */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-[0_4px_16px_-2px_rgba(67,9,20,0.04)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8DCC8]/60 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#FAF6EE] text-[#6E1020] border border-[#E8DCC8] flex items-center justify-center text-xs font-bold font-cormorant">
              2
            </div>
            <h4 className="font-cormorant font-bold text-lg text-[#6E1020]">
              {isEngagement ? 'Person 2 / Partner (Bride / वधू)' : 'Dulhan (Bride Details / કન્યા) *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#167A5A]" aria-hidden="true" /> Trilingual Auto-Fill
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label htmlFor="bride-en-name" className="block text-xs font-semibold text-[#241A17] mb-1.5 cursor-pointer">
            {isEngagement ? 'Person 2 Name in English *' : 'Bride Name in English *'}
          </label>
          <input
            id="bride-en-name"
            name="brideEn"
            type="text"
            value={couple.brideEn}
            onChange={(e) => handleBrideEnChange(e.target.value)}
            placeholder={isEngagement ? 'e.g. Ananya' : 'Bride Name (e.g. Ananya)'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label htmlFor="bride-hi-name" className="block text-[11px] text-[#75675C] mb-1 font-medium cursor-pointer">
              नाम (हिन्दी में)
            </label>
            <input
              id="bride-hi-name"
              name="brideHi"
              type="text"
              value={couple.brideHi}
              onChange={(e) => onChange({ brideHi: e.target.value })}
              placeholder={isEngagement ? 'उदा. अनन्या' : 'वधू का नाम (उदा. अनन्या)'}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
          <div>
            <label htmlFor="bride-gu-name" className="block text-[11px] text-[#75675C] mb-1 font-medium cursor-pointer">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              id="bride-gu-name"
              name="brideGu"
              type="text"
              value={couple.brideGu}
              onChange={(e) => onChange({ brideGu: e.target.value })}
              placeholder={isEngagement ? 'દા.ત. અનન્યા' : 'કન્યાનું નામ (દા.ત. અનન્યા)'}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Bride's Parents Input */}
        {onChangeFamily && (
          <div className="pt-2.5 border-t border-[#E8DCC8]/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="bride-parents-input" className="block text-xs font-bold text-[#6E1020] cursor-pointer">
                Bride's Parents (वधू के माता-पिता का नाम)
              </label>
              <span className="text-[10px] text-[#75675C]">उदा. श्री विक्रम एवं श्रीमती ईशानी कपूर</span>
            </div>
            <input
              id="bride-parents-input"
              type="text"
              value={family?.brideParentsEn || ''}
              onChange={async (e) => {
                const val = e.target.value;
                onChangeFamily({ brideParentsEn: val });
                if (val.trim()) {
                  const { hi, gu } = await fetchOnlineTransliteration(val);
                  onChangeFamily({ brideParentsEn: val, brideParentsHi: hi, brideParentsGu: gu });
                }
              }}
              placeholder="e.g. Mr. Vikram & Mrs. Ishani Kapoor"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Monogram & Hashtag Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-[0_4px_16px_-2px_rgba(67,9,20,0.04)] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="couple-monogram" className="block text-xs font-semibold text-[#241A17] mb-1.5 flex items-center gap-1 cursor-pointer">
              <Heart className="w-3.5 h-3.5 text-[#C49A35]" aria-hidden="true" />
              <span>Couple Monogram</span>
            </label>
            <input
              id="couple-monogram"
              name="mark"
              type="text"
              value={couple.mark || ''}
              onChange={(e) => onChange({ mark: e.target.value })}
              placeholder="e.g. R · I"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
          <div>
            <label htmlFor="couple-hashtag" className="block text-xs font-semibold text-[#241A17] mb-1.5 flex items-center gap-1 cursor-pointer">
              <Hash className="w-3.5 h-3.5 text-[#C49A35]" aria-hidden="true" />
              <span>{isEngagement ? 'Engagement Hashtag' : 'Wedding Hashtag'}</span>
            </label>
            <input
              id="couple-hashtag"
              name="hashtag"
              type="text"
              value={couple.hashtag || ''}
              onChange={(e) => onChange({ hashtag: e.target.value })}
              placeholder="e.g. #RudraWedsIshani"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 3. DATE & AUSPICIOUS MUHURAT */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-[0_4px_16px_-2px_rgba(67,9,20,0.04)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8DCC8]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#C49A35]" aria-hidden="true" />
            <h4 className="font-cormorant font-bold text-lg text-[#6E1020]">
              {isEngagement ? 'Engagement Date & Muhurat *' : 'Wedding Date & Shubh Muhurat *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#C49A35] font-bold">
            Live Countdown
          </span>
        </div>

        {/* Date Picker Input */}
        <div>
          <label htmlFor="wedding-date-iso" className="block text-xs font-semibold text-[#241A17] mb-1.5 cursor-pointer">
            {isEngagement ? 'Choose Engagement Date' : 'Choose Wedding Date'}
          </label>
          <input
            id="wedding-date-iso"
            name="weddingDateIso"
            type="date"
            value={selectedDateIso}
            onChange={(e) => handleDatePick(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
          />
        </div>

        {/* Auspicious Muhurat Selector Dropdown */}
        <div>
          <label htmlFor="auspicious-muhurat-select" className="block text-xs font-semibold text-[#241A17] mb-1.5 flex items-center gap-1 cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-[#C49A35]" aria-hidden="true" />
            <span>{isEngagement ? 'Select Auspicious Sagai Muhurat' : 'Select Auspicious Muhurat (शुभ मुहूर्त)'}</span>
          </label>
          <select
            id="auspicious-muhurat-select"
            name="muhurat"
            value={selectedMuhurat}
            onChange={(e) => handleMuhuratChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-semibold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
          >
            {muhuratOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Final Formatted Date String */}
        <div className="pt-1">
          <label htmlFor="formatted-wedding-date" className="block text-[10px] font-mono text-[#75675C] mb-1 cursor-pointer">
            Final Formatted Date on Invitation
          </label>
          <input
            id="formatted-wedding-date"
            name="weddingDate"
            type="text"
            value={couple.weddingDate}
            onChange={(e) => {
              setErrorMessage('');
              onChange({ weddingDate: e.target.value });
            }}
            placeholder={isEngagement ? '18 January 2027 · 06:30 PM' : '3 December 2026 · 06:30 PM'}
            className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-bold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs tabular-nums"
          />
        </div>
      </div>

      {/* Venue & Google Maps Link */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8DCC8] shadow-[0_4px_16px_-2px_rgba(67,9,20,0.04)] space-y-3">
        <label htmlFor="venue-name" className="block text-xs font-bold text-[#6E1020] flex items-center gap-1.5 cursor-pointer">
          <MapPin className="w-3.5 h-3.5 text-[#C49A35]" aria-hidden="true" />
          <span>{isEngagement ? 'Celebration Venue & City *' : 'Royal Wedding Venue & City *'}</span>
        </label>
        <input
          id="venue-name"
          name="venueName"
          type="text"
          value={couple.venueName}
          onChange={(e) => {
            setErrorMessage('');
            onChange({ venueName: e.target.value });
          }}
          placeholder={isEngagement ? 'The Grand Palace, Udaipur' : 'The Milestone, Himmatnagar, Gujarat'}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs font-semibold text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
        />
        <div>
          <label htmlFor="maps-url" className="block text-[10px] font-mono text-[#75675C] mb-1 cursor-pointer">
            Google Maps Location Link (Optional)
          </label>
          <input
            id="maps-url"
            name="mapUrl"
            type="url"
            value={couple.mapUrl}
            onChange={(e) => onChange({ mapUrl: e.target.value })}
            placeholder="https://maps.google.com/…"
            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5]/60 border border-[#E8DCC8] text-xs text-[#241A17] hover:border-[#C49A35]/60 focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#C49A35] focus-visible:ring-2 focus-visible:ring-[#C49A35]/25 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 📌 STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#E8DCC8] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={handleValidateAndSave}
          className="w-full py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(110,16,32,0.25)] border border-[#C49A35]/60 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C49A35]"
        >
          <Check className="w-4 h-4 text-[#C49A35]" aria-hidden="true" />
          <span>{isEngagement ? 'Save & Continue to Events' : 'Save & Continue to Mangal Rasams'}</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default CoupleForm;
