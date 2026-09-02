/**
 * 👑 AMANTRANLINK COMMON INVITATION DATA CONTRACT
 * Single authoritative normalized data structure consumed across:
 * - Editor State
 * - Live Preview Canvas
 * - Standalone Public Views (/i/:slug)
 * - Client Review Portals
 * - All 8 Royal Theme Templates
 */

import { ThemeId, PhotoFilterType } from './wedding';

export interface NormalizedInvitationData {
  invitationId: string;
  slug: string;
  themeId: ThemeId;
  language: 'en' | 'hi' | 'gu';
  
  bride: {
    name: string;
    nameHi?: string;
    nameGu?: string;
    fullName: string;
    parentsEn: string;
    parentsHi?: string;
    parentsGu?: string;
    photoUrl?: string;
  };

  groom: {
    name: string;
    nameHi?: string;
    nameGu?: string;
    fullName: string;
    parentsEn: string;
    parentsHi?: string;
    parentsGu?: string;
    photoUrl?: string;
  };

  coupleDisplayName: string;
  monogramDot: string; // e.g. "D · S"
  monogramAmp: string; // e.g. "D & S"
  monogramPlus: string; // e.g. "D + S"
  hashtag: string;     // e.g. "#DhruvKiShreya"

  wedding: {
    rawDate: string;
    formattedDate: string;
    muhuratTime: string;
    venueName: string;
    venueAddress: string;
    city: string;
    mapUrl: string;
    targetTimestampMs: number;
    customNote?: string;
  };

  events: Array<{
    id: string;
    name: string;
    nameHi?: string;
    nameGu?: string;
    date: string;
    time: string;
    venue: string;
    color?: string;
    icon?: string;
    dressCode?: string;
    mapUrl?: string;
  }>;

  family: {
    groomParents: string;
    brideParents: string;
    rsvp1Name: string;
    rsvp1Phone: string;
    rsvp2Name: string;
    rsvp2Phone: string;
  };

  rsvpConfig: {
    enabled: boolean;
    collectPhone: boolean;
    collectGuestsCount: boolean;
    collectWishes: boolean;
  };

  media: {
    audioUrl?: string;
    audioName: string;
    bgMusicPreset: string;
    isMusicEnabled: boolean;
    photoSlots: Record<string, { url: string; filter?: PhotoFilterType }>;
  };

  studioBadge?: string;
  isLocked: boolean;
  status: 'draft' | 'published';
}
