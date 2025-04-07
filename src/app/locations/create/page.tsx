'use client';

import { Typography, Container, Box, Button } from '@mui/material';
import LocationForm from '../../../components/LocationForm';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CreateLocationPage() {
  const router = useRouter();
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/locations')}
            sx={{ mr: 2 }}
          >
            Back to Locations
          </Button>
          
          <Typography variant="h4" component="h1" fontWeight="bold">
            Add New Location
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Fill out the form below to add a new roadway location to the system.
        </Typography>
        
        <Box mt={4}>
          <LocationForm />
        </Box>
      </Box>
    </Container>
  );
} 