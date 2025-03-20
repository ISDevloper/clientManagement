import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // Vérifier l'authentification
  // eslint-disable-next-line no-undef
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // eslint-disable-next-line no-undef
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Clé de service Supabase non configurée' },
      { status: 500 }
    )
  }

  try {
    // Créer un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Récupérer les utilisateurs
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) throw usersError

    // Récupérer les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) throw profilesError

    // Combiner les données
    const combinedUsers = users.users.map(user => {
      const profile = profiles.find(p => p.id === user.id) || {}
      return {
        ...user,
        profile
      }
    })

    return NextResponse.json(combinedUsers)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  // Vérifier l'authentification
  // eslint-disable-next-line no-undef
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // eslint-disable-next-line no-undef
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Clé de service Supabase non configurée' },
      { status: 500 }
    )
  }

  try {
    // Récupérer les données du corps de la requête
    const userData = await request.json()
    
    // Créer un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Créer un nouvel utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        role: userData.role,
      },
    })

    if (authError) throw authError

    // Vérifier si un profil existe déjà pour cet utilisateur
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    let profileResult;
    
    if (existingProfile) {
      // Mettre à jour le profil existant
      profileResult = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          company: userData.company,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id)
    } else {
      // Créer un nouveau profil
      profileResult = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userData.full_name,
          phone: userData.phone,
          company: userData.company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    if (profileResult.error) throw profileResult.error

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    
    // Si l'erreur est une violation de contrainte d'unicité sur le profil,
    // nous pouvons considérer que l'utilisateur a été créé avec succès
    if (error.code === '23505' && error.message.includes('profiles_pkey')) {
      return NextResponse.json({ 
        success: true, 
        warning: 'L\'utilisateur a été créé mais son profil existait déjà' 
      })
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
} 