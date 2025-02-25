'use client'

import { useState } from 'react'
import { Mail, Lock, User, Phone, UserRound } from 'lucide-react'
import { config } from '@/config'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset alert
    setAlert({ show: false, type: '', message: '' })

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Passwords do not match'
      })
      return
    }

    try {
      const { confirmPassword, ...signupData } = formData
      
      console.log('Sending request to:', `${config.apiUrl}/api/auth/signup`)
      console.log('Request data:', signupData)
      
      // Remove the extra slash in the URL
      const response = await fetch(`${config.apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(signupData),
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: data.message
        })
        setFormData({
          username: '',
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.error || data.detail || 'Registration failed. Please try again.'
        })
      }
    } catch (error) {
      console.error('API Error:', error)
      setAlert({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="bg-[var(--accent)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--background)]">Create Account</h2>
        
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)]" size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--background)] text-[var(--text)]"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--background)] text-[var(--accent)] py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}