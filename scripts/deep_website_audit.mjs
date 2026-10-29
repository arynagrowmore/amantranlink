import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

async function runAudit() {
  console.log('======================================================');
  console.log('🔍 AMANTRANLINK DEEP COMPREHENSIVE WEBSITE AUDIT');
  console.log('======================================================\n');

  const report = {
    templates: {},
    previews: {},
    routes: {},
    api: {},
    defects: [],
    warnings: [],
    strengths: []
  };

  // 1. Audit All 8 Themes and their Assets
  const themes = ['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory', 'royalring'];
  console.log('1️⃣ Auditing Templates and Static Assets:');

  for (const t of themes) {
    const tplPath = path.resolve(`public/templates/${t}-template/index.html`);
    const previewPath = path.resolve(`public/previews/theme-${t}.webp`);
    const previewPngPath = path.resolve(`public/previews/theme-${t}.png`);

    const hasTpl = fs.existsSync(tplPath);
    const hasPreview = fs.existsSync(previewPath) || fs.existsSync(previewPngPath);

    report.templates[t] = { hasTpl, hasPreview };

    if (!hasTpl) {
      report.defects.push(`Missing template HTML: public/templates/${t}-template/index.html`);
      console.log(`  ❌ ${t}: Missing template HTML`);
    } else {
      // Check for broken local image references inside the template HTML
      const htmlContent = fs.readFileSync(tplPath, 'utf8');
      const imgRegex = /src=["'](\.[^"']+|assets\/[^"']+|images\/[^"']+)["']/g;
      let match;
      let missingAssets = 0;
      while ((match = imgRegex.exec(htmlContent)) !== null) {
        const relSrc = match[1];
        if (!relSrc.startsWith('http') && !relSrc.startsWith('data:')) {
          const resolvedAsset = path.resolve(`public/templates/${t}-template`, relSrc);
          if (!fs.existsSync(resolvedAsset)) {
            missingAssets++;
          }
        }
      }
      if (missingAssets > 0) {
        report.warnings.push(`${t} template references ${missingAssets} local relative assets that could not be resolved`);
      }
      console.log(`  ✅ ${t}: Template exists (${(htmlContent.length / 1024).toFixed(1)} KB) | Preview: ${hasPreview ? 'Found' : 'Missing'}`);
    }
  }

  // 2. HTTP Route Response Check against Vite Dev Server
  console.log('\n2️⃣ Testing HTTP Endpoints on Frontend (Port 3000):');
  const urlsToTest = [
    { name: 'Root Landing Page', path: '/' },
    { name: 'Rajmahal Template Direct', path: '/templates/rajmahal-template/index.html' },
    { name: 'Royal Dawn Template Direct', path: '/templates/royaldawn-template/index.html' },
    { name: 'Jharokha Template Direct', path: '/templates/jharokha-template/index.html' },
    { name: 'Shared RSVP Script', path: '/templates/shared-rsvp.js' },
    { name: 'Standalone Sample Invite', path: '/i/rudra-ishani' },
    { name: 'Personalized Guest Invite', path: '/i/rudra-ishani?guest=Sharma+Parivar' },
  ];

  for (const item of urlsToTest) {
    try {
      const res = await fetch(`${BASE_URL}${item.path}`);
      report.routes[item.name] = { status: res.status, ok: res.ok };
      if (res.ok) {
        console.log(`  ✅ ${item.name} (${item.path}): HTTP ${res.status}`);
      } else {
        report.defects.push(`HTTP ${res.status} on ${item.path}`);
        console.log(`  ❌ ${item.name} (${item.path}): HTTP ${res.status}`);
      }
    } catch (err) {
      report.defects.push(`Failed to fetch ${item.path}: ${err.message}`);
      console.log(`  ❌ ${item.name}: Network fetch failed (${err.message})`);
    }
  }

  // 3. Backend API Gateway Health & Config Check
  console.log('\n3️⃣ Testing Backend Express API Gateway (Port 5000):');
  try {
    const healthRes = await fetch(`${BACKEND_URL}/api/health`);
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      report.api.health = healthData;
      console.log(`  ✅ Backend Health Status: ${healthData.status}`);
      console.log(`  ✅ Database/Auth: ${healthData.engine}`);
      console.log(`  ✅ Razorpay Configured: ${healthData.razorpayConfigured}`);
      console.log(`  ✅ Supabase Configured: ${healthData.supabaseConfigured}`);
    } else {
      report.defects.push(`Backend API Health returned HTTP ${healthRes.status}`);
      console.log(`  ❌ Backend Health check failed: HTTP ${healthRes.status}`);
    }
  } catch (err) {
    report.defects.push(`Backend API connection failed: ${err.message}`);
    console.log(`  ❌ Backend API connection failed: ${err.message}`);
  }

  // 4. Code & Configuration Deep Analysis
  console.log('\n4️⃣ Code Quality & Architecture Analysis:');

  // Check .env configuration
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL') || envContent.includes('SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY') || envContent.includes('SUPABASE_ANON_KEY');
    const hasRazorpay = envContent.includes('RAZORPAY_KEY_ID');

    console.log(`  ✅ .env file present`);
    console.log(`  ${hasSupabaseUrl ? '✅' : '⚠️'} Supabase URL configured`);
    console.log(`  ${hasSupabaseKey ? '✅' : '⚠️'} Supabase Key configured`);
    console.log(`  ${hasRazorpay ? '✅' : '⚠️'} Razorpay Key configured`);

    if (!hasSupabaseUrl || !hasSupabaseKey) {
      report.warnings.push('.env has missing or incomplete Supabase configuration');
    }
  } else {
    report.defects.push('Missing .env file');
  }

  // Check bundle sizes & potential performance bottlenecks
  const distPath = path.resolve('dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(path.join(distPath, 'assets'));
    const jsFiles = files.filter(f => f.endsWith('.js'));
    for (const jf of jsFiles) {
      const stat = fs.statSync(path.join(distPath, 'assets', jf));
      const sizeMb = stat.size / (1024 * 1024);
      console.log(`  📦 Production JS Bundle: ${jf} (${sizeMb.toFixed(2)} MB)`);
      if (sizeMb > 1.5) {
        report.warnings.push(`Large single JS bundle (${sizeMb.toFixed(2)} MB). Code-splitting with dynamic import() recommended.`);
      }
    }
  }

  console.log('\n======================================================');
  console.log('📊 AUDIT SUMMARY REPORT:');
  console.log(`  Total Defects: ${report.defects.length}`);
  console.log(`  Total Warnings: ${report.warnings.length}`);
  console.log('======================================================\n');

  fs.writeFileSync(
    'scripts/audit_results.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
}

runAudit();
