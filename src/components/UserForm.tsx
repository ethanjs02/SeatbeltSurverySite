'use client';

import { useState } from 'react';
import { 
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

// Interface for the form data
interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  enabled: boolean;
}

interface UserFormProps {
  editMode?: boolean;
  initialData?: Partial<UserFormData>;
}

export default function UserForm({ editMode = false, initialData = {} }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  
  // Initialize form data
  const [formData, setFormData] = useState<UserFormData>({
    email: initialData.email || '',
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    enabled: initialData.enabled !== undefined ? initialData.enabled : true
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user changes it
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle switch toggle for enabled status
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      enabled: e.target.checked
    }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};
    
    // Required fields
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
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
      // Create base user data with common fields
      const baseUserData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      if (editMode && initialData.email) {
        // Update existing user - exclude enabled status
        console.log('Updating user:', baseUserData);
        await api.users.updateUser(initialData.email, formData.first_name, formData.last_name);
      } else {
        // Create new user - include enabled status
        const createUserData = {
          ...baseUserData,
          enabled: formData.enabled
        };
        console.log('Creating new user:', createUserData);
        await api.users.createUser(createUserData);
      }
      
      setSuccess(true);
      
      // Clear session storage data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('editUserData');
      }
      
      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving user:', err);
      
      // Handle specific error cases based on API response
      if (err.message && err.message.includes('already exists')) {
        setError(`A user with this email already exists. Please use a different email address.`);
      } else if (err.message && err.message.includes('must be provided')) {
        setError(`Required fields are missing. Please make sure all required fields are filled.`);
      } else if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        setError(`You don't have permission to perform this action. Please check your authorization.`);
      } else if (err.message && err.message.toLowerCase().includes('internal server error')) {
        setError(`The server encountered an internal error. Please try again or contact support if the issue persists.`);
      } else {
        setError(err.message || 'Failed to save user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" mb={3}>
        {editMode ? 'Edit User' : 'Add New User'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User {editMode ? 'updated' : 'created'} successfully! Redirecting...
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Email */}
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading || (editMode && !!initialData.email)}
              autoComplete="email"
            />
          </Grid>
          
          {/* First and Last Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.first_name}
              helperText={formErrors.first_name}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.last_name}
              helperText={formErrors.last_name}
              disabled={loading}
            />
          </Grid>
          
          {/* Enabled Status */}
          <Grid item xs={12}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={formData.enabled}
                  onChange={handleSwitchChange}
                  name="enabled"
                  color="primary"
                  disabled={loading}
                />
              } 
              label="Account Enabled"
              sx={{ height: '100%', display: 'flex', alignItems: 'center' }}
            />
          </Grid>
          
          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => router.push('/users')}
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
                {loading ? 'Saving...' : (editMode ? 'Update User' : 'Add User')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
} 