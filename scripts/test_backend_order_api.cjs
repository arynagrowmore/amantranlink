async function testBackendOrderApi() {
  console.log('================================================================');
  console.log('📡 TESTING BACKEND /api/create-order WITH LIVE TEST KEYS');
  console.log('================================================================\n');

  try {
    const res = await fetch('http://localhost:5000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 'rajmahal',
        userId: 'test_user_123',
        userName: 'Dhruv & Shreya',
        userEmail: 'dhruv.shreya@shahistudio.com',
        userPhone: '+91 9409360336'
      })
    });

    const data = await res.json();
    console.log('HTTP Response Status:', res.status);
    console.log('Order API Result:', data);

    if (data.success && data.order_id) {
      console.log('\n🎉 BACKEND RAZORPAY ORDER GENERATION IS 100% OPERATIONAL!');
    } else {
      console.error('❌ Failed:', data);
    }
  } catch (err) {
    console.error('❌ Request error:', err.message);
  }
}

testBackendOrderApi();
