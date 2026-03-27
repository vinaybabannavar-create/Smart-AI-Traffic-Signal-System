/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', /* deep slate */
          800: '#1e293b',
          700: '#334155',
        },
        primary: {
          500: '#3b82f6', /* vibrant blue */
          600: '#2563eb',
        },
        accent: {
          green: '#10b981', /* green for go/good */
          red: '#ef4444', /* red for stop/congestion */
          yellow: '#f59e0b' /* yellow for warning */
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
