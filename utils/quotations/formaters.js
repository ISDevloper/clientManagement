export const formatQuotations = (quotations) => {
    return quotations.map(quotation => ({
        id: quotation.id,
        reference: quotation.reference,
        title: quotation.name,
        date: quotation.created_at,
        validUntil: quotation.due_date,
        amount: quotation.amount,
        status: quotation.status,
        description: quotation.description,
        fileUrl: quotation.file_name,
        assignedTo: quotation.assigned_to
    }))
}