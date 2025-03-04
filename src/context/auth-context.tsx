'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { config } from '@/config';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified?: boolean;
  profile_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  checkNeedsVerification: (userData: any) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define paths that need authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/settings',
  '/projects'
];

// Define public paths that don't need redirect
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const API_URL = config.apiUrl || process.env.NEXT_PUBLIC_API_URL;

  // Helper to check if a user needs email verification
  const checkNeedsVerification = useCallback((userData: any): boolean => {
    return userData && userData.is_active === false;
  }, []);

  // Check if current path requires authentication
  const isProtectedPath = useCallback((path: string) => {
    return PROTECTED_PATHS.some(protectedPath => 
      path === protectedPath || path.startsWith(`${protectedPath}/`)
    );
  }, []);
  
  // Log pathname for debugging
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Is protected path:', isProtectedPath(pathname || ''));
  }, [pathname, isProtectedPath]);

  // Check auth status on mount
  useEffect(() => {
    // Skip auth check if this is likely a 404 page (no route)
    if (pathname && !PUBLIC_PATHS.includes(pathname) && !PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
      console.log('Unknown path pattern, might be 404:', pathname)
      setIsLoading(false)
      return // Don't redirect
    }
    
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      
      // Only redirect if on a protected path
      if (pathname && isProtectedPath(pathname)) {
        console.log('No token, redirecting from protected path:', pathname);
        router.push('/login');
      }
      return;
    }
    
    // Try to use stored user data first for quicker loading
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
      }
    }

    // Then verify with the server
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          console.log('Auth check failed, clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          
          // Only redirect if on a protected path
          if (pathname && isProtectedPath(pathname)) {
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [API_URL, router, pathname, isProtectedPath]);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      console.log('Attempting login...');
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Login response received');
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Check if user is active (email verified)
      if (checkNeedsVerification(data.user)) {
        console.log('User needs verification, redirecting...');
        
        // Request a new verification code
        try {
          await fetch(`${API_URL}/api/auth/resend-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: data.user.id }),
          });
        } catch (err) {
          console.error('Failed to resend verification:', err);
        }
        
        // Redirect to verification page
        router.push(`/verify-email/${data.user.id}`);
        return;
      }

      // Store auth data for active users
      localStorage.setItem('token', data.token.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard or home
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, router, checkNeedsVerification]);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    
    if (token) {
      try {
        // Optional: Call logout endpoint if your API has one
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.warn('Backend logout failed:', err));
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    router.push('/login');
  }, [API_URL, router]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated, 
      error,
      checkNeedsVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}