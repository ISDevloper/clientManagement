import { useState, useEffect } from 'react'
import {
  DocumentIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useDownloadFile } from '@/hooks/useDownloadFile'
import SignedDocument from './SignedDocument'

function DocumentDetails({ document, onClose, onUpdateDocument }) {
  const { downloadFile, isLoading } = useDownloadFile()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [emailContent, setEmailContent] = useState(`Bonjour,

Nous vous rappelons que le document "${document.title}" est en attente de signature.
Merci de bien vouloir le signer dès que possible.

Cordialement,
L'équipe VOID`)
  const [phoneNote, setPhoneNote] = useState('')
  const [editedOriginalFile, setEditedOriginalFile] = useState(null)
  const [transfers, setTransfers] = useState([])
  const [reminders, setReminders] = useState([])
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [reminderError, setReminderError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(`/api/documents/transfer?documentId=${document.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transfers');
        }
        const data = await response.json();
        setTransfers(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching transfers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [document.id]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(`/api/documents/reminder/${document.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const data = await response.json();
        setReminders(data);
      } catch (err) {
        setReminderError(err.message);
        console.error('Error fetching reminders:', err);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminders();
  }, [document.id]);

  const handleOriginalFileEdit = (e) => {
    if (e.target.files[0]) {
      setEditedOriginalFile(e.target.files[0])
    }
  }

  const handleSaveEditedOriginalFile = async () => {
    if (editedOriginalFile) {
      try {
        const formData = new FormData();
        formData.append('original_file', editedOriginalFile);
        formData.append('id', document.id);

        const response = await fetch('/api/documents/edit-original', {
          method: 'PATCH',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        const new_document = await response.json();
        onUpdateDocument(new_document);
        setEditedOriginalFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
        // You may want to show an error message to the user here
      }
    }
  }

  const handleSendEmailReminder = async () => {
    try {
      const response = await fetch(`/api/documents/reminder/${document.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          content: emailContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save reminder');
      }

      const newReminder = await response.json();
      setReminders(prevReminders => [...prevReminders, newReminder]);
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error saving reminder:', error);
      // You may want to show an error message to the user here
    }
  }

  const handleSavePhoneReminder = async () => {
    if (phoneNote.trim()) {
      try {
        const response = await fetch(`/api/documents/reminder/${document.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'phone',
            content: phoneNote
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save reminder');
        }

        const newReminder = await response.json();
        setReminders(prevReminders => [...prevReminders, newReminder]);
        setPhoneNote('');
        setShowPhoneForm(false);
      } catch (error) {
        console.error('Error saving reminder:', error);
        // You may want to show an error message to the user here
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">{document.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne de gauche - Informations générales et fichiers */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Informations générales</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Projet :</span> {document.project}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date de création :</span> {new Date(document.sent_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut :</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${document.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {document.status === 'signed' ? 'Signé' : 'En attente'}
                  </span>
                </p>
                {document.signed_at && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date de signature :</span> {new Date(document.signed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Document original</h3>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => downloadFile(document.original_file)}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-700 mr-2" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <DocumentIcon className="h-5 w-5 mr-2" />
                      Visualiser
                    </>
                  )}
                </button>
                {document.status !== "signed" && <div>
                  <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Éditer
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleOriginalFileEdit}
                    />
                  </label>
                </div>}
              </div>
              {editedOriginalFile && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">Nouveau fichier sélectionné : {editedOriginalFile.name}</p>
                  <button
                    onClick={handleSaveEditedOriginalFile}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              )}
            </div>

            <SignedDocument document={document} onUpdateDocument={onUpdateDocument} />
          </div>

          {/* Colonne de droite - Transfert et relances */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
              {loading ? (
                <p className="text-sm text-gray-600">Chargement des transferts...</p>
              ) : error ? (
                <p className="text-sm text-red-600">Erreur: {error}</p>
              ) : transfers.length > 0 ? (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="border-l-2 border-void p-3 space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 flex-1">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{transfer.transferredTo.name}</p>
                          </div>
                        </div>
                        {transfer.transferredTo.company && (
                          <div className="flex items-center space-x-1.5">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{transfer.transferredTo.company}</span>
                          </div>
                        )}
                        {transfer.transferredTo.email && (
                          <div className="flex items-center space-x-1.5 flex-1">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            <p className="text-sm truncate">{transfer.transferredTo.email}</p>
                          </div>
                        )}

                        {transfer.transferredTo.phone && (
                          <div className="flex items-center space-x-1.5 flex-1">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <p className="text-sm">{transfer.transferredTo.phone}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center space-x-2 text-sm">
                        <span className="font-medium">Raison:</span>
                        <p className="text-gray-600">{transfer.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Ce document n&apos;a pas été transféré à une autre personne.
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Relances</h3>

              {document.status !== 'signed' && (
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    Relance par email
                  </button>
                  <button
                    onClick={() => setShowPhoneForm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Relance téléphonique
                  </button>
                </div>
              )}

              {showEmailForm && (
                <div className="mb-4 p-3 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Envoyer une relance par email</h4>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={6}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowEmailForm(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendEmailReminder}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                      Envoyer
                    </button>
                  </div>
                </div>
              )}

              {showPhoneForm && (
                <div className="mb-4 p-3 border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Saisir une relance téléphonique</h4>
                  <textarea
                    value={phoneNote}
                    onChange={(e) => setPhoneNote(e.target.value)}
                    placeholder="Saisissez les détails de votre appel..."
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-void focus:border-void sm:text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowPhoneForm(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSavePhoneReminder}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {loadingReminders ? (
                  <p className="text-sm text-gray-500">Chargement des relances...</p>
                ) : reminderError ? (
                  <p className="text-sm text-red-500">Erreur: {reminderError}</p>
                ) : reminders.length > 0 ? (
                  reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-start space-x-3 p-4 bg-gray-100 rounded-md ">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                        {reminder.type === 'email' ? (
                          <EnvelopeIcon className="h-4 w-4 text-white" />
                        ) : (
                          <PhoneIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Relance {reminder.type === 'email' ? 'par email' : 'téléphonique'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(reminder.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                          {reminder.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucune relance effectuée pour le moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetails 