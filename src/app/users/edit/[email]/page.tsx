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
        let userData = null;
        
        // First try to get user data from session storage
        if (typeof window !== 'undefined') {
          const storedData = sessionStorage.getItem('editUserData');
          if (storedData) {
            userData = JSON.parse(storedData);
            console.log('User data retrieved from session storage:', userData);
            
            // If the email matches, use this data
            if (userData.email === email) {
              setUserData(userData);
              setLoading(false);
              return;
            }
          }
        }
        
        // If we couldn't get data from session storage, fetch all users and find the matching one
        console.log('Fetching user data from API...');
        const usersData = await api.users.getUsers();
        
        if (usersData) {
          // Handle different response formats
          let users: any[] = [];
          
          // If response is an object with a users array
          if (typeof usersData === 'object' && usersData !== null && 'users' in usersData && Array.isArray(usersData.users)) {
            users = usersData.users;
          } 
          // If response is already an array
          else if (Array.isArray(usersData)) {
            users = usersData;
          }
          // If response is an object with email keys
          else if (typeof usersData === 'object' && usersData !== null) {
            users = Object.keys(usersData).map(key => ({
              email: key,
              ...(usersData as Record<string, any>)[key]
            }));
          }
          
          // Find the user with matching email
          const user = users.find(u => u.email === email);
          
          if (user) {
            console.log('Found user in API response:', user);
            setUserData(user);
          } else {
            // If user not found, create a minimal user object
            console.log('User not found in API, creating minimal data');
            setUserData({ email });
          }
        } else {
          // If no data returned, create a minimal user object
          setUserData({ email });
        }
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to load user details');
        
        // Still create a minimal user object so form can be displayed
        setUserData({ email });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    
    // Clear session storage data when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('editUserData');
      }
    };
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