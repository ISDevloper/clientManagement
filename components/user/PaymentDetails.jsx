import { useState, useEffect } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useDownloadFile } from '../../hooks/useDownloadFile'

function PaymentDetails({ payment, onClose, onUpdatePayment }) {
  const { downloadFile, isLoading } = useDownloadFile()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState(null)
  const [reminders, setReminders] = useState([])
  const [remindersLoading, setRemindersLoading] = useState(false)
  const [remindersError, setRemindersError] = useState(null)
  const [emailContent, setEmailContent] = useState(`Bonjour,

Nous vous rappelons que la facture "${payment.invoice}" d'un montant de ${payment.amount.toLocaleString()}€ est en attente de paiement.
Date d'échéance : ${new Date(payment.dueDate).toLocaleDateString()}

Cordialement,
L'équipe VOID`)

  const [phoneNote, setPhoneNote] = useState('')
  const [uploadedInvoiceFile, setUploadedInvoiceFile] = useState(null)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const handleInvoiceFileUpload = (e) => {
    if (e.target.files[0]) {
      setUploadedInvoiceFile(e.target.files[0])
    }
  }

  const handleSaveInvoiceFile = () => {
    if (uploadedInvoiceFile) {
      const updatedPayment = {
        ...payment,
        fileUrl: URL.createObjectURL(uploadedInvoiceFile)
      }
      onUpdatePayment(updatedPayment)
      setUploadedInvoiceFile(null)
    }
  }

  const handleSendEmailReminder = async () => {
    try {
      const response = await fetch('/api/payements/payements_reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payement_id: payment.id,
          comment: emailContent,
          type: 'email'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email reminder');
      }

      const newReminder = await response.json();
      setReminders(prev => [...prev, newReminder]);
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email reminder:', error);
      // You may want to show an error message to the user here
    }
  }

  const handleSavePhoneReminder = async () => {
    if (phoneNote.trim()) {
      try {
        const response = await fetch('/api/payements/payements_reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payement_id: payment.id,
            comment: phoneNote,
            type: 'phone'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save phone reminder');
        }

        const newReminder = await response.json();
        setReminders(prev => [...prev, newReminder]);
        setPhoneNote('');
        setShowPhoneForm(false);
      } catch (error) {
        console.error('Error saving phone reminder:', error);
        // You may want to show an error message to the user here
      }
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`/api/payements/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid',
          paymentId: payment.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const updatedPayment = await response.json();
      onUpdatePayment(updatedPayment);
    } catch (error) {
      console.error('Error updating payment status:', error);
      // You may want to show an error message to the user here
    }
  };

  const handleMarkAsOverdue = async () => {
    try {
      const response = await fetch(`/api/payements/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'overdue',
          paymentId: payment.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const updatedPayment = await response.json();
      onUpdatePayment(updatedPayment);
    } catch (error) {
      console.error('Error updating payment status:', error);
      // You may want to show an error message to the user here
    }
  };

  useEffect(() => {
    const fetchTransfers = async () => {
      if (!payment.id) return;

      setTransferLoading(true);
      try {
        const response = await fetch(`/api/payements/payements_transfers/${payment.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transfers');
        }
        const data = await response.json();
        setTransfers(data);
      } catch (error) {
        console.error('Error fetching transfers:', error);
        setTransferError(error.message);
      } finally {
        setTransferLoading(false);
      }
    };

    const fetchReminders = async () => {
      if (!payment.id) return;

      setRemindersLoading(true);
      try {
        const response = await fetch(`/api/payements/payements_reminder/payement/${payment.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const data = await response.json();
        setReminders(data);
      } catch (error) {
        console.error('Error fetching reminders:', error);
        setRemindersError(error.message);
      } finally {
        setRemindersLoading(false);
      }
    };

    fetchTransfers();
    fetchReminders();
  }, [payment.id]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">Facture {payment.invoice}</h2>
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
                  <span className="font-medium">Projet :</span> {payment.project_name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Montant :</span> {formatAmount(payment.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date d&apos;émission :</span> {formatDate(payment.created_at)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date d&apos;échéance :</span> {formatDate(payment.due_date)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Statut :</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                </p>
                {payment.paidAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date de paiement :</span> {formatDate(payment.paidAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Document de facture</h3>
              {payment.document_url ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => downloadFile(payment.document_url)}
                    disabled={isLoading}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium ${isLoading
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Télécharger
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-yellow-600 mb-2">Aucun document de facture n&apos;a été uploadé.</p>
                  <div>
                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Uploader la facture
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleInvoiceFileUpload}
                        accept=".pdf"
                      />
                    </label>
                  </div>
                  {uploadedInvoiceFile && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">Fichier sélectionné : {uploadedInvoiceFile.name}</p>
                      <button
                        onClick={handleSaveInvoiceFile}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                      >
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {payment.status === 'pending' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleMarkAsPaid}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Marquer comme payée
                  </button>
                  <button
                    onClick={handleMarkAsOverdue}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Marquer comme en retard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Colonne de droite - Transfert et relances */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfert</h3>
              {transferLoading ? (
                <p className="text-sm text-gray-600">Chargement des transferts...</p>
              ) : transferError ? (
                <p className="text-sm text-red-600">Erreur: {transferError}</p>
              ) : transfers.length > 0 ? (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="border-l-2 border-void p-3 space-y-2">
                      <div className="flex items-start space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{transfer.email}</p>
                          <p className="text-xs text-gray-500">{transfer.phone}</p>
                          {transfer.comment && (
                            <p className="text-sm text-gray-600 mt-1">{transfer.comment}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(transfer.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Cette facture n&apos;a pas été transférée à une autre personne.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Relances</h3>

              {payment.status !== 'paid' && (
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
                {remindersLoading ? (
                  <p className="text-sm text-gray-600">Chargement des relances...</p>
                ) : remindersError ? (
                  <p className="text-sm text-red-600">Erreur: {remindersError}</p>
                ) : reminders.length > 0 ? (
                  reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-start space-x-3 p-2 border-l-2 border-void">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-void-light flex items-center justify-center">
                        {reminder.type === 'email' ? (
                          <EnvelopeIcon className="h-4 w-4 text-void text-white" />
                        ) : (
                          <PhoneIcon className="h-4 w-4 text-void text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Relance {reminder.type === 'email' ? 'par email' : 'téléphonique'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Par: {reminder.profiles.full_name} - {reminder.profiles.company}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(reminder.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                          {reminder.comment}
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

export default PaymentDetails 