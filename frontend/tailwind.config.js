// tailwind.config.js
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
];
export const theme = {
  extend: {
    colors: {
      'custom-teal': '#00615f',
      "white": '#f9f3f0'
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    animation: {
      'oscillate': 'oscillate 3s ease-in-out infinite',
    },
    keyframes: {
      oscillate: {
        '0%': { transform: 'translateX(0)' },
        '50%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
    },
  },
};
export const plugins = [];