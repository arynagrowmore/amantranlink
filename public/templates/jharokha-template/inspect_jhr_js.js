const fs = require('fs');

const code = fs.readFileSync('jharokha_app_chunk.js', 'utf8');

// Find all Jharokha scroll scenes
const jhrMatches = [...code.matchAll(/useScrollScene[\s\S]*?return/g)];
console.log('ScrollScene count in Jharokha chunk:', jhrMatches.length);
jhrMatches.forEach((m, idx) => {
  if (m[0].includes('jhr') || m[0].includes('Jharokha')) {
    console.log(`\n=== JHAROKHA SCENE ${idx + 1} ===`);
    console.log(m[0].slice(0, 600));
  }
});

// Also search for "jhr-" in chunk
const jhrSnippets = [...code.matchAll(/jhr-[a-zA-Z0-9_-]+/g)].map(m => m[0]);
console.log('Jharokha classes found:', [...new Set(jhrSnippets)]);

