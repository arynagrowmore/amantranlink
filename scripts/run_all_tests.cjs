const { execSync } = require('child_process');
const suites = [
  'scripts/auth_rebuild_master_suite.test.ts',
  'scripts/auth_system_reliability.test.ts',
  'scripts/dynamic_origin_and_urls.test.ts',
  'scripts/partner_onboarding_activation.test.ts',
  'scripts/two_role_commercial_system.test.ts',
  'scripts/phase2_partner_hub.test.ts',
  'scripts/phase3_client_workflow.test.ts',
  'scripts/phase4_authentication_and_roles.test.ts',
  'scripts/phase5_partner_analytics.test.ts',
  'scripts/phase6_wallet_settlement.test.ts',
  'scripts/phase7_marketing_kit.test.ts',
  'scripts/phase8_production_hardening.test.ts'
];

let totalPassed = 0;
let totalFailed = 0;

for (const s of suites) {
  try {
    const out = execSync('npx tsx ' + s, { encoding: 'utf8' });
    console.log('? PASS:', s);
    totalPassed++;
  } catch (err) {
    console.error('? FAIL:', s, err.message);
    totalFailed++;
  }
}

console.log('\n=========================================');
console.log(`TOTAL SUITES: ${suites.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
console.log('=========================================');
