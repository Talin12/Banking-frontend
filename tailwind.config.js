/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elite: {
          black: '#000000',
          bg: '#0a0a0a',
          surface: '#141414',
          card: '#1a1a1a',
          border: '#262626',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5D0A9',
          dark: '#B8960C',
        },
        electric: '#00d4ff',
        emerald: '#10b981',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'balance': ['3rem', { lineHeight: '1.1' }],
        'balance-lg': ['4rem', { lineHeight: '1.1' }],
      },
      fontWeight: {
        body: '300',
        heading: '600',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)',
        'glow-electric': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-subtle': '0 0 30px rgba(255, 255, 255, 0.03)',
        'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)',
      },
      backgroundImage: {
        'gradient-elite': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
        'gradient-radial': 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
        'gradient-metallic': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(26,26,26,0.9) 0%, rgba(10,10,10,0.95) 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px',
        'glass-lg': '20px',
      },
    },
  },
  plugins: [],
};
