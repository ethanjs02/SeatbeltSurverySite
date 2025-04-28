// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// Custom MUI Theme
const theme = createTheme({
  palette: {
    mode: 'dark', // Switch to dark mode
    primary: {
      main: '#D2042D', // Custom primary color (red)
    },
    secondary: {
      main: '#D2042D', // Keep secondary color consistent
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E',   // Slightly lighter for cards/panels
    },
    text: {
      primary: '#FFFFFF', // White text for better contrast
      secondary: '#BDBDBD', // Light gray for subtler text
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#FFFFFF', // Ensuring headers stay visible
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    body1: {
      fontSize: '1rem',
      color: '#BDBDBD', // Light gray text for readability
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded corners for all buttons
          textTransform: 'none', // Prevent uppercase text
          backgroundColor: '#D2042D', // Red buttons
          color: '#FFFFFF', // White text on buttons
          '&:hover': {
            backgroundColor: '#E53935', // Slightly lighter red on hover
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#BDBDBD', // Light gray for input fields
          borderRadius: '8px',
          '& input': {
            color: '#000000', // Dark text inside input fields
          },
        },
      },
    },
  },
});

export default theme;
