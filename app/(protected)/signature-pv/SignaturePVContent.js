import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SignaturePVContent() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  
  // Récupérer l'utilisateur connecté
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Erreur lors de la récupération de l\'utilisateur ou utilisateur non connecté')
    redirect('/login')
  }
  
  console.log('Utilisateur connecté côté serveur:', user.email)
  
  return (
    <div className="pt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Signature de PV</h1>
          <p className="mt-2 text-sm text-gray-700">
            Signez les procès-verbaux de réception de vos projets.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Bienvenue sur la page de signature de PV
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Cette page vous permet de signer électroniquement les procès-verbaux de réception de vos projets.
            </p>
          </div>
          <div className="mt-5">
            {/* Contenu de la page de signature */}
            <p className="text-sm text-gray-500">
              Aucun PV en attente de signature pour le moment.
            </p>
            <p className="mt-2 text-sm font-medium text-gray-700">
              Connecté en tant que : {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 