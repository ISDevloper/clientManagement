"use client";

import { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import DocumentList from "./components/DocumentList";
import CreatePVModal from "@/components/documents/CreatePVModal";

function SignaturePV() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [transferData, setTransferData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    recipientCompany: "",
    reason: "",
  });

  const [addPvModalOpen, setAddPvModalOpen] = useState(false);

  // Fonction pour récupérer les PV
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // Get the connected user first
      const userResponse = await fetch('/api/auth/user');
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user');
      }
      const user = await userResponse.json();

      // Then fetch documents
      const documentsResponse = await fetch(`/api/documents/${user.id}`);
      if (!documentsResponse.ok) {
        throw new Error('Failed to fetch documents');
      }
      const documents = await documentsResponse.json();
      setDocuments(documents);
    } catch (error) {
      console.error("Erreur lors de la récupération des PV:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la modal d'ajout de PV
  const openAddPvModal = async () => {
    setAddPvModalOpen(true);
  };

  // Fermer la modal d'ajout de PV
  const closeAddPvModal = () => {
    setAddPvModalOpen(false);
  };

  // Gérer les changements dans le formulaire d'ajout de PV
  const handleDocumentCreated = (document) => {
    setDocuments((prev) => {
      return [...prev, document]
    });
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fonction pour ouvrir la modal de transfert
  const openTransferModal = (docId) => {
    setSelectedDocId(docId);
    setTransferModalOpen(true);
  };

  // Fonction pour fermer la modal de transfert
  const closeTransferModal = () => {
    setSelectedDocId(null);
    setTransferModalOpen(false);
    setTransferData({
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      recipientCompany: "",
      reason: "",
    });
  };

  // Fonction pour gérer les changements dans le formulaire de transfert
  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour soumettre le formulaire de transfert
  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    try {
      // Appeler l'API de transfert
      const response = await fetch('/api/documents/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pvId: selectedDocId,
          recipientName: transferData.recipientName,
          recipientEmail: transferData.recipientEmail,
          recipientPhone: transferData.recipientPhone,
          recipientCompany: transferData.recipientCompany,
          reason: transferData.reason,
        }),
        credentials: 'include', // Important pour envoyer les cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du transfert du PV');
      }

      const { data } = await response.json();
      console.log('Transfert créé avec succès:', data);

      // Fermer la modal et rafraîchir les données
      closeTransferModal();
      await fetchDocuments();

      // Afficher un message de succès
      alert('PV transféré avec succès');
    } catch (error) {
      console.error('Erreur lors du transfert du PV:', error);
      alert('Erreur lors du transfert du PV: ' + error.message);
    }
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Erreur lors du chargement des PV: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Documents à valider
        </h1>

        {/* Afficher le bouton pour tous les utilisateurs temporairement */}
        <button
          onClick={openAddPvModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Ajouter un PV
        </button>
      </div>

      <DocumentList
        documents={documents}
        setDocuments={setDocuments}
        openTransferModal={openTransferModal}
      />

      {/* Modal de transfert */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transférer le PV
            </h3>
            <form onSubmit={handleTransferSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="recipientName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={transferData.recipientName}
                    onChange={handleTransferChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email du destinataire
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    name="recipientEmail"
                    value={transferData.recipientEmail}
                    onChange={handleTransferChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientPhone"
                    name="recipientPhone"
                    value={transferData.recipientPhone}
                    onChange={handleTransferChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientCompany"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Entreprise du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientCompany"
                    name="recipientCompany"
                    value={transferData.recipientCompany}
                    onChange={handleTransferChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Raison du transfert
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={transferData.reason}
                    onChange={handleTransferChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:col-start-2 sm:text-sm"
                >
                  Transférer
                </button>
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de PV */}
      {addPvModalOpen && (
        <CreatePVModal
          onDocumentCreated={handleDocumentCreated}
          onCancel={closeAddPvModal}
        />
      )}
    </div>
  );
}

export default SignaturePV;
