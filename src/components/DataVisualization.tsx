'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  CircularProgress,
  Alert,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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

export default function DataVisualization() {
  const [data, setData] = useState<DataObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [chartType, setChartType] = useState<'collections' | 'volume'>('collections');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const responseData = await api.data.getCollections();
        
        if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
          setData(responseData as DataObject);
          
          // Set the first county as selected by default if there are counties
          const counties = [...new Set(responseData.collections.map(item => item.county))];
          if (counties.length > 0) {
            setSelectedCounty(counties[0]);
          }
        } else {
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

  // Prepare data for charts
  const prepareChartData = () => {
    if (!data) return null;

    const filteredData = selectedCounty 
      ? data.collections.filter(item => item.county === selectedCounty)
      : data.collections;

    // Seatbelt usage by county
    const countyData = data.collections.reduce((acc: any[], item) => {
      const existing = acc.find(x => x.county === item.county);
      if (existing) {
        existing[item.seatbelt_on.toLowerCase()]++;
      } else {
        acc.push({
          county: item.county,
          yes: item.seatbelt_on.toLowerCase() === 'yes' ? 1 : 0,
          no: item.seatbelt_on.toLowerCase() === 'no' ? 1 : 0,
          maybe: item.seatbelt_on.toLowerCase() === 'maybe' ? 1 : 0
        });
      }
      return acc;
    }, []);

    // Seatbelt usage by vehicle type
    const vehicleData = filteredData.reduce((acc: any[], item) => {
      const existing = acc.find(x => x.vehicle_type === item.vehicle_type);
      if (existing) {
        existing[item.seatbelt_on.toLowerCase()]++;
      } else {
        acc.push({
          vehicle_type: item.vehicle_type,
          yes: item.seatbelt_on.toLowerCase() === 'yes' ? 1 : 0,
          no: item.seatbelt_on.toLowerCase() === 'no' ? 1 : 0,
          maybe: item.seatbelt_on.toLowerCase() === 'maybe' ? 1 : 0
        });
      }
      return acc;
    }, []);

    // Seatbelt usage by gender
    const genderData = filteredData.reduce((acc: any[], item) => {
      const existing = acc.find(x => x.gender === item.gender);
      if (existing) {
        existing[item.seatbelt_on.toLowerCase()]++;
      } else {
        acc.push({
          gender: item.gender,
          yes: item.seatbelt_on.toLowerCase() === 'yes' ? 1 : 0,
          no: item.seatbelt_on.toLowerCase() === 'no' ? 1 : 0,
          maybe: item.seatbelt_on.toLowerCase() === 'maybe' ? 1 : 0
        });
      }
      return acc;
    }, []);

    return {
      countyData,
      vehicleData,
      genderData
    };
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
        <Alert severity="error">{error}</Alert>
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

  const chartData = prepareChartData();
  if (!chartData) return null;

  return (
    <Box>
     

      <Grid container spacing={3}>
        {/* Seatbelt Usage by County */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seatbelt Usage by County
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.countyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="county" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" name="Wearing Seatbelt" fill="#4CAF50" />
                  <Bar dataKey="no" name="Not Wearing Seatbelt" fill="#F44336" />
                  <Bar dataKey="maybe" name="Uncertain" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Seatbelt Usage by Vehicle Type */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seatbelt Usage by Vehicle Type
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.vehicleData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicle_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" name="Wearing Seatbelt" fill="#4CAF50" />
                  <Bar dataKey="no" name="Not Wearing Seatbelt" fill="#F44336" />
                  <Bar dataKey="maybe" name="Uncertain" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Seatbelt Usage by Gender */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seatbelt Usage by Gender
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.genderData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="gender" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" name="Wearing Seatbelt" fill="#4CAF50" />
                  <Bar dataKey="no" name="Not Wearing Seatbelt" fill="#F44336" />
                  <Bar dataKey="maybe" name="Uncertain" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 