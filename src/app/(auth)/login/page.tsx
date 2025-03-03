'use client'

import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { config } from '@/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlert({ show: false, type: '', message: '' })

    try {
      // Create form data for OAuth2 password flow
      const formDataObj = new FormData()
      formDataObj.append('username', formData.username)
      formDataObj.append('password', formData.password)
      
      console.log(`Attempting to login: ${formData.username}`)
      
      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: 'POST',
        body: formDataObj,
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('Login successful, processing user data')
        
        // First check if user is active
        if (data.user && data.user.is_active === false) {
          console.log('User account not activated, redirecting to verification')
          
          // Store the user ID for the verification page
          localStorage.setItem('verification_user_id', data.user.id)
          
          // We need to get their verification code first
          const resendResponse = await fetch(`${config.apiUrl}/api/auth/resend-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: data.user.id })
          })
          
          if (!resendResponse.ok) {
            const errorData = await resendResponse.json()
            console.error('Failed to resend verification:', errorData)
            throw new Error(errorData.detail || 'Failed to send verification code')
          }
          
          setAlert({
            show: true,
            type: 'warning',
            message: 'Your account needs to be verified. Redirecting to verification page...'
          })
          
          // Redirect to verification page
          setTimeout(() => {
            router.push(`/verify-email/${data.user.id}`)
          }, 2000)
          return
        }
        
        // Normal login flow for active users
        localStorage.setItem('token', data.token.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setAlert({
          show: true,
          type: 'success',
          message: 'Login successful! Redirecting to dashboard...'
        })
        
        setTimeout(() => {
          router.push('/dashboard') 
        }, 1000)
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.detail || 'Login failed. Please check your credentials.'
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setAlert({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred during login. Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="bg-[var(--primary)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-[var(--background)]">Welcome Back</h2>
        <p className="text-center text-[var(--background)] mb-6 opacity-80">
          Sign in to your account
        </p>
        
        {/* Alert Message */}
        {alert.show && (
          <div className={`mb-4 p-3 rounded-md text-center ${
            alert.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
              : alert.type === 'warning'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
          }`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              className="w-full pl-10 pr-4 py-3 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-[var(--background)]">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[var(--background)] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--accent)] bg-[var(--background)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-[var(--background)] opacity-80 text-sm">
            Don't have an account? <Link href="/signup" className="font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}