import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Buffer } from 'buffer'


export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // Parse FormData instead of JSON
        const formData = await request.formData();
        const userId = formData.get('userId');
        const file = formData.get('file');

        // Get other form fields
        const formDataEntries = Array.from(formData.entries());
        const rest = Object.fromEntries(
            formDataEntries.filter(([key]) => !['userId', 'file'].includes(key))
        );

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Create unique file name with timestamp
        const timestamp = Date.now()
        const uniqueFileName = `${timestamp}-${file.name}`
        const fileName = `/payements/${uniqueFileName}`

        // Convert file to buffer for upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const { data: uploadedFile, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }



        // Add the authenticated user's ID and file URL to the payment data
        const paymentData = {
            ...rest,
            assigned_to: userId,
            created_by: user.id,
            created_at: new Date().toISOString(),
            status: 'pending',
            document_url: uploadedFile.path
        };

        const { data, error } = await supabase
            .from("payements")
            .insert(paymentData)
            .select()
            .single();

        if (error) {
            console.log(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}