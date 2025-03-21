import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentCheckIcon,
  CreditCardIcon,
  FolderIcon,
  WrenchScrewdriverIcon,
  CalculatorIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Navigation de base pour tous les utilisateurs
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: HomeIcon },
    { name: 'Projets en cours', href: '/projects', icon: FolderIcon },
    { name: 'TMA', href: '/tma', icon: WrenchScrewdriverIcon },
    { name: 'Devis', href: '/quotation', icon: CalculatorIcon },
    { name: 'Signatures PV', href: '/signature-pv', icon: DocumentCheckIcon },
    { name: 'Paiements', href: '/payements', icon: CreditCardIcon },
  ]

  // Ajouter les liens d'administration si l'utilisateur est admin ou gestionnaire
  if (user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'gestionnaire') {
    navigation.push(
      { name: 'Utilisateurs', href: '/profiles', icon: UserGroupIcon },
      { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon }
    )
  }

  return (
    <>
      <div>
        {/* Sidebar mobile (off-canvas) */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Fermer le menu</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <span className="text-void font-bold text-2xl">VOID</span>
                    </div>
                    <nav className="flex-1 space-y-1">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              isActive
                                ? 'bg-void text-white'
                                : 'text-gray-700 hover:bg-gray-100',
                              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors'
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </nav>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-void flex items-center justify-center text-white">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {user?.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user?.user_metadata?.role || 'Utilisateur'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Sidebar pour desktop - ajusté pour tenir compte de la Navbar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col" style={{ top: '4rem' }}>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
            <nav className="flex-1 space-y-1 pt-5">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? 'bg-void text-white'
                        : 'text-gray-700 hover:bg-gray-100',
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-void flex items-center justify-center text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.user_metadata?.role || 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de contenu principal - ajustée pour tenir compte de la Navbar */}
        <div className="lg:pl-64">
          <div className="sticky top-16 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Logo pour mobile */}
            <div className="flex flex-1 justify-center lg:justify-start">
              <span className="text-void font-bold text-xl">VOID</span>
            </div>

            {/* Profil pour mobile */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-void flex items-center justify-center text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <main className="py-10 pt-24">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  )
} 