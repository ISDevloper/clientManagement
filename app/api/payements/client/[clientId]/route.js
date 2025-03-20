import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_, { params }) {
    try {
        const { clientId } = params
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { data: payments, error } = await supabase
            .from('payements')
            .select(`*,
                reminders:payement_reminder(
                    *,
                    sent_by:profiles(full_name,role,email,phone,departement)
                )`)
            .eq('assigned_to', clientId)

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch payments' },
                { status: 500 }
            )
        }

        return NextResponse.json(payments)
    } catch (error) {
        console.error('Error fetching payments:', error.message)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
