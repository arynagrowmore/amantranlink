import React, { useState, useEffect } from 'react';
import { 
  Printer, FileText, Image as ImageIcon, Video, Download, 
  Sparkles, CheckCircle2, Clock, RefreshCw, AlertCircle, 
  ExternalLink, Layers, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { WeddingProjectState } from '../../types/wedding';
import { ExportJob, ExportType } from '../../types/export';
import { 
  fetchWeddingExportJobs, 
  createExportJob, 
  generateDigitalPdfBlob 
} from '../../services/exportService';
import { PrintablePdfModal } from './PrintablePdfModal';
import { HdImageExportModal } from './HdImageExportModal';
import { VideoInvitationModal } from './VideoInvitationModal';

interface ExportCenterViewProps {
  state: WeddingProjectState;
  weddingSlug: string;
  weddingSiteId?: string;
  userId?: string;
}

export const ExportCenterView: React.FC<ExportCenterViewProps> = ({
  state,
  weddingSlug,
  weddingSiteId,
  userId,
}) => {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'print_pdf' | 'hd_image' | 'video' | null>(null);
  const [downloadingDigital, setDownloadingDigital] = useState<boolean>(false);

  const coupleNames = `${state.couple.groomEn || 'Dhruv'} & ${state.couple.brideEn || 'Shreya'}`;

  const loadHistory = async () => {
    setLoadingJobs(true);
    const data = await fetchWeddingExportJobs(weddingSlug);
    setJobs(data);
    setLoadingJobs(false);
  };

  useEffect(() => {
    loadHistory();
  }, [weddingSlug]);

  const handleDownloadDigitalPdf = async () => {
    setDownloadingDigital(true);
    try {
      // Record export job
      await createExportJob(weddingSlug, 'digital_pdf', state, weddingSiteId, userId);
      
      const { blob, fileName } = await generateDigitalPdfBlob(state, {
        paperFormat: 'a5',
        layout: 'single_page',
        includeBleedMarks: false,
        bleedMm: 0,
        language: state.language || 'en',
        dpi: 150,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      loadHistory();
    } catch (e) {
      console.error('Digital PDF error:', e);
    } finally {
      setDownloadingDigital(false);
    }
  };

  return (
    <div className="space-y-8 font-manrope text-[#20181A]">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9C772F] font-bold block">
            Invitation Studio &amp; Production
          </span>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#350811] mt-0.5 tracking-tight">
            Export &amp; Download Center
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5D60] mt-0.5 max-w-xl">
            Generate high-resolution printable PDF kankotri cards, WhatsApp digital invitations, social media HD images, and animated video invites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-white border border-[#E8DFD1] text-xs font-bold text-[#540D1E] shadow-2xs">
            Theme: <span className="capitalize">{state.theme}</span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOUR PRIMARY EXPORT FORMATS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* FORMAT 1: PRINTABLE HIGH-RES PDF KANKOTRI */}
        <div className="bg-white border border-[#E8DFD1] hover:border-[#9C772F] rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF4E8] border border-[#F4D06F]/50 flex items-center justify-center text-[#9C772F]">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#8C6D2E] border border-[#F4D06F]/50">
                300 DPI Vector
              </span>
            </div>

            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Printable PDF Kankotri
            </h3>
            <p className="text-xs text-[#6C5D60] leading-relaxed">
              Professional print-ready PDF with real paper sizes (A4, A5, Square 8×8", 5×7"), trim margins, bleed guides, and Devanagari/Gujarati script support.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
            <span className="text-[11px] text-[#8C7A7C]">A4, A5, Square, 5×7"</span>
            <button
              type="button"
              onClick={() => setActiveModal('print_pdf')}
              className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Configure Print PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FORMAT 2: DIGITAL PDF INVITATION */}
        <div className="bg-white border border-[#E8DFD1] hover:border-[#9C772F] rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#EDF7F2] border border-[#BCE3D1] flex items-center justify-center text-[#167A5A]">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]">
                Lightweight PDF
              </span>
            </div>

            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Digital WhatsApp Invitation PDF
            </h3>
            <p className="text-xs text-[#6C5D60] leading-relaxed">
              Optimized for instant WhatsApp messaging, email attachments, and mobile document viewing with crystal clear typography.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
            <span className="text-[11px] text-[#8C7A7C]">Mobile Optimized</span>
            <button
              type="button"
              onClick={handleDownloadDigitalPdf}
              disabled={downloadingDigital}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-bold text-[#4A3E40] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloadingDigital ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9C772F]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#9C772F]" />
              )}
              <span>{downloadingDigital ? 'Generating...' : 'Download Digital PDF'}</span>
            </button>
          </div>
        </div>

        {/* FORMAT 3: HD INVITATION IMAGE */}
        <div className="bg-white border border-[#E8DFD1] hover:border-[#9C772F] rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-center text-[#9C772F]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#FAF6EF] text-[#736567] border border-[#E8DFD1]">
                PNG / JPG
              </span>
            </div>

            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              HD Invitation Image
            </h3>
            <p className="text-xs text-[#6C5D60] leading-relaxed">
              High-resolution raster export designed for Instagram feed posts (4:5), WhatsApp profile pictures (1:1), and story cards (9:16).
            </p>
          </div>

          <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
            <span className="text-[11px] text-[#8C7A7C]">4:5, 1:1, 9:16 Ratios</span>
            <button
              type="button"
              onClick={() => setActiveModal('hd_image')}
              className="px-4 py-2 rounded-xl bg-white border border-[#E8DFD1] hover:bg-[#FAF6EF] text-xs font-bold text-[#4A3E40] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>Export HD Image</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FORMAT 4: ANIMATED VIDEO INVITATION */}
        <div className="bg-white border border-[#E8DFD1] hover:border-[#9C772F] rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#350811] border border-[#F4D06F]/50 flex items-center justify-center text-[#F4D06F]">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#350811] text-[#F4D06F] border border-[#F4D06F]/40">
                12s Motion MP4
              </span>
            </div>

            <h3 className="font-cormorant text-xl font-bold text-[#350811]">
              Animated Video Invitation
            </h3>
            <p className="text-xs text-[#6C5D60] leading-relaxed">
              12-second cinematic vertical story sequence with animated Ganesh blessings, couple reveal, wedding date, and royal venue scene.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
            <span className="text-[11px] text-[#8C7A7C]">720p / 1080p Motion</span>
            <button
              type="button"
              onClick={() => setActiveModal('video')}
              className="px-4 py-2 rounded-xl bg-[#540D1E] hover:bg-[#681025] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Create Video</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#F4D06F]" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. RECENT EXPORTS HISTORY                                                 */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-cormorant text-2xl font-bold text-[#350811]">
              Recent Export Jobs &amp; Downloads
            </h3>
            <p className="text-xs text-[#736567]">
              Scoped export history for {coupleNames}.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loadingJobs}
            className="p-1.5 rounded-xl bg-white hover:bg-[#FAF6EF] text-[#736567] border border-[#E8DFD1] text-xs transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingJobs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingJobs ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#540D1E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#736567]">Loading export history...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-6 bg-white border border-[#E8DFD1] rounded-2xl text-center space-y-1">
            <p className="text-xs font-bold text-[#20181A]">No exports recorded yet</p>
            <p className="text-[11px] text-[#736567]">Choose any format above to generate your first invitation file.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E8DFD1] rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-[#F2ECE1]">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF6EF]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF6EF] border border-[#E8DFD1] flex items-center justify-center text-[#540D1E]">
                      {job.export_type === 'video_invitation' ? (
                        <Video className="w-4 h-4" />
                      ) : job.export_type === 'hd_image' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#20181A] capitalize">
                        {job.export_type.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-[#736567]">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EDF7F2] text-[#136A4E] border border-[#BCE3D1]">
                      Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS                                                                 */}
      {/* ========================================================================= */}
      <PrintablePdfModal
        isOpen={activeModal === 'print_pdf'}
        onClose={() => {
          setActiveModal(null);
          loadHistory();
        }}
        state={state}
        weddingSlug={weddingSlug}
      />

      <HdImageExportModal
        isOpen={activeModal === 'hd_image'}
        onClose={() => {
          setActiveModal(null);
          loadHistory();
        }}
        state={state}
        weddingSlug={weddingSlug}
      />

      <VideoInvitationModal
        isOpen={activeModal === 'video'}
        onClose={() => {
          setActiveModal(null);
          loadHistory();
        }}
        state={state}
        weddingSlug={weddingSlug}
      />

    </div>
  );
};

export default ExportCenterView;
