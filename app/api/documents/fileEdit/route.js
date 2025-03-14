import { NextResponse } from "next/server";
import { Buffer } from 'buffer';
import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore);
        const user = await supabase.auth.getUser();
        // Get the form data and log it for debugging
        const formData = await req.formData();

        const file = formData.get('file');
        const id = formData.get('id');
        const isSigned = formData.get('isSigned');
        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const timestamp = Date.now();
        // Create unique file name
        const uniqueFileName = `${timestamp}-${file.name}`
        const fileName = `/pv_documents/${uniqueFileName}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload file to Supabase Storage
        const { data, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            });
        // const filePath = data.path;
        if (uploadError) {
            console.error('Error uploading to Supabase:', uploadError);
            return NextResponse.json(
                { error: "Error uploading file to storage" },
                { status: 500 }
            );
        }

        const filePath = data.path

        const { data: fileRecord, error: dbError } = await supabase
            .from('pv_files')
            .update({
                file_path: filePath,
                file_name: fileName,
                file_type: file.type,
                file_size: file.size,
                is_signed: isSigned,
                storage_path: filePath,
                uploaded_by: user.data.user.id,
            })
            .eq('id', id)
            .select()
            .single();

        if (dbError) {
            console.error('Error inserting to database:', dbError);
            return NextResponse.json(
                { error: "Error saving file record" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "File uploaded successfully",
            file: fileRecord
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { error: "Error processing request" },
            { status: 500 }
        );
    }
}
