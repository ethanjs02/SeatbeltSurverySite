// src/app/layout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container } from '@mui/material';
import theme from '../theme/theme';
import '../app/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
 // Check if current page is login

  return (
    <html lang="en">
      <body>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Hide AppBar on Login Page */}
        
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" justifyContent={"center"}>Seatbelt Tracker</Typography>
            </Toolbar>
          </AppBar>
        

        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
          {children}
        </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
