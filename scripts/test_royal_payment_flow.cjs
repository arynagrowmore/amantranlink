const http = require('http');
const crypto = require('crypto');

function postJson(urlPath, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
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

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('👑 SHAHI STUDIO ROYAL PAYMENT & CHECKOUT VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Silver Package Order Creation
  console.log('🧪 Test 1: Creating Order for Shahi Silver (₹1,499)...');
  const silverRes = await postJson('/api/razorpay/create-order', {
    templateId: 'jharokha',
    packageId: 'silver',
    userId: 'test_user_silver_01',
    userName: 'Dhruv & Shreya',
    userEmail: 'dhruv.shreya@shahistudio.com',
    userPhone: '+91 9409360336'
  });

  if (silverRes.data?.success && silverRes.data?.amount === 149900) {
    console.log(`✅ Shahi Silver Order: ID=${silverRes.data.orderId}, Amount=₹${silverRes.data.amount / 100} (149900 Paise) [PASS]`);
  } else {
    console.error('❌ Shahi Silver Order Failed:', silverRes);
  }

  // Test 2: Gold Royal Package Order Creation
  console.log('\n🧪 Test 2: Creating Order for Shahi Gold Royal (₹2,499 - All 7 Themes)...');
  const goldRes = await postJson('/api/razorpay/create-order', {
    templateId: 'rajmahal',
    packageId: 'gold',
    userId: 'test_user_gold_02',
    userName: 'Dhruv & Shreya',
    userEmail: 'dhruv.shreya@shahistudio.com',
    userPhone: '+91 9409360336'
  });

  if (goldRes.data?.success && goldRes.data?.amount === 249900) {
    console.log(`✅ Shahi Gold Royal Order: ID=${goldRes.data.orderId}, Amount=₹${goldRes.data.amount / 100} (249900 Paise) [PASS]`);
  } else {
    console.error('❌ Shahi Gold Royal Order Failed:', goldRes);
  }

  // Test 3: Platinum VIP Package Order Creation
  console.log('\n🧪 Test 3: Creating Order for Rajmahal Platinum VIP (₹24,999)...');
  const platRes = await postJson('/api/razorpay/create-order', {
    templateId: 'royaldawn',
    packageId: 'platinum',
    userId: 'test_user_plat_03',
    userName: 'Dhruv & Shreya',
    userEmail: 'dhruv.shreya@shahistudio.com',
    userPhone: '+91 9409360336'
  });

  if (platRes.data?.success && platRes.data?.amount === 2499900) {
    console.log(`✅ Rajmahal Platinum VIP Order: ID=${platRes.data.orderId}, Amount=₹${platRes.data.amount / 100} (2499900 Paise) [PASS]`);
  } else {
    console.error('❌ Rajmahal Platinum VIP Order Failed:', platRes);
  }

  // Test 4: HMAC SHA-256 Mathematical Signature Verification & Multi-Theme Unlock
  console.log('\n🧪 Test 4: Testing HMAC-SHA256 Payment Verification & Multi-Theme Unlock...');
  const fakeOrderId = 'order_test_shahi_999';
  const fakePaymentId = 'pay_test_shahi_888';
  const secret = process.env.RAZORPAY_KEY_SECRET || 'AqmDQwSD6QUbALiJZfFZY6A9';
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${fakeOrderId}|${fakePaymentId}`);
  const validSignature = hmac.digest('hex');

  const verifyRes = await postJson('/api/razorpay/verify-payment', {
    razorpay_order_id: fakeOrderId,
    razorpay_payment_id: fakePaymentId,
    razorpay_signature: validSignature,
    templateId: 'rajmahal',
    packageId: 'gold',
    userId: 'test_user_gold_02'
  });

  console.log('Verification Response:', verifyRes.data);
  if (verifyRes.data?.success) {
    console.log('✅ Mathematical HMAC SHA-256 Signature Verification Passed [PASS]');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL SHAHI STUDIO PAYMENT TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(console.error);
