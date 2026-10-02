/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          accent: 'rgb(var(--color-bg-accent) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          accent: 'rgb(var(--color-text-accent) / <alpha-value>)',
        },
        border: {
          subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          text: 'rgb(var(--color-primary-text) / <alpha-value>)',
        },
        brand: {
          porcelain: '#F8F5EF',
          cream: '#EFE8DB',
          sand: '#D9CCBA',
          taupe: '#A99B8A',
          terracotta: '#B56E54',
          olive: '#68715C',
          ink: '#20201D',
          charcoal: '#44433F',
          gold: '#B89B63',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        editorial: '0 20px 40px -15px rgba(32, 32, 29, 0.08)',
      }
    },
  },
  plugins: [],
}
