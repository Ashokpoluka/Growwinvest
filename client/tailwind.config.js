/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                groww: {
                    green: '#00d09c',
                    dark: '#121212',
                    card: '#1e1e1e',
                    text: '#ffffff',
                    muted: '#8b8b8b'
                }
            }
        },
    },
    plugins: [],
}
