import Document from "./Document";
function DocumentList({
    documents,
    setDocuments,
    openTransferModal
}) {

    if (documents.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">
                    Aucun document à valider pour le moment.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            {documents.map((doc) => (
                <Document
                    key={doc.id}
                    doc={doc}
                    openTransferModal={openTransferModal}
                    setDocuments={setDocuments}
                />
            ))}
        </div>
    );
}

export default DocumentList; 