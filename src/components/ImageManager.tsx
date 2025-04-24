'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  IconButton, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  PhotoLibrary as PhotoLibraryIcon
} from '@mui/icons-material';
import { api } from '../services/api';

// Define interface for image objects
interface SiteImage {
  url: string;
  fileName: string;
}
type ImageManagerProps = {
  county?: string | string[];
  siteName?: string | string[];
};





export default function ImageManager({ county, siteName }: ImageManagerProps) {
  const decodedCounty = county ? decodeURIComponent(county as string) : '';
  const decodedSiteName = siteName ? decodeURIComponent(siteName as string) : '';
  console.log('Decoded County:', decodedCounty);
  console.log('Decoded Site Name:', decodedSiteName);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [imageToDelete, setImageToDelete] = useState<SiteImage | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullImageDialogOpen, setFullImageDialogOpen] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [imageToEdit, setImageToEdit] = useState<SiteImage | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);


  

  // Fetch images on component mount
  useEffect(() => {
    if (decodedCounty && decodedSiteName) {
      fetchImages();
    }
  }, [decodedCounty, decodedSiteName]);

  // Fetch images from API
// Fetch images from API
// Fetch images from API
// Fetch images from API
const fetchImages = async () => {
  try {
    setLoading(true);
    const response = await api.image.fetchImages(decodedCounty, decodedSiteName);
    
    console.log("API Response:", response);
    
    // Check if response is an array of objects with url and fileName
    if (Array.isArray(response)) {
      setImages(response);
      console.log("Images set to:", response);
    } else {
      setImages([]);
      console.warn("Unexpected response format:", response);
    }
    
    setError(null);
  } catch (err: any) {
    console.error('Error fetching images:', err);
    setError(err.message || 'Failed to load images. Please try again later.');
  } finally {
    setLoading(false);
  }
};

  // Handle file selection for upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedFile || !uploadFileName) {
      setError('Please select a file and provide a file name');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Requesting presigned URL for:', {
        county: decodedCounty,
        siteName: decodedSiteName,
        fileName: uploadFileName
      });
      
      // Get presigned URL for upload
      const response = await api.image.createImage(
        decodedCounty,
        decodedSiteName,
        uploadFileName
      );
      
      console.log('Presigned URL response:', response);
      
      if (response && response.presignedUrl) {
        // Upload the file to the presigned URL using POST
        const uploadResponse = await fetch(response.presignedUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type
          }
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to presigned URL');
        }
        
        // Reset states and close dialog
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadFileName('');
        setPreviewUrl(null);
        setSuccess('Image uploaded successfully');
        
        // Refresh the image list
        await fetchImages();
      } else {
        throw new Error('Failed to get upload URL');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image delete confirmation
  // Handle image delete confirmation
// Handle image delete confirmation
const handleDeleteConfirm = async () => {
  if (!imageToDelete) return;
  
  try {
    setIsDeleting(true);
    
    // Format the request payload with the 'images' field as expected by the API
    const deletePayload = {
      images: [{
        county: decodedCounty,
        siteName: decodedSiteName,
        fileName: imageToDelete.fileName
      }]
    };

    
    // Call the API with the correctly formatted payload
    await api.image.deleteImages(deletePayload.images);
    
    // Remove the deleted image from the state
    setImages(images.filter(img => img.fileName !== imageToDelete.fileName));
    setSuccess('Image deleted successfully');
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  } catch (err: any) {
    console.error('Error deleting image:', err);
    setError(err.message || 'Failed to delete image. Please try again later.');
  } finally {
    setIsDeleting(false);
  }
};
  // Open full image dialog
  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setFullImageDialogOpen(true);
  };

  // Handle file selection for edit
  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setEditSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image edit
  const handleEdit = async () => {
    if (!editSelectedFile || !imageToEdit) {
      setError('Please select a file to update the image');
      return;
    }

    try {
      setIsEditing(true);
      
      // Get presigned URL for edit
      const response = await api.image.editImage(
        decodedCounty,
        decodedSiteName,
        imageToEdit.fileName
      );
    
      
      if (response && response.presignedUrl) {
        // Upload the file to the presigned URL
        const uploadResponse = await fetch(response.presignedUrl, {
          method: 'PUT',
          body: editSelectedFile,
          headers: {
            'Content-Type': editSelectedFile.type
          }
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload edited file');
        }
        
        // Reset states and close dialog
        setEditDialogOpen(false);
        setEditSelectedFile(null);
        setImageToEdit(null);
        setEditPreviewUrl(null);
        setSuccess('Image updated successfully');
        
        // Refresh the image list
        await fetchImages();
      } else {
        throw new Error('Failed to get upload URL for edit');
      }
    } catch (err: any) {
      console.error('Error editing image:', err);
      setError(err.message || 'Failed to edit image. Please try again later.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={() => router.push('/locations')}
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Locations
        </MuiLink>
        <Typography color="text.primary">{decodedCounty} County</Typography>
        <Typography color="text.primary">{decodedSiteName}</Typography>
      </Breadcrumbs>

      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 1 }}
            onClick={() => router.back()}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Image Manager: {decodedSiteName}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Add Image
        </Button>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Content area */}
      <Paper elevation={2} sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : images.length > 0 ? (
          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card elevation={3}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.url}
                    alt={image.fileName}
                    sx={{ 
                      objectFit: 'cover',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.9 }
                    }}
                    onClick={() => handleImageClick(image.url)}
                  />
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="body2" noWrap title={image.fileName}>
                      {image.fileName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit Image">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setImageToEdit(image);
                          setEditDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Image">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setImageToDelete(image);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4,
            textAlign: 'center'
          }}>
            <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No images found for this location
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload images using the 'Add Image' button above
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Add First Image
            </Button>
          </Box>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !isUploading && setUploadDialogOpen(false)}
        aria-labelledby="upload-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="upload-dialog-title">Upload New Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload an image for {decodedSiteName} in {decodedCounty} County
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            id="fileName"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ mb: 2 }}
          >
            Select Image File
          </Button>
          
          {previewUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setUploadDialogOpen(false)} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained" 
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Image Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the image "{imageToDelete?.fileName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : undefined}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Image Dialog */}
      <Dialog
        open={fullImageDialogOpen}
        onClose={() => setFullImageDialogOpen(false)}
        maxWidth="lg"
        PaperProps={{
          sx: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            aria-label="close"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
            onClick={() => setFullImageDialogOpen(false)}
          >
            <DeleteIcon />
          </IconButton>
          {selectedImageUrl && (
            <img
              src={selectedImageUrl}
              alt="Full size"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !isEditing && setEditDialogOpen(false)}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">Edit Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Update image for {imageToEdit?.fileName}
            </Typography>
          </Box>
          
          <TextField
            margin="dense"
            id="fileName"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={imageToEdit?.fileName || ''}
            disabled
            sx={{ mb: 2 }}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleEditFileChange}
          />
          
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ mb: 2 }}
          >
            Select New Image File
          </Button>
          
          {editPreviewUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <Box
                component="img"
                src={editPreviewUrl}
                alt="Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: 1,
                  boxShadow: 1
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setEditSelectedFile(null);
              setImageToEdit(null);
              setEditPreviewUrl(null);
            }} 
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEdit}
            variant="contained" 
            disabled={!editSelectedFile || isEditing}
            startIcon={isEditing ? <CircularProgress size={20} /> : undefined}
          >
            {isEditing ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}