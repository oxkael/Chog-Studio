/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        milk: '#F6EFE2',
        oat: '#EADFCB',
        caramel: '#C79A6B',
        cocoa: '#3B2A20',
        esp: '#2A1C14',
        org: '#F29A1F',
        line: '#2A1C14',
        mut: '#6a5f55',
        card: '#FFFFFF',
      },
      fontFamily: {
        bowlby: ['"Bowlby One"', 'Impact', 'sans-serif'],
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
        hand: ['"Patrick Hand"', 'cursive', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'comic': '4px 4px 0px #2A1C14',
        'comic-lg': '7px 7px 0px #2A1C14',
        'comic-sm': '2px 2px 0px #2A1C14',
        'comic-caramel': '8px 8px 0px #C79A6B',
        'comic-page': '6px 6px 0px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
