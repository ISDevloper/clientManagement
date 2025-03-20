import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request) {
    try {
        const { paymentId, status } = await request.json()

        // Validate required fields
        if (!paymentId || !status) {
            return NextResponse.json(
                { error: 'Payment ID and status are required' },
                { status: 400 }
            )
        }
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore);

        // Update payment status
        const { data, error } = await supabase
            .from('payements')
            .update({ status: status })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) {
            console.log(error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            data,
            { status: 200 }
        )

    } catch (err) {
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
