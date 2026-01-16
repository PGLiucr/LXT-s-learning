import React from 'react'
import { useAuthStore } from '@/store/authStore'

const ProfilePage = () => {
  const { user, signOut } = useAuthStore()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-primary mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-border max-w-md">
        <p className="mb-4"><strong>Email:</strong> {user?.email}</p>
        <button 
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
