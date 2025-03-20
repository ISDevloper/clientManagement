import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { id } = params

        // Get the status from request body
        const update = await request.json()

        if (!update) {
            return NextResponse.json(
                { error: 'No update provided' },
                { status: 400 }
            )
        }

        // Update the quotation status
        const { data, error } = await supabase
            .from('quotations')
            .update(update)
            .eq('id', id)
            .select("*,reminders:quotation_reminders(*)")
            .single()

        if (error) {
            console.error('Error updating quotation status:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating quotation status:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}