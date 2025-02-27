'use client'

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const publicPaths = ['/login', '/signup', '/'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Redirect authenticated users away from login/signup pages
      if (user && (pathname === '/login' || pathname === '/signup')) {
        router.push('/');
      }
      
      // Redirect unauthenticated users to login for protected routes
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}