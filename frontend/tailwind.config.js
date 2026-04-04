/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e'
        },
        surface: '#0f1923',
        panel: '#16232f',
        card: '#1c2f3e',
        border: '#243447',
        accent: '#00d4ff',
        green: '#00e5a0',
        orange: '#ff7849',
        red: '#ff4d6d',
        muted: '#7a9ab5'
      }
    }
  },
  plugins: []
};
