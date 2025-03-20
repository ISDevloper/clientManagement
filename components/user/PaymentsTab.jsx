import { useState } from 'react'
import {
  PlusIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import PaymentDetails from './PaymentDetails'

function PaymentsTab({ payments, onUpdatePayment, onCreatePayment, isLoading }) {
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsPerPage] = useState(5)
  const [newInvoice, setNewInvoice] = useState({
    payement_number: '',
    amount: '',
    due_date: '',
    project_name: '',
    file: null
  })

  // Pagination logic
  const indexOfLastPayment = paymentsPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPaymentsPages = Math.ceil(payments.length / paymentsPerPage);

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

  // Fonction pour obtenir le libellé de statut
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

  // Fonction pour ajouter une nouvelle facture
  const handleAddInvoice = async (e) => {
    e.preventDefault();

    // Vérifier que les champs obligatoires sont remplis
    if (!newInvoice.payement_number || !newInvoice.amount || !newInvoice.due_date || !newInvoice.project_name || !newInvoice.file) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }



    // Appeler la fonction de création de paiement avec FormData
    onCreatePayment(newInvoice);

    // Réinitialiser le formulaire
    setNewInvoice({
      payement_number: '',
      amount: '',
      due_date: '',
      project_name: '',
      file: null
    });

    // Fermer le modal
    setShowAddInvoiceModal(false);
  };

  const handleUpdatePayment = (updatedPayment) => {
    setSelectedPayment(updatedPayment);
    onUpdatePayment(updatedPayment);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Paiements et factures</h3>
        <button
          type="button"
          onClick={() => setShowAddInvoiceModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-void hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une facture
        </button>
      </div>

      <div className="border-t border-gray-200">
        {payments.length === 0 && !isLoading ? (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm">Aucune facture disponible pour cet utilisateur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d&apos;émission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d&apos;échéance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
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
                {isLoading ? (
                  // Skeleton loading rows
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  currentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.payement_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.project_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && payments.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
              disabled={paymentsPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPaymentsPage(Math.min(totalPaymentsPages, paymentsPage + 1))}
              disabled={paymentsPage === totalPaymentsPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{indexOfFirstPayment + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastPayment, payments.length)}
                </span>{' '}
                sur <span className="font-medium">{payments.length}</span> factures
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPaymentsPage(Math.max(1, paymentsPage - 1))}
                  disabled={paymentsPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPaymentsPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPaymentsPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${paymentsPage === i + 1
                      ? 'z-10 bg-void border-void text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPaymentsPage(Math.min(totalPaymentsPages, paymentsPage + 1))}
                  disabled={paymentsPage === totalPaymentsPages}
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

      {/* Modal d'ajout de facture */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity z-[9998]" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[9999]">
              <div className="bg-white px-6 pt-6 pb-6">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6" id="modal-title">
                      Ajouter une facture
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddInvoice}>
                        <div className="space-y-4">
                          <div className="col-span-6">
                            <label htmlFor="payement_number" className="block text-sm font-medium text-gray-700 mb-1">
                              N° Facture <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="payement_number"
                              id="payement_number"
                              required
                              value={newInvoice.payement_number}
                              onChange={(e) => setNewInvoice({ ...newInvoice, payement_number: e.target.value })}
                              placeholder="Ex: FACT-2024-001"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                              Montant <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="amount"
                              id="amount"
                              required
                              value={newInvoice.amount}
                              onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                              placeholder="Ex: 1000"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                              Date d&apos;échéance <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="due_date"
                              id="due_date"
                              required
                              value={newInvoice.due_date}
                              onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                              min={new Date().toISOString().split('T')[0]}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
                              Projet <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="project_name"
                              id="project_name"
                              required
                              value={newInvoice.project_name}
                              onChange={(e) => setNewInvoice({ ...newInvoice, project_name: e.target.value })}
                              placeholder="Ex: Projet de Rénovation Site Web"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                            />
                          </div>

                          <div className="col-span-6">
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                              Fichier facture <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex items-center">
                              <input
                                type="file"
                                id="file"
                                name="file"
                                required
                                onChange={(e) => setNewInvoice({ ...newInvoice, file: e.target.files?.[0] || null })}
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                className="sr-only"
                              />
                              <label
                                htmlFor="file"
                                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                                  ${newInvoice.file
                                    ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                    : "border-void text-void bg-white hover:bg-gray-50"
                                  } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                              >
                                {newInvoice.file ? (
                                  <>
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    {newInvoice.file.name}
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                    Sélectionner un fichier
                                  </>
                                )}
                              </label>
                            </div>
                            {newInvoice.file ? (
                              <p className="mt-2 text-xs text-gray-500">
                                {(newInvoice.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-gray-500">
                                Formats acceptés: PDF, Word, Excel (max. 10MB)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowAddInvoiceModal(false)}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-void border border-transparent rounded-md shadow-sm hover:bg-void-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                          >
                            Ajouter
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du paiement */}
      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdatePayment={handleUpdatePayment}
        />
      )}
    </div>
  );
}

export default PaymentsTab 