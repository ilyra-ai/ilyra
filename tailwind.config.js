/** @type {import('tailwindcss').Config} */
const generateCss = require('./generate-css');
const config = {
  primaryColor: '#3366FF',
  secondaryColor: '#7B61FF',
  accentColor: '#FF977B',
  successColor: '#2ECC71',
  warningColor: '#F1C40F',
  errorColor: '#E74C3C',
  backgroundColor: '#FFFFFF',
  textColor: '#263244',
  borderColor: '#E2E8F0',
  cardColor: '#F1F5F9',
  inputColor: '#F8FAFC',
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  smBreakpoint: '640px',
  mdBreakpoint: '768px',
  lgBreakpoint: '1024px',
  xlBreakpoint: '1280px',
};

// Note: The generateCss function is for the TailwindCustomizerPage simulation
// and writes to src/custom.css. The actual Tailwind config uses CSS variables
// defined in src/index.css.
// generateCss(config); // Commented out as it's part of the customizer simulation


module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/custom.css'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-light': 'rgb(var(--color-primary-light) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        imprima: ['Imprima', 'sans-serif'], // Corrected syntax for Imprima font family
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        typewriter: 'typewriter 2s steps(40, end)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
};
