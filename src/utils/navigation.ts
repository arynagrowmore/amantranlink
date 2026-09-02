/**
 * 🧭 CENTRALIZED ROUTE SYNCHRONIZATION & NAVIGATION SYSTEM
 * Single source of truth for URL, Browser Back/Forward, and React View State.
 */

import { StudioWorkspaceTab } from '../components/PartnerDashboard/PartnerDashboard';

export interface RouteResolution {
  view: 'landing' | 'studio' | 'login' | 'dashboard' | 'profile' | 'packages' | 'command-center' | 'partner' | 'review' | 'admin' | 'auth-callback' | 'reset-password' | 'pass' | 'checkin' | 'memories' | 'quote' | 'pay';
  isStandalone: boolean;
  partnerTab?: StudioWorkspaceTab;
  profileTab?: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps';
  openPartnerModal?: boolean;
}

/**
 * Authoritative function to resolve current window location into application view & sub-state.
 * Accepts optional custom location for programmatic resolution or tests.
 */
export function resolveApplicationRoute(customLocation?: { pathname?: string; search?: string; hash?: string }): RouteResolution {
  const loc = customLocation || (typeof window !== 'undefined' ? window.location : { pathname: '/', search: '', hash: '' });
  const rawPathname = loc.pathname || '/';
  const pathname = rawPathname.toLowerCase();
  const rawHash = loc.hash || '';
  const hash = rawHash.toLowerCase().replace(/^#\/?/, '');
  const search = loc.search || '';
  const urlParams = new URLSearchParams(search);

  // 0. Digital QR Entry Pass Route (/pass/:token, /entry/:token, ?pass=ent_..., ?view=pass)
  if (
    /^\/(?:pass|entry)\/[^/?#]+/i.test(rawPathname) ||
    urlParams.has('pass') || urlParams.get('view') === 'pass' ||
    hash.startsWith('pass/')
  ) {
    return { view: 'pass', isStandalone: false };
  }

  // 0.1 Venue Live Check-in Route (/venue-checkin, /check-in, ?view=checkin)
  if (
    pathname === '/venue-checkin' || pathname === '/check-in' || pathname.startsWith('/checkin') ||
    urlParams.get('view') === 'checkin' || urlParams.get('view') === 'venue-checkin' ||
    hash === 'checkin' || hash === 'venue-checkin'
  ) {
    return { view: 'checkin', isStandalone: false };
  }

  // 0.2 Public Wedding Memories & Photo Drop (/memories, /i/:slug/memories, ?view=memories, ?memories=)
  if (
    pathname.includes('/memories') || pathname.includes('/guestbook') ||
    urlParams.get('view') === 'memories' || urlParams.has('memories') ||
    hash.startsWith('memories')
  ) {
    return { view: 'memories', isStandalone: false };
  }

  // 0.3 Client Quotation Acceptance Portal (/quote/:token, ?quote=quo_..., ?view=quote)
  if (
    /^\/quote\/[^/?#]+/i.test(rawPathname) ||
    urlParams.has('quote') || urlParams.get('view') === 'quote' ||
    hash.startsWith('quote/')
  ) {
    return { view: 'quote', isStandalone: false };
  }

  // 0.4 Client Invoice & Payment Portal (/pay/:token, /invoice/:token, ?pay=inv_..., ?view=pay)
  if (
    /^\/(?:pay|invoice)\/[^/?#]+/i.test(rawPathname) ||
    urlParams.has('pay') || urlParams.has('invoice') || urlParams.get('view') === 'pay' || urlParams.get('view') === 'invoice' ||
    hash.startsWith('pay/') || hash.startsWith('invoice/')
  ) {
    return { view: 'pay', isStandalone: false };
  }

  // 1. Standalone Couple / Guest Public Invitation View (/i/:slug, /invite/:slug, /wedding/:slug, ?invite=, #i/)
  if (
    /^\/(?:i|invite|wedding)\/[^/?#]+/i.test(rawPathname) ||
    urlParams.has('invite') || urlParams.has('d') || urlParams.has('data') || urlParams.has('slug') ||
    hash.startsWith('i/') || hash.startsWith('invite/') || hash.startsWith('invite-')
  ) {
    return { view: 'landing', isStandalone: true };
  }

  // 2. Auth Callback Route
  if (
    pathname === '/auth/callback' || pathname.startsWith('/auth/callback') ||
    urlParams.has('code') || urlParams.get('view') === 'auth-callback' || urlParams.get('view') === 'callback' ||
    hash.startsWith('auth/callback') || hash === 'callback' || hash.includes('access_token=') || hash.includes('type=recovery')
  ) {
    return { view: 'auth-callback', isStandalone: false };
  }

  // 3. Reset Password Route
  if (
    pathname === '/reset-password' || pathname.startsWith('/reset-password') ||
    urlParams.get('view') === 'reset-password' || hash.startsWith('reset-password')
  ) {
    return { view: 'reset-password', isStandalone: false };
  }

  // 4. Dedicated Client Review Route (/review/:token, /preview/:token, ?view=review)
  if (
    pathname.startsWith('/review') || pathname.startsWith('/preview') ||
    urlParams.get('view') === 'review' || urlParams.get('view') === 'preview'
  ) {
    return { view: 'review', isStandalone: false };
  }

  // 5. Admin Control Center Route (/admin, ?view=admin, #admin, #control-center)
  if (
    pathname === '/admin' || pathname.startsWith('/admin/') ||
    urlParams.get('view') === 'admin' || urlParams.get('view') === 'control-center' ||
    hash === 'admin' || hash === 'control-center'
  ) {
    return { view: 'admin', isStandalone: false };
  }

  // 6. Partner / Studio Workspace Route (/partner, /studio-hub, /partner-hub, #partner, #studio/...)
  if (
    pathname === '/partner' || pathname.startsWith('/partner/') ||
    pathname === '/partner-hub' || pathname === '/studio-hub' ||
    urlParams.get('view') === 'partner' || urlParams.get('view') === 'studio-partner' ||
    hash === 'partner' || hash === 'partner-hub' || hash === 'studio-hub' ||
    hash.startsWith('studio/') || hash.startsWith('partner-') || hash === 'clients' ||
    hash === 'commissions' || hash === 'my-invitations' || hash === 'marketing-kit'
  ) {
    let partnerTab: StudioWorkspaceTab = 'dashboard';
    if (hash === 'partner' || hash === 'studio/dashboard' || hash === 'partner-hub') {
      partnerTab = 'dashboard';
    } else if (hash === 'partner-invitations' || hash === 'my-invitations' || hash === 'studio/invitations' || pathname.includes('/invitations')) {
      partnerTab = 'invitations';
    } else if (hash === 'partner-clients' || hash === 'clients' || hash === 'studio/clients' || pathname.includes('/clients')) {
      partnerTab = 'clients';
    } else if (hash === 'partner-earnings' || hash === 'commissions' || hash === 'studio/earnings' || pathname.includes('/earnings') || pathname.includes('/commissions')) {
      partnerTab = 'commissions';
    } else if (hash === 'partner-analytics' || hash === 'studio/analytics' || pathname.includes('/analytics')) {
      partnerTab = 'analytics';
    } else if (hash === 'partner-marketing' || hash === 'marketing-kit' || hash === 'studio/marketing' || pathname.includes('/marketing')) {
      partnerTab = 'marketing';
    } else if (hash === 'partner-profile' || hash === 'studio-profile' || hash === 'studio/profile' || pathname.includes('/profile')) {
      partnerTab = 'profile';
    } else if (hash === 'partner-branding' || hash === 'studio-branding' || hash === 'studio/branding' || pathname.includes('/branding')) {
      partnerTab = 'branding';
    } else if (hash === 'partner-team' || hash === 'studio-team' || hash === 'studio/team' || pathname.includes('/team')) {
      partnerTab = 'team';
    } else if (hash === 'partner-settings' || hash === 'studio-settings' || hash === 'studio/settings' || pathname.includes('/settings')) {
      partnerTab = 'settings';
    }
    return { view: 'partner', isStandalone: false, partnerTab };
  }

  // 7. Packages / Pricing Route (/packages, /pricing, /plans, #packages, #pricing)
  if (
    pathname === '/packages' || pathname === '/pricing' || pathname === '/plans' ||
    urlParams.get('view') === 'packages' || urlParams.get('view') === 'pricing' || urlParams.get('view') === 'plans' ||
    hash === 'packages' || hash === 'pricing' || hash === 'plans'
  ) {
    return { view: 'packages', isStandalone: false };
  }

  // 8. Profile / Account Route (/profile, /account, #profile, #rsvps, #purchases, #weddings, #transactions)
  if (
    pathname === '/profile' || pathname === '/account' ||
    urlParams.get('view') === 'profile' || urlParams.get('view') === 'account' ||
    hash === 'profile' || hash === 'account' || hash === 'rsvps' || hash === 'my-rsvps' ||
    hash === 'purchases' || hash === 'transactions' || hash === 'my-weddings' || hash === 'weddings'
  ) {
    let profTab: 'profile' | 'purchases' | 'transactions' | 'weddings' | 'rsvps' = 'profile';
    if (hash === 'rsvps' || hash === 'my-rsvps' || pathname.includes('/rsvps')) profTab = 'rsvps';
    else if (hash === 'purchases' || pathname.includes('/purchases')) profTab = 'purchases';
    else if (hash === 'transactions' || pathname.includes('/transactions')) profTab = 'transactions';
    else if (hash === 'my-weddings' || hash === 'weddings' || pathname.includes('/weddings')) profTab = 'weddings';
    return { view: 'profile', isStandalone: false, profileTab: profTab };
  }

  // 9. Couple / User Dashboard Route (/dashboard, #dashboard)
  if (
    pathname === '/dashboard' || hash === 'dashboard' || urlParams.get('view') === 'dashboard'
  ) {
    return { view: 'dashboard', isStandalone: false };
  }

  // 10. Studio Customizer / Editor Route (/studio, /editor, /customizer, #studio, #editor)
  if (
    pathname === '/studio' || pathname === '/editor' || pathname === '/customizer' ||
    urlParams.get('view') === 'studio' || urlParams.get('view') === 'editor' || urlParams.get('view') === 'customizer' ||
    hash === 'studio' || hash === 'customizer' || hash === 'editor'
  ) {
    return { view: 'studio', isStandalone: false };
  }

  // 11. Command Center Route (/command-center, #command-center)
  if (
    pathname === '/command-center' || hash === 'command-center' || hash === 'command' ||
    urlParams.get('view') === 'command-center'
  ) {
    return { view: 'command-center', isStandalone: false };
  }

  // 12. Login Route
  if (pathname === '/login' || hash === 'login') {
    return { view: 'login', isStandalone: false };
  }

  // 13. Partner Onboarding Modal Trigger
  if (hash === 'studio-partner' || hash === 'partner-portal') {
    return { view: 'landing', isStandalone: false, openPartnerModal: true };
  }

  // 14. Default / Home (/)
  return { view: 'landing', isStandalone: false };
}

/**
 * Authoritative navigation function that pushes or replaces history and synchronizes state synchronously.
 */
export function navigateToRoute(to: string, replace = false): void {
  if (typeof window === 'undefined') return;

  if (to.startsWith('#')) {
    if (replace) {
      window.location.replace(to);
    } else {
      window.location.hash = to;
    }
  } else {
    // Pathname-based navigation
    const targetUrl = to.startsWith('/') ? to : `/${to}`;
    if (replace) {
      window.history.replaceState({}, '', targetUrl);
    } else {
      window.history.pushState({}, '', targetUrl);
    }
  }

  // Synchronously dispatch popstate so route listeners update React state immediately with zero page refresh
  window.dispatchEvent(new PopStateEvent('popstate'));
}
