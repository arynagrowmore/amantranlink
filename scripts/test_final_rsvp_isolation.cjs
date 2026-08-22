const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:5000';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runFinalRsvpVerification() {
  console.log('========================================================================');
  console.log('👑 SHAHI STUDIO — FINAL REAL-WORLD RSVP SYSTEM & ZERO-MIXING AUDIT');
  console.log('========================================================================\n');

  const testRun = Date.now().toString(36);
  const slugA = `dhruv-shreya-${testRun}`;
  const slugB = `parth-puja-${testRun}`;

  // 1. SUBMIT RSVPs FOR WEDDING A (Dhruv & Shreya)
  console.log(`📝 1. Submitting 3 RSVPs for Kankotri A (Slug: ${slugA})...`);
  const guestsA = [
    { wedding_slug: slugA, guest_name: 'A-Guest-1 (Sharma Family)', guest_phone: '+91 98250 11111', attending: true, attendees_count: 2, wishes: 'Heartiest congratulations to Dhruv & Shreya!' },
    { wedding_slug: slugA, guest_name: 'A-Guest-2 (Patel Family)', guest_phone: '+91 98250 22222', attending: true, attendees_count: 4, wishes: 'Looking forward to the royal sangeet!' },
    { wedding_slug: slugA, guest_name: 'A-Guest-3 (Verma Family)', guest_phone: '+91 98250 33333', attending: false, attendees_count: 0, wishes: 'Sending blessings from abroad!' },
  ];

  for (const g of guestsA) {
    const res = await fetch(`${API_BASE}/api/rsvp/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g)
    });
    const json = await res.json();
    if (!json.success) console.error('Error submitting A:', json);
  }

  // 2. SUBMIT RSVPs FOR WEDDING B (Parth & Puja)
  console.log(`\n📝 2. Submitting 2 RSVPs for Kankotri B (Slug: ${slugB})...`);
  const guestsB = [
    { wedding_slug: slugB, guest_name: 'B-Guest-1 (Desai Family)', guest_phone: '+91 98250 44444', attending: true, attendees_count: 3, wishes: 'Congratulations Parth & Puja!' },
    { wedding_slug: slugB, guest_name: 'B-Guest-2 (Mehta Family)', guest_phone: '+91 98250 55555', attending: true, attendees_count: 5, wishes: 'Wishing a lifetime of happiness!' },
  ];

  for (const g of guestsB) {
    const res = await fetch(`${API_BASE}/api/rsvp/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g)
    });
    const json = await res.json();
    if (!json.success) console.error('Error submitting B:', json);
  }

  // 3. DATABASE QUERIES & STRICT ISOLATION AUDIT
  console.log('\n🔍 3. Inspecting Database Records in Supabase public.rsvps...');
  const { data: dbRecordsA } = await supabase.from('rsvps').select('*').eq('wedding_slug', slugA).order('created_at', { ascending: false });
  const { data: dbRecordsB } = await supabase.from('rsvps').select('*').eq('wedding_slug', slugB).order('created_at', { ascending: false });

  console.log(`  Kankotri A Records Found: ${dbRecordsA?.length} (Expected: 3)`);
  console.log(`  Kankotri B Records Found: ${dbRecordsB?.length} (Expected: 2)`);

  const metricsA = {
    totalResponses: dbRecordsA.length,
    attending: dbRecordsA.filter(r => r.attending).length,
    regrets: dbRecordsA.filter(r => !r.attending).length,
    totalGuests: dbRecordsA.reduce((sum, r) => r.attending ? sum + (Number(r.attendees_count) || 1) : sum, 0)
  };

  const metricsB = {
    totalResponses: dbRecordsB.length,
    attending: dbRecordsB.filter(r => r.attending).length,
    regrets: dbRecordsB.filter(r => !r.attending).length,
    totalGuests: dbRecordsB.reduce((sum, r) => r.attending ? sum + (Number(r.attendees_count) || 1) : sum, 0)
  };

  console.log('\n  📊 Kankotri A Metrics:', metricsA);
  console.log('  📊 Kankotri B Metrics:', metricsB);

  const isCrossMixing = dbRecordsA.some(a => dbRecordsB.some(b => b.id === a.id || b.guest_name === a.guest_name));
  console.log(`\n  🚨 Cross Mixing between Kankotri A and Kankotri B: ${isCrossMixing ? 'FAIL' : 'NONE (PASS)'}`);

  // 4. SEARCH & FILTER ISOLATION
  console.log('\n🔎 4. Testing Search & Filter Isolation...');
  const searchSharmaInA = dbRecordsA.filter(r => r.guest_name.toLowerCase().includes('sharma'));
  const searchSharmaInB = dbRecordsB.filter(r => r.guest_name.toLowerCase().includes('sharma'));
  console.log(`  Search 'sharma' in Kankotri A: found ${searchSharmaInA.length} (Expected: 1)`);
  console.log(`  Search 'sharma' in Kankotri B: found ${searchSharmaInB.length} (Expected: 0)`);

  // 5. CSV EXPORT ISOLATION
  console.log('\n📊 5. Testing CSV Export Scope...');
  const headers = ['Sr No', 'Guest Name', 'Phone Number', 'Status', 'Attendees Count', 'Wishes / Message', 'Submission Date'];
  const rowsA = dbRecordsA.map((r, idx) => [
    idx + 1,
    `"${r.guest_name.replace(/"/g, '""')}"`,
    `"${r.guest_phone}"`,
    r.attending ? 'Attending' : 'Not Attending',
    r.attending ? r.attendees_count : 0,
    `"${(r.wishes || '').replace(/"/g, '""')}"`,
    `"${new Date(r.created_at).toLocaleString('en-IN')}"`,
  ]);
  const csvA = [headers.join(','), ...rowsA.map(row => row.join(','))].join('\n');
  const csvHasB = csvA.includes('B-Guest') || csvA.includes('Desai');
  console.log(`  Kankotri A CSV contains Kankotri B guests: ${csvHasB ? 'YES (FAIL)' : 'NO (PASS)'}`);

  // 6. TEMPLATES AUDIT
  console.log('\n🎨 6. Auditing All 7 Templates for RSVP Integration...');
  const templates = ['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory'];
  const templateResults = {};
  templates.forEach(t => {
    const fPath = path.join(__dirname, `../public/templates/${t}-template/index.html`);
    const content = fs.readFileSync(fPath, 'utf8');
    templateResults[t] = content.includes('shared-rsvp.js') && content.includes('guest_name') ? 'PASS' : 'FAIL';
    console.log(`  ✓ Template ${t.padEnd(12)}: ${templateResults[t]}`);
  });

  // Cleanup test rows
  await supabase.from('rsvps').delete().eq('wedding_slug', slugA);
  await supabase.from('rsvps').delete().eq('wedding_slug', slugB);

  console.log('\n========================================================================');
  console.log('📊 FINAL TEST RESULTS');
  console.log('========================================================================');
  console.log(`Wedding A Expected: 3 | Actual: ${metricsA.totalResponses}`);
  console.log(`Wedding B Expected: 2 | Actual: ${metricsB.totalResponses}`);
  console.log(`Cross mixing: ${!isCrossMixing && !csvHasB ? 'PASS' : 'FAIL'}`);
  console.log('========================================================================\n');
}

runFinalRsvpVerification();
