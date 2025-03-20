import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(_, { params }) {
    try {
        const cookiesStore = await cookies()
        const supabase = await createClient(cookiesStore);

        // Get quotation ID from the URL
        const { id } = params

        // Fetch reminders with joined profile information
        const { data: reminders, error } = await supabase
            .from('quotation_reminders')
            .select(`
                *,
                send_by:profiles(
                    full_name,
                    email,
                    phone,
                    company,
                    position
                )
            `)
            .eq('id', id)

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: reminders
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching quotation reminders:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch quotation reminders'
        }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const cookiesStore = await cookies()
        const supabase = await createClient(cookiesStore);

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Get request body
        const body = await req.json();

        // Create new reminder
        const { data: reminder, error } = await supabase
            .from('quotation_reminders')
            .insert({
                sent_by: user.id,
                content: body.content,
                type: body.type,
                quotation_id: params.id
            })
            .select(`
                *,
                sent_by:profiles(*)
            `)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: reminder
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating quotation reminder:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create quotation reminder'
        }, { status: 500 });
    }
}
