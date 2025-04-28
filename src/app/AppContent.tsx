'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import theme from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

export default function AppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isDashboard = pathname === '/dashboard';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Seatbelt Tracker</Typography>
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

      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        {children}
      </Container>
    </ThemeProvider>
  );
}
