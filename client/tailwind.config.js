/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: 'var(--editor-bg)',
          surface: 'var(--editor-surface)',
          sidebar: 'var(--editor-sidebar)',
          header: 'var(--editor-header)',
          border: 'var(--editor-border)',
          text: 'var(--editor-text)',
          textMuted: 'var(--editor-textMuted)',
          accent: 'var(--editor-accent)',
          hover: 'var(--editor-hover)',
          active: 'var(--editor-active)',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};
