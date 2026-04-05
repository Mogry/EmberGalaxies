/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Press Start 2P"', '"VT323"', 'Courier New', 'Courier', 'monospace'],
      },
      colors: {
        'amber': {
          100: '#ffb000',
          200: '#ff9900',
          300: '#ff8800',
          400: '#ff7700',
          500: '#ff6600',
          glow: '#ff7700',
        },
        'terminal': {
          bg: '#0a0a0a',
          bg-alt: '#0f0f0f',
          fg: '#ffb000',
          dim: '#cc8800',
        },
        'ember': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'galaxy': {
          dark: '#0a0a1a',
          darker: '#050510',
          purple: '#1a1a3a',
          blue: '#0d1b2a',
        }
      },
      backgroundImage: {
        'stars': 'radial-gradient(circle at center, #1a1a3a 0%, #050510 100%)',
        'terminal-grid': 'linear-gradient(rgba(255, 119, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 119, 0, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'terminal-grid': '20px 20px',
      }
    },
  },
  plugins: [],
}