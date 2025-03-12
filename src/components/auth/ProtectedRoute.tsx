'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ 
  children,
  loadingComponent = <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
  </div>
}: { 
  children: ReactNode,
  loadingComponent?: ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Protected route: Not authenticated, redirecting to login')
      router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null
}