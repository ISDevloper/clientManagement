import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        // Get all profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch profiles' },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}

export async function DELETE(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        // Get the profile ID from the URL
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: 'Profile ID is required' },
                { status: 400 }
            )
        }

        // Delete the profile
        const { error, count } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .select('count')
            .single()

        if (error) {
            return NextResponse.json(
                { error: 'Failed to delete profile' },
                { status: 500 }
            )
        }

        // Check if any record was deleted
        if (count === 0) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Profile deleted successfully'
        })
    } catch (error) {
        console.error('Profile delete error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
