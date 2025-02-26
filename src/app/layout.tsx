'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import theme from '../theme/theme';
import '../app/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login'); // Redirect back to login on logout
  };
  const handleViewData = () => {

  }

  // Check if the current page is the dashboard
  const isDashboard = pathname === '/dashboard';

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {/* AppBar (Header) */}
          <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Title */}
              <Typography variant="h6">Seatbelt Tracker</Typography>

              {/* Show buttons only on the dashboard */}
              {isDashboard && (
                <Box sx={{ display: 'flex', gap: 3 }}>
                <Link href="/data" passHref>
                  <Typography variant="body1" sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'white' }}>
                    View Data
                  </Typography>
                </Link>
                <Typography
                  variant="body1"
                  sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'white' }}
                  onClick={handleLogout}
                >
                  Logout
                </Typography>
              </Box>
            )}
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          <Container maxWidth="lg" style={{ marginTop: '20px' }}>
            {children}
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
