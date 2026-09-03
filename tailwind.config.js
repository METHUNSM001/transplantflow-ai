/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        med: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#0ea5e9',
          700: '#0369a1',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}

