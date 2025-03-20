import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(_, { params }) {
    try {
        const { id } = params;
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        // Get all transfers related to this payment
        const { data: transfers, error: transfersError } = await supabase
            .from('payement_transferts')
            .select('*')
            .eq('payment_id', id)
            .order('created_at', { ascending: false });

        if (transfersError) {
            throw transfersError;
        }

        return NextResponse.json(transfers);
    } catch (error) {
        console.error("Error fetching transfers:", error);
        return NextResponse.json(
            { error: "Failed to fetch transfers" },
            { status: 500 }
        );
    }
} 