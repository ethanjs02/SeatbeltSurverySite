'use client';

import { useState, useEffect } from 'react';
import { Typography, Container, Box, Button, CircularProgress, Alert } from '@mui/material';
import LocationForm from '../../../../components/LocationForm';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../../../../services/api';
import { use } from 'react';

interface LocationData {
  county: string;
  name: string;
  roadway: string;
  longitude: string;
  latitude: string;
  segment_length: string;
  location: string;
  which_side: string;
  direction_of_travel: string;
  notes: string;
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default function EditLocationPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  
  // Unwrap params using React.use()
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const locations = await api.locations.getLocations();
        
        // Find the location with matching name
        let foundLocation: LocationData | null = null;
        
        // Iterate through counties to find the location
        Object.values(locations).forEach((countyLocations: LocationData[]) => {
          const location = countyLocations.find(loc => loc.name === decodedName);
          if (location) {
            foundLocation = location;
          }
        });
        
        if (foundLocation) {
          setLocationData(foundLocation);
        } else {
          setError('Location not found');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Failed to load location data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [decodedName]);

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
            Edit Location
          </Typography>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : locationData ? (
          <Box mt={4}>
            <LocationForm editMode={true} initialData={locationData} />
          </Box>
        ) : null}
      </Box>
    </Container>
  );
} 