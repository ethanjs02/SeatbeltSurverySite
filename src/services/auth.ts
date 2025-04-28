import { awsConfig } from '../config/aws-config';
import https from 'https';

// Log Cognito configuration for debugging (masking sensitive info)
console.log('Cognito Config:', {
  region: awsConfig.region,
  userPoolId: awsConfig.userPoolId ? `${awsConfig.userPoolId.split('_')[0]}_****` : 'not set',
  userPoolWebClientId: awsConfig.userPoolWebClientId ? `${awsConfig.userPoolWebClientId.substring(0, 4)}****` : 'not set',
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  idToken: string;
  accessToken: string;
  expiresIn: number;
}

export const auth = {
  login: (credentials: LoginCredentials): Promise<AuthResult> => {
    console.log('Auth service: Starting login process');
    return new Promise((resolve, reject) => {
      if (!credentials.email) {
        console.error('Auth service: Missing email');
        reject(new Error('Email is required'));
        return;
      }

      if (!credentials.password) {
        console.error('Auth service: Missing password');
        reject(new Error('Password is required'));
        return;
      }

      console.log('Auth service: Making API call with email:', 
        credentials.email.substring(0, 3) + '***');
      
      const data = JSON.stringify({
        AuthParameters: {
          USERNAME: credentials.email,
          PASSWORD: credentials.password
        },
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: awsConfig.userPoolWebClientId
      });

      const options = {
        hostname: `cognito-idp.${awsConfig.region}.amazonaws.com`,
        path: `/${awsConfig.userPoolId}`,
        method: 'POST',
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'Content-Type': 'application/x-amz-json-1.1',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            
            if (res.statusCode === 200) {
              console.log('Auth service: Login successful');
              
              // Store tokens in localStorage
              const idToken = response.AuthenticationResult.IdToken;
              const accessToken = response.AuthenticationResult.AccessToken;
              const expiresIn = response.AuthenticationResult.ExpiresIn;
              
              // Calculate expiration time (current time + expiresIn seconds)
              const expirationTime = new Date().getTime() + expiresIn * 1000;
              
              localStorage.setItem('idToken', idToken);
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('tokenExpiration', expirationTime.toString());
              localStorage.setItem('userEmail', credentials.email);
              
              console.log('Auth service: Tokens stored in localStorage');
              
              resolve({
                idToken,
                accessToken,
                expiresIn
              });
            } else {
              console.error('Auth service: Login failed', response);
              reject(new Error(response.message || 'Authentication failed'));
            }
          } catch (error) {
            console.error('Auth service: Error parsing response', error);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Auth service: Request error', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  },

  logout: () => {
    console.log('Auth service: Logging out');
    // Clear all auth-related items from localStorage
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userEmail');
    console.log('Auth service: User signed out');
  },

  getCurrentUser: () => {
    console.log('Auth service: Getting current user');
    return new Promise((resolve, reject) => {
      const idToken = localStorage.getItem('idToken');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const userEmail = localStorage.getItem('userEmail');
      
      if (!idToken) {
        console.log('Auth service: No current user found');
        reject('No user found');
        return;
      }
      
      // Check if token is expired
      if (tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration, 10);
        const currentTime = new Date().getTime();
        
        if (currentTime > expirationTime) {
          console.log('Auth service: Token expired');
          auth.logout(); // Clear expired tokens
          reject('Token expired');
          return;
        }
      }
      
      console.log('Auth service: Valid user session found');
      
      // Here you could decode the JWT token to get user information
      resolve({
        idToken,
        accessToken: localStorage.getItem('accessToken'),
        email: userEmail
      });
    });
  },
  
  // Helper method to check if user is authenticated
  isAuthenticated: (): boolean => {
    const idToken = localStorage.getItem('idToken');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    
    if (!idToken || !tokenExpiration) {
      return false;
    }
    
    // Check if token is expired
    const expirationTime = parseInt(tokenExpiration, 10);
    const currentTime = new Date().getTime();
    
    return currentTime < expirationTime;
  }
}; 