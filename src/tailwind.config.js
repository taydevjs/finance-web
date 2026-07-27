/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#5429cc',
          green: '#33cc95',
          red: '#e52e4d',
          dark: '#121214',
          'dark-light': '#202024',
          'text-title': '#f0f2f5',
          'text-body': '#a8a8b3',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        modalEntry: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      },
      animation: {
        'modal-entry': 'modalEntry 0.3s ease-out',
      }
    },
  },
  plugins: [],
}