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
    console.log('Making request to:', fullUrl);
    console.log('With headers:', headers);
    
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Response data:', jsonData);
      return jsonData;
    } else {
       // Try to parse the text response as JSON first
       try {
        const textData = await response.text();
        console.log('Raw text response:', textData);
        
        // Try to parse as JSON
        if (textData && textData.trim()) {
          try {
            const parsedData = JSON.parse(textData);
            console.log('Successfully parsed text as JSON:', parsedData);
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
    console.error('API request error:', error);
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
    }
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
      return apiRequest<any>('/admin/users/create', 'POST', userData);
    },
    
    /**
     * Update existing user
     */
    updateUser: (email: string, userData: any) => {
      return apiRequest<any>(`/admin/users/update/${email}`, 'PUT', userData);
    },
    
    /**
     * Get specific user
     */
    getUser: (email: string) => {
      return apiRequest<any>(`/admin/users/read/${email}`);
    },
    
    /**
     * Delete user
     */
    deleteUser: (email: string) => {
      return apiRequest<any>(`/admin/users/delete/${email}`, 'DELETE');
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
      return apiRequest<any>('/admin/sites/create', 'POST', locationData);
    },
    
    /**
     * Update existing location/site
     */
    updateLocation: (locationId: string, locationData: any) => {
      return apiRequest<any>(`/admin/sites/update/${locationId}`, 'PUT', locationData);
    },
    
    /**
     * Delete location/site
     */
    deleteLocation: (locationId: string) => {
      return apiRequest<any>(`/admin/sites/delete/${locationId}`, 'DELETE');
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