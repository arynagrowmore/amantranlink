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

// Let's replace any Aarav -> Dhruv, Meera -> Shreya, आरव -> ध्रुव, मीरा -> श्रेया
let cleanHtml = html.replace(/Aarav/g, 'Dhruv');
cleanHtml = cleanHtml.replace(/Meera/g, 'Shreya');
cleanHtml = cleanHtml.replace(/आरव/g, 'ध्रुव');
cleanHtml = cleanHtml.replace(/मीरा/g, 'श्रेया');

fs.writeFileSync('index.html', cleanHtml);
console.log('Cleaned all remaining Aarav/Meera occurrences to Dhruv/Shreya in index.html!');
