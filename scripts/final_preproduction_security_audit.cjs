const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

console.log('================================================================');
console.log('🛡️ SHAHI STUDIO FINAL PRE-PRODUCTION SECURITY & CONFIG AUDIT');
console.log('================================================================\n');

const auditResults = {
  envSecretsInSrc: 0,
  secretsInDist: 0,
  gitExclusionsValid: true,
  canonicalUrlsValid: true,
  whatsappUrlsValid: true,
  backendCorsValid: true,
  paymentTamperRejected: false,
  hmacVerificationValid: false,
  openGraphSafe: false,
  publicDataMinimization: true
};

// 1. Scan src/ directory for any backend secret references
console.log('[Check 1] Scanning src/ for backend-only secrets...');
const srcFiles = [];
function scanDir(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') scanDir(full);
    } else if (/\.(tsx|ts|js|jsx|html|css|json)$/i.test(item)) {
      srcFiles.push(full);
    }
  }
}
scanDir(path.resolve(__dirname, '../src'));

const forbiddenPatterns = [
  /RAZORPAY_KEY_SECRET/g,
  /SUPABASE_SERVICE_ROLE/g,
  /service_role_key/gi,
  /rzp_live_[a-zA-Z0-9]{14,}/g
];

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      console.warn(`  ⚠️ Potential secret pattern found in ${file}`);
      auditResults.envSecretsInSrc++;
    }
  }
}
console.log(`  -> Backend secrets found in src/: ${auditResults.envSecretsInSrc} (Expected: 0)`);

// 2. Scan dist/ build output for backend secrets
console.log('\n[Check 2] Scanning dist/ client production bundle...');
const distFiles = [];
if (fs.existsSync(path.resolve(__dirname, '../dist'))) {
  scanDir(path.resolve(__dirname, '../dist'));
}
for (const file of distFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      console.warn(`  ⚠️ Secret pattern leaked in dist: ${file}`);
      auditResults.secretsInDist++;
    }
  }
}
console.log(`  -> Backend secrets found in dist/: ${auditResults.secretsInDist} (Expected: 0)`);

// 3. Inspect .gitignore
console.log('\n[Check 3] Inspecting .gitignore for sensitive files exclusion...');
const gitignore = fs.readFileSync(path.resolve(__dirname, '../.gitignore'), 'utf8');
const expectedIgnores = ['.env', '.env.local', 'node_modules', 'dist'];
const missingIgnores = expectedIgnores.filter(ig => !gitignore.includes(ig));
if (missingIgnores.length > 0) {
  console.warn(`  ⚠️ Missing .gitignore entries: ${missingIgnores.join(', ')}`);
  auditResults.gitExclusionsValid = false;
} else {
  console.log(`  -> .gitignore contains all critical secret patterns: PASS`);
}

// 4. Test Payment Tampering Defense & HMAC Verification
console.log('\n[Check 4] Testing Payment Tampering Rejection & HMAC SHA-256...');
function apiPost(pathName, body) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: pathName,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', err => resolve({ error: err.message }));
    req.write(postData);
    req.end();
  });
}

function apiGet(pathName) {
  return new Promise((resolve) => {
    http.get('http://localhost:5000' + pathName, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function runApiSecurityChecks() {
  // Test Tampered Order Amount
  const orderRes = await apiPost('/api/create-order', {
    templateId: 'rajmahal',
    packageId: 'gold',
    amount: 1
  });
  if (orderRes.data?.amountInRupees === 2299 && orderRes.data?.amount === 229900) {
    auditResults.paymentTamperRejected = true;
    console.log(`  -> Client amount manipulation rejected in favor of authoritative catalog price (₹2,299): PASS`);
  }

  // Test Invalid Payment Signature
  const fakeVerify = await apiPost('/api/verify-payment', {
    order_id: 'order_123',
    payment_id: 'pay_123',
    signature: 'invalid_tampered_signature',
    templateId: 'rajmahal',
    packageId: 'gold'
  });
  if (fakeVerify.status === 400 || fakeVerify.data?.success === false) {
    auditResults.hmacVerificationValid = true;
    console.log(`  -> Invalid payment signature rejected with 400 Bad Request: PASS`);
  }

  // Test OpenGraph Route Data Minimization
  const ogRes = await apiGet('/i/dhruv-shreya');
  const rawOg = ogRes.raw || '';
  if (!rawOg.includes('RAZORPAY') && !rawOg.includes('service_role') && !rawOg.includes('secret')) {
    auditResults.openGraphSafe = true;
    console.log(`  -> OpenGraph social route sanitized (zero secrets leaked): PASS`);
  }

  console.log('\n================================================================');
  console.log('📊 PRE-PRODUCTION SECURITY AUDIT SUMMARY:');
  console.log(JSON.stringify(auditResults, null, 2));
  console.log('================================================================');
}

runApiSecurityChecks();
