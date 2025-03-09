import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomeContent() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  
  // Récupérer l'utilisateur connecté
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Erreur lors de la récupération de l\'utilisateur ou utilisateur non connecté')
    redirect('/login')
  }
  
  console.log('Utilisateur connecté côté serveur sur la page d\'accueil:', user.email)
  
  return (
    <div className="pt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Bienvenue sur Void Space</h1>
          <p className="mt-2 text-sm text-gray-700">
            Votre plateforme de gestion de projets
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Tableau de bord
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Bienvenue sur votre tableau de bord. Vous pouvez accéder à vos projets et documents ici.
            </p>
          </div>
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700">
              Connecté en tant que : {user.email}
            </p>
            <div className="mt-4">
              <Link href="/signature-pv" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Accéder à la page de signature de PV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 