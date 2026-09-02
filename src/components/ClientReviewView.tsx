import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Send, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Crown,
  Heart,
  ChevronRight,
  ExternalLink,
  Camera,
  X
} from 'lucide-react';
import { validateClientReviewToken, submitClientApproval, submitClientChangeRequest } from '../services/partnerService';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { WeddingProjectState } from '../types/wedding';

interface ClientReviewViewProps {
  token: string;
  onBackToHome?: () => void;
}

export const ClientReviewView: React.FC<ClientReviewViewProps> = ({
  token,
  onBackToHome,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  
  // Review Action State
  const [clientName, setClientName] = useState<string>('');
  const [changeMessage, setChangeMessage] = useState<string>('');
  const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<'IDLE' | 'APPROVED' | 'CHANGES_REQUESTED'>('IDLE');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string>('');

  useEffect(() => {
    async function loadReviewInvitation() {
      if (!token) {
        setError('Review token is required.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await validateClientReviewToken(token);
      if (res.valid && res.site) {
        setSiteData(res.site);
        setPartnerData(res.partner);
        if (res.site.workflow_status === 'CLIENT_APPROVED') {
          setReviewStatus('APPROVED');
        } else if (res.site.workflow_status === 'CHANGES_REQUESTED') {
          setReviewStatus('CHANGES_REQUESTED');
        }
      } else {
        setError(res.error || 'This review link is invalid, expired, or has been revoked by the studio.');
      }
      setLoading(false);
    }
    loadReviewInvitation();
  }, [token]);

  const handleApprove = async () => {
    if (!token) return;
    setIsSubmitting(true);
    const res = await submitClientApproval(token, clientName);
    setIsSubmitting(false);
    if (res.success) {
      setReviewStatus('APPROVED');
      setFeedbackSuccessMsg('👑 Thank you! You have officially approved your royal wedding invitation design.');
    } else {
      alert(res.error || 'Failed to submit approval.');
    }
  };

  const handleSendChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !changeMessage.trim()) return;
    setIsSubmitting(true);
    const res = await submitClientChangeRequest(token, clientName, changeMessage);
    setIsSubmitting(false);
    if (res.success) {
      setReviewStatus('CHANGES_REQUESTED');
      setIsChangeModalOpen(false);
      setFeedbackSuccessMsg('📝 Your requested changes have been sent directly to your photographer studio.');
    } else {
      alert(res.error || 'Failed to send changes.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F0DF] flex items-center justify-center p-6 text-center font-manrope">
        <div className="space-y-4">
          <div className="w-14 h-14 mx-auto border-4 border-[#C49A35] border-t-transparent rounded-full animate-spin" />
          <h2 className="font-cormorant font-bold text-2xl text-[#6E1020]">
            Loading Your Royal Wedding Preview...
          </h2>
          <p className="text-xs text-[#75675C]">Validating secure client review token</p>
        </div>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen bg-[#F7F0DF] flex items-center justify-center p-6 font-manrope">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8D5AD] shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-cormorant font-bold text-2xl text-[#6E1020]">Review Link Expired or Invalid</h2>
          <p className="text-xs text-[#75675C]">{error}</p>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-3 rounded-xl bg-[#6E1020] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const content: WeddingProjectState = siteData.content || ({} as any);
  const groom = content.couple?.groomEn || 'Groom';
  const bride = content.couple?.brideEn || 'Bride';
  const studioName = partnerData?.studioName || siteData.studio_badge || 'Partner Studio';

  return (
    <div className="min-h-screen bg-[#F7F0DF] flex flex-col font-manrope">
      {/* 👑 Top Review Banner Header */}
      <header className="sticky top-0 z-40 bg-[#0B2545] border-b border-[#38BDF8]/40 text-white px-4 py-3 shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/20 border border-[#38BDF8]/60 flex items-center justify-center text-[#38BDF8]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8]">
                Client Review Portal
              </span>
              <span className="text-white/40">&bull;</span>
              <span className="text-xs font-bold text-emerald-300">
                Curated by {studioName}
              </span>
            </div>
            <h1 className="font-cormorant font-bold text-base text-white truncate">
              {groom} &amp; {bride}&apos;s Royal Wedding Invitation
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {reviewStatus === 'APPROVED' ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>DESIGN APPROVED</span>
            </div>
          ) : reviewStatus === 'CHANGES_REQUESTED' ? (
            <div className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-4 h-4" />
              <span>CHANGES SENT TO STUDIO</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsChangeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isSubmitting ? 'Approving...' : 'Approve Design'}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Success Notification Banner */}
      {feedbackSuccessMsg && (
        <div className="bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{feedbackSuccessMsg}</span>
        </div>
      )}

      {/* Interactive Sandbox Invitation Preview */}
      <main className="flex-1 overflow-y-auto">
        <LivePreviewCanvas
          state={content}
        />
      </main>

      {/* 📝 Request Changes Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E8D5AD] shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8D5AD] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#6E1020]" />
                <h3 className="font-cormorant font-bold text-xl text-[#6E1020]">Request Design Changes</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F0DF] flex items-center justify-center text-[#75675C] hover:text-[#6E1020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#75675C]">
              Specify text corrections, event timeline changes, or design requests for <strong>{studioName}</strong>.
            </p>

            <form onSubmit={handleSendChanges} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A201A]">Your Name / Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Rudra (Groom) / Uncle Verma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F0DF] border border-[#E8D5AD] rounded-xl text-xs text-[#2A201A] focus:outline-none focus:border-[#C49A35] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A201A]">Feedback / Revisions *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Please update the wedding date to December 12th and correct the venue map address."
                  value={changeMessage}
                  onChange={(e) => setChangeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F0DF] border border-[#E8D5AD] rounded-xl text-xs text-[#2A201A] focus:outline-none focus:border-[#C49A35] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#6E1020] hover:bg-[#8A1428] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
