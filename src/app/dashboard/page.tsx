'use client';

import React from 'react';
import { Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login'); // Redirect back to login on logout
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '50px' }}>
      <Typography variant="h3" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1">Welcome to the dashboard! Here you can manage users and locations.</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout} style={{ marginTop: '20px' }}>
        Logout
      </Button>
      
    </Container>
  );
};

export default Dashboard;
