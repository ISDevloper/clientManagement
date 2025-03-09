import React, { Fragment } from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Navbar({ user }) {
  const pathname = usePathname()
  const supabase = createClient()


  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/' },
    { name: 'Utilisateurs', href: '/users' },
  ]

  // Ajouter les liens d'administration si l'utilisateur est admin
  if (user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'gestionnaire') {
    navigation.push({ name: 'Administration', href: '/admin' })
  }

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-void to-void-light h-16 fixed w-full top-0 z-50 shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-[1920px] h-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-full flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {/* Logo et nom */}
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-32 h-8 relative">
                    <img src="/logo.png" alt="Logo" className='invert' />

                  </div>
                  <div className="h-8 w-px bg-gray-200/20"></div>
                  <span className="text-white font-medium tracking-wide">
                    Espace Client
                  </span>
                </Link>

                {/* Environnement */}
                <div className="hidden md:flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                    Production
                  </span>
                </div>
              </div>



              {/* Informations supplémentaires */}
              <div className="hidden lg:flex items-center space-x-6 text-gray-200 text-sm">

                <div className="h-4 w-px bg-gray-200/20"></div>
                <div className="flex items-center space-x-1">
                  <span>Dernière connexion :</span>
                  <span className="text-white">
                    {new Date().toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Menu mobile et profil */}
              <div className="flex items-center md:hidden">
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-void-light hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>


            </div>
          </div>

          {/* Barre de progression subtile en bas de la navbar */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
            <div className="h-full w-1/3 bg-gradient-to-r from-white/20 to-white/10 rounded-full"></div>
          </div>

          {/* Menu mobile */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'bg-void-light text-white'
                      : 'text-gray-300 hover:bg-void-light hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <Disclosure.Button
                as="a"
                href="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-void-light hover:text-white"
              >
                Votre Profil
              </Disclosure.Button>
              <Disclosure.Button
                as="button"
                onClick={handleSignOut}
                className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-void-light hover:text-white"
              >
                Se déconnecter
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
} 