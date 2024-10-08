// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#6366f1', // Custom primary color
        },
        secondary: {
            main: '#4f46e5', // Custom secondary color
        },
    },
    typography: {
        button: {
            textTransform: 'none', // Keep button text case as-is
        },
    },
});

export default theme;
