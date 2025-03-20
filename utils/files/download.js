export const handleDownload = async (filePath) => {
    try {
        const response = await fetch(`/api/files/download`, {
            method: 'POST',
            body: JSON.stringify({ filePath })
        })
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
        console.error('Error downloading file:', err)
    }
}   