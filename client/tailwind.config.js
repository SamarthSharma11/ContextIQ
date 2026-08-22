/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#ECECEC',
        card: '#F7F7F7',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#17171A',
          secondary: '#3A3A3E',
          muted: '#6B6B70',
          light: '#A0A0A5',
        },
        coral: {
          50: '#FDF2F0',
          100: '#FBE5DF',
          200: '#F6C2B9',
          300: '#EE968A',
          400: '#E8675F',
          500: '#E8675F',
          600: '#D6534B',
          700: '#B83B33',
        },
        line: '#DCDCDC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
