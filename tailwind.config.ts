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
