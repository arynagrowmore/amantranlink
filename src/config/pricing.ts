import { PackageType, ThemeId } from '../types/wedding';

export interface PackagePricingConfig {
  id: PackageType;
  name: string;
  priceInr: number;
  amountInPaise: number;
  badge: string;
  subtitle: string;
  features: string[];
}

// 🏛️ OFFICIAL AMANTRANLINK RETAIL PRICING (FOR COUPLES / END USERS)
export const OFFICIAL_PACKAGES: Record<PackageType, PackagePricingConfig> = {
  silver: {
    id: 'silver',
    name: 'Shahi Silver (Shubh Vivah)',
    priceInr: 499,
    amountInPaise: 49900,
    badge: 'Super Affordable (₹499)',
    subtitle: 'Wax Seal Envelope, Gold Scratch Card & 5 Sacred Ceremonies',
    features: [
      'Shubh Vivah Theme Included',
      'Real Wax Seal Envelope Opening',
      'Interactive Rub & Reveal Gold Scratch Card',
      'Drifting Petals & Sacred Mandalas Animation',
      'Background Shehnai & Sangeet Audio Player',
      '1-Tap Google Maps GPS Route to Mandap',
      'Unlimited Guest RSVPs & Family Wishes',
      'Permanent Lifetime Cloud Hosting',
    ],
  },
  gold: {
    id: 'gold',
    name: 'Shahi Gold Royal (Rose Farman & All Themes)',
    priceInr: 699,
    amountInPaise: 69900,
    badge: '⭐ Most Popular Choice (₹699)',
    subtitle: '3D Envelope Flap, Rose Petal Rain Physics & 7 Illustrated Chapters',
    features: [
      'Both Shubh Vivah & Rose Farman Themes Included',
      '3D Animated Letter Envelope Sliding Flap',
      'Continuous Rose Petal Rain Physics Engine',
      'Gold Heart Rub & Reveal Scratch Card',
      '7 Illustrated Ceremony Chapter Cards',
      'Trilingual Vivah Engine (EN, HI, GU)',
      'Lossless Shehnai & Custom Audio Uploads',
      'Guest Hospitality & RSVP Management Portal',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'Rajmahal Platinum VIP (All Themes + VIP)',
    priceInr: 999,
    amountInPaise: 99900,
    badge: '👑 Royal VIP Suite (₹999)',
    subtitle: 'All Royal Themes + Priority Fast Hosting & White-Glove Support',
    features: [
      'All Themes Included (Shubh Vivah, Rose Farman & Future Themes)',
      'Priority Cloud CDN & High-Speed Loading',
      'Custom Monogram & Typography Presets',
      'WhatsApp Bespoke Guest Invitation Links',
      'Dedicated VIP WhatsApp Support',
    ],
  },
};

// 🏛️ Which Package is automatically associated with each Theme
export const THEME_PACKAGE_MAP: Record<ThemeId, PackageType> = {
  'shubh-lagna': 'silver',   // ₹499 Entry
  'shubh-vivah': 'gold',     // ₹699 Popular
  'rose-farman': 'gold',     // ₹699 Popular
  'royal-orchid': 'platinum',// ₹999 Masterpiece
  'shahi-farman': 'platinum',// ₹999 Masterpiece
  rajmahal: 'platinum',
  royaldawn: 'gold',
  royalring: 'platinum',
  darbar: 'platinum',
  chandramahal: 'platinum',
  swarnim: 'gold',
  shahidesk: 'platinum',
  jharokha: 'silver',
  mayura: 'silver',
  jodi: 'silver',
  dak: 'silver',
  ivory: 'silver',
};

// 🏷️ Official Theme Pricing Catalog (Matches Package Map)
export const THEME_PRICING_CATALOG: Record<ThemeId, { priceInr: number; amountInPaise: number; packageId: PackageType; name: string }> = {
  'shubh-lagna': { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'Shubh Lagna · Marigold Heritage' },
  'shubh-vivah': { priceInr: 699, amountInPaise: 69900, packageId: 'gold', name: 'Shubh Vivah · Wax Seal & Gold Scratch' },
  'rose-farman': { priceInr: 699, amountInPaise: 69900, packageId: 'gold', name: 'The Rose Farman · Petal Rain & Scratch Card' },
  'royal-orchid': { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Royal Orchid · 3D Palace Gate' },
  'shahi-farman': { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Shahi Dastavej · Golden Envelope & Doors' },
  rajmahal: { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Rajmahal 3D Palace' },
  royaldawn: { priceInr: 699, amountInPaise: 69900, packageId: 'gold', name: 'The Royal Dawn (Lakefront & Scratch Card)' },
  royalring: { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Royal Ring (3D Diamond Engagement)' },
  darbar: { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Rajasthani Darbar (Silk Curtain & Scratch)' },
  chandramahal: { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Chandra Mahal (3D Gate & Peacocks)' },
  swarnim: { priceInr: 699, amountInPaise: 69900, packageId: 'gold', name: 'Swarnim Farman & Scratch Card' },
  shahidesk: { priceInr: 999, amountInPaise: 99900, packageId: 'platinum', name: 'The Shahi Dastavej Desk (Scrapbook & Sangeet)' },
  jharokha: { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'The Jharokha Mandap' },
  mayura: { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'The Mayura Peacock' },
  jodi: { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'The Shubh Jodi' },
  dak: { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'The Shahi Dâk' },
  ivory: { priceInr: 499, amountInPaise: 49900, packageId: 'silver', name: 'The Ivory Minimalist' },
};

// 👑 Two-Role Commercial Role Identifiers
export const COMMERCIAL_ROLES = {
  END_CUSTOMER: 'end_customer' as const,
  PHOTOGRAPHER_PARTNER: 'partner' as const,
};

// 💰 Configurable Partner Settlement Rules
export const MIN_SETTLEMENT_AMOUNT_INR = 500;

// 🏛️ PHOTOGRAPHER / STUDIO PARTNER WHOLESALE PRICING & REVENUE SCHEDULE
export interface PartnerPackagePricingConfig {
  packageId: PackageType;
  name: string;
  retailPriceInr: number;
  partnerPriceInr: number;
  commissionInr: number;
  partnerAmountInPaise: number;
}

export const PARTNER_PACKAGES: Record<PackageType, PartnerPackagePricingConfig> = {
  silver: {
    packageId: 'silver',
    name: 'Shahi Silver (Studio Rate)',
    retailPriceInr: 499,
    partnerPriceInr: 349,
    commissionInr: 150,
    partnerAmountInPaise: 34900,
  },
  gold: {
    packageId: 'gold',
    name: 'Shahi Gold Royal (Studio Rate)',
    retailPriceInr: 699,
    partnerPriceInr: 499,
    commissionInr: 200,
    partnerAmountInPaise: 49900,
  },
  platinum: {
    packageId: 'platinum',
    name: 'Rajmahal Platinum VIP (Studio Rate)',
    retailPriceInr: 999,
    partnerPriceInr: 699,
    commissionInr: 300,
    partnerAmountInPaise: 69900,
  },
};

// 🧮 Authoritative Pricing Calculation Function (Single Source of Truth)
export function calculatePaymentDetails(
  packageId?: PackageType | null,
  templateId?: ThemeId | null,
  userRole?: string | null
): {
  packageId: PackageType;
  packageName: string;
  originalAmountInr: number;
  retailPriceInr: number;
  partnerPriceInr: number;
  commissionAmountInr: number;
  discountAmountInr: number;
  isPartnerPricing: boolean;
  finalAmountInr: number;
  finalAmountInPaise: number;
} {
  // Determine effective package: if packageId is passed, use it. Otherwise derive from theme.
  let effectivePackage: PackageType = 'gold';
  if (packageId && OFFICIAL_PACKAGES[packageId]) {
    effectivePackage = packageId;
  } else if (templateId && THEME_PACKAGE_MAP[templateId]) {
    effectivePackage = THEME_PACKAGE_MAP[templateId];
  }

  const pkg = OFFICIAL_PACKAGES[effectivePackage];
  const partnerPkg = PARTNER_PACKAGES[effectivePackage];
  const isPartner = userRole === 'partner' || userRole === 'PHOTOGRAPHER_PARTNER';

  const retailPriceInr = pkg.priceInr;
  const partnerPriceInr = partnerPkg.partnerPriceInr;
  const commissionAmountInr = partnerPkg.commissionInr;

  const originalAmountInr = retailPriceInr;
  const finalAmountInr = isPartner ? partnerPriceInr : retailPriceInr;
  const discountAmountInr = isPartner ? (retailPriceInr - partnerPriceInr) : 0;
  const finalAmountInPaise = finalAmountInr * 100;

  return {
    packageId: effectivePackage,
    packageName: isPartner ? partnerPkg.name : pkg.name,
    originalAmountInr,
    retailPriceInr,
    partnerPriceInr,
    commissionAmountInr,
    discountAmountInr,
    isPartnerPricing: isPartner,
    finalAmountInr,
    finalAmountInPaise,
  };
}

export default calculatePaymentDetails;
