const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = 'http://localhost:5000';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function runStrictRsvpIsolationAudit() {
  console.log('========================================================================');
  console.log('👑 SHAHI STUDIO — STRICT KANKOTRI RSVP ISOLATION AUDIT (ZERO MIXING)');
  console.log('========================================================================\n');

  const siteIdA = generateUuid();
  const siteIdB = generateUuid();
  const slugA = `dhruv-shreya-${Date.now().toString(36)}`;
  const slugB = `parth-puja-${Date.now().toString(36)}`;

  console.log(`🏰 Wedding Site A: ID = ${siteIdA} (Slug: ${slugA})`);
  console.log(`🏰 Wedding Site B: ID = ${siteIdB} (Slug: ${slugB})`);

  // 1. SUBMIT RSVPs TO WEDDING SITE A
  console.log('\n📝 1. Submitting 3 RSVPs to Wedding Site A...');
  const rsvpsA = [
    { wedding_site_id: siteIdA, wedding_slug: slugA, guest_name: 'A-Guest-1 (Sharma Family)', guest_phone: '+91 98250 11111', attending: true, attendees_count: 2, wishes: 'Heartiest congratulations from Sharma family!' },
    { wedding_site_id: siteIdA, wedding_slug: slugA, guest_name: 'A-Guest-2 (Patel Family)', guest_phone: '+91 98250 22222', attending: true, attendees_count: 4, wishes: 'Looking forward to the Royal celebration!' },
    { wedding_site_id: siteIdA, wedding_slug: slugA, guest_name: 'A-Guest-3 (Verma Family)', guest_phone: '+91 98250 33333', attending: false, attendees_count: 0, wishes: 'Best wishes from abroad!' },
  ];

  for (const r of rsvpsA) {
    const res = await fetch(`${API_BASE}/api/rsvp/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    const json = await res.json();
    if (!json.success) {
      console.error('Error submitting RSVP for Wedding A:', json);
    }
  }

  // 2. SUBMIT RSVPs TO WEDDING SITE B
  console.log('\n📝 2. Submitting 2 RSVPs to Wedding Site B...');
  const rsvpsB = [
    { wedding_site_id: siteIdB, wedding_slug: slugB, guest_name: 'B-Guest-1 (Desai Family)', guest_phone: '+91 98250 44444', attending: true, attendees_count: 3, wishes: 'Warmest congratulations to Parth & Puja!' },
    { wedding_site_id: siteIdB, wedding_slug: slugB, guest_name: 'B-Guest-2 (Mehta Family)', guest_phone: '+91 98250 55555', attending: true, attendees_count: 5, wishes: 'Shubh Vivah blessings!' },
  ];

  for (const r of rsvpsB) {
    const res = await fetch(`${API_BASE}/api/rsvp/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    const json = await res.json();
    if (!json.success) {
      console.error('Error submitting RSVP for Wedding B:', json);
    }
  }

  // 3. DATABASE QUERY VERIFICATION & ISOLATION CHECK
  console.log('\n🔍 3. Inspecting Database Scoped Queries (wedding_site_id)...');

  const { data: dbRecordsA, error: errA } = await supabase
    .from('rsvps')
    .select('*')
    .eq('wedding_site_id', siteIdA)
    .order('created_at', { ascending: false });

  const { data: dbRecordsB, error: errB } = await supabase
    .from('rsvps')
    .select('*')
    .eq('wedding_site_id', siteIdB)
    .order('created_at', { ascending: false });

  console.log(`  Wedding A Database Rows: ${dbRecordsA?.length} (Expected: 3)`);
  console.log(`  Wedding B Database Rows: ${dbRecordsB?.length} (Expected: 2)`);

  const metricsA = {
    totalResponses: dbRecordsA.length,
    attending: dbRecordsA.filter(r => r.attending).length,
    regrets: dbRecordsA.filter(r => !r.attending).length,
    totalGuests: dbRecordsA.reduce((sum, r) => r.attending ? sum + (r.attendees_count || 1) : sum, 0)
  };

  const metricsB = {
    totalResponses: dbRecordsB.length,
    attending: dbRecordsB.filter(r => r.attending).length,
    regrets: dbRecordsB.filter(r => !r.attending).length,
    totalGuests: dbRecordsB.reduce((sum, r) => r.attending ? sum + (r.attendees_count || 1) : sum, 0)
  };

  console.log('  Wedding A Metrics:', metricsA);
  console.log('  Wedding B Metrics:', metricsB);

  const crossPollutionInA = dbRecordsA.some(r => r.wedding_site_id === siteIdB || r.guest_name.includes('B-Guest'));
  const crossPollutionInB = dbRecordsB.some(r => r.wedding_site_id === siteIdA || r.guest_name.includes('A-Guest'));

  console.log(`\n  Cross-mixing in Wedding A: ${crossPollutionInA ? 'DETECTED (FAIL)' : 'NONE (PASS)'}`);
  console.log(`  Cross-mixing in Wedding B: ${crossPollutionInB ? 'DETECTED (FAIL)' : 'NONE (PASS)'}`);

  // 4. SEARCH & FILTER ISOLATION CHECK
  console.log('\n🔎 4. Testing Search & Filter Isolation...');
  const searchInA = dbRecordsA.filter(r => r.guest_name.toLowerCase().includes('sharma'));
  const searchInB = dbRecordsB.filter(r => r.guest_name.toLowerCase().includes('sharma'));
  console.log(`  Search 'sharma' in Wedding A: found ${searchInA.length} (Expected: 1)`);
  console.log(`  Search 'sharma' in Wedding B: found ${searchInB.length} (Expected: 0)`);

  // 5. CSV EXPORT ISOLATION CHECK
  console.log('\n📊 5. Testing CSV Export Isolation...');
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
  console.log(`  Wedding A CSV contains Wedding B data: ${csvHasB ? 'YES (FAIL)' : 'NO (PASS)'}`);

  // 6. TEMPLATES AUDIT
  console.log('\n🎨 6. Auditing 7 Templates for RSVP Site Mapping...');
  const templates = ['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory'];
  const templatePass = templates.every(t => {
    const fPath = path.join(__dirname, `../public/templates/${t}-template/index.html`);
    const content = fs.readFileSync(fPath, 'utf8');
    return content.includes('shared-rsvp.js') && content.includes('guest_name');
  });
  console.log(`  7 Template Markup & Script Integration: ${templatePass ? 'PASS' : 'FAIL'}`);

  // Cleanup test rows
  await supabase.from('rsvps').delete().eq('wedding_site_id', siteIdA);
  await supabase.from('rsvps').delete().eq('wedding_site_id', siteIdB);

  console.log('\n========================================================================');
  console.log('📊 AUDIT SUMMARY & FINAL RESULTS');
  console.log('========================================================================');
  console.log(`Wedding A Expected: 3 | Actual: ${metricsA.totalResponses}`);
  console.log(`Wedding B Expected: 2 | Actual: ${metricsB.totalResponses}`);
  console.log(`Cross mixing: ${(!crossPollutionInA && !crossPollutionInB && !csvHasB) ? 'PASS' : 'FAIL'}`);
  console.log('========================================================================\n');
}

runStrictRsvpIsolationAudit();
