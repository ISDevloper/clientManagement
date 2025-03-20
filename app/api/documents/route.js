import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'


export async function POST(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { data: { user } } = await supabase.auth.getUser()

        // Get the form data
        const formData = await request.formData()
        const title = formData.get('title')
        const description = formData.get('description')
        const project = formData.get('project')
        const due_date = formData.get('due_date')
        const assigned_to = formData.get('assigned_to')
        const file = formData.get('file')

        // Validate required fields
        if (!title || !project || !assigned_to || !file) {
            return NextResponse.json(
                { error: 'Title, project name, assigned user and file are required' },
                { status: 400 }
            )
        }

        // Create unique file name with timestamp
        const timestamp = Date.now()
        const uniqueFileName = `${timestamp}-${file.name}`
        const fileName = `/pv_documents/${uniqueFileName}`

        // Convert file to buffer for upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload file to Supabase Storage
        const { data: uploadedFile, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            return NextResponse.json(
                { error: 'Error uploading file to storage' },
                { status: 500 }
            )
        }

        // Create document record in database
        const { data: document, error: dbError } = await supabase
            .from('documents')
            .insert({
                title,
                project,
                description,
                due_date: due_date,
                assigned_to,
                created_by: user.id,
                status: 'sent',
                original_file: uploadedFile.path
            })
            .select(`
                *,
                created_by:profiles!documents_created_by_fkey(full_name),
                assigned_to:profiles!documents_assigned_to_fkey(full_name)
            `)
            .single()

        if (dbError) {
            console.error('Error creating document record:', dbError)
            // Clean up the uploaded file if database insert fails
            await supabase.storage.from('files').remove([fileName])
            return NextResponse.json(
                { error: 'Error creating document record' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data: document })

    } catch (error) {
        console.error('Error creating document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
