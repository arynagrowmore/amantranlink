import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, MapPin, Sparkles, ArrowRight, ArrowLeft, 
  Check, X, Crown, Building2, Clock, CheckCircle2
} from 'lucide-react';
import { WeddingProjectState, ThemeId } from '../../types/wedding';
import { themes } from '../ThemeSelector';

interface FirstTimeCoupleOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  onUpdateState: (updater: (prev: WeddingProjectState) => WeddingProjectState) => void;
  onComplete: () => void;
}

export const FirstTimeCoupleOnboardingModal: React.FC<FirstTimeCoupleOnboardingModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('AMANTRANLINK_ONBOARDING_STEP');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Step 1: Couple Names
  const [groomName, setGroomName] = useState<string>(state.couple.groomEn || '');
  const [brideName, setBrideName] = useState<string>(state.couple.brideEn || '');

  // Step 2: Celebration Date & Muhurat
  const [weddingDate, setWeddingDate] = useState<string>(state.couple.weddingDate || '');
  const [muhuratTime, setMuhuratTime] = useState<string>(state.couple.muhuratTime || '06:30 PM');

  // Step 3: Venue & City
  const [venueName, setVenueName] = useState<string>(state.couple.venueName || '');
  const [city, setCity] = useState<string>(state.couple.venueAddress || '');

  // Step 4: Theme
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(state.theme || 'rajmahal');

  // Persist Step in localStorage
  useEffect(() => {
    localStorage.setItem('AMANTRANLINK_ONBOARDING_STEP', String(currentStep));
  }, [currentStep]);

  // Sync back to state continuously
  const syncToGlobalState = () => {
    onUpdateState((prev) => ({
      ...prev,
      theme: selectedTheme,
      couple: {
        ...prev.couple,
        groomEn: groomName.trim() || prev.couple.groomEn || 'Rudra',
        brideEn: brideName.trim() || prev.couple.brideEn || 'Ishani',
        weddingDate: weddingDate.trim() || prev.couple.weddingDate || '10 December 2026',
        muhuratTime: muhuratTime.trim() || prev.couple.muhuratTime || '06:30 PM',
        venueName: venueName.trim() || prev.couple.venueName || 'Royal Palace Banquet',
        venueAddress: city.trim() || prev.couple.venueAddress || 'Udaipur, Rajasthan',
        hashtag: `#${(groomName.trim() || 'Rudra')}Weds${(brideName.trim() || 'Ishani')}`,
        mark: `${(groomName.trim().charAt(0) || 'R').toUpperCase()} · ${(brideName.trim().charAt(0) || 'I').toUpperCase()}`,
      },
    }));
  };

  const handleNext = () => {
    syncToGlobalState();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    syncToGlobalState();
    localStorage.setItem('AMANTRANLINK_ONBOARDED', 'true');
    localStorage.removeItem('AMANTRANLINK_ONBOARDING_STEP');
    onComplete();
  };

  const handleSkip = () => {
    syncToGlobalState();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-fadeIn font-manrope overflow-y-auto select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div 
        className="relative w-full max-w-xl bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-[0_24px_70px_rgba(36,26,23,0.3)] p-6 sm:p-9 text-[#241A17] my-auto animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#9C772F] via-[#F4D06F] to-[#9C772F]" />

        {/* Skip / Close Button */}
        <button
          type="button"
          onClick={handleFinish}
          className="absolute top-4 right-4 text-xs font-semibold text-[#8C7A73] hover:text-[#6E1020] px-3 py-1.5 rounded-full bg-[#FAF5EB] hover:bg-[#EFE5D3] border border-[#E8D5AD]/60 transition-colors cursor-pointer"
        >
          Skip to Studio
        </button>

        {/* Stepper Dots & Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === currentStep 
                  ? 'w-8 bg-[#6E1020]' 
                  : step < currentStep 
                    ? 'w-4 bg-[#C49A35]' 
                    : 'w-3 bg-[#E8D5AD]'
              }`}
            />
          ))}
          <span className="text-[11px] font-mono tracking-widest text-[#8C7A73] uppercase ml-auto font-bold">
            Step 0{currentStep} of 04
          </span>
        </div>

        {/* STEP 01: WHOSE WEDDING ARE WE PREPARING? */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="inline-flex p-2 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 text-[#6E1020]">
                <Heart className="w-5 h-5" />
              </div>
              <h2 id="onboarding-title" className="font-cormorant text-2xl sm:text-3xl font-bold text-[#241A17]">
                Whose wedding are we preparing?
              </h2>
              <p className="text-xs sm:text-sm text-[#6D5D57] leading-relaxed">
                Enter the names of the couple. These will appear across all royal themes, invitations, and family cards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Groom / Partner 1
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Rudra"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Bride / Partner 2
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ishani"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 02: WHEN IS THE CELEBRATION? */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="inline-flex p-2 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 text-[#6E1020]">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 id="onboarding-title" className="font-cormorant text-2xl sm:text-3xl font-bold text-[#241A17]">
                When is the celebration?
              </h2>
              <p className="text-xs sm:text-sm text-[#6D5D57] leading-relaxed">
                Set the auspicious date and muhurat time to start the live countdown clock for your guests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Wedding Date
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 10 December 2026"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Auspicious Muhurat / Time (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 06:30 PM"
                  value={muhuratTime}
                  onChange={(e) => setMuhuratTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 03: WHERE WILL IT HAPPEN? */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="inline-flex p-2 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 text-[#6E1020]">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 id="onboarding-title" className="font-cormorant text-2xl sm:text-3xl font-bold text-[#241A17]">
                Where will it happen?
              </h2>
              <p className="text-xs sm:text-sm text-[#6D5D57] leading-relaxed">
                Add the destination or banquet venue so your guests can navigate easily using Google Maps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  Venue Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Jagmandir Island Palace"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#241A17] block">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Udaipur, Rajasthan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF5EB] border border-[#E0D2BC] text-[#241A17] placeholder-[#8C7A73]/70 focus:bg-white focus:outline-none focus:border-[#C49A35] focus:ring-1 focus:ring-[#C49A35] transition-colors h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 04: CHOOSE YOUR INVITATION THEME */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1.5">
              <div className="inline-flex p-2 rounded-2xl bg-[#6E1020]/10 border border-[#C49A35]/30 text-[#6E1020]">
                <Crown className="w-5 h-5" />
              </div>
              <h2 id="onboarding-title" className="font-cormorant text-2xl sm:text-3xl font-bold text-[#241A17]">
                Choose your royal invitation
              </h2>
              <p className="text-xs text-[#6D5D57] leading-relaxed">
                Select from our signature heritage themes. You can always change your theme anytime later in the studio.
              </p>
            </div>

            {/* Theme Visual Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {themes.map((t) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-[#FFF9EE] border-[#C49A35] ring-2 ring-[#C49A35]/50 shadow-xs'
                        : 'bg-[#FAF5EB] border-[#E0D2BC] hover:border-[#C49A35]/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#6E1020] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <span className="text-2xl mb-1">{t.icon}</span>
                    <span className="text-xs font-bold text-[#241A17] line-clamp-1">{t.name}</span>
                    <span className="text-[10px] text-[#8C7A73] line-clamp-1 mt-0.5">{t.tagline.split('&')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-[#E8D5AD] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-[#D5C29E] text-xs font-semibold text-[#6D5D57] hover:text-[#241A17] hover:bg-[#FAF5EB] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-medium text-[#8C7A73] hover:underline cursor-pointer px-2"
            >
              Skip Step
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#560D1A] text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-[#C49A35]/30 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#560D1A] text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-md border border-[#C49A35]/30 focus:outline-none focus:ring-2 focus:ring-[#C49A35]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F4D06F]" />
                <span>Enter Your Wedding Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeCoupleOnboardingModal;
