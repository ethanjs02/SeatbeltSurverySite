'use client';

import React, { useState } from 'react';
import { Button, TextField, Typography, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual authentication logic
    if (email && password) {
      router.push('/dashboard'); // Redirect to dashboard on successful login
    } else {
      alert('Please enter email and password.');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <Typography variant="h4" gutterBottom>Admin Login</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          Login
        </Button>
      </form>
    </Container>
  );
};

export default LoginPage;
