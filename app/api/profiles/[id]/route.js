import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { id } = await params

        // Fetch the profile from the profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch profile', details: error.message },
                { status: 500 }
            )
        }

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(profile)

    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
