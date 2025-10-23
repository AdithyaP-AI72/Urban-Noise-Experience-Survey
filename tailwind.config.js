module.exports = {
  theme: {
    extend: {
      animation: {
        bounceOnce: 'bounceOnce 0.4s ease',
      },
      keyframes: {
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
};
