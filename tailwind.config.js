/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000', // YouTube Red
        dark: '#0f0f0f',
        darker: '#0a0a0a',
        card: '#1f1f1f'
      }
    },
  },
  plugins: [],
}
