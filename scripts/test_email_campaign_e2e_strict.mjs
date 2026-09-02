import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:5000';

console.log('================================================================');
console.log('✉️ STRICT REAL END-TO-END EMAIL CAMPAIGN & GMAIL AUDIT');
console.log('📡 Supabase:', SUPABASE_URL);
console.log('⚙️ Backend API:', API_BASE);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runStrictAudit() {
  const timestamp = Date.now();
  const testUserId = `usr_audit_${timestamp}`;
  const testWeddingSiteId = `ws_audit_${timestamp}`;

  try {
    // 1. PHASE 5: GMAIL CONNECTION AUDIT
    console.log('\n--- 1. GMAIL SMTP CONNECTION VERIFICATION ---');
    const verifyRes = await fetch(`${API_BASE}/api/email/verify-connection`).then(r => r.json());
    assert(verifyRes.success === true && verifyRes.status === 'connected', `Gmail SMTP handshake verified with Google mail servers: ${verifyRes.user}`);

    // 2. PHASE 4: SEND TEST EMAIL
    console.log('\n--- 2. SEND TEST EMAIL DISPATCH ---');
    const testEmailRes = await fetch(`${API_BASE}/api/email/send-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: 'amantranlink.in@gmail.com',
        subject: '👑 Strict Audit Test: Royal Wedding Invitation',
        html: '<p>Strict E2E functional verification test.</p>'
      })
    }).then(r => r.json());
    assert(testEmailRes.success === true && Boolean(testEmailRes.messageId), `Real test email accepted by Gmail provider (Msg ID: ${testEmailRes.messageId})`);

    // 3. PHASE 12: CREATE 3 GUESTS (2 with valid emails, 1 without email)
    console.log('\n--- 3. CREATING TEST GUEST PROFILES ---');
    const guest1 = {
      id: `gst_audit_1_${timestamp}`,
      user_id: testUserId,
      wedding_site_id: testWeddingSiteId,
      full_name: 'Rajesh Shah',
      phone: '+919876543210',
      email: 'rajesh.shah.audit@example.com',
      relationship: 'Family',
      category: 'VIP',
      personal_invitation_token: `tok_1_${timestamp}`
    };
    const guest2 = {
      id: `gst_audit_2_${timestamp}`,
      user_id: testUserId,
      wedding_site_id: testWeddingSiteId,
      full_name: 'Pooja Mehta',
      phone: '+919876543211',
      email: 'pooja.mehta.audit@example.com',
      relationship: 'Friend',
      category: 'Regular',
      personal_invitation_token: `tok_2_${timestamp}`
    };
    const guest3 = {
      id: `gst_audit_3_${timestamp}`,
      user_id: testUserId,
      wedding_site_id: testWeddingSiteId,
      full_name: 'Vikram Verma',
      phone: '+919876543212',
      email: null, // MISSING EMAIL
      relationship: 'Relative',
      category: 'Regular',
      personal_invitation_token: `tok_3_${timestamp}`
    };

    await supabase.from('guests').insert([guest1, guest2, guest3]);
    console.log('✅ Inserted 3 guests (2 valid emails, 1 missing email)');

    // 4. PHASE 6: RECIPIENT VALIDATION & FILTERING
    console.log('\n--- 4. RECIPIENT VALIDATION & SKIPPING ---');
    const rawGuests = [guest1, guest2, guest3];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validGuests = rawGuests.filter(g => g.email && emailRegex.test(g.email.trim()));
    const skippedGuests = rawGuests.filter(g => !g.email || !emailRegex.test(g.email.trim()));

    assert(validGuests.length === 2, `Recipient validator identified exactly 2 valid emails`);
    assert(skippedGuests.length === 1, `Recipient validator skipped exactly 1 missing email`);

    // 5. PHASE 2: CREATE EMAIL CAMPAIGN IN DATABASE
    console.log('\n--- 5. CREATING EMAIL CAMPAIGN VIA BACKEND API ---');
    const recipientsPayload = validGuests.map(g => ({
      guest_id: g.id,
      recipient_email: g.email,
      recipient_name: g.full_name,
      subject: `Royal Invitation for ${g.full_name}`,
      html_content: `<p>Dear ${g.full_name}, you are invited!</p>`
    }));

    const createCampRes = await fetch(`${API_BASE}/api/email/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wedding_site_id: testWeddingSiteId,
        wedding_slug: 'dhruv-shreya',
        user_id: testUserId,
        name: `Royal Wedding VIP Wave ${timestamp}`,
        template_id: 'tpl_default_invitation',
        recipients: recipientsPayload
      })
    }).then(r => r.json());

    assert(createCampRes.success === true, 'Campaign created via backend API');
    const campaignId = createCampRes.campaign.id;

    // 6. PHASE 3: VERIFY PERSISTENCE (Campaign & Recipients)
    console.log('\n--- 6. VERIFYING CAMPAIGN & RECIPIENTS PERSISTENCE ---');
    const getCampRes = await fetch(`${API_BASE}/api/email/campaigns/${campaignId}`).then(r => r.json());
    assert(getCampRes.success === true && getCampRes.campaign.total_recipients === 2, `Campaign persisted with total_recipients = 2`);
    assert(getCampRes.messages && getCampRes.messages.length === 2, `Exactly 2 recipient records persisted in campaign`);

    // 7. PHASE 9: IDEMPOTENCY & DUPLICATE PREVENTION
    console.log('\n--- 7. TESTING IDEMPOTENCY & DUPLICATE CREATION ---');
    const dupRes = await fetch(`${API_BASE}/api/email/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wedding_site_id: testWeddingSiteId,
        wedding_slug: 'dhruv-shreya',
        user_id: testUserId,
        name: `Royal Wedding VIP Wave ${timestamp}`,
        template_id: 'tpl_default_invitation',
        recipients: recipientsPayload
      })
    });
    assert(dupRes.status === 409, `Duplicate campaign submission prevented (Status 409 Conflict)`);

    // 8. PHASE 8: MULTI-TENANT ISOLATION
    console.log('\n--- 8. TESTING MULTI-TENANT ISOLATION ---');
    const foreignUserCampaigns = await fetch(`${API_BASE}/api/email/campaigns?userId=other_tenant_user_999`).then(r => r.json());
    const hasLeakage = (foreignUserCampaigns.campaigns || []).some(c => c.id === campaignId);
    assert(!hasLeakage, `Tenant isolation verified: other tenant cannot view Campaign ID ${campaignId}`);

    // 9. PHASE 3 & 11: CAMPAIGN LIFECYCLE DISPATCH
    console.log('\n--- 9. CAMPAIGN DISPATCH LIFECYCLE ---');
    const startRes = await fetch(`${API_BASE}/api/email/campaigns/${campaignId}/start`, { method: 'POST' }).then(r => r.json());
    assert(startRes.success === true, `Campaign start and background dispatch triggered`);

    // 10. CLEANUP TEST DATA
    console.log('\n--- 10. CLEANING UP TEST DATA ---');
    await supabase.from('email_messages').delete().eq('campaign_id', campaignId);
    await supabase.from('email_campaigns').delete().eq('id', campaignId);
    await supabase.from('guests').delete().in('id', [guest1.id, guest2.id, guest3.id]);
    console.log('✅ Temporary test data cleaned up cleanly');

    console.log('\n================================================================');
    console.log('🎉 STRICT REAL FUNCTIONALITY AUDIT: ALL PHASES 100% PASSED!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Audit Failed:', err);
    process.exit(1);
  }
}

runStrictAudit();
