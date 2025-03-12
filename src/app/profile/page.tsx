'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/context/auth-context'

export default function ProfilePage() {
  const { user } = useAuth()
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.fullName || user?.username || "User"}!</h1>
        <div className="bg-[var(--card)] p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Name</p>
              <p className="font-medium">{user?.fullName || `${user?.first_name || ''} ${user?.last_name || ''}` || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Username</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Account Status</p>
              <p className="font-medium">
                {user?.is_active ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-yellow-500">Pending Verification</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {!user?.profile_completed && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md mb-6">
            <p className="text-yellow-700 dark:text-yellow-400">
              Your profile is incomplete. Please fill in all the required information.
            </p>
            <button className="mt-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-2 rounded-md text-sm">
              Complete Profile
            </button>
          </div>
        )}
        
        {/* Additional profile sections would go here */}
      </div>
    </ProtectedRoute>
  )
}