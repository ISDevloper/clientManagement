'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditUser({ params }) {
  const { id } = params
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    company: '',
    role: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAccessAndLoadUser = async () => {
      try {
        // Vérifier les droits d'accès
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          router.push('/login')
          return
        }
        
        // Vérifier si l'utilisateur est admin ou gestionnaire
        if (
          !currentUser.user_metadata?.role || 
          (currentUser.user_metadata.role !== 'admin' && currentUser.user_metadata.role !== 'gestionnaire')
        ) {
          router.push('/')
          return
        }
        
        // Charger les données de l'utilisateur à éditer via l'API Route
        const response = await fetch(`/api/admin/users/${id}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors du chargement des données de l\'utilisateur')
        }
        
        const data = await response.json()
        
        setFormData({
          email: data.user.email || '',
          full_name: data.profile?.full_name || '',
          phone: data.profile?.phone || '',
          company: data.profile?.company || '',
          role: data.user.user_metadata?.role || 'client',
        })
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        setError('Erreur lors du chargement des données de l\'utilisateur')
      } finally {
        setLoading(false)
      }
    }
    
    checkAccessAndLoadUser()
  }, [id, router, supabase])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Utiliser l'API Route pour mettre à jour l'utilisateur
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'utilisateur')
      }
      
      setSuccess(true)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    )
  }

  return (
    <div className="pt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Modifier l'Utilisateur</h1>
          <p className="mt-2 text-sm text-gray-700">
            Modifiez les informations de l'utilisateur.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-void focus:ring-offset-2 sm:w-auto"
          >
            Retour à la liste
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Succès</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>L'utilisateur a été mis à jour avec succès.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-lg">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rôle *
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
                >
                  <option value="client">Client</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Entreprise
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-void focus:ring-void sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-void focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-void py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-void focus:ring-offset-2"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 