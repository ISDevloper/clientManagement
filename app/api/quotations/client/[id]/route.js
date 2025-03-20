import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export async function GET(_, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { id } = params

        // Fetch quotations for the authenticated user
        const { data: quotations, error } = await supabase
            .from('quotations')
            .select(`*,reminders:quotation_reminders(*)`)
            .eq('assigned_to', id)

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(request, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { id } = params

        // Get the form data from the request
        const formData = await request.formData()
        const file = formData.get('file')

        // Get all form data entries except file
        const formEntries = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'file') {
                formEntries[key] = value;
            }
        }

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
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
        const { data: uploadedFile, error: uploadError } = await supabase
            .storage
            .from('files')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            return NextResponse.json(
                { error: uploadError.message },
                { status: 500 }
            )
        }


        // Create the quotation record
        const { data: quotation, error: quotationError } = await supabase
            .from('quotations')
            .insert([
                {
                    assigned_to: id,
                    document_url: uploadedFile.path,
                    status: 'pending',
                    ...formEntries
                }
            ])
            .select()
            .single()

        if (quotationError) {
            return NextResponse.json(
                { error: quotationError.message },
                { status: 500 }
            )
        }

        return NextResponse.json(quotation)
    } catch (error) {
        console.error('Error creating quotation:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}


