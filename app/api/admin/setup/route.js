import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Vérifier si la table autologin_tokens existe
    const { error: tableExistsError } = await supabase
      .from('autologin_tokens')
      .select('id')
      .limit(1)
    
    if (tableExistsError && tableExistsError.code === '42P01') {
      console.log('La table autologin_tokens n\'existe pas, création...')
      
      // Créer la table autologin_tokens
      const { error: createTableError } = await supabase.rpc('create_autologin_tokens_table')
      
      if (createTableError) {
        console.error('Erreur lors de la création de la table via RPC:', createTableError)
        
        // Essayer de créer la table directement avec une requête SQL
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
        
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
        
        if (sqlError) {
          console.error('Erreur lors de la création de la table via SQL:', sqlError)
          throw sqlError
        }
        
        console.log('Table autologin_tokens créée avec succès via SQL')
      } else {
        console.log('Table autologin_tokens créée avec succès via RPC')
      }
    } else {
      console.log('La table autologin_tokens existe déjà')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la configuration:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la configuration' },
      { status: 500 }
    )
  }
} 