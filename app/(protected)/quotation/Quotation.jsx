"use client"
import { useEffect, useState } from 'react'
import {
    DocumentArrowDownIcon,
    CalendarIcon,
    CurrencyEuroIcon,
    ClockIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { formatQuotations } from '@/utils/quotations/formaters';

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
                const quotationResponse = await fetch(`/api/quotations/${authUser.id}`)
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

    const getStatus = (status) => {
        switch (status) {
            case 'valid':
                return {
                    text: "Validé",
                    bgColor: "'bg-green-100 text-green-800'"
                }
            case 'pending':
                return {
                    text: "En attente de validation",
                    bgColor: "bg-yellow-100 text-yellow-800"
                }
            case 'Expired':
                return {
                    text: "Expiré",
                    bgColor: "bg-gray-100 text-gray-800"
                }
        }
    }

    const handleDownload = async (fileName) => {
        try {
            const response = await fetch(`/api/quotations/download?fileName=${fileName}`)

            if (!response.ok) {
                throw new Error('Failed to fetch file')
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            // Open in new tab
            window.open(url, '_blank')

            // Clean up the URL object after opening
            setTimeout(() => URL.revokeObjectURL(url), 100)
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }


    // const handleValidateQuote = (quoteId) => {
    //     setQuotes(quotes.map(quote =>
    //         quote.id === quoteId
    //             ? { ...quote, status: 'Validé', validatedAt: new Date().toISOString() }
    //             : quote
    //     ))
    // }

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
                        <div
                            key={quote.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            {quote.title}
                                        </h2>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatus(quote.status).bgColor}`}>
                                            {getStatus(quote.status).text}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">Référence : {quote.reference}</p>
                                    <p className="text-sm text-gray-700">{quote.description}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleDownload(quote.fileUrl)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                                    >
                                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                        Télécharger le devis
                                    </button>
                                    {quote.status === 'En attente de validation' && (
                                        <button
                                            // onClick={() => handleValidateQuote(quote.id)}
                                            className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                        >
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            Je valide ce devis
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="font-medium">Date d&apos;émission</p>
                                        <p>{new Date(quote.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="font-medium">Valide jusqu&apos;au</p>
                                        <p>{new Date(quote.validUntil).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="font-medium">Montant</p>
                                        <p>{quote.amount.toLocaleString()}€ HT</p>
                                    </div>
                                </div>
                            </div>

                            {quote.validatedAt && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-green-600 flex items-center">
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Validé le {new Date(quote.validatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}