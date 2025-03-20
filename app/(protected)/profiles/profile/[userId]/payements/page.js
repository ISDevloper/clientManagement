"use client"
import PaymentsTab from '@/components/user/PaymentsTab'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'


function UserPayments() {
    const { userId } = useParams()
    const dataFetchedRef = useRef(false)

    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Charger les données de l'utilisateur et ses paiements en un seul useEffect
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/payements/client/${userId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch payments data')
                }

                const data = await response.json()

                setPayments(data)
                // Marquer les données comme chargées
                dataFetchedRef.current = true
            } catch (err) {
                setError(err.message)
                console.error('Error fetching payments:', err)
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchData()
        }

        // Nettoyage lors du démontage du composant
        return () => {
            dataFetchedRef.current = false
        }
    }, [userId])

    // Fonction pour mettre à jour un paiement
    const handleUpdatePayment = async (updatedPayment) => {
        setPayments(prevPayments => prevPayments.map(payment => payment.id === updatedPayment.id ? updatedPayment : payment))
    };

    // Fonction pour créer un nouveau paiement
    const handleCreatePayment = async (newInvoice) => {
        try {
            // Créer un objet FormData
            const formData = new FormData();
            formData.append('payement_number', newInvoice.payement_number);
            formData.append('amount', parseFloat(newInvoice.amount));
            formData.append('due_date', newInvoice.due_date);
            formData.append('project_name', newInvoice.project_name);
            formData.append('file', newInvoice.file);
            formData.append('assigned_to', userId);
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/payements`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create payment');
            }

            const createdPayment = await response.json();
            // Update the payments list with the new payment
            setPayments(prevPayments => [...prevPayments, createdPayment]);
        } catch (err) {
            setError(err.message);
            console.error('Error creating payment:', err);
            throw err;
        } finally {
            setLoading(false);
        }
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
            <div className="mt-6">
                <PaymentsTab
                    payments={payments}
                    onUpdatePayment={handleUpdatePayment}
                    onCreatePayment={handleCreatePayment}
                    isLoading={loading}
                />
            </div>
        </div>
    )
}

export default UserPayments 