import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Récupérer les clés Supabase
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
    
    // Créer un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Récupérer le token d'authentification de la requête
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { isAdmin: false, error: 'Token d\'authentification non fourni' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    
    // Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('Vérification du statut admin pour utilisateur:', user.id)
    
    // Récupérer le profil de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError)
      return NextResponse.json({ isAdmin: false })
    }
    
    // Vérifier si l'utilisateur a le rôle d'administrateur dans la base de données
    const isUserAdmin = profile?.role === 'admin';
    
    console.log('Profil utilisateur:', profile)
    console.log('Statut admin détecté:', isUserAdmin)
    
    return NextResponse.json({ isAdmin: isUserAdmin })
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'administrateur:', error)
    return NextResponse.json(
      { isAdmin: false, error: error.message },
      { status: 500 }
    )
  }
} 