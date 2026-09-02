import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle, Heart, MapPin, Calendar as CalendarIcon, Hash, Clock } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { fetchOnlineTransliteration } from '../utils/autoTranslator';

interface CoupleFormProps {
  couple: WeddingProjectState['couple'];
  onChange: (updated: Partial<WeddingProjectState['couple']>) => void;
  onSaveAndNext: () => void;
  theme?: WeddingProjectState['theme'];
  invitationType?: WeddingProjectState['invitation_type'];
}

export const CoupleForm: React.FC<CoupleFormProps> = ({ 
  couple, 
  onChange, 
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
    <div className="flex flex-col h-full space-y-5 font-manrope">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#6E1020] flex items-center gap-1.5">
            <span>{isEngagement ? 'Couple Details & Auspicious Date' : 'Bride & Groom Details'}</span>
            <span className="text-base">{isEngagement ? '💍' : '💑'}</span>
          </h3>
          <span className="text-xs text-[#75675C]">
            {isEngagement ? 'Shahi Sagai · Auspicious Muhurat & Names' : 'Shubh Vivah · Auspicious Muhurat & Names'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#6E1020] bg-[#F8F3E8] border border-[#E8D5AD] px-2.5 py-0.5 rounded-full font-bold">
          Step 2 of 8
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F0D5D5] flex items-center gap-2 text-xs text-[#8C4A4A]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. GROOM / PERSON 1 SECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs font-bold font-cormorant">
              1
            </div>
            <h4 className="font-cormorant font-bold text-base text-[#6E1020]">
              {isEngagement ? 'Person 1 / Partner (Groom / वर)' : 'Dulha (Groom Details / વરરાજા) *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#167A5A]" /> Trilingual Auto-Fill
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label className="block text-xs font-semibold text-[#241A17] mb-1">
            {isEngagement ? 'Person 1 Name in English *' : 'Groom Name in English *'}
          </label>
          <input
            type="text"
            value={couple.groomEn}
            onChange={(e) => handleGroomEnChange(e.target.value)}
            placeholder={isEngagement ? 'e.g. Aarav' : 'e.g. Rudra'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] text-[#75675C] mb-1 font-medium">
              नाम (हिन्दी में)
            </label>
            <input
              type="text"
              value={couple.groomHi}
              onChange={(e) => onChange({ groomHi: e.target.value })}
              placeholder={isEngagement ? 'उदा. आरव' : 'उदा. रुद्र'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#75675C] mb-1 font-medium">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              type="text"
              value={couple.groomGu}
              onChange={(e) => onChange({ groomGu: e.target.value })}
              placeholder={isEngagement ? 'દા.ત. આરવ' : 'દા.ત. રુદ્ર'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 2. BRIDE / PERSON 2 SECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs font-bold font-cormorant">
              2
            </div>
            <h4 className="font-cormorant font-bold text-base text-[#6E1020]">
              {isEngagement ? 'Person 2 / Partner (Bride / वधू)' : 'Dulhan (Bride Details / કન્યા) *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#167A5A] bg-[#167A5A]/10 border border-[#167A5A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#167A5A]" /> Trilingual Auto-Fill
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label className="block text-xs font-semibold text-[#241A17] mb-1">
            {isEngagement ? 'Person 2 Name in English *' : 'Bride Name in English *'}
          </label>
          <input
            type="text"
            value={couple.brideEn}
            onChange={(e) => handleBrideEnChange(e.target.value)}
            placeholder={isEngagement ? 'e.g. Riya' : 'e.g. Ishani'}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] text-[#75675C] mb-1 font-medium">
              नाम (हिन्दी में)
            </label>
            <input
              type="text"
              value={couple.brideHi}
              onChange={(e) => onChange({ brideHi: e.target.value })}
              placeholder={isEngagement ? 'उदा. रिया' : 'उदा. ईशानी'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#75675C] mb-1 font-medium">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              type="text"
              value={couple.brideGu}
              onChange={(e) => onChange({ brideGu: e.target.value })}
              placeholder={isEngagement ? 'દા.ત. રિયા' : 'દા.ત. ઈશાની'}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Monogram & Hashtag Card */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#241A17] mb-1 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>Couple Monogram</span>
            </label>
            <input
              type="text"
              value={couple.mark || ''}
              onChange={(e) => onChange({ mark: e.target.value })}
              placeholder="e.g. R · I"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#241A17] mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-[#C49A35]" />
              <span>{isEngagement ? 'Engagement Hashtag' : 'Wedding Hashtag'}</span>
            </label>
            <input
              type="text"
              value={couple.hashtag || ''}
              onChange={(e) => onChange({ hashtag: e.target.value })}
              placeholder="e.g. #RudraWedsIshani"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
            />
          </div>
        </div>
      </div>

      {/* 3. DATE & AUSPICIOUS MUHURAT */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E8D5AD]/60 pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#C49A35]" />
            <h4 className="font-cormorant font-bold text-base text-[#6E1020]">
              {isEngagement ? 'Engagement Date & Muhurat *' : 'Wedding Date & Shubh Muhurat *'}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#C49A35] font-bold">
            Live Countdown
          </span>
        </div>

        {/* Date Picker Input */}
        <div>
          <label className="block text-xs font-semibold text-[#241A17] mb-1">
            {isEngagement ? 'Choose Engagement Date' : 'Choose Wedding Date'}
          </label>
          <input
            type="date"
            value={selectedDateIso}
            onChange={(e) => handleDatePick(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
          />
        </div>

        {/* Auspicious Muhurat Selector Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-[#241A17] mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#C49A35]" />
            <span>{isEngagement ? 'Select Auspicious Sagai Muhurat' : 'Select Auspicious Muhurat (शुभ मुहूर्त)'}</span>
          </label>
          <select
            value={selectedMuhurat}
            onChange={(e) => handleMuhuratChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
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
          <label className="block text-[10px] font-mono text-[#75675C] mb-1">
            Final Formatted Date on Invitation
          </label>
          <input
            type="text"
            value={couple.weddingDate}
            onChange={(e) => {
              setErrorMessage('');
              onChange({ weddingDate: e.target.value });
            }}
            placeholder={isEngagement ? '18 January 2027 · 06:30 PM' : '3 December 2026 · 06:30 PM'}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
          />
        </div>
      </div>

      {/* Venue & Google Maps Link */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3">
        <label className="block text-xs font-bold text-[#6E1020] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>{isEngagement ? 'Celebration Venue & City *' : 'Royal Wedding Venue & City *'}</span>
        </label>
        <input
          type="text"
          value={couple.venueName}
          onChange={(e) => {
            setErrorMessage('');
            onChange({ venueName: e.target.value });
          }}
          placeholder={isEngagement ? 'The Grand Palace, Udaipur' : 'The Milestone, Himmatnagar, Gujarat'}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] focus:outline-none focus:border-[#C49A35]"
        />
        <div>
          <label className="block text-[10px] font-mono text-[#75675C] mb-1">
            Google Maps Location Link (Optional)
          </label>
          <input
            type="url"
            value={couple.mapUrl}
            onChange={(e) => onChange({ mapUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs text-[#241A17] focus:outline-none focus:border-[#C49A35]"
          />
        </div>
      </div>

      {/* 📌 STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-[#FFFDF8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#E8D5AD] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={handleValidateAndSave}
          className="w-full py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Check className="w-4 h-4 text-[#C49A35]" />
          <span>{isEngagement ? 'Save & Continue to Events' : 'Save & Continue to Mangal Rasams'}</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default CoupleForm;
