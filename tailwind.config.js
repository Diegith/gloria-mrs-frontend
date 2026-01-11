/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          white: 'rgba(255, 255, 255, 0.4)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        brand: {
          DEFAULT: '#6366f1', // Indigo moderno (sustituye al azul)
          dark: '#1e1b4b',
        }
      },
      backgroundImage: {
        // Fondo con un degradado suave que permite resaltar la transparencia
        'main-gradient': "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }
    }
  },
  plugins: [],
}