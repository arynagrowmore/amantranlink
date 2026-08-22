const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('================================================================');
  console.log('🏰 AUDITING TEMPLATES TABLE SCHEMA & RECORDS');
  console.log('================================================================\n');

  const { data: templates, error: tempErr } = await supabase
    .from('templates')
    .select('*');

  if (tempErr) {
    console.error(`❌ Templates query error: ${tempErr.message}`);
  } else {
    console.log(`✅ Found ${templates.length} templates in database:`);
    templates.forEach(t => {
      console.log(`   - ID: ${t.id} | Slug: ${t.slug} | Name: "${t.name}" | Price: ₹${t.price} | Category: ${t.category}`);
    });
  }
}

runAudit();
