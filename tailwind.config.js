/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/renderer/**/*.{js,jsx,ts,tsx}",
        "./src/renderer/index.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark mode base colors
                dark: {
                    900: '#0a0a0f',
                    800: '#0f0f1a',
                    700: '#1a1a2e',
                    600: '#252540',
                    500: '#2d2d4a',
                    400: '#3d3d5c',
                },
                // Cyan accent colors
                cyan: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                // Magenta accent colors
                magenta: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                },
                // Gradient combinations
                accent: {
                    primary: '#06b6d4',    // Cyan-500
                    secondary: '#d946ef',  // Magenta-500
                    glow: '#22d3ee',       // Cyan-400
                }
            },
            backgroundImage: {
                'gradient-cyber': 'linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)',
                'gradient-glow': 'linear-gradient(135deg, #22d3ee 0%, #e879f9 100%)',
                'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
            },
            boxShadow: {
                'cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
                'magenta': '0 0 20px rgba(217, 70, 239, 0.3)',
                'glow': '0 0 30px rgba(6, 182, 212, 0.2), 0 0 60px rgba(217, 70, 239, 0.1)',
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(217, 70, 239, 0.4)' },
                },
            },
        },
    },
    plugins: [],
}
