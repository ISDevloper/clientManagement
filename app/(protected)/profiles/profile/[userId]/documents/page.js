'use client'

import DocumentsTab from '@/components/user/documents/DocumentsTab'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import CreatePVModal from '@/components/documents/CreatePVModal'

function UserDocuments() {
    const { userId } = useParams()
    const dataFetchedRef = useRef(false)

    // Déterminer l'onglet actif en fonction de l'URL


    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Charger les données de l'utilisateur et ses documents en un seul useEffect
    useEffect(() => {
        // Éviter les doubles appels en mode strict
        if (dataFetchedRef.current) return;

        const fetchData = async () => {
            try {
                setLoading(true)
                const responseDocs = await fetch(`/api/documents/${userId}`)
                const docs = await responseDocs.json()
                setDocuments(docs)
                setLoading(false)
            } catch (err) {
                console.error('Erreur lors du chargement des données:', err)
                setError(`Erreur: ${err.message}`)
                setLoading(false)
            }

            // Marquer les données comme chargées
            dataFetchedRef.current = true
        }

        if (userId) {
            fetchData()
        }

        // Nettoyage lors du démontage du composant
        return () => {
            dataFetchedRef.current = false
        }
    }, [userId])

    // État pour le modal de création de PV
    const [showCreatePVModal, setShowCreatePVModal] = useState(false)


    // Fonction pour mettre à jour un document
    const handleUpdateDocument = async (document) => {
        setDocuments((prev) => {
            const updatedDocuments = prev.map(doc => {
                if (doc.id === document.id) {
                    return document
                }
                return doc
            })
            return [...updatedDocuments]
        })
    }

    // Gérer les changements dans le formulaire d'ajout de PV
    const handleDocumentCreated = (document) => {
        setDocuments((prev) => {
            return [...prev, document]
        });
    };

    // Fermer la modal d'ajout de PV
    const closeAddDocumentModal = () => {
        setShowCreatePVModal(false);
    };

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg">
                <h2 className="text-xl font-semibold text-red-700">Erreur</h2>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DocumentsTab
                documents={documents}
                onCreatePV={() => setShowCreatePVModal(true)}
                onUpdateDocument={handleUpdateDocument}
                isLoading={loading}
            />
            {/* Modal de création de PV */}
            {showCreatePVModal && (
                <CreatePVModal
                    onDocumentCreated={handleDocumentCreated}
                    onCancel={closeAddDocumentModal}
                />
            )}
        </div>
    )
}

export default UserDocuments 