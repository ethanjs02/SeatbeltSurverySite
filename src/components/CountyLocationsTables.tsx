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
  Chip,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import MapIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

// Define the Location interface based on the JSON example
interface Location {
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

// Interface for our county data structure
interface CountyData {
  [county: string]: Location[];
}

export default function CountyLocationsTables() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [counties, setCounties] = useState<string[]>([]);
  const [locationsData, setLocationsData] = useState<CountyData>({});
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await api.locations.getLocations();
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // Cast to CountyData after verifying it's an object but not an array
          const countyData = data as CountyData;
          setLocationsData(countyData);
          
          // Get the list of counties
          const countyNames = Object.keys(countyData).sort();
          setCounties(countyNames);
          
          // Set the first county as selected by default
          if (countyNames.length > 0) {
            setSelectedCounty(countyNames[0]);
          }
          
          console.log('Fetched locations by county:', countyData);
        } else {
          console.error('Unexpected data format:', data);
          setError('Received invalid data format from server');
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

  // Filter locations based on search term whenever selected county or search term changes
  useEffect(() => {
    if (selectedCounty && locationsData[selectedCounty]) {
      if (!searchTerm) {
        setFilteredLocations(locationsData[selectedCounty]);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = locationsData[selectedCounty].filter(location => 
          location.name.toLowerCase().includes(term) ||
          location.roadway.toLowerCase().includes(term) ||
          location.location.toLowerCase().includes(term) ||
          location.notes.toLowerCase().includes(term)
        );
        setFilteredLocations(filtered);
        
      }
    }
  }, [selectedCounty, searchTerm, locationsData]);
  

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
    setSearchTerm(''); // Reset search when switching counties
  };
  
  // Function to open Google Maps with the location coordinates
  const openInMaps = (location: Location) => {
    if (location.latitude && location.longitude) {
      window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank');
    }
  };

  const handleDelete = (location: Location) => {
    setSelectedLocation(location);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedLocation) {
      try {
        setDeleteLoading(true);
        // Pass the site as an object with county and name properties
        await api.locations.deleteLocation([{
          county: selectedLocation.county, 
          name: selectedLocation.name
        }]);
        const updatedLocations = locationsData[selectedCounty].filter(l => l.name !== selectedLocation.name);
        setLocationsData({ ...locationsData, [selectedCounty]: updatedLocations });
        setFilteredLocations(updatedLocations);
        setSelectedLocation(null);
        setOpenDeleteDialog(false);
      } catch (err) {
        console.error('Error deleting location:', err);
        setError('Failed to delete location. Please try again later.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  

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

  if (counties.length === 0) {
    return (
      <Box p={3} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography>No location data found.</Typography>
      </Box>
    );
  }

  

  return (
    <Box>

      
      
      {/* County Selection */}
      <Box mb={4} sx={{ overflowX: 'auto' }}>
        <Typography variant="subtitle1" fontWeight="medium" mb={1}>
          Select a County:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {counties.map(county => (
            <Button
              key={county}
              variant={selectedCounty === county ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleCountyChange(county)}
              sx={{ 
                mb: 1,
                bgcolor: selectedCounty === county ? 'primary.main' : 'transparent',
                color: selectedCounty === county ? 'white' : 'primary.main',
                borderWidth: selectedCounty === county ? 0 : 1,
                fontWeight: selectedCounty === county ? 'bold' : 'normal',
                '&:hover': {
                  bgcolor: selectedCounty === county ? 'primary.dark' : 'rgba(25, 118, 210, 0.04)',
                }
              }}
              size={isMobile ? "small" : "medium"}
            >
              {county}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Locations Table for Selected County */}
      {selectedCounty && locationsData[selectedCounty] && (
        <Box>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6" component="h2">
                  {selectedCounty} County Locations
                </Typography>
                <Chip 
                  label={`${filteredLocations.length} of ${locationsData[selectedCounty].length}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by ID, roadway, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: isMobile ? 400 : 650 }} aria-label="locations table">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Roadway</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Direction</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Length</TableCell>
                    </>
                  )}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Map</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Images</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <TableRow key={location.name} hover>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.roadway}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{location.location}</Typography>
                        {!isMobile && location.notes && (
                          <Typography variant="caption" color="text.secondary">
                            Note: {location.notes}
                          </Typography>
                        )}
                        {isMobile && (
                          <Box mt={0.5}>
                            <Typography variant="caption" display="block">
                              Direction: {location.direction_of_travel}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Length: {location.segment_length} mi
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>
                            {location.direction_of_travel} 
                            {location.which_side && location.which_side !== location.direction_of_travel && 
                              ` (${location.which_side})`}
                          </TableCell>
                          <TableCell>{location.segment_length} mi</TableCell>
                        </>
                      )}
                      <TableCell>
                        <Tooltip title="View on Map">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => openInMaps(location)}
                          >
                            <MapIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => router.push(`/locations/edit/${encodeURIComponent(location.name)}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(location)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                      <Tooltip title="Manage Images">
                       <IconButton onClick={() => router.push(`/locations/images/${location.county}/${location.name}`)}>
                        <ImageIcon fontSize="small" />
                       </IconButton>
                        </Tooltip>

                      </TableCell>
                      
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 5 : 7} align="center">
                      <Typography py={2}>
                        No locations match your search. Try a different search term.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Location Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the location "{selectedLocation?.name}" in {selectedCounty} County? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            color="primary"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : undefined}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 