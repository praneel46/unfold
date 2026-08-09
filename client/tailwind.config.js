/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFBF7',
          100: '#F7F4EE',
          200: '#EFECE4',
          300: '#E3DDD1',
          400: '#C9C2B4',
          500: '#ADA494',
        },
        ink: {
          50: '#F5F2EB',
          100: '#D8D2C5',
          200: '#968F83',
          300: '#686259',
          400: '#4A453E',
          500: '#332F2B',
          600: '#242220',
          700: '#1A1817',
          800: '#151312',
          900: '#100F0E',
          950: '#0B0A09',
        },
        coral: {
          50: '#FDF3F1',
          100: '#FCE4E0',
          200: '#FAC8BF',
          300: '#F5A394',
          400: '#EC7761',
          500: '#E05638',
          600: '#C8462A',
          700: '#A6361E',
          800: '#842917',
          900: '#641E11',
        },
        sage: {
          50: '#F4F6F4',
          100: '#E6EBE7',
          200: '#D0DCD1',
          300: '#B0C4B2',
          400: '#88A68B',
          500: '#5E7361',
          600: '#485C4B',
          700: '#37473A',
          800: '#29352B',
          900: '#1D261F',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'editorial': '0 2px 8px -2px rgba(26, 24, 22, 0.04), 0 1px 3px -1px rgba(26, 24, 22, 0.02)',
        'editorial-hover': '0 8px 24px -4px rgba(26, 24, 22, 0.08), 0 2px 6px -1px rgba(26, 24, 22, 0.04)',
        'unfold-modal': '0 20px 40px -15px rgba(26, 24, 22, 0.15)',
        'dark-editorial': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'unfold': 'unfold 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'subtle-pulse': 'subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        unfold: {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.6' },
        },
      },
    },
  },
  plugins: [],
};
