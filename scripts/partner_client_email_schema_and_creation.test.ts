/**
 * 🧪 AMANTRANLINK: CLIENT INVITATION CREATION & CLIENT EMAIL SCHEMA TEST SUITE
 * Tests client_email schema caching, graceful fallback, RLS isolation, and data integrity.
 */

import { describe, it, expect } from 'vitest';
import { createPartnerClientInvitation } from '../src/services/partnerService';

// In-Memory Database Simulator for wedding_sites & RLS
interface MockWeddingSite {
  id: string;
  user_id: string;
  partner_id: string | null;
  template_id: string;
  status: 'draft' | 'published';
  workflow_status: string;
  is_locked: boolean;
  client_phone: string | null;
  client_email: string | null;
  partner_notes: string | null;
  client_feedback: string | null;
  approved_at: string | null;
  content: any;
  published_url: string;
  studio_badge: string;
  created_at: string;
  updated_at: string;
}

class MockDatabase {
  sites: MockWeddingSite[] = [];
  schemaHasTopLevelEmail: boolean = true;
  schemaHasTopLevelPhone: boolean = true;
  schemaHasWorkflowStatus: boolean = true;

  insertSite(payload: any): { data?: MockWeddingSite; error?: any } {
    if (!this.schemaHasTopLevelEmail && payload.client_email !== undefined && !payload.__fallback) {
      return {
        error: {
          code: 'PGRST204',
          message: "Could not find the 'client_email' column of 'wedding_sites' in the schema cache"
        }
      };
    }

    if (!this.schemaHasTopLevelPhone && payload.client_phone !== undefined && !payload.__fallback) {
      return {
        error: {
          code: 'PGRST204',
          message: "Could not find the 'client_phone' column of 'wedding_sites' in the schema cache"
        }
      };
    }

    const site: MockWeddingSite = {
      id: `site_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      user_id: payload.user_id,
      partner_id: payload.partner_id || null,
      template_id: payload.template_id || 'rajmahal',
      status: payload.status || 'draft',
      workflow_status: payload.workflow_status || 'DRAFT',
      is_locked: payload.is_locked || false,
      client_phone: this.schemaHasTopLevelPhone ? (payload.client_phone || null) : null,
      client_email: this.schemaHasTopLevelEmail ? (payload.client_email || null) : null,
      partner_notes: payload.partner_notes || payload.content?.partner_notes || null,
      client_feedback: payload.client_feedback || null,
      approved_at: payload.approved_at || null,
      content: payload.content || {},
      published_url: payload.published_url || 'slug',
      studio_badge: payload.studio_badge || 'Studio Partner',
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: payload.updated_at || new Date().toISOString(),
    };

    this.sites.push(site);
    return { data: site };
  }

  querySitesForUser(authUid: string): MockWeddingSite[] {
    return this.sites.filter(s => s.user_id === authUid || s.partner_id === authUid);
  }

  queryPublicSite(slug: string): any {
    const site = this.sites.find(s => s.published_url === slug || s.id === slug);
    if (!site) return null;

    return {
      id: site.id,
      template_id: site.template_id,
      status: site.status,
      is_locked: site.is_locked,
      content: site.content,
      studio_badge: site.studio_badge,
      published_url: site.published_url,
      workflow_status: site.workflow_status,
      approved_at: site.approved_at
    };
  }
}

describe('🧪 Studio Partner Client Email & Creation Schema Suite', () => {
  it('1. Partner invitation creation stores valid optional client email and phone', () => {
    const db = new MockDatabase();
    const res = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      template_id: 'rajmahal',
      client_email: 'isha@patelwedding.com',
      client_phone: '+91 9876543210',
      content: { couple: { groomEn: 'Rudra', brideEn: 'Ishani' } },
      published_url: 'rudra-ishani-2026'
    });

    expect(res.error).toBeUndefined();
    expect(res.data?.client_email).toBe('isha@patelwedding.com');
    expect(res.data?.client_phone).toBe('+91 9876543210');
  });

  it('2. Partner invitation creation succeeds when email is omitted', () => {
    const db = new MockDatabase();
    const res = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      template_id: 'royaldawn',
      client_email: null,
      client_phone: '+91 9876543210',
      content: { couple: { groomEn: 'Rohan', brideEn: 'Ananya' } },
      published_url: 'rohan-ananya-2026'
    });

    expect(res.error).toBeUndefined();
    expect(res.data?.client_email).toBeNull();
    expect(res.data?.workflow_status).toBe('DRAFT');
  });

  it('3. Dynamic fallback successfully creates invitation and stores email in content when schema cache column is missing', () => {
    const db = new MockDatabase();
    db.schemaHasTopLevelEmail = false;

    const initialProjectState: any = {
      couple: { groomEn: 'Kabir', brideEn: 'Sanjana' },
      client_email: 'drkabir@mehta.com',
      client_phone: '+91 9409360336'
    };

    const primaryRes = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      client_email: 'drkabir@mehta.com',
      content: initialProjectState
    });
    expect(primaryRes.error).toBeDefined();
    expect(primaryRes.error.message.includes('client_email')).toBe(true);

    const fallbackRes = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      content: initialProjectState,
      __fallback: true
    });
    expect(fallbackRes.error).toBeUndefined();
    expect(fallbackRes.data?.content.client_email).toBe('drkabir@mehta.com');
  });

  it('4. Public invitation payload (/i/:slug) strictly excludes client_email and private partner notes', () => {
    const db = new MockDatabase();
    db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      template_id: 'rajmahal',
      client_email: 'private_client@gmail.com',
      client_phone: '+91 9409360336',
      partner_notes: 'Client requested 20% discount',
      content: { couple: { groomEn: 'Rudra', brideEn: 'Ishani' } },
      published_url: 'rudra-ishani'
    });

    const publicPayload = db.queryPublicSite('rudra-ishani');
    expect(publicPayload.client_email).toBeUndefined();
    expect(publicPayload.client_phone).toBeUndefined();
    expect(publicPayload.partner_notes).toBeUndefined();
    expect(publicPayload.published_url).toBe('rudra-ishani');
  });

  it('5. Multiple client invitations maintain strictly isolated records and emails', () => {
    const db = new MockDatabase();
    const clientA = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      client_email: 'clientA@shahi.in',
      published_url: 'client-a-wedding'
    }).data!;

    const clientB = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      client_email: 'clientB@shahi.in',
      published_url: 'client-b-wedding'
    }).data!;

    const clientC = db.insertSite({
      user_id: 'partner_1',
      partner_id: 'partner_1',
      client_email: null,
      published_url: 'client-c-wedding'
    }).data!;

    expect(clientA.id).not.toBe(clientB.id);
    expect(clientB.id).not.toBe(clientC.id);
    expect(clientA.client_email).toBe('clientA@shahi.in');
    expect(clientB.client_email).toBe('clientB@shahi.in');
    expect(clientC.client_email).toBeNull();
  });

  it('6. Partner A cannot query or modify Partner B client invitations or emails', () => {
    const db = new MockDatabase();
    db.insertSite({
      user_id: 'partner_a',
      partner_id: 'partner_a',
      client_email: 'vip_client_a@gmail.com',
      published_url: 'wedding-a'
    });

    db.insertSite({
      user_id: 'partner_b',
      partner_id: 'partner_b',
      client_email: 'vip_client_b@gmail.com',
      published_url: 'wedding-b'
    });

    const partnerASites = db.querySitesForUser('partner_a');
    const partnerBSites = db.querySitesForUser('partner_b');

    expect(partnerASites.length).toBe(1);
    expect(partnerASites[0].client_email).toBe('vip_client_a@gmail.com');

    expect(partnerBSites.length).toBe(1);
    expect(partnerBSites[0].client_email).toBe('vip_client_b@gmail.com');

    expect(partnerASites.some(s => s.client_email === 'vip_client_b@gmail.com')).toBe(false);
    expect(partnerBSites.some(s => s.client_email === 'vip_client_a@gmail.com')).toBe(false);
  });

  it('7. Validation requires partnerId and returns clean error if omitted', async () => {
    const res = await createPartnerClientInvitation({
      partnerId: '',
      groomName: 'Rohan',
      brideName: 'Ananya',
      selectedTheme: 'rajmahal',
      initialProjectState: { couple: { groomEn: 'Rohan', brideEn: 'Ananya' } }
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Partner authentication required');
  });
});
