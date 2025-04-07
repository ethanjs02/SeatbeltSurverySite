'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import MapIcon from '@mui/icons-material/Place';
import { api } from '../services/api';

// Define the Location interface based on your backend data structure
interface Location {
  id?: string;      // May not be present if using another key (like name)
  name: string;     // This seems to be a required field
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: string;
  enabled?: boolean; // Added this since the locations might use the same format as users
  url?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
}

export default function LocationsTable() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await api.locations.getLocations();
        
        // Check if we got location data
        if (locationsData) {
          // Transform the response into an array of locations if it's not already
          let transformedLocations;
          
          if (Array.isArray(locationsData)) {
            transformedLocations = locationsData;
          } else if (typeof locationsData === 'object') {
            // If it's an object, convert it to an array
            // Define the expected structure of the response
            interface LocationResponse {
              [key: string]: Location;
            }
            
            transformedLocations = Object.keys(locationsData as LocationResponse).map(key => ({
              id: key, // Use the key as ID if missing
              ...(locationsData as LocationResponse)[key]
            }));
          } else {
            throw new Error('Unexpected data format');
          }
          
          setLocations(transformedLocations);
          console.log('Fetched locations:', transformedLocations);
        } else {
          console.error('No location data received');
          setError('No location data received from server');
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} bgcolor="#fff5f5" borderRadius={1}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!locations.length) {
    return (
      <Box p={3} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography>No locations found.</Typography>
      </Box>
    );
  }

  // Function to format the full address
  const formatAddress = (location: Location) => {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.zipCode,
      location.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Function to open Google Maps with the location coordinates
  const openInMaps = (location: Location) => {
    if (location.latitude && location.longitude) {
      window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank');
    } else if (location.address) {
      // If no coordinates, try to search by address
      window.open(`https://maps.google.com/?q=${encodeURIComponent(formatAddress(location))}`, '_blank');
    }
  };

  const getStatusColor = (location: Location) => {
    // First check status field
    if (location.status === 'active') return 'success.light';
    if (location.status === 'inactive') return 'warning.light';
    
    // If no status, check enabled field
    if (location.enabled === true) return 'success.light';
    if (location.enabled === false) return 'error.light';
    
    return 'grey.300'; // Default
  };

  const getStatusTextColor = (location: Location) => {
    // First check status field
    if (location.status === 'active') return 'success.dark';
    if (location.status === 'inactive') return 'warning.dark';
    
    // If no status, check enabled field
    if (location.enabled === true) return 'success.dark';
    if (location.enabled === false) return 'error.dark';
    
    return 'text.secondary'; // Default
  };

  const getStatusText = (location: Location) => {
    // First check status field
    if (location.status === 'active') return 'Active';
    if (location.status === 'inactive') return 'Inactive';
    
    // If no status, check enabled field
    if (location.enabled === true) return 'Enabled';
    if (location.enabled === false) return 'Disabled';
    
    return 'Unknown';
  };

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }} aria-label="locations table">
        <TableHead sx={{ bgcolor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id || location.name} hover>
              <TableCell>
                <Typography fontWeight="medium">{location.name}</Typography>
                {location.description && (
                  <Typography variant="caption" color="text.secondary">
                    {location.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{formatAddress(location)}</TableCell>
              <TableCell>
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: getStatusColor(location),
                    color: getStatusTextColor(location),
                  }}
                >
                  {getStatusText(location)}
                </Box>
              </TableCell>
              <TableCell>
                {location.createdAt 
                  ? new Date(location.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  {location.url && (
                    <Tooltip title="Visit site">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => window.open(location.url, '_blank')}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="View on map">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => openInMaps(location)}
                    >
                      <MapIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 