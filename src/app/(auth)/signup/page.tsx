'use client'

import { useState, useEffect } from 'react'
import { Mail, Lock, ArrowRight, Check, ArrowLeft, X } from 'lucide-react'
import { config } from '@/config'
import Link from 'next/link'

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

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isStrongPassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

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

  const passwordStrength = Object.values(passwordValidation).filter(Boolean).length

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

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setAlert({ show: false, type: '', message: '' })

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
      const apiEndpoint = `${config.apiUrl}/api/auth/check-email`
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        if (data.exists === false) {
          setCurrentStep(2)
        } else {
          setAlert({
            show: true,
            type: 'error',
            message: data.message || 'This email is already registered. Please login instead.'
          })
        }
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.detail || 'Could not verify email availability. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error checking email:', error)
      
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setAlert({ show: false, type: '', message: '' })

    if (!isStrongPassword(formData.password)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      })
      return
    }

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
        
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        })
        
        localStorage.setItem('verification_user_id', data.user_id);
        
        console.log("Signup successful, redirecting to verification with user_id:", data.user_id);
        
        setTimeout(() => {
          window.location.href = `/verify-email/${data.user_id}`;
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

  const handleBack = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)]">
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Join Lanceraa</h1>
          <p className="text-lg opacity-90 mb-6">
            Connect with top clients and find exciting freelance opportunities that match your skills and interests.
          </p>
          <div className="space-y-4 mt-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Check className="text-white" size={20} />
              </div>
              <p className="opacity-90">Access to thousands of projects</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Check className="text-white" size={20} />
              </div>
              <p className="opacity-90">Secure payment protection</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Check className="text-white" size={20} />
              </div>
              <p className="opacity-90">Build your professional profile</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
            {currentStep === 1 ? 'Create Your Account' : 'Set Password'}
          </h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {currentStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className="h-1 w-12 bg-gray-300 dark:bg-gray-600 mx-2"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                currentStep === 2 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>
          
          {alert.show && (
            <div className={`mb-4 p-3 rounded-md text-center text-sm font-medium ${
              alert.type === 'success' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
            }`}>
              {alert.message}
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your email to get started
                </p>
              </div>
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isCheckingEmail || !formData.email}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingEmail ? 'Checking...' : (
                  <>
                    Continue
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Already have an account? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link>
                </p>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Create a secure password for {formData.email}
                </p>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  autoFocus
                  minLength={8}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              {formData.password && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Password Strength: {
                        passwordStrength === 0 ? 'Very Weak' :
                        passwordStrength <= 2 ? 'Weak' :
                        passwordStrength <= 4 ? 'Moderate' :
                        'As Strong As You!'
                      }
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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

              {formData.password && (
                <div className="py-1">
                  {(() => {
                    const missingRequirement = getFirstMissingRequirement()
                    
                    if (missingRequirement) {
                      return (
                        <div className="flex items-center text-xs">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-yellow-500 text-white">
                            <X size={12} />
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium drop-shadow-sm">
                            {missingRequirement.message}
                          </span>
                        </div>
                      )
                    } 
                    
                    else if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                      return (
                        <div className="flex items-center text-xs">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-red-500 text-white">
                            <X size={12} />
                          </span>
                          <span className="text-red-600 dark:text-red-400 font-medium drop-shadow-sm">
                            Passwords do not match
                          </span>
                        </div>
                      )
                    }
                    
                    else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
                      return (
                        <div className="flex items-center text-xs">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-blue-600 text-white">
                            <Check size={12} />
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium drop-shadow-sm">
                            You're good to go!
                          </span>
                        </div>
                      )
                    }
                    
                    else if (Object.values(passwordValidation).every(Boolean)) {
                      return (
                        <div className="flex items-center text-xs">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-green-500 text-white">
                            <Check size={12} />
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium drop-shadow-sm">
                            Password meets all requirements. Please confirm it.
                          </span>
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
                  className="w-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
                  className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}