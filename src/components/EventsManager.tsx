import React from 'react';
import { Plus, Trash2, ArrowRight, Check, MapPin, ExternalLink, Shirt, Calendar, Clock, Sparkles } from 'lucide-react';
import { WeddingEvent, WeddingProjectState } from '../types/wedding';
import { autoTranslateText } from '../utils/autoTranslator';

interface EventsManagerProps {
  events: WeddingEvent[];
  onChange: (events: WeddingEvent[]) => void;
  onSaveAndNext: () => void;
  theme?: WeddingProjectState['theme'];
  invitationType?: WeddingProjectState['invitation_type'];
}

export const EventsManager: React.FC<EventsManagerProps> = ({ 
  events, 
  onChange, 
  onSaveAndNext,
  theme,
  invitationType,
}) => {
  const isEngagement = invitationType === 'engagement';

  const updateEvent = (index: number, field: keyof WeddingEvent, value: string) => {
    const updated = [...events];
    if (field === 'name') {
      const trans = autoTranslateText(value);
      updated[index] = {
        ...updated[index],
        name: value,
        nameHi: trans.hi || updated[index].nameHi,
        nameGu: trans.gu || updated[index].nameGu,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const addEvent = () => {
    const newEvt: WeddingEvent = {
      id: String(Date.now()),
      name: isEngagement ? '💍 Ring Exchange' : '✨ New Celebration Event',
      nameHi: isEngagement ? 'अंगूठी रस्म' : 'नया आयोजन',
      nameGu: isEngagement ? 'વીંટી રસમ' : 'નવો પ્રસંગ',
      date: isEngagement ? '18 January 2027' : '3 December 2026',
      time: isEngagement ? '08:00 PM' : '07:00 PM',
      venue: isEngagement ? 'Sheesh Mahal Courtyard' : 'The Milestone Grand Ballroom',
      mapUrl: isEngagement ? 'https://maps.google.com/?q=The+Grand+Palace+Udaipur' : 'https://maps.google.com/?q=The+Milestone+Himmatnagar',
      color: 'gold',
      icon: isEngagement ? '💍' : '✨',
      dressCode: isEngagement ? 'Formal Ivory & Champagne' : 'Royal Ethnic / Festive Chic',
    };
    onChange([...events, newEvt]);
  };

  const addPresetEvent = (preset: { name: string; nameHi: string; nameGu: string; time: string; venue: string; dress: string; icon: string }) => {
    const newEvt: WeddingEvent = {
      id: String(Date.now()),
      name: `${preset.icon} ${preset.name}`,
      nameHi: preset.nameHi,
      nameGu: preset.nameGu,
      date: isEngagement ? '18 January 2027' : '3 December 2026',
      time: preset.time,
      venue: preset.venue,
      mapUrl: isEngagement ? 'https://maps.google.com/?q=The+Grand+Palace+Udaipur' : 'https://maps.google.com/?q=The+Milestone+Himmatnagar',
      color: 'gold',
      icon: preset.icon,
      dressCode: preset.dress,
    };
    onChange([...events, newEvt]);
  };

  const removeEvent = (index: number) => {
    if (events.length <= 1) return;
    onChange(events.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full space-y-5 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-cormorant font-bold text-xl sm:text-2xl text-[#6E1020] flex items-center gap-1.5">
            <span>{isEngagement ? 'Engagement Events' : 'Mangal Rasams & Schedule'}</span>
            <span className="text-base">{isEngagement ? '💍' : '🪔'}</span>
          </h3>
          <span className="text-xs text-[#75675C]">
            Schedule, Venues &amp; Map Directions ({events.length} {isEngagement ? 'Events' : 'Rasams'})
          </span>
        </div>
        <button
          type="button"
          onClick={addEvent}
          className="px-3.5 py-1.5 rounded-xl border border-[#C49A35] text-[#6E1020] bg-[#FFFDF8] hover:bg-[#F8F3E8] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:scale-105"
        >
          <Plus className="w-3.5 h-3.5 text-[#C49A35]" />
          <span>{isEngagement ? 'Add Event' : 'Add Rasam'}</span>
        </button>
      </div>

      {/* Engagement Quick Presets */}
      {isEngagement && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD]">
          <span className="text-[10px] font-mono text-[#6E1020] font-bold block uppercase tracking-wider">
            Quick Add Engagement Events:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Ring Ceremony', nameHi: 'मुद्रिका संस्कार', nameGu: 'વીંટી રસમ', time: '08:00 PM', venue: 'Sheesh Mahal Courtyard', dress: 'Formal Ivory & Champagne', icon: '💍' },
              { name: 'Engagement Ceremony', nameHi: 'सगाई समारोह', nameGu: 'સગાઈ પ્રસંગ', time: '06:30 PM', venue: 'Durbar Hall, The Grand Palace', dress: 'Traditional Royal — Maroon & Gold', icon: '🪔' },
              { name: 'Family Welcome', nameHi: 'कुटुंब स्वागत', nameGu: 'પરિવાર સ્વાગત', time: '05:30 PM', venue: 'Grand Palace Lawn', dress: 'Royal Ethnic', icon: '👨‍👩‍👧‍👦' },
              { name: 'Dinner & Celebration', nameHi: 'प्रीतिभोज व उत्सव', nameGu: 'સ્નેહભોજન', time: '09:30 PM', venue: 'Lakeside Lawn, Pichola Wing', dress: 'Elegant Festive', icon: '🥂' },
              { name: 'Celebration Night', nameHi: 'शुभ उत्सव', nameGu: 'ઉત્સવ રાત્રી', time: '10:30 PM', venue: 'Palace Terrace', dress: 'Cocktail Chic', icon: '✨' },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => addPresetEvent(p)}
                className="text-[11px] font-semibold text-[#6E1020] bg-white hover:bg-[#6E1020] hover:text-[#FFFDF8] border border-[#E8D5AD] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>{p.icon}</span>
                <span>+{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3.5 pb-2">
        {events.map((evt, idx) => (
          <div key={evt.id} className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#E8D5AD] shadow-xs space-y-3.5">
            {/* Event Name & Delete */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8D5AD]/60">
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 h-6 rounded-lg bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center text-xs font-bold font-cormorant shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={evt.name}
                  onChange={(e) => updateEvent(idx, 'name', e.target.value)}
                  placeholder="Event Name (English)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-transparent font-cormorant font-bold text-lg text-[#6E1020] border-b border-transparent hover:border-[#E8D5AD] focus:border-[#C49A35] outline-none"
                />
              </div>
              {events.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(idx)}
                  className="text-[#8C4A4A] hover:bg-[#FDF2F2] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trilingual Event Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-medium">हिन्दी नाम</label>
                <input
                  type="text"
                  value={evt.nameHi}
                  onChange={(e) => updateEvent(idx, 'nameHi', e.target.value)}
                  placeholder="उदा. संगीत संध्या"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-medium">ગુજરાતી નામ</label>
                <input
                  type="text"
                  value={evt.nameGu}
                  onChange={(e) => updateEvent(idx, 'nameGu', e.target.value)}
                  placeholder="દા.ત. સંગીત સંધ્યા"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-bold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C49A35]" />
                  <span>Date</span>
                </label>
                <input
                  type="text"
                  value={evt.date}
                  onChange={(e) => updateEvent(idx, 'date', e.target.value)}
                  placeholder="Date (e.g. 1 Dec 2026)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C49A35]" />
                  <span>Time / Muhurat</span>
                </label>
                <input
                  type="text"
                  value={evt.time}
                  onChange={(e) => updateEvent(idx, 'time', e.target.value)}
                  placeholder="Time (e.g. 07:00 PM)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
            </div>

            {/* Venue & Dress Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C49A35]" />
                  <span>Event Venue Name</span>
                </label>
                <input
                  type="text"
                  value={evt.venue}
                  onChange={(e) => updateEvent(idx, 'venue', e.target.value)}
                  placeholder="e.g. The Milestone Garden"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs font-semibold text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#75675C] mb-1 font-semibold flex items-center gap-1">
                  <Shirt className="w-3 h-3 text-[#C49A35]" />
                  <span>Dress Code / Theme</span>
                </label>
                <input
                  type="text"
                  value={evt.dressCode || ''}
                  onChange={(e) => updateEvent(idx, 'dressCode', e.target.value)}
                  placeholder="e.g. Royal Ethnic / Festive"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
                />
              </div>
            </div>

            {/* 📍 Dedicated Google Maps Link */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-[#75675C] font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C49A35]" />
                  <span>Google Maps Location Link</span>
                </label>
                {evt.mapUrl && (
                  <a
                    href={evt.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-[#C49A35] hover:underline flex items-center gap-0.5"
                  >
                    <span>Test Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={evt.mapUrl || ''}
                onChange={(e) => updateEvent(idx, 'mapUrl', e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8D5AD] text-xs text-[#241A17] focus:outline-none focus:border-[#C49A35] shadow-2xs"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 📌 STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-[#FFFDF8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#E8D5AD] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full py-3.5 rounded-xl bg-[#6E1020] hover:bg-[#430914] text-[#FFFDF8] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md border border-[#C49A35] transition-all cursor-pointer hover:scale-[1.01]"
        >
          <Check className="w-4 h-4 text-[#C49A35]" />
          <span>Save Events &amp; Continue to Venue</span>
          <ArrowRight className="w-4 h-4 text-[#C49A35]" />
        </button>
      </div>
    </div>
  );
};

export default EventsManager;
