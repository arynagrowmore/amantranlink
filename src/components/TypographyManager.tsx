import React from 'react';
import { Type, Sparkles, Check, BookOpen, Crown, Palette } from 'lucide-react';
import { WeddingProjectState, WeddingTypography, FontPresetId, AuspiciousBlessing } from '../types/wedding';
import { FONT_PRESETS, AUSPICIOUS_SHLOKAS } from '../utils/invitationAdapter';

interface TypographyManagerProps {
  state: WeddingProjectState;
  onChangeTypography: (typography: WeddingTypography) => void;
  onChangeAuspiciousBlessing?: (blessing: AuspiciousBlessing) => void;
  onSaveAndNext: () => void;
}

const COUPLE_FONT_OPTIONS = [
  { id: 'Great Vibes', name: 'Great Vibes', type: 'Cursive Royal Calligraphy', preview: 'Rudra & Ishani', fontClass: 'font-vibes' },
  { id: 'Alex Brush', name: 'Alex Brush', type: 'Flowing Signature Script', preview: 'Rudra & Ishani', fontClass: 'font-alex' },
  { id: 'Pinyon Script', name: 'Pinyon Script', type: 'High Aristocracy Vintage', preview: 'Rudra & Ishani', fontClass: 'font-pinyon' },
  { id: 'Cinzel Decorative', name: 'Cinzel Decorative', type: 'Imperial Palace Roman', preview: 'RUDRA & ISHANI', fontClass: 'font-cinzel-dec' },
  { id: 'Playfair Display', name: 'Playfair Display', type: 'Luxury Editorial Serif', preview: 'Rudra & Ishani', fontClass: 'font-playfair' },
  { id: 'Bodoni Moda', name: 'Bodoni Moda', type: 'Vogue Couture Serif', preview: 'RUDRA & ISHANI', fontClass: 'font-bodoni' },
  { id: 'Rozha One', name: 'Rozha One', type: 'Devanagari Royal Bold', preview: 'रुद्र एवं ईशानी', fontClass: 'font-rozha' },
  { id: 'Marcellus', name: 'Marcellus', type: 'Classic Temple Stone', preview: 'RUDRA & ISHANI', fontClass: 'font-marcellus' },
];

const HEADINGS_FONT_OPTIONS = [
  { id: 'Cinzel', name: 'Cinzel (Royal Palace)', fontClass: 'font-cinzel' },
  { id: 'Playfair Display', name: 'Playfair Display (Editorial)', fontClass: 'font-playfair' },
  { id: 'Marcellus', name: 'Marcellus (Heritage Sandstone)', fontClass: 'font-marcellus' },
  { id: 'Bodoni Moda', name: 'Bodoni Moda (Couture Luxury)', fontClass: 'font-bodoni' },
  { id: 'Yatra One', name: 'Yatra One (Devanagari Heritage)', fontClass: 'font-yatra' },
];

const BODY_FONT_OPTIONS = [
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond (Poetic Serif)', fontClass: 'font-cormorant' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Ultra Clean Modern)', fontClass: 'font-jakarta' },
  { id: 'Tiro Devanagari Hindi', name: 'Tiro Devanagari (Traditional Shloka)', fontClass: 'font-tiro' },
  { id: 'Manrope', name: 'Manrope (Balanced Minimal)', fontClass: 'font-manrope' },
];

const AUSPICIOUS_FONT_OPTIONS = [
  { id: 'Rozha One', name: 'Rozha One (Grand Temple Headline)', fontClass: 'font-rozha' },
  { id: 'Tiro Devanagari Hindi', name: 'Tiro Devanagari (Classical Vedic)', fontClass: 'font-tiro' },
  { id: 'Gotu', name: 'Gotu (Auspicious Smooth Curves)', fontClass: 'font-gotu' },
  { id: 'Kalam', name: 'Kalam (Warm Handwritten Blessing)', fontClass: 'font-kalam' },
];

export const TypographyManager: React.FC<TypographyManagerProps> = ({
  state,
  onChangeTypography,
  onChangeAuspiciousBlessing,
  onSaveAndNext,
}) => {
  const currentTypography: WeddingTypography = state.typography || {
    preset: 'raj-darbar',
    coupleFont: 'Cinzel Decorative',
    headingsFont: 'Cinzel',
    bodyFont: 'Cormorant Garamond',
    auspiciousFont: 'Rozha One',
  };

  const currentBlessing: AuspiciousBlessing = state.auspiciousBlessing || {
    shlokaKey: 'ganesh',
    shlokaText: AUSPICIOUS_SHLOKAS.ganesh.text,
    shlokaMeaning: AUSPICIOUS_SHLOKAS.ganesh.meaning,
  };

  const handleSelectPreset = (presetKey: FontPresetId) => {
    const p = FONT_PRESETS[presetKey];
    if (!p) return;
    onChangeTypography({
      preset: presetKey,
      coupleFont: p.coupleFont,
      headingsFont: p.headingsFont,
      bodyFont: p.bodyFont,
      auspiciousFont: p.auspiciousFont,
    });
  };

  const handleSelectCoupleFont = (fontName: string) => {
    onChangeTypography({
      ...currentTypography,
      preset: 'custom',
      coupleFont: fontName,
    });
  };

  const handleSelectHeadingsFont = (fontName: string) => {
    onChangeTypography({
      ...currentTypography,
      preset: 'custom',
      headingsFont: fontName,
    });
  };

  const handleSelectBodyFont = (fontName: string) => {
    onChangeTypography({
      ...currentTypography,
      preset: 'custom',
      bodyFont: fontName,
    });
  };

  const handleSelectAuspiciousFont = (fontName: string) => {
    onChangeTypography({
      ...currentTypography,
      preset: 'custom',
      auspiciousFont: fontName,
    });
  };

  const handleSelectShloka = (key: string) => {
    const s = AUSPICIOUS_SHLOKAS[key];
    if (!s || !onChangeAuspiciousBlessing) return;
    onChangeAuspiciousBlessing({
      shlokaKey: key as any,
      shlokaText: s.text,
      shlokaMeaning: s.meaning,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-deepwine via-burgundy to-deepwine p-6 text-warmwhite border border-antiquegold/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Type size={160} />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 bg-antiquegold/20 rounded-xl border border-antiquegold/40">
            <Crown size={22} className="text-antiquegold" />
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-champagne">Royal Typography Suite</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-warmwhite">शाही फॉन्ट व सुलेख (Royal Typography)</h2>
        <p className="text-sm text-champagne/90 mt-1 max-w-xl font-light">
          Choose exquisite hand-crafted calligraphy scripts for the couple's names and traditional auspicious Vedic fonts for divine blessings.
        </p>
      </div>

      {/* 1-Click Royal Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-antiquegold" />
            <h3 className="text-lg font-serif font-bold text-primary-text">1-Click Shahi Presets (शाही शैलियाँ)</h3>
          </div>
          <span className="text-xs font-mono text-muted-text">Curated Pairings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(Object.entries(FONT_PRESETS) as [FontPresetId, any][]).map(([key, preset]) => {
            if (key === 'custom') return null;
            const isSelected = currentTypography.preset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`relative p-4 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-burgundy/10 border-antiquegold shadow-md ring-2 ring-antiquegold/30'
                    : 'bg-warmwhite border-border/80 hover:border-antiquegold/60 hover:bg-ivory/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-primary-text text-base flex items-center gap-2">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-muted-text mt-1">{preset.description}</p>
                  </div>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-antiquegold text-deepwine flex-shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>

                {/* Live Preview Strip */}
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                  <div className="text-sm font-semibold text-burgundy truncate" style={{ fontFamily: `"${preset.coupleFont}", serif` }}>
                    {state.couple.groomEn || 'Rudra'} & {state.couple.brideEn || 'Ishani'}
                  </div>
                  <span className="text-[11px] font-mono text-muted-text bg-ivory px-2 py-0.5 rounded border border-border">
                    {preset.coupleFont}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Couple Name Font Customizer */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-primary-text">Couple Names Font (युगल नाम सुलेख)</h3>
            <p className="text-xs text-muted-text">Select the font used for the bride and groom names across invitations</p>
          </div>
          <span className="text-xs bg-antiquegold/15 text-burgundy font-semibold px-2.5 py-1 rounded-lg border border-antiquegold/30">
            Current: {currentTypography.coupleFont}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COUPLE_FONT_OPTIONS.map((f) => {
            const isSelected = currentTypography.coupleFont === f.id;
            const displayName = state.couple.groomEn && state.couple.brideEn
              ? `${state.couple.groomEn} & ${state.couple.brideEn}`
              : f.preview;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectCoupleFont(f.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-antiquegold bg-burgundy/10 ring-2 ring-antiquegold/40'
                    : 'border-border bg-warmwhite hover:border-antiquegold/60 hover:bg-ivory/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-primary-text">{f.name}</span>
                  <span className="text-[10px] text-muted-text font-mono">{f.type}</span>
                </div>
                <div 
                  className={`text-xl text-burgundy py-1.5 truncate ${f.fontClass}`}
                  style={{ fontFamily: `"${f.id}", serif` }}
                >
                  {displayName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auspicious Shloka & Blessing Selector */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-primary-text flex items-center gap-2">
              <BookOpen size={18} className="text-antiquegold" />
              <span>Auspicious Shloka (शुभ श्लोक व मंगलाचरण)</span>
            </h3>
            <p className="text-xs text-muted-text">Traditional Vedic verses gracing the palace gateway</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(AUSPICIOUS_SHLOKAS).map(([key, shloka]) => {
            const isSelected = currentBlessing.shlokaKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectShloka(key)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-antiquegold bg-burgundy/10 ring-2 ring-antiquegold/40'
                    : 'border-border bg-warmwhite hover:border-antiquegold/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif font-bold text-burgundy text-sm">{shloka.label}</h4>
                  {isSelected && <Check size={14} className="text-antiquegold" strokeWidth={3} />}
                </div>
                <pre className="text-xs text-primary-text/90 font-serif whitespace-pre-line leading-relaxed my-2 bg-ivory/80 p-2.5 rounded-lg border border-border/60">
                  {shloka.text}
                </pre>
                <p className="text-[11px] text-muted-text italic">{shloka.meaning}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Typography Fine-Tuning */}
      <div className="p-5 bg-ivory/60 rounded-2xl border border-border space-y-4">
        <h4 className="font-serif font-bold text-primary-text text-sm flex items-center gap-2">
          <Palette size={16} className="text-antiquegold" />
          <span>Advanced Typography Fine-Tuning</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Headings */}
          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1.5">Titles & Headings</label>
            <select
              value={currentTypography.headingsFont}
              onChange={(e) => handleSelectHeadingsFont(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-warmwhite text-primary-text focus:ring-1 focus:ring-antiquegold outline-none"
            >
              {HEADINGS_FONT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1.5">Body & Details</label>
            <select
              value={currentTypography.bodyFont}
              onChange={(e) => handleSelectBodyFont(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-warmwhite text-primary-text focus:ring-1 focus:ring-antiquegold outline-none"
            >
              {BODY_FONT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Auspicious */}
          <div>
            <label className="block text-xs font-semibold text-primary-text mb-1.5">Devanagari Verses</label>
            <select
              value={currentTypography.auspiciousFont}
              onChange={(e) => handleSelectAuspiciousFont(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-warmwhite text-primary-text focus:ring-1 focus:ring-antiquegold outline-none"
            >
              {AUSPICIOUS_FONT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save and Next */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="px-8 py-3 bg-gradient-to-r from-burgundy to-deepwine hover:from-deepwine hover:to-burgundy text-warmwhite font-semibold rounded-xl shadow-lg border border-antiquegold/50 flex items-center gap-2 transition-all"
        >
          <span>Save Typography & Continue</span>
          <Sparkles size={16} className="text-antiquegold" />
        </button>
      </div>
    </div>
  );
};
