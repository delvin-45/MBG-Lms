module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Menjadikan 'Inter' sebagai font default untuk seluruh teks
                sans: ['Inter', 'sans-serif'], 
            },
        },
    },
    plugins: [],
}