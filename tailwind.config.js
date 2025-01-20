/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        serif: ['Playfair Display', 'serif'],
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
          },
        },
        invert: {
          css: {
            '--tw-prose-body': '#f3f4f6',
            '--tw-prose-headings': '#fff',
            '--tw-prose-links': '#fb923c',
            '--tw-prose-bold': '#fff',
            '--tw-prose-bullets': '#fb923c',
            '--tw-prose-quotes': '#f3f4f6',
            '--tw-prose-quote-borders': '#fb923c',
            li: {
              '&::marker': {
                color: '#fb923c',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};