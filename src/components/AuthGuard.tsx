'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUserData } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the context's refresh method to check authentication
        await refreshUserData();
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };

    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }

    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, refreshUserData, router]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard; 