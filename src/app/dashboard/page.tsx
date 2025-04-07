'use client';

import React from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardActions 
} from '@mui/material';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorageIcon from '@mui/icons-material/Storage';

const Dashboard = () => {
  const router = useRouter();

  const dashboardItems = [
    {
      title: 'Users',
      description: 'Manage user accounts and permissions',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      action: () => router.push('/users')
    },
    {
      title: 'Locations',
      description: 'Manage site locations and addresses',
      icon: <LocationOnIcon fontSize="large" color="primary" />,
      action: () => router.push('/locations')
    },
    {
      title: 'Data Collections',
      description: 'View and upload data to collections',
      icon: <StorageIcon fontSize="large" color="primary" />,
      action: () => router.push('/data')
    }
  ];

  return (
    <AuthGuard>
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" mb={4} textAlign="center">
            Admin Dashboard
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {dashboardItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    },
                    maxWidth: 350,
                    mx: 'auto'
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4
                  }}>
                    <Box mb={3}>
                      {React.cloneElement(item.icon, { fontSize: 'large', style: { fontSize: '3rem' } })}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button 
                      size="large" 
                      variant="contained" 
                      onClick={item.action}
                      sx={{ 
                        px: 4, 
                        py: 1,
                        fontWeight: 'bold',
                        borderRadius: 2
                      }}
                    >
                      Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </AuthGuard>
  );
};

export default Dashboard;
