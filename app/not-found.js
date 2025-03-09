import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-9xl font-bold text-void">404</div>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page non trouvée</h2>
      <p className="text-gray-600 mt-2 text-center">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        href="/"
        className="mt-8 px-6 py-3 bg-void text-white rounded-md hover:bg-void-light transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
} 