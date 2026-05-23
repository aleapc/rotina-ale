/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif']
      },
      colors: {
        ink: {
          950: '#0a0a0a',
          900: '#141414',
          800: '#1f1f1f',
          700: '#2a2a2a',
          500: '#6b6b6b',
          300: '#a8a8a8',
          100: '#e8e6e1'
        },
        cream: '#f5f0e8',
        accent: {
          DEFAULT: '#b85c2d',
          400: '#cf7547',
          600: '#9c4a23'
        }
      },
      letterSpacing: {
        tightest: '-0.04em'
      }
    }
  },
  plugins: []
};
