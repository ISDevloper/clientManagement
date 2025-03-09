import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  // Attendre les paramètres dynamiques
  const id = params.id
  
  // Vérifier l'authentification
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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

    // Récupérer les données de l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)
    
    if (userError) throw userError

    // Récupérer le profil associé
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    // Combiner les données
    const combinedData = {
      user: userData.user,
      profile: profileData || {}
    }

    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Erreur lors de la récupération des données de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  // Attendre les paramètres dynamiques
  const id = params.id
  
  // Vérifier l'authentification
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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

    // Mettre à jour les métadonnées de l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(id, {
      email: userData.email,
      user_metadata: {
        role: userData.role,
      },
    })

    if (authError) throw authError

    // Mettre à jour le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id,
        full_name: userData.full_name,
        phone: userData.phone,
        company: userData.company,
        updated_at: new Date().toISOString(),
      })

    if (profileError) throw profileError

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  // Attendre les paramètres dynamiques
  const id = params.id
  
  // Vérifier l'authentification
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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

    // Supprimer l'utilisateur
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    
    if (authError) throw authError

    // Supprimer le profil associé (la cascade devrait le faire automatiquement,
    // mais nous le faisons explicitement par sécurité)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Erreur lors de la suppression du profil:', profileError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
} 