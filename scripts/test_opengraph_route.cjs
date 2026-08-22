async function testOpenGraphRoute() {
  console.log('================================================================');
  console.log('📱 TESTING DYNAMIC WHATSAPP OPENGRAPH ROUTE');
  console.log('================================================================\n');

  try {
    const res = await fetch('http://localhost:5000/wedding/dhruv-shreya', {
      headers: {
        'User-Agent': 'WhatsApp/2.21.12.21 A'
      }
    });

    const html = await res.text();
    console.log('HTTP Status:', res.status);
    
    const hasOgTitle = html.includes('property="og:title"');
    const hasOgImage = html.includes('property="og:image"');
    const hasOgDesc = html.includes('property="og:description"');

    console.log(`✅ og:title present: ${hasOgTitle}`);
    console.log(`✅ og:image present: ${hasOgImage}`);
    console.log(`✅ og:description present: ${hasOgDesc}`);

    if (hasOgTitle && hasOgImage && hasOgDesc) {
      console.log('\n🎉 DYNAMIC WHATSAPP LINK PREVIEW ENGINE IS 100% OPERATIONAL!');
    }
  } catch (err) {
    console.error('❌ Request error:', err.message);
  }
}

testOpenGraphRoute();
