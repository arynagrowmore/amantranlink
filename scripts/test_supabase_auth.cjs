const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Auth & Database Connection...');
console.log('URL:', url);
console.log('Anon Key Present:', Boolean(key));

if (!url || !key) {
  console.error('Supabase URL or Key missing in .env!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  try {
    // 1. Test public table read (templates)
    const { data: templates, error: tplErr } = await supabase.from('templates').select('*').limit(3);
    if (tplErr) {
      console.error('Templates table read failed:', tplErr);
    } else {
      console.log('✓ Templates query successful:', templates.length, 'templates found');
    }

    // 2. Test profiles table read
    const { data: profiles, error: profErr } = await supabase.from('profiles').select('*').limit(1);
    if (profErr) {
      console.error('Profiles query note (may be restricted by RLS for anon):', profErr.message);
    } else {
      console.log('✓ Profiles query response received');
    }

    // 3. Test signup with test credentials
    const testEmail = `shahitest_${Date.now()}@example.com`;
    const testPass = 'ShahiVivah2026!';
    console.log('Attempting Supabase SignUp with test email:', testEmail);

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPass,
      options: {
        data: {
          name: 'Dhruv & Shreya Test',
          phone: '+91 9409360336'
        }
      }
    });

    if (authErr) {
      console.error('SignUp error:', authErr);
    } else {
      console.log('✓ SignUp successful! User ID:', authData.user?.id);
      console.log('  Email confirmed:', Boolean(authData.user?.email_confirmed_at));

      // Test SignIn with the same credentials
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPass
      });

      if (signInErr) {
        console.error('SignIn error (if email confirmation is required in Supabase Dashboard):', signInErr.message);
      } else {
        console.log('✓ SignIn successful! Session established.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

run();
