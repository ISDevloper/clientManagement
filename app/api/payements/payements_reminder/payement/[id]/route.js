import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(_, { params }) {
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

        const { id } = params;

        // Fetch reminders for the payment
        const { data: reminders, error } = await supabase
            .from('payement_reminder')
            .select(`
                id,
                comment,
                type,
                created_at,
                profiles (
                    full_name,
                    phone,
                    company,
                    created_at
                )
            `)
            .eq('payement_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching payment reminders:", error);
            return NextResponse.json(
                { error: "Failed to fetch payment reminders" },
                { status: 500 }
            );
        }

        return NextResponse.json(reminders);
    } catch (error) {
        console.error("Error fetching payment reminders:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment reminders" },
            { status: 500 }
        );
    }
}
