const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Royal pre-wedding photography URLs for the Moments Gallery
const royalWeddingImages = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80', // Royal Couple Portrait
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80', // Haldi / Yellow celebration
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', // Proposal & Rings
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80', // Palace Pre-wedding
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80', // Traditional Lehenga & Sherwani
  'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=900&q=80'  // Happy Couple Smile
];

// Replace data:image/svg+xml placeholder images in the Gallery with royal couple photos
let count = 0;
html = html.replace(/src="data:image\/svg\+xml,[^"]+"/g, (match) => {
  if (count < royalWeddingImages.length) {
    const newSrc = `src="${royalWeddingImages[count]}"`;
    count++;
    return newSrc;
  }
  return match;
});

// Ensure proper aspect ratio, object-cover, and hover zoom classes
html = html.replace(/class="absolute inset-0 h-full w-full object-cover"/g, 
  'class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"'
);

fs.writeFileSync('index.html', html);
console.log(`Replaced ${count} SVG placeholder images with HD Royal Wedding Photography in index.html!`);
