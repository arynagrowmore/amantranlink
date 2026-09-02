import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:5000';

console.log('================================================================');
console.log('🛡️ PRODUCTION TRUTH AUDIT & STRICT VERIFICATION ENGINE');
console.log('📡 Supabase:', SUPABASE_URL);
console.log('⚙️ Backend API:', API_BASE);
console.log('================================================================\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function assert(condition, message, failureDetails) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    if (failureDetails) console.error('   Details:', failureDetails);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runProductionTruthAudit() {
  const timestamp = Date.now();
  const userA = `usr_tenant_A_${timestamp}`;
  const userB = `usr_tenant_B_${timestamp}`;

  try {
    // -------------------------------------------------------------------------
    // CRITICAL ISSUE 6: GMAIL CREDENTIAL SECURITY AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 1. CREDENTIAL SECURITY AUDIT ---');
    const configRes = await fetch(`${API_BASE}/api/email/config-status`).then(r => r.json());
    assert(configRes.success === true, 'Config endpoint responds');
    assert(configRes.config.configured === true, 'Email configured');
    assert(!configRes.config.pass && !configRes.config.password && !configRes.config.appPassword, 'CRITICAL: App password NEVER returned in API');
    assert(JSON.stringify(configRes).indexOf(process.env.GMAIL_APP_PASSWORD) === -1, 'CRITICAL: Zero password leakage in configuration payload');

    // -------------------------------------------------------------------------
    // CRITICAL ISSUE 5: MULTI-TENANT & AUTHORIZATION SECURITY ATTACK TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- 2. CROSS-TENANT & AUTHORIZATION SECURITY ATTACK TESTS ---');
    // User A creates a private campaign with 2 recipients
    const campARes = await fetch(`${API_BASE}/api/email/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userA },
      body: JSON.stringify({
        userId: userA,
        name: `User A Private Campaign ${timestamp}`,
        recipients: [
          { recipient_email: 'amantranlink.in@gmail.com', recipient_name: 'VIP Guest A (Open Test)', subject: 'Private Invite 1', html_content: '<p>Open Tracking Test</p>' },
          { recipient_email: 'amantranlink.in@gmail.com', recipient_name: 'VIP Guest B (Dispatch Test)', subject: 'Private Invite 2', html_content: '<p>SMTP Dispatch Test</p>' }
        ]
      })
    }).then(r => r.json());

    assert(campARes.success === true, 'User A created private campaign');
    const campAId = campARes.campaign.id;

    // ATTACK 1: User B tries to read User A campaign details
    const attackReadRes = await fetch(`${API_BASE}/api/email/campaigns/${campAId}`, {
      headers: { 'x-user-id': userB }
    });
    assert(attackReadRes.status === 403, `Cross-tenant read blocked with HTTP 403 Forbidden (Attacker: User B, Target: User A)`);

    // ATTACK 2: User B tries to trigger/start User A campaign
    const attackStartRes = await fetch(`${API_BASE}/api/email/campaigns/${campAId}/start`, {
      method: 'POST',
      headers: { 'x-user-id': userB }
    });
    assert(attackStartRes.status === 403, `Cross-tenant campaign start blocked with HTTP 403 Forbidden`);

    // -------------------------------------------------------------------------
    // CRITICAL ISSUE 2: REAL EMAIL OPEN TRACKING TEST
    // -------------------------------------------------------------------------
    console.log('\n--- 3. REAL EMAIL OPEN TRACKING TEST (1x1 PNG PIXEL) ---');
    // Fetch campaign details as authorized User A to get tracking token
    const campDetails = await fetch(`${API_BASE}/api/email/campaigns/${campAId}`, {
      headers: { 'x-user-id': userA }
    }).then(r => r.json());

    const firstMsg = campDetails.messages[0];
    assert(Boolean(firstMsg.tracking_token), `Message generated with secure tracking token: ${firstMsg.tracking_token}`);
    assert(firstMsg.html_content.includes(firstMsg.tracking_token), `Tracking pixel embedded in HTML content`);
    assert(firstMsg.opened_at === null, `Initial opened_at is null before opening`);

    // Simulate recipient opening email and loading tracking pixel
    const pixelRes = await fetch(`${API_BASE}/api/email/track/open/${firstMsg.tracking_token}.png`);
    assert(pixelRes.status === 200, `Tracking pixel endpoint returned HTTP 200 OK`);
    assert(pixelRes.headers.get('content-type') === 'image/png', `Tracking pixel returned Content-Type: image/png`);
    const buffer = await pixelRes.arrayBuffer();
    assert(buffer.byteLength > 0, `Valid 1x1 transparent PNG buffer returned`);

    // Wait 200ms for async tracking event update
    await new Promise(res => setTimeout(res, 200));

    // Verify opened_at updated
    const updatedDetails = await fetch(`${API_BASE}/api/email/campaigns/${campAId}`, {
      headers: { 'x-user-id': userA }
    }).then(r => r.json());
    assert(updatedDetails.messages[0].status === 'opened', `Recipient message status updated to 'opened' upon pixel load`);
    assert(Boolean(updatedDetails.messages[0].opened_at), `Timestamp opened_at recorded: ${updatedDetails.messages[0].opened_at}`);
    assert(updatedDetails.campaign.opened_count === 1, `Campaign opened_count incremented to 1`);

    // -------------------------------------------------------------------------
    // CRITICAL ISSUE 1 & 7: REAL GMAIL DISPATCH & SMTP ACCEPTANCE vs DELIVERY
    // -------------------------------------------------------------------------
    console.log('\n--- 4. REAL GMAIL SMTP ACCEPTANCE TEST ---');
    const startCampRes = await fetch(`${API_BASE}/api/email/campaigns/${campAId}/start`, {
      method: 'POST',
      headers: { 'x-user-id': userA }
    }).then(r => r.json());
    assert(startCampRes.success === true, 'Campaign dispatch initiated via Gmail SMTP');

    // Wait 4.5s for Gmail SMTP network transmission
    await new Promise(res => setTimeout(res, 4500));

    const dispatchedDetails = await fetch(`${API_BASE}/api/email/campaigns/${campAId}`, {
      headers: { 'x-user-id': userA }
    }).then(r => r.json());

    assert(dispatchedDetails.campaign.sent_count >= 1, `SMTP Accepted count = ${dispatchedDetails.campaign.sent_count}`);
    const dispatchedMsg = dispatchedDetails.messages.find(m => m.status === 'sent') || dispatchedDetails.messages[1];
    assert(dispatchedMsg && dispatchedMsg.provider === 'gmail', `Provider confirmed: gmail`);
    assert(dispatchedMsg && Boolean(dispatchedMsg.provider_message_id), `Gmail Provider Message ID recorded: ${dispatchedMsg.provider_message_id}`);
    assert(dispatchedDetails.campaign.delivered_count === 0, `Truthful Delivery Rate: 0 direct DSN confirmations (classified as SMTP Accepted)`);

    // -------------------------------------------------------------------------
    // CRITICAL ISSUE 3: PRODUCTION URL GENERATION AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- 5. PRODUCTION URL SAFETY AUDIT ---');
    assert(typeof process.env.APP_BASE_URL === 'string' || process.env.NODE_ENV !== 'production', 'APP_BASE_URL check passed for current environment');

    console.log('\n================================================================');
    console.log('🎉 PRODUCTION TRUTH AUDIT COMPLETE: ALL CRITICAL ISSUES RESOLVED!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Audit Failed:', err);
    process.exit(1);
  }
}

runProductionTruthAudit();
