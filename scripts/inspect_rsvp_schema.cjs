const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectRsvpSchema() {
  console.log('================================================================');
  console.log('🔍 INSPECTING RSVPS AND WEDDING_SITES SCHEMA');
  console.log('================================================================\n');

  const { data: rsvps, error: rsvpErr } = await supabase
    .from('rsvps')
    .select('*')
    .limit(5);

  if (rsvpErr) {
    console.error('RSVPs error:', rsvpErr);
  } else {
    console.log(`✅ RSVPs table records (${rsvps.length}):`);
    rsvps.forEach(r => console.log('  RSVP:', r));
  }

  const { data: sites, error: siteErr } = await supabase
    .from('wedding_sites')
    .select('*')
    .limit(5);

  if (siteErr) {
    console.error('Wedding sites error:', siteErr);
  } else {
    console.log(`\n✅ Wedding sites records (${sites.length}):`);
    sites.forEach(s => console.log('  Site:', s));
  }
}

inspectRsvpSchema();
