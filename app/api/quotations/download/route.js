import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { searchParams } = new URL(request.url)
        const fileName = searchParams.get('fileName')
        const filePath = `/quotations/${fileName}`
        if (!filePath) {
            return NextResponse.json({ error: 'File path is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .storage
            .from('files')
            .download(filePath)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        // The data is already in the correct format, no need to convert to blob
        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename=${filePath.split('/').pop()}`
            }
        })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
