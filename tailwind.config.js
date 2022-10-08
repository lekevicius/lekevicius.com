module.exports = {
  content: ["./src/**/*.{html,js,md}"],
  theme: {
    extend: {
      screens: {
        'xs': '480px'
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              'text-decoration': 'underline',
              'text-decoration-thickness': '0.1px',
              'text-underline-offset': '2px',
              'text-decoration-color': 'inherit'
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ],
}
