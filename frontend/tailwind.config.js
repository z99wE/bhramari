/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fragment Mono', 'monospace'],
      },
      colors: {
        bespoke: {
          bg: '#F8F4F0',
          surface: '#FFFFFF',
          text: '#111827',
          muted: '#4B5563',
          border: '#E5E7EB',
          accent: '#3B82F6',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
