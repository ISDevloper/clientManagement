"use client"
import {
    DocumentArrowDownIcon,
    CalendarIcon,
    CurrencyEuroIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from 'react';

export const QuotationCard = ({ quote, onValidate }) => {
    const [error, setError] = useState(null);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [transferData, setTransferData] = useState({
        transfer_name: "",
        transfer_email: "",
        transfer_phone: "",
        transfer_comment: "",
    });

    const handleTransferChange = (e) => {
        const { name, value } = e.target;
        setTransferData(prev => ({ ...prev, [name]: value }));
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/quotations/${quote.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transferData)
            });

            if (!response.ok) {
                throw new Error('Failed to transfer quotation');
            }

            setShowTransferForm(false);
            setTransferData({
                transfer_name: "",
                transfer_email: "",
                transfer_phone: "",
                transfer_comment: "",
            });
            // You might want to show a success message here
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatus = (status) => {
        switch (status) {
            case 'valid':
                return {
                    text: "Validé",
                    bgColor: "bg-green-100 text-green-800"
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
        }
    }

    return (
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
                    <button
                        onClick={() => setShowTransferForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Transférer
                    </button>
                    {quote.status === 'pending' && (
                        <button
                            onClick={() => onValidate(quote.id)}
                            className="inline-flex items-center px-4 py-2 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Je valide ce devis
                        </button>
                    )}
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Transférer le devis
                            </h3>
                            <button
                                onClick={() => setShowTransferForm(false)}
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

                        <form onSubmit={handleTransferSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="transfer_name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nom du destinataire <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="transfer_name"
                                        name="transfer_name"
                                        value={transferData.transfer_name}
                                        onChange={handleTransferChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="transfer_email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email du destinataire <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="transfer_email"
                                        name="transfer_email"
                                        value={transferData.transfer_email}
                                        onChange={handleTransferChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="transfer_phone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Téléphone du destinataire
                                    </label>
                                    <input
                                        type="text"
                                        id="transfer_phone"
                                        name="transfer_phone"
                                        value={transferData.transfer_phone}
                                        onChange={handleTransferChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="transfer_comment"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Raison du transfert
                                    </label>
                                    <textarea
                                        id="transfer_comment"
                                        name="transfer_comment"
                                        value={transferData.transfer_comment}
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
                                    onClick={() => setShowTransferForm(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
    )
} 