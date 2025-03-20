import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_, { params }) {
    try {
        const { id } = params

        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { data: documents, error } = await supabase
            .from('documents')
            .select(`
                *,
                created_by:profiles!documents_created_by_fkey(full_name),
                assigned_to:profiles!documents_assigned_to_fkey(full_name),
                reminders:document_reminders(
                    *,
                    created_by:profiles(full_name,role)
                )
            `)
            .eq('assigned_to', id)

        if (error) {
            console.error('Error fetching documents:', error)
            return NextResponse.json(
                { error: 'Failed to fetch documents' },
                { status: 500 }
            )
        }

        return NextResponse.json(documents)
    } catch (err) {
        console.error('Error fetching documents:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}