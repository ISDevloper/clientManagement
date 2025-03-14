export function transformPVDataArray(inputDataArray) {
    if (!Array.isArray(inputDataArray)) {
        inputDataArray = [inputDataArray];
    }

    return inputDataArray.map(inputData => {
        // Parse the relevant fields from the input data
        const createdAt = new Date(inputData.created_at);
        const updatedAt = new Date(inputData.updated_at);

        // Format the dates in 'YYYY-MM-DD' format for 'date' and 'signedAt'
        const date = createdAt.toISOString().split('T')[0];
        const signedAt = updatedAt.toISOString();

        const file = inputData.pv_files?.find(file => file.is_signed === false);
        const signedFile = inputData.pv_files?.find(file => file.is_signed === true);

        // Create the transformed object with the desired structure
        return {
            id: inputData.id,
            title: inputData.title,
            date: date,
            project: inputData.project_name,
            status: inputData.status,
            signedAt: signedAt,
            file: file,
            signedFile: signedFile,
            type: "pv",
        };
    });
} 