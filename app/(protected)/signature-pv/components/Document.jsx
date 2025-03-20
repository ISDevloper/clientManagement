import {
    DocumentArrowDownIcon,
    ArrowPathRoundedSquareIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useDownloadFile } from "@/hooks/useDownloadFile";
import { useState } from "react";

function Document({
    doc,
    setDocuments,
    openTransferModal,
}) {
    // Use the download hook
    const { downloadFile, isLoading } = useDownloadFile();
    const [isUploading, setIsUploading] = useState(false);

    // Format date function
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch {
            return "Date invalide";
        }
    };

    const handleFileUpload = async (docId, e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('id', docId);
                formData.append('signed_file', file);

                const response = await fetch('/api/documents/sign', {
                    method: 'PATCH',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload signed file');
                }
                const document = await response.json();
                setDocuments(prev => prev.map(doc => doc.id === docId ? document.data : doc));
            } catch (error) {
                console.error('Error uploading signed file:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="p-6 border-b last:border-b-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                        Projet: {doc.project} | Date limite:{" "}
                        {doc.due_date ? formatDate(doc.due_date) : "Non définie"} | Statut:{" "}
                        <span
                            className={`font-medium ${doc.status === "draft"
                                ? "text-gray-600"
                                : doc.status === "sent"
                                    ? "text-blue-600"
                                    : doc.status === "signed"
                                        ? "text-green-600"
                                        : doc.status === "validated"
                                            ? "text-purple-600"
                                            : "text-red-600"
                                }`}
                        >
                            {doc.status === "draft"
                                ? "Brouillon"
                                : doc.status === "sent"
                                    ? "Envoyé"
                                    : doc.status === "signed"
                                        ? "Signé"
                                        : doc.status === "validated"
                                            ? "Validé"
                                            : "Rejeté"}
                        </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Créé par <span className="font-medium text-gray-500">{doc.created_by.full_name}</span> | Assigné à{" "}
                        <span className="font-medium text-gray-500">{doc.assigned_to.full_name}</span> |
                        {formatDistanceToNow(new Date(doc.sent_at), {
                            addSuffix: true,
                            locale: fr,
                        })}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {doc.original_file && (
                        <button
                            onClick={() => downloadFile(doc.original_file)}
                            disabled={isLoading}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-void/50 cursor-not-allowed' : 'bg-void hover:bg-void-light'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                                    Téléchargement...
                                </>
                            ) : (
                                <>
                                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                    Télécharger le PV
                                </>
                            )}
                        </button>
                    )}
                    {doc.status !== "validated" && doc.status !== "rejected" && (
                        <div className="relative">
                            {!doc.signed_file && (
                                <input
                                    type="file"
                                    id={`signed-doc-${doc.id}`}
                                    className="sr-only"
                                    accept=".pdf"
                                    onChange={(e) => handleFileUpload(doc.id, e)}
                                />
                            )}
                            <label
                                htmlFor={`signed-doc-${doc.id}`}
                                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                                ${doc.signed_file
                                        ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                        : "border-void text-void bg-white hover:bg-gray-50"
                                    } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-void mr-2" />
                                        Chargement...
                                    </>
                                ) : doc.signed_file ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        PV signé déposé
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                        Déposer le PV signé
                                    </>
                                )}
                            </label>
                        </div>
                    )}

                    <button
                        onClick={() => openTransferModal(doc.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                        <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                        Transférer
                    </button>
                </div>
            </div>

            {/* Historique des relances */}
            {doc.reminders && doc.reminders.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                        Historique des relances
                    </h4>
                    <div className="space-y-4">
                        {doc.reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
                            >
                                <div className="flex-shrink-0">
                                    {reminder.type === "email" ? (
                                        <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                                    ) : (
                                        <PhoneIcon className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900">
                                                {reminder.created_by.full_name}
                                            </span>
                                            <span className="text-gray-500 ml-2">
                                                {reminder.created_by.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            {formatDate(reminder.sent_at)}
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        {reminder.content && (
                                            <div className="mt-2 pl-4 border-l-2 border-gray-300">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Réponse:</span>{" "}
                                                    {reminder.content}
                                                </p>
                                                {reminder.response_date && (
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(reminder.sent_at)}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Document; 