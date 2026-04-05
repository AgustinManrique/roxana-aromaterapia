/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#FBF6F1',
          100: '#F5EADD',
          200: '#EBD4BB',
          300: '#DDB793',
          400: '#CE9468',
          500: '#C77653',
          600: '#B05E3E',
          700: '#924A31',
          800: '#763D2A',
          900: '#5E3324',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E6EEE7',
          200: '#CBDDCE',
          300: '#A5C3AB',
          400: '#7FA487',
          500: '#6B8E7F',
          600: '#547260',
          700: '#435B4C',
          800: '#37493F',
          900: '#2E3D35',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3EDE4',
          300: '#E9DFCF',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(17, 17, 17, 0.04), 0 1px 2px rgba(17, 17, 17, 0.06)',
        'soft-lg': '0 8px 24px rgba(17, 17, 17, 0.06), 0 2px 6px rgba(17, 17, 17, 0.04)',
        'soft-xl': '0 24px 48px -12px rgba(17, 17, 17, 0.12)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
