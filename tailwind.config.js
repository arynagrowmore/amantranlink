/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        fraunces: ['"Cormorant Garamond"', 'Fraunces', 'serif'],
        baloo: ['Baloo Bhai 2', 'cursive', 'sans-serif'],
        hanken: ['Manrope', 'Hanken Grotesk', 'sans-serif'],
        mukta: ['Mukta', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
        // Legacy fallbacks
        'cinzel-dec': ['"Cormorant Garamond"', 'Fraunces', 'serif'],
        cinzel: ['"Cormorant Garamond"', 'Fraunces', 'serif'],
        marcellus: ['Manrope', 'Hanken Grotesk', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Fraunces', 'serif'],
        sans: ['Manrope', 'Hanken Grotesk', 'sans-serif'],
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
