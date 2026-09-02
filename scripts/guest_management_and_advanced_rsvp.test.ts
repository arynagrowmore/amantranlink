import { describe, it, expect } from 'vitest';
import { 
  generateSecureGuestToken, 
  calculateGuestMetrics, 
  generatePersonalizedWhatsAppMessage 
} from '../src/services/guestService';
import { submitAdvancedGuestRsvp } from '../src/services/rsvpService';
import { GuestRecord, ImportGuestRow, WhatsAppInvitationConfig } from '../src/types/guest';

describe('👑 SHAHI VIVAH — GUEST MANAGEMENT & ADVANCED RSVP ENGINE TESTS', () => {
  
  // 1. Secure Token Generation
  it('1. Generates unique, URL-safe random guest tokens with gst_ prefix', () => {
    const token1 = generateSecureGuestToken();
    const token2 = generateSecureGuestToken();

    expect(token1).toBeDefined();
    expect(token1.startsWith('gst_')).toBe(true);
    expect(token1.length).toBeGreaterThanOrEqual(16);
    expect(token1).not.toEqual(token2);
  });

  // 2. Metrics & Headcount Calculations
  it('2. Correctly calculates guest metrics and response rate percentages', () => {
    const mockGuests: GuestRecord[] = [
      {
        id: 'g1',
        wedding_site_id: 'site_123',
        user_id: 'user_1',
        full_name: 'Mukeshbhai Patel',
        phone: '9409360336',
        relationship: 'Family',
        number_of_members: 4,
        guest_type: 'Family',
        personal_invitation_token: 'gst_mukesh123',
        invitation_status: 'viewed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rsvp: {
          id: 'r1',
          attendance_status: 'Attending',
          attending_member_count: 4,
          meal_preference: 'Pure Jain',
        }
      },
      {
        id: 'g2',
        wedding_site_id: 'site_123',
        user_id: 'user_1',
        full_name: 'Vikram Sharma',
        phone: '9825145678',
        relationship: 'Friend',
        number_of_members: 2,
        guest_type: 'Friend',
        personal_invitation_token: 'gst_vikram123',
        invitation_status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rsvp: {
          id: 'r2',
          attendance_status: 'Not Attending',
          attending_member_count: 0,
        }
      },
      {
        id: 'g3',
        wedding_site_id: 'site_123',
        user_id: 'user_1',
        full_name: 'Rajesh Shah',
        phone: '9898234567',
        relationship: 'VIP',
        number_of_members: 3,
        guest_type: 'VIP',
        personal_invitation_token: 'gst_rajesh123',
        invitation_status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rsvp: null, // Pending
      }
    ];

    const metrics = calculateGuestMetrics(mockGuests);

    expect(metrics.totalGuests).toBe(3);
    expect(metrics.totalMembersCount).toBe(9); // 4 + 2 + 3
    expect(metrics.confirmedAttendingCount).toBe(1);
    expect(metrics.confirmedAttendingMembers).toBe(4);
    expect(metrics.notAttendingCount).toBe(1);
    expect(metrics.pendingCount).toBe(1);
    expect(metrics.viewedInvitationsCount).toBe(1);
    expect(metrics.responseRatePercent).toBe(67); // 2 out of 3 = 67%
  });

  // 3. Personalized WhatsApp Dispatch
  it('3. Generates personalized WhatsApp message with dynamic placeholders replaced', () => {
    const mockGuest: GuestRecord = {
      id: 'g1',
      wedding_site_id: 'site_123',
      user_id: 'user_1',
      full_name: 'Mukeshbhai Patel',
      family_name: 'Patel Parivar',
      phone: '9409360336',
      relationship: 'Family',
      number_of_members: 4,
      guest_type: 'Family',
      personal_invitation_token: 'gst_mukesh_token_99',
      invitation_status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const config: WhatsAppInvitationConfig = {
      coupleNames: 'Dhruv & Shreya',
      weddingDate: '10 December 2026',
      venueName: 'The Milestone, Himmatnagar',
    };

    const result = generatePersonalizedWhatsAppMessage(
      mockGuest,
      config,
      'https://shahistudio.com',
      'dhruv-shreya'
    );

    expect(result.personalizedLink).toBe('https://shahistudio.com/i/dhruv-shreya?guest=gst_mukesh_token_99');
    expect(result.messageText).toContain('Mukeshbhai Patel & Patel Parivar');
    expect(result.messageText).toContain('Dhruv & Shreya');
    expect(result.messageText).toContain('10 December 2026');
    expect(result.messageText).toContain('The Milestone, Himmatnagar');
    expect(result.messageText).toContain('https://shahistudio.com/i/dhruv-shreya?guest=gst_mukesh_token_99');
    expect(result.whatsappUrl).toContain('919409360336');
  });

  // 4. Advanced RSVP Validation & Submission
  it('4. Rejects invalid submissions and accepts valid advanced RSVP submissions', async () => {
    // Rejects empty name
    const invalidRes1 = await submitAdvancedGuestRsvp({
      wedding_site_id: 'site_123',
      wedding_slug: 'dhruv-shreya',
      guest_name: ' ',
      guest_phone: '9409360336',
      attendance_status: 'Attending',
      attending_member_count: 2,
    });
    expect(invalidRes1.success).toBe(false);
    expect(invalidRes1.error).toContain('valid guest name');

    // Rejects short phone
    const invalidRes2 = await submitAdvancedGuestRsvp({
      wedding_site_id: 'site_123',
      wedding_slug: 'dhruv-shreya',
      guest_name: 'Mukeshbhai',
      guest_phone: '123',
      attendance_status: 'Attending',
      attending_member_count: 2,
    });
    expect(invalidRes2.success).toBe(false);
    expect(invalidRes2.error).toContain('valid mobile number');

    // Accepts valid advanced RSVP
    const validRes = await submitAdvancedGuestRsvp({
      wedding_site_id: 'site_123',
      wedding_slug: 'dhruv-shreya',
      guest_token: 'gst_mukesh_token_99',
      guest_name: 'Mukeshbhai Patel',
      guest_phone: '9409360336',
      attendance_status: 'Attending',
      attending_member_count: 3,
      meal_preference: 'Pure Jain',
      wishes: 'Hearty congratulations and best wishes to the royal couple!',
    });
    expect(validRes.success).toBe(true);
    expect(validRes.message).toBeDefined();
  });
});
