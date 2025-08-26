import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import databaseService from '../services/DatabaseService';

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

  // Helper function to create or update user in database
  const createUserInDatabase = async (user: User) => {
    try {
      console.log('AuthContext: Creating/updating user in database:', user);
      // Check if user already exists
      const existingUserResponse = await databaseService.getUserById(user.id);
      if (!existingUserResponse.success || !existingUserResponse.data) {
        // User doesn't exist, create them
        const dbUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          bio: `Coffee enthusiast and member of the Onyx community`,
          location: undefined,
          isActive: true,
          phone: (user as any).phone, // Add phone field
          dateOfBirth: undefined,
          gender: undefined,
          addresses: [],
          preferences: {
            privacy: 'public' as const,
            notifications: true,
            theme: 'light' as const,
            newsletter: true,
            smsUpdates: true,
            emailUpdates: true,
            pushNotifications: true,
          },
          stats: {
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            loyaltyPoints: 0,
            totalOrders: 0,
            totalSpent: 0,
          },
          joinedAt: new Date(),
          lastActive: new Date(),
        };
        
        const createResponse = await databaseService.createUser(dbUser);
        if (createResponse.success) {
          console.log('AuthContext: Created user in database successfully:', user.name);
        } else {
          console.error('AuthContext: Failed to create user:', createResponse.error);
        }
      } else {
        console.log('AuthContext: User already exists in database:', user.name);
      }
    } catch (error) {
      console.error('AuthContext: Failed to create user in database:', error);
    }
  };

  // Restore user session on app start
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('bb-auth');
        if (userString) {
          const user = JSON.parse(userString);
          dispatch({ type: 'RESTORE_USER', payload: user });
        } else {
          // Auto-login demo user for development
          const demoUser: User = {
            id: 'demo-user',
            name: 'Coffee Lover',
            email: 'demo@onyx-coffee.com',
            initials: 'CL',
            avatar: 'https://ui-avatars.com/api/?name=Coffee+Lover&background=000&color=fff&size=100',
          };
          
          // Ensure user exists in database
          await createUserInDatabase(demoUser);
          
          await AsyncStorage.setItem('bb-auth', JSON.stringify(demoUser));
          dispatch({ type: 'RESTORE_USER', payload: demoUser });
        }
      } catch (error) {
        console.error('Failed to restore user:', error);
        dispatch({ type: 'RESTORE_USER', payload: null });
      }
    };

    restoreUser();
  }, []);

  // Login function (will be replaced with real Azure AD B2C)
  const login = async (email: string, password: string, userData?: any) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // TODO: Replace with actual Azure AD B2C authentication
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (email && password) {
        // Use userData if provided (from our new login form), otherwise extract from email
        const user: User = {
          id: userData?.id || `user_${Date.now()}`,
          name: userData?.name || email.split('@')[0],
          email: email,
          initials: userData?.initials || userData?.name?.charAt(0).toUpperCase() || email.charAt(0).toUpperCase(),
          avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || email.split('@')[0])}&background=1877f2&color=fff&size=100`,
        };
        
        console.log('Creating user with data:', user);
        
        // Create user in database
        await createUserInDatabase(user);
        
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
        avatar: 'https://ui-avatars.com/api/?name=Coffee+Lover&background=000&color=fff&size=100',
      };
      
      // Ensure user exists in database
      await createUserInDatabase(demoUser);
      
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