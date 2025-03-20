'use client'

import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const AddQuoteModal = ({ isOpen, onClose, onSubmit, newQuote, setNewQuote }) => {
    const handleSubmit = (e) => {
        e.preventDefault();

        // Vérifier que les champs obligatoires sont remplis
        if (!newQuote.reference || !newQuote.title || !newQuote.amount || !newQuote.validUntil) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Créer un nouvel objet de devis
        const quoteToCreate = {
            reference: newQuote.reference,
            name: newQuote.title,
            description: newQuote.description || '',
            amount: parseFloat(newQuote.amount),
            due_date: newQuote.validUntil,
            file: newQuote.file
        };

        // Appeler la fonction de création de devis
        onSubmit(quoteToCreate);
    };

    const onFileChange = (e) => {
        if (e.target.files?.[0]) {
            setNewQuote({ ...newQuote, file: e.target.files[0] });
        }
    };

    // Get today's date in YYYY-MM-DD format for the min attribute
    const today = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Ajouter un devis
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                    Référence <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    id="reference"
                                    value={newQuote.reference}
                                    onChange={(e) => setNewQuote({ ...newQuote, reference: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Titre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={newQuote.title}
                                    onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newQuote.description}
                                    onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                                    rows={3}
                                    placeholder="Décrivez brièvement le devis..."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    Montant (€) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    value={newQuote.amount}
                                    onChange={(e) => setNewQuote({ ...newQuote, amount: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                                    Valide jusqu&apos;au <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="validUntil"
                                    id="validUntil"
                                    value={newQuote.validUntil}
                                    onChange={(e) => setNewQuote({ ...newQuote, validUntil: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                                    required
                                    min={today}
                                />
                            </div>

                            <div>
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                                    Fichier devis <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex items-center">
                                    <input
                                        type="file"
                                        id="file"
                                        name="file"
                                        onChange={onFileChange}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        required
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor="file"
                                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                                            ${newQuote.file
                                                ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                                : "border-void text-void bg-white hover:bg-gray-50"
                                            } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                                    >
                                        {newQuote.file ? (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                {newQuote.file.name}
                                            </>
                                        ) : (
                                            <>
                                                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                                Sélectionner un fichier
                                            </>
                                        )}
                                    </label>
                                </div>
                                {newQuote.file ? (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {(newQuote.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Formats acceptés: PDF, Word, Excel (max. 10MB)
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:col-start-2 sm:text-sm"
                            >
                                Ajouter
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddQuoteModal; 