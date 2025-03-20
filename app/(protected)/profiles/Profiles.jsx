import { ArrowPathIcon, BuildingOfficeIcon, EnvelopeIcon, EyeIcon, MagnifyingGlassIcon, PencilSquareIcon, ShieldCheckIcon, TrashIcon, UserIcon, UserPlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Profiles() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('Tous les rôles')
    const [statusFilter, setStatusFilter] = useState('Tous les statuts')
    const [showAddUserModal, setShowAddUserModal] = useState(false)
    const [showEditUserModal, setShowEditUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        company: '',
        phone: '',
        poste: '',
        address: '',
        departement: ''
    })
    const rowsPerPage = 10

    // Fetch all profiles from API
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setIsLoading(true)
                const response = await fetch('/api/profiles')

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`)
                }
                const data = await response.json()
                setUsers(data.data)
                setFilteredUsers(data.data)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch profiles:', err)
                setError('Failed to load profiles. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfiles()
    }, [])

    // Handle filtering and search
    useEffect(() => {
        let result = [...users]

        // Apply search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase().trim()
            result = result.filter(user =>
                (user.name || user.full_name || '').toLowerCase().includes(searchLower) ||
                (user.email || '').toLowerCase().includes(searchLower) ||
                (user.company || '').toLowerCase().includes(searchLower)
            )
        }

        // Apply role filter
        if (roleFilter !== 'Tous les rôles') {
            result = result.filter(user =>
                (user.role || '').toLowerCase() === roleFilter.toLowerCase()
            )
        }

        // Apply status filter
        if (statusFilter !== 'Tous les statuts') {
            const statusValue = statusFilter === 'Actifs' ? 'active' : 'inactive'
            result = result.filter(user =>
                (user.status || '').toLowerCase() === statusValue.toLowerCase()
            )
        }

        setFilteredUsers(result)
        setCurrentPage(1) // Reset to first page when filters change
    }, [searchQuery, roleFilter, statusFilter, users])

    // Calculate pagination
    const totalItems = filteredUsers.length
    const totalPages = Math.ceil(totalItems / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const currentUsers = filteredUsers.slice(startIndex, endIndex)

    const handleAddUser = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/profiles/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const result = await response.json()
            console.log('result', result)

            setShowAddUserModal(false)
        } catch (err) {
            console.error('Failed to add user:', err)
            alert('Failed to add user. Please try again.')
        }
    }

    const handleResendInvitation = async (userId) => {
        try {
            const response = await fetch(`/api/profiles/${userId}/resend-invitation`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            alert('Invitation envoyée avec succès')
        } catch (err) {
            console.error('Failed to resend invitation:', err)
            alert('Échec de l\'envoi de l\'invitation. Veuillez réessayer.')
        }
    }

    // const handleToggleStatus = async (userId) => {
    //     try {
    //         const userToUpdate = users.find(user => user.id === userId)
    //         const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active'

    //         const response = await fetch(`/api/profiles/${userId}`, {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ status: newStatus }),
    //         })

    //         if (!response.ok) {
    //             throw new Error(`Error: ${response.status}`)
    //         }

    //         const result = await response.json()
    //         console.log('API Response for Status Update:', result)

    //         // The API returns the updated profile in a nested 'profile' property
    //         const updatedUser = result.profile || result
    //         console.log('Updated User Data after Status Change:', updatedUser)

    //         // Normalize the updated user data
    //         const normalizedUser = normalizeProfileData(updatedUser)
    //         console.log('Normalized User with Updated Status:', normalizedUser)

    //         // Update local state after successful API call
    //         setUsers(prevUsers => {
    //             const updatedUsers = prevUsers.map(user => {
    //                 if (user.id === normalizedUser.id) {
    //                     console.log('Replacing user after status change:', user, 'with:', normalizedUser)
    //                     return normalizedUser
    //                 }
    //                 return user
    //             })
    //             console.log('Updated Users State after Status Change:', updatedUsers)
    //             return updatedUsers
    //         })
    //     } catch (err) {
    //         console.error('Failed to update user status:', err)
    //         alert('Failed to update user status. Please try again.')
    //     }
    // }

    const handleDeleteUser = async (userId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return
        }

        try {
            const response = await fetch(`/api/profiles/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Remove user from local state after successful deletion
            setUsers(users.filter(user => user.id !== userId))
        } catch (err) {
            console.error('Failed to delete user:', err)
            alert('Failed to delete user. Please try again.')
        }
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Administrateur':
                return <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
            case 'Gestionnaire':
                return <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
            case 'Client':
                return <UserIcon className="h-4 w-4 text-green-500" />
            default:
                return <UserIcon className="h-4 w-4 text-gray-500" />
        }
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Administrateur':
                return 'bg-purple-100 text-purple-800'
            case 'Gestionnaire':
                return 'bg-blue-100 text-blue-800'
            case 'Client':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const handleEditUser = (userId) => {
        const userToEdit = users.find(user => user.id === userId)
        if (userToEdit) {
            setEditingUser(userToEdit)
            setShowEditUserModal(true)
        }
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`/api/profiles/${editingUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingUser),
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const result = await response.json()
            console.log('API Response:', result)

            // The API returns the updated profile in a nested 'profile' property
            const updatedUser = result.profile || result
            console.log('Updated User Data:', updatedUser)



            // Update local state after successful API call
            setUsers(prevUsers => {
                const updatedUsers = prevUsers.map(user => {
                    if (user.id === updatedUser.id) {
                        console.log('Replacing user:', user, 'with:', updatedUser)
                        return updatedUser
                    }
                    return user
                })
                console.log('Updated Users State:', updatedUsers)
                return updatedUsers
            })

            setShowEditUserModal(false)
            setEditingUser(null)
        } catch (err) {
            console.error('Failed to update user:', err)
            alert('Failed to update user. Please try again.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Ajouter un utilisateur
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                            placeholder="Rechercher par nom, email ou entreprise..."
                        />
                    </div>
                    <select
                        className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>Tous les statuts</option>
                        <option>Actifs</option>
                        <option>Inactifs</option>
                    </select>
                    <select
                        className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option>Tous les rôles</option>
                        <option>Client</option>
                        <option>Gestionnaire</option>
                        <option>Administrateur</option>
                    </select>
                </div>
            </div>

            {/* Table des utilisateurs */}
            <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-void"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">
                        {error}
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-2 underline text-void hover:text-void-light"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rôle
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entreprise
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dernière connexion
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-void text-white flex items-center justify-center">
                                                {user.full_name?.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.full_name || user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            <span className="ml-1">{user.role}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.company}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais connecté'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {user.status !== 'active' && (
                                                <button
                                                    onClick={() => handleResendInvitation(user.id)}
                                                    className="text-gray-400 hover:text-void"
                                                    title="Renvoyer l'invitation"
                                                >
                                                    <EnvelopeIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                // onClick={() => handleToggleStatus(user.id)}
                                                className="text-gray-400 hover:text-void"
                                                title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                                            >
                                                <ArrowPathIcon className="h-5 w-5" />
                                            </button>
                                            <Link
                                                href={`/profiles/profile/${user.id}`}
                                                className="text-gray-400 hover:text-void"
                                                title="Voir détails"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                className="text-gray-400 hover:text-void"
                                                title="Modifier"
                                                onClick={() => handleEditUser(user.id)}
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-red-500"
                                                title="Supprimer"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Pagination Controls */}
                {!isLoading && !error && totalItems > 0 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Suivant
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                                    <span className="font-medium">
                                        {Math.min(endIndex, totalItems)}
                                    </span>{' '}
                                    sur <span className="font-medium">{totalItems}</span> utilisateurs
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <span className="sr-only">Précédent</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                ? 'z-10 bg-void border-void text-white'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <span className="sr-only">Suivant</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'ajout d'utilisateur */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 flex-shrink-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Ajouter un utilisateur
                            </h3>
                        </div>
                        <div className="p-6 pt-0 overflow-y-auto flex-1">
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poste
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.poste}
                                        onChange={(e) => setNewUser({ ...newUser, poste: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        placeholder="Ex: Directeur Commercial"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.address}
                                        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Département
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.departement}
                                        onChange={(e) => setNewUser({ ...newUser, departement: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        placeholder="Ex: Marketing"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Entreprise
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.company}
                                        onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rôle
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                                    >
                                        <option>Client</option>
                                        <option>Gestionnaire</option>
                                        <option>Administrateur</option>
                                    </select>
                                </div>

                                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions par rôle</h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="h-4 w-4 text-green-500" />
                                            <p><strong>Client</strong> : Accès aux projets, signatures, devis et paiements</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
                                            <p><strong>Gestionnaire</strong> : Accès client + gestion des projets et TMA</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
                                            <p><strong>Administrateur</strong> : Accès complet + gestion des utilisateurs</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de modification d'utilisateur */}
            {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 flex-shrink-0 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Modifier l&apos;utilisateur
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom complet <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editingUser.full_name}
                                            onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                            required
                                            placeholder="Ex: John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                            required
                                            placeholder="Ex: john.doe@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            value={editingUser.phone}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                            placeholder="Ex: +33 6 12 34 56 78"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Entreprise <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editingUser.company}
                                            onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                            required
                                            placeholder="Ex: Acme Inc"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rôle <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                            required
                                        >
                                            <option value="">Sélectionner un rôle</option>
                                            <option>Client</option>
                                            <option>Gestionnaire</option>
                                            <option>Administrateur</option>
                                        </select>
                                    </div>

                                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions par rôle</h4>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-4 w-4 text-green-500" />
                                                <p><strong>Client</strong> : Accès aux projets, signatures, devis et paiements</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
                                                <p><strong>Gestionnaire</strong> : Accès client + gestion des projets et TMA</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <ShieldCheckIcon className="h-4 w-4 text-purple-500" />
                                                <p><strong>Administrateur</strong> : Accès complet + gestion des utilisateurs</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditUserModal(false)
                                                setEditingUser(null)
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                                        >
                                            Mettre à jour
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

