'use client';

import { Typography, Container, Box, Button } from '@mui/material';
import UsersTable from '../../components/UsersTable';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function UsersPage() {
  const router = useRouter();
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            User Management
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          View, manage, and create users in the system.
        </Typography>
        
        <Box mt={4}>
          <UsersTable />
        </Box>
      </Box>
    </Container>
  );
} 