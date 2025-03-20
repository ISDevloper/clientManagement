import { NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(_, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore);

        const { id } = params;

        // Fetch reminders for the document
        const { data: reminders, error } = await supabase
            .from('document_reminders')
            .select('*')
            .eq('document_id', id)

        if (error) {
            console.error("Error fetching reminders:", error);
            return NextResponse.json(
                { error: "Failed to fetch reminders" },
                { status: 500 }
            );
        }

        return NextResponse.json(reminders);
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return NextResponse.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}

export async function POST(req, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore);

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { type, content } = body;
        const document_id = params.id;

        // Validate required fields
        if (!type || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create new reminder using Supabase
        const { data: reminder, error } = await supabase
            .from('document_reminders')
            .insert([
                {
                    type,
                    created_by: user.id,
                    content,
                    document_id,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating reminder:", error);
            return NextResponse.json(
                { error: "Failed to create reminder" },
                { status: 500 }
            );
        }

        return NextResponse.json(reminder, { status: 201 });
    } catch (error) {
        console.error("Error creating reminder:", error);
        return NextResponse.json(
            { error: "Failed to create reminder" },
            { status: 500 }
        );
    }
} 