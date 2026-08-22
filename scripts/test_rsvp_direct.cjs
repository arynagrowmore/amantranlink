const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRsvpDirect() {
  console.log('================================================================');
  console.log('💌 TESTING DIRECT SUPABASE RSVP INSERT WITH ANON KEY');
  console.log('================================================================\n');

  const testPayload = {
    wedding_slug: 'dhruv-shreya',
    guest_name: 'Test Guest Online',
    guest_phone: '+91 9409360336',
    attendees_count: 2,
    attending: true,
    wishes: 'Congratulations from direct test!'
  };

  const { data, error } = await supabase
    .from('rsvps')
    .insert(testPayload)
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase direct insert error:', error);
  } else {
    console.log('✅ Supabase direct insert SUCCESS:', data);
  }

  // Also test with invalid UUID in wedding_site_id
  const testInvalidUuid = {
    wedding_site_id: 'rajmahal-dhruv-shreya',
    wedding_slug: 'dhruv-shreya',
    guest_name: 'Test Bad UUID Guest',
    guest_phone: '+91 9409360336',
    attendees_count: 1,
    attending: true,
    wishes: 'Testing bad UUID handling'
  };

  const { data: data2, error: error2 } = await supabase
    .from('rsvps')
    .insert(testInvalidUuid)
    .select()
    .single();

  if (error2) {
    console.log('⚠️ As expected, invalid UUID string fails with error:', error2.message);
  } else {
    console.log('Data 2:', data2);
  }
}

testRsvpDirect();
