"use client"
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function UserHeader({ userId }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({
    id: 1,
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    role: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const responseUser = await fetch(`/api/profiles/${userId}`);
        const user = await responseUser.json();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-4">
          <Link href="/profiles" className="text-gray-300">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="flex items-center space-x-3 mt-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <span className="text-gray-300">•</span>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <span className="text-gray-300">•</span>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/profiles" className="text-gray-500 hover:text-void">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>{user.email}</span>
            {user.phone && (
              <>
                <span>•</span>
                <span>{user.phone}</span>
              </>
            )}
            {user.company && (
              <>
                <span>•</span>
                <span>{user.company}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {user.status && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
            {user.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        )}
        {user.role && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Administrateur' ? 'bg-purple-100 text-purple-800' :
            user.role === 'Gestionnaire' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
            {user.role}
          </span>
        )}
      </div>
    </div>
  )
}

export default UserHeader 