/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        coral: {
          50: '#fff1ee',
          100: '#ffe0d9',
          200: '#ffc4b6',
          300: '#ff9d85',
          400: '#ff6f4f',
          500: '#f54a2a',
          600: '#e63318',
          700: '#bf2410',
          800: '#981f12',
          900: '#7a1d13',
        },
        cloud: '#f5f5f4',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        bobHead: {
          '0%,100%': { transform: 'rotateZ(0deg)' },
          '50%': { transform: 'rotateZ(3deg)' },
        },
        blinkEye: {
          '0%,92%,100%': { transform: 'scaleY(1)' },
          '96%': { transform: 'scaleY(0.1)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.55', filter: 'blur(28px)' },
          '50%': { opacity: '0.9', filter: 'blur(36px)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        riseIn: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-22deg)' },
          '30%': { transform: 'rotate(18deg)' },
          '45%': { transform: 'rotate(-16deg)' },
          '60%': { transform: 'rotate(12deg)' },
          '75%': { transform: 'rotate(-6deg)' },
        },
        ringPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        floatY: 'floatY 6s ease-in-out infinite',
        bobHead: 'bobHead 4s ease-in-out infinite',
        blinkEye: 'blinkEye 5s ease-in-out infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
        spinSlow: 'spinSlow 18s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        riseIn: 'riseIn 0.8s cubic-bezier(0.22,1,0.36,1) both',
        wave: 'wave 2.6s ease-in-out infinite',
        ringPulse: 'ringPulse 2.6s ease-out infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
