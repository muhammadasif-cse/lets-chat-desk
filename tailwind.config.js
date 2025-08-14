/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          gray: '#8696A0',
          dark: '#111B21',
          light: '#E9EDEF',
          dark2: '#222D34',
          blue: '#53BDEB',
          blue2: '#007BFC',
          green: '#00A884',
          dark3: '#202C33',
          gray2: '#AEBAC1',
          teal: '#0A332C',
          dark4: '#262E34',
        },
      },
    },
  },
  plugins: [],
}

