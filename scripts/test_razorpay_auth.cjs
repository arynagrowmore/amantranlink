const dotenv = require('dotenv');
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID.trim();
const keySecret = process.env.RAZORPAY_KEY_SECRET.trim();

async function testFetch() {
  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  console.log('Sending request to https://api.razorpay.com/v1/orders with Auth Header:', authHeader.slice(0, 20) + '...');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 149900,
      currency: 'INR',
      receipt: 'rcpt_test_1'
    })
  });

  const json = await res.json();
  console.log('HTTP Status:', res.status);
  console.log('Response:', json);
}

testFetch();
