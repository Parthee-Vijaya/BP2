/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kalundborg Kommune brand colors
        kalundborg: {
          50: '#fdf5f3',
          100: '#fce8e4',
          200: '#fad4cc',
          300: '#f5b5a7',
          400: '#ed8a74',
          500: '#e16347',
          600: '#cd4a2e',
          700: '#B54A32', // Primary brand color
          800: '#8f3d2a',
          900: '#773728',
          950: '#411911',
        },
        primary: {
          50: '#fdf5f3',
          100: '#fce8e4',
          200: '#fad4cc',
          300: '#f5b5a7',
          400: '#ed8a74',
          500: '#e16347',
          600: '#B54A32', // Kalundborg primary
          700: '#9a3f2b',
          800: '#8f3d2a',
          900: '#773728',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(181, 74, 50, 0.3)',
        'glow-lg': '0 0 40px rgba(181, 74, 50, 0.4)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
