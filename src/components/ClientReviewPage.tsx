import React, { useState, useEffect } from 'react';
import { 
  Heart, CheckCircle2, Edit3, Sparkles, Calendar, MapPin, 
  ArrowRight, ShieldCheck, Check, MessageSquare, AlertCircle, X, ExternalLink 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ThemeId, WeddingProjectState } from '../types/wedding';
import { themes } from './ThemeSelector';

interface ClientReviewPageProps {
  slug?: string;
  onBackToHome?: () => void;
}

export const ClientReviewPage: React.FC<ClientReviewPageProps> = ({
  slug: propSlug,
  onBackToHome,
}) => {
  const [siteData, setSiteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);
  const [changeRequestText, setChangeRequestText] = useState<string>('');
  const [isSubmittingChange, setIsSubmittingChange] = useState<boolean>(false);
  const [changeSubmitted, setChangeSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Extract slug from URL if not passed via props
  const targetSlug = propSlug || (typeof window !== 'undefined' 
    ? window.location.pathname.replace(/^\/(preview|review)\//, '').split('/')[0] || new URLSearchParams(window.location.search).get('slug') || ''
    : '');

  useEffect(() => {
    const fetchSiteForReview = async () => {
      if (!targetSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wedding_sites')
          .select('id, template_id, status, is_locked, content, studio_badge, published_url, workflow_status, approved_at, client_feedback')
          .or(`published_url.eq.${targetSlug},id.eq.${targetSlug}`)
          .maybeSingle();

        if (data) {
          setSiteData(data);
          if (data.workflow_status === 'CLIENT_APPROVED' || data.approved_at) {
            setIsApproved(true);
          }
        }
      } catch (err: any) {
        console.warn('Error fetching review site:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteForReview();
  }, [targetSlug]);

  const couple = siteData?.content?.couple || {
    groomEn: 'Rudra',
    brideEn: 'Ishani',
    weddingDate: '10 Dec 2026',
    venueName: 'The Palace Gardens',
    venueAddress: 'Udaipur, Rajasthan'
  };

  const themeId = (siteData?.template_id || 'rajmahal') as ThemeId;
  const themeObj = themes.find((t) => t.id === themeId) || themes[0];
  const studioName = siteData?.studio_badge || 'Your Photography Studio';

  // Handle Client Approval
  const handleApprove = async () => {
    if (!siteData?.id) return;
    setIsApproving(true);
    setErrorMessage('');

    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('wedding_sites')
        .update({
          workflow_status: 'CLIENT_APPROVED',
          approved_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', siteData.id);

      if (error) throw error;
      setIsApproved(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit approval. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Request Changes Submission
  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteData?.id || !changeRequestText.trim()) return;

    setIsSubmittingChange(true);
    setErrorMessage('');

    try {
      const nowIso = new Date().toISOString();
      const updatedFeedback = changeRequestText.trim();

      const { error } = await supabase
        .from('wedding_sites')
        .update({
          workflow_status: 'CLIENT_REVIEWED',
          client_feedback: updatedFeedback,
          updated_at: nowIso,
        })
        .eq('id', siteData.id);

      if (error) throw error;
      setChangeSubmitted(true);
      setIsChangeModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit change request.');
    } finally {
      setIsSubmittingChange(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-manrope">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 animate-spin text-[#C49A35] mx-auto" />
          <p className="text-xs text-[#75675C] font-semibold">Loading your royal invitation preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241A17] flex flex-col font-manrope overflow-x-hidden">
      {/* 👑 Top Verification Banner */}
      <header className="bg-[#FFFDF8] border-b border-[#E8D5AD] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#6E1020] text-[#FFFDF8] flex items-center justify-center border border-[#C49A35] shadow-xs">
            <Heart className="w-4 h-4 text-[#C49A35]" />
          </div>
          <div>
            <h1 className="font-cormorant font-bold text-lg text-[#430914] leading-tight">
              {couple.groomEn} &amp; {couple.brideEn}
            </h1>
            <p className="text-[10px] text-[#75675C]">
              Digital Wedding Invitation Review · <span className="text-[#167A5A] font-semibold">{studioName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#167A5A]/10 text-[#167A5A] border border-[#167A5A]/30 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Approved
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C49A35]/15 text-[#6E1020] border border-[#C49A35]/40 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A35]" /> Client Review
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Status Notification Cards */}
        {isApproved && (
          <div className="p-4 rounded-2xl bg-[#F4F9F6] border border-[#167A5A]/40 text-[#167A5A] flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#167A5A] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Thank you! Your Invitation is Approved</h4>
              <p className="text-xs text-[#167A5A]/80 mt-0.5">
                {studioName} has been notified and will now proceed with final publishing and sending you the live shareable links.
              </p>
            </div>
          </div>
        )}

        {changeSubmitted && !isApproved && (
          <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#C49A35] text-[#430914] flex items-start gap-3 shadow-xs">
            <MessageSquare className="w-5 h-5 text-[#C49A35] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Change Request Sent to {studioName}</h4>
              <p className="text-xs text-[#75675C] mt-0.5">
                "{changeRequestText}". Your photographer will apply the changes and update your preview.
              </p>
            </div>
          </div>
        )}

        {/* Invitation Metadata Overview Card */}
        <div className="bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#C49A35] uppercase block">
                Official Invitation Preview
              </span>
              <h2 className="font-cormorant font-bold text-2xl sm:text-3xl text-[#430914]">
                {couple.groomEn} &amp; {couple.brideEn}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold bg-[#F8F3E8] border border-[#E8D5AD] text-[#6E1020] px-3 py-1 rounded-xl">
              Theme: {themeObj.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E8D5AD]/60">
            <div className="flex items-center gap-2 text-[#75675C]">
              <Calendar className="w-4 h-4 text-[#C49A35]" />
              <span>Wedding Date: <strong className="text-[#430914]">{couple.weddingDate || '10 Dec 2026'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#75675C]">
              <MapPin className="w-4 h-4 text-[#C49A35]" />
              <span className="truncate">Venue: <strong className="text-[#430914]">{couple.venueName || 'The Palace Gardens'}</strong></span>
            </div>
          </div>

          {/* Live Preview Embed Container */}
          <div className="rounded-2xl border border-[#E8D5AD] overflow-hidden bg-black relative shadow-inner aspect-[9/16] max-h-[560px] mx-auto w-full max-w-[340px]">
            <iframe
              src={themeObj.url}
              title="Invitation Live Preview"
              className="w-full h-full border-0"
            />
          </div>

          {/* Action Buttons for Client */}
          {!isApproved && (
            <div className="pt-4 border-t border-[#E8D5AD]/60 flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsChangeModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white border border-[#E8D5AD] hover:border-[#6E1020] text-[#430914] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C49A35]" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="px-6 py-3 rounded-xl bg-[#167A5A] hover:bg-[#126449] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-105 disabled:opacity-50 min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isApproving ? 'Submitting...' : 'Approve Invitation'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Request Changes Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-manrope">
          <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl border border-[#E8D5AD] shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-[#430914] to-[#24060B] text-white flex items-center justify-between">
              <div>
                <h3 className="font-cormorant font-bold text-xl text-[#FFFDF8]">
                  Request Changes
                </h3>
                <p className="text-[11px] text-[#E8D5AD]/90">
                  Send your feedback directly to {studioName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitChangeRequest} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#430914]">
                  What would you like changed?
                </label>
                <textarea
                  required
                  rows={4}
                  value={changeRequestText}
                  onChange={(e) => setChangeRequestText(e.target.value)}
                  placeholder="e.g. Please update the bride's name spelling to 'Ishani' and adjust the Muhurat time to 7:00 PM."
                  className="w-full p-3 bg-white border border-[#E8D5AD] rounded-xl text-xs text-[#430914] focus:outline-none focus:border-[#C49A35] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8D5AD]/60">
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#75675C] font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChange}
                  className="px-5 py-2.5 rounded-xl bg-[#6E1020] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-[#C49A35] cursor-pointer hover:scale-105 disabled:opacity-50 min-h-[44px]"
                >
                  <span>{isSubmittingChange ? 'Sending...' : 'Send to Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C49A35]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientReviewPage;
