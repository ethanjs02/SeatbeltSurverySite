// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// Custom MUI Theme
const theme = createTheme({
  palette: {
    mode: 'light', // Switch to 'dark' for dark mode
    primary: {
      main: '#D2042D', // Custom primary color (blue)
    },
    secondary: {
      main: '#9c27b0', // Custom secondary color (purple)
    },
    background: {
      default: '#f4f6f8', // App background color
      paper: '#ffffff',   // Card/paper background
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded corners for all buttons
          textTransform: 'none', // Prevent uppercase text
        },
      },
    },
  },
});

export default theme;
