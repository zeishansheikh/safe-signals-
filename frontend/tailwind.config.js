/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-surface': 'var(--accent-surface)',
        success: 'var(--success)',
        'success-surface': 'var(--success-surface)',
        'success-border': 'var(--success-border)',
        warning: 'var(--warning)',
        'warning-surface': 'var(--warning-surface)',
        danger: 'var(--danger)',
        'danger-surface': 'var(--danger-surface)',
      },
      fontFamily: {
        sans: [
          '"Neue Haas Grotesk Text Pro"',
          '"Neue Haas Unica Pro"',
          '"Geist"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
