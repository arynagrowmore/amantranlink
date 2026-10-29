/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        manrope: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'serif'],
        marcellus: ['Marcellus', 'Georgia', 'serif'],
        baloo: ['Baloo Bhai 2', 'cursive', 'sans-serif'],
        mukta: ['Mukta', 'sans-serif'],
        tiro: ['"Tiro Devanagari Hindi"', 'serif'],
        mono: ['"Space Grotesk"', 'monospace'],
        // 👑 Royal Wedding Custom Calligraphy & Auspicious Typography
        vibes: ['"Great Vibes"', 'cursive'],
        alex: ['"Alex Brush"', 'cursive'],
        pinyon: ['"Pinyon Script"', 'cursive'],
        bodoni: ['"Bodoni Moda"', 'Didot', 'serif'],
        rozha: ['"Rozha One"', 'serif'],
        yatra: ['"Yatra One"', 'cursive', 'serif'],
        kalam: ['Kalam', 'cursive'],
        gotu: ['Gotu', 'sans-serif', 'serif'],
      },
      colors: {
        // Luxury Royal Palette
        burgundy: '#6E1020',
        deepwine: '#430914',
        antiquegold: '#C49A35',
        champagne: '#E8D5AD',
        ivory: '#F8F3E8',
        warmwhite: '#FFFDF8',
        'primary-text': '#241A17',
        'muted-text': '#75675C',
        'luxury-success': '#167A5A',
        // Legacy palette mappings
        base: '#F8F3E8',
        surface: '#FFFDF8',
        maroon: '#6E1020',
        gold: '#C49A35',
        'gold-light': '#E8D5AD',
        'indigo-accent': '#2C3E5C',
        vermillion: '#6E1020',
        'vermillion-hover': '#430914',
        ink: '#241A17',
        'ink-muted': '#75675C',
        border: '#E8D5AD',
      }
    },
  },
  plugins: [],
}
