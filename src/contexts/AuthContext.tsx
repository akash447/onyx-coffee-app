import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_USER'; payload: User | null };

// Auth Context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'RESTORE_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore user session on app start
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('bb-auth');
        if (userString) {
          const user = JSON.parse(userString);
          dispatch({ type: 'RESTORE_USER', payload: user });
        } else {
          dispatch({ type: 'RESTORE_USER', payload: null });
        }
      } catch (error) {
        console.error('Failed to restore user:', error);
        dispatch({ type: 'RESTORE_USER', payload: null });
      }
    };

    restoreUser();
  }, []);

  // Login function (will be replaced with real Azure AD B2C)
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Replace with actual Azure AD B2C authentication
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (email && password) {
        const user: User = {
          id: '1',
          name: email.split('@')[0],
          email: email,
          initials: email.charAt(0).toUpperCase(),
        };
        
        await AsyncStorage.setItem('bb-auth', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  // Demo login for testing
  const demoLogin = async () => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const demoUser: User = {
        id: 'demo-user',
        name: 'Coffee Lover',
        email: 'demo@onyx-coffee.com',
        initials: 'CL',
      };
      
      await AsyncStorage.setItem('bb-auth', JSON.stringify(demoUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
    } catch (error) {
      console.error('Demo login failed:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('bb-auth');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};