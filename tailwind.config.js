// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["src/**/*.{njk,md,html}"],
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
