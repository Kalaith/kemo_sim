/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        'primary-dark': '#1e40af',   // blue-800
        'primary-light': '#60a5fa',  // blue-400
        secondary: '#f59e42', // orange-400
        'secondary-dark': '#b45309',   // orange-800
        'secondary-light': '#fde68a',  // orange-200
        accent: '#10b981', // emerald-500
        'accent-dark': '#047857',   // emerald-800
        'accent-light': '#6ee7b7',  // emerald-300
        background: '#f9fafb', // gray-50
        surface: '#ffffff',
        error: '#ef4444', // red-500
        success: '#22c55e', // green-500
        info: '#0ea5e9', // sky-500
      },
    },
  },
  plugins: [],
};
