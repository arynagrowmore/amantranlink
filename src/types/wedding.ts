export type ThemeId = 'rajmahal' | 'jharokha' | 'mayura' | 'jodi' | 'dak' | 'ivory' | 'royaldawn' | 'royalring';
export type ViewMode = 'desktop' | 'tablet' | 'mobile';
export type Language = 'en' | 'hi' | 'gu';
export type PhotoFilterType = 'none' | 'gold-glow' | 'vintage' | 'rose-blush' | 'monochrome';
export type PackageType = 'silver' | 'gold' | 'platinum';
export type InvitationType = 'wedding' | 'engagement';

export interface PhotoSlot {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  storagePath?: string;
  file: File | null;
  filter?: PhotoFilterType;
}

export interface WeddingEvent {
  id: string;
  name: string;
  nameHi: string;
  nameGu: string;
  date: string;
  time: string;
  venue: string;
  mapUrl?: string;
  color: string;
  icon: string;
  dressCode?: string;
}

export interface StoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

export interface WeddingTheme {
  id: ThemeId;
  name: string;
  tagline: string;
  price: number;
  icon: string;
  badge: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  url: string;
  category?: string;
  invitation_type?: InvitationType;
}

export interface WeddingProjectState {
  theme: ThemeId;
  invitation_type?: InvitationType;
  viewMode: ViewMode;
  previewZoom: number;
  language: Language;
  couple: {
    groomEn: string;
    groomHi: string;
    groomGu: string;
    brideEn: string;
    brideHi: string;
    brideGu: string;
    mark: string;
    hashtag: string;
    weddingDate: string;
    muhuratTime: string;
    venueName: string;
    venueAddress: string;
    mapUrl: string;
    customNote?: string;
  };
  events: WeddingEvent[];
  storyMilestones?: StoryMilestone[];
  family: {
    groomParentsEn: string;
    groomParentsHi: string;
    groomParentsGu: string;
    brideParentsEn: string;
    brideParentsHi: string;
    brideParentsGu: string;
    rsvp1Name: string;
    rsvp1Phone: string;
    rsvp2Name: string;
    rsvp2Phone: string;
    customNote?: string;
  };
  media: {
    audioName: string;
    audioUrl?: string;
    audioBlob: File | null;
    bgMusicPreset?: string;
    isMusicEnabled?: boolean;
    photoSlots: Record<string, PhotoSlot>;
  };
  rsvpConfig?: {
    enabled: boolean;
    collectPhone: boolean;
    collectGuestsCount: boolean;
    collectMealPreference: boolean;
    collectWishes: boolean;
    deadline?: string;
    note?: string;
  };
}

// 👤 User Profile Schema
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  photoURL?: string;
  role?: UserRole | string;
  accountStatus?: 'active' | 'suspended';
  account_status?: 'active' | 'suspended';
  studioName?: string;
  partnerSlug?: string;
  studioHandle?: string;
  payoutUpi?: string;
  package_tier?: string;
  isVipAdmin?: boolean;
  createdAt: string;
}

// 💳 Purchase Schema (purchases/{uid}_{templateId})
export interface Purchase {
  id: string; // `${uid}_${templateId}`
  uid: string;
  templateId: ThemeId;
  status: 'unlocked';
  paymentGateway: 'razorpay' | 'cashfree';
  orderId?: string;
  paymentId?: string;
  paymentReference?: string;
  payment_reference?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountInr: number;
  currency: 'INR';
  paymentStatus: 'PAID' | 'SUCCESS';
  unlockedAt: string;
  createdAt: string;
}

// 🔒 Access Control States
export type InvitationEditingStatus = 'locked' | 'unlocked';
export type InvitationPublicationStatus = 'draft' | 'published';
export type InvitationPaymentStatus = 'unpaid' | 'paid';

// 🏰 Wedding Site Schema (weddingSites/{siteId})
export interface WeddingSite {
  id?: string;
  siteId: string;
  uid: string;
  templateId: ThemeId;
  template_id?: string;
  slug?: string;
  status: 'draft' | 'published'; // publicationStatus alias
  isLocked: boolean; // true if editing is currently locked
  is_locked?: boolean;
  editingStatus?: InvitationEditingStatus;
  publicationStatus?: InvitationPublicationStatus;
  paymentStatus?: InvitationPaymentStatus;
  workflow_status?: string;
  lifecycle_status?: string;
  partner_id?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  partner_notes?: string | null;
  studio_badge?: string | null;
  content: WeddingProjectState; // Active published version served to guests
  draftContent?: WeddingProjectState; // Work-in-progress draft during editing
  publishedUrl?: string;
  published_url?: string;
  publishedAt?: string;
  unlockedAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// 🏷️ Template Catalog Config
export interface TemplateConfig {
  templateId: ThemeId;
  name: string;
  previewImage: string;
  priceInr: number;
  reEditFeeInr: number;
  category: string;
}

// 🔒 Lock State Enum
export type TemplateLockState = 'LOCKED' | 'UNLOCKED_DRAFT' | 'PUBLISHED_LOCKED';

// 📸 Commercial Roles & Partner Model Types
export type UserRole = 'end_customer' | 'partner' | 'admin' | 'couple';

export interface PartnerProfile {
  partnerId: string;
  studioName: string;
  partnerSlug: string;
  payoutUpi?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'pending' | 'suspended';
  createdAt?: string;
}

export interface CommissionRecord {
  id: string;
  partnerId: string;
  weddingSiteId?: string;
  orderId: string;
  paymentId?: string;
  retailPrice: number;
  commissionAmount: number;
  status: 'pending' | 'credited' | 'paid';
  createdAt: string;
}

export interface PartnerDashboardStats {
  totalWeddings: number;
  draftWeddings: number;
  liveWeddings: number;
  totalGmv: number;
  totalCommission: number;
  pendingCommission: number;
  availableCredit: number;
  recentCommissions?: CommissionRecord[];
}

