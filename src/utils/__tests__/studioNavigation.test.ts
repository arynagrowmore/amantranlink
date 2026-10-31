// Test script for studio navigation normalization
import assert from 'node:assert';
import { normalizeStudioTab } from '../navigation.ts';
import type { StudioPrimaryHub } from '../navigation.ts';

console.log('Running studio navigation normalization tests...');

// 1. Primary Hubs should return exact hub
assert.deepStrictEqual(normalizeStudioTab('dashboard'), { hub: 'dashboard' });
assert.deepStrictEqual(normalizeStudioTab('invitations'), { hub: 'invitations' });
assert.deepStrictEqual(normalizeStudioTab('clients'), { hub: 'clients' });
assert.deepStrictEqual(normalizeStudioTab('finance'), { hub: 'finance' });
assert.deepStrictEqual(normalizeStudioTab('automation'), { hub: 'automation' });
assert.deepStrictEqual(normalizeStudioTab('profile'), { hub: 'profile' });

// 2. Legacy Aliases should route to the consolidated hubs
assert.deepStrictEqual(normalizeStudioTab('commissions'), { hub: 'finance', subView: 'settlements' });
assert.deepStrictEqual(normalizeStudioTab('analytics'), { hub: 'dashboard', subView: 'analytics' });
assert.deepStrictEqual(normalizeStudioTab('marketing'), { hub: 'profile', subView: 'marketing' });
assert.deepStrictEqual(normalizeStudioTab('branding'), { hub: 'profile', subView: 'branding' });
assert.deepStrictEqual(normalizeStudioTab('domains'), { hub: 'profile', subView: 'domains' });
assert.deepStrictEqual(normalizeStudioTab('settings'), { hub: 'profile', subView: 'settings' });
assert.deepStrictEqual(normalizeStudioTab('team'), { hub: 'profile', subView: 'team' });

// 3. Unknown or malformed tabs should safely fallback to dashboard
assert.deepStrictEqual(normalizeStudioTab('random_unknown_tab'), { hub: 'dashboard' });
assert.deepStrictEqual(normalizeStudioTab(''), { hub: 'dashboard' });

console.log('✅ ALL STUDIO NAVIGATION TESTS PASSED!');
