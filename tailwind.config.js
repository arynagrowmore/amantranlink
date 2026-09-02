/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', '"Cormorant Garamond"', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Cinzel', 'serif'],
        fraunces: ['Fraunces', '"Cormorant Garamond"', 'serif'],
        manrope: ['Manrope', '"Plus Jakarta Sans"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        baloo: ['Baloo Bhai 2', 'cursive', 'sans-serif'],
        hanken: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        mukta: ['Mukta', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
        serif: ['Cinzel', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        marcellus: ['Cinzel', 'serif'],
        tiro: ['Baloo Bhai 2', 'cursive', 'sans-serif'],
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
