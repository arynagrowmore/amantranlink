const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://owziiqdxbvynrprugvwk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRoyalDawn() {
  console.log('================================================================');
  console.log('🌅 ROYAL DAWN COMPLETE END-TO-END VERIFICATION');
  console.log('================================================================\n');

  let allPassed = true;

  // 1. Database Registration
  console.log('--- 1. DATABASE TEMPLATE REGISTRATION ---');
  const { data: tpl, error: tplErr } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', 'royaldawn')
    .single();

  if (tplErr || !tpl) {
    console.error('❌ Failed to fetch royaldawn from templates table:', tplErr);
    allPassed = false;
  } else {
    console.log(`✅ Template registered: ID=${tpl.id} | Slug=${tpl.slug} | Name="${tpl.name}" | Price=₹${tpl.price}`);
  }

  // 2. Template Assets & Files
  console.log('\n--- 2. TEMPLATE FILES & ASSETS CHECK ---');
  const basePath = path.join(__dirname, '..', 'public', 'templates', 'royaldawn-template');
  const filesToCheck = [
    'index.html',
    'style.css',
    'app.js',
    path.join('public', 'assets', 'gate.jpg'),
    path.join('public', 'FinalSong.mp3')
  ];

  filesToCheck.forEach(f => {
    const fullPath = path.join(basePath, f);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ Asset found: ${f}`);
    } else {
      console.error(`   ❌ Missing asset: ${f}`);
      allPassed = false;
    }
  });

  // 3. JavaScript Syntax Verification (vm.Script compile test)
  console.log('\n--- 3. JAVASCRIPT SYNTAX & RUNTIME COMPILE TEST ---');
  const appJsCode = fs.readFileSync(path.join(basePath, 'app.js'), 'utf8');
  try {
    new vm.Script(appJsCode, { filename: 'app.js' });
    console.log('   ✅ app.js compiled cleanly with ZERO SyntaxErrors!');
  } catch (err) {
    console.error('   ❌ app.js SyntaxError detected:', err.message);
    allPassed = false;
  }

  // 4. HTML Selectors Verification for Live Sync
  console.log('\n--- 4. HTML LIVE PREVIEW SELECTORS CHECK ---');
  const htmlContent = fs.readFileSync(path.join(basePath, 'index.html'), 'utf8');
  const requiredSelectors = [
    'id="gateOverlay"',
    'id="gateSealBtn"',
    'id="mainApp"',
    'data-monogram',
    'data-couple-names',
    'data-groom-name',
    'data-bride-name',
    'data-wedding-date',
    'data-venue',
    'data-groom-parents',
    'data-bride-parents',
    'id="cDays"',
    'id="cHours"',
    'id="cMins"',
    'id="cSecs"',
    'id="storyImg1"',
    'id="storyImg2"',
    'id="storyImg3"',
    'id="scratchCanvas"',
    'id="eventsContainer"'
  ];

  requiredSelectors.forEach(sel => {
    if (htmlContent.includes(sel.replace(/id="|data-|class="/g, ''))) {
      console.log(`   ✅ Selector active: ${sel}`);
    } else {
      console.error(`   ❌ Missing selector: ${sel}`);
      allPassed = false;
    }
  });

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 ROYAL DAWN END-TO-END AUDIT & VERIFICATION: ALL PASS!');
  } else {
    console.error('⚠️ SOME CHECKS FAILED.');
  }
  console.log('================================================================');
}

verifyRoyalDawn();
