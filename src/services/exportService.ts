import { createClient } from '@supabase/supabase-js';
import { 
  ExportJob, 
  ExportType, 
  ExportStatus, 
  PrintablePdfConfig, 
  HdImageConfig, 
  VideoInvitationConfig, 
  PaperFormat 
} from '../types/export';
import { WeddingProjectState, Language, ThemeId } from '../types/wedding';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPORT_JOBS_KEY = 'amantranlink_export_jobs_';

// 📐 Dimensions Map (300 DPI Equivalent for Print)
export const PAPER_DIMENSIONS: Record<PaperFormat, { width: number; height: number; label: string }> = {
  a4: { width: 2480, height: 3508, label: 'A4 (210 × 297 mm)' },
  a5: { width: 1748, height: 2480, label: 'A5 (148 × 210 mm)' },
  square: { width: 2400, height: 2400, label: 'Square 8×8" (203 × 203 mm)' },
  '5x7': { width: 1500, height: 2100, label: '5×7" Royal Card (127 × 178 mm)' },
};

function getLocalJobs(weddingSlug: string): ExportJob[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXPORT_JOBS_KEY + weddingSlug.toLowerCase());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalJobs(weddingSlug: string, jobs: ExportJob[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPORT_JOBS_KEY + weddingSlug.toLowerCase(), JSON.stringify(jobs));
  } catch (e) {}
}

/**
 * 🎨 Theme Palette Helper for Exports
 */
export function getThemeExportPalette(themeId: ThemeId) {
  switch (themeId) {
    case 'royaldawn':
      return { bg: '#0A1128', cardBg: '#101F42', textPrimary: '#FFFDF8', accent: '#F4D06F', border: '#C59B4B', secondary: '#8DA9C4' };
    case 'jharokha':
      return { bg: '#0F281E', cardBg: '#173D2F', textPrimary: '#FAF6EE', accent: '#F4D06F', border: '#D4AF37', secondary: '#A3B899' };
    case 'mayura':
      return { bg: '#052A36', cardBg: '#093B4C', textPrimary: '#FFFDF8', accent: '#38D9A9', border: '#12B886', secondary: '#96F2D7' };
    case 'ivory':
      return { bg: '#FAF8F5', cardBg: '#FFFFFF', textPrimary: '#20181A', accent: '#9C772F', border: '#E8DFD1', secondary: '#736567' };
    case 'royalring':
      return { bg: '#1A0B2E', cardBg: '#2A1248', textPrimary: '#FFFDF8', accent: '#F1C40F', border: '#9B59B6', secondary: '#D7BDE2' };
    case 'dak':
      return { bg: '#2D1B08', cardBg: '#3F2710', textPrimary: '#FFFDF8', accent: '#D4AC0D', border: '#B7950B', secondary: '#FAD7A0' };
    case 'jodi':
    case 'rajmahal':
    default:
      return { bg: '#1A0307', cardBg: '#28060C', textPrimary: '#FFFDF8', accent: '#F4D06F', border: '#C59B4B', secondary: '#D9C8CB' };
  }
}

/**
 * 🖨️ High-Res Canvas Kankotri Renderer (Vector Graphics & Typography)
 */
export async function renderHighResKankotriCanvas(
  state: WeddingProjectState,
  config: PrintablePdfConfig
): Promise<HTMLCanvasElement> {
  const dims = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.a4;
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create high-resolution Canvas context');

  const palette = getThemeExportPalette(state.theme);
  const lang = config.language || state.language || 'en';

  // 1. Background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, dims.width, dims.height);

  // 2. Decorative Double Royal Border
  const margin = Math.round(dims.width * 0.04);
  const innerMargin = margin + Math.round(dims.width * 0.015);

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = Math.round(dims.width * 0.004);
  ctx.strokeRect(margin, margin, dims.width - margin * 2, dims.height - margin * 2);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = Math.round(dims.width * 0.0015);
  ctx.strokeRect(innerMargin, innerMargin, dims.width - innerMargin * 2, dims.height - innerMargin * 2);

  // 3. Auspicious Shloka / Invocation
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.accent;
  ctx.font = `bold ${Math.round(dims.width * 0.024)}px 'Cinzel', serif`;

  let invocation = '|| SHREE GANESHAYA NAMAHA ||';
  if (lang === 'hi') invocation = '॥ श्री गणेशाय नमः ॥';
  if (lang === 'gu') invocation = '॥ શ્રી ગણેશાય નમઃ ॥';
  ctx.fillText(invocation, dims.width / 2, margin + Math.round(dims.height * 0.06));

  // 4. Host Family Invitation Line
  ctx.fillStyle = palette.secondary;
  ctx.font = `${Math.round(dims.width * 0.02)}px 'Plus Jakarta Sans', sans-serif`;
  const hostLine = state.family?.groomParentsEn 
    ? `${state.family.groomParentsEn} cordially invite you to celebrate the royal wedding of`
    : 'Cordially invite you to celebrate the royal wedding of';
  ctx.fillText(hostLine, dims.width / 2, margin + Math.round(dims.height * 0.12));

  // 5. Grand Couple Names
  const groom = lang === 'hi' ? (state.couple.groomHi || state.couple.groomEn) : lang === 'gu' ? (state.couple.groomGu || state.couple.groomEn) : state.couple.groomEn;
  const bride = lang === 'hi' ? (state.couple.brideHi || state.couple.brideEn) : lang === 'gu' ? (state.couple.brideGu || state.couple.brideEn) : state.couple.brideEn;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(dims.width * 0.055)}px 'Cinzel', 'Playfair Display', serif`;
  ctx.fillText(groom || 'Groom', dims.width / 2, margin + Math.round(dims.height * 0.22));

  ctx.fillStyle = palette.accent;
  ctx.font = `italic ${Math.round(dims.width * 0.035)}px 'Cinzel', serif`;
  ctx.fillText('weds', dims.width / 2, margin + Math.round(dims.height * 0.27));

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(dims.width * 0.055)}px 'Cinzel', 'Playfair Display', serif`;
  ctx.fillText(bride || 'Bride', dims.width / 2, margin + Math.round(dims.height * 0.34));

  // 6. Auspicious Date & Muhurat
  ctx.fillStyle = palette.accent;
  ctx.font = `bold ${Math.round(dims.width * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(`📅 ${state.couple.weddingDate || '10 December 2026'}`, dims.width / 2, margin + Math.round(dims.height * 0.42));

  if (state.couple.muhuratTime) {
    ctx.fillStyle = palette.secondary;
    ctx.font = `${Math.round(dims.width * 0.018)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText(`Auspicious Hastamelap: ${state.couple.muhuratTime}`, dims.width / 2, margin + Math.round(dims.height * 0.455));
  }

  // 7. Mangal Rasam Events Grid
  const eventsStartY = margin + Math.round(dims.height * 0.52);
  const events = state.events || [];
  const eventBoxWidth = Math.round((dims.width - innerMargin * 2 - 40) / Math.min(events.length || 1, 3));

  events.slice(0, 3).forEach((ev, idx) => {
    const x = innerMargin + 20 + idx * eventBoxWidth + eventBoxWidth / 2;
    
    // Card Box
    ctx.fillStyle = palette.cardBg;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    const boxX = innerMargin + 20 + idx * eventBoxWidth + 10;
    const boxW = eventBoxWidth - 20;
    const boxH = Math.round(dims.height * 0.16);
    ctx.beginPath();
    ctx.roundRect(boxX, eventsStartY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();

    // Event Title
    ctx.fillStyle = palette.accent;
    ctx.font = `bold ${Math.round(dims.width * 0.018)}px 'Cinzel', serif`;
    const eventName = lang === 'hi' ? (ev.nameHi || ev.name) : lang === 'gu' ? (ev.nameGu || ev.name) : ev.name;
    ctx.fillText(eventName || 'Event', x, eventsStartY + 35);

    // Event Date & Time
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(dims.width * 0.015)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText(`${ev.date} · ${ev.time}`, x, eventsStartY + 70);

    // Event Venue
    ctx.fillStyle = palette.secondary;
    ctx.font = `${Math.round(dims.width * 0.013)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText(ev.venue || 'Wedding Venue', x, eventsStartY + 105);
  });

  // 8. Main Venue & Address
  const venueY = margin + Math.round(dims.height * 0.74);
  ctx.fillStyle = palette.accent;
  ctx.font = `bold ${Math.round(dims.width * 0.024)}px 'Cinzel', serif`;
  ctx.fillText('🏛️ WEDDING VENUE', dims.width / 2, venueY);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(dims.width * 0.022)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(state.couple.venueName || 'The Milestone', dims.width / 2, venueY + 35);

  ctx.fillStyle = palette.secondary;
  ctx.font = `${Math.round(dims.width * 0.016)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(state.couple.venueAddress || 'The Milestone Highway', dims.width / 2, venueY + 70);

  // 9. RSVP Helpdesk & Footer
  const footerY = margin + Math.round(dims.height * 0.88);
  ctx.fillStyle = palette.accent;
  ctx.font = `bold ${Math.round(dims.width * 0.018)}px 'Cinzel', serif`;
  ctx.fillText('RSVP & HELPDESK', dims.width / 2, footerY);

  ctx.fillStyle = palette.secondary;
  ctx.font = `${Math.round(dims.width * 0.016)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillText(`${state.family?.rsvp1Name || 'Family'} (${state.family?.rsvp1Phone || '+91 9876543210'})`, dims.width / 2, footerY + 30);

  // 10. Bleed / Trim Guides if requested
  if (config.includeBleedMarks) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(margin, margin, dims.width - margin * 2, dims.height - margin * 2);
    ctx.setLineDash([]);
  }

  return canvas;
}

/**
 * 📄 Digital PDF Generator (Downloadable lightweight document)
 */
export async function generateDigitalPdfBlob(
  state: WeddingProjectState,
  config: PrintablePdfConfig
): Promise<{ blob: Blob; fileName: string }> {
  const canvas = await renderHighResKankotriCanvas(state, config);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  // Construct PDF wrapper containing vector high-res canvas image
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${state.couple.groomEn} & ${state.couple.brideEn} · Wedding Kankotri</title>
        <style>
          @page { size: ${config.paperFormat}; margin: 0; }
          body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; }
          img { width: 100vw; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" />
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const cleanSlug = `${state.couple.groomEn || 'Dhruv'}_${state.couple.brideEn || 'Shreya'}`.replace(/\s+/g, '_');
  const fileName = `${cleanSlug}_Wedding_Kankotri.html`;

  return { blob, fileName };
}

/**
 * 🖼️ High-Resolution HD Image Exporter
 */
export async function generateHdImageBlob(
  state: WeddingProjectState,
  config: HdImageConfig
): Promise<{ blob: Blob; dataUrl: string; fileName: string }> {
  const canvas = await renderHighResKankotriCanvas(state, {
    paperFormat: config.ratio === 'square' ? 'square' : 'a4',
    layout: 'single_page',
    includeBleedMarks: false,
    bleedMm: 0,
    language: config.language,
    dpi: 300,
  });

  const mimeType = config.format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, config.quality || 0.95);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const cleanSlug = `${state.couple.groomEn || 'Dhruv'}_${state.couple.brideEn || 'Shreya'}`.replace(/\s+/g, '_');
      const ext = config.format === 'png' ? 'png' : 'jpg';
      const fileName = `${cleanSlug}_HD_Invitation_${config.ratio}.${ext}`;
      resolve({ blob: blob || new Blob(), dataUrl, fileName });
    }, mimeType, config.quality || 0.95);
  });
}

/**
 * 🎬 Animated Video Invitation Generator
 * Renders cinematic animated scenes directly on Canvas using MediaRecorder API.
 */
export async function generateAnimatedVideoInvitation(
  state: WeddingProjectState,
  config: VideoInvitationConfig,
  onProgress?: (progressLabel: string) => void
): Promise<{ blob: Blob; fileName: string; videoUrl: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      if (onProgress) onProgress('Preparing Royal Video Scenes');

      const width = config.resolution === '1080p' ? 1080 : 720;
      const height = config.resolution === '1080p' ? 1920 : 1280; // Vertical Story format (9:16)

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context not available');

      const palette = getThemeExportPalette(config.themeId || state.theme);
      const stream = canvas.captureStream(30); // 30 FPS stream

      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
      let selectedMime = 'video/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(finalBlob);
        const cleanSlug = `${state.couple.groomEn || 'Dhruv'}_${state.couple.brideEn || 'Shreya'}`.replace(/\s+/g, '_');
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const fileName = `${cleanSlug}_Royal_Video_Invitation.${ext}`;
        resolve({ blob: finalBlob, fileName, videoUrl });
      };

      recorder.start();

      const totalFrames = 30 * 12; // 12 Seconds at 30 FPS
      let currentFrame = 0;

      const groom = state.couple.groomEn || 'Dhruv';
      const bride = state.couple.brideEn || 'Shreya';
      const date = state.couple.weddingDate || '10 December 2026';
      const venue = state.couple.venueName || 'The Milestone';

      const renderFrame = () => {
        const progress = currentFrame / totalFrames;
        const second = currentFrame / 30;

        // Clear Background
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, width, height);

        // Decorative Border
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 6;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        ctx.textAlign = 'center';

        if (second < 3) {
          // SCENE 1: Auspicious Invocations & Family
          if (onProgress && currentFrame % 30 === 0) onProgress('Rendering Scene 1: Auspicious Invocation');
          const alpha = Math.min(1, second * 1.2);
          ctx.globalAlpha = alpha;

          ctx.fillStyle = palette.accent;
          ctx.font = `bold ${Math.round(width * 0.045)}px 'Cinzel', serif`;
          ctx.fillText('॥ श्री गणेशाय नमः ॥', width / 2, height * 0.35);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `${Math.round(width * 0.035)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText('With the divine blessings of our ancestors', width / 2, height * 0.45);
          ctx.fillText('& beloved families', width / 2, height * 0.5);

          ctx.fillStyle = palette.accent;
          ctx.font = `italic ${Math.round(width * 0.03)}px 'Cinzel', serif`;
          ctx.fillText('We cordially invite you to celebrate', width / 2, height * 0.6);

        } else if (second < 6) {
          // SCENE 2: Couple Reveal
          if (onProgress && currentFrame % 30 === 0) onProgress('Rendering Scene 2: Royal Couple Reveal');
          const alpha = Math.min(1, (second - 3) * 1.2);
          ctx.globalAlpha = alpha;

          ctx.fillStyle = palette.accent;
          ctx.font = `italic ${Math.round(width * 0.035)}px 'Cinzel', serif`;
          ctx.fillText('The Auspicious Wedding Of', width / 2, height * 0.3);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(width * 0.08)}px 'Cinzel', serif`;
          ctx.fillText(groom, width / 2, height * 0.42);

          ctx.fillStyle = palette.accent;
          ctx.font = `italic ${Math.round(width * 0.05)}px 'Cinzel', serif`;
          ctx.fillText('weds', width / 2, height * 0.5);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(width * 0.08)}px 'Cinzel', serif`;
          ctx.fillText(bride, width / 2, height * 0.62);

          if (state.couple.hashtag) {
            ctx.fillStyle = palette.secondary;
            ctx.font = `bold ${Math.round(width * 0.03)}px 'Plus Jakarta Sans', sans-serif`;
            ctx.fillText(state.couple.hashtag, width / 2, height * 0.72);
          }

        } else if (second < 9) {
          // SCENE 3: Auspicious Date & Muhurat
          if (onProgress && currentFrame % 30 === 0) onProgress('Rendering Scene 3: Date & Muhurat');
          const alpha = Math.min(1, (second - 6) * 1.2);
          ctx.globalAlpha = alpha;

          ctx.fillStyle = palette.accent;
          ctx.font = `bold ${Math.round(width * 0.04)}px 'Cinzel', serif`;
          ctx.fillText('SAVE THE AUSPICIOUS DATE', width / 2, height * 0.35);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(width * 0.055)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(date, width / 2, height * 0.45);

          if (state.couple.muhuratTime) {
            ctx.fillStyle = palette.accent;
            ctx.font = `${Math.round(width * 0.035)}px 'Plus Jakarta Sans', sans-serif`;
            ctx.fillText(`Hastamelap: ${state.couple.muhuratTime}`, width / 2, height * 0.55);
          }

        } else {
          // SCENE 4: Royal Venue & Hospitality Closing
          if (onProgress && currentFrame % 30 === 0) onProgress('Rendering Scene 4: Venue & Closing');
          const alpha = Math.min(1, (second - 9) * 1.2);
          ctx.globalAlpha = alpha;

          ctx.fillStyle = palette.accent;
          ctx.font = `bold ${Math.round(width * 0.04)}px 'Cinzel', serif`;
          ctx.fillText('🏛️ ROYAL WEDDING VENUE', width / 2, height * 0.35);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(width * 0.045)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(venue, width / 2, height * 0.44);

          ctx.fillStyle = palette.secondary;
          ctx.font = `${Math.round(width * 0.03)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(state.couple.venueAddress || '', width / 2, height * 0.51);

          ctx.fillStyle = palette.accent;
          ctx.font = `italic ${Math.round(width * 0.032)}px 'Cinzel', serif`;
          ctx.fillText('"Your presence will make our celebration complete"', width / 2, height * 0.65);
        }

        ctx.globalAlpha = 1;
        currentFrame++;

        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      };

      renderFrame();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 📦 Create & Track Export Job
 */
export async function createExportJob(
  weddingSlug: string,
  exportType: ExportType,
  state: WeddingProjectState,
  weddingSiteId?: string | null,
  userId?: string | null
): Promise<ExportJob> {
  const cleanSlug = (weddingSlug || '').trim().toLowerCase();
  const jobPayload = {
    wedding_slug: cleanSlug,
    wedding_site_id: weddingSiteId || null,
    user_id: userId || null,
    export_type: exportType,
    status: 'queued' as ExportStatus,
    progress_label: 'Queued for Rendering',
    input_snapshot: state,
    created_at: new Date().toISOString(),
  };

  const { data: dbJob, error } = await supabase
    .from('export_jobs')
    .insert([jobPayload])
    .select()
    .single();

  if (!error && dbJob) {
    return dbJob;
  }

  // Local fallback
  const localJob: ExportJob = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...jobPayload,
  };

  const existing = getLocalJobs(cleanSlug);
  saveLocalJobs(cleanSlug, [localJob, ...existing]);
  return localJob;
}

/**
 * 🕒 Fetch Export Jobs History
 */
export async function fetchWeddingExportJobs(weddingSlug: string): Promise<ExportJob[]> {
  try {
    const cleanSlug = (weddingSlug || '').trim().toLowerCase();

    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('wedding_slug', cleanSlug)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    return getLocalJobs(cleanSlug);
  } catch (err) {
    return getLocalJobs(weddingSlug);
  }
}
