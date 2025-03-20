import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer';

export async function PATCH(request) {
    try {

        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        // Get the form data
        const formData = await request.formData()
        const signedFile = formData.get('signed_file')
        const id = formData.get('id')

        if (!signedFile) {
            return NextResponse.json(
                { error: 'Signed file is required' },
                { status: 400 }
            )
        }

        // Create unique file name with timestamp for signed document
        const timestamp = Date.now()
        const uniqueFileName = `${timestamp}-${signedFile.name}-signed`
        const fileName = `/pv_documents/${uniqueFileName}`

        // Convert file to buffer for upload
        const bytes = await signedFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload signed file to Supabase Storage
        const { data: uploadedFile, error: uploadedFileError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: signedFile.type,
                cacheControl: '3600'
            })

        if (uploadedFileError) {
            console.error('Error uploading signed file to storage:', uploadedFileError)
            return NextResponse.json(
                { error: 'Error uploading signed file to storage' },
                { status: 500 }
            )
        }

        const filePath = uploadedFile.path

        // Update document status to signed
        const { data: document, error: updateError } = await supabase
            .from('documents')
            .update({
                signed_file: filePath,
                status: 'signed',
                signed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                created_by:profiles!documents_created_by_fkey(full_name),
                assigned_to:profiles!documents_assigned_to_fkey(full_name)
            `)
            .single()

        if (updateError) {
            console.error('Error updating document status:', updateError)
            // Clean up the uploaded file and file record if document update fails
            await supabase.storage.from('files').remove([fileName])
            return NextResponse.json(
                { error: 'Error updating document status' },
                { status: 500 }
            )
        }

        return NextResponse.json(document)

    } catch (error) {
        console.error('Error uploading signed document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}