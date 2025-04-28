'use client';

import { Typography, Container, Box, Button } from '@mui/material';
import CountyLocationsTables from '../../components/CountyLocationsTables';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

export default function LocationsPage() {
  const router = useRouter();
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Location Management
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/locations/create')}
            >
              Add Location
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          View roadway locations by county. Select a county button to see the locations in that county.
        </Typography>
        
        <Box mt={4}>
          <CountyLocationsTables />
        </Box>
      </Box>
    </Container>
  );
} 