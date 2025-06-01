/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-sea': '#00526A',
        'coastal-sea': '#007A8C',
        'open-sea': '#00A0B0',
        'seafoam': '#69D2E7',
        'sand': '#F9E4C8',
        'coral': '#FF6B6B',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 