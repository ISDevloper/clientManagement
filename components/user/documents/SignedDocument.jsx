import { useState } from 'react'
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useDownloadFile } from '@/hooks/useDownloadFile'

function SignedDocument({ document, onUpdateDocument }) {
    const { downloadFile, isLoading } = useDownloadFile()
    const [uploadedSignedFile, setUploadedSignedFile] = useState(null)

    const handleSignedFileUpload = (e) => {
        if (e.target.files[0]) {
            setUploadedSignedFile(e.target.files[0])
        }
    }

    const handleSaveSignedFile = async () => {
        if (uploadedSignedFile) {
            try {
                const formData = new FormData();
                formData.append('id', document.id);
                formData.append('signed_file', uploadedSignedFile);

                const response = await fetch('/api/documents/sign', {
                    method: 'PATCH',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload signed file');
                }
                const new_document = await response.json();
                onUpdateDocument(new_document);
                setUploadedSignedFile(null);
            } catch (error) {
                console.error('Error uploading signed file:', error);
                // You may want to show an error message to the user here
            }
        }
    }

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Document signé</h3>
            {document.status === 'signed' ? (
                <button
                    onClick={() => downloadFile(document.signed_file)}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-700 mr-2" />
                            Téléchargement...
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Télécharger
                        </>
                    )}
                </button>
            ) : (
                <div>
                    <p className="text-sm text-yellow-600 mb-2">Le document n&apos;a pas encore été signé par le client.</p>
                    <div>
                        <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Uploader le document signé
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleSignedFileUpload}
                            />
                        </label>
                    </div>
                    {uploadedSignedFile && (
                        <div className="mt-2">
                            <p className="text-sm text-green-600">Fichier sélectionné : {uploadedSignedFile.name}</p>
                            <button
                                onClick={handleSaveSignedFile}
                                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light"
                            >
                                Enregistrer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SignedDocument 