import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { id } = params

        // Fetch quotations for the authenticated user
        const { data: quotations, error } = await supabase
            .from('quotations')
            .select('*')
            .eq('assigned_to', id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
