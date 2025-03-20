'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function UsersAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState(null)
  const [warning, setWarning] = useState(null)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [autologinLink, setAutologinLink] = useState(null)
  const [linkUserId, setLinkUserId] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }
        
        setCurrentUser(user)
        
        // Vérifier si l'utilisateur est admin ou gestionnaire
        if (
          !user.user_metadata?.role || 
          (user.user_metadata.role !== 'admin' && user.user_metadata.role !== 'gestionnaire')
        ) {
          router.push('/')
          return
        }
        
        await fetchUsers()
      } catch (error) {
        console.error('Erreur lors de la vérification des accès:', error)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [router, supabase])

  const fetchUsers = async () => {
    try {
      // Utiliser l'API Route pour récupérer les utilisateurs
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des utilisateurs')
      }
      
      const combinedUsers = await response.json()
      setUsers(combinedUsers)
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      setError('Erreur lors du chargement des utilisateurs')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      // Utiliser l'API Route pour supprimer l'utilisateur
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur')
      }
      
      // Mettre à jour la liste
      await fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      setError('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const handleGenerateAutologinLink = async (userId) => {
    try {
      setGeneratingLink(true)
      setLinkUserId(userId)
      setAutologinLink(null)
      setWarning(null)
      setError(null)
      
      // Appeler l'API pour générer un lien d'autologin
      const response = await fetch(`/api/admin/users/${userId}/autologin`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération du lien d\'autologin')
      }
      
      const data = await response.json()
      setAutologinLink(data.url)
      
      // Vérifier si le token a été stocké en base de données
      if (data.tokenStored === false) {
        setWarning('Le lien a été généré mais n\'a pas pu être stocké en base de données. Il pourrait ne pas fonctionner correctement.')
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien d\'autologin:', error)
      setError('Erreur lors de la génération du lien d\'autologin')
    } finally {
      setGeneratingLink(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Lien copié dans le presse-papiers')
      })
      .catch((err) => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err)
      })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    )
  }

  return (
    <>
    <div className="pt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste de tous les utilisateurs de la plateforme VOID.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/users/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-void px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-void focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Ajouter un utilisateur
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

      {warning && (
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{warning}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Rôle
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Entreprise
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.profile?.full_name || 'Non renseigné'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.user_metadata?.role || 'client'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.profile?.company || 'Non renseigné'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-void hover:text-void-light mr-4"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Modifier {user.email}</span>
                        </Link>
                        {user.user_metadata?.role === 'client' && (
                          <button
                            onClick={() => handleGenerateAutologinLink(user.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            disabled={generatingLink && linkUserId === user.id}
                          >
                            <LinkIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Générer un lien d&apos;autologin pour {user.email}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={user.id === currentUser?.id}
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Supprimer {user.email}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal pour afficher le lien d'autologin */}
    {autologinLink && (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <LinkIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Lien d&apos;autologin généré
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Ce lien permet à l&apos;utilisateur de se connecter automatiquement à la page de signature de PV.
                    Il est valable pendant 7 jours et ne peut être utilisé qu&apos;une seule fois.
                  </p>
                </div>
                {warning && (
                  <div className="mt-2 rounded-md bg-yellow-50 p-2">
                    <p className="text-sm text-yellow-700">{warning}</p>
                  </div>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    <span className="truncate">{autologinLink}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(autologinLink)}
                      className="ml-2 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-void px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-void focus:ring-offset-2"
                onClick={() => setAutologinLink(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
} 