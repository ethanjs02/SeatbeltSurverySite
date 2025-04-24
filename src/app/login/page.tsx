'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Alert, 
  CircularProgress, 
  Paper, 
  Box, 
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useRouter } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Check for stored credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Display Cognito config for debugging
  useEffect(() => {
    const configInfo = {
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'not set',
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID 
        ? `${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID.split('_')[0]}_****` 
        : 'not set',
      clientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID 
        ? `${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID.substring(0, 4)}****` 
        : 'not set',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'not set',
      env: process.env.NEXT_PUBLIC_ENV || 'not set'
    };
    setDebugInfo(`Configuration: ${JSON.stringify(configInfo, null, 2)}`);
  }, []);

  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const mapCognitoErrorToMessage = (errorMsg: string) => {
    if (errorMsg.includes('Incorrect username or password')) {
      return 'Incorrect email or password. Please try again.';
    } else if (errorMsg.includes('User is not confirmed')) {
      return 'Your account is not confirmed. Please check your email for a confirmation link.';
    } else if (errorMsg.includes('User does not exist')) {
      return 'No account found with this email address.';
    } else if (errorMsg.includes('Password attempts exceeded')) {
      return 'Too many failed attempts. Please try again later or reset your password.';
    } else {
      return errorMsg;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setDebugInfo(`Attempting login with ${email}...`);

    try {
      console.log('Login attempt started');
      await login({ email, password });
      console.log('Login successful');
      setDebugInfo('Login successful! Redirecting...');
      
      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      // Router redirect is handled in the useEffect that watches isAuthenticated
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please try again.';
      setError(mapCognitoErrorToMessage(errorMessage));
      setDebugInfo(`Login failed: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      py: 4
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: '100%', 
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Box sx={{ 
          mb: 3,
          p: 2,
          bgcolor: 'primary.main', 
          borderRadius: '50%',
          color: 'white'
        }}>
          <LockOutlinedIcon fontSize="large" />
        </Box>
        
        <Typography variant="h4" gutterBottom fontWeight="500">
          Seatbelt Admin Login
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom mb={3}>
          Enter your credentials to access the admin dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        

        
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!emailError}
            helperText={emailError}
            autoComplete="email"
            InputProps={{
              autoComplete: 'email'
            }}
          />
          
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!passwordError}
            helperText={passwordError}
            autoComplete="current-password"
            InputProps={{
              autoComplete: 'current-password',
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
            />
            
            <MuiLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                // Show a message for now since we don't have password reset implemented yet
                alert('Password reset functionality will be implemented in the future.');
              }}
              variant="body2"
            >
              Forgot password?
            </MuiLink>
          </Box>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontSize: '1rem'
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>
        </form>
        
        <Typography variant="body2" color="text.secondary" align="center" mt={2}>
          This is a secure area. Unauthorized access is prohibited and may be subject to legal action.
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
