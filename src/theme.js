import { createTheme } from '@mui/material/styles';

// Shared typography & shape settings
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  h4: { fontWeight: 700 },
  h6: { fontWeight: 600 },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
};

const shape = { borderRadius: 12 };

// ── Light Theme ──────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4a6fa5' },
    secondary: { main: '#e07a5f' },
    background: { default: '#f4f6f9', paper: '#ffffff' },
    text: { primary: '#1a1a2e', secondary: '#555568' },
    divider: '#e2e6ea',
  },
  typography,
  shape,
});

// ── Dark Theme ───────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7b9fd4' },
    secondary: { main: '#e07a5f' },
    background: { default: '#121220', paper: '#1e1e30' },
    text: { primary: '#e8e8ef', secondary: '#a0a0b8' },
    divider: '#33334d',
  },
  typography,
  shape,
});
