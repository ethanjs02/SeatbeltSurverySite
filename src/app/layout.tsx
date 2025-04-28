'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import theme from '../theme/theme';
import '../app/globals.css';
import AuthProvider, { useAuth } from '../contexts/AuthContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AR Seatbelt Data Admin Site',
  description: 'Data collection and visualization app',
  icons: {
    icon: '/favicon.png',
  },
};

// Internal AppContent component to use auth context
function AppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect back to login on logout
  };
  
  const handleViewData = () => {
    // Future implementation
  };

  // Check if the current page is the dashboard
  const isDashboard = pathname === '/dashboard';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* AppBar (Header) */}
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Title */}
          <Typography variant="h6">Seatbelt Tracker</Typography>

          {/* Show buttons only on the dashboard and when authenticated */}
          {isDashboard && isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              
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
  );
}

// Root layout that provides auth context
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
