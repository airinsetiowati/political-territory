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
        game: {
          cream: '#F8F5EC',
          white: '#FFFFFF',
          navy: '#253451',
          green: '#73B77A',
          yellow: '#F4CE70',
          orange: '#EF956F',
          blue: '#8BBDE2',
          gray: '#EAE9E3',
        },
        cream: {
          50: '#FDFCF9',
          100: '#F8F5EC',
          200: '#EAE9E3',
          300: '#DDD9CF',
          400: '#C8C2B3',
        },
        navy: {
          950: '#141D2E',
          900: '#1C273D',
          850: '#253451', // Deep Navy
          800: '#2D3F61',
          700: '#3D527C',
          600: '#516B9E',
          500: '#6A86BA',
          400: '#8DA4D0',
          300: '#B4C5E4',
          200: '#D7E2F3',
          100: '#EBF1FA',
          50: '#F5F8FD',
        },
        gold: {
          300: '#FDE7A0',
          400: '#F4CE70', // Soft Yellow
          500: '#E8BC4C',
          600: '#CB9D2E',
          700: '#A47B16',
        },
        player: {
          red: '#EF4444',
          blue: '#3B82F6',
          green: '#10B981',
          yellow: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(37, 52, 81, 0.06), 0 1px 4px -1px rgba(37, 52, 81, 0.04)',
        'soft-md': '0 8px 24px -4px rgba(37, 52, 81, 0.08), 0 4px 12px -2px rgba(37, 52, 81, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(37, 52, 81, 0.12), 0 8px 16px -4px rgba(37, 52, 81, 0.06)',
        'game-card': '0 6px 0 0 rgba(37, 52, 81, 0.08), 0 12px 28px -6px rgba(37, 52, 81, 0.08)',
        'game-btn': '0 4px 0 0 rgba(37, 52, 81, 0.15)',
        'game-btn-active': '0 1px 0 0 rgba(37, 52, 81, 0.15)',
      }
    },
  },
  plugins: [],
}
