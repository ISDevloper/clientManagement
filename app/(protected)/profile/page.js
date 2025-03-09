'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import UserProfile from '@/components/UserProfile'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error('Utilisateur non authentifié')
        
        setUser(user)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (error && error.code !== 'PGRST116') {
          throw error
        }
        
        setProfile(data || {})
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getProfile()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Profil Utilisateur</h1>
      <div className="mt-6">
        {user && <UserProfile user={user} profile={profile} />}
      </div>
    </div>
  )
} 