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
            .select("*")
            .eq('id', id)
            .single()

        if (error) {
            console.error('Profile fetch error:', error)
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

export async function PATCH(request, { params }) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { id } = await params
        // Parse the request body
        const body = await request.json()
        const updateData = body

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: 'Profile ID is required' },
                { status: 400 }
            )
        }


        // Update the profile
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()

        if (error) {
            console.log(error)
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            )
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: data[0]
        })
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}