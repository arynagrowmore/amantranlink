import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, MessageCircle, Copy, Check, ExternalLink, Download, 
  Send, Users, FileText, Sparkles, ArrowRight, Search, 
  CheckCircle2, Clock, Smartphone, RefreshCw, Filter, Trash2, Plus
} from 'lucide-react';
import { WeddingProjectState, Language } from '../../types/wedding';
import { GuestRecord } from '../../types/guest';
import { formatWhatsAppWeddingMessage } from '../../utils/whatsappShare';

export interface BulkWhatsAppContact {
  id: string;
  name: string;
  phone: string;
  family?: string;
  category?: string;
  isSent?: boolean;
}

interface BulkWhatsAppGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WeddingProjectState;
  weddingSlug: string;
  existingGuests?: GuestRecord[];
}

export const BulkWhatsAppGeneratorModal: React.FC<BulkWhatsAppGeneratorModalProps> = ({
  isOpen,
  onClose,
  state,
  weddingSlug,
  existingGuests = [],
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'existing'>(
    existingGuests.length > 0 ? 'existing' : 'paste'
  );
  const [rawText, setRawText] = useState<string>('');
  const [contacts, setContacts] = useState<BulkWhatsAppContact[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    (state?.language === 'hi' || state?.language === 'gu') ? state.language : 'en'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://amantranlink.com';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Parse raw text into structured contacts
  const parseRawText = (text: string): BulkWhatsAppContact[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const parts = line.split(/[,|\t]+/).map(p => p.trim());
      const name = parts[0] || `Guest ${idx + 1}`;
      
      let phone = '';
      let family = '';
      
      if (parts[1]) {
        const cleaned = parts[1].replace(/[^0-9+]/g, '');
        if (cleaned.length >= 7) {
          phone = cleaned;
        } else {
          family = parts[1];
        }
      }
      
      if (parts[2] && !family) {
        family = parts[2];
      }

      return {
        id: `contact_${Date.now()}_${idx}`,
        name,
        phone,
        family: family || undefined,
        isSent: false,
      };
    });
  };

  // Sync contacts when switching tabs or when existingGuests changes
  useEffect(() => {
    if (activeTab === 'existing' && existingGuests.length > 0) {
      const fromGuests: BulkWhatsAppContact[] = existingGuests.map(g => ({
        id: g.id,
        name: g.full_name,
        phone: g.phone || '',
        family: g.family_name || undefined,
        category: g.relationship,
        isSent: g.invitation_status === 'sent' || g.invitation_status === 'delivered',
      }));
      setContacts(fromGuests);
    }
  }, [activeTab, existingGuests]);

  const handleParseText = () => {
    if (!rawText.trim()) return;
    const parsed = parseRawText(rawText);
    setContacts(parsed);
    setIsInputExpanded(false);
  };

  const handleLoadSample = () => {
    const sample = `Shri Ramesh Sharma, 9825012345, Sharma Parivar\nDr. Ajay Verma & Family, 9898012345, Verma Family\nMaheshbhai (Mama Ji), 9428012345, Patel Parivar`;
    setRawText(sample);
    const parsed = parseRawText(sample);
    setContacts(parsed);
    setIsInputExpanded(false);
  };

  const handleClearAll = () => {
    setContacts([]);
    setRawText('');
    setIsInputExpanded(true);
  };

  // Build clean WhatsApp link for a contact
  const getPersonalizedUrl = (contact: BulkWhatsAppContact): string => {
    const target = (contact.family || contact.name).trim();
    const encodedTarget = encodeURIComponent(target);
    return `${originUrl}/i/${weddingSlug}?to=${encodedTarget}`;
  };

  // Build message for WhatsApp
  const getPersonalizedMessage = (contact: BulkWhatsAppContact): string => {
    const link = getPersonalizedUrl(contact);
    return formatWhatsAppWeddingMessage({
      state,
      language: selectedLanguage,
      guest: {
        id: contact.id,
        full_name: contact.name,
        family_name: contact.family || contact.name,
      } as any,
      invitationUrl: link,
    });
  };

  // Open WhatsApp Web or App
  const handleSendWhatsApp = (contact: BulkWhatsAppContact) => {
    const message = getPersonalizedMessage(contact);
    const encodedMsg = encodeURIComponent(message);
    
    let cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const waUrl = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Mark as sent
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, isSent: true } : c));
  };

  // Copy Link
  const handleCopyLink = (contact: BulkWhatsAppContact) => {
    const link = getPersonalizedUrl(contact);
    navigator.clipboard.writeText(link);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy Full Message
  const handleCopyMessage = (contact: BulkWhatsAppContact) => {
    const msg = getPersonalizedMessage(contact);
    navigator.clipboard.writeText(msg);
    setCopiedMsgId(contact.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Toggle Sent Status manually
  const toggleSentStatus = (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, isSent: !c.isSent } : c));
  };

  // Export all contacts + links to CSV
  const handleExportCSV = () => {
    const headers = ['Guest_Name', 'Mobile_Number', 'Family_Name', 'Personalized_Invitation_Link', 'Dispatch_Status'];
    const rows = contacts.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${(c.family || '').replace(/"/g, '""')}"`,
      `"${getPersonalizedUrl(c)}"`,
      `"${c.isSent ? 'Sent' : 'Pending'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${weddingSlug}_WhatsApp_Bulk_Guest_Links.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered contacts list
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        c.name.toLowerCase().includes(query) ||
        (c.family && c.family.toLowerCase().includes(query)) ||
        c.phone.includes(query);

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'sent' && c.isSent) ||
        (statusFilter === 'pending' && !c.isSent);

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const sentCount = contacts.filter(c => c.isSent).length;
  const pendingCount = contacts.length - sentCount;
  const progressPercent = contacts.length > 0 ? Math.round((sentCount / contacts.length) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-whatsapp-title"
    >
      <div 
        className="relative w-full max-w-5xl bg-[#FFFDF8] rounded-2xl sm:rounded-3xl border border-[#E8DCC8] shadow-2xl text-[#1A1715] flex flex-col h-[94vh] sm:h-[90vh] max-h-[850px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* 1. FIXED TOP HEADER (Luminous Royal Light Theme)         */}
        {/* ========================================================= */}
        <header className="bg-white border-b border-[#E8DCC8] px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#167A5A] text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4D06F]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 id="bulk-whatsapp-title" className="font-serif text-lg sm:text-2xl font-bold text-[#6E1020] leading-tight truncate">
                  Bulk Guest WhatsApp
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-[#167A5A]/15 text-[#167A5A] border border-[#167A5A]/30 px-2 py-0.5 rounded-full uppercase">
                  1-Click Dispatch
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#75675C] mt-0.5 font-normal truncate hidden sm:block">
                Generate personalized (?to=GuestName) links with 1-click WhatsApp send &amp; CSV export for all your guests.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#430914] border border-[#E8DCC8] hover:border-[#C49A35] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* ========================================================= */}
        {/* 2. SUB-HEADER TOOLBAR (Tabs + Language Switcher)         */}
        {/* ========================================================= */}
        <div className="bg-[#FAF8F5] border-b border-[#E8DCC8] px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          
          {/* Source Tabs */}
          <div role="tablist" className="inline-flex p-1 bg-white rounded-xl border border-[#E8DCC8] shadow-2xs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'paste'}
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-[#6E1020] text-white shadow-xs font-bold'
                  : 'text-[#75675C] hover:text-[#1A1715]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text List</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'existing'}
              onClick={() => setActiveTab('existing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'existing'
                  ? 'bg-[#6E1020] text-white shadow-xs font-bold'
                  : 'text-[#75675C] hover:text-[#1A1715]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>From Guest Book ({existingGuests.length})</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#75675C] hidden sm:inline">Message Language:</span>
            <div role="group" className="inline-flex p-1 bg-white rounded-xl border border-[#E8DCC8] text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedLanguage('hi')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLanguage === 'hi' ? 'bg-[#6E1020] text-white shadow-xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('gu')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLanguage === 'gu' ? 'bg-[#6E1020] text-white shadow-xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                ગુજરાતી
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLanguage === 'en' ? 'bg-[#6E1020] text-white shadow-xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. COLLAPSIBLE INPUT DRAWER (Paste text mode)             */}
        {/* ========================================================= */}
        {activeTab === 'paste' && (
          <div className="border-b border-[#E8DCC8] bg-white px-6 py-3.5 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="raw-contacts-input" className="font-semibold text-[#1A1715] flex items-center gap-2">
                <span>Paste Guest Names &amp; Mobile Numbers:</span>
                <span className="text-[10px] text-[#75675C] font-mono font-normal">Format: Name, Phone, Family</span>
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] font-semibold text-[#6E1020] hover:underline cursor-pointer"
                >
                  Load Example
                </button>
                {contacts.length > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={() => setIsInputExpanded(!isInputExpanded)}
                      className="text-[11px] font-semibold text-[#75675C] hover:text-[#1A1715] cursor-pointer"
                    >
                      {isInputExpanded ? 'Hide Input Box ▲' : 'Edit Input Box ▼'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {isInputExpanded && (
              <div className="space-y-2 animate-fadeIn">
                <textarea
                  id="raw-contacts-input"
                  rows={3}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your contacts here (1 per line):&#10;e.g. Ramesh Sharma, 9825012345, Sharma Parivar&#10;Dr. Ajay Verma & Family, 9898012345, Verma Family"
                  className="w-full p-2.5 text-xs font-mono rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-[#1A1715] focus:bg-white focus:ring-2 focus:ring-[#C49A35]/30 focus:border-[#C49A35] outline-none resize-none transition-all"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#75675C]">
                    Tip: Copy rows directly from Excel or Google Sheets and paste here.
                  </span>
                  <div className="flex items-center gap-2">
                    {rawText.trim() && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-3 py-1.5 rounded-lg border border-[#E8DCC8] text-[#75675C] hover:text-red-700 text-xs font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleParseText}
                      disabled={!rawText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-[#6E1020] hover:bg-[#5A0B18] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-[#C49A35]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#F4D06F]" />
                      <span>Generate Personalized Links</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. METRICS & SEARCH TOOLBAR (Always Visible & Fixed)      */}
        {/* ========================================================= */}
        <div className="bg-[#FFFDF8] border-b border-[#E8DCC8] px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shrink-0 shadow-2xs">
          
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75675C] block">Total</span>
              <strong className="text-base font-bold text-[#1A1715] tabular-nums">{contacts.length}</strong>
            </div>
            <div className="h-6 w-px bg-[#E8DCC8]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#167A5A] block">Sent ✓</span>
              <strong className="text-base font-bold text-[#167A5A] tabular-nums">{sentCount}</strong>
            </div>
            <div className="h-6 w-px bg-[#E8DCC8]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C4A4A] block">Pending</span>
              <strong className="text-base font-bold text-[#8C4A4A] tabular-nums">{pendingCount}</strong>
            </div>
            
            {/* Progress Bar */}
            {contacts.length > 0 && (
              <div className="hidden md:flex items-center gap-2 pl-2">
                <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#167A5A] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#167A5A] tabular-nums">{progressPercent}%</span>
              </div>
            )}
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#75675C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest, family or phone…"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC8] text-xs text-[#1A1715] focus:bg-white focus:ring-2 focus:ring-[#C49A35]/30 focus:border-[#C49A35] outline-none transition-all"
              />
            </div>

            <div className="inline-flex p-0.5 bg-[#FAF6EE] rounded-xl border border-[#E8DCC8] text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-[#6E1020] text-white font-bold shadow-2xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'pending' ? 'bg-[#8C4A4A] text-white font-bold shadow-2xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('sent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'sent' ? 'bg-[#167A5A] text-white font-bold shadow-2xs' : 'text-[#75675C] hover:text-[#1A1715]'
                }`}
              >
                Sent
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={contacts.length === 0}
              className="py-1.5 px-3 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E8DCC8] text-xs font-bold text-[#6E1020] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-40 shrink-0"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#C49A35]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. DEDICATED SCROLLABLE LIST CONTAINER (Silky Smooth)     */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#FAF8F5] p-4 sm:p-6 space-y-3">
          {filteredContacts.length === 0 ? (
            <div className="py-14 px-6 text-center text-xs text-[#75675C] space-y-3 bg-white rounded-3xl border border-[#E8DCC8] max-w-md mx-auto my-6 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] border border-[#C49A35]/30 flex items-center justify-center mx-auto text-[#6E1020]">
                <Users className="w-6 h-6 text-[#C49A35]" />
              </div>
              <div className="space-y-1">
                <p className="font-serif font-bold text-base text-[#1A1715]">
                  {contacts.length === 0 ? 'No Guests Added Yet' : 'No Matching Guests Found'}
                </p>
                <p className="text-xs text-[#75675C] leading-relaxed">
                  {contacts.length === 0 
                    ? 'Paste your guest list in the box above or load sample data to generate 1-click WhatsApp links.' 
                    : 'Try clearing your search query or switching filters.'}
                </p>
              </div>
              {contacts.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-xl bg-[#6E1020] hover:bg-[#5A0B18] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Load Sample Guest List
                </button>
              )}
            </div>
          ) : (
            filteredContacts.map((contact, index) => {
              const personalUrl = getPersonalizedUrl(contact);

              return (
                <div 
                  key={contact.id} 
                  className={`p-4 rounded-2xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:border-[#C49A35]/60 ${
                    contact.isSent 
                      ? 'border-[#167A5A]/30 bg-[#F7FBF9]' 
                      : 'border-[#E8DCC8]'
                  }`}
                >
                  {/* Left: Contact Info & Personalized Link */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Sent Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSentStatus(contact.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer mt-0.5 ${
                        contact.isSent 
                          ? 'bg-[#167A5A] border-[#167A5A] text-white shadow-2xs' 
                          : 'bg-white border-[#E8DCC8] hover:border-[#C49A35]'
                      }`}
                      title={contact.isSent ? 'Mark as Pending' : 'Mark as Sent'}
                      aria-label={contact.isSent ? `Mark ${contact.name} as pending` : `Mark ${contact.name} as sent`}
                    >
                      {contact.isSent && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-[#1A1715] truncate">
                          {contact.name}
                        </strong>

                        {contact.family && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] border border-[#E8DCC8] text-[#6E1020]">
                            {contact.family}
                          </span>
                        )}

                        {contact.phone && (
                          <span className="text-xs font-mono text-[#75675C] flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E8DCC8]/60">
                            <Smartphone className="w-3 h-3 text-[#167A5A]" />
                            <span>{contact.phone}</span>
                          </span>
                        )}

                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.2 rounded-full ${
                          contact.isSent 
                            ? 'bg-[#167A5A]/10 text-[#167A5A]' 
                            : 'bg-amber-100/60 text-amber-800'
                        }`}>
                          {contact.isSent ? 'Sent ✓' : 'Pending'}
                        </span>
                      </div>

                      {/* Generated Link Snippet */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#75675C] truncate max-w-xl">
                        <span className="text-[#C49A35] shrink-0">🔗</span>
                        <span className="truncate">{personalUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Copy Link, Copy Message, Send WhatsApp) */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-end">
                    
                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(contact)}
                      className="px-2.5 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#6E1020] border border-[#E8DCC8] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Copy personalized guest URL"
                    >
                      {copiedId === contact.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#167A5A]" />
                          <span className="text-[11px] text-[#167A5A] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C49A35]" />
                          <span className="text-[11px]">Link</span>
                        </>
                      )}
                    </button>

                    {/* Copy Full Message */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(contact)}
                      className="px-2.5 py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#F0E6D2] text-[#6E1020] border border-[#E8DCC8] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Copy pre-composed greeting message"
                    >
                      {copiedMsgId === contact.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#167A5A]" />
                          <span className="text-[11px] text-[#167A5A] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C49A35]" />
                          <span className="text-[11px]">Message</span>
                        </>
                      )}
                    </button>

                    {/* Send on WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(contact)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                        contact.isSent
                          ? 'bg-[#E8F5EE] text-[#167A5A] hover:bg-[#D5EFE1] border border-[#167A5A]/40'
                          : 'bg-[#167A5A] hover:bg-[#126349] text-white'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{contact.isSent ? 'Resend' : 'Send WhatsApp'}</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* ========================================================= */}
        {/* 6. FIXED BOTTOM FOOTER                                    */}
        {/* ========================================================= */}
        <footer className="bg-white border-t border-[#E8DCC8] px-6 py-3.5 flex items-center justify-between text-xs text-[#75675C] shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" />
            <span className="italic font-serif">
              Personalized links automatically greet each guest with their royal title on the opening ceremony screen.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#6E1020] hover:bg-[#5A0B18] text-[#FFFDF8] font-bold transition-all cursor-pointer shadow-sm border border-[#C49A35]"
            >
              Done
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default BulkWhatsAppGeneratorModal;
