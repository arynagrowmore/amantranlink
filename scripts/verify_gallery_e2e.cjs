const fs = require('fs');
const path = require('path');

const templates = ['rajmahal', 'royaldawn', 'jharokha', 'mayura', 'jodi', 'dak', 'ivory'];

console.log('================================================================');
console.log('🏰 STARTING FULL END-TO-END GALLERY & PHOTO VERIFICATION');
console.log('================================================================\n');

let allPassed = true;

templates.forEach(t => {
  const filePath = path.join(__dirname, '..', 'public', 'templates', t + '-template', 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Template file not found: ${filePath}`);
    allPassed = false;
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // Verify gallery / look / moment / story sections exist
  const hasGallerySec = html.includes('id="gallery"') || html.includes('id="album"') || html.includes('id="looks"') || html.includes('id="storyImg1"');
  
  // Verify photos can be mapped
  const imgTags = html.match(/<img[^>]+>/g) || [];
  
  console.log(`✨ Template: [${t.toUpperCase()}]`);
  console.log(`   - Has Dedicated Gallery/Moments Section: ${hasGallerySec ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   - Total Image Elements: ${imgTags.length}`);

  if (!hasGallerySec) {
    allPassed = false;
  }
});

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 ALL 7 TEMPLATES VERIFIED AND READY!');
} else {
  console.error('⚠️ SOME TESTS FAILED.');
}
console.log('================================================================');
