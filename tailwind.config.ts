import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kora-Inspired Master Palette per Section 5
        koraBg: '#050302',
        koraBurgundy: {
          DEFAULT: '#68100D',
          hover: '#7E1410',
          deep: '#450B09',
          glow: 'rgba(104, 16, 13, 0.35)',
        },
        koraSlate: {
          DEFAULT: '#303A4C',
          hover: '#3E4A60',
          muted: '#202733',
          glow: 'rgba(48, 58, 76, 0.35)',
        },
        koraRed: {
          DEFAULT: '#C02B18',
          hover: '#D43520',
          active: '#A52313',
          glow: 'rgba(192, 43, 24, 0.45)',
        },
        koraOffWhite: '#F9F6F2',
        koraSecondary: '#9F9997',
        koraCharcoal: {
          DEFAULT: '#5B5857',
          surface: '#120F0E',
          surfaceElevated: '#1A1615',
          surfaceHighlight: '#231D1B',
          border: 'rgba(159, 153, 151, 0.16)',
          borderHover: 'rgba(159, 153, 151, 0.32)',
        },

        black: '#050302',
        blackHole: '#120F0E',
        coffeeBean: '#2B0C0A',
        rosewood: '#68100D',
        electricTangerine: {
          DEFAULT: '#C02B18',
          hover: '#D43520',
          glow: 'rgba(192, 43, 24, 0.45)',
        },
        lemonChiffon: {
          DEFAULT: '#F9F6F2',
          hover: '#ECE8E1',
        },
        sustainableLinen: '#ECE8E1',
        recycledCotton: '#E2DDD5',
        botticelli: {
          DEFAULT: '#303A4C',
          muted: '#5B5857',
        },
        // Reference support tokens
        mochaBrown: {
          DEFAULT: '#5B5857',
          dark: '#1A1615',
          light: '#9F9997',
        },
        platinumSilver: {
          DEFAULT: '#F9F6F2',
          muted: '#9F9997',
          pure: '#FFFFFF',
        },
        paleLavender: {
          DEFAULT: '#303A4C',
          soft: '#E6E0F0',
          muted: '#9F9997',
        },
        textPrimary: '#F9F6F2',
        textMuted: '#9F9997',
        borderDark: 'rgba(159, 153, 151, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        heading: ['var(--font-heading)', 'Berkelium Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        showcase: ['var(--font-showcase)', 'Ferdinand', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        technical: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 50px -10px rgba(192, 43, 24, 0.45)',
        'glow-burgundy': '0 0 50px -10px rgba(104, 16, 13, 0.45)',
        'glow-tangerine': '0 0 50px -10px rgba(192, 43, 24, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
        'liquid-glass': '0 20px 50px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(249, 246, 242, 0.12), inset 0 0 0 1px rgba(159, 153, 151, 0.14)',
        'liquid-nav': '0 16px 36px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(249, 246, 242, 0.15)',
        'liquid-glow': '0 0 45px -10px rgba(192, 43, 24, 0.35), 0 0 30px -5px rgba(104, 16, 13, 0.25)',
        'metallic': 'inset 0 1px 2px 0 rgba(249, 246, 242, 0.25), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.7), 0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 3s infinite',
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
