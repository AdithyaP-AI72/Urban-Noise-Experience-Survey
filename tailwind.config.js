/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        // Your friends' animation
        bounceOnce: 'bounceOnce 0.4s ease',
        // New animation for the knob
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        // Your friends' keyframes
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        // Note: 'spin' keyframes are built into Tailwind,
        // so we don't need to add them here.
      },
    },
  },
  plugins: [],
};
module.exports = config; // Use module.exports for .js files
