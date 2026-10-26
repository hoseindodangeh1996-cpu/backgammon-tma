import type { Config } from 'tailwindcss';

/**
 * Mobile-first tokens for Telegram Mini App viewports.
 * Brand palette is defined in src/styles/tokens.css (CSS variables).
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        night: 'rgb(var(--color-night) / <alpha-value>)',
        wood: {
          DEFAULT: 'rgb(var(--color-wood) / <alpha-value>)',
          deep: 'rgb(var(--color-wood-deep) / <alpha-value>)',
          light: 'rgb(var(--color-wood-light) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          soft: 'rgb(var(--color-gold-soft) / <alpha-value>)',
        },
        felt: 'rgb(var(--color-felt) / <alpha-value>)',
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        tg: {
          bg: 'var(--tg-bg)',
          text: 'var(--tg-text)',
          hint: 'var(--tg-hint)',
          link: 'var(--tg-link)',
          button: 'var(--tg-button)',
          'button-text': 'var(--tg-button-text)',
          secondary: 'var(--tg-secondary)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Noto Sans Armenian', 'serif'],
        sans: ['var(--font-sans)', 'Noto Sans Armenian', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'var(--safe-area-top)',
        'safe-bottom': 'var(--safe-area-bottom)',
        'safe-left': 'var(--safe-area-left)',
        'safe-right': 'var(--safe-area-right)',
      },
      minHeight: {
        tg: 'var(--tg-viewport-stable-height, 100dvh)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(212, 175, 55, 0.25)',
        board: '0 12px 40px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'rise-in': 'rise-in 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
