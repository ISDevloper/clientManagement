import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Get the transfer data from the request body
        const requestData = await request.json();
        const {
            pvId,
            recipientName,
            recipientEmail,
            recipientPhone,
            recipientCompany,
            reason
        } = requestData;

        // Validate required fields
        if (!pvId || !recipientName || !recipientEmail || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the transfer record
        const { data: transfer, error: transferError } = await supabase
            .from('pv_transfers')
            .insert({
                pv_id: pvId,
                from_user: user.id, // Using the authenticated user's ID
                to_user: null, // Will be updated when recipient accepts the transfer
                recipient_name: recipientName,
                recipient_email: recipientEmail,
                recipient_phone: recipientPhone,
                recipient_company: recipientCompany,
                reason: reason,
                status: 'pending'
            })
            .select()
            .single();

        if (transferError) {
            console.error('Error creating transfer:', transferError);
            return NextResponse.json(
                { error: 'Failed to create transfer' },
                { status: 500 }
            );
        }

        // Return the created transfer
        return NextResponse.json({ data: transfer }, { status: 201 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // Get document ID from URL params
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Get transfers for the specific document
        const { data: transfers, error: transferError } = await supabase
            .from('pv_transfers')
            .select("recipient_name,recipient_email,recipient_phone,recipient_company,reason,transfer_date")
            .eq('pv_id', documentId)
            .order('transfer_date', { ascending: false });

        if (transferError) {
            console.error('Error fetching transfers:', transferError);
            return NextResponse.json(
                { error: 'Failed to fetch transfers' },
                { status: 500 }
            );
        }

        // Normalize the transfer data
        const normalizedTransfers = transfers?.map(transfer => ({
            id: transfer.id,
            documentId: transfer.pv_id,
            status: transfer.status,
            createdAt: transfer.created_at,
            document: transfer.pv,
            transferredFrom: {
                id: transfer.from_user_details?.id,
                name: transfer.from_user_details?.full_name,
                email: transfer.from_user_details?.email
            },
            transferredTo: {
                id: transfer.to_user_details?.id,
                name: transfer.recipient_name,
                email: transfer.recipient_email,
                phone: transfer.recipient_phone,
                company: transfer.recipient_company,
                position: transfer.recipient_company // You might want to add a position field in your database if needed
            },
            reason: transfer.reason
        })) || [];

        return NextResponse.json({ data: normalizedTransfers }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
