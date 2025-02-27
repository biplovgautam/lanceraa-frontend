'use client'

import { useAuth } from '@/context/auth-context';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1">Kripesh Tiwari</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">kripesh@example.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1">Freelancer</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="pt-4 border-t">
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 
                transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}