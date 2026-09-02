/**
 * 👑 AMANTRANLINK — EXPORT STUDIO & DIGITAL DOWNLOAD TYPES
 */

import { WeddingProjectState, ThemeId, Language } from './wedding';

export type ExportType = 'printable_pdf' | 'digital_pdf' | 'hd_image' | 'video_invitation';
export type ExportStatus = 'queued' | 'rendering' | 'completed' | 'failed';
export type PaperFormat = 'a4' | 'a5' | 'square' | '5x7';
export type PrintLayout = 'single_page' | 'two_page' | 'foldable';
export type ImageRatio = 'portrait' | 'square' | 'story' | 'original';
export type VideoResolution = '720p' | '1080p';

export interface ExportJob {
  id: string;
  wedding_site_id?: string | null;
  wedding_slug: string;
  user_id?: string | null;
  export_type: ExportType;
  status: ExportStatus;
  progress_label: string;
  input_snapshot: Partial<WeddingProjectState>;
  output_url?: string | null;
  file_name?: string;
  file_size_bytes?: number;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
}

export interface PrintablePdfConfig {
  paperFormat: PaperFormat;
  layout: PrintLayout;
  includeBleedMarks: boolean;
  bleedMm: number;
  language: Language;
  dpi: number;
}

export interface HdImageConfig {
  format: 'png' | 'jpeg';
  ratio: ImageRatio;
  quality: number;
  language: Language;
}

export interface VideoInvitationConfig {
  resolution: VideoResolution;
  durationSeconds: number;
  includeAudio: boolean;
  themeId: ThemeId;
  language: Language;
}
