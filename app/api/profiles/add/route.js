import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        // Parse the request body
        const body = await request.json()
        const { email, full_name, company, phone, poste, address, departement } = body

        // Validate required fields
        if (!email || !full_name) {
            return NextResponse.json(
                { error: 'Email and full name are required' },
                { status: 400 }
            )
        }

        // First, create the user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: '123456',
        })

        console.log('authData', authData)
        console.log('authError', authError)
        if (authError) {
            return NextResponse.json(
                { error: 'Failed to create user account', details: authError.message },
                { status: 500 }
            )
        }

        // Then, create the profile in public.profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .update({ full_name, company, phone, email, poste, address, departement })
            .eq('id', authData.user.id)
            .single()
        if (profileError) {
            // If profile creation fails, we should clean up the auth user
            await supabase.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json(
                { error: 'Failed to create profile', details: profileError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'User registered and profile created successfully',
            profile: profileData
        })

    } catch (error) {
        console.error('Profile creation error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
