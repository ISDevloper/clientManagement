import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Fonction pour générer un token unique
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request, { params }) {
  // Attendre les paramètres dynamiques
  const { id } = await Promise.resolve(params)
  
  console.log('Génération d\'un lien d\'autologin pour l\'utilisateur:', id)
  
  // Vérifier l'authentification
  // eslint-disable-next-line no-undef
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // eslint-disable-next-line no-undef
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    console.error('Clé de service Supabase non configurée')
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

    // Vérifier que l'utilisateur existe
    console.log('Vérification de l\'existence de l\'utilisateur...')
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(id)
    
    if (userError) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', userError)
      throw userError
    }
    
    console.log('Utilisateur trouvé:', userData.user.email)
    
    // Vérifier que l'utilisateur est un client
    if (userData.user.user_metadata?.role !== 'client') {
      console.log('L\'utilisateur n\'est pas un client:', userData.user.user_metadata?.role)
      return NextResponse.json(
        { error: 'Seuls les utilisateurs clients peuvent avoir un lien d\'autologin' },
        { status: 400 }
      )
    }

    // Générer un token unique
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours
    
    console.log('Token généré, tentative d\'insertion dans la base de données...')
    
    let tokenStored = false
    
    try {
      // Stocker le token dans la base de données
      const { error: tokenError } = await supabase
        .from('autologin_tokens')
        .insert({
          user_id: id,
          token: token,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })
      
      if (tokenError) {
        console.error('Erreur lors de l\'insertion du token:', tokenError)
        
        // Si la table n'existe pas ou si la fonction RPC n'existe pas
        if (tokenError.code === '42P01' || tokenError.message.includes('function') || tokenError.message.includes('create_autologin_tokens_table')) {
          console.log('Problème avec la table autologin_tokens, tentative de création directe...')
          
          try {
            // Créer la table autologin_tokens directement avec une requête SQL
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS autologin_tokens (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                used_at TIMESTAMP WITH TIME ZONE
              );
              
              CREATE INDEX IF NOT EXISTS autologin_tokens_token_idx ON autologin_tokens(token);
              CREATE INDEX IF NOT EXISTS autologin_tokens_user_id_idx ON autologin_tokens(user_id);
            `
            
            // Essayer d'exécuter la requête SQL directement
            await supabase.rpc('exec_sql', { sql: createTableSQL }).catch(e => {
              console.error('Erreur lors de l\'exécution de la requête SQL:', e)
              // Ignorer l'erreur, car la table peut déjà exister
            })
            
            console.log('Tentative d\'insertion après création de la table...')
            
            // Réessayer l'insertion
            const { error: retryError } = await supabase
              .from('autologin_tokens')
              .insert({
                user_id: id,
                token: token,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
              })
            
            if (retryError) {
              console.error('Erreur lors de la seconde tentative d\'insertion:', retryError)
              // Ne pas lancer d'erreur, continuer avec le token non stocké
            } else {
              tokenStored = true
            }
          } catch (rpcError) {
            console.error('Erreur lors de la création de la table:', rpcError)
            // Ne pas lancer d'erreur, continuer avec le token non stocké
          }
        } else {
          // Pour les autres types d'erreurs, ne pas lancer d'erreur, continuer avec le token non stocké
          console.warn('Impossible de stocker le token, mais génération du lien quand même')
        }
      } else {
        tokenStored = true
      }
    } catch (dbError) {
      console.error('Erreur inattendue lors de l\'interaction avec la base de données:', dbError)
      // Ne pas lancer d'erreur, continuer avec le token non stocké
    }
    
    // Construire l'URL d'autologin
    // eslint-disable-next-line no-undef
    const autologinUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/signature-pv?session=${token}`
    
    console.log('Lien d\'autologin généré avec succès:', autologinUrl)
    console.log('Token stocké en base de données:', tokenStored ? 'Oui' : 'Non')

    return NextResponse.json({ 
      url: autologinUrl,
      tokenStored: tokenStored
    })
  } catch (error) {
    console.error('Erreur lors de la génération du lien d\'autologin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien d\'autologin' },
      { status: 500 }
    )
  }
} 