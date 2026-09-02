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
    name: 'Shahi Silver',
    priceInr: 999,
    amountInPaise: 99900,
    badge: 'Popular for Single Theme (₹999)',
    subtitle: 'Classic Royal Invitation for 1 Selected Theme',
    features: [
      '1 Chosen Royal Theme',
      'Background Shehnai Audio Player',
      '1-Tap Google Maps GPS Route',
      'Unlimited Guest RSVPs & Wishes',
      'Full Hindi, Gujarati & English Scripts',
      'Permanent Cloud Hosting',
    ],
  },
  gold: {
    id: 'gold',
    name: 'Shahi Gold Royal',
    priceInr: 1299,
    amountInPaise: 129900,
    badge: '👑 Most Chosen for Royal Weddings (₹1,299)',
    subtitle: 'All 7 Royal Themes Included with 3D Palace Gates & Scratch Cards',
    features: [
      'All 7 Royal Themes Included',
      '3D Animated Palace Gates & Parallax',
      'Gold Scratch-Heart Blessing Card',
      'Trilingual Vivah Engine (EN, HI, GU)',
      'Lossless Shehnai & Audio Uploads',
      'Digital QR Entry Pass & Guest Directory',
      'Live RSVP Analytics & Excel Download',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'Rajmahal Platinum VIP',
    priceInr: 2499,
    amountInPaise: 249900,
    badge: '⭐ Bespoke White-Glove VIP Suite (₹2,499)',
    subtitle: 'Full Custom Designer Build, Dedicated Concierge & .com Domain',
    features: [
      'Dedicated Royal Design Director',
      'Custom .com Domain Setup',
      'All 7 Royal Themes Included',
      '24K Gold Acrylic Keepsake QR Plaque',
      'Guest RSVP Concierge Support',
      'Priority Global CDN & High-Speed Servers',
    ],
  },
};

// 🏛️ Which Package is automatically associated with each Theme
export const THEME_PACKAGE_MAP: Record<ThemeId, PackageType> = {
  rajmahal: 'gold',     // 3D Palace Heritage -> Gold Royal (₹1,299)
  royaldawn: 'gold',    // Lakefront & Scratch Card -> Gold Royal (₹1,299)
  royalring: 'gold',    // 3D Floating Diamond Engagement -> Gold Royal (₹1,299)
  jharokha: 'silver',   // Rajasthani Arch -> Silver (₹999)
  mayura: 'silver',     // Peacock Teal -> Silver (₹999)
  jodi: 'silver',       // Sacred Thaali -> Silver (₹999)
  dak: 'silver',        // Royal Postal Telegram -> Silver (₹999)
  ivory: 'silver',      // Haute Couture Minimalist -> Silver (₹999)
};

// 🏷️ Official Theme Pricing Catalog (Matches Package Map)
export const THEME_PRICING_CATALOG: Record<ThemeId, { priceInr: number; amountInPaise: number; packageId: PackageType; name: string }> = {
  rajmahal: { priceInr: 1299, amountInPaise: 129900, packageId: 'gold', name: 'The Rajmahal 3D Palace' },
  royaldawn: { priceInr: 1299, amountInPaise: 129900, packageId: 'gold', name: 'The Royal Dawn (Lakefront & Scratch Card)' },
  royalring: { priceInr: 1299, amountInPaise: 129900, packageId: 'gold', name: 'The Royal Ring (3D Diamond Engagement)' },
  jharokha: { priceInr: 999, amountInPaise: 99900, packageId: 'silver', name: 'The Jharokha Mandap' },
  mayura: { priceInr: 999, amountInPaise: 99900, packageId: 'silver', name: 'The Mayura Peacock' },
  jodi: { priceInr: 999, amountInPaise: 99900, packageId: 'silver', name: 'The Shubh Jodi' },
  dak: { priceInr: 999, amountInPaise: 99900, packageId: 'silver', name: 'The Shahi Dâk' },
  ivory: { priceInr: 999, amountInPaise: 99900, packageId: 'silver', name: 'The Ivory Minimalist' },
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
    name: 'Shahi Silver (Partner Rate)',
    retailPriceInr: 999,
    partnerPriceInr: 699,
    commissionInr: 300,
    partnerAmountInPaise: 69900,
  },
  gold: {
    packageId: 'gold',
    name: 'Shahi Gold Royal (Partner Rate)',
    retailPriceInr: 1299,
    partnerPriceInr: 899,
    commissionInr: 400,
    partnerAmountInPaise: 89900,
  },
  platinum: {
    packageId: 'platinum',
    name: 'Rajmahal Platinum VIP (Partner Rate)',
    retailPriceInr: 2499,
    partnerPriceInr: 1699,
    commissionInr: 800,
    partnerAmountInPaise: 169900,
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
