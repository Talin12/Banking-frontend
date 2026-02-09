import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider
      defaultColorScheme="dark"
      theme={{
        colorScheme: 'dark',
        primaryColor: 'blue',
        colors: {
          dark: [
            '#d5d7e0',
            '#acaebf',
            '#8c8fa3',
            '#666980',
            '#4d4f66',
            '#34354a',
            '#2b2c3d',
            '#1d1e30',
            '#141527',
            '#0c0d1a',
          ],
        },
        radius: {
          md: '12px',
          lg: '16px',
        },
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);