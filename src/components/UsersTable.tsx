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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

// Define the User interface based on your backend data structure
interface User {
  email: string;  // Using email as the key/ID
  first_name?: string;
  last_name?: string;
  enabled?: boolean;  // Changed from status to enabled
  role?: string;
  createdAt?: string;
  lastLogin?: string;
}

export default function UsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.users.getUsers();
      
      // Check if we got user data
      if (usersData) {
        // Transform the response into an array of users if it's not already
        let transformedUsers;
        
        if (Array.isArray(usersData)) {
          transformedUsers = usersData;
        } else if (typeof usersData === 'object') {
          // If it's an object, convert it to an array
          // Define the expected structure of the response
          interface UserResponse {
            [email: string]: {
              first_name?: string;
              last_name?: string;
              enabled?: boolean;
              role?: string;
              createdAt?: string;
              lastLogin?: string;
            }
          }
          
          transformedUsers = Object.keys(usersData as UserResponse).map(email => ({
            email,
            ...(usersData as UserResponse)[email]
          }));
        } else {
          throw new Error('Unexpected data format');
        }
        
        setUsers(transformedUsers);
        console.log('Fetched users:', transformedUsers);
      } else {
        console.error('No user data received');
        setError('No user data received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      // Implement the deleteUser API call
      // This would require adding the method to the api.users object
      if (api.users.deleteUser) {
        await api.users.deleteUser(userToDelete.email);
        // Refresh the user list
        await fetchUsers();
      } else {
        throw new Error('Delete user function not implemented');
      }
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to open the delete confirmation dialog
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Function to go to the add user page
  const goToAddUser = () => {
    router.push('/users/add');
  };

  // Function to go to the edit user page
  const goToEditUser = (email: string) => {
    router.push(`/users/edit/${encodeURIComponent(email)}`);
  };

  // Get role display name
  const getRoleDisplayName = (role?: string) => {
    switch(role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Standard User';
      case 'readonly': return 'Read Only';
      default: return role || 'N/A';
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

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={goToAddUser}
        >
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Login</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" py={2}>No users found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.email} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: user.enabled ? 'success.light' : 'error.light',
                        color: user.enabled ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {user.enabled ? 'Enabled' : 'Disabled'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => goToEditUser(user.email)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm User Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the user {userToDelete?.email}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : undefined}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 