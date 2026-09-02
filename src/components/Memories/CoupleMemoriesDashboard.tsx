import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Camera, Sparkles, CheckCircle2, XCircle, Trash2, 
  Download, Eye, Maximize2, RefreshCw, Copy, Check, Filter, 
  Clock, ShieldCheck, AlertCircle, MessageSquare, Image as ImageIcon,
  CheckSquare, Square
} from 'lucide-react';
import { WeddingMemory, MemoryStatus, MemorySummaryMetrics } from '../../types/memories';
import { 
  fetchHostMemories, 
  updateMemoryStatus, 
  bulkUpdateMemoryStatus, 
  deleteWeddingMemory, 
  calculateMemoryMetrics 
} from '../../services/memoryService';
import { LiveWishesWallModal } from './LiveWishesWallModal';
import { WeddingProjectState } from '../../types/wedding';

interface CoupleMemoriesDashboardProps {
  state: WeddingProjectState;
  weddingSlug: string;
  weddingSiteId?: string;
  userId?: string;
}

type MemoryFilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'photos' | 'wishes' | 'featured';

export const CoupleMemoriesDashboard: React.FC<CoupleMemoriesDashboardProps> = ({
  state,
  weddingSlug,
  weddingSiteId,
  userId,
}) => {
  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<MemoryFilterTab>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isProjectorOpen, setIsProjectorOpen] = useState<boolean>(false);
  const [zoomedMemory, setZoomedMemory] = useState<WeddingMemory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const coupleNames = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const memoryDropUrl = `${originUrl}/memories?slug=${weddingSlug}`;

  const loadMemories = async () => {
    setLoading(true);
    const data = await fetchHostMemories(weddingSlug);
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMemories();
  }, [weddingSlug]);

  const metrics: MemorySummaryMetrics = useMemo(() => {
    return calculateMemoryMetrics(memories);
  }, [memories]);

  // Filtered memory list
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      if (activeFilter === 'pending') return m.status === 'pending';
      if (activeFilter === 'approved') return m.status === 'approved';
      if (activeFilter === 'rejected') return m.status === 'rejected' || m.status === 'hidden';
      if (activeFilter === 'photos') return m.media_type === 'photo' || Boolean(m.media_url);
      if (activeFilter === 'wishes') return Boolean(m.message && m.message.trim().length > 0);
      if (activeFilter === 'featured') return m.is_featured;
      return true; // 'all'
    });
  }, [memories, activeFilter]);

  const handleCopyDropLink = () => {
    navigator.clipboard.writeText(memoryDropUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleStatusChange = async (memoryId: string, status: MemoryStatus, isFeatured?: boolean) => {
    await updateMemoryStatus(memoryId, weddingSlug, status, isFeatured, userId);
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId) {
          return {
            ...m,
            status,
            is_featured: isFeatured !== undefined ? isFeatured : m.is_featured,
          };
        }
        return m;
      })
    );
  };

  const handleToggleFeatured = async (m: WeddingMemory) => {
    await handleStatusChange(m.id, m.status, !m.is_featured);
  };

  const handleDelete = async (m: WeddingMemory) => {
    if (!window.confirm(`Permanently delete memory from ${m.guest_name}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(m.id);
    await deleteWeddingMemory(m.id, weddingSlug, m.media_url);
    setMemories((prev) => prev.filter((item) => item.id !== m.id));
    setDeletingId(null);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await bulkUpdateMemoryStatus(ids, weddingSlug, 'approved', userId);
    setMemories((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, status: 'approved' } : m))
    );
    setSelectedIds(new Set());
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await bulkUpdateMemoryStatus(ids, weddingSlug, 'rejected', userId);
    setMemories((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, status: 'rejected' } : m))
    );
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadPhoto = (m: WeddingMemory) => {
    if (!m.media_url) return;
    const link = document.createElement('a');
    link.href = m.media_url;
    link.download = `wedding_memory_${m.guest_name.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-manrope text-[#20181A]">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & OPERATIONAL ACTIONS                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
            Memory Moderation &amp; Wishes Wall
          </span>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5">
            Wedding Memories &amp; Blessings
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            Review guest photo drops, moderate heartfelt blessings, and broadcast the live wedding wishes wall.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Copy Drop Link */}
          <button
            type="button"
            onClick={handleCopyDropLink}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#4A3E40] border border-[#E8DFD1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy Public Photo Drop & Blessing Link for Guests"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#167A5A]" /> : <Copy className="w-3.5 h-3.5 text-[#9C772F]" />}
            <span>{copiedLink ? 'Copied Link!' : 'Copy Guest Drop Link'}</span>
          </button>

          {/* Launch Live Projector Wall */}
          <button
            type="button"
            onClick={() => setIsProjectorOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Launch Fullscreen Wishes Wall for Wedding Screens"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#F4D06F]" />
            <span>Launch Live Wishes Wall</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL SUMMARY METRIC CARDS                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Pending Review */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#F2DEB0] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#976008] uppercase block">
            Pending Review
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#976008] mt-0.5">
            {metrics.pendingCount}
          </div>
          <p className="text-[10px] text-[#9C772F] mt-0.5">Awaiting host approval</p>
        </div>

        {/* Approved */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#BCE3D1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#136A4E] uppercase block">
            Approved
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#136A4E] mt-0.5">
            {metrics.approvedCount}
          </div>
          <p className="text-[10px] text-[#247559] mt-0.5">Visible on Wishes Wall</p>
        </div>

        {/* Total Photos */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase block">
            Total Photos
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#20181A] mt-0.5">
            {metrics.totalPhotosCount}
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">Guest photo drops</p>
        </div>

        {/* Total Wishes */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase block">
            Total Wishes
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#20181A] mt-0.5">
            {metrics.totalWishesCount}
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">Blessings &amp; notes</p>
        </div>

        {/* Featured */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#9C772F] uppercase block">
            Featured
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#540D1E] mt-0.5">
            {metrics.featuredCount}
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">Prioritized on screen</p>
        </div>

        {/* Total Submissions */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#736567] uppercase block">
            Total Dropped
          </span>
          <div className="font-cormorant font-bold text-2xl text-[#20181A] mt-0.5">
            {metrics.totalSubmissions}
          </div>
          <p className="text-[10px] text-[#736567] mt-0.5">All time submissions</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MODERATION TOOLBAR & FILTER TABS                                       */}
      {/* ========================================================================= */}
      <div className="p-3 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center p-0.5 bg-[#FAF6EF] rounded-xl border border-[#E8DFD1] text-xs flex-wrap">
          {(
            [
              { id: 'pending', label: `Pending (${metrics.pendingCount})` },
              { id: 'approved', label: `Approved (${metrics.approvedCount})` },
              { id: 'rejected', label: `Rejected (${metrics.rejectedCount})` },
              { id: 'photos', label: `Photos (${metrics.totalPhotosCount})` },
              { id: 'wishes', label: `Wishes (${metrics.totalWishesCount})` },
              { id: 'featured', label: `Featured (${metrics.featuredCount})` },
              { id: 'all', label: `All (${metrics.totalSubmissions})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-white text-[#540D1E] font-bold shadow-2xs'
                  : 'text-[#6C5D60] hover:text-[#20181A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 bg-[#FAF6EF] px-2.5 py-1 rounded-xl border border-[#E8DFD1] text-xs">
              <span className="font-bold text-[#540D1E]">{selectedIds.size} selected</span>
              <button
                type="button"
                onClick={handleBulkApprove}
                className="px-2 py-0.5 rounded-lg bg-[#167A5A] text-white text-[11px] font-bold cursor-pointer hover:bg-[#136A4E]"
              >
                Approve All
              </button>
              <button
                type="button"
                onClick={handleBulkReject}
                className="px-2 py-0.5 rounded-lg bg-[#8C4A4A] text-white text-[11px] font-bold cursor-pointer hover:bg-[#723636]"
              >
                Reject All
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={loadMemories}
            disabled={loading}
            className="p-1.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F2ECE1] text-[#4A3E40] border border-[#E8DFD1] text-xs transition-colors cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C772F] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODERATION CARDS GRID                                                  */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#736567]">Loading wedding memories...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E8DFD1] rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F] mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
            No Submissions in this Section
          </h3>
          <p className="text-xs text-[#736567] max-w-sm mx-auto">
            Share the Photo Drop link with your guests or explore other tabs to review submissions.
          </p>
          <button
            type="button"
            onClick={handleCopyDropLink}
            className="px-4 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold cursor-pointer"
          >
            Copy Guest Drop Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((m) => {
            const isSelected = selectedIds.has(m.id);

            return (
              <div
                key={m.id}
                className={`bg-white border rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between transition-all ${
                  isSelected ? 'ring-2 ring-[#540D1E] border-[#540D1E]' : 'border-[#E8DFD1]'
                }`}
              >
                {/* Media Thumbnail */}
                {m.media_url ? (
                  <div className="relative aspect-4/3 bg-[#FAF8F5] overflow-hidden group">
                    <img 
                      src={m.media_url} 
                      alt="Memory" 
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setZoomedMemory(m)}
                    />
                    
                    {/* Checkbox selector */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(m.id);
                      }}
                      className="absolute top-2.5 left-2.5 p-1 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-[#F4D06F]" /> : <Square className="w-4 h-4" />}
                    </button>

                    {/* Download button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPhoto(m);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors"
                      title="Download full quality photo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF6EF] border-b border-[#E8DFD1] flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#9C772F]">Text Blessing</span>
                    <button
                      type="button"
                      onClick={() => toggleSelect(m.id)}
                      className="text-[#736567] hover:text-[#20181A]"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-[#540D1E]" /> : <Square className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#20181A]">{m.guest_name}</h4>
                        {m.family_name && (
                          <p className="text-[11px] text-[#736567]">{m.family_name}</p>
                        )}
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'approved'
                          ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                          : m.status === 'pending'
                          ? 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                          : 'bg-[#FDF2F2] text-[#8C4A4A] border border-[#F0D5D5]'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    {m.message && (
                      <p className="text-xs text-[#4A3E40] mt-2 italic leading-relaxed">
                        "{m.message}"
                      </p>
                    )}
                  </div>

                  {/* Submission timestamp & Actions Toolbar */}
                  <div className="pt-3 border-t border-[#F2ECE1] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#8C7A7C]">
                      <span>Submitted</span>
                      <span>
                        {m.submitted_at
                          ? new Date(m.submitted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' · ' + new Date(m.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : 'Today'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {m.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(m.id, 'approved')}
                          className="flex-1 py-1.5 rounded-xl bg-[#167A5A] hover:bg-[#136A4E] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(m)}
                        className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                          m.is_featured
                            ? 'bg-[#FAF4E8] text-[#8C6D2E] border-[#F4D06F]'
                            : 'bg-white text-[#6C5D60] border-[#E8DFD1] hover:bg-[#FAF6EF]'
                        }`}
                        title={m.is_featured ? 'Remove from Featured' : 'Mark as Featured on Wishes Wall'}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${m.is_featured ? 'text-[#C49A35]' : 'text-[#8C7A7C]'}`} />
                        <span>{m.is_featured ? 'Featured' : 'Feature'}</span>
                      </button>

                      {m.status !== 'rejected' && m.status !== 'hidden' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(m.id, 'rejected')}
                          className="py-1.5 px-2.5 rounded-xl bg-[#FDF2F2] hover:bg-[#FBE5E5] text-[#8C4A4A] border border-[#F0D5D5] text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Hide or Reject Submission"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="py-1.5 px-2 rounded-xl hover:bg-[#FDF2F2] text-[#A09395] hover:text-[#8C4A4A] transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 Zoomed Memory Modal */}
      {zoomedMemory && (
        <div 
          onClick={() => setZoomedMemory(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4 border border-[#E8DFD1]"
          >
            {zoomedMemory.media_url && (
              <div className="max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img src={zoomedMemory.media_url} alt="Memory zoom" className="max-h-[70vh] w-auto object-contain" />
              </div>
            )}
            <div className="p-2 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#20181A]">{zoomedMemory.guest_name}</h4>
                {zoomedMemory.family_name && <p className="text-xs text-[#736567]">{zoomedMemory.family_name}</p>}
                {zoomedMemory.message && <p className="text-xs italic text-[#4A3E40] mt-1">"{zoomedMemory.message}"</p>}
              </div>
              <button
                type="button"
                onClick={() => setZoomedMemory(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF6EF] hover:bg-[#F2ECE1] text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📽️ Live Projector Wishes Wall Modal */}
      <LiveWishesWallModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        weddingSlug={weddingSlug}
        coupleNames={coupleNames}
      />

    </div>
  );
};

export default CoupleMemoriesDashboard;
