const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const aaravIdx = html.indexOf('Aarav');
if (aaravIdx !== -1) {
  console.log('Snippet around Aarav:');
  console.log(html.substring(aaravIdx - 100, aaravIdx + 150));
}

const meeraIdx = html.indexOf('Meera');
if (meeraIdx !== -1) {
  console.log('Snippet around Meera:');
  console.log(html.substring(meeraIdx - 100, meeraIdx + 150));
}

// Let's replace any Aarav -> Rudra, Meera -> Ishani, आरव -> रुद्र, मीरा -> ईशानी
let cleanHtml = html.replace(/Aarav/g, 'Rudra');
cleanHtml = cleanHtml.replace(/Meera/g, 'Ishani');
cleanHtml = cleanHtml.replace(/आरव/g, 'रुद्र');
cleanHtml = cleanHtml.replace(/मीरा/g, 'ईशानी');

fs.writeFileSync('index.html', cleanHtml);
console.log('Cleaned all remaining Aarav/Meera occurrences to Rudra/Ishani in index.html!');

