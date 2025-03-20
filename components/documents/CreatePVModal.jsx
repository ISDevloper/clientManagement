import { ArrowUpTrayIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

function CreatePVModal({ onDocumentCreated, onCancel }) {
  const [profiles, setProfiles] = useState([])
  const [newDocument, setNewDocument] = useState({
    title: '',
    project: '',
    description: '',
    due_date: '',
    assigned_to: '',
    file: null
  });

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/profiles')
        const result = await response.json()

        if (result.error) {
          throw new Error(result.error)
        }

        setProfiles(result.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleDocumentChange = (updates) => {
    const updatedDocument = { ...newDocument, ...updates };
    setNewDocument(updatedDocument);
  };

  const onFileChange = (e) => {
    if (e.target.files?.[0]) {
      handleDocumentChange({ file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', newDocument.title)
      formData.append('project', newDocument.project)
      formData.append('description', newDocument.description || '')
      formData.append('due_date', newDocument.due_date || '')
      formData.append('assigned_to', newDocument.assigned_to)
      formData.append('file', newDocument.file)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData, // FormData will automatically set the correct Content-Type
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create document')
      }

      onDocumentCreated(result.data)

      onCancel()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Ajouter un nouveau PV
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={newDocument.title}
                onChange={(e) => handleDocumentChange({ title: e.target.value })}
                required
                placeholder="Ex: PV de réception - Phase 1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="project"
                className="block text-sm font-medium text-gray-700"
              >
                Nom du projet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project"
                value={newDocument.project}
                onChange={(e) => handleDocumentChange({ project: e.target.value })}
                required
                placeholder="Ex: Projet de Rénovation Site Web"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newDocument.description}
                onChange={(e) => handleDocumentChange({ description: e.target.value })}
                rows={3}
                placeholder="Décrivez brièvement l'objet du PV..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-medium text-gray-700"
              >
                Date limite
              </label>
              <input
                type="date"
                id="due_date"
                value={newDocument.due_date}
                onChange={(e) => handleDocumentChange({ due_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="assigned_to"
                className="block text-sm font-medium text-gray-700"
              >
                Assigner à <span className="text-red-500">*</span>
              </label>
              <select
                id="assigned_to"
                value={newDocument.assigned_to}
                onChange={(e) => handleDocumentChange({ assigned_to: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
              >
                <option value="">Sélectionner un utilisateur</option>
                {loading ? (
                  <option disabled>Chargement des utilisateurs...</option>
                ) : error ? (
                  <option disabled>Erreur: {error}</option>
                ) : (
                  profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name || `Utilisateur ${profile.id.substring(0, 8)}`}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">Sélectionnez l&apos;utilisateur qui doit signer ce PV</p>
            </div>

            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700"
              >
                Fichier PV <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={onFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  required
                  className="sr-only"
                />
                <label
                  htmlFor="file"
                  className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                    ${newDocument.file
                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      : "border-void text-void bg-white hover:bg-gray-50"
                    } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                >
                  {newDocument.file ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      {newDocument.file.name}
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Sélectionner un fichier
                    </>
                  )}
                </label>
              </div>
              {newDocument.file ? (
                <p className="mt-2 text-xs text-gray-500">
                  {(newDocument.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Formats acceptés: PDF, Word, Excel (max. 10MB)
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePVModal 