'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/auth';
import { CognitoUser } from 'amazon-cognito-identity-js';

interface AuthContextType {
  user: CognitoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<CognitoUser | null>;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUserData: async () => null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load the current user
  const refreshUserData = async (): Promise<CognitoUser | null> => {
    try {
      const currentUser = await auth.getCurrentUser() as CognitoUser;
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      console.error('Error fetching user', error);
      return null;
    }
  };

  // Check for authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Error during auth check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting login with email:', credentials.email);
      
      // Track authentication stage for debugging
      let authStage = 'starting';
      
      try {
        authStage = 'calling auth.login';
        const result = await auth.login(credentials);
        console.log('AuthContext: Login successful, result type:', typeof result);
        authStage = 'login successful';
        
        authStage = 'refreshing user data';
        const userData = await refreshUserData();
        console.log('AuthContext: User data refreshed:', !!userData);
        authStage = 'complete';
      } catch (innerError: any) {
        console.error(`AuthContext: Login failed at stage [${authStage}]:`, innerError);
        // Re-throw with additional context
        throw new Error(`Login failed at stage [${authStage}]: ${innerError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 