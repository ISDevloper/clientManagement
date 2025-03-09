import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request) {
  // Récupérer l'email de l'utilisateur
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email manquant' },
      { status: 400 }
    )
  }
  
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

    // Récupérer l'utilisateur par email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Erreur lors de la récupération des utilisateurs:', userError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs' },
        { status: 500 }
      )
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    // Générer un token aléatoire
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calculer la date d'expiration (7 jours)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // Vérifier si la table autologin_tokens existe
    const { error: tableError } = await supabase
      .from('autologin_tokens')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      // La table n'existe pas, la créer
      console.log('La table autologin_tokens n\'existe pas, création...')
      
      const { error: createError } = await supabase.rpc('create_autologin_tokens_table')
      
      if (createError) {
        console.error('Erreur lors de la création de la table:', createError)
        return NextResponse.json(
          { error: 'Erreur lors de la création de la table autologin_tokens' },
          { status: 500 }
        )
      }
    }
    
    // Insérer le token dans la base de données
    const { data: tokenData, error: insertError } = await supabase
      .from('autologin_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        used_at: null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Erreur lors de l\'insertion du token:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du token d\'autologin' },
        { status: 500 }
      )
    }
    
    // Générer l'URL d'autologin
    const autologinUrl = `${new URL(request.url).origin}/signature-pv?session=${token}`
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      token,
      expires_at: expiresAt.toISOString(),
      autologin_url: autologinUrl
    })
  } catch (error) {
    console.error('Erreur lors de la génération du token d\'autologin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du token d\'autologin' },
      { status: 500 }
    )
  }
} 