import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './global.css';

// Royal Dark palette
const ROYAL = {
  background: '#0B0E14',
  surface: 'rgba(30, 41, 59, 0.7)',
  gold: '#D4AF37',
  goldLight: '#F5D0A9',
  goldDark: '#B8960C',
  royalBlue: '#1E3A5F',
  emerald: '#0D9488',
  text: '#E2E8F0',
  textMuted: '#94A3B8',
  border: 'rgba(212, 175, 55, 0.25)',
  borderSilver: 'rgba(226, 232, 240, 0.12)',
};

const theme = createTheme({
  defaultColorScheme: 'dark',
  primaryColor: 'gold',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  colors: {
    dark: [
      ROYAL.text,
      ROYAL.textMuted,
      '#64748B',
      '#475569',
      '#334155',
      '#1E293B',
      '#1E293B',
      '#0F172A',
      '#0B0E14',
      '#070A0E',
    ],
    gold: [
      '#FEF9E7',
      ROYAL.goldLight,
      '#E8C547',
      ROYAL.gold,
      ROYAL.goldDark,
      '#9A7B0A',
      '#7C6409',
      '#5E4D07',
      '#403606',
      '#221E04',
    ],
    emerald: [
      '#CCFBF1',
      '#99F6E4',
      '#5EEAD4',
      ROYAL.emerald,
      '#0F766E',
      '#115E59',
      '#134E4A',
      '#134E4A',
      '#134E4A',
      '#042F2E',
    ],
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px' },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: () => ({
        root: {
          transition: 'all 0.2s ease',
          '&:not([data-disabled]):hover': {
            boxShadow: `0 0 20px ${ROYAL.gold}40`,
          },
        },
      }),
    },
    Paper: {
      defaultProps: {
        style: {
          background: ROYAL.surface,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${ROYAL.border}`,
        },
      },
    },
    AppShell: {
      styles: () => ({
        main: {
          backgroundColor: ROYAL.background,
        },
      }),
    },
    Input: {
      styles: () => ({
        input: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderColor: ROYAL.borderSilver,
          color: ROYAL.text,
          '&:focus': {
            borderColor: ROYAL.gold,
            boxShadow: `0 0 0 1px ${ROYAL.gold}60`,
          },
        },
      }),
    },
  },
  other: {
    royal: ROYAL,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
