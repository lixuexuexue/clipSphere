/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  purge: false,
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#846EF7FF',
      },
      screens: {
        '3xl': '1750px',
        '4xl': '1870px',
      },
      animation: {
        blink: 'blink 1.2s infinite steps(1, start)',
        spin: 'spin 1s linear infinite',
        slideUp: 'slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { 'background-color': 'currentColor' },
          '50%': { 'background-color': 'transparent' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: 0.2 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      width: {
        sider: '60px',
      },
      // textColor: {
      //   primary: '#409eff',
      // },
      minHeight: {
        28: '28px',
      },
      backgroundColor: {
        // lightBg: 'linear-gradient(145deg, #F7F9FA 0%, #D9E9F0 50%, #F7F9FA 100%)',
      },
    },
  },
  plugins: ['@tailwindcss/typography'],
}
