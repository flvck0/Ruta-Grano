/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        grain: {
          950: '#1c1410',
          900: '#2a1f18',
          100: '#f5e6d3',
        },
        clay: {
          DEFAULT: '#c4836c',
          muted: '#a89888',
        },
      },
    },
  },
  plugins: [],
};
