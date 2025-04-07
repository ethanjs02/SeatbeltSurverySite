'use client';

import { Box, Container, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import UserForm from '../../../components/UserForm';

export default function AddUserPage() {
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
        <Typography color="text.primary">Add New User</Typography>
      </Breadcrumbs>
      
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Add New User
      </Typography>
      
      {/* User Form */}
      <Box sx={{ mt: 4 }}>
        <UserForm />
      </Box>
    </Container>
  );
} 