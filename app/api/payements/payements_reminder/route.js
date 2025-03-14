import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);


        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Please login" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { payement_id, comment } = body;

        if (!payement_id || !comment) {
            return NextResponse.json(
                { error: "Payment ID and comment are required" },
                { status: 400 }
            );
        }

        const { data: newReminder, error } = await supabase
            .from('payement_reminder')
            .insert([
                {
                    reminder_id: user.data.user.id,
                    payement_id,
                    comment
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error creating payment reminder:", error);
            return NextResponse.json(
                { error: "Failed to create payment reminder" },
                { status: 500 }
            );
        }

        return NextResponse.json(newReminder, { status: 201 });
    } catch (error) {
        console.error("Error creating payment reminder:", error);
        return NextResponse.json(
            { error: "Failed to create payment reminder" },
            { status: 500 }
        );
    }
}
