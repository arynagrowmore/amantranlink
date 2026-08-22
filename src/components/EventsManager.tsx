import React from 'react';
import { Plus, Trash2, ArrowRight, Check, MapPin, ExternalLink, Shirt } from 'lucide-react';
import { WeddingEvent } from '../types/wedding';
import { autoTranslateText } from '../utils/autoTranslator';

interface EventsManagerProps {
  events: WeddingEvent[];
  onChange: (events: WeddingEvent[]) => void;
  onSaveAndNext: () => void;
}

export const EventsManager: React.FC<EventsManagerProps> = ({ events, onChange, onSaveAndNext }) => {
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
      name: '✨ New Celebration Event',
      nameHi: 'नया आयोजन',
      nameGu: 'નવો પ્રસંગ',
      date: '3 December 2026',
      time: '07:00 PM',
      venue: 'The Milestone Grand Ballroom',
      mapUrl: 'https://maps.google.com/?q=The+Milestone+Himmatnagar',
      color: 'gold',
      icon: '✨',
      dressCode: 'Royal Ethnic / Festive Chic',
    };
    onChange([...events, newEvt]);
  };

  const removeEvent = (index: number) => {
    if (events.length <= 1) return;
    onChange(events.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces font-bold text-base text-[#6B1420] flex items-center gap-1.5">
            <span>3. Mangal Rasam &amp; Celebrations</span>
          </h3>
          <span className="text-[10px] font-hanken text-[#6B5A4A]">
            Schedule, Venues &amp; Map Directions ({events.length} Rasams)
          </span>
        </div>
        <button
          type="button"
          onClick={addEvent}
          className="px-3 py-1.5 rounded-xl border border-[#A67C3D] text-[#6B1420] bg-[#F7F0DD] hover:bg-[#EDE0C8] text-xs font-fraunces font-bold flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[#A67C3D]" />
          <span>Add Rasam</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3 pb-2">
        {events.map((evt, idx) => (
          <div key={evt.id} className="p-4 rounded-2xl shahi-card-flat space-y-3 bg-[#F7F0DD]">
            {/* Event Name & Delete */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D8C7AA]/60">
              <input
                type="text"
                value={evt.name}
                onChange={(e) => updateEvent(idx, 'name', e.target.value)}
                placeholder="Event Name (English)"
                className="bg-transparent font-fraunces font-bold text-sm text-[#6B1420] border-b border-transparent focus:border-[#A67C3D] outline-none w-2/3"
              />
              {events.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(idx)}
                  className="text-[#9B3226] hover:bg-[#9B3226]/10 p-1.5 rounded-lg transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Trilingual Event Names */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="block text-[9px] font-baloo text-[#6B5A4A] mb-0.5">🇮🇳 हिन्दी नाम</label>
                <input
                  type="text"
                  value={evt.nameHi}
                  onChange={(e) => updateEvent(idx, 'nameHi', e.target.value)}
                  placeholder="हिन्दी नाम"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-[11px] font-baloo focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-baloo text-[#6B5A4A] mb-0.5">🦁 ગુજરાતી નામ</label>
                <input
                  type="text"
                  value={evt.nameGu}
                  onChange={(e) => updateEvent(idx, 'nameGu', e.target.value)}
                  placeholder="ગુજરાતી નામ"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-[11px] text-[#6B1420] font-baloo font-bold focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-[#6B5A4A] mb-0.5">📅 Date</label>
                <input
                  type="text"
                  value={evt.date}
                  onChange={(e) => updateEvent(idx, 'date', e.target.value)}
                  placeholder="Date (e.g. 1 Dec 2026)"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-[#6B5A4A] mb-0.5">⏰ Time / Muhurat</label>
                <input
                  type="text"
                  value={evt.time}
                  onChange={(e) => updateEvent(idx, 'time', e.target.value)}
                  placeholder="Time (e.g. 10:00 AM)"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
            </div>

            {/* Venue & Dress Code */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-[#6B5A4A] mb-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#A67C3D]" />
                  <span>Event Venue Name</span>
                </label>
                <input
                  type="text"
                  value={evt.venue}
                  onChange={(e) => updateEvent(idx, 'venue', e.target.value)}
                  placeholder="e.g. The Milestone Garden"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-[#6B5A4A] mb-0.5 flex items-center gap-1">
                  <Shirt className="w-2.5 h-2.5 text-[#A67C3D]" />
                  <span>Dress Code / Theme</span>
                </label>
                <input
                  type="text"
                  value={evt.dressCode || ''}
                  onChange={(e) => updateEvent(idx, 'dressCode', e.target.value)}
                  placeholder="e.g. Traditional Yellow Kurta"
                  className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs text-[#6B1420] font-medium focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
                />
              </div>
            </div>

            {/* 📍 Dedicated Google Maps Link */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[9px] font-mono text-[#6B5A4A] flex items-center gap-1 font-bold">
                  <MapPin className="w-3 h-3 text-[#C4522A]" />
                  <span>Google Maps Location Link for this Event</span>
                </label>
                {evt.mapUrl && (
                  <a
                    href={evt.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-mono text-[#A67C3D] hover:underline flex items-center gap-0.5"
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
                className="artisan-input w-full px-2.5 py-1.5 rounded-xl text-xs text-[#6B1420] focus:ring-2 focus:ring-[#2C3E5C]/30 focus:border-[#2C3E5C]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 📌 STICKY FLOATING ALWAYS-VISIBLE BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-[#EDE0C8]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-[#D8C7AA] shadow-lg mt-auto z-30">
        <button
          type="button"
          onClick={onSaveAndNext}
          className="w-full py-3.5 rounded-xl btn-vermillion text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-transform"
        >
          <Check className="w-4 h-4 text-[#F7F0DD]" />
          <span>Save Events Schedule &amp; Continue to Family</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
