import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle, Heart, MapPin, Calendar as CalendarIcon, Hash, Clock } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { fetchOnlineTransliteration } from '../utils/autoTranslator';

interface CoupleFormProps {
  couple: WeddingProjectState['couple'];
  onChange: (updated: Partial<WeddingProjectState['couple']>) => void;
  onSaveAndNext: () => void;
}

export const CoupleForm: React.FC<CoupleFormProps> = ({ couple, onChange, onSaveAndNext }) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedDateIso, setSelectedDateIso] = useState<string>('2026-12-03');
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
    const gInitial = val.trim().charAt(0).toUpperCase() || 'D';
    const bInitial = couple.brideEn.trim().charAt(0).toUpperCase() || 'S';
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
    const gInitial = couple.groomEn.trim().charAt(0).toUpperCase() || 'D';
    const bInitial = val.trim().charAt(0).toUpperCase() || 'S';
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
      setErrorMessage('⚠️ Please enter the Groom (Dulha) Name in English.');
      return;
    }
    if (!couple.brideEn.trim()) {
      setErrorMessage('⚠️ Please enter the Bride (Dulhan) Name in English.');
      return;
    }
    if (!couple.weddingDate.trim()) {
      setErrorMessage('⚠️ Please enter or select the Auspicious Wedding Date.');
      return;
    }
    if (!couple.venueName.trim()) {
      setErrorMessage('⚠️ Please enter the Wedding Venue & City.');
      return;
    }

    setErrorMessage('');
    onSaveAndNext();
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-cinzel font-bold text-base text-[#5E141D] flex items-center gap-1.5">
            <span>2. Dulha &amp; Dulhan Details</span>
            <span className="text-sm">💑</span>
          </h3>
          <span className="text-[10px] font-serif text-[#8C6826] italic">
            Shubh Vivah · Auspicious Muhurat &amp; Names
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8C6826] bg-[#F7E7C4] border border-[#C59B4B]/50 px-2 py-0.5 rounded-full font-bold">
          Step 2 of 5
        </span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#9B3226]/10 border border-[#9B3226]/30 flex items-center gap-2 text-xs text-[#9B3226] font-hanken">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. GROOM SECTION */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <div className="flex items-center justify-between border-b border-[#D8C7AA]/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6B1420] text-[#F7F0DD] flex items-center justify-center text-xs font-bold font-fraunces">
              1
            </div>
            <h4 className="font-fraunces font-bold text-sm text-[#6B1420]">
              Dulha (Groom Details / વરરાજા) *
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#3D6B4A] bg-[#3D6B4A]/10 border border-[#3D6B4A]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#3D6B4A]" /> Trilingual Auto-Fill ✓
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label className="block text-[11px] font-fraunces text-[#6B1420] mb-1 font-semibold">
            Groom Name in English *
          </label>
          <input
            type="text"
            value={couple.groomEn}
            onChange={(e) => handleGroomEnChange(e.target.value)}
            placeholder="e.g. Dhruv"
            className="artisan-input w-full px-3.5 py-2 rounded-xl text-xs font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block text-[10px] font-baloo text-[#6B5A4A] mb-1 font-medium">
              नाम (हिन्दी में)
            </label>
            <input
              type="text"
              value={couple.groomHi}
              onChange={(e) => onChange({ groomHi: e.target.value })}
              placeholder="उदा. ध्रुव"
              className="artisan-input w-full px-3 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-baloo text-[#6B5A4A] mb-1 font-medium">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              type="text"
              value={couple.groomGu}
              onChange={(e) => onChange({ groomGu: e.target.value })}
              placeholder="દા.ત. ધ્રુવ"
              className="artisan-input w-full px-3 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
            />
          </div>
        </div>
      </div>

      {/* 2. BRIDE SECTION */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <div className="flex items-center justify-between border-b border-[#D8C7AA]/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6B1420] text-[#F7F0DD] flex items-center justify-center text-xs font-bold font-fraunces">
              2
            </div>
            <h4 className="font-fraunces font-bold text-sm text-[#6B1420]">
              Dulhan (Bride Details / કન્યા) *
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#3D6B4A] bg-[#3D6B4A]/10 border border-[#3D6B4A]/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#3D6B4A]" /> Trilingual Auto-Fill ✓
          </span>
        </div>

        {/* English Name Input */}
        <div>
          <label className="block text-[11px] font-fraunces text-[#6B1420] mb-1 font-semibold">
            Bride Name in English *
          </label>
          <input
            type="text"
            value={couple.brideEn}
            onChange={(e) => handleBrideEnChange(e.target.value)}
            placeholder="e.g. Shreya"
            className="artisan-input w-full px-3.5 py-2 rounded-xl text-xs font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          />
        </div>

        {/* Trilingual Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="block text-[10px] font-baloo text-[#6B5A4A] mb-1 font-medium">
              नाम (हिन्दी में)
            </label>
            <input
              type="text"
              value={couple.brideHi}
              onChange={(e) => onChange({ brideHi: e.target.value })}
              placeholder="उदा. श्रेया"
              className="artisan-input w-full px-3 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-baloo text-[#6B5A4A] mb-1 font-medium">
              નામ (ગુજરાતીમાં)
            </label>
            <input
              type="text"
              value={couple.brideGu}
              onChange={(e) => onChange({ brideGu: e.target.value })}
              placeholder="દા.ત. શ્રેયા"
              className="artisan-input w-full px-3 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
            />
          </div>
        </div>
      </div>

      {/* 3. WEDDING DATE & AUSPICIOUS MUHURAT */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <div className="flex items-center justify-between border-b border-[#D8C7AA]/60 pb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#A67C3D]" />
            <h4 className="font-fraunces font-bold text-sm text-[#6B1420]">
              Wedding Date &amp; Shubh Muhurat *
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#A67C3D] font-bold">
            Live Countdown Engine
          </span>
        </div>

        {/* Date Picker Input */}
        <div>
          <label className="block text-[11px] font-fraunces text-[#6B1420] mb-1 font-semibold">
            Choose Wedding Date
          </label>
          <input
            type="date"
            value={selectedDateIso}
            onChange={(e) => handleDatePick(e.target.value)}
            className="artisan-input w-full px-3.5 py-2 rounded-xl text-xs font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          />
        </div>

        {/* Auspicious Muhurat Selector Dropdown */}
        <div>
          <label className="block text-[11px] font-fraunces text-[#6B1420] mb-1 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>Select Auspicious Muhurat (शुभ लग्न मुहूर्त)</span>
          </label>
          <select
            value={selectedMuhurat}
            onChange={(e) => handleMuhuratChange(e.target.value)}
            className="artisan-input w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          >
            {muhuratOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Final Formatted Wedding Date String */}
        <div className="pt-1">
          <label className="block text-[10px] font-mono text-[#6B5A4A] mb-1">
            Final Formatted Invitation Date (Editable)
          </label>
          <input
            type="text"
            value={couple.weddingDate}
            onChange={(e) => {
              setErrorMessage('');
              onChange({ weddingDate: e.target.value });
            }}
            placeholder="3 December 2026 · 06:30 PM"
            className="artisan-input w-full px-3 py-2 rounded-xl text-xs font-bold text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          />
        </div>
      </div>

      {/* Royal Wedding Venue & Google Maps Link */}
      <div className="p-3.5 rounded-2xl shahi-card-flat space-y-2.5 bg-[#F7F0DD]">
        <label className="block text-[11px] font-fraunces text-[#6B1420] font-bold flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#A67C3D]" />
          <span>Royal Wedding Venue &amp; City *</span>
        </label>
        <input
          type="text"
          value={couple.venueName}
          onChange={(e) => {
            setErrorMessage('');
            onChange({ venueName: e.target.value });
          }}
          placeholder="The Milestone, Himmatnagar, Gujarat"
          className="artisan-input w-full px-3.5 py-2 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
        />
        <div>
          <label className="block text-[10px] font-mono text-[#6B5A4A] mb-1">
            Google Maps Location Link
          </label>
          <input
            type="url"
            value={couple.mapUrl}
            onChange={(e) => onChange({ mapUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="artisan-input w-full px-3.5 py-1.5 rounded-xl text-xs focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
          />
        </div>
      </div>

      {/* 📌 STICKY FLOATING ALWAYS-VISIBLE BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-[#EDE0C8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#D8C7AA] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={handleValidateAndSave}
          className="w-full py-3.5 rounded-xl btn-vermillion text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Check className="w-4 h-4 text-[#F7F0DD]" />
          <span>Save &amp; Continue to Mangal Rasams</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
