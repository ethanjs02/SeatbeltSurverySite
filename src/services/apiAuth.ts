import { auth } from './auth';

/**
 * Handles authentication specifically for API requests
 */
export const apiAuth = {
  /**
   * Gets the current JWT token for API requests
   * @returns Promise with the JWT token
   */
  getToken: async (): Promise<string> => {
    try {
      // Get token directly from localStorage first
      const idToken = localStorage.getItem('idToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      // Check if token is expired
      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration, 10);
        const currentTime = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (currentTime > expirationTime) {
          // Token is expired, clear it and throw error
          auth.logout();
          throw new Error('Token expired. Please log in again.');
        }
        
        // Check if token will expire soon (within 5 minutes)
        if (expirationTime - currentTime < fiveMinutes) {
          // Token will expire soon, we should refresh it
          // For now, we'll just return the current token since we don't have refresh token logic yet
          console.warn('Token will expire soon, but refresh not implemented');
        }
      }
      
      return idToken;
    } catch (error) {
      console.error('Error getting token:', error);
      throw new Error('Authentication required');
    }
  }
};

export default apiAuth; 