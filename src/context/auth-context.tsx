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

// Update the auth context to properly handle token validation
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  
  // Add this function to check if current route is protected or public
  const getRouteType = useCallback((path: string) => {
    if (!path) return 'unknown';
    
    // Check for public auth routes
    for (const publicPath of PUBLIC_PATHS) {
      if (path === publicPath || path.startsWith(`${publicPath}/`)) {
        return 'public';
      }
    }
    
    // Check for protected routes that need auth
    for (const protectedPath of PROTECTED_PATHS) {
      if (path === protectedPath || path.startsWith(`${protectedPath}/`)) {
        return 'protected';
      }
    }
    
    return 'default';
  }, []);
  
  // Log pathname for debugging
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Is protected path:', isProtectedPath(pathname || ''));
  }, [pathname, isProtectedPath]);

  // Load user data on initial mount and verify token validity
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      console.log("Attempting to load user from localStorage");
      
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("User loaded from localStorage, will verify with API");
          return true;
        } else {
          setIsAuthenticated(false);
          setUser(null);
          console.log("No auth data found in localStorage");
          return false;
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    };

    const checkAuth = async () => {
      setIsLoading(true);
      
      // First load from localStorage
      const hasLocalData = loadUserFromLocalStorage();
      
      if (!hasLocalData) {
        setIsLoading(false);
        return;
      }
      
      // If we have a token, verify it with the server
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        // Try to get user profile with token
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update user data with latest from server
          setUser(data.user);  // Make sure to extract 'user' from response
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("Token verified with server");
        } else {
          // Token is invalid
          console.log("Auth check failed, clearing token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        // Don't clear token on network errors to allow offline usage
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Setup event listener for auth changes
    const handleAuthChange = () => {
      console.log("Auth state change detected via custom event");
      checkAuth();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    // Also listen for storage events (works across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        console.log("Storage changed, reloading auth state");
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [API_URL]); // Remove router and pathname dependencies to prevent redirects

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

  // Add this debugging section to your AuthProvider component
  useEffect(() => {
    console.log("🔄 Auth context state updated:", { user, isAuthenticated });
    
    // Debug what's in localStorage
    console.log("📂 localStorage content:", {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user")
    });
  }, [user, isAuthenticated]);

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