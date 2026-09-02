import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, MessageSquare, Heart, ShieldCheck, 
  Send, Sparkles, AlertCircle, Building2, User, Phone, 
  ChevronRight, RefreshCw, X, ArrowLeft, Check 
} from 'lucide-react';
import { 
  ProjectReviewLink, 
  ProjectReviewComment, 
  StudioBranding, 
  ProjectApprovalEvent 
} from '../../types/studioBranding';
import { 
  resolveProjectReviewLink, 
  fetchStudioBranding, 
  fetchProjectComments, 
  submitReviewComment, 
  submitClientApproval, 
  fetchApprovalHistory, 
  DEFAULT_STUDIO_BRANDING 
} from '../../services/studioBrandingService';
import { WeddingProjectState } from '../../types/wedding';

interface ClientApprovalPortalViewProps {
  reviewToken: string;
  weddingSlug?: string;
  onBackToApp?: () => void;
}

const REVIEW_SECTIONS = [
  { id: 'couple', title: 'Couple Names & Hashtag', desc: 'Groom & Bride details' },
  { id: 'events', title: 'Events & Muhurat Schedule', desc: 'Dates, timings & rasam venues' },
  { id: 'venue', title: 'Royal Venue & Map Location', desc: 'Address & travel guidance' },
  { id: 'story', title: 'Our Love Story', desc: 'Milestones & quotes' },
  { id: 'photos', title: 'Photo Gallery & Portrait', desc: 'Couple photo slots' },
  { id: 'general', title: 'General Design Feedback', desc: 'Colors, fonts & styling' },
];

export const ClientApprovalPortalView: React.FC<ClientApprovalPortalViewProps> = ({
  reviewToken,
  weddingSlug = 'dhruv-shreya',
  onBackToApp,
}) => {
  const [reviewLink, setReviewLink] = useState<ProjectReviewLink | null>(null);
  const [branding, setBranding] = useState<StudioBranding>(DEFAULT_STUDIO_BRANDING);
  const [comments, setComments] = useState<ProjectReviewComment[]>([]);
  const [approvalEvent, setApprovalEvent] = useState<ProjectApprovalEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSection, setSelectedSection] = useState<string>('couple');
  
  // Feedback form
  const [clientName, setClientName] = useState<string>('Dhruv & Shreya');
  const [newComment, setNewComment] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentSuccess, setCommentSuccess] = useState<boolean>(false);

  // Approval modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [approverName, setApproverName] = useState<string>('Dhruv Patel');
  const [approverEmail, setApproverEmail] = useState<string>('dhruv@example.com');
  const [approvalNote, setApprovalNote] = useState<string>('Approved for production publication.');
  const [submittingApproval, setSubmittingApproval] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPortalData = async () => {
    setLoading(true);
    const res = await resolveProjectReviewLink(reviewToken);

    if (res.success && res.link) {
      setReviewLink(res.link);
      const [brand, commList, approvals] = await Promise.all([
        fetchStudioBranding(res.link.studio_id),
        fetchProjectComments(res.link.wedding_slug),
        fetchApprovalHistory(res.link.wedding_slug),
      ]);
      setBranding(brand);
      setComments(commList);
      if (approvals && approvals.length > 0) {
        setApprovalEvent(approvals[0]);
      }
    } else {
      setErrorMsg(res.error || 'Invalid or revoked review link.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPortalData();
  }, [reviewToken]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !reviewLink) return;

    setSubmittingComment(true);
    const sectionObj = REVIEW_SECTIONS.find(s => s.id === selectedSection) || REVIEW_SECTIONS[0];
    
    const res = await submitReviewComment(
      reviewLink.id,
      reviewLink.wedding_slug,
      selectedSection,
      sectionObj.title,
      clientName,
      newComment,
      'client'
    );

    setSubmittingComment(false);

    if (res.success && res.comment) {
      setComments([res.comment, ...comments]);
      setNewComment('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 2500);
    }
  };

  const handleApproveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverName.trim() || !reviewLink) return;

    setSubmittingApproval(true);
    const res = await submitClientApproval(
      reviewLink.wedding_slug,
      approverName,
      approverEmail,
      approvalNote,
      reviewLink.studio_id
    );

    setSubmittingApproval(false);

    if (res.success && res.event) {
      setApprovalEvent(res.event);
      setIsApprovalModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#736567]">Opening secure design review portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center font-manrope p-4">
        <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F2] border border-[#F0D5D5] text-[#8C4A4A] flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="font-cormorant text-2xl font-bold text-[#350811]">Review Link Inactive</h2>
          <p className="text-xs text-[#736567] leading-relaxed">
            {errorMsg}
          </p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-4 py-2 rounded-xl bg-[#540D1E] text-white text-xs font-bold"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const primaryColor = branding.white_label_enabled ? branding.primary_color : '#540D1E';
  const studioTitle = branding.white_label_enabled ? branding.studio_name : 'AmantranLink Design Studio';

  const sectionComments = comments.filter(c => c.section_id === selectedSection);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#20181A] font-manrope flex flex-col justify-between py-6 px-4 sm:px-8">
      
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. TOP WHITE-LABEL HEADER                                                 */}
        {/* ========================================================================= */}
        <div 
          className="p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {branding.white_label_enabled && branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
                👑
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#F4D06F] font-bold block">
                {studioTitle} · Client Proofing Portal
              </span>
              <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-white">
                Wedding Invitation Design Review
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {approvalEvent ? (
              <div className="px-3.5 py-1.5 rounded-full bg-[#167A5A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#F4D06F]" />
                <span>Design Approved</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-[#F4D06F] hover:bg-[#E5BF5E] text-[#120306] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve Design</span>
              </button>
            )}
          </div>
        </div>

        {/* Approval Success Banner */}
        {approvalEvent && (
          <div className="p-4 bg-[#EDF7F2] border border-[#BCE3D1] rounded-2xl text-xs text-[#136A4E] flex items-center justify-between gap-3 animate-scaleUp">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#167A5A] shrink-0" />
              <div>
                <strong>Design Approved by {approvalEvent.approved_by_name}</strong>
                <div className="text-[11px] text-[#247559]">
                  Recorded on {new Date(approvalEvent.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}. Ready for final print &amp; publishing!
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#167A5A] text-white">
              Official Approval
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MAIN REVIEW STAGE (Invitation Preview + Section Feedback Drawer)        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Invitation Preview Container (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E8DFD1] rounded-3xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-1 border-b border-[#F2ECE1] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C772F] font-bold">
                Interactive Invitation Canvas
              </span>
              <h3 className="font-cormorant text-xl font-bold text-[#350811]">
                Live Layout &amp; Theme Review
              </h3>
            </div>

            {/* Embedded Live Preview Frame */}
            <div className="h-[480px] bg-[#FAF6EE] rounded-2xl border border-[#E8DFD1] overflow-hidden relative shadow-inner">
              <iframe
                src={`/i/${reviewLink?.wedding_slug || weddingSlug}`}
                title="Wedding Invitation Preview"
                className="w-full h-full border-0"
              />
            </div>

            <p className="text-[11px] text-[#736567] text-center">
              💡 Select any design section on the right to leave structured feedback for your studio designer.
            </p>
          </div>

          {/* Right Column: Section Feedback & Comment Thread (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E8DFD1] rounded-3xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            
            <div className="space-y-3">
              <div className="border-b border-[#F2ECE1] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C772F] font-bold">
                  Design Feedback &amp; Revisions
                </span>
                <h3 className="font-cormorant text-xl font-bold text-[#350811]">
                  Section Feedback
                </h3>
              </div>

              {/* Section Selector Pills */}
              <div className="grid grid-cols-2 gap-1.5">
                {REVIEW_SECTIONS.map((sec) => {
                  const count = comments.filter(c => c.section_id === sec.id).length;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSection(sec.id)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedSection === sec.id
                          ? 'border-[#540D1E] bg-[#FAF4E8] ring-1 ring-[#540D1E]'
                          : 'border-[#E8DFD1] bg-[#FAF8F5] hover:bg-[#FAF4E8]'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-[#20181A] truncate">{sec.title}</div>
                      <div className="text-[9px] text-[#736567]">{count > 0 ? `${count} notes` : 'No notes'}</div>
                    </button>
                  );
                })}
              </div>

              {/* Comments Feed for Selected Section */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {sectionComments.length === 0 ? (
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl text-center text-[11px] text-[#736567]">
                    No feedback recorded on this section yet.
                  </div>
                ) : (
                  sectionComments.map((comm) => (
                    <div key={comm.id} className="p-2.5 bg-[#FAF8F5] border border-[#E8DFD1] rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#350811]">{comm.author_name}</span>
                        <span className={`px-1.5 py-0.2 rounded-full font-mono uppercase font-bold text-[8px] ${
                          comm.status === 'resolved' ? 'bg-[#EDF7F2] text-[#136A4E]' : 'bg-[#FFF8EC] text-[#976008]'
                        }`}>
                          {comm.status}
                        </span>
                      </div>
                      <p className="text-[#4A3E40] italic text-[11px]">"{comm.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handlePostComment} className="pt-3 border-t border-[#F2ECE1] space-y-2">
              <textarea
                rows={2}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Leave feedback for "${REVIEW_SECTIONS.find(s => s.id === selectedSection)?.title}"...`}
                className="w-full p-2.5 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] focus:border-[#540D1E] rounded-xl text-xs text-[#20181A] placeholder:text-[#9C8C8E] focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Your Name"
                  className="px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E8DFD1] rounded-lg text-[11px] text-[#20181A] flex-1 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3 h-3 text-[#F4D06F] ${submittingComment ? 'animate-spin' : ''}`} />
                  <span>Send Note</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>

      {/* 👑 Approval Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-manrope animate-fadeIn">
          <div className="max-w-md w-full bg-white border border-[#E8DFD1] rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#FAF4E8] border border-[#F4D06F] flex items-center justify-center text-[#9C772F] mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
                Approve Wedding Invitation
              </h3>
              <p className="text-xs text-[#736567]">
                This will formally certify design approval and notify {studioTitle} to proceed with production publication.
              </p>
            </div>

            <form onSubmit={handleApproveDesign} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="e.g. Dhruv Patel"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Email Address</label>
                <input
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  placeholder="dhruv@example.com"
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3E40] mb-1">Approval Signature Note</label>
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="e.g. Looks perfect, please proceed with printing."
                  className="w-full px-3 py-2 bg-[#FAF6EF] focus:bg-white border border-[#E8DFD1] rounded-xl text-xs text-[#20181A] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-semibold text-[#4A3E40]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingApproval}
                  className="px-5 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#F4D06F]" />
                  <span>{submittingApproval ? 'Submitting Approval...' : 'Confirm Approval'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ClientApprovalPortalView;
