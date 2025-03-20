'use client'
import QuotesTab from "@/components/user/QuotesTab";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function QuotationsPage() {
    const [quotes, setQuotes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams()

    useEffect(() => {
        const fetchQuotes = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/quotations/client/${params.userId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch quotes')
                }
                const data = await response.json()
                setQuotes(data)
            } catch (error) {
                console.error('Error fetching quotes:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (params.userId) {
            fetchQuotes()
        }
    }, [params.userId])

    const onUpdateQuote = (updatedQuotes) => {
        setQuotes(updatedQuotes)
    }
    const onCreateQuote = async (quote) => {
        try {
            const formData = new FormData();
            formData.append('reference', quote.reference);
            formData.append('name', quote.name);
            formData.append('description', quote.description || '');
            formData.append('amount', quote.amount);
            formData.append('due_date', quote.due_date);
            formData.append('assigned_to', params.userId);
            if (quote.file instanceof File) {
                formData.append('file', quote.file);
            }

            const response = await fetch(`/api/quotations/client/${params.userId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create quote');
            }

            const newQuote = await response.json();
            setQuotes(prevQuotes => [...prevQuotes, newQuote]);
        } catch (error) {
            console.error('Error creating quote:', error);
            // You might want to add error handling UI here
        }
    }
    return (
        <div>
            <QuotesTab quotes={quotes} onUpdateQuote={onUpdateQuote} onCreateQuote={onCreateQuote} isLoading={isLoading} />
        </div>
    )
}