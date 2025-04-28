'use client';

import { useState } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid
} from '@mui/material';
import DataTable from '../../components/DataTable';
import DataVisualization from '../../components/DataVisualization';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { api } from '../../services/api';
import { apiAuth } from '../../services/apiAuth';

export default function DataPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [downloading, setDownloading] = useState(false);
  
  // Generate array of years from 2020 to current year
  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => (2022 + i).toString()
  );

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`https://1z9u2pel1h.execute-api.us-east-2.amazonaws.com/dev/admin/data/export-data?year=${selectedYear}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await apiAuth.getToken()}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the binary data as a blob
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `seatbelt-data-${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading data:', err);
      alert('Failed to download data. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Data Collections
          </Typography>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Export Excel'}
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
          View and analyze collected data.
        </Typography>
        
        <Box mt={4}>
          <DataVisualization />
        </Box>
        
        <Box mt={4}>
          <DataTable />
        </Box>
      </Box>
    </Container>
  );
} 