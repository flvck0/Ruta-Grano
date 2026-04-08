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
        cream: {
          50: '#FFFDF9',
          100: '#FAF5EF',
          200: '#F0E6D8',
          300: '#E2D4C2',
        },
        espresso: {
          DEFAULT: '#3D2B1F',
          light: '#5C4033',
        },
      },
    },
  },
  plugins: [],
};
