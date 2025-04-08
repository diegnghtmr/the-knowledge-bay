module.exports = {
  darkMode: 'class',
  content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        righteous_regular: ['righteous_regular', 'cursive'],
        worksans_regular: ['worksans_regular', 'sans-serif'],
        worksans_bold: ['worksans_bold', 'bold'],
      },
      colors: {
        foreground: '#2A9D8F',
        foreground_alt: '#264653',
        background: '#1C1F21',
        background_alt: '#F2F3D9'
      }
    },
  },
  plugins: [],
}