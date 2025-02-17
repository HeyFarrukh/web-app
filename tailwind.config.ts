import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            li: {
              '&::marker': {
                color: '#f97316',
              },
            },
            a: {
              color: '#f97316',
              '&:hover': {
                color: '#ea580c',
              },
            },
            h1: {
              color: '#111827',
            },
            h2: {
              color: '#f97316',
            },
            h3: {
              color: '#1f2937',
            },
            strong: {
              color: '#111827',
            },
            blockquote: {
              borderLeftColor: '#f97316',
            },
          },
        },
        invert: {
          css: {
            color: '#d1d5db',
            a: {
              color: '#fb923c',
              '&:hover': {
                color: '#f97316',
              },
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fb923c',
            },
            h3: {
              color: '#f3f4f6',
            },
            strong: {
              color: '#fff',
            },
            blockquote: {
              borderLeftColor: '#fb923c',
            },
            li: {
              '&::marker': {
                color: '#fb923c',
              },
            },
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;