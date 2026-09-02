import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, RefreshCw, MessageSquare, CheckCircle2, 
  ExternalLink, Sparkles, AlertCircle, ShieldCheck, Send 
} from 'lucide-react';
import { 
  ProjectReviewLink, 
  ProjectReviewComment, 
  ProjectApprovalEvent, 
  FeedbackStatus 
} from '../../types/studioBranding';
import { 
  getOrCreateProjectReviewLink, 
  regenerateProjectReviewLink, 
  fetchProjectComments, 
  updateCommentStatus, 
  fetchApprovalHistory, 
  submitReviewComment 
} from '../../services/studioBrandingService';

interface PartnerReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weddingSlug: string;
  studioId: string;
  weddingSiteId?: string;
  clientNames?: string;
}

export const PartnerReviewDrawer: React.FC<PartnerReviewDrawerProps> = ({
  isOpen,
  onClose,
  weddingSlug,
  studioId,
  weddingSiteId,
  clientNames = 'Client Wedding',
}) => {
  const [reviewLink, setReviewLink] = useState<ProjectReviewLink | null>(null);
  const [comments, setComments] = useState<ProjectReviewComment[]>([]);
  const [approvals, setApprovals] = useState<ProjectApprovalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const loadReviewData = async () => {
    setLoading(true);
    const [link, comms, apprList] = await Promise.all([
      getOrCreateProjectReviewLink(weddingSlug, studioId, weddingSiteId),
      fetchProjectComments(weddingSlug),
      fetchApprovalHistory(weddingSlug),
    ]);
    setReviewLink(link);
    setComments(comms);
    setApprovals(apprList);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadReviewData();
    }
  }, [isOpen, weddingSlug, studioId]);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shahistudio.com';
  const clientReviewUrl = reviewLink ? `${originUrl}/review/${reviewLink.review_token}` : '';

  const handleCopyLink = () => {
    if (!clientReviewUrl) return;
    navigator.clipboard.writeText(clientReviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating this review link will revoke the previous link. Proceed?')) {
      return;
    }
    setRegenerating(true);
    const newLink = await regenerateProjectReviewLink(weddingSlug, studioId);
    setReviewLink(newLink);
    setRegenerating(false);
  };

  const handleToggleStatus = async (comment: ProjectReviewComment) => {
    const nextStatus: FeedbackStatus = comment.status === 'resolved' ? 'open' : 'resolved';
    await updateCommentStatus(comment.id, weddingSlug, nextStatus);
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, status: nextStatus } : c));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end font-manrope animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E8DFD1]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD1] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
              Client Proofing &amp; Approvals
            </span>
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              {clientNames}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#736567] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Review Link Management Card */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#20181A]">Client Review &amp; Approval Link</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] font-bold border border-[#BCE3D1]">
                Active Token
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={clientReviewUrl}
                className="w-full px-3 py-2 bg-white border border-[#E8DFD1] rounded-xl text-xs font-mono text-[#540D1E] select-all"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#F4D06F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#736567] pt-1">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="text-[#8C4A4A] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Revoke &amp; Regenerate Link</span>
              </button>

              <a
                href={clientReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#540D1E] font-bold hover:underline flex items-center gap-1"
              >
                <span>Open Client View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Design Approval Certificate (If Approved) */}
          {approvals.length > 0 && (
            <div className="p-4 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl space-y-2 shadow-2xs animate-scaleUp">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#136A4E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#167A5A]" />
                  <span>Design Formally Approved</span>
                </span>
                <span className="text-[10px] font-mono text-[#247559]">
                  {new Date(approvals[0].created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-[#20181A]">
                Approved by <strong>{approvals[0].approved_by_name}</strong> ({approvals[0].approved_by_email || 'No email'})
              </p>
              {approvals[0].approval_note && (
                <p className="text-[11px] text-[#4A3E40] italic bg-white/60 p-2 rounded-lg">
                  "{approvals[0].approval_note}"
                </p>
              )}
            </div>
          )}

          {/* Feedback & Comments Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#736567] font-bold">
                Client Feedback Threads ({comments.length})
              </span>
              <button
                type="button"
                onClick={loadReviewData}
                className="text-xs text-[#540D1E] hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#736567]">Loading client comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-6 bg-[#FAF8F5] border border-[#E8DFD1] rounded-2xl text-center space-y-1">
                <MessageSquare className="w-6 h-6 text-[#9C8C8E] mx-auto opacity-70" />
                <p className="text-xs font-bold text-[#20181A]">No Client Feedback Yet</p>
                <p className="text-[11px] text-[#736567]">Share the review link with your client to receive notes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 bg-white border border-[#E8DFD1] rounded-2xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#20181A]">{comm.author_name}</span>
                        <span className="text-[10px] text-[#736567] ml-2">on {comm.section_title}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(comm)}
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          comm.status === 'resolved'
                            ? 'bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]'
                            : 'bg-[#FFF8EC] text-[#976008] border border-[#F2DEB0]'
                        }`}
                      >
                        {comm.status === 'resolved' ? '✓ Resolved' : 'Mark Resolved'}
                      </button>
                    </div>

                    <p className="text-xs text-[#4A3E40] italic leading-relaxed">
                      "{comm.comment}"
                    </p>

                    <div className="text-[10px] text-[#8C7A7C] pt-1">
                      {comm.created_at ? new Date(comm.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DFD1] bg-[#FAF6EE] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#736567]">
            Status: <strong className="text-[#350811]">{approvals.length > 0 ? 'Approved' : 'In Client Review'}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default PartnerReviewDrawer;
