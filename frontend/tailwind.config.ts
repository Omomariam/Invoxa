import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F9FC',
        surface: '#FFFFFF',
        primary: '#2563EB',
        secondary: '#10B981',
        destructive: '#EF4444',
      },
    },
  },
  plugins: [],
}
export default config
