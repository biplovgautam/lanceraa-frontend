'use client'

import { useState, useEffect } from 'react'
import { Mail, Lock, ArrowRight, Check, ArrowLeft, X } from 'lucide-react'
import { config } from '@/config'

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  })

  // Add password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password strength validation
  const isStrongPassword = (password: string) => {
    // At least 8 characters, contains uppercase, lowercase, number and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Check password requirements as user types
  useEffect(() => {
    const password = formData.password
    
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    })
  }, [formData.password])

  // Calculate overall password strength
  const passwordStrength = Object.values(passwordValidation).filter(Boolean).length

  // Get the first missing requirement (if any)
  const getFirstMissingRequirement = () => {
    if (!passwordValidation.minLength) {
      return { type: 'minLength', message: 'Password must be at least 8 characters' }
    }
    if (!passwordValidation.hasUppercase) {
      return { type: 'hasUppercase', message: 'Add at least 1 uppercase letter (A-Z)' }
    }
    if (!passwordValidation.hasLowercase) {
      return { type: 'hasLowercase', message: 'Add at least 1 lowercase letter (a-z)' }
    }
    if (!passwordValidation.hasSpecial) {
      return { type: 'hasSpecial', message: 'Add at least 1 special character (@$!%*?&)' }
    }
    if (!passwordValidation.hasNumber) {
      return { type: 'hasNumber', message: 'Add at least 1 number (0-9)' }
    }
    return null
  }

  // Handler for step 1 - Email validation
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset alert
    setAlert({ show: false, type: '', message: '' })

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address'
      })
      return
    }

    setIsCheckingEmail(true)

    try {
      // Check if email already exists
      const apiEndpoint = `${config.apiUrl}/api/auth/check-email`
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      
      // Handle the response according to our EmailExists schema
      if (response.ok) {
        if (data.exists === false) {
          // Email is available, proceed to next step
          setCurrentStep(2)
        } else {
          // Email already exists
          setAlert({
            show: true,
            type: 'error',
            message: data.message || 'This email is already registered. Please login instead.'
          })
        }
      } else {
        // API error
        setAlert({
          show: true,
          type: 'error',
          message: data.detail || 'Could not verify email availability. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error checking email:', error)
      
      // For development purposes, show detailed error
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Main signup handler (step 2)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset alert
    setAlert({ show: false, type: '', message: '' })

    // Validate password strength
    if (!isStrongPassword(formData.password)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      })
      return
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Passwords do not match'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const initialSignupData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword
      }
      
      const apiEndpoint = `${config.apiUrl}/api/auth/signup/initial`
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(initialSignupData),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        const text = await response.text()
        console.log('Raw response text:', text)
        throw new Error('Failed to parse response')
      }
      
      if (response.ok && data.user_id) {
        setAlert({
          show: true,
          type: 'success',
          message: data.message || 'Account created! Redirecting to verification page...'
        })
        
        // Clear sensitive data
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        })
        
        // Store user ID in localStorage for better persistence
        localStorage.setItem('verification_user_id', data.user_id);
        
        console.log("Signup successful, redirecting to verification with user_id:", data.user_id);
        
        // Use router for more reliable navigation
        setTimeout(() => {
          // Two options:
          // Option 1: window.location (hard navigation)
          window.location.href = `/verify-email/${data.user_id}`;
          
          // Option 2: Use Next.js router (if imported)
          // router.push(`/verify-email/${data.user_id}`);
        }, 2000);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.detail || data.error || 'Registration failed. Please try again.'
        })
      }
    } catch (error) {
      console.error('API Error:', error)
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle back button in step 2
  const handleBack = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="bg-[var(--primary)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-[var(--background)]">Create Account</h2>
        
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--primary)] font-bold">
              {currentStep > 1 ? <Check size={16} /> : '1'}
            </div>
            <div className="h-1 w-12 bg-[var(--background)] mx-2 opacity-60"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              currentStep === 2 
                ? 'bg-[var(--background)] text-[var(--primary)]' 
                : 'bg-[var(--background)] bg-opacity-40 text-[var(--background)]'
            }`}>
              2
            </div>
          </div>
        </div>
        
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

        {/* Step 1: Email Input */}
        {currentStep === 1 && (
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-[var(--background)] opacity-80">
                Enter your email to get started
              </p>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 rounded-md bg-[var(--background)] text-[var(--text)]"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isCheckingEmail || !formData.email}
              className="w-full flex items-center justify-center bg-[var(--background)] text-[var(--accent)] py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingEmail ? 'Checking...' : (
                <>
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-[var(--background)] opacity-80 text-sm">
                Already have an account? <a href="/login" className="underline">Sign in</a>
              </p>
            </div>
          </form>
        )}

        {/* Step 2: Password Input */}
        {currentStep === 2 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-[var(--background)] opacity-80">
                Create a secure password for {formData.email}
              </p>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-md bg-[var(--background)] text-[var(--text)]"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                autoFocus
                minLength={8}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 rounded-md bg-[var(--background)] text-[var(--text)]"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[var(--background)]">
                    Password Strength: {
                      passwordStrength === 0 ? 'Very Weak' :
                      passwordStrength <= 2 ? 'Weak' :
                      passwordStrength <= 4 ? 'Moderate' :
                      'As Strong As You!'
                    }
                  </span>
                  <span className="text-xs text-[var(--background)]">
                    {passwordStrength}/5
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[var(--background)] bg-opacity-20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength <= 2 ? 'bg-red-500' : 
                      passwordStrength <= 4 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Sequential requirement validation */}
            {formData.password && (
              <div className="bg-[var(--background)] bg-opacity-10 rounded-md p-3">
                {(() => {
                  // First check if any requirement is missing
                  const missingRequirement = getFirstMissingRequirement()
                  
                  if (missingRequirement) {
                    // Show the first missing requirement
                    return (
                      <div className="flex items-center text-xs">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-yellow-500 text-white">
                          <X size={12} />
                        </span>
                        <span className="text-[var(--text)]">{missingRequirement.message}</span>
                      </div>
                    )
                  } 
                  
                  // If no requirements are missing and confirmation doesn't match
                  else if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                    return (
                      <div className="flex items-center text-xs">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-red-500 text-white">
                          <X size={12} />
                        </span>
                        <span className="text-red-400">Passwords do not match</span>
                      </div>
                    )
                  }
                  
                  // If password requirements are met and confirmation password matches
                  else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
                    return (
                      <div className="flex items-center text-xs">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-[var(--accent)] text-white">
                          <Check size={12} />
                        </span>
                        <span className="text-[var(--accent)]">You're good to go!</span>
                      </div>
                    )
                  }
                  
                  // If password requirements are met but no confirmation password yet
                  else if (Object.values(passwordValidation).every(Boolean)) {
                    return (
                      <div className="flex items-center text-xs">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-green-500 text-white">
                          <Check size={12} />
                        </span>
                        <span className="text-[var(--text)]">Password meets all requirements. Please confirm it.</span>
                      </div>
                    )
                  }
                  
                  return null
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="w-12 flex items-center justify-center bg-[var(--background)] bg-opacity-50 text-[var(--text)] py-3 rounded-md hover:bg-opacity-60 transition-opacity"
              >
                <ArrowLeft size={16} />
              </button>
              
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  !formData.password || 
                  !formData.confirmPassword ||
                  formData.password !== formData.confirmPassword ||
                  !Object.values(passwordValidation).every(Boolean)
                }
                className="flex-1 flex items-center justify-center bg-[var(--background)] text-[var(--accent)] py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}