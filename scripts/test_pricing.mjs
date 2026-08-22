// Automated Verification of Single Source of Truth Pricing & Payment Flow
import { OFFICIAL_PACKAGES, THEME_PACKAGE_MAP, calculatePaymentDetails } from '../src/config/pricing.js';

console.log('=== TEST MATRIX 1: OFFICIAL PACKAGES PRICING ===');
const packages = ['silver', 'gold', 'platinum'];
const expectedPrices = { silver: 1299, gold: 2299, platinum: 24999 };

for (const pkg of packages) {
  const meta = OFFICIAL_PACKAGES[pkg];
  if (!meta) throw new Error(`Missing meta for ${pkg}`);
  console.log(`- ${meta.name}: ₹${meta.priceInr} (Expected: ₹${expectedPrices[pkg]})`);
  if (meta.priceInr !== expectedPrices[pkg]) {
    throw new Error(`Price mismatch for ${pkg}: got ${meta.priceInr}, expected ${expectedPrices[pkg]}`);
  }
}

console.log('\n=== TEST MATRIX 2: THEME DERIVATIONS ===');
const themes = [
  { id: 'rajmahal', expectedPkg: 'gold', expectedPrice: 2299 },
  { id: 'royaldawn', expectedPkg: 'gold', expectedPrice: 2299 },
  { id: 'jharokha', expectedPkg: 'silver', expectedPrice: 1299 },
  { id: 'mayura', expectedPkg: 'silver', expectedPrice: 1299 },
  { id: 'jodi', expectedPkg: 'silver', expectedPrice: 1299 },
  { id: 'dak', expectedPkg: 'silver', expectedPrice: 1299 },
  { id: 'ivory', expectedPkg: 'silver', expectedPrice: 1299 },
];

for (const t of themes) {
  const pkgId = THEME_PACKAGE_MAP[t.id];
  const calc = calculatePaymentDetails(pkgId, t.id);
  console.log(`- Theme ${t.id} -> Pkg: ${pkgId}, Final: ₹${calc.finalAmountInr}`);
  if (pkgId !== t.expectedPkg || calc.finalAmountInr !== t.expectedPrice) {
    throw new Error(`Mismatch for theme ${t.id}`);
  }
}

console.log('\n=== TEST MATRIX 3: DYNAMIC COUPON CALCULATIONS ===');
// Test ROYAL500 (500 off)
const royal500Gold = calculatePaymentDetails('gold', 'rajmahal', 'ROYAL500');
console.log(`- Gold (2299) + ROYAL500 -> Disc: ₹${royal500Gold.discountAmountInr}, Final: ₹${royal500Gold.finalAmountInr}`);
if (royal500Gold.discountAmountInr !== 500 || royal500Gold.finalAmountInr !== 1799) {
  throw new Error('ROYAL500 failed on Gold');
}

// Test SHAHI100 (100 off)
const shahi100Silver = calculatePaymentDetails('silver', 'jharokha', 'SHAHI100');
console.log(`- Silver (1299) + SHAHI100 -> Disc: ₹${shahi100Silver.discountAmountInr}, Final: ₹${shahi100Silver.finalAmountInr}`);
if (shahi100Silver.discountAmountInr !== 100 || shahi100Silver.finalAmountInr !== 1199) {
  throw new Error('SHAHI100 failed on Silver');
}

console.log('\n✅ ALL PRICING & PAYMENT TESTS PASSED PERFECTLY!');
