import React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

interface AddEntityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { [key: string]: string }) => void;
  entityType: string;
}

const AddEntityModal: React.FC<AddEntityModalProps> = ({ open, onClose, onSubmit, entityType }) => {
  const [formData, setFormData] = React.useState<{ [key: string]: string }>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="modal-title" variant="h6" mb={2}>
          Add New {entityType}
        </Typography>

        {entityType === 'User' ? (
          <>
            <TextField fullWidth label="First Name" name="firstName" onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Last Name" name="lastName" onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Email" name="email" onChange={handleChange} margin="normal" />
          </>
        ) : (
          <>
            <TextField fullWidth label="Location Name" name="locationName" onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Address" name="address" onChange={handleChange} margin="normal" />
          </>
        )}

        <Box justifyContent={"center"}>
          
          <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEntityModal;
