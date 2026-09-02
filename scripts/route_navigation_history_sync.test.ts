/**
 * 🧭 ROUTE NAVIGATION & BROWSER HISTORY SYNCHRONIZATION TEST SUITE
 * Tests popstate, browser back/forward, pathname resolution, hash compatibility,
 * and zero-reload transitions between / and /partner and other routes.
 */

import { describe, it, expect } from 'vitest';
import { resolveApplicationRoute } from '../src/utils/navigation';

describe('🧭 Route Navigation & History Synchronization Suite', () => {
  it('TEST 1: Initial load on / resolves immediately to landing homepage', () => {
    const resolved = resolveApplicationRoute({ pathname: '/', search: '', hash: '' });
    expect(resolved.view).toBe('landing');
    expect(resolved.isStandalone).toBe(false);
  });

  it('TEST 2: Direct URL /partner resolves immediately to partner workspace', () => {
    const resolved = resolveApplicationRoute({ pathname: '/partner', search: '', hash: '' });
    expect(resolved.view).toBe('partner');
    expect(resolved.isStandalone).toBe(false);
    expect(resolved.partnerTab).toBe('dashboard');
  });

  it('TEST 3: Browser Back simulated from /partner to / updates view to landing immediately', () => {
    // 1. On /partner
    const partnerState = resolveApplicationRoute({ pathname: '/partner', search: '', hash: '' });
    expect(partnerState.view).toBe('partner');

    // 2. User presses browser Back button (URL changes to /)
    const backState = resolveApplicationRoute({ pathname: '/', search: '', hash: '' });
    expect(backState.view).toBe('landing');
    expect(backState.isStandalone).toBe(false);
  });

  it('TEST 4: Browser Forward simulated from / to /partner updates view to partner immediately', () => {
    // 1. On /
    const homeState = resolveApplicationRoute({ pathname: '/', search: '', hash: '' });
    expect(homeState.view).toBe('landing');

    // 2. User presses browser Forward button (URL changes to /partner)
    const forwardState = resolveApplicationRoute({ pathname: '/partner', search: '', hash: '' });
    expect(forwardState.view).toBe('partner');
    expect(forwardState.partnerTab).toBe('dashboard');
  });

  it('TEST 5: Sub-path and hash routing /partner#studio/invitations resolves tab correctly', () => {
    const resolved = resolveApplicationRoute({ pathname: '/partner', search: '', hash: '#studio/invitations' });
    expect(resolved.view).toBe('partner');
    expect(resolved.partnerTab).toBe('invitations');
  });

  it('TEST 6: Public Invitation route /i/:slug resolves to isStandalone: true', () => {
    const resolved = resolveApplicationRoute({ pathname: '/i/aryan-helly-wedding', search: '', hash: '' });
    expect(resolved.isStandalone).toBe(true);
  });

  it('TEST 7: Browser Back from /i/:slug to / switches isStandalone back to false and view to landing', () => {
    const inviteState = resolveApplicationRoute({ pathname: '/i/aryan-helly-wedding', search: '', hash: '' });
    expect(inviteState.isStandalone).toBe(true);

    const backState = resolveApplicationRoute({ pathname: '/', search: '', hash: '' });
    expect(backState.isStandalone).toBe(false);
    expect(backState.view).toBe('landing');
  });

  it('TEST 8: Admin route /admin resolves immediately to admin view', () => {
    const resolved = resolveApplicationRoute({ pathname: '/admin', search: '', hash: '' });
    expect(resolved.view).toBe('admin');
    expect(resolved.isStandalone).toBe(false);
  });

  it('TEST 9: Packages route /packages resolves immediately to packages view', () => {
    const resolved = resolveApplicationRoute({ pathname: '/packages', search: '', hash: '' });
    expect(resolved.view).toBe('packages');
  });

  it('TEST 10: Profile route /profile#rsvps resolves with profileTab: rsvps', () => {
    const resolved = resolveApplicationRoute({ pathname: '/profile', search: '', hash: '#rsvps' });
    expect(resolved.view).toBe('profile');
    expect(resolved.profileTab).toBe('rsvps');
  });
});
