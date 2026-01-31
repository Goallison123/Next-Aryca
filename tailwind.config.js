module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#0B1020',
        accent: '#22D3EE',
        accentSoft: 'rgba(34,211,238,0.12)'
      },
      boxShadow: {
        glow: '0 0 40px rgba(34,211,238,0.35)',
        glowStrong: '0 0 70px rgba(34,211,238,0.55)',
        depth: '0 30px 80px rgba(2,6,23,0.8)'
      },
      backdropBlur: {
        ultra: '24px'
      }
    }
  },
  plugins: []
}
