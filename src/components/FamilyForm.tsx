import React, { useState } from 'react';
import { ArrowRight, Check, Users, Phone, Sparkles, RefreshCw } from 'lucide-react';
import { WeddingProjectState } from '../types/wedding';
import { fetchOnlineTransliteration } from '../utils/autoTranslator';

interface FamilyFormProps {
  family: WeddingProjectState['family'];
  onChange: (updated: Partial<WeddingProjectState['family']>) => void;
  onSaveAndNext: () => void;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({ family, onChange, onSaveAndNext }) => {
  const [isTranslatingGroom, setIsTranslatingGroom] = useState<boolean>(false);
  const [isTranslatingBride, setIsTranslatingBride] = useState<boolean>(false);

  // Real-time Groom's Parents Auto-Transliteration
  const handleGroomParentsEnChange = async (val: string) => {
    onChange({ groomParentsEn: val });
    if (val.trim()) {
      setIsTranslatingGroom(true);
      try {
        const { hi, gu } = await fetchOnlineTransliteration(val);
        onChange({
          groomParentsEn: val,
          groomParentsHi: hi,
          groomParentsGu: gu,
        });
      } finally {
        setIsTranslatingGroom(false);
      }
    }
  };

  // Real-time Bride's Parents Auto-Transliteration
  const handleBrideParentsEnChange = async (val: string) => {
    onChange({ brideParentsEn: val });
    if (val.trim()) {
      setIsTranslatingBride(true);
      try {
        const { hi, gu } = await fetchOnlineTransliteration(val);
        onChange({
          brideParentsEn: val,
          brideParentsHi: hi,
          brideParentsGu: gu,
        });
      } finally {
        setIsTranslatingBride(false);
      }
    }
  };

  // 1-Click Master Auto-Translate for All Family Fields
  const handleAutoTranslateAll = async () => {
    if (family.groomParentsEn) {
      setIsTranslatingGroom(true);
      const g = await fetchOnlineTransliteration(family.groomParentsEn);
      onChange({ groomParentsHi: g.hi, groomParentsGu: g.gu });
      setIsTranslatingGroom(false);
    }
    if (family.brideParentsEn) {
      setIsTranslatingBride(true);
      const b = await fetchOnlineTransliteration(family.brideParentsEn);
      onChange({ brideParentsHi: b.hi, brideParentsGu: b.gu });
      setIsTranslatingBride(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-5 text-left">
      {/* Header with Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces font-bold text-base text-[#6B1420] flex items-center gap-1.5">
            <span>4. Kutumb Pariwar &amp; Snehi Swajan</span>
          </h3>
          <span className="text-[10px] font-hanken text-[#2B1810] font-medium">
            Parents, Elders Blessing &amp; Family Helpdesk
          </span>
        </div>
        <button
          type="button"
          onClick={handleAutoTranslateAll}
          className="px-2.5 py-1 rounded-lg bg-[#6B1420] text-[#F7F0DD] text-[10px] font-fraunces font-bold flex items-center gap-1 shadow-sm hover:bg-[#7E1827] transition-colors"
          title="Auto-translate all English names into Hindi and Gujarati"
        >
          <Sparkles className="w-3 h-3 text-[#A67C3D]" />
          <span>Auto-Translate All</span>
        </button>
      </div>

      {/* 🤵 Groom's Parents Card */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B1420] flex items-center gap-1.5 font-fraunces">
            <Users className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>Groom's Parents (वर पक्ष माता-पिता)</span>
          </span>
          {isTranslatingGroom && (
            <span className="text-[9px] font-mono text-[#A67C3D] flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Translating...
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-mono text-[#6B1420] font-bold mb-0.5">
              🇬🇧 English (Auto-Syncs Below)
            </label>
            <input
              type="text"
              value={family.groomParentsEn}
              onChange={(e) => handleGroomParentsEnChange(e.target.value)}
              placeholder="Mr. Nalinkumar & Mrs. Kalpuben"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-baloo text-[#6B1420] font-bold mb-0.5">🇮🇳 हिन्दी</label>
            <input
              type="text"
              value={family.groomParentsHi}
              onChange={(e) => onChange({ groomParentsHi: e.target.value })}
              placeholder="श्री नलिनकुमार एवं श्रीमती कल्पूबेन"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-baloo font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-baloo text-[#6B1420] font-bold mb-0.5">🦁 ગુજરાતી</label>
            <input
              type="text"
              value={family.groomParentsGu}
              onChange={(e) => onChange({ groomParentsGu: e.target.value })}
              placeholder="શ્રી નલિનકુમાર અને શ્રીમતી કલ્પૂબેન"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
        </div>
      </div>

      {/* 👰 Bride's Parents Card */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B1420] flex items-center gap-1.5 font-fraunces">
            <Users className="w-3.5 h-3.5 text-[#A67C3D]" />
            <span>Bride's Parents (कन्या पक्ष माता-पिता)</span>
          </span>
          {isTranslatingBride && (
            <span className="text-[9px] font-mono text-[#A67C3D] flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Translating...
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-mono text-[#6B1420] font-bold mb-0.5">
              🇬🇧 English (Auto-Syncs Below)
            </label>
            <input
              type="text"
              value={family.brideParentsEn}
              onChange={(e) => handleBrideParentsEnChange(e.target.value)}
              placeholder="Mr. & Mrs. Sharma"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-baloo text-[#6B1420] font-bold mb-0.5">🇮🇳 हिन्दी</label>
            <input
              type="text"
              value={family.brideParentsHi}
              onChange={(e) => onChange({ brideParentsHi: e.target.value })}
              placeholder="श्री एवं श्रीमती शर्मा"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-baloo font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-baloo text-[#6B1420] font-bold mb-0.5">🦁 ગુજરાતી</label>
            <input
              type="text"
              value={family.brideParentsGu}
              onChange={(e) => onChange({ brideParentsGu: e.target.value })}
              placeholder="શ્રી અને શ્રીમતી શર્મા"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-baloo font-bold text-[#6B1420] focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
        </div>
      </div>

      {/* 📞 Family Helpdesk Contacts */}
      <div className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
        <span className="text-xs font-bold text-[#6B1420] flex items-center gap-1.5 font-fraunces">
          <Phone className="w-3.5 h-3.5 text-[#A67C3D]" />
          <span>Family Helpdesk &amp; Coordinator Phone Numbers</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-mono text-[#6B1420] font-bold mb-0.5">
              Family Coordinator 1 (Name &amp; Phone)
            </label>
            <input
              type="text"
              value={family.rsvp1Name}
              onChange={(e) => onChange({ rsvp1Name: e.target.value })}
              placeholder="Name (e.g. Nalinkumar)"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs mb-1 font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
            <input
              type="text"
              value={family.rsvp1Phone}
              onChange={(e) => onChange({ rsvp1Phone: e.target.value })}
              placeholder="Phone (e.g. +91 98251 45678)"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-[#6B1420] font-bold mb-0.5">
              Family Coordinator 2 (Helpdesk)
            </label>
            <input
              type="text"
              value={family.rsvp2Name}
              onChange={(e) => onChange({ rsvp2Name: e.target.value })}
              placeholder="Name (e.g. Helpdesk)"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs mb-1 font-semibold focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
            <input
              type="text"
              value={family.rsvp2Phone}
              onChange={(e) => onChange({ rsvp2Phone: e.target.value })}
              placeholder="Phone (e.g. +91 98982 34567)"
              className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#6B1420]/30 focus:border-[#6B1420]"
            />
          </div>
        </div>
      </div>

      {/* 📌 STICKY FLOATING ALWAYS-VISIBLE BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-[#EDE0C8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#D8C7AA] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full py-3.5 rounded-xl btn-vermillion text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform min-h-[44px]"
        >
          <Check className="w-4 h-4 text-[#F7F0DD]" />
          <span>Save Family Details &amp; Continue to Photos &amp; Music</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
