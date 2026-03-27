import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Deep navy palette for dark mode
        navy: {
          800: '#0d1526',
          850: '#0a1020',
          900: '#080d1a',
          950: '#050912',
        },
      },
      screens: {
        sm: '640px',
        md: '769px',
        lg: '1025px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-left': {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-up': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '60%':  { transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 20px 4px rgba(59,130,246,0.3)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      animation: {
        'fade-in':    'fade-in  0.2s ease-out both',
        'fade-up':    'fade-up  0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-down':  'fade-down 0.25s ease-out both',
        'slide-left': 'slide-left 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'scale-up':   'scale-up 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'bounce-in':  'bounce-in 0.4s cubic-bezier(0.16,1,0.3,1) both',
        float:        'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow':  'spin-slow 3s linear infinite',
        shimmer:      'shimmer 2.5s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark': `
          radial-gradient(at 0% 0%,   rgba(59,130,246,0.12) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(99,102,241,0.10) 0px, transparent 50%),
          radial-gradient(at 50% 100%,rgba(59,130,246,0.08) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'brand':     '0 0 0 1px rgba(59,130,246,0.3), 0 4px 16px rgba(59,130,246,0.2)',
        'brand-lg':  '0 8px 32px rgba(59,130,246,0.35)',
        'card':      '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4),  0 8px 24px rgba(0,0,0,0.3)',
        'glow-sm':   '0 0 12px rgba(59,130,246,0.25)',
        'glow-md':   '0 0 24px rgba(59,130,246,0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
