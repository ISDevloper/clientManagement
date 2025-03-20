import { useState } from 'react';
import { handleDownload } from '@/utils/files/download';

export const useDownloadFile = () => {
    const [isLoading, setIsLoading] = useState(false);

    const downloadFile = async (filePath) => {
        try {
            setIsLoading(true);
            await handleDownload(filePath);
        } catch (error) {
            console.error('Error downloading file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        downloadFile
    };
}; 