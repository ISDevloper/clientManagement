'use client'
import { useState } from 'react'
import { useDownloadFile } from '@/hooks/useDownloadFile'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

function QuoteDetails({ quote, onClose, onUpdateQuote }) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [emailContent, setEmailContent] = useState(`Bonjour,

Nous vous rappelons que le devis "${quote.reference}" d'un montant de ${quote.amount.toLocaleString()}€ est en attente de validation.
Date d'expiration : ${new Date(quote.expiryDate).toLocaleDateString()}

Cordialement,
L'équipe VOID`)

  const [phoneNote, setPhoneNote] = useState('')
  const [uploadedQuoteFile, setUploadedQuoteFile] = useState(null)

  // État pour les informations de transfert
  const hasBeenTransferred = quote.transfer_name

  const handleQuoteFileUpload = (e) => {
    if (e.target.files[0]) {
      setUploadedQuoteFile(e.target.files[0])
    }
  }

  const handleSaveQuoteFile = () => {
    if (uploadedQuoteFile) {
      const updatedQuote = {
        ...quote,
        fileUrl: URL.createObjectURL(uploadedQuoteFile)
      }
      onUpdateQuote(updatedQuote)
      setUploadedQuoteFile(null)
    }
  }

  const handleSendEmailReminder = async () => {
    try {
      const response = await fetch(`/api/quotations/${quote.id}/reminder`, {
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
        throw new Error('Failed to send email reminder');
      }

      const newReminder = await response.json();
      const updatedQuote = {
        ...quote,
        reminders: [...(quote.reminders || []), newReminder.data]
      };
      onUpdateQuote(updatedQuote);
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email reminder:', error);
      // You may want to show an error message to the user here
    }
  }

  const handleSavePhoneReminder = async () => {
    if (phoneNote.trim()) {
      try {
        const response = await fetch(`/api/quotations/${quote.id}/reminder`, {
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
          throw new Error('Failed to save phone reminder');
        }

        const newReminder = await response.json();
        const updatedQuote = {
          ...quote,
          reminders: [...(quote.reminders || []), newReminder.data]
        };
        onUpdateQuote(updatedQuote);
        setPhoneNote('');
        setShowPhoneForm(false);
      } catch (error) {
        console.error('Error saving phone reminder:', error);
        // You may want to show an error message to the user here
      }
    }
  }

  const handleAcceptQuote = async () => {
    try {
      setIsAccepting(true);
      const response = await fetch(`/api/quotations/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'valid',
        })
      });

      if (!response.ok) {
        throw new Error('Failed to accept quotation');
      }
      const updatedQuoteData = await response.json();
      onUpdateQuote(updatedQuoteData);
    } catch (error) {
      console.error('Error accepting quote:', error);
      // You may want to show an error message to the user here
    } finally {
      setIsAccepting(false);
    }
  }

  const handleRejectQuote = async () => {
    try {
      setIsRejecting(true);
      const response = await fetch(`/api/quotations/${quote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject quotation');
      }
      const updatedQuoteData = await response.json();
      onUpdateQuote(updatedQuoteData);
    } catch (error) {
      console.error('Error rejecting quote:', error);
      // You may want to show an error message to the user here
    } finally {
      setIsRejecting(false);
    }
  }

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Fonction pour obtenir la classe de statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé de statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'valid':
        return 'Validé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      case 'expired':
        return 'Expiré';
      default:
        return status;
    }
  };

  const { downloadFile, isLoading } = useDownloadFile()

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">Devis {quote.reference}</h2>
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
                  <span className="font-medium">Référence :</span> {quote.reference}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Titre :</span> {quote.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Montant :</span> {formatAmount(quote.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date d&apos;émission :</span> {formatDate(quote.created_at)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Valide jusqu&apos;au :</span> {formatDate(quote.due_date)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut :</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </span>
                </p>
                {quote.acceptedAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date d&apos;acceptation :</span> {formatDate(quote.acceptedAt)}
                  </p>
                )}
                {quote.rejectedAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date de refus :</span> {formatDate(quote.rejectedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              {quote.document_url ? (
                <div className='flex gap-2 items-center justify-between'>
                  <h3 className="font-medium text-gray-900">Document de devis</h3>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => downloadFile(quote.document_url)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      )}
                      {isLoading ? 'Téléchargement...' : 'Télécharger'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-gray-900 mb-2">Document de devis</h3>
                  <div>
                    <p className="text-sm text-yellow-600 mb-2">Aucun document de devis n&apos;a été uploadé.</p>
                    <div>
                      <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                        Uploader le devis
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleQuoteFileUpload}
                          accept=".pdf"
                        />
                      </label>
                    </div>
                    {uploadedQuoteFile && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Fichier sélectionné : {uploadedQuoteFile.name}</p>
                        <button
                          onClick={handleSaveQuoteFile}
                          className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                        >
                          Enregistrer
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {quote.status === 'pending' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAcceptQuote}
                    disabled={isAccepting || isRejecting}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAccepting ? (
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                    )}
                    {isAccepting ? 'Validation...' : 'Marquer comme accepté'}
                  </button>
                  <button
                    onClick={handleRejectQuote}
                    disabled={isAccepting || isRejecting}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRejecting ? (
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 mr-2" />
                    )}
                    {isRejecting ? 'Refus...' : 'Marquer comme refusé'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Colonne de droite - Transfert et relances */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
              {hasBeenTransferred ? (
                <div>
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Destinataire du devis</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{quote.transfer_name}</span>
                    </div>

                    {quote.transfer_email && (
                      <div className="flex items-center text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{quote.transfer_email}</span>
                      </div>
                    )}

                    {quote.transfer_phone && (
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{quote.transfer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <UserIcon className="h-5 w-5" />
                  <p className="text-sm">Ce devis n&apos;a pas été transféré</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Relances</h3>

              {quote.status === 'pending' && (
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
                {quote.reminders && quote.reminders.length > 0 ? (
                  quote.reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-start space-x-3 p-2 border-l-2 border-void">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                        {reminder.type === 'email' ? (
                          <EnvelopeIcon className="h-4 w-4 text-void" />
                        ) : (
                          <PhoneIcon className="h-4 w-4 text-void" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Relance {reminder.type === 'email' ? 'par email' : 'téléphonique'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(reminder.created_at).toLocaleString()}
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

export default QuoteDetails 