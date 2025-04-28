import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { awsConfig } from '../config/aws-config';
import { apiAuth } from './apiAuth';

// API endpoints based on environment
const API_ENDPOINTS = {
  development: 'https://1z9u2pel1h.execute-api.us-east-2.amazonaws.com/dev',  // Using the proxy in development
  testing: `${process.env.NEXT_PUBLIC_API_URL}/test`,
  production: `${process.env.NEXT_PUBLIC_API_URL}/prod`
};

// Determine the current environment based on environment variables or defaults
const currentEnvironment = process.env.NEXT_PUBLIC_ENV || 'development';
const apiBaseUrl = API_ENDPOINTS[currentEnvironment as keyof typeof API_ENDPOINTS];

// For debugging
console.log('API Base URL:', apiBaseUrl);
console.log('AWS Config:', {
  region: awsConfig.region,
  userPoolId: awsConfig.userPoolId ? `${awsConfig.userPoolId.split('_')[0]}_****` : 'not set',
  userPoolWebClientId: awsConfig.userPoolWebClientId ? `${awsConfig.userPoolWebClientId.substring(0, 4)}****` : 'not set',
});

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId!,
  ClientId: awsConfig.userPoolWebClientId!,
});

/**
 * Get the current authenticated user's JWT token
 * @returns Promise with the JWT token or null if not authenticated
 */
const getAuthToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      resolve(null);
      return;
    }
    
    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session.isValid()) {
        resolve(null);
        return;
      }
      
      resolve(session.getIdToken().getJwtToken());
    });
  });
};

/**
 * Generic API request function with authentication token handling
 */
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any, 
  customHeaders?: Record<string, string>
): Promise<T> => {
  try {
    const token = await apiAuth.getToken();
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    const config: RequestInit = {
      method,
      headers,
      body: body ? (customHeaders?.['Content-Type'] === 'multipart/form-data' ? body : JSON.stringify(body)) : undefined,
    };
    
    // For multipart/form-data, remove the Content-Type header and let the browser set it with the boundary
    if (customHeaders?.['Content-Type'] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }
    
    const fullUrl = `${apiBaseUrl}${endpoint}`;
    console.log(`API Request: ${method} ${fullUrl}`);
    console.log('Request Headers:', headers);
    if (body) {
      console.log('Request Body:', JSON.stringify(body, null, 2));
    }
    
    const response = await fetch(fullUrl, config);
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to get more detailed error information
      try {
        // Clone the response to be able to read it twice
        const clonedResponse = response.clone();
        
        // Try to parse as JSON first
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response (JSON):', errorData);
        
        // If that fails, try to get the raw text
        if (Object.keys(errorData).length === 0) {
          const textResponse = await clonedResponse.text();
          console.error('API Error Response (Text):', textResponse);
        }
        
        // Custom error message based on status code
        if (response.status === 500) {
          throw new Error(errorData.message || 'Internal Server Error: The server encountered an unexpected condition.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Bad Request: The server could not understand the request.');
        } else if (response.status === 401) {
          throw new Error(errorData.message || 'Unauthorized: Authentication is required or has failed.');
        } else if (response.status === 403) {
          throw new Error(errorData.message || 'Forbidden: You do not have permission to access this resource.');
        } else if (response.status === 404) {
          throw new Error(errorData.message || 'Not Found: The requested resource could not be found.');
        } else {
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        throw new Error(`API request failed with status ${response.status}`);
      }
    }
    
    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Response Data:', jsonData);
      return jsonData;
    } else {
       // Try to parse the text response as JSON first
       try {
        const textData = await response.text();
        console.log('Raw Text Response:', textData);
        
        // Try to parse as JSON
        if (textData && textData.trim()) {
          try {
            const parsedData = JSON.parse(textData);
            console.log('Parsed JSON from Text:', parsedData);
            return parsedData;
          } catch (parseError) {
            console.log('Failed to parse text as JSON, returning as is');
            return textData as unknown as T;
          }
        } else {
          console.log('Empty text response, returning empty object');
          return {} as T;
        }
      } catch (textError) {
        console.log('Failed to read text response, returning empty object', textError);
        
      return {} as T;
      }
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API service with methods for different endpoints
export const api = {
  // Data collection endpoints
  data: {
    /**
     * Get list of data collections
     */
    getCollections: () => {
      return apiRequest<any[]>('/admin/data/read-collections');
    },
    
    /**
     * Get specific data collection
     */
    getCollection: (collectionId: string) => {
      return apiRequest<any>(`/collections/${collectionId}`);
    },
    
    /**
     * Upload data to S3 bucket
     */
    uploadData: (collectionId: string, fileData: FormData) => {
      // For file uploads, we don't want to JSON stringify the body
      return apiRequest<{success: boolean, fileUrl: string}>(
        `/collections/${collectionId}/upload`,
        'POST',
        fileData,
        { 'Content-Type': 'multipart/form-data' }
      );
    },

    
  },

  // User management endpoints
  users: {
    /**
     * Get list of users
     */
    getUsers: () => {
      return apiRequest<any[]>('/admin/users/read');
    },

    /**
     * Create new user
     */
    createUser: (userData: any) => {
      // Format according to API documentation with users array
      return apiRequest<any>('/admin/users/create', 'POST', {
        users: [userData]
      });
    },
    
    /**
     * Update existing user
     */
    updateUser: (email: string, first_name: any, last_name: any) => {
      // Format according to API documentation - using users array like the create endpoint
      
      return apiRequest<any>(`/admin/users/update`, 'PUT', {
        email: email,
        first_name: first_name,
        last_name: last_name
      });
    },
    
   
    
    /**
     * Delete user
     */
    deleteUser: (email: string | string[]) => {
      const emails = Array.isArray(email) ? email : [email];
      return apiRequest<any>(`/admin/users/delete`, 'POST', {
        emails: emails
      });
    }
  },
  
  // Location/Sites management endpoints
  locations: {
    /**
     * Get list of locations/sites
     */
    getLocations: () => {
      return apiRequest<any[]>('/admin/sites/read');
    },
    
    /**
     * Get specific location/site
     */
    getLocation: (locationId: string) => {
      return apiRequest<any>(`/admin/sites/read/${locationId}`);
    },
    
    /**
     * Create new location/site
     */
    createLocation: (locationData: any) => {
      // Create a body wrapper for Lambda integration
      return apiRequest<any>('/admin/sites/create', 'POST', {
        body: locationData
      });
      
    },
    
    /**
     * Update existing location/site
     */
    updateLocation: (locationId: string, locationData: any) => {
      // Create a body wrapper for Lambda integration
      return apiRequest<any>(`/admin/sites/update`, 'PUT',
        
        locationData
        
    );
    },
    
    /**
     * Delete location/site
     */
    deleteLocation: (locationId: string | string[] | {county: string, name: string}[]) => {
      // If we have an array of location objects already (sites with county and name)
      if (Array.isArray(locationId) && locationId.length > 0 && 
          typeof locationId[0] === 'object' && 'county' in locationId[0]) {
        return apiRequest<any>(`/admin/sites/delete`, 'POST', {
          sites: locationId
        });
      }
      
      // If we have string IDs, we need to format them properly
      // This assumes the locationId string is in the format "county_name"
      const sites = Array.isArray(locationId) 
        ? locationId.map(id => {
            const [county, name] = (id as string).split('_');
            return { county, name };
          })
        : (() => {
            const [county, name] = (locationId as string).split('_');
            return [{ county, name }];
          })();
      
      return apiRequest<any>(`/admin/sites/delete`, 'POST', {
        sites: sites
      });
    }
   
  },
  image: {
    
    fetchImages: (county: string, site: string) => {
      return apiRequest<{images: string[]}>(`/admin/images/fetch?county=${encodeURIComponent(county)}&site=${encodeURIComponent(site)}`);
    },
    
   
    createImage: (county: string, siteName: string, fileName: string) => {
      return apiRequest<{presignedUrl: string}>('/admin/images/create', 'POST', {
        county,
        siteName,
        fileName
      });
    },
    
    
    editImage: (county: string, siteName: string, fileName: string) => {
      return apiRequest<{presignedUrl: string}>('/admin/images/update', 'POST', {
          county,
          siteName,
          fileName
      });
    },
    
    
    deleteImages: (images: Array<{county: string, siteName: string, fileName: string}>) => {
      return apiRequest<{success: boolean}>('/admin/images/delete', 'POST', 
        images
      );
    },
    
    
    deleteImage: (county: string, siteName: string, fileName: string) => {
      return apiRequest<{success: boolean}>('/admin/images/delete', 'POST', {
        images: [{
          county,
          siteName,
          fileName
        }]
      });
    }

  },
  
  // Admin specific endpoints
  admin: {
    /**
     * Get admin dashboard stats
     */
    getDashboardStats: () => {
      return apiRequest<any>('/admin/stats');
    }
  }
};

export default api; 