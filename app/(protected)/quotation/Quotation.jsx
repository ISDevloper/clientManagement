"use client"
import { useEffect, useState } from 'react'
import { formatQuotations } from '@/utils/quotations/formaters';
import { QuotationCard } from './QuotationCard';

export const QuotationPage = () => {
    const [quotations, setQuotations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const authUserResponse = await fetch("/api/auth/user");
                if (!authUserResponse.ok) {
                    throw new Error("Failed to fetch payments");
                }
                const authUser = await authUserResponse.json();
                const quotationResponse = await fetch(`/api/quotations/client/${authUser.id}`)
                if (!quotationResponse.ok) {
                    throw new Error('Failed to fetch quotations')
                }
                const data = await quotationResponse.json()
                setQuotations(formatQuotations(data))
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchQuotations()
    }, [])

    const handleValidateQuote = async (quoteId) => {
        try {
            const response = await fetch(`/api/quotations/${quoteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'valid',

                })
            });

            if (!response.ok) {
                throw new Error('Failed to validate quotation');
            }

            const updatedQuote = await response.json();
            setQuotations(quotes => quotes.map(quote =>
                quote.id === quoteId ? { ...quote, status: 'valid', validatedAt: updatedQuote.validatedAt } : quote
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
                <div className="flex space-x-3">
                    <select className="rounded-md border-gray-300 text-sm focus:ring-void focus:border-void">
                        <option>Tous les devis</option>
                        <option>En attente</option>
                        <option>Validés</option>
                        <option>Expirés</option>
                    </select>
                </div>
            </div>
            {error ? (
                <div className="flex justify-center items-center h-screen">
                    Erreur lors du chargement des devis
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {quotations.map((quote) => (
                        <QuotationCard
                            key={quote.id}
                            quote={quote}
                            onValidate={handleValidateQuote}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}