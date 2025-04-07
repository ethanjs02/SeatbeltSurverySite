'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Breadcrumbs, CircularProgress, Alert } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserForm from '../../../../components/UserForm';
import { api } from '../../../../services/api';

export default function EditUserPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if the getUser method is implemented
        if (!api.users.getUser) {
          // If not implemented, we'll create a minimal user object with just the email
          // In a real application, you would implement the getUser method
          setUserData({ email });
          setLoading(false);
          return;
        }
        
        const data = await api.users.getUser(email);
        setUserData(data);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [email]);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/dashboard" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Link href="/users" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          Users
        </Link>
        <Typography color="text.primary">Edit User</Typography>
      </Breadcrumbs>
      
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Edit User: {email}
      </Typography>
      
      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* User Form */}
      {!loading && !error && userData && (
        <Box sx={{ mt: 4 }}>
          <UserForm editMode={true} initialData={userData} />
        </Box>
      )}
    </Container>
  );
} 