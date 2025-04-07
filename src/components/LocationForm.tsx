'use client';

import { useState, useEffect } from 'react';
import { 
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

// Interface for the form data
interface LocationFormData {
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

// Direction options
const DIRECTIONS = ['NB', 'SB', 'EB', 'WB'];

// Common Arkansas counties (add more as needed)
const COMMON_COUNTIES = [
  'Pulaski',
  'Benton',
  'Washington',
  'Sebastian',
  'Faulkner',
  'Craighead',
  'Saline',
  'Garland',
  'Jefferson',
  'White',
  'Lonoke',
  'Pope',
  'Baxter',
  'Greene',
  'Crittenden',
  'Union'
].sort();

interface LocationFormProps {
  editMode?: boolean;
  initialData?: Partial<LocationFormData>;
}

export default function LocationForm({ editMode = false, initialData = {} }: LocationFormProps) {
  const router = useRouter();
  const [counties, setCounties] = useState<string[]>(COMMON_COUNTIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LocationFormData, string>>>({});
  
  // Initialize form data
  const [formData, setFormData] = useState<LocationFormData>({
    county: initialData.county || '',
    name: initialData.name || '',
    roadway: initialData.roadway || '',
    longitude: initialData.longitude || '',
    latitude: initialData.latitude || '',
    segment_length: initialData.segment_length || '',
    location: initialData.location || '',
    which_side: initialData.which_side || '',
    direction_of_travel: initialData.direction_of_travel || '',
    notes: initialData.notes || ''
  });

  // Fetch counties if needed (could be fetched from backend)
  useEffect(() => {
    // This could be replaced with an API call to get counties from backend
    // For now we're using the predefined list
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user changes it
    if (formErrors[name as keyof LocationFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LocationFormData, string>> = {};
    
    // Required fields
    if (!formData.county) errors.county = 'County is required';
    if (!formData.name) errors.name = 'Location ID is required';
    if (!formData.roadway) errors.roadway = 'Roadway is required';
    if (!formData.location) errors.location = 'Location description is required';
    
    // Number validations
    if (formData.longitude && !/^-?\d+(\.\d+)?$/.test(formData.longitude)) {
      errors.longitude = 'Must be a valid number';
    }
    
    if (formData.latitude && !/^-?\d+(\.\d+)?$/.test(formData.latitude)) {
      errors.latitude = 'Must be a valid number';
    }
    
    if (formData.segment_length && !/^\d+(\.\d+)?$/.test(formData.segment_length)) {
      errors.segment_length = 'Must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (editMode && initialData.name) {
        // Update existing location
        await api.locations.updateLocation(initialData.name, formData);
      } else {
        // Create new location
        await api.locations.createLocation(formData);
      }
      
      setSuccess(true);
      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/locations');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving location:', err);
      setError(err.message || 'Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" mb={3}>
        {editMode ? 'Edit Location' : 'Add New Location'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Location {editMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* County and Location ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="County"
              name="county"
              value={formData.county}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.county}
              helperText={formErrors.county}
              disabled={loading}
            >
              {counties.map(county => (
                <MenuItem key={county} value={county}>
                  {county}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location ID"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name || 'Unique identifier (e.g., P1, P2)'}
              disabled={loading || (editMode && !!initialData.name)}
            />
          </Grid>
          
          {/* Roadway and Location Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Roadway"
              name="roadway"
              value={formData.roadway}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.roadway}
              helperText={formErrors.roadway || 'Road or highway name'}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location Description"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.location}
              helperText={formErrors.location || 'Specific location details'}
              disabled={loading}
            />
          </Grid>
          
          {/* Latitude and Longitude */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.latitude}
              helperText={formErrors.latitude || 'Decimal degrees (e.g., 34.7498)'}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.longitude}
              helperText={formErrors.longitude || 'Decimal degrees (e.g., -92.2744)'}
              disabled={loading}
            />
          </Grid>
          
          {/* Segment Length */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Segment Length (mi)"
              name="segment_length"
              value={formData.segment_length}
              onChange={handleChange}
              fullWidth
              type="text"
              error={!!formErrors.segment_length}
              helperText={formErrors.segment_length}
              disabled={loading}
            />
          </Grid>
          
          {/* Direction of Travel and Which Side */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Direction of Travel"
              name="direction_of_travel"
              value={formData.direction_of_travel}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            >
              {DIRECTIONS.map(direction => (
                <MenuItem key={direction} value={direction}>
                  {direction}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>
              NB = Northbound, SB = Southbound, etc.
            </FormHelperText>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Which Side"
              name="which_side"
              value={formData.which_side}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            >
              {DIRECTIONS.map(direction => (
                <MenuItem key={direction} value={direction}>
                  {direction}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>
              Side of the road where device is located
            </FormHelperText>
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>
          
          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => router.push('/locations')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || success}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                {loading ? 'Saving...' : (editMode ? 'Update Location' : 'Add Location')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
} 