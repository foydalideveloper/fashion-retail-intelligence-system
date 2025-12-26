// ============================================
// FILE 1: tailwind.config.js
// ============================================
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fashion: {
          // Premium fashion brand colors
          cream: '#F5F1E8',
          stone: '#E8E2D5',
          charcoal: '#2C2C2C',
          obsidian: '#1A1A1A',
          gold: '#D4AF37',
          rose: '#E6B8B7',
          sage: '#9CAF88',
          slate: '#6B7280',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'], // Elegant headers
        sans: ['Inter', 'system-ui', 'sans-serif'], // Modern body
        mono: ['JetBrains Mono', 'monospace'], // Code/numbers
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      }
    },
  },
  plugins: [],
}