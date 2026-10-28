// Tailwind v3 config for the game page (index.html).
// Rebuild assets/tailwind.css after changing classes in index.html – see README.md.
module.exports = {
    content: ['./index.html'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                golf: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    dark: '#08170e'
                }
            }
        }
    }
};
