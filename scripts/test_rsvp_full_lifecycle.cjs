const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emlpcWR4YnZ5bnJwcnVndndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzAyMDMsImV4cCI6MjEwMjgwNjIwM30._rrJrh-NLf3t0sQzvmcQL9X3CzZH_nvHGvqOv1ijqeI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runRsvpFullLifecycleTest() {
  console.log('====================================================');
  console.log('  SHAHI STUDIO GLOBAL RSVP FULL LIFECYCLE AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    const testSlugA = `test-wedding-a-${Date.now()}`;
    const testSlugB = `test-wedding-b-${Date.now()}`;

    console.log(`1. Testing RSVP Submission for Wedding A (${testSlugA})...`);
    const rsvpA1 = {
      wedding_slug: testSlugA,
      guest_name: 'Maharaja Vikramaditya',
      guest_phone: '+91 9876543210',
      attending: true,
      attendees_count: 4,
      wishes: 'Heartiest congratulations from the Royal Family of Ujjain!',
    };

    const { data: insertedA1, error: errA1 } = await supabase.from('rsvps').insert(rsvpA1).select().single();
    assert(!errA1 && insertedA1 && insertedA1.guest_name === rsvpA1.guest_name, 'Guest A1 RSVP inserted with headcount 4');

    console.log(`\n2. Testing Regrets Submission for Wedding A (${testSlugA})...`);
    const rsvpA2 = {
      wedding_slug: testSlugA,
      guest_name: 'Senapati Ranveer Singh',
      guest_phone: '+91 9876543211',
      attending: false,
      attendees_count: 0,
      wishes: 'Sending hearty blessings and warm regards!',
    };

    const { data: insertedA2, error: errA2 } = await supabase.from('rsvps').insert(rsvpA2).select().single();
    assert(!errA2 && insertedA2 && insertedA2.attending === false && insertedA2.attendees_count === 0, 'Guest A2 Regrets RSVP inserted with headcount 0');

    console.log(`\n3. Testing RSVP Submission for Wedding B (${testSlugB}) (Cross-Wedding Isolation)...`);
    const rsvpB1 = {
      wedding_slug: testSlugB,
      guest_name: 'Princess Ananya Devi',
      guest_phone: '+91 9876543212',
      attending: true,
      attendees_count: 2,
      wishes: 'Shubh Vivah to the beautiful couple!',
    };

    const { data: insertedB1, error: errB1 } = await supabase.from('rsvps').insert(rsvpB1).select().single();
    assert(!errB1 && insertedB1 && insertedB1.guest_name === rsvpB1.guest_name, 'Guest B1 RSVP inserted for Wedding B');

    console.log(`\n4. Verifying Wedding A RSVP Center Calculation & Isolation...`);
    const { data: siteARsvps, error: errQueryA } = await supabase.from('rsvps').select('*').eq('wedding_slug', testSlugA);
    assert(!errQueryA && siteARsvps && siteARsvps.length === 2, 'Wedding A has exactly 2 RSVP responses (isolated from B)');

    const totalResponsesA = siteARsvps.length;
    const attendingResponsesA = siteARsvps.filter((r) => r.attending).length;
    const regretsResponsesA = siteARsvps.filter((r) => !r.attending).length;
    const totalHeadcountA = siteARsvps.reduce((acc, r) => (r.attending ? acc + (r.attendees_count || 1) : acc), 0);

    assert(totalResponsesA === 2, `Total responses count = ${totalResponsesA} (Expected 2)`);
    assert(attendingResponsesA === 1, `Attending count = ${attendingResponsesA} (Expected 1)`);
    assert(regretsResponsesA === 1, `Regrets count = ${regretsResponsesA} (Expected 1)`);
    assert(totalHeadcountA === 4, `Total expected headcount sum = ${totalHeadcountA} (Expected 4)`);

    console.log(`\n5. Verifying Wedding B RSVP Center Calculation & Isolation...`);
    const { data: siteBRsvps, error: errQueryB } = await supabase.from('rsvps').select('*').eq('wedding_slug', testSlugB);
    assert(!errQueryB && siteBRsvps && siteBRsvps.length === 1, 'Wedding B has exactly 1 RSVP response (isolated from A)');
    assert(siteBRsvps[0].guest_name === 'Princess Ananya Devi', 'Wedding B contains only Princess Ananya Devi');

    console.log(`\n6. Cleaning up test RSVP records...`);
    await supabase.from('rsvps').delete().in('wedding_slug', [testSlugA, testSlugB]);
    console.log('Test RSVP records cleaned up successfully.');

    console.log('\n====================================================');
    console.log(`AUDIT FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (e) {
    console.error('Fatal Audit Error:', e);
    process.exit(1);
  }
}

runRsvpFullLifecycleTest();
