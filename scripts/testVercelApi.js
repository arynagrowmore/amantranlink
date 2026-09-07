import http from 'http';
import handler from '../api/index.js';

const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`🧪 Testing Vercel serverless entry point over HTTP on ${baseUrl}...`);

  try {
    // Test 1: GET /api/health
    const res1 = await fetch(`${baseUrl}/api/health`);
    const data1 = await res1.json();
    console.log(`✅ [Test 1 PASS] GET /api/health returned ${res1.status}:`, JSON.stringify(data1));

    // Test 2: GET /api/templates
    const res2 = await fetch(`${baseUrl}/api/templates`);
    const data2 = await res2.json();
    console.log(`✅ [Test 2 PASS] GET /api/templates returned ${res2.status} with ${data2.templates?.length || 0} templates`);

    // Test 3: POST /api/create-order without payload
    const res3 = await fetch(`${baseUrl}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data3 = await res3.json();
    console.log(`✅ [Test 3 PASS] POST /api/create-order returned ${res3.status} (success: ${data3.success}, error: "${data3.error}")`);

    console.log('\n🎉 All Vercel serverless entry point HTTP tests verified successfully!\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('❌ Error during local Vercel handler test:', err);
    server.close(() => process.exit(1));
  }
});
