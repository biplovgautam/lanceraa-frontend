'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const [path, setPath] = useState<string>('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  // Get the current path for display and prevent redirects
  useEffect(() => {
    // Stop automatic navigation
    const preventNavigation = (event: BeforeUnloadEvent | PopStateEvent) => {
      if (isRedirecting) return
      
      // For debugging purposes only - log attempts to navigate away
      console.log('Navigation attempt intercepted on 404 page')
      
      // Don't prevent actual user navigation
      if (event.type === 'beforeunload') return
      
      // Stop only programmatic navigation
      if (event instanceof PopStateEvent) {
        console.log('PopState event detected')
      }
    }

    // Record current location
    setPath(window.location.pathname)
    console.log('404 Not Found page rendered for path:', window.location.pathname)
    
    // Debug localStorage for auth tokens
    console.log('Auth token exists:', !!localStorage.getItem('token'))
    
    // Add navigation prevention
    window.addEventListener('beforeunload', preventNavigation)
    window.addEventListener('popstate', preventNavigation)
    
    // Observer for body changes - helps detect if something is trying to change the page
    const observer = new MutationObserver((mutations) => {
      console.log('DOM mutation detected on 404 page', mutations)
    })
    
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    })
    
    return () => {
      window.removeEventListener('beforeunload', preventNavigation)
      window.removeEventListener('popstate', preventNavigation)
      observer.disconnect()
      console.log('404 page unmounting')
    }
  }, [isRedirecting])

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsRedirecting(true)
    console.log('User clicked Go Home button')
    router.push('/')
  }

  const handleBackClick = () => {
    setIsRedirecting(true)
    console.log('User clicked Go Back button')
    window.history.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="bg-[var(--primary)] p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle size={32} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-[var(--background)]">Page Not Found</h1>
        
        <p className="text-[var(--background)] opacity-80 mb-3">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        {path && (
          <p className="text-sm text-[var(--background)] opacity-60 mb-6 p-2 bg-[var(--background)] bg-opacity-10 rounded">
            {path}
          </p>
        )}
        
        {/* Debugging info - remove in production */}
        <div className="text-xs text-left bg-gray-100 p-2 mb-6 rounded text-gray-800 overflow-auto max-h-32">
          <p>Debug info:</p>
          <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          <p>Auth: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--background)] text-[var(--accent)] rounded-md hover:opacity-90 transition-opacity"
          >
            Go to Home
          </button>
          
          <button 
            onClick={handleBackClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-[var(--background)] text-[var(--background)] rounded-md hover:bg-[var(--background)] hover:bg-opacity-10 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}