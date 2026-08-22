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

// 👑 OFFICIAL SHAHI STUDIO PRODUCTION PRICING CONFIGURATION (SINGLE SOURCE OF TRUTH)
export const OFFICIAL_PACKAGES: Record<PackageType, PackagePricingConfig> = {
  silver: {
    id: 'silver',
    name: 'Shahi Silver',
    priceInr: 1299,
    amountInPaise: 129900,
    badge: 'Popular for Single Theme',
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
    priceInr: 2299,
    amountInPaise: 229900,
    badge: '👑 Most Chosen for Royal Weddings',
    subtitle: 'All 7 Royal Themes Included with 3D Palace Gates & Scratch Cards',
    features: [
      'All 7 Royal Themes Included',
      '3D Animated Palace Gates & Parallax',
      'Gold Scratch-Heart Blessing Card',
      'Trilingual Vivah Engine (EN, HI, GU)',
      'Lossless Shehnai & Audio Uploads',
      '1-Click WhatsApp Dispatch & Golden QR',
      'Live RSVP Analytics & Excel Download',
    ],
  },
  platinum: {
    id: 'platinum',
    name: 'Rajmahal Platinum VIP',
    priceInr: 24999,
    amountInPaise: 2499900,
    badge: '⭐ Bespoke White-Glove VIP Suite',
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
  rajmahal: 'gold',     // 3D Palace Heritage -> Gold Royal (₹2,299)
  royaldawn: 'gold',    // Lakefront & Scratch Card -> Gold Royal (₹2,299)
  jharokha: 'silver',   // Rajasthani Arch -> Silver (₹1,299)
  mayura: 'silver',     // Peacock Teal -> Silver (₹1,299)
  jodi: 'silver',       // Sacred Thaali -> Silver (₹1,299)
  dak: 'silver',        // Royal Postal Telegram -> Silver (₹1,299)
  ivory: 'silver',      // Haute Couture Minimalist -> Silver (₹1,299)
};

// 🏷️ Official Theme Pricing Catalog (Matches Package Map)
export const THEME_PRICING_CATALOG: Record<ThemeId, { priceInr: number; amountInPaise: number; packageId: PackageType; name: string }> = {
  rajmahal: { priceInr: 2299, amountInPaise: 229900, packageId: 'gold', name: 'The Rajmahal 3D Palace' },
  royaldawn: { priceInr: 2299, amountInPaise: 229900, packageId: 'gold', name: 'The Royal Dawn (Lakefront & Scratch Card)' },
  jharokha: { priceInr: 1299, amountInPaise: 129900, packageId: 'silver', name: 'The Jharokha Mandap' },
  mayura: { priceInr: 1299, amountInPaise: 129900, packageId: 'silver', name: 'The Mayura Peacock' },
  jodi: { priceInr: 1299, amountInPaise: 129900, packageId: 'silver', name: 'The Shubh Jodi' },
  dak: { priceInr: 1299, amountInPaise: 129900, packageId: 'silver', name: 'The Shahi Dâk' },
  ivory: { priceInr: 1299, amountInPaise: 129900, packageId: 'silver', name: 'The Ivory Minimalist' },
};

// 🧮 Authoritative Pricing Calculation Function (Single Source of Truth)
export function calculatePaymentDetails(
  packageId?: PackageType | null,
  templateId?: ThemeId | null
): {
  packageId: PackageType;
  packageName: string;
  originalAmountInr: number;
  discountAmountInr: number;
  finalAmountInr: number;
  finalAmountInPaise: number;
} {
  // Determine effective package: if packageId is passed, use it. Otherwise derive from theme.
  let effectivePackage: PackageType = 'gold'; // Default to gold if ambiguous, NEVER fallback to silver silently
  if (packageId && OFFICIAL_PACKAGES[packageId]) {
    effectivePackage = packageId;
  } else if (templateId && THEME_PACKAGE_MAP[templateId]) {
    effectivePackage = THEME_PACKAGE_MAP[templateId];
  }

  const pkg = OFFICIAL_PACKAGES[effectivePackage];
  const originalAmountInr = pkg.priceInr;
  const discountAmountInr = 0;
  const finalAmountInr = originalAmountInr;
  const finalAmountInPaise = finalAmountInr * 100;

  return {
    packageId: effectivePackage,
    packageName: pkg.name,
    originalAmountInr,
    discountAmountInr,
    finalAmountInr,
    finalAmountInPaise,
  };
}
