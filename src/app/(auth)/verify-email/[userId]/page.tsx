'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, RefreshCw } from 'lucide-react'
import { config } from '@/config'

export default function VerifyEmailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState('')
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  })

  useEffect(() => {
    console.log("Verification page loaded with userId:", userId);
    
    // Validate userId exists
    if (!userId) {
      console.error("Missing userId in route params");
      setAlert({
        show: true,
        type: 'error',
        message: 'Invalid verification link. Please try signing up again.'
      })
    } else {
      console.log("Valid userId found:", userId);
      setAlert({
        show: true,
        type: 'success',
        message: 'We\'ve sent a verification code to your email address.'
      })
    }
  }, [userId])

  // Update to prevent unwanted redirects

  // Ensure this component doesn't redirect unexpectedly
  useEffect(() => {
    // Check if we're being redirected from signup
    const fromSignup = !!localStorage.getItem('verification_user_id');
    console.log("Verification page loaded. From signup:", fromSignup);
    
    // If we came directly to this page without proper context
    if (!userId) {
      console.error("Missing userId in route params");
      router.push('/login');
      return;
    }
  }, [userId, router]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(count => count - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Starting verification with code:", verificationCode);
    
    // Reset alert
    setAlert({ show: false, type: '', message: '' })

    if (!verificationCode || verificationCode.length !== 6) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid 6-digit verification code'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const apiEndpoint = `${config.apiUrl}/api/auth/verify-email`
      
      console.log("Sending verification request to:", apiEndpoint);
      console.log("With data:", {
        user_id: userId,
        verification_code: verificationCode
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          verification_code: verificationCode
        })
      })

      console.log("Received response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      let data
      try {
        data = await response.json()
      } catch (error) {
        console.error('Error parsing verification response:', error)
        throw new Error('Failed to parse response')
      }

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Email verified successfully! Redirecting to complete your profile...'
        })
        
        // Redirect after a short delay
        setTimeout(() => {
          // You'll need to create this page later
          router.push(`/complete-profile/${userId}`)
        }, 2000)
      } else {
        // Check if code is expired
        const isExpired = response.headers.get('X-Error-Code') === 'EXPIRED_CODE' || 
                          data.detail?.includes('expired')
        
        setAlert({
          show: true,
          type: 'error',
          message: isExpired 
            ? 'Verification code has expired. Please request a new one.' 
            : data.detail || 'Verification failed. Please check your code.'
        })
      }
    } catch (error) {
      console.error('Detailed verification error:', error)
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    setAlert({ show: false, type: '', message: '' })
    
    try {
      const apiEndpoint = `${config.apiUrl}/api/auth/resend-verification`
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })

      let data
      try {
        data = await response.json()
      } catch (error) {
        console.error('Error parsing resend response:', error)
        throw new Error('Failed to parse response')
      }

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Verification code sent! Please check your email.'
        })
        // Set cooldown
        setCountdown(30)
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.detail || 'Failed to resend verification code.'
        })
      }
    } catch (error) {
      console.error('Resend code error:', error)
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="bg-[var(--primary)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-[var(--background)]">Verify Your Email</h2>
        <p className="text-center text-[var(--background)] mb-6 opacity-80">
          Enter the 6-digit code we sent to your email
        </p>
        
        {/* Alert Message */}
        {alert.show && (
          <div className={`mb-4 p-3 rounded-md text-center ${
            alert.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
          }`}>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 text-center rounded-md bg-[var(--background)] text-[var(--text)] text-lg tracking-widest"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full flex items-center justify-center bg-[var(--background)] text-[var(--accent)] py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0}
            className="flex items-center justify-center mx-auto text-[var(--background)] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={`mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
            {countdown > 0 
              ? `Resend code in ${countdown}s` 
              : resendLoading 
                ? 'Sending...' 
                : "Didn't receive code? Resend"}
          </button>
        </div>
      </div>
    </div>
  )
}