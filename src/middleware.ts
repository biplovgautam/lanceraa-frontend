import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/projects',
  // Add other protected routes
]

// Define our auth check, but ignore 404 responses
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log(`Middleware processing: ${path}`)
  
  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  // If it's not a protected route, don't do redirect
  if (!isProtectedRoute) {
    console.log(`Not a protected route: ${path}, allowing without auth check`)
    return NextResponse.next()
  }
  
  // For protected routes, check auth
  const token = request.cookies.get('token')?.value || request.cookies.get('next-auth.session-token')?.value
  
  if (!token) {
    const hasLocalStorageToken = typeof window !== 'undefined' && localStorage.getItem('token')
    
    if (hasLocalStorageToken) {
      // If token exists in localStorage but not in cookies, pass through
      console.log('Token found in localStorage but not cookies')
      return NextResponse.next()
    }
    
    console.log(`Protected route ${path} with no token, redirecting to login`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }
  
  // Continue with the request if authenticated
  return NextResponse.next()
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Only run on protected routes:
     */
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/projects/:path*',
  ],
}