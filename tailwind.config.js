// tailwind.config.js
module.exports = {
  content: ["src/**/*.{njk,md,html}"],
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
