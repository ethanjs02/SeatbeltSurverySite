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
  Chip,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '../services/api';

// Define the types for our data structure
interface CollectionItem {
  timestamp: string;
  latitude: string;
  longitude: string;
  county: string;
  site: string;
  observer: string;
  role: string;
  seatbelt_on: string;
  gender: string;
  vehicle_type: string;
}

interface VolumeItem {
  timestamp: string;
  latitude: string;
  longitude: string;
  county: string;
  site: string;
  observer: string;
  count: string;
  time_start: string;
  time_end: string;
}

interface DataObject {
  collections: CollectionItem[];
  volume: VolumeItem[];
}

export default function DataTable() {
  const [data, setData] = useState<DataObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For county filtering
  const [counties, setCounties] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  
  // For data type tabs
  const [activeTab, setActiveTab] = useState<'collections' | 'volume'>('collections');
  
  // For search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filtered data to display
  const [filteredCollections, setFilteredCollections] = useState<CollectionItem[]>([]);
  const [filteredVolume, setFilteredVolume] = useState<VolumeItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const responseData = await api.data.getCollections();
        
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
          // Cast to DataObject
          const apiData = responseData as DataObject;
          setData(apiData);
          
          // Extract unique counties from the data
          const collectionsCounties = apiData.collections.map(item => item.county);
          const volumeCounties = apiData.volume.map(item => item.county);
          const uniqueCounties = [...new Set([...collectionsCounties, ...volumeCounties])].sort();
          
          setCounties(uniqueCounties);
          
          // Set the first county as selected by default if there are counties
          if (uniqueCounties.length > 0) {
            setSelectedCounty(uniqueCounties[0]);
          }
          
          console.log('Fetched data:', apiData);
        } else {
          console.error('Unexpected data format:', responseData);
          setError('Received invalid data format from server');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data based on selected county and search term
  useEffect(() => {
    if (!data) return;
    
    // Filter collections data
    let filteredColls = data.collections;
    
    // Filter by county if one is selected
    if (selectedCounty) {
      filteredColls = filteredColls.filter(item => item.county === selectedCounty);
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredColls = filteredColls.filter(item => 
        item.site.toLowerCase().includes(term) ||
        item.observer.toLowerCase().includes(term) ||
        item.role.toLowerCase().includes(term) ||
        item.vehicle_type.toLowerCase().includes(term) ||
        item.gender.toLowerCase().includes(term)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredColls = [...filteredColls].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setFilteredCollections(filteredColls);
    
    // Filter volume data
    let filteredVols = data.volume;
    
    // Filter by county if one is selected
    if (selectedCounty) {
      filteredVols = filteredVols.filter(item => item.county === selectedCounty);
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredVols = filteredVols.filter(item => 
        item.site.toLowerCase().includes(term) ||
        item.observer.toLowerCase().includes(term) ||
        item.count.toLowerCase().includes(term)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredVols = [...filteredVols].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setFilteredVolume(filteredVols);
    
  }, [data, selectedCounty, searchTerm]);

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county);
  };

  const handleTabChange = (tab: 'collections' | 'volume') => {
    setActiveTab(tab);
  };
  
  // Format date for better readability
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  if (!data) {
    return (
      <Box p={3} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography>No data found.</Typography>
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
          <Button
            variant={selectedCounty === '' ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleCountyChange('')}
            sx={{ 
              mb: 1,
              bgcolor: selectedCounty === '' ? 'primary.main' : 'transparent',
              color: selectedCounty === '' ? 'white' : 'primary.main',
            }}
          >
            All Counties
          </Button>
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
              }}
            >
              {county}
            </Button>
          ))}
        </Box>
      </Box>
      
      {/* Data Type Tabs */}
      <Box mb={2}>
        <Tabs 
          value={activeTab} 
          onChange={(_, value) => handleTabChange(value)}
          aria-label="data type tabs"
        >
          <Tab 
            label={`Collections (${filteredCollections.length})`} 
            value="collections" 
          />
          <Tab 
            label={`Volume (${filteredVolume.length})`} 
            value="volume" 
          />
        </Tabs>
      </Box>
      
      {/* Search Box */}
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" component="h2">
              {selectedCounty ? `${selectedCounty} County` : 'All Counties'} {activeTab === 'collections' ? 'Collections' : 'Volume'} Data
            </Typography>
            <Chip 
              label={activeTab === 'collections' ? 
                `${filteredCollections.length} records` : 
                `${filteredVolume.length} records`}
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
            placeholder="Search by site, observer, vehicle type..."
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
      
      {/* Collections Table */}
      {activeTab === 'collections' && (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="collections table">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>County</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Site</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Observer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vehicle Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Gender</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seatbelt</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCollections.length > 0 ? (
                filteredCollections.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                    <TableCell>{item.county}</TableCell>
                    <TableCell>{item.site}</TableCell>
                    <TableCell>{item.observer}</TableCell>
                    <TableCell>{item.vehicle_type}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{item.seatbelt_on}</TableCell>
                    <TableCell>
                      {item.latitude !== "0.0" && item.longitude !== "0.0" 
                        ? `${item.latitude}, ${item.longitude}` 
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" py={2}>No collection data found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Volume Table */}
      {activeTab === 'volume' && (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="volume table">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>County</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Site</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Observer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Count</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time Period</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVolume.length > 0 ? (
                filteredVolume.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                    <TableCell>{item.county}</TableCell>
                    <TableCell>{item.site}</TableCell>
                    <TableCell>{item.observer}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>
                      {formatDate(item.time_start)} - {formatDate(item.time_end)}
                    </TableCell>
                    <TableCell>
                      {item.latitude !== "0.0" && item.longitude !== "0.0" 
                        ? `${item.latitude}, ${item.longitude}` 
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" py={2}>No volume data found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}