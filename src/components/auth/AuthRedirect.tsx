'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthRedirect({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('Auth page: Already authenticated, redirecting to', from)
      router.push(from)
    }
  }, [isAuthenticated, isLoading, router, from])
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }
  
  // Only render login/signup form if NOT authenticated
  return !isAuthenticated ? <>{children}</> : null
}