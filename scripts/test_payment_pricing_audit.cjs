const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

async function runAudit() {
  console.log('👑 ========================================================');
  console.log('👑 SHAHI STUDIO RAZORPAY PAYMENT PRICING VERIFICATION SUITE');
  console.log('👑 ========================================================\n');

  let passed = 0;
  let total = 0;

  async function testCase(name, payload, expectedAmountInr, expectedAmountPaise, expectedPackage) {
    total++;
    try {
      const res = await postJson('/api/razorpay/create-order', payload);
      if (res.status !== 200 || !res.data.success) {
        console.error(`❌ [${name}] FAILED: Server returned error:`, res.data);
        return;
      }

      const receivedPaise = res.data.amount;
      const receivedInr = res.data.amountInRupees || (receivedPaise / 100);
      const receivedPkg = res.data.packageId;

      const isMatch = receivedPaise === expectedAmountPaise && receivedInr === expectedAmountInr;
      if (isMatch) {
        console.log(`✅ [${name}] PASSED: Amount: ₹${receivedInr} (${receivedPaise} paise) | Package: ${receivedPkg.toUpperCase()}`);
        passed++;
      } else {
        console.error(`❌ [${name}] FAILED: Expected ₹${expectedAmountInr} (${expectedAmountPaise} paise), but got ₹${receivedInr} (${receivedPaise} paise)`);
      }
    } catch (e) {
      console.error(`❌ [${name}] ERROR:`, e.message);
    }
  }

  // TEST 1: Silver Package Selection
  await testCase(
    'TEST 1: Select Silver Package',
    { packageId: 'silver', userId: 'user_silver_test' },
    1299,
    129900,
    'silver'
  );

  // TEST 2: Gold Royal Package Selection
  await testCase(
    'TEST 2: Select Gold Royal Package',
    { packageId: 'gold', userId: 'user_gold_test' },
    2299,
    229900,
    'gold'
  );

  // TEST 3: Platinum VIP Package Selection
  await testCase(
    'TEST 3: Select Platinum VIP Package',
    { packageId: 'platinum', userId: 'user_platinum_test' },
    24999,
    2499900,
    'platinum'
  );

  // TEST 4: Gold Royal with ₹500 Coupon (ROYAL500)
  await testCase(
    'TEST 4: Gold Royal + ROYAL500 Coupon',
    { packageId: 'gold', couponCode: 'ROYAL500', userId: 'user_coupon_test' },
    1799,
    179900,
    'gold'
  );

  // TEST 5: Gold Royal with Invalid Coupon
  await testCase(
    'TEST 5: Gold Royal + Invalid Coupon (FAKECD)',
    { packageId: 'gold', couponCode: 'FAKECD', userId: 'user_invalid_coupon_test' },
    2299,
    229900,
    'gold'
  );

  // TEST 6: Publish Rajmahal Theme (Default should map to Gold)
  await testCase(
    'TEST 6: Publish Rajmahal Theme (3D Palace Gateway)',
    { templateId: 'rajmahal', userId: 'user_rajmahal_test' },
    2299,
    229900,
    'gold'
  );

  // TEST 7: Publish Royal Dawn Theme (Lakefront & Scratch Card)
  await testCase(
    'TEST 7: Publish Royal Dawn Theme',
    { templateId: 'royaldawn', userId: 'user_royaldawn_test' },
    2299,
    229900,
    'gold'
  );

  // TEST 8: Publish Jharokha Theme (Silver Tier Theme)
  await testCase(
    'TEST 8: Publish Jharokha Theme (Rajasthani Arch)',
    { templateId: 'jharokha', userId: 'user_jharokha_test' },
    1299,
    129900,
    'silver'
  );

  console.log('\n👑 ========================================================');
  console.log(`👑 RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('👑 ========================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit();
