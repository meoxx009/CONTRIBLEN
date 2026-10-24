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
        black: '#000000',
        blackHole: '#222222',
        coffeeBean: '#2D120D',
        rosewood: '#6B0B0C',
        electricTangerine: {
          DEFAULT: '#FF6D1F',
          hover: '#FA5810',
          glow: 'rgba(255, 109, 31, 0.35)',
        },
        lemonChiffon: {
          DEFAULT: '#FFF8CA',
          hover: '#FFF3A8',
        },
        sustainableLinen: '#FAF3E1',
        recycledCotton: '#F5E7C6',
        botticelli: {
          DEFAULT: '#CDE3E8',
          muted: '#8EA4B5',
        },
        // Reference support tokens
        mochaBrown: {
          DEFAULT: '#6F4E37',
          dark: '#4A3324',
          light: '#8B6447',
        },
        platinumSilver: {
          DEFAULT: '#E5E4E2',
          muted: '#C4C3C0',
          pure: '#F0EFEF',
        },
        paleLavender: {
          DEFAULT: '#E6E0F0',
          soft: '#F2EDFA',
          muted: '#CBC3DC',
        },
        textPrimary: '#F5F3ED',
        textMuted: '#AAA9A1',
        borderDark: 'rgba(245, 243, 237, 0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-tangerine': '0 0 50px -10px rgba(255, 109, 31, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'liquid-glass': '0 20px 50px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(229, 228, 226, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'liquid-nav': '0 16px 36px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(229, 228, 226, 0.3)',
        'liquid-glow': '0 0 45px -10px rgba(255, 109, 31, 0.4), 0 0 30px -5px rgba(230, 224, 240, 0.2)',
        'metallic': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
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
