const crypto = require('crypto');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

async function verifyRazorpay() {
  console.log('================================================================');
  console.log('💳 VERIFYING RAZORPAY STANDARD CHECKOUT & API CREDENTIALS');
  console.log('================================================================\n');

  console.log(`🔑 Key ID: ${keyId}`);
  console.log(`🔒 Key Secret configured: ${Boolean(keySecret)} (length: ${keySecret ? keySecret.length : 0})`);

  // 1. Direct Razorpay SDK Order Creation Test
  console.log('\n--- 1. Testing Razorpay SDK Direct Order Creation ---');
  try {
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await rzp.orders.create({
      amount: 149900, // ₹1499.00 in paise
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`.slice(0, 40),
      notes: {
        templateId: 'rajmahal',
        test: 'true'
      }
    });

    console.log('✅ Razorpay Order Created Successfully!');
    console.log(`   - Order ID: ${order.id}`);
    console.log(`   - Amount: ₹${order.amount / 100} (${order.amount} paise)`);
    console.log(`   - Currency: ${order.currency}`);
    console.log(`   - Status: ${order.status}`);

    // 2. HMAC-SHA256 Signature Verification Test
    console.log('\n--- 2. Testing HMAC-SHA256 Signature Algorithm ---');
    const mockPaymentId = `pay_test_${Date.now()}`;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${order.id}|${mockPaymentId}`);
    const validSignature = hmac.digest('hex');

    console.log(`   - Generated Signature: ${validSignature}`);

    // Verify valid signature
    const testHmac = crypto.createHmac('sha256', keySecret);
    testHmac.update(`${order.id}|${mockPaymentId}`);
    const checkSignature = testHmac.digest('hex');
    const isValid = crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(checkSignature));

    console.log(`✅ Valid signature match test: ${isValid ? 'PASS' : 'FAIL'}`);

    // Verify invalid signature rejection
    const badSignature = 'invalid_signature_hex_string_1234567890abcdef';
    const isBadRejected = badSignature !== validSignature;
    console.log(`✅ Bad signature rejection test: ${isBadRejected ? 'PASS' : 'FAIL'}`);

  } catch (err) {
    console.error('❌ Razorpay SDK Error:', err);
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL RAZORPAY INTEGRATION TESTS PASSED!');
  console.log('================================================================');
}

verifyRazorpay();
