/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        hive: {
          amber: '#f59e0b',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          dark: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245,158,11,0.3), 0 0 10px rgba(245,158,11,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(245,158,11,0.6), 0 0 40px rgba(6,182,212,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      }
    }
  },
  plugins: []
}
