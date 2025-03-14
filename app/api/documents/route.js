import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'
import { transformPVDataArray } from '@/utils/documents/documentTransformer'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const providedUserId = searchParams.get('userId')

        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        // Get the connected user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            return NextResponse.json(
                { error: 'Authentication error' },
                { status: 401 }
            )
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            )
        }

        // Use provided userId if it exists, otherwise use connected user's id
        const userId = providedUserId || user.id

        const { data: documents, error } = await supabase
            .from('pv_documents')
            .select(`
                *,
                pv_files (*),
                pv_reminders (*)
            `)
            .eq('assigned_to', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching documents:', error)
            return NextResponse.json(
                { error: 'Failed to fetch documents' },
                { status: 500 }
            )
        }

        // Fetch all user profiles involved in the documents
        const userIds = new Set()
        documents.forEach(doc => {
            userIds.add(doc.created_by)
            userIds.add(doc.assigned_to)
            doc.pv_reminders?.forEach(reminder => {
                userIds.add(reminder.sent_by)
                userIds.add(reminder.sent_to)
            })
        })

        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', Array.from(userIds))

        if (usersError) {
            console.error('Error fetching user profiles:', usersError)
            return NextResponse.json(
                { error: 'Failed to fetch user profiles' },
                { status: 500 }
            )
        }

        // Create a user map for quick lookup
        const userMap = {}
        users.forEach(user => {
            userMap[user.id] = user
        })

        // Transform the documents data
        const transformedDocuments = documents.map(doc => {
            const signedFile = doc.pv_files.find(file => file.is_signed)
            const originalFile = doc.pv_files.find(file => !file.is_signed)

            const getDisplayName = (userId) => {
                const user = userMap[userId]
                if (!user) return "Utilisateur inconnu"
                return user.full_name || `Utilisateur ${userId.substring(0, 8)}` || "Utilisateur inconnu"
            }

            return {
                id: doc.id,
                title: doc.title,
                description: doc.description,
                project: doc.project_name,
                date: doc.due_date,
                status: doc.status,
                created_at: doc.created_at,
                created_by: doc.created_by,
                created_by_name: getDisplayName(doc.created_by),
                assigned_to: doc.assigned_to,
                assigned_to_name: getDisplayName(doc.assigned_to),
                files: doc.pv_files,
                fileUrl: originalFile ? originalFile.storage_path : null,
                hasUploadedSignedVersion: !!signedFile,
                signedFileUrl: signedFile ? signedFile.storage_path : null,
                reminders: doc.pv_reminders?.map(reminder => ({
                    id: reminder.id,
                    date: reminder.sent_date,
                    type: reminder.reminder_type,
                    sender: {
                        id: reminder.sent_by,
                        name: getDisplayName(reminder.sent_by),
                        role: "Gestionnaire"
                    },
                    recipient: {
                        id: reminder.sent_to,
                        name: getDisplayName(reminder.sent_to),
                        phone: "+33 6 XX XX XX XX" // Placeholder for now
                    },
                    message: reminder.message,
                    response: reminder.response,
                    response_date: reminder.response_date
                })) || []
            }
        })

        return NextResponse.json(transformedDocuments)
    } catch (err) {
        console.error('Error fetching documents:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const user = await supabase.auth.getUser()

        // Get the form data
        const formData = await request.formData()
        const title = formData.get('title')
        const project_name = formData.get('project_name')
        const description = formData.get('description')
        const due_date = formData.get('due_date')
        const assigned_to = formData.get('assigned_to')
        const file = formData.get('pv_file')

        // Validate required fields
        if (!title || !project_name || !assigned_to || !file) {
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
        const { data: storageData, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            console.error('Error uploading to storage:', uploadError)
            return NextResponse.json(
                { error: 'Error uploading file to storage' },
                { status: 500 }
            )
        }

        // Create document record in database
        const { data: document, error: dbError } = await supabase
            .from('pv_documents')
            .insert({
                title,
                project_name,
                description,
                due_date: due_date || null,
                assigned_to,
                created_by: user.data.user.id,
                status: 'sent'
            })
            .select()
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

        // Create file record
        const { data: fileRecord, error: fileError } = await supabase
            .from('pv_files')
            .insert({
                pv_id: document.id,
                file_path: fileName,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: user.data.user.id,
                is_signed: false,
                storage_path: storageData.path
            })
            .select()
            .single()

        if (fileError) {
            console.error('Error creating file record:', fileError)
            // Clean up the uploaded file and document if file record creation fails
            await supabase.storage.from('files').remove([fileName])
            await supabase.from('pv_documents').delete().eq('id', document.id)
            return NextResponse.json(
                { error: 'Error creating file record' },
                { status: 500 }
            )
        }

        const documentWithFile = {
            ...document,
            pv_files: [fileRecord]
        }

        const transformedDocument = transformPVDataArray(documentWithFile)[0]

        return NextResponse.json({
            message: 'Document created successfully',
            document: transformedDocument
        })

    } catch (error) {
        console.error('Error creating document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const user = await supabase.auth.getUser()

        // Get the form data
        const formData = await request.formData()
        const documentId = formData.get('documentId')
        const signedFile = formData.get('signedFile')

        if (!documentId || !signedFile) {
            return NextResponse.json(
                { error: 'Document ID and signed file are required' },
                { status: 400 }
            )
        }

        // Create unique file name with timestamp for signed document
        const timestamp = Date.now()
        const uniqueFileName = `${timestamp}-signed-${signedFile.name}`
        const fileName = `/pv_documents/${uniqueFileName}`

        // Convert file to buffer for upload
        const bytes = await signedFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload signed file to Supabase Storage
        const { data: storageData, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: signedFile.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            console.error('Error uploading signed file to storage:', uploadError)
            return NextResponse.json(
                { error: 'Error uploading signed file to storage' },
                { status: 500 }
            )
        }

        // Create signed file record
        const { data: signedFileRecord, error: fileError } = await supabase
            .from('pv_files')
            .insert({
                pv_id: documentId,
                file_path: fileName,
                file_name: signedFile.name,
                file_type: signedFile.type,
                file_size: signedFile.size,
                uploaded_by: user.data.user.id,
                is_signed: true,
                storage_path: storageData.path
            })
            .select()
            .single()

        if (fileError) {
            console.error('Error creating signed file record:', fileError)
            // Clean up the uploaded file if file record creation fails
            await supabase.storage.from('files').remove([fileName])
            return NextResponse.json(
                { error: 'Error creating signed file record' },
                { status: 500 }
            )
        }

        // Update document status to signed
        const { error: updateError } = await supabase
            .from('pv_documents')
            .update({
                status: 'signed',
            })
            .eq('id', documentId)

        if (updateError) {
            console.error('Error updating document status:', updateError)
            // Clean up the uploaded file and file record if document update fails
            await supabase.storage.from('files').remove([fileName])
            await supabase.from('pv_files').delete().eq('id', signedFileRecord.id)
            return NextResponse.json(
                { error: 'Error updating document status' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'Signed document uploaded successfully',
            signedFile: signedFileRecord
        })

    } catch (error) {
        console.error('Error uploading signed document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
